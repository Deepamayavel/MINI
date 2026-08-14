package com.mediguide.service.admin;

import com.mediguide.dto.AdminUserDto;
import com.mediguide.exception.ResourceNotFoundException;
import com.mediguide.model.User;
import com.mediguide.repository.AdminQueryRepository;
import com.mediguide.repository.AdminUserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminUserService {

    private final AdminUserRepository userRepository;
    private final AdminQueryRepository queryRepository;

    public AdminUserService(AdminUserRepository userRepository, AdminQueryRepository queryRepository) {
        this.userRepository = userRepository;
        this.queryRepository = queryRepository;
    }

    public Page<AdminUserDto> getUsers(String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        List<User> users = userRepository.findAll();
        if (search != null && !search.isBlank()) {
            users = users.stream()
                    .filter(user -> user.getName().toLowerCase().contains(search.toLowerCase()) || user.getEmail().toLowerCase().contains(search.toLowerCase()))
                    .collect(Collectors.toList());
        }
        List<AdminUserDto> dtos = users.stream()
                .map(user -> new AdminUserDto(
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getRole().name(),
                        queryRepository.countByUserId(user.getId())
                ))
                .collect(Collectors.toList());
        int start = Math.min(page * size, dtos.size());
        int end = Math.min(start + size, dtos.size());
        return new PageImpl<>(dtos.subList(start, end), pageable, dtos.size());
    }

    public User findById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public User update(String id, User user) {
        User existing = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getName() != null) {
            existing.setName(user.getName());
        }
        if (user.getEmail() != null) {
            existing.setEmail(user.getEmail());
        }
        if (user.getPasswordHash() != null) {
            existing.setPasswordHash(user.getPasswordHash());
        }
        if (user.getRole() != null) {
            existing.setRole(user.getRole());
        }
        return userRepository.save(existing);
    }

    public void delete(String id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found");
        }
        userRepository.deleteById(id);
    }
}

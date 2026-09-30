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
    private final org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder passwordEncoder = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();

    public AdminUserService(AdminUserRepository userRepository, AdminQueryRepository queryRepository) {
        this.userRepository = userRepository;
        this.queryRepository = queryRepository;
    }

    public Page<AdminUserDto> getUsers(String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        List<User> users = userRepository.findAll();
        if (search != null && !search.isBlank()) {
            users = users.stream()
                    .filter(user -> (user.getName() != null && user.getName().toLowerCase().contains(search.toLowerCase())) ||
                                    (user.getEmail() != null && user.getEmail().toLowerCase().contains(search.toLowerCase())))
                    .collect(Collectors.toList());
        }
        List<AdminUserDto> dtos = users.stream()
                .map(user -> new AdminUserDto(
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getRole() != null ? user.getRole().name() : "USER",
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

    public User create(User user) {
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        String cleanEmail = user.getEmail().trim().toLowerCase();
        if (userRepository.findByEmail(cleanEmail).isPresent()) {
            throw new com.mediguide.exception.DuplicateEmailException("Email already in use");
        }
        user.setEmail(cleanEmail);
        if (user.getName() == null || user.getName().isBlank()) {
            user.setName("User");
        }
        if (user.getRole() == null) {
            user.setRole(com.mediguide.model.Role.USER);
        }
        String rawPass = (user.getPasswordHash() != null && !user.getPasswordHash().isBlank())
                ? user.getPasswordHash() : "User@1234";
        user.setPasswordHash(passwordEncoder.encode(rawPass));
        user.setCreatedAt(java.time.Instant.now());
        return userRepository.save(user);
    }

    public User update(String id, User user) {
        User existing = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getName() != null && !user.getName().isBlank()) {
            existing.setName(user.getName().trim());
        }
        if (user.getEmail() != null && !user.getEmail().isBlank()) {
            String newEmail = user.getEmail().trim().toLowerCase();
            if (!newEmail.equalsIgnoreCase(existing.getEmail()) && userRepository.findByEmail(newEmail).isPresent()) {
                throw new com.mediguide.exception.DuplicateEmailException("Email already in use");
            }
            existing.setEmail(newEmail);
        }
        if (user.getPasswordHash() != null && !user.getPasswordHash().isBlank()) {
            String pass = user.getPasswordHash();
            if (!pass.startsWith("$2a$") && !pass.startsWith("$2b$") && !pass.startsWith("$2y$")) {
                pass = passwordEncoder.encode(pass);
            }
            existing.setPasswordHash(pass);
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

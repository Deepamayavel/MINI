package com.mediguide.service;

import com.mediguide.dto.AuthResponse;
import com.mediguide.dto.LoginRequest;
import com.mediguide.dto.RegisterRequest;
import com.mediguide.exception.AuthException;
import com.mediguide.exception.DuplicateEmailException;
import com.mediguide.exception.ForbiddenException;
import com.mediguide.model.Role;
import com.mediguide.model.User;
import com.mediguide.repository.UserRepository;
import com.mediguide.security.JwtUtil;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public AuthResponse register(RegisterRequest request) {
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            throw new DuplicateEmailException("Email already in use");
        });

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .createdAt(Instant.now())
                .lastLogin(null)
                .build();

        User saved = userRepository.save(user);
        String token = jwtUtil.generateToken(saved.getId(), saved.getRole().name(), false);

        return new AuthResponse(token, saved.getName(), saved.getEmail(), saved.getRole());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new AuthException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new AuthException("Invalid email or password");
        }

        user.setLastLogin(Instant.now());
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getId(), user.getRole().name(), request.isRememberMe());
        return new AuthResponse(token, user.getName(), user.getEmail(), user.getRole());
    }

    public AuthResponse adminLogin(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new AuthException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new AuthException("Invalid email or password");
        }

        if (user.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Only admin accounts can use admin login");
        }

        user.setLastLogin(Instant.now());
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getId(), user.getRole().name(), request.isRememberMe());
        return new AuthResponse(token, user.getName(), user.getEmail(), user.getRole());
    }
}

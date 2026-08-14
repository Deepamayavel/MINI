package com.mediguide.config;

import com.mediguide.model.Role;
import com.mediguide.model.User;
import com.mediguide.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AdminSeeder(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        String adminEmail = "admin@mediguide.com";
        try {
            if (userRepository.findByEmail(adminEmail).isEmpty()) {
                User admin = User.builder()
                        .name("Admin")
                        .email(adminEmail)
                        .passwordHash(passwordEncoder.encode("Admin@1234"))
                        .role(Role.ADMIN)
                        .createdAt(Instant.now())
                        .build();

                userRepository.save(admin);
                System.out.println("✅ Admin account created: " + adminEmail);
            } else {
                System.out.println("✅ Admin account already exists.");
            }
        } catch (Exception e) {
            System.err.println("⚠️ AdminSeeder skipped: could not connect to MongoDB - " + e.getMessage());
        }
    }
}

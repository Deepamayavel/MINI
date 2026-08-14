package com.mediguide.service;

import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class HealthService {

    public Map<String, String> getStatus() {
        return Map.of("status", "UP");
    }
}

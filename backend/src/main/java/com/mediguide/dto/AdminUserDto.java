package com.mediguide.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AdminUserDto {
    private String id;
    private String name;
    private String email;
    private String role;
    private long queryCount;
}

package com.hexaware.careercrafter.dto;

import com.hexaware.careercrafter.enums.Role;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserResponseDTO {

    private Long id;
    private String fullName;
    private String email;
    private Role role;
    private String educationDetails;
    private String professionalDetails;
    private String companyName;
    private LocalDateTime createdAt;
}

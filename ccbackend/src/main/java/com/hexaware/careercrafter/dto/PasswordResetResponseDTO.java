package com.hexaware.careercrafter.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PasswordResetResponseDTO {
    private String message;
    private boolean success;
}

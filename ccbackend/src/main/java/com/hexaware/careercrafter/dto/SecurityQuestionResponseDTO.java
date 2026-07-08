package com.hexaware.careercrafter.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SecurityQuestionResponseDTO {
    private String email;
    private String securityQuestion;
    private boolean success;
}

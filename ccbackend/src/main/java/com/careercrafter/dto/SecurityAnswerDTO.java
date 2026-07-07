package com.careercrafter.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SecurityAnswerDTO {
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Security answer is required")
    private String securityAnswer;
}

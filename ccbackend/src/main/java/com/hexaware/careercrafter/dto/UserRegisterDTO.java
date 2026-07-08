package com.hexaware.careercrafter.dto;

import com.hexaware.careercrafter.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserRegisterDTO {

    @NotBlank(message = "Full name is required")
    @Size(max = 100, message = "Full name should not exceed 100 characters")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email format is invalid")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password should be at least 8 characters long")
    private String password;

    @NotNull(message = "Role is required")
    private Role role;

    private String educationDetails;

    private String professionalDetails;

    private String companyName;

    @NotBlank(message = "Security question is required")
    @Size(min = 5, max = 500, message = "Security question should be between 5 and 500 characters")
    private String securityQuestion;

    @NotBlank(message = "Security answer is required")
    @Size(min = 2, max = 500, message = "Security answer should be between 2 and 500 characters")
    private String securityAnswer;
}

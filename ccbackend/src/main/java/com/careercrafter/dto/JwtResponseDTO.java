package com.careercrafter.dto;

import com.careercrafter.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JwtResponseDTO {

    private String token;
    private Long userId;
    private String email;
    private Role role;
}

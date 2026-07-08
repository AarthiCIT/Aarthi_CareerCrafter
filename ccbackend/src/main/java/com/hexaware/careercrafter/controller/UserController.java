package com.hexaware.careercrafter.controller;

import com.hexaware.careercrafter.dto.JwtResponseDTO;
import com.hexaware.careercrafter.dto.UserLoginDTO;
import com.hexaware.careercrafter.dto.UserRegisterDTO;
import com.hexaware.careercrafter.dto.UserResponseDTO;
import com.hexaware.careercrafter.dto.ForgotPasswordDTO;
import com.hexaware.careercrafter.dto.PasswordResetDTO;
import com.hexaware.careercrafter.dto.PasswordResetResponseDTO;
import com.hexaware.careercrafter.dto.SecurityQuestionResponseDTO;
import com.hexaware.careercrafter.dto.SecurityAnswerDTO;
import com.hexaware.careercrafter.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponseDTO> register(@Valid @RequestBody UserRegisterDTO userRegisterDTO) {
        return new ResponseEntity<>(userService.registerUser(userRegisterDTO), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponseDTO> login(@Valid @RequestBody UserLoginDTO userLoginDTO) {
        return ResponseEntity.ok(userService.loginUser(userLoginDTO));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> updateUser(@PathVariable Long id,
                                                        @Valid @RequestBody UserRegisterDTO userRegisterDTO) {
        return ResponseEntity.ok(userService.updateUser(id, userRegisterDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<SecurityQuestionResponseDTO> getSecurityQuestion(@Valid @RequestBody ForgotPasswordDTO forgotPasswordDTO) {
        return ResponseEntity.ok(userService.getSecurityQuestion(forgotPasswordDTO));
    }

    @PostMapping("/verify-security-answer")
    public ResponseEntity<PasswordResetResponseDTO> verifySecurityAnswer(@Valid @RequestBody SecurityAnswerDTO securityAnswerDTO) {
        return ResponseEntity.ok(userService.verifySecurityAnswer(securityAnswerDTO));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<PasswordResetResponseDTO> resetPassword(@Valid @RequestBody PasswordResetDTO passwordResetDTO) {
        return ResponseEntity.ok(userService.resetPassword(passwordResetDTO));
    }
}

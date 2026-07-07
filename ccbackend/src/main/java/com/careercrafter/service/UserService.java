package com.careercrafter.service;

import com.careercrafter.dto.*;

import java.util.List;

public interface UserService {

    UserResponseDTO registerUser(UserRegisterDTO userRegisterDTO);

    JwtResponseDTO loginUser(UserLoginDTO userLoginDTO);

    UserResponseDTO getUserById(Long id);

    List<UserResponseDTO> getAllUsers();

    UserResponseDTO updateUser(Long id, UserRegisterDTO userRegisterDTO);

    void deleteUser(Long id);

    SecurityQuestionResponseDTO getSecurityQuestion(ForgotPasswordDTO forgotPasswordDTO);

    PasswordResetResponseDTO verifySecurityAnswer(SecurityAnswerDTO securityAnswerDTO);

    PasswordResetResponseDTO resetPassword(PasswordResetDTO passwordResetDTO);
}

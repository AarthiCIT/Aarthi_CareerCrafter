package com.hexaware.careercrafter.service.impl;

import com.hexaware.careercrafter.dto.JwtResponseDTO;
import com.hexaware.careercrafter.dto.UserLoginDTO;
import com.hexaware.careercrafter.dto.UserRegisterDTO;
import com.hexaware.careercrafter.dto.UserResponseDTO;
import com.hexaware.careercrafter.dto.ForgotPasswordDTO;
import com.hexaware.careercrafter.dto.PasswordResetDTO;
import com.hexaware.careercrafter.dto.PasswordResetResponseDTO;
import com.hexaware.careercrafter.dto.SecurityQuestionResponseDTO;
import com.hexaware.careercrafter.dto.SecurityAnswerDTO;
import com.hexaware.careercrafter.entity.User;
import com.hexaware.careercrafter.exception.DuplicateResourceException;
import com.hexaware.careercrafter.exception.ResourceNotFoundException;
import com.hexaware.careercrafter.repository.UserRepository;
import com.hexaware.careercrafter.security.JwtUtil;
import com.hexaware.careercrafter.service.UserService;
import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final ModelMapper modelMapper;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder,
                            JwtUtil jwtUtil, ModelMapper modelMapper) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.modelMapper = modelMapper;
    }

    @Override
    public UserResponseDTO registerUser(UserRegisterDTO userRegisterDTO) {
        if (userRepository.existsByEmail(userRegisterDTO.getEmail())) {
            throw new DuplicateResourceException("An account already exists with this email");
        }

        User user = new User();
        user.setFullName(userRegisterDTO.getFullName());
        user.setEmail(userRegisterDTO.getEmail());
        user.setPassword(passwordEncoder.encode(userRegisterDTO.getPassword()));
        user.setRole(userRegisterDTO.getRole());
        user.setEducationDetails(userRegisterDTO.getEducationDetails());
        user.setProfessionalDetails(userRegisterDTO.getProfessionalDetails());
        user.setCompanyName(userRegisterDTO.getCompanyName());
        user.setSecurityQuestion(userRegisterDTO.getSecurityQuestion());
        user.setSecurityAnswer(userRegisterDTO.getSecurityAnswer().toLowerCase().trim());

        User saved = userRepository.save(user);
        return modelMapper.map(saved, UserResponseDTO.class);
    }

    @Override
    public JwtResponseDTO loginUser(UserLoginDTO userLoginDTO) {
        User user = userRepository.findByEmail(userLoginDTO.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(userLoginDTO.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return new JwtResponseDTO(token, user.getId(), user.getEmail(), user.getRole());
    }

    @Override
    public UserResponseDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));
        return modelMapper.map(user, UserResponseDTO.class);
    }

    @Override
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> modelMapper.map(user, UserResponseDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public UserResponseDTO updateUser(Long id, UserRegisterDTO userRegisterDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));

        user.setFullName(userRegisterDTO.getFullName());
        user.setEducationDetails(userRegisterDTO.getEducationDetails());
        user.setProfessionalDetails(userRegisterDTO.getProfessionalDetails());
        user.setCompanyName(userRegisterDTO.getCompanyName());

        if (userRegisterDTO.getPassword() != null && !userRegisterDTO.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(userRegisterDTO.getPassword()));
        }

        User updated = userRepository.save(user);
        return modelMapper.map(updated, UserResponseDTO.class);
    }

    @Override
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));
        userRepository.delete(user);
    }

    @Override
    public SecurityQuestionResponseDTO getSecurityQuestion(ForgotPasswordDTO forgotPasswordDTO) {
        User user = userRepository.findByEmail(forgotPasswordDTO.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("No account found with this email address"));

        if (user.getSecurityQuestion() == null || user.getSecurityQuestion().isBlank()) {
            throw new ResourceNotFoundException("Security question not set for this account");
        }

        return new SecurityQuestionResponseDTO(user.getEmail(), user.getSecurityQuestion(), true);
    }

    @Override
    public PasswordResetResponseDTO verifySecurityAnswer(SecurityAnswerDTO securityAnswerDTO) {
        User user = userRepository.findByEmail(securityAnswerDTO.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("No account found with this email address"));

        String providedAnswer = securityAnswerDTO.getSecurityAnswer().toLowerCase().trim();
        String storedAnswer = user.getSecurityAnswer() != null ? user.getSecurityAnswer().toLowerCase().trim() : "";

        if (!providedAnswer.equals(storedAnswer)) {
            throw new BadCredentialsException("Incorrect security answer. Password reset blocked.");
        }

        return new PasswordResetResponseDTO("Security answer verified. You can now reset your password.", true);
    }

    @Override
    public PasswordResetResponseDTO resetPassword(PasswordResetDTO passwordResetDTO) {
        User user = userRepository.findByEmail(passwordResetDTO.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("No account found with this email address"));

        if (!passwordResetDTO.getNewPassword().equals(passwordResetDTO.getConfirmPassword())) {
            throw new BadCredentialsException("Passwords do not match");
        }

        if (passwordResetDTO.getNewPassword().length() < 8) {
            throw new BadCredentialsException("Password must be at least 8 characters long");
        }

        user.setPassword(passwordEncoder.encode(passwordResetDTO.getNewPassword()));
        userRepository.save(user);

        return new PasswordResetResponseDTO("Password reset successfully. You can now login with your new password.", true);
    }
}

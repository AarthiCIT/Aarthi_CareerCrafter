package com.careercrafter.service;

import com.careercrafter.dto.UserLoginDTO;
import com.careercrafter.dto.UserRegisterDTO;
import com.careercrafter.dto.UserResponseDTO;
import com.careercrafter.entity.User;
import com.careercrafter.enums.Role;
import com.careercrafter.exception.DuplicateResourceException;
import com.careercrafter.exception.ResourceNotFoundException;
import com.careercrafter.repository.UserRepository;
import com.careercrafter.security.JwtUtil;
import com.careercrafter.service.impl.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    private ModelMapper modelMapper;

    @InjectMocks
    private UserServiceImpl userService;

    private User existingUser;

    @BeforeEach
    void setUp() {
        modelMapper = new ModelMapper();
        userService = new UserServiceImpl(userRepository, passwordEncoder, jwtUtil, modelMapper);

        existingUser = new User();
        existingUser.setId(1L);
        existingUser.setFullName("Arun Kumar");
        existingUser.setEmail("arun@example.com");
        existingUser.setPassword("hashedPassword");
        existingUser.setRole(Role.JOB_SEEKER);
    }

    @Test
    void registerUser_shouldSaveAndReturnUser_whenEmailNotTaken() {
        UserRegisterDTO dto = new UserRegisterDTO();
        dto.setFullName("Arun Kumar");
        dto.setEmail("arun@example.com");
        dto.setPassword("password123");
        dto.setRole(Role.JOB_SEEKER);

        when(userRepository.existsByEmail(dto.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(dto.getPassword())).thenReturn("hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(existingUser);

        UserResponseDTO response = userService.registerUser(dto);

        assertNotNull(response);
        assertEquals("arun@example.com", response.getEmail());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void registerUser_shouldThrowException_whenEmailAlreadyExists() {
        UserRegisterDTO dto = new UserRegisterDTO();
        dto.setEmail("arun@example.com");
        dto.setPassword("password123");
        dto.setFullName("Arun Kumar");
        dto.setRole(Role.JOB_SEEKER);

        when(userRepository.existsByEmail(dto.getEmail())).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> userService.registerUser(dto));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void loginUser_shouldReturnToken_whenCredentialsAreValid() {
        UserLoginDTO loginDTO = new UserLoginDTO();
        loginDTO.setEmail("arun@example.com");
        loginDTO.setPassword("password123");

        when(userRepository.findByEmail(loginDTO.getEmail())).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches(loginDTO.getPassword(), existingUser.getPassword())).thenReturn(true);
        when(jwtUtil.generateToken(existingUser.getId(), existingUser.getEmail(), existingUser.getRole().name()))
                .thenReturn("dummy-jwt-token");

        var response = userService.loginUser(loginDTO);

        assertEquals("dummy-jwt-token", response.getToken());
        assertEquals(existingUser.getEmail(), response.getEmail());
    }

    @Test
    void loginUser_shouldThrowException_whenPasswordIsWrong() {
        UserLoginDTO loginDTO = new UserLoginDTO();
        loginDTO.setEmail("arun@example.com");
        loginDTO.setPassword("wrongPassword");

        when(userRepository.findByEmail(loginDTO.getEmail())).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        assertThrows(BadCredentialsException.class, () -> userService.loginUser(loginDTO));
    }

    @Test
    void getUserById_shouldReturnUser_whenUserExists() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(existingUser));

        UserResponseDTO response = userService.getUserById(1L);

        assertEquals("arun@example.com", response.getEmail());
    }

    @Test
    void getUserById_shouldThrowException_whenUserDoesNotExist() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> userService.getUserById(99L));
    }

    @Test
    void getAllUsers_shouldReturnListOfUsers() {
        when(userRepository.findAll()).thenReturn(List.of(existingUser));

        List<UserResponseDTO> users = userService.getAllUsers();

        assertEquals(1, users.size());
    }

    @Test
    void deleteUser_shouldRemoveUser_whenUserExists() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(existingUser));

        userService.deleteUser(1L);

        verify(userRepository, times(1)).delete(existingUser);
    }
}

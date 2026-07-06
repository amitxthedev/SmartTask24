package com.smarttask24.service;

import com.smarttask24.dto.response.AuthResponse;
import com.smarttask24.dto.response.UserResponse;
import com.smarttask24.entity.Role;
import com.smarttask24.entity.User;
import com.smarttask24.entity.UserSettings;
import com.smarttask24.exception.ResourceNotFoundException;
import com.smarttask24.mapper.EntityMapper;
import com.smarttask24.repository.RoleRepository;
import com.smarttask24.repository.UserRepository;
import com.smarttask24.repository.UserSettingsRepository;
import com.smarttask24.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final EntityMapper entityMapper;

    @Transactional
    public AuthResponse handleGoogleAuth(String email, String name, String avatar) {
        User user = userRepository.findByEmail(email).orElseGet(() -> createNewUser(email, name, avatar));

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), false);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(86400000L)
                .user(entityMapper.toUserResponse(user))
                .build();
    }

    private User createNewUser(String email, String name, String avatar) {
        Role userRole = roleRepository.findByName("USER")
                .orElseGet(() -> roleRepository.save(Role.builder().name("USER").build()));

        User user = User.builder()
                .name(name)
                .email(email)
                .password("")
                .avatar(avatar)
                .emailVerified(true)
                .roles(Set.of(userRole))
                .build();
        user = userRepository.save(user);

        userSettingsRepository.save(UserSettings.builder()
                .user(user)
                .theme("light")
                .language("en")
                .timezone("UTC")
                .notificationEnabled(true)
                .aiEnabled(true)
                .build());

        return user;
    }

    public AuthResponse verifyToken(String token) {
        if (!jwtTokenProvider.validateToken(token)) {
            throw new RuntimeException("Invalid or expired token");
        }
        String email = jwtTokenProvider.getEmailFromToken(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(86400000L)
                .user(entityMapper.toUserResponse(user))
                .build();
    }

    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return entityMapper.toUserResponse(user);
    }
}

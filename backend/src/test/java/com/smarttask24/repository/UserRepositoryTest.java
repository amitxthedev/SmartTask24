package com.smarttask24.repository;

import com.smarttask24.entity.Role;
import com.smarttask24.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    private User user;

    @BeforeEach
    void setUp() {
        Role role = roleRepository.save(Role.builder().name("USER").build());
        user = userRepository.save(User.builder()
                .name("Test User")
                .email("test@example.com")
                .password("password")
                .roles(Set.of(role))
                .build());
    }

    @Test
    void findByEmail_ShouldReturnUser() {
        Optional<User> found = userRepository.findByEmail("test@example.com");
        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Test User");
    }

    @Test
    void findByEmail_ShouldReturnEmpty_WhenNotFound() {
        Optional<User> found = userRepository.findByEmail("nonexistent@example.com");
        assertThat(found).isEmpty();
    }

    @Test
    void existsByEmail_ShouldReturnTrue() {
        assertThat(userRepository.existsByEmail("test@example.com")).isTrue();
    }

    @Test
    void existsByEmail_ShouldReturnFalse() {
        assertThat(userRepository.existsByEmail("other@example.com")).isFalse();
    }
}

package com.smarttask24.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smarttask24.dto.request.TaskRequest;
import com.smarttask24.entity.*;
import com.smarttask24.repository.RoleRepository;
import com.smarttask24.repository.UserRepository;
import com.smarttask24.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private ObjectMapper objectMapper;

    private String token;

    @BeforeEach
    void setUp() {
        Role role = roleRepository.save(Role.builder().name("USER").build());
        User user = userRepository.save(User.builder()
                .name("Test User").email("controller-test@example.com").password("pass").roles(Set.of(role)).build());
        token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), false);
    }

    @Test
    void createTask_ShouldReturnCreated() throws Exception {
        TaskRequest request = new TaskRequest();
        request.setTitle("API Test Task");
        request.setPriority(Priority.HIGH);

        mockMvc.perform(post("/api/tasks")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("API Test Task"));
    }

    @Test
    void getAllTasks_ShouldReturnList() throws Exception {
        mockMvc.perform(get("/api/tasks")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void completeTask_ShouldWork() throws Exception {
        TaskRequest request = new TaskRequest();
        request.setTitle("To Complete via API");

        String createResponse = mockMvc.perform(post("/api/tasks")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andReturn().getResponse().getContentAsString();

        Long taskId = objectMapper.readTree(createResponse).get("data").get("id").asLong();

        mockMvc.perform(patch("/api/tasks/{id}/complete", taskId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("COMPLETED"));
    }

    @Test
    void deleteTask_ShouldWork() throws Exception {
        TaskRequest request = new TaskRequest();
        request.setTitle("To Delete via API");

        String createResponse = mockMvc.perform(post("/api/tasks")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andReturn().getResponse().getContentAsString();

        Long taskId = objectMapper.readTree(createResponse).get("data").get("id").asLong();

        mockMvc.perform(delete("/api/tasks/{id}", taskId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void searchTasks_ShouldReturnResults() throws Exception {
        TaskRequest request = new TaskRequest();
        request.setTitle("Searchable Task");
        mockMvc.perform(post("/api/tasks")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)));

        mockMvc.perform(get("/api/tasks/search")
                        .header("Authorization", "Bearer " + token)
                        .param("q", "searchable"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].title").value("Searchable Task"));
    }

    @Test
    void unauthorized_ShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void dashboard_ShouldReturnData() throws Exception {
        mockMvc.perform(get("/api/dashboard")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}

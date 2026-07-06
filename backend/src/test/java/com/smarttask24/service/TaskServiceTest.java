package com.smarttask24.service;

import com.smarttask24.dto.request.TaskRequest;
import com.smarttask24.dto.response.TaskResponse;
import com.smarttask24.entity.*;
import com.smarttask24.exception.BadRequestException;
import com.smarttask24.exception.ResourceNotFoundException;
import com.smarttask24.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class TaskServiceTest {

    @Autowired
    private TaskService taskService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    private String userEmail;

    @BeforeEach
    void setUp() {
        Role role = roleRepository.save(Role.builder().name("USER").build());
        User user = userRepository.save(User.builder()
                .name("Test User").email("service-test@example.com").password("pass").roles(Set.of(role)).build());
        userEmail = user.getEmail();
    }

    @Test
    void createTask_ShouldWork() {
        TaskRequest request = new TaskRequest();
        request.setTitle("Test Task");
        request.setPriority(Priority.HIGH);
        request.setDescription("Test Description");

        TaskResponse response = taskService.createTask(request, userEmail);

        assertThat(response.getId()).isNotNull();
        assertThat(response.getTitle()).isEqualTo("Test Task");
        assertThat(response.getPriority()).isEqualTo(Priority.HIGH);
        assertThat(response.getStatus()).isEqualTo(TaskStatus.PENDING);
    }

    @Test
    void createTask_WithSubtasks_ShouldWork() {
        TaskRequest request = new TaskRequest();
        request.setTitle("Task with subtasks");
        request.setSubtasks(List.of(
                createSubTaskRequest("Sub 1"),
                createSubTaskRequest("Sub 2")
        ));

        TaskResponse response = taskService.createTask(request, userEmail);

        assertThat(response.getSubtasks()).hasSize(2);
    }

    @Test
    void getUserTasks_ShouldReturnAll() {
        TaskRequest r1 = new TaskRequest(); r1.setTitle("Task 1");
        TaskRequest r2 = new TaskRequest(); r2.setTitle("Task 2");
        taskService.createTask(r1, userEmail);
        taskService.createTask(r2, userEmail);

        List<TaskResponse> tasks = taskService.getUserTasks(userEmail);
        assertThat(tasks).hasSize(2);
    }

    @Test
    void getTask_ShouldReturnCorrect() {
        TaskRequest request = new TaskRequest(); request.setTitle("Specific Task");
        TaskResponse created = taskService.createTask(request, userEmail);

        TaskResponse found = taskService.getTask(created.getId(), userEmail);
        assertThat(found.getTitle()).isEqualTo("Specific Task");
    }

    @Test
    void getTask_ShouldThrow_WhenNotOwner() {
        TaskRequest request = new TaskRequest(); request.setTitle("Task");
        TaskResponse created = taskService.createTask(request, userEmail);

        assertThrows(BadRequestException.class, () -> taskService.getTask(created.getId(), "other@email.com"));
    }

    @Test
    void completeTask_ShouldSetCompleted() {
        TaskRequest request = new TaskRequest(); request.setTitle("To Complete");
        TaskResponse created = taskService.createTask(request, userEmail);

        TaskResponse completed = taskService.completeTask(created.getId(), userEmail);

        assertThat(completed.getStatus()).isEqualTo(TaskStatus.COMPLETED);
        assertThat(completed.getProgress()).isEqualTo(100);
    }

    @Test
    void archiveAndRestore_ShouldWork() {
        TaskRequest request = new TaskRequest(); request.setTitle("To Archive");
        TaskResponse created = taskService.createTask(request, userEmail);

        TaskResponse archived = taskService.archiveTask(created.getId(), userEmail);
        assertThat(archived.getStatus()).isEqualTo(TaskStatus.ARCHIVED);

        TaskResponse restored = taskService.restoreTask(created.getId(), userEmail);
        assertThat(restored.getStatus()).isEqualTo(TaskStatus.PENDING);
    }

    @Test
    void deleteTask_ShouldRemove() {
        TaskRequest request = new TaskRequest(); request.setTitle("To Delete");
        TaskResponse created = taskService.createTask(request, userEmail);

        taskService.deleteTask(created.getId(), userEmail);

        assertThrows(ResourceNotFoundException.class, () -> taskService.getTask(created.getId(), userEmail));
    }

    @Test
    void duplicateTask_ShouldCreateCopy() {
        TaskRequest request = new TaskRequest(); request.setTitle("Original");
        TaskResponse original = taskService.createTask(request, userEmail);

        TaskResponse duplicate = taskService.duplicateTask(original.getId(), userEmail);

        assertThat(duplicate.getId()).isNotEqualTo(original.getId());
        assertThat(duplicate.getTitle()).contains("Copy");
    }

    @Test
    void updateProgress_ShouldWork() {
        TaskRequest request = new TaskRequest(); request.setTitle("Progress Task");
        TaskResponse created = taskService.createTask(request, userEmail);

        TaskResponse updated = taskService.updateProgress(created.getId(), 50, userEmail);
        assertThat(updated.getProgress()).isEqualTo(50);
    }

    @Test
    void searchTasks_ShouldFindMatches() {
        TaskRequest r1 = new TaskRequest(); r1.setTitle("React Frontend");
        TaskRequest r2 = new TaskRequest(); r2.setTitle("Spring Backend");
        taskService.createTask(r1, userEmail);
        taskService.createTask(r2, userEmail);

        List<TaskResponse> results = taskService.searchTasks(userEmail, "react");
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getTitle()).contains("React");
    }

    private com.smarttask24.dto.request.SubTaskRequest createSubTaskRequest(String title) {
        com.smarttask24.dto.request.SubTaskRequest s = new com.smarttask24.dto.request.SubTaskRequest();
        s.setTitle(title);
        return s;
    }
}

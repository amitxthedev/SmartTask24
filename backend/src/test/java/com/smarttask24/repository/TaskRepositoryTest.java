package com.smarttask24.repository;

import com.smarttask24.entity.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class TaskRepositoryTest {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    private User user;
    private Category category;

    @BeforeEach
    void setUp() {
        Role role = roleRepository.save(Role.builder().name("USER").build());
        user = userRepository.save(User.builder()
                .name("Test User").email("test@example.com").password("pass").roles(Set.of(role)).build());

        category = categoryRepository.save(Category.builder().name("Work").color("#4F46E5").user(user).build());
    }

    @Test
    void createTask_ShouldPersist() {
        Task task = Task.builder().title("Test Task").priority(Priority.HIGH).status(TaskStatus.PENDING).user(user).build();
        Task saved = taskRepository.save(task);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getTitle()).isEqualTo("Test Task");
    }

    @Test
    void findByUser_ShouldReturnUserTasks() {
        taskRepository.save(Task.builder().title("Task 1").user(user).build());
        taskRepository.save(Task.builder().title("Task 2").user(user).build());

        List<Task> tasks = taskRepository.findByUserOrderByCreatedAtDesc(user);
        assertThat(tasks).hasSize(2);
    }

    @Test
    void findByUserAndStatus_ShouldReturnFiltered() {
        taskRepository.save(Task.builder().title("Pending").status(TaskStatus.PENDING).user(user).build());
        taskRepository.save(Task.builder().title("Completed").status(TaskStatus.COMPLETED).user(user).build());

        List<Task> pending = taskRepository.findByUserAndStatusOrderByDueDateAsc(user, TaskStatus.PENDING);
        assertThat(pending).hasSize(1);
        assertThat(pending.get(0).getTitle()).isEqualTo("Pending");
    }

    @Test
    void findOverdueTasks_ShouldReturnOverdue() {
        Task overdue = Task.builder().title("Overdue").status(TaskStatus.PENDING)
                .dueDate(LocalDateTime.now().minusDays(1)).user(user).build();
        taskRepository.save(overdue);

        List<Task> result = taskRepository.findOverdueTasks(user, LocalDateTime.now());
        assertThat(result).isNotEmpty();
    }

    @Test
    void searchByTitle_ShouldMatch() {
        taskRepository.save(Task.builder().title("React Project").user(user).build());
        taskRepository.save(Task.builder().title("Spring Boot API").user(user).build());

        List<Task> found = taskRepository.searchByTitle(user, "react");
        assertThat(found).hasSize(1);
        assertThat(found.get(0).getTitle()).contains("React");
    }

    @Test
    void countByUserAndStatus_ShouldReturnCount() {
        taskRepository.save(Task.builder().title("T1").status(TaskStatus.PENDING).user(user).build());
        taskRepository.save(Task.builder().title("T2").status(TaskStatus.PENDING).user(user).build());
        taskRepository.save(Task.builder().title("T3").status(TaskStatus.COMPLETED).user(user).build());

        long pendingCount = taskRepository.countByUserAndStatus(user, TaskStatus.PENDING);
        assertThat(pendingCount).isEqualTo(2);
    }
}

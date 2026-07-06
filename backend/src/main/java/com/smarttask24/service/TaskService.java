package com.smarttask24.service;

import com.smarttask24.dto.request.TaskRequest;
import com.smarttask24.dto.response.TaskResponse;
import com.smarttask24.entity.*;
import com.smarttask24.exception.BadRequestException;
import com.smarttask24.exception.ResourceNotFoundException;
import com.smarttask24.mapper.EntityMapper;
import com.smarttask24.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final EntityMapper entityMapper;

    public List<TaskResponse> getUserTasks(String email) {
        User user = getUser(email);
        return taskRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(entityMapper::toTaskResponse)
                .toList();
    }

    public TaskResponse getTask(Long taskId, String email) {
        User user = getUser(email);
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));
        if (!task.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Task does not belong to this user");
        }
        return entityMapper.toTaskResponse(task);
    }

    @Transactional
    public TaskResponse createTask(TaskRequest request, String email) {
        User user = getUser(email);

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority() != null ? request.getPriority() : Priority.MEDIUM)
                .status(TaskStatus.PENDING)
                .dueDate(request.getDueDate())
                .estimatedTime(request.getEstimatedTime())
                .color(request.getColor())
                .isRecurring(request.isRecurring())
                .recurringPattern(request.getRecurringPattern())
                .progress(0)
                .user(user)
                .build();

        if (task.getSubtasks() == null) task.setSubtasks(new ArrayList<>());
        if (task.getChecklist() == null) task.setChecklist(new ArrayList<>());
        if (task.getTags() == null) task.setTags(new HashSet<>());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));
            task.setCategory(category);
        }

        if (request.getTagIds() != null) {
            task.setTags(new HashSet<>(tagRepository.findAllById(request.getTagIds())));
        }

        Task saved = taskRepository.save(task);

        if (request.getSubtasks() != null && !request.getSubtasks().isEmpty()) {
            List<SubTask> subTaskEntities = request.getSubtasks().stream()
                    .map(s -> SubTask.builder().title(s.getTitle()).completed(s.isCompleted()).task(saved).build())
                    .toList();
            saved.getSubtasks().addAll(subTaskEntities);
        }

        if (request.getChecklist() != null && !request.getChecklist().isEmpty()) {
            List<ChecklistItem> checklistEntities = request.getChecklist().stream()
                    .map(c -> ChecklistItem.builder().title(c.getTitle()).completed(c.isCompleted()).task(saved).build())
                    .toList();
            saved.getChecklist().addAll(checklistEntities);
        }

        Task result = taskRepository.save(saved);
        return entityMapper.toTaskResponse(result);
    }

    @Transactional
    public TaskResponse updateTask(Long taskId, TaskRequest request, String email) {
        User user = getUser(email);
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));
        if (!task.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Task does not belong to this user");
        }

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        if (request.getPriority() != null) task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate());
        task.setEstimatedTime(request.getEstimatedTime());
        task.setActualTime(request.getActualTime());
        task.setColor(request.getColor());
        task.setRecurring(request.isRecurring());
        task.setRecurringPattern(request.getRecurringPattern());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));
            task.setCategory(category);
        }

        if (request.getTagIds() != null) {
            task.setTags(new HashSet<>(tagRepository.findAllById(request.getTagIds())));
        }

        if (request.getSubtasks() != null) {
            task.getSubtasks().clear();
            List<SubTask> subTaskEntities = request.getSubtasks().stream()
                    .map(s -> SubTask.builder().title(s.getTitle()).completed(s.isCompleted()).task(task).build())
                    .toList();
            task.getSubtasks().addAll(subTaskEntities);
        }

        if (request.getChecklist() != null) {
            task.getChecklist().clear();
            List<ChecklistItem> checklistEntities = request.getChecklist().stream()
                    .map(c -> ChecklistItem.builder().title(c.getTitle()).completed(c.isCompleted()).task(task).build())
                    .toList();
            task.getChecklist().addAll(checklistEntities);
        }

        Task updated = taskRepository.save(task);
        return entityMapper.toTaskResponse(updated);
    }

    @Transactional
    public void deleteTask(Long taskId, String email) {
        User user = getUser(email);
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));
        if (!task.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Task does not belong to this user");
        }
        taskRepository.delete(task);
    }

    @Transactional
    public TaskResponse completeTask(Long taskId, String email) {
        User user = getUser(email);
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));
        if (!task.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Task does not belong to this user");
        }
        task.setStatus(TaskStatus.COMPLETED);
        task.setCompletedAt(LocalDateTime.now());
        task.setProgress(100);
        task = taskRepository.save(task);
        return entityMapper.toTaskResponse(task);
    }

    @Transactional
    public TaskResponse uncompleteTask(Long taskId, String email) {
        User user = getUser(email);
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));
        if (!task.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Task does not belong to this user");
        }
        task.setStatus(TaskStatus.PENDING);
        task.setCompletedAt(null);
        task.setProgress(0);
        task = taskRepository.save(task);
        return entityMapper.toTaskResponse(task);
    }

    @Transactional
    public TaskResponse archiveTask(Long taskId, String email) {
        User user = getUser(email);
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));
        if (!task.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Task does not belong to this user");
        }
        task.setStatus(TaskStatus.ARCHIVED);
        task.setArchivedAt(LocalDateTime.now());
        task = taskRepository.save(task);
        return entityMapper.toTaskResponse(task);
    }

    @Transactional
    public TaskResponse restoreTask(Long taskId, String email) {
        User user = getUser(email);
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));
        if (!task.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Task does not belong to this user");
        }
        task.setStatus(TaskStatus.PENDING);
        task.setArchivedAt(null);
        task = taskRepository.save(task);
        return entityMapper.toTaskResponse(task);
    }

    @Transactional
    public TaskResponse duplicateTask(Long taskId, String email) {
        User user = getUser(email);
        Task original = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));
        if (!original.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Task does not belong to this user");
        }

        Task duplicate = Task.builder()
                .title(original.getTitle() + " (Copy)")
                .description(original.getDescription())
                .priority(original.getPriority())
                .status(TaskStatus.PENDING)
                .dueDate(original.getDueDate())
                .estimatedTime(original.getEstimatedTime())
                .color(original.getColor())
                .user(user)
                .category(original.getCategory())
                .build();

        if (original.getTags() != null) {
            duplicate.setTags(new HashSet<>(original.getTags()));
        }

        duplicate = taskRepository.save(duplicate);

        if (original.getSubtasks() != null) {
            for (SubTask sub : original.getSubtasks()) {
                duplicate.getSubtasks().add(
                        SubTask.builder().title(sub.getTitle()).completed(false).task(duplicate).build());
            }
        }

        duplicate = taskRepository.save(duplicate);
        return entityMapper.toTaskResponse(duplicate);
    }

    @Transactional
    public TaskResponse updateProgress(Long taskId, int progress, String email) {
        User user = getUser(email);
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));
        if (!task.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Task does not belong to this user");
        }
        task.setProgress(Math.max(0, Math.min(100, progress)));
        if (progress == 100) {
            task.setStatus(TaskStatus.COMPLETED);
            task.setCompletedAt(LocalDateTime.now());
        }
        task = taskRepository.save(task);
        return entityMapper.toTaskResponse(task);
    }

    public List<TaskResponse> searchTasks(String email, String query) {
        User user = getUser(email);
        return taskRepository.searchByTitle(user, query).stream()
                .map(entityMapper::toTaskResponse)
                .toList();
    }

    public List<TaskResponse> getTasksByDate(String email, LocalDateTime start, LocalDateTime end) {
        User user = getUser(email);
        return taskRepository.findByUserAndDueDateBetween(user, start, end).stream()
                .map(entityMapper::toTaskResponse)
                .toList();
    }

    public List<TaskResponse> getOverdueTasks(String email) {
        User user = getUser(email);
        return taskRepository.findOverdueTasks(user, LocalDateTime.now()).stream()
                .map(entityMapper::toTaskResponse)
                .toList();
    }

    public List<TaskResponse> getUpcomingTasks(String email) {
        User user = getUser(email);
        return taskRepository.findUpcomingByUser(user).stream()
                .map(entityMapper::toTaskResponse)
                .toList();
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}

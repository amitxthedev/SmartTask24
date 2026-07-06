package com.smarttask24.mapper;

import com.smarttask24.dto.response.*;
import com.smarttask24.entity.*;
import org.springframework.stereotype.Component;
import java.util.*;
import java.util.stream.Collectors;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class EntityMapper {

    public UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .avatar(user.getAvatar())
                .role(user.getRoles().stream().findFirst().map(Role::getName).orElse("USER"))
                .build();
    }

    public TaskResponse toTaskResponse(Task task) {
        Set<TagResponse> tags = task.getTags() != null ?
                task.getTags().stream().map(this::toTagResponse).collect(Collectors.toSet()) :
                Collections.emptySet();

        List<SubTaskResponse> subTasks = task.getSubtasks() != null ?
                task.getSubtasks().stream().map(this::toSubTaskResponse).toList() :
                Collections.emptyList();

        List<ChecklistItemResponse> checklist = task.getChecklist() != null ?
                task.getChecklist().stream().map(this::toChecklistItemResponse).toList() :
                Collections.emptyList();

        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .priority(task.getPriority())
                .status(task.getStatus())
                .dueDate(task.getDueDate())
                .estimatedTime(task.getEstimatedTime())
                .actualTime(task.getActualTime())
                .color(task.getColor())
                .isRecurring(task.isRecurring())
                .recurringPattern(task.getRecurringPattern())
                .progress(task.getProgress())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .completedAt(task.getCompletedAt())
                .categoryId(task.getCategory() != null ? task.getCategory().getId() : null)
                .categoryName(task.getCategory() != null ? task.getCategory().getName() : null)
                .categoryColor(task.getCategory() != null ? task.getCategory().getColor() : null)
                .tags(tags)
                .subtasks(subTasks)
                .checklist(checklist)
                .build();
    }

    public SubTaskResponse toSubTaskResponse(SubTask subTask) {
        return SubTaskResponse.builder()
                .id(subTask.getId())
                .title(subTask.getTitle())
                .completed(subTask.isCompleted())
                .build();
    }

    public ChecklistItemResponse toChecklistItemResponse(ChecklistItem item) {
        return ChecklistItemResponse.builder()
                .id(item.getId())
                .title(item.getTitle())
                .completed(item.isCompleted())
                .build();
    }

    public CategoryResponse toCategoryResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .color(category.getColor())
                .icon(category.getIcon())
                .taskCount(0)
                .build();
    }

    public TagResponse toTagResponse(Tag tag) {
        return TagResponse.builder()
                .id(tag.getId())
                .name(tag.getName())
                .color(tag.getColor())
                .build();
    }

    public NoteResponse toNoteResponse(Note note) {
        return NoteResponse.builder()
                .id(note.getId())
                .title(note.getTitle())
                .content(note.getContent())
                .isMarkdown(note.isMarkdown())
                .createdAt(note.getCreatedAt() != null ? note.getCreatedAt().toString() : null)
                .updatedAt(note.getUpdatedAt() != null ? note.getUpdatedAt().toString() : null)
                .build();
    }

    public NotificationResponse toNotificationResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .message(notification.getMessage())
                .type(notification.getType())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt() != null ? notification.getCreatedAt().toString() : null)
                .build();
    }

    public AiConversationResponse toAiConversationResponse(AiConversation conv) {
        return AiConversationResponse.builder()
                .id(conv.getId())
                .prompt(conv.getPrompt())
                .response(conv.getResponse())
                .createdAt(conv.getCreatedAt() != null ? conv.getCreatedAt().toString() : null)
                .build();
    }
}

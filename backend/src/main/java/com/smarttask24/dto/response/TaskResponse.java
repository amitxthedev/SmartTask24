package com.smarttask24.dto.response;

import com.smarttask24.entity.Priority;
import com.smarttask24.entity.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
@AllArgsConstructor
@Builder
public class TaskResponse {
    private Long id;
    private String title;
    private String description;
    private Priority priority;
    private TaskStatus status;
    private LocalDateTime dueDate;
    private Integer estimatedTime;
    private Integer actualTime;
    private String color;
    private boolean isRecurring;
    private String recurringPattern;
    private Integer progress;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime completedAt;
    private Long categoryId;
    private String categoryName;
    private String categoryColor;
    private Set<TagResponse> tags;
    private List<SubTaskResponse> subtasks;
    private List<ChecklistItemResponse> checklist;
}

package com.smarttask24.dto.request;

import com.smarttask24.entity.Priority;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
public class TaskRequest {
    private String title;

    private String description;
    private Priority priority;
    private LocalDateTime dueDate;
    private Integer estimatedTime;
    private Integer actualTime;
    private String color;
    private boolean isRecurring;
    private String recurringPattern;
    private Long categoryId;
    private Set<Long> tagIds;
    private List<SubTaskRequest> subtasks;
    private List<ChecklistItemRequest> checklist;
}

package com.smarttask24.controller;

import com.smarttask24.dto.request.TaskRequest;
import com.smarttask24.dto.response.ApiResponse;
import com.smarttask24.dto.response.TaskResponse;
import com.smarttask24.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public ResponseEntity<ApiResponse> getAllTasks(@AuthenticationPrincipal User principal) {
        List<TaskResponse> tasks = taskService.getUserTasks(principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Tasks retrieved", tasks));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getTask(@PathVariable Long id, @AuthenticationPrincipal User principal) {
        TaskResponse task = taskService.getTask(id, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Task retrieved", task));
    }

    @PostMapping
    public ResponseEntity<ApiResponse> createTask(@RequestBody TaskRequest request,
                                                   @AuthenticationPrincipal User principal) {
        TaskResponse task = taskService.createTask(request, principal.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Task created", task));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateTask(@PathVariable Long id,
                                                   @RequestBody TaskRequest request,
                                                   @AuthenticationPrincipal User principal) {
        TaskResponse task = taskService.updateTask(id, request, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Task updated", task));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteTask(@PathVariable Long id,
                                                  @AuthenticationPrincipal User principal) {
        taskService.deleteTask(id, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Task deleted", null));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<ApiResponse> completeTask(@PathVariable Long id,
                                                     @AuthenticationPrincipal User principal) {
        TaskResponse task = taskService.completeTask(id, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Task completed", task));
    }

    @PatchMapping("/{id}/uncomplete")
    public ResponseEntity<ApiResponse> uncompleteTask(@PathVariable Long id,
                                                       @AuthenticationPrincipal User principal) {
        TaskResponse task = taskService.uncompleteTask(id, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Task uncompleted", task));
    }

    @PatchMapping("/{id}/archive")
    public ResponseEntity<ApiResponse> archiveTask(@PathVariable Long id,
                                                   @AuthenticationPrincipal User principal) {
        TaskResponse task = taskService.archiveTask(id, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Task archived", task));
    }

    @PatchMapping("/{id}/restore")
    public ResponseEntity<ApiResponse> restoreTask(@PathVariable Long id,
                                                   @AuthenticationPrincipal User principal) {
        TaskResponse task = taskService.restoreTask(id, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Task restored", task));
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<ApiResponse> duplicateTask(@PathVariable Long id,
                                                     @AuthenticationPrincipal User principal) {
        TaskResponse task = taskService.duplicateTask(id, principal.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Task duplicated", task));
    }

    @PatchMapping("/{id}/progress")
    public ResponseEntity<ApiResponse> updateProgress(@PathVariable Long id, @RequestParam int progress,
                                                      @AuthenticationPrincipal User principal) {
        TaskResponse task = taskService.updateProgress(id, progress, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Progress updated", task));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse> searchTasks(@RequestParam String q,
                                                   @AuthenticationPrincipal User principal) {
        List<TaskResponse> tasks = taskService.searchTasks(principal.getUsername(), q);
        return ResponseEntity.ok(ApiResponse.success("Search results", tasks));
    }

    @GetMapping("/overdue")
    public ResponseEntity<ApiResponse> getOverdueTasks(@AuthenticationPrincipal User principal) {
        List<TaskResponse> tasks = taskService.getOverdueTasks(principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Overdue tasks", tasks));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse> getUpcomingTasks(@AuthenticationPrincipal User principal) {
        List<TaskResponse> tasks = taskService.getUpcomingTasks(principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Upcoming tasks", tasks));
    }

    @GetMapping("/calendar")
    public ResponseEntity<ApiResponse> getTasksByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @AuthenticationPrincipal User principal) {
        List<TaskResponse> tasks = taskService.getTasksByDate(principal.getUsername(), start, end);
        return ResponseEntity.ok(ApiResponse.success("Calendar tasks", tasks));
    }
}

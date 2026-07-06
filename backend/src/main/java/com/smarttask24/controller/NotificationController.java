package com.smarttask24.controller;

import com.smarttask24.dto.response.ApiResponse;
import com.smarttask24.dto.response.NotificationResponse;
import com.smarttask24.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse> getNotifications(@AuthenticationPrincipal User principal) {
        List<NotificationResponse> notifications = notificationService.getUserNotifications(principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved", notifications));
    }

    @GetMapping("/unread")
    public ResponseEntity<ApiResponse> getUnreadNotifications(@AuthenticationPrincipal User principal) {
        List<NotificationResponse> notifications = notificationService.getUnreadNotifications(principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Unread notifications", notifications));
    }

    @GetMapping("/unread/count")
    public ResponseEntity<ApiResponse> getUnreadCount(@AuthenticationPrincipal User principal) {
        long count = notificationService.getUnreadCount(principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Unread count", count));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse> markAsRead(@PathVariable Long id,
                                                  @AuthenticationPrincipal User principal) {
        notificationService.markAsRead(id, principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Marked as read", null));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse> markAllAsRead(@AuthenticationPrincipal User principal) {
        notificationService.markAllAsRead(principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success("All marked as read", null));
    }
}

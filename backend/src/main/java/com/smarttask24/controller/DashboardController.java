package com.smarttask24.controller;

import com.smarttask24.dto.response.ApiResponse;
import com.smarttask24.dto.response.DashboardResponse;
import com.smarttask24.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<ApiResponse> getDashboard(@AuthenticationPrincipal User principal) {
        DashboardResponse dashboard = dashboardService.getDashboard(principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Dashboard data", dashboard));
    }
}

package com.smarttask24.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
@Builder
public class DashboardResponse {
    private long todayTasks;
    private long pendingTasks;
    private long completedTasks;
    private long overdueTasks;
    private long totalTasks;
    private String aiSuggestion;
    private String todaysQuote;
    private List<TaskResponse> upcomingDeadlines;
    private List<TaskResponse> todaysTasks;
    private ProductivityData weeklyProgress;
    private ProductivityData monthlyProgress;
    private List<CategoryBreakdown> categoryBreakdown;
    private List<PriorityBreakdown> priorityBreakdown;
    private List<DayActivity> weeklyActivity;
    private long streakDays;
}

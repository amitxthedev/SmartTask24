package com.smarttask24.service;

import com.smarttask24.dto.response.*;
import com.smarttask24.entity.Priority;
import com.smarttask24.entity.Task;
import com.smarttask24.entity.TaskStatus;
import com.smarttask24.entity.User;
import com.smarttask24.exception.ResourceNotFoundException;
import com.smarttask24.mapper.EntityMapper;
import com.smarttask24.repository.TaskRepository;
import com.smarttask24.repository.UserRepository;
import com.smarttask24.utils.Constants;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.TextStyle;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final EntityMapper entityMapper;

    public DashboardResponse getDashboard(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);

        long todayTasks = taskRepository.findByUserAndDueDateBetween(user, startOfDay, endOfDay).size();
        long pendingTasks = taskRepository.countByUserAndStatus(user, TaskStatus.PENDING) +
                taskRepository.countByUserAndStatus(user, TaskStatus.IN_PROGRESS);
        long completedTasks = taskRepository.countByUserAndStatus(user, TaskStatus.COMPLETED);
        long overdueTasks = taskRepository.findOverdueTasks(user, LocalDateTime.now()).size();
        long totalTasks = taskRepository.countByUser(user);

        List<TaskResponse> upcomingTasks = taskRepository.findUpcomingByUser(user).stream()
                .limit(5)
                .map(entityMapper::toTaskResponse)
                .toList();

        List<TaskResponse> todaysTasksList = taskRepository.findByUserAndDueDateBetween(user, startOfDay, endOfDay)
                .stream()
                .map(entityMapper::toTaskResponse)
                .toList();

        String aiSuggestion = generateAiSuggestion(user);
        String quote = Constants.MOTIVATIONAL_QUOTES[new Random().nextInt(Constants.MOTIVATIONAL_QUOTES.length)];

        ProductivityData weekly = getProductivity(user, today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)), today);
        ProductivityData monthly = getProductivity(user, today.withDayOfMonth(1), today);

        List<Task> allTasks = taskRepository.findByUserOrderByCreatedAtDesc(user);

        List<CategoryBreakdown> categoryBreakdown = getCategoryBreakdown(allTasks, totalTasks);
        List<PriorityBreakdown> priorityBreakdown = getPriorityBreakdown(allTasks, totalTasks);
        List<DayActivity> weeklyActivity = getWeeklyActivity(user, today);
        long streakDays = calculateStreak(user, today);

        return DashboardResponse.builder()
                .todayTasks(todayTasks)
                .pendingTasks(pendingTasks)
                .completedTasks(completedTasks)
                .overdueTasks(overdueTasks)
                .totalTasks(totalTasks)
                .aiSuggestion(aiSuggestion)
                .todaysQuote(quote)
                .upcomingDeadlines(upcomingTasks)
                .todaysTasks(todaysTasksList)
                .weeklyProgress(weekly)
                .monthlyProgress(monthly)
                .categoryBreakdown(categoryBreakdown)
                .priorityBreakdown(priorityBreakdown)
                .weeklyActivity(weeklyActivity)
                .streakDays(streakDays)
                .build();
    }

    private List<CategoryBreakdown> getCategoryBreakdown(List<Task> allTasks, long total) {
        if (allTasks.isEmpty()) return Collections.emptyList();

        Map<String, Long> categoryCount = allTasks.stream()
                .filter(t -> t.getCategory() != null)
                .collect(Collectors.groupingBy(
                        t -> t.getCategory().getName(),
                        Collectors.counting()
                ));

        Map<String, String> categoryColor = allTasks.stream()
                .filter(t -> t.getCategory() != null)
                .collect(Collectors.toMap(
                        t -> t.getCategory().getName(),
                        t -> t.getCategory().getColor() != null ? t.getCategory().getColor() : "#F97316",
                        (a, b) -> a
                ));

        long uncategorized = allTasks.stream().filter(t -> t.getCategory() == null).count();

        List<CategoryBreakdown> result = new ArrayList<>();
        categoryCount.forEach((name, count) -> {
            result.add(CategoryBreakdown.builder()
                    .name(name)
                    .color(categoryColor.getOrDefault(name, "#F97316"))
                    .count(count)
                    .percentage(total > 0 ? Math.round(count * 100.0 / total) : 0)
                    .build());
        });

        if (uncategorized > 0) {
            result.add(CategoryBreakdown.builder()
                    .name("Uncategorized")
                    .color("#6B7280")
                    .count(uncategorized)
                    .percentage(total > 0 ? Math.round(uncategorized * 100.0 / total) : 0)
                    .build());
        }

        result.sort((a, b) -> Long.compare(b.getCount(), a.getCount()));
        return result;
    }

    private List<PriorityBreakdown> getPriorityBreakdown(List<Task> allTasks, long total) {
        if (allTasks.isEmpty()) return Collections.emptyList();

        Map<Priority, Long> priorityCount = allTasks.stream()
                .filter(t -> t.getStatus() != TaskStatus.COMPLETED && t.getStatus() != TaskStatus.ARCHIVED)
                .collect(Collectors.groupingBy(Task::getPriority, Collectors.counting()));

        Map<Priority, String> colorMap = Map.of(
                Priority.URGENT, "#EF4444",
                Priority.HIGH, "#F97316",
                Priority.MEDIUM, "#3B82F6",
                Priority.LOW, "#6B7280"
        );

        long activeTasks = allTasks.stream()
                .filter(t -> t.getStatus() != TaskStatus.COMPLETED && t.getStatus() != TaskStatus.ARCHIVED)
                .count();

        return Arrays.stream(Priority.values())
                .map(p -> PriorityBreakdown.builder()
                        .priority(p.name())
                        .count(priorityCount.getOrDefault(p, 0L))
                        .color(colorMap.getOrDefault(p, "#6B7280"))
                        .percentage(activeTasks > 0 ? Math.round(priorityCount.getOrDefault(p, 0L) * 100.0 / activeTasks) : 0)
                        .build())
                .filter(pb -> pb.getCount() > 0)
                .sorted((a, b) -> Long.compare(b.getCount(), a.getCount()))
                .toList();
    }

    private List<DayActivity> getWeeklyActivity(User user, LocalDate today) {
        List<DayActivity> activity = new ArrayList<>();
        LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));

        for (int i = 0; i < 7; i++) {
            LocalDate date = weekStart.plusDays(i);
            LocalDateTime dayStart = date.atStartOfDay();
            LocalDateTime dayEnd = date.atTime(LocalTime.MAX);

            List<Task> dayTasks = taskRepository.findByUserAndDueDateBetween(user, dayStart, dayEnd);
            long created = taskRepository.countByUserAndCreatedAtBetween(user, dayStart, dayEnd);
            long completed = dayTasks.stream()
                    .filter(t -> t.getStatus() == TaskStatus.COMPLETED)
                    .count();

            activity.add(DayActivity.builder()
                    .day(date.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH))
                    .created(created)
                    .completed(completed)
                    .build());
        }

        return activity;
    }

    private long calculateStreak(User user, LocalDate today) {
        long streak = 0;
        LocalDate current = today;

        for (int i = 0; i < 365; i++) {
            LocalDateTime dayStart = current.atStartOfDay();
            LocalDateTime dayEnd = current.atTime(LocalTime.MAX);

            long completedThatDay = taskRepository.findByUserAndDueDateBetween(user, dayStart, dayEnd).stream()
                    .filter(t -> t.getStatus() == TaskStatus.COMPLETED)
                    .count();

            if (completedThatDay > 0) {
                streak++;
                current = current.minusDays(1);
            } else {
                break;
            }
        }

        return streak;
    }

    private ProductivityData getProductivity(User user, LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        List<Task> tasks = taskRepository.findByUserAndDueDateBetween(user, start, end);
        long total = tasks.size();
        long completed = tasks.stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count();
        double rate = total > 0 ? (double) completed / total * 100 : 0;

        return ProductivityData.builder()
                .completed(completed)
                .total(total)
                .completionRate(Math.round(rate * 100.0) / 100.0)
                .label(startDate.getMonth().toString())
                .build();
    }

    private String generateAiSuggestion(User user) {
        long overdue = taskRepository.findOverdueTasks(user, LocalDateTime.now()).size();
        long pending = taskRepository.countByUserAndStatus(user, TaskStatus.PENDING);

        if (overdue > 3) {
            return "You have " + overdue + " overdue tasks. Consider re-prioritizing or dropping low-priority items.";
        } else if (pending > 10) {
            return "You have " + pending + " pending tasks. Try breaking them down into smaller subtasks.";
        } else if (overdue > 0) {
            return "You have " + overdue + " overdue tasks. Start your day by completing them first.";
        }
        return "Great job! You're on top of your tasks. Keep up the momentum!";
    }
}

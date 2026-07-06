package com.smarttask24.service;

import com.smarttask24.entity.Task;
import com.smarttask24.entity.TaskStatus;
import com.smarttask24.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final ReminderRepository reminderRepository;
    private final NotificationService notificationService;

    @Transactional
    @Scheduled(cron = "0 0 6 * * *")
    public void sendMorningReminder() {
        log.info("Sending morning reminders...");
        userRepository.findAll().forEach(user -> {
            try {
                LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
                LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

                long todayTasks = taskRepository.findByUserAndDueDateBetween(user, startOfDay, endOfDay).size();
                long overdue = taskRepository.findOverdueTasks(user, LocalDateTime.now()).size();
                long pending = taskRepository.countByUserAndStatus(user, TaskStatus.PENDING);

                String message = String.format("Good morning %s! ☀️ You have %d tasks today, %d pending, %d overdue.",
                        user.getName(), todayTasks, pending, overdue);

                notificationService.createNotification(user, message, "MORNING_REMINDER");
            } catch (Exception e) {
                log.error("Error sending morning reminder to user {}: {}", user.getEmail(), e.getMessage());
            }
        });
    }

    @Transactional
    @Scheduled(cron = "0 0 21 * * *")
    public void sendEveningReview() {
        log.info("Sending evening reviews...");
        userRepository.findAll().forEach(user -> {
            try {
                LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
                LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

                List<Task> todaysTasks = taskRepository.findByUserAndDueDateBetween(user, startOfDay, endOfDay);
                long completed = todaysTasks.stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count();
                long total = todaysTasks.size();

                String message = String.format("Evening review %s! 📊 Completed %d/%d tasks today. %s",
                        user.getName(), completed, total,
                        total > 0 && completed == total ? "Perfect day! 🎉" : "Tomorrow is a new day! 💪");

                notificationService.createNotification(user, message, "EVENING_REVIEW");
            } catch (Exception e) {
                log.error("Error sending evening review to user {}: {}", user.getEmail(), e.getMessage());
            }
        });
    }

    @Transactional
    @Scheduled(fixedRate = 60000)
    public void processReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime end = now.plusMinutes(1);
        reminderRepository.findByIsSentFalseAndReminderTimeBetween(now, end).forEach(reminder -> {
            try {
                String message = "⏰ Reminder: " + (reminder.getTitle() != null ? reminder.getTitle() : "Task due soon!");
                notificationService.createNotification(reminder.getUser(), message, "REMINDER");
                reminder.setSent(true);
                reminderRepository.save(reminder);
            } catch (Exception e) {
                log.error("Error processing reminder {}: {}", reminder.getId(), e.getMessage());
            }
        });
    }

    @Transactional
    @Scheduled(fixedRate = 300000)
    public void checkOverdueTasks() {
        LocalDateTime now = LocalDateTime.now();
        userRepository.findAll().forEach(user -> {
            taskRepository.findOverdueTasks(user, now).stream()
                .filter(task -> task.getStatus() != TaskStatus.OVERDUE)
                .forEach(task -> {
                    task.setStatus(TaskStatus.OVERDUE);
                    taskRepository.save(task);
                    notificationService.createNotification(user,
                            "⚠️ Task \"" + task.getTitle() + "\" is now overdue!", "OVERDUE");
                });
        });
    }
}

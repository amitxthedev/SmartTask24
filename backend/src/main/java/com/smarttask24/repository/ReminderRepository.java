package com.smarttask24.repository;

import com.smarttask24.entity.Reminder;
import com.smarttask24.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface ReminderRepository extends JpaRepository<Reminder, Long> {
    List<Reminder> findByUser(User user);
    List<Reminder> findByIsSentFalseAndReminderTimeBefore(LocalDateTime now);
    List<Reminder> findByIsSentFalseAndReminderTimeBetween(LocalDateTime start, LocalDateTime end);
}

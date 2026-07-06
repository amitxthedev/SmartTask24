package com.smarttask24.repository;

import com.smarttask24.entity.Task;
import com.smarttask24.entity.TaskStatus;
import com.smarttask24.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByUserOrderByCreatedAtDesc(User user);

    List<Task> findByUserAndStatusOrderByDueDateAsc(User user, TaskStatus status);

    @Query("SELECT t FROM Task t WHERE t.user = :user AND t.dueDate BETWEEN :start AND :end ORDER BY t.dueDate ASC")
    List<Task> findByUserAndDueDateBetween(@Param("user") User user, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT t FROM Task t WHERE t.user = :user AND t.dueDate < :now AND t.status <> 'COMPLETED' AND t.status <> 'ARCHIVED'")
    List<Task> findOverdueTasks(@Param("user") User user, @Param("now") LocalDateTime now);

    @Query("SELECT t FROM Task t WHERE t.user = :user AND t.createdAt >= :since ORDER BY t.createdAt DESC")
    List<Task> findRecentTasks(@Param("user") User user, @Param("since") LocalDateTime since);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.user = :user AND t.status = :status")
    long countByUserAndStatus(@Param("user") User user, @Param("status") TaskStatus status);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.user = :user AND t.createdAt >= :since")
    long countByUserCreatedAfter(@Param("user") User user, @Param("since") LocalDateTime since);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.user = :user AND t.createdAt BETWEEN :start AND :end")
    long countByUserAndCreatedAtBetween(@Param("user") User user, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT t FROM Task t WHERE t.user = :user AND t.dueDate IS NOT NULL AND t.status <> 'COMPLETED' AND t.status <> 'ARCHIVED' ORDER BY t.dueDate ASC")
    List<Task> findUpcomingByUser(@Param("user") User user);

    @Query("SELECT t FROM Task t WHERE t.user = :user AND LOWER(t.title) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Task> searchByTitle(@Param("user") User user, @Param("query") String query);

    long countByUser(User user);
}

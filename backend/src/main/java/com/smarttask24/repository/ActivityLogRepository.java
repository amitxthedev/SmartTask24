package com.smarttask24.repository;

import com.smarttask24.entity.ActivityLog;
import com.smarttask24.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findByUserOrderByCreatedAtDesc(User user);
}

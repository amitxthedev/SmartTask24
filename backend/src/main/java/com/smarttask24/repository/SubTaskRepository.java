package com.smarttask24.repository;

import com.smarttask24.entity.SubTask;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SubTaskRepository extends JpaRepository<SubTask, Long> {
    List<SubTask> findByTaskId(Long taskId);
}

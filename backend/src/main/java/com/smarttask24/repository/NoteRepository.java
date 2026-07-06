package com.smarttask24.repository;

import com.smarttask24.entity.Note;
import com.smarttask24.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findByUserOrderByCreatedAtDesc(User user);
}

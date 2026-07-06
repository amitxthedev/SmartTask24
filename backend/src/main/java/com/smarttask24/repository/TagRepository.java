package com.smarttask24.repository;

import com.smarttask24.entity.Tag;
import com.smarttask24.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TagRepository extends JpaRepository<Tag, Long> {
    List<Tag> findByUserOrderByNameAsc(User user);
    java.util.Optional<Tag> findByNameContainingIgnoreCaseAndUser(String name, User user);
    List<Tag> findByUserAndNameContainingIgnoreCase(User user, String name);
}

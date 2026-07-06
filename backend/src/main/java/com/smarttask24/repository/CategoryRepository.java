package com.smarttask24.repository;

import com.smarttask24.entity.Category;
import com.smarttask24.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByUserOrderByNameAsc(User user);
    boolean existsByNameAndUser(String name, User user);
    java.util.Optional<Category> findByNameContainingIgnoreCaseAndUser(String name, User user);
}

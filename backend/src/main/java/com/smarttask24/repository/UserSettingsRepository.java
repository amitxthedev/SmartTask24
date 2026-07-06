package com.smarttask24.repository;

import com.smarttask24.entity.UserSettings;
import com.smarttask24.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserSettingsRepository extends JpaRepository<UserSettings, Long> {
    Optional<UserSettings> findByUser(User user);
}

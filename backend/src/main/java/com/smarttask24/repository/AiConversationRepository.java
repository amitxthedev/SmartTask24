package com.smarttask24.repository;

import com.smarttask24.entity.AiConversation;
import com.smarttask24.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AiConversationRepository extends JpaRepository<AiConversation, Long> {
    List<AiConversation> findByUserOrderByCreatedAtDesc(User user);
    void deleteByUser(User user);
    long countByUser(User user);
}

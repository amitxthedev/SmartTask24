package com.smarttask24.service;

import com.smarttask24.dto.response.AiConversationResponse;
import com.smarttask24.entity.AiConversation;
import com.smarttask24.entity.User;
import com.smarttask24.exception.ResourceNotFoundException;
import com.smarttask24.mapper.EntityMapper;
import com.smarttask24.repository.AiConversationRepository;
import com.smarttask24.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AiConversationService {

    private final AiConversationRepository aiConversationRepository;
    private final UserRepository userRepository;
    private final EntityMapper entityMapper;

    public List<AiConversationResponse> getConversations(String email) {
        User user = getUser(email);
        return aiConversationRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(entityMapper::toAiConversationResponse)
                .toList();
    }

    public List<AiConversationResponse> getRecentConversations(String email, int count) {
        User user = getUser(email);
        return aiConversationRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .limit(count)
                .map(entityMapper::toAiConversationResponse)
                .toList();
    }

    @Transactional
    public AiConversationResponse saveConversation(String prompt, String response, String email) {
        User user = getUser(email);
        AiConversation conv = AiConversation.builder()
                .prompt(prompt)
                .response(response)
                .user(user)
                .build();
        conv = aiConversationRepository.save(conv);
        return entityMapper.toAiConversationResponse(conv);
    }

    @Transactional
    public void deleteAllConversations(String email) {
        User user = getUser(email);
        aiConversationRepository.deleteByUser(user);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}

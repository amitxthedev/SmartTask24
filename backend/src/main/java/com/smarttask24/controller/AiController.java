package com.smarttask24.controller;

import com.smarttask24.dto.request.AiPromptRequest;
import com.smarttask24.dto.response.ApiResponse;
import com.smarttask24.dto.response.AiConversationResponse;
import com.smarttask24.service.AiService;
import com.smarttask24.service.AiConversationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;
    private final AiConversationService conversationService;

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse> chat(@RequestBody AiPromptRequest request,
                                            @AuthenticationPrincipal User principal) {
        String timezone = request.getTimezone() != null ? request.getTimezone() : "UTC";
        String weatherContext = "";
        String temp = request.getWeatherTemp();
        String condition = request.getWeatherCondition();
        String city = request.getWeatherCity();
        if ((temp != null && !temp.isEmpty()) || (city != null && !city.isEmpty())) {
            StringBuilder w = new StringBuilder();
            if (temp != null && !temp.isEmpty()) w.append(temp);
            w.append("|||");
            if (condition != null && !condition.isEmpty()) w.append(condition);
            w.append("|||");
            if (city != null && !city.isEmpty()) w.append(city);
            weatherContext = w.toString();
        }

        // Build profile context
        StringBuilder profile = new StringBuilder();
        if (request.getUniversity() != null && !request.getUniversity().isEmpty())
            profile.append("University: ").append(request.getUniversity()).append("; ");
        if (request.getCourse() != null && !request.getCourse().isEmpty())
            profile.append("Course: ").append(request.getCourse()).append("; ");
        if (request.getStream() != null && !request.getStream().isEmpty())
            profile.append("Stream: ").append(request.getStream()).append("; ");
        if (request.getSemester() != null && !request.getSemester().isEmpty())
            profile.append("Semester: ").append(request.getSemester()).append("; ");
        if (request.getYear() != null && !request.getYear().isEmpty())
            profile.append("Year: ").append(request.getYear()).append("; ");
        String profileContext = profile.toString();

        log.info("AI Chat - User: {}, Profile: [{}], Timezone: {}, Weather: [{}], Prompt: [{}]",
            principal.getUsername(), profileContext, timezone, weatherContext, request.getPrompt());
        AiConversationResponse response = aiService.processPrompt(request.getPrompt(), principal.getUsername(), timezone, weatherContext, profileContext);
        return ResponseEntity.ok(ApiResponse.success("AI response", response));
    }

    @GetMapping("/conversations")
    public ResponseEntity<ApiResponse> getConversations(@AuthenticationPrincipal User principal) {
        List<AiConversationResponse> conversations = conversationService.getConversations(principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Conversations retrieved", conversations));
    }

    @DeleteMapping("/conversations")
    public ResponseEntity<ApiResponse> deleteConversations(@AuthenticationPrincipal User principal) {
        conversationService.deleteAllConversations(principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Conversations cleared", null));
    }
}

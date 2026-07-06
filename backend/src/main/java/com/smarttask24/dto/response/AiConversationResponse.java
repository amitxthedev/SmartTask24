package com.smarttask24.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class AiConversationResponse {
    private Long id;
    private String prompt;
    private String response;
    private String createdAt;
}

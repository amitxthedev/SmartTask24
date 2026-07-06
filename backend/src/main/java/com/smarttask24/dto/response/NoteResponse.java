package com.smarttask24.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class NoteResponse {
    private Long id;
    private String title;
    private String content;
    private boolean isMarkdown;
    private String createdAt;
    private String updatedAt;
}

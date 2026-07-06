package com.smarttask24.dto.request;

import lombok.Data;

@Data
public class NoteRequest {
    private String title;
    private String content;
    private boolean isMarkdown;
}

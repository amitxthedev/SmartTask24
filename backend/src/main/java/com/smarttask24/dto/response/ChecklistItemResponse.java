package com.smarttask24.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class ChecklistItemResponse {
    private Long id;
    private String title;
    private boolean completed;
}

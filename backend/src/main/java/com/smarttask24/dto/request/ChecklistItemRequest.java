package com.smarttask24.dto.request;

import lombok.Data;

@Data
public class ChecklistItemRequest {
    private String title;
    private boolean completed;
}

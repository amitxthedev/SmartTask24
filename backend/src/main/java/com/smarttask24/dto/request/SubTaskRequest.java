package com.smarttask24.dto.request;

import lombok.Data;

@Data
public class SubTaskRequest {
    private String title;
    private boolean completed;
}

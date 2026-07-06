package com.smarttask24.dto.request;

import lombok.Data;

@Data
public class AiPromptRequest {
    private String prompt;
    private String timezone;
    private String weatherTemp;
    private String weatherCondition;
    private String weatherCity;
    private String weatherIcon;
    // User profile
    private String university;
    private String course;
    private String stream;
    private String semester;
    private String year;
}

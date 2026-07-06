package com.smarttask24.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class PriorityBreakdown {
    private String priority;
    private long count;
    private double percentage;
    private String color;
}

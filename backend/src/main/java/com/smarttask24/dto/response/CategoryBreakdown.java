package com.smarttask24.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class CategoryBreakdown {
    private String name;
    private String color;
    private long count;
    private double percentage;
}

package com.smarttask24.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class ProductivityData {
    private long completed;
    private long total;
    private double completionRate;
    private String label;
}

package com.Judge_Mental.XorOJ.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerdictAnalyticsDTO {
    private String verdict;
    private Long count;
    private Double percentage;
    private Double avgExecutionTime;
    private Double avgMemoryUsed;
}

package com.Judge_Mental.XorOJ.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContestPerformanceDTO {
    private Long contestId;
    private String contestTitle;
    private Long totalProblems;
    private Long problemsAttempted;
    private Long problemsSolved;
    private Long totalSubmissions;
    private Long bestRank;
    private Double solvePercentage;
}

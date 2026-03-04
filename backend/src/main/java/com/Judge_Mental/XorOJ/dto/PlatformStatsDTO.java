package com.Judge_Mental.XorOJ.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlatformStatsDTO {
    private Long totalUsers;
    private Long totalProblems;
    private Long totalSubmissions;
    private Long totalContests;
    private Long submissionsToday;
    private Long submissionsThisWeek;
    private Long activeContests;
    private Double avgAcceptanceRate;
    private Long mostSolvedProblemId;
    private String mostSolvedProblemTitle;
    private Long mostActiveUserId;
    private String mostActiveUsername;
}

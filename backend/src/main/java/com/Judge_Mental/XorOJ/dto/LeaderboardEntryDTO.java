package com.Judge_Mental.XorOJ.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardEntryDTO {
    private Long rank;
    private Long userId;
    private String username;
    private String firstName;
    private String lastName;
    private Long problemsSolved;
    private Long acceptedCount;
    private Long totalSubmissions;
    private Double acceptanceRate;
    private Long contestsParticipated;
}

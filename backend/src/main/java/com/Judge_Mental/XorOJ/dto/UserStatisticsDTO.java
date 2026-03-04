package com.Judge_Mental.XorOJ.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserStatisticsDTO {
    private Long userId;
    private String username;
    private String firstName;
    private String lastName;
    private Long totalSubmissions;
    private Long acceptedCount;
    private Long problemsSolved;
    private Double acceptanceRate;
    private Long contestsParticipated;
    private String lastSubmissionAt;
}

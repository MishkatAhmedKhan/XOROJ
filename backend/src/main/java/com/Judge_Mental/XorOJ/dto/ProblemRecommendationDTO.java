package com.Judge_Mental.XorOJ.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProblemRecommendationDTO {
    private Long problemId;
    private String title;
    private Integer difficultyRating;
    private Integer solveCount;
    private Long matchingTags;
    private Double relevanceScore;
}

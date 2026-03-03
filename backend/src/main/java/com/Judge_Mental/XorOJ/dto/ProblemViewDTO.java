package com.Judge_Mental.XorOJ.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProblemViewDTO {
  private Long id;
  private String title;
  private Integer difficultyRating;
  private int solveCount;
  private int timeLimit;
  private int memoryLimit;
}

package com.Judge_Mental.XorOJ.dto;

import java.util.Map;

public record StandingRow(
    Long userId,
    String username,
    int solved,
    int penaltyMinutes,
    Map<Long, StandingCell> cells // problemId -> cell
) {}

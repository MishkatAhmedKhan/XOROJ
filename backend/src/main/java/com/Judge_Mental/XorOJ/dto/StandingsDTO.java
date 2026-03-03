package com.Judge_Mental.XorOJ.dto;

import java.util.List;

public record StandingsDTO(
    Long contestId,
    Long version,
    List<Long> problemIds,     // column order
    List<StandingRow> rows,    // already sorted

    // contest clock (epoch millis) for countdowns on the client
    Long startEpochMs,
    Long endEpochMs,
    Long nowEpochMs,
    String status              // "UPCOMING" | "RUNNING" | "ENDED"
) {}

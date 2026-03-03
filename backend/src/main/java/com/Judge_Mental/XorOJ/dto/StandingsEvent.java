package com.Judge_Mental.XorOJ.dto;

import java.util.List;

public record StandingsEvent(
    String type,            // "ROW_UPDATE" | "SNAPSHOT" | "HEARTBEAT" | "RESET" | "FINALIZED"
    Long contestId,
    Long version,
    List<StandingRow> rows  // usually size 1 for ROW_UPDATE
) {}

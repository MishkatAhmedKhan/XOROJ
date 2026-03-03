package com.Judge_Mental.XorOJ.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class StandingsScheduler {

    private final ScoreboardService scoreboard;

    public StandingsScheduler(ScoreboardService scoreboard) {
        this.scoreboard = scoreboard;
    }

    // Check every 15s; if a contest ended, persist & finalize once
    @Scheduled(fixedDelay = 15000)
    public void finalizeEnded() {
        scoreboard.finalizeEndedContests();
    }
}

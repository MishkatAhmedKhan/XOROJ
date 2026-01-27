package com.Judge_Mental.XorOJ.controller;

import com.Judge_Mental.XorOJ.dto.StandingRow;
import com.Judge_Mental.XorOJ.dto.StandingsDTO;
import com.Judge_Mental.XorOJ.service.ScoreboardService;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/standings/contests/{contestId}")
public class StandingsController {

    private final ScoreboardService scoreboard;

    public StandingsController(ScoreboardService scoreboard) {
        this.scoreboard = scoreboard;
    }

    @GetMapping
    public ResponseEntity<StandingsDTO> snapshot(
            @PathVariable Long contestId,
            @RequestHeader(value = "If-None-Match", required = false) String inm) {

        StandingsDTO dto = scoreboard.getSnapshot(contestId);
        String etag = "\"" + dto.version() + "\"";

        if (etag.equals(inm)) {
            return ResponseEntity.status(304).eTag(etag).build();
        }
        return ResponseEntity.ok()
                .eTag(etag)
                .cacheControl(CacheControl.noStore())
                .body(dto);
    }

    // Call this from your verdict pipeline when one user's row changed
    @PostMapping("/row")
    public void rowUpdate(@PathVariable Long contestId,
                          @RequestParam List<Long> problemIds,
                          @RequestBody StandingRow row) {
        scoreboard.applyRowUpdate(contestId, problemIds, row);
    }

    // Optional: manual finalize trigger (e.g., admin button)
    @PostMapping("/finalize")
    public void finalizeNow(@PathVariable Long contestId) {
        scoreboard.finalizeIfEnded(contestId);
    }
}

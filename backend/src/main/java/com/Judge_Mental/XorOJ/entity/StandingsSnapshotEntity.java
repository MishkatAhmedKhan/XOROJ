package com.Judge_Mental.XorOJ.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "standings_snapshot")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class StandingsSnapshotEntity {

    @Id
    @Column(name = "contest_id")
    private Long contestId;

    @Column(nullable = false)
    private Long version;

    @Lob
    @Column(name = "payload_json", nullable = false, columnDefinition = "TEXT")
    private String payloadJson;

    @Column(name = "finalized", nullable = false)
    private boolean finalized = false;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();
}

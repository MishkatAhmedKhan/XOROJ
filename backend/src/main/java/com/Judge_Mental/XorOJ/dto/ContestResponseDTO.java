package com.Judge_Mental.XorOJ.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import com.Judge_Mental.XorOJ.entity.Contest;
import com.Judge_Mental.XorOJ.entity.Contest.ContestStatus;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ContestResponseDTO {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private ContestStatus status;
    private int duration;
    private boolean registered;

    public static ContestResponseDTO fromContest(Contest contest, Long userId, boolean registered) {
        ContestResponseDTO dto = new ContestResponseDTO();
        dto.setId(contest.getId());
        dto.setTitle(contest.getTitle());
        dto.setDescription(contest.getDescription());
        dto.setStartTime(contest.getStartTime());
        dto.setEndTime(contest.getEndTime());
        dto.setStatus(contest.getStatus());
        dto.setDuration(contest.getDuration());
        dto.setRegistered(registered);
        return dto;
    }
}

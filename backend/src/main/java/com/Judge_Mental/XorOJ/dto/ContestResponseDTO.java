package com.Judge_Mental.XorOJ.dto;

import com.Judge_Mental.XorOJ.model.Contest;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ContestResponseDTO {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private boolean isActive;
    private int duration;
    private boolean isRegistered;

    public static ContestResponseDTO fromContest(Contest contest, Long userId) {
        ContestResponseDTO dto = new ContestResponseDTO();
        dto.setId(contest.getId());
        dto.setTitle(contest.getTitle());
        dto.setDescription(contest.getDescription());
        dto.setStartTime(contest.getStartTime());
        dto.setEndTime(contest.getEndTime());
        dto.setActive(contest.isActive());
        dto.setDuration(contest.getDuration());
        
        dto.setRegistered(contest.getParticipants().stream()
            .anyMatch(user -> user.getId().equals(userId)));
        
        return dto;
    }
}

package com.Judge_Mental.XorOJ.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.AssertTrue;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Contest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 1000)
    private String description;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Long authorId;

    @OneToMany
    @JoinTable(
        name = "contest_problems",
        joinColumns = @JoinColumn(name = "contest_id"),
        inverseJoinColumns = @JoinColumn(name = "problem_id")
    )
    @JsonIgnoreProperties({"contributors", "tags"})
    private Set<Problem> problems;

    @ManyToMany
    @JoinTable(
        name = "contest_participants",
        joinColumns = @JoinColumn(name = "contest_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<XUser> participants;

    private int duration; // in minutes

    /**
     * This field is kept for backward compatibility with the database
     * but should not be used directly. Use getStatus() instead which
     * will calculate the actual status based on time.
     */
    @Enumerated(EnumType.STRING)
    private ContestStatus status = ContestStatus.UPCOMING;
    
    /**
     * Get the stored status value (not the calculated one)
     * @return the status value stored in the database
     */
    public ContestStatus getStoredStatus() {
        return status;
    }
    
    /**
     * This method is overridden to prevent direct setting of status
     * as it is now derived from startTime and endTime.
     * @param status The status to set (will be ignored)
     */
    public void setStatus(ContestStatus status) {
        // Status is now derived, so we don't set it directly
        // We keep this method for compatibility but it does nothing
        System.out.println("Warning: Attempt to set Contest status directly. Status is now calculated based on times.");
    }

    public enum ContestStatus {
        UPCOMING,
        RUNNING,
        ENDED
    }
    
    @AssertTrue(message = "End time must be after start time")
    public boolean isEndTimeAfterStartTime() {
        if (startTime == null || endTime == null) {
            return true;
        }
        return endTime.isAfter(startTime);
    }
    
    /**
     * Calculate the current status based on startTime, endTime and current time
     * @return the calculated status
     */
    @Transient
    public ContestStatus getCalculatedStatus() {
        LocalDateTime now = LocalDateTime.now();
        
        if (startTime == null || endTime == null) {
            return ContestStatus.UPCOMING;
        }
        
        if (now.isBefore(startTime)) {
            return ContestStatus.UPCOMING;
        } else if (now.isAfter(endTime)) {
            return ContestStatus.ENDED;
        } else {
            return ContestStatus.RUNNING;
        }
    }
    
    /**
     * Override the getStatus method to return the calculated status
     * instead of the stored field
     * @return the calculated contest status based on current time
     */
    public ContestStatus getStatus() {
        return getCalculatedStatus();
    }
}

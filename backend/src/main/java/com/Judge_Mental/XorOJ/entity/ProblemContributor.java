package com.Judge_Mental.XorOJ.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import com.fasterxml.jackson.annotation.JsonBackReference;
import java.io.Serializable;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(name = "problem_contributors")
@Data
@NoArgsConstructor
public class ProblemContributor {
    
    @EmbeddedId
    private ProblemContributorId id = new ProblemContributorId();

    @ManyToOne
    @MapsId("problemId")
    @JoinColumn(name = "problem_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonBackReference
    private Problem problem;

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private XUser user;

    @Column(nullable = false)
    private String role;
    
    public ProblemContributor(Problem problem, XUser user, String role) {
        this.problem = problem;
        this.user = user;
        this.role = role;
    }
    
    public ProblemContributor(Long problemId, Long userId, String role) {
        this.id = new ProblemContributorId(problemId, userId);
        this.role = role;
    }
    
    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode
    public static class ProblemContributorId implements Serializable {
        private static final long serialVersionUID = 1L;
        
        @Column(name = "problem_id")
        private Long problemId;
        
        @Column(name = "user_id")
        private Long userId;
    }
}

package com.Judge_Mental.XorOJ.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.Set;

@Entity
@Table(name = "problems")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Problem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(unique = true, nullable = false)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String statement;
    
    @Min(value = 800)
    @Max(value = 4000)
    private Integer difficultyRating;

    @Column(nullable = false, columnDefinition = "integer default 0")
    private int solveCount;

    @Column(nullable = false, columnDefinition = "integer default 1000")
    private int timeLimit;

    @Column(nullable = false, columnDefinition = "integer default 512")
    private int memoryLimit;

    @ElementCollection
    @CollectionTable(name = "problem_tags", joinColumns = @JoinColumn(name = "problem_id"))
    @Column(name = "tag")
    private Set<String> tags;
    
}

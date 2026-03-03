package com.Judge_Mental.XorOJ.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import java.util.List;

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
    private String description;
    @Column(columnDefinition = "TEXT")
    private String inputFormat;
    @Column(columnDefinition = "TEXT")
    private String outputFormat;
    @Column(columnDefinition = "TEXT")
    private String notes;
    @Column(columnDefinition = "TEXT")
    private String sampleInput;
    @Column(columnDefinition = "TEXT")
    private String sampleOutput;

    @Column(columnDefinition = "integer default 0")
    private Integer problemNum;

    private Long authorId;

    @OneToMany(mappedBy = "problem", cascade = CascadeType.REMOVE, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<ProblemContributor> contributors;

    @Min(value = 800)
    @Max(value = 4000)
    private Integer difficultyRating;

    @Column(nullable = false, columnDefinition = "integer default 0")
    private int solveCount;

    @Column(nullable = false, columnDefinition = "integer default 1000")
    private int timeLimit;

    @Column(nullable = false, columnDefinition = "integer default 512")
    private int memoryLimit;

    private String status = "public";

    @ElementCollection
    @CollectionTable(name = "problem_tags", joinColumns = @JoinColumn(name = "problem_id"))
    private List<String> tags;

    String inputFileType;
    String outputFileType;

    String mainSolutionPath;
    String checkerPath;
    String validatorPath;
    
    @OneToMany(mappedBy = "problem", cascade = CascadeType.REMOVE, orphanRemoval = true)
    @JsonManagedReference
    private List<GeneratorFile> generatorFiles;

    @OneToMany(mappedBy = "problem", cascade = CascadeType.REMOVE, orphanRemoval = true)
    @JsonManagedReference
    private List<TestFile> testFiles;
}

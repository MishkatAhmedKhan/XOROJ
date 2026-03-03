package com.Judge_Mental.XorOJ.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import com.fasterxml.jackson.annotation.JsonBackReference;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import com.Judge_Mental.XorOJ.entity.listener.GeneratorFileEntityListener;
import java.io.Serializable;

@Entity
@Table(name = "generator_files")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(GeneratorFileEntityListener.class)
public class GeneratorFile {
    
    @EmbeddedId
    private GeneratorFileId id = new GeneratorFileId();
    
    @Column(nullable = false)
    private String fileName;
    
    @Column(nullable = false)
    private String filePath;
    
    @ManyToOne
    @MapsId("problemId")
    @JoinColumn(name = "problem_id", nullable = false)
    @JsonBackReference
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Problem problem;
    
    // Getter for generatorId to maintain compatibility with existing code
    public int getGeneratorId() {
        return this.id.getGeneratorId();
    }
    
    // Constructor to make it easier to create a GeneratorFile
    public GeneratorFile(int generatorId, String fileName, String filePath, Problem problem) {
        this.id = new GeneratorFileId(problem.getId(), generatorId);
        this.fileName = fileName;
        this.filePath = filePath;
        this.problem = problem;
    }
    
    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode
    public static class GeneratorFileId implements Serializable {
        private static final long serialVersionUID = 1L;
        
        @Column(name = "problem_id")
        private Long problemId;
        
        @Column(name = "generator_id")
        private int generatorId;
    }
}

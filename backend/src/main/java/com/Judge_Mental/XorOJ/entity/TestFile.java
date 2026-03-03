package com.Judge_Mental.XorOJ.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import com.fasterxml.jackson.annotation.JsonBackReference;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import com.Judge_Mental.XorOJ.entity.listener.TestFileEntityListener;
import java.io.Serializable;

@Entity
@Table(name = "test_files")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(TestFileEntityListener.class)
public class TestFile {
    
    @EmbeddedId
    private TestFileId id = new TestFileId();
    
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
    
    // Getter for testId to maintain compatibility with existing code
    public int getTestId() {
        return this.id.getTestId();
    }
    
    // Constructor to make it easier to create a TestFile
    public TestFile(int testId, String fileName, String filePath, Problem problem) {
        this.id = new TestFileId(problem.getId(), testId);
        this.fileName = fileName;
        this.filePath = filePath;
        this.problem = problem;
    }
    
    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode
    public static class TestFileId implements Serializable {
        private static final long serialVersionUID = 1L;
        
        @Column(name = "problem_id")
        private Long problemId;
        
        @Column(name = "test_id")
        private int testId;
    }
}

package com.Judge_Mental.XorOJ.entity.listener;

import com.Judge_Mental.XorOJ.entity.TestFile;
import com.Judge_Mental.XorOJ.service.FileStorageService;
import jakarta.persistence.PreRemove;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class TestFileEntityListener {

    private static FileStorageService fileStorageService;

    @Autowired
    public void setFileStorageService(FileStorageService fileStorageService) {
        TestFileEntityListener.fileStorageService = fileStorageService;
    }

    @PreRemove
    public void preRemove(TestFile testFile) {
        // Delete the physical file before entity is removed
        if (testFile != null && testFile.getFilePath() != null) {
            System.out.println("Deleting test file: " + testFile.getFilePath());
            fileStorageService.deleteFile(testFile.getFilePath());
        }
    }
}

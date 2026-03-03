package com.Judge_Mental.XorOJ.entity.listener;

import com.Judge_Mental.XorOJ.entity.GeneratorFile;
import com.Judge_Mental.XorOJ.service.FileStorageService;
import jakarta.persistence.PreRemove;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class GeneratorFileEntityListener {

    private static FileStorageService fileStorageService;

    @Autowired
    public void setFileStorageService(FileStorageService fileStorageService) {
        GeneratorFileEntityListener.fileStorageService = fileStorageService;
    }

    @PreRemove
    public void preRemove(GeneratorFile generatorFile) {
        // Delete the physical file before entity is removed
        if (generatorFile != null && generatorFile.getFilePath() != null) {
            System.out.println("Deleting file: " + generatorFile.getFilePath());
            fileStorageService.deleteFile(generatorFile.getFilePath());
        }
    }
}

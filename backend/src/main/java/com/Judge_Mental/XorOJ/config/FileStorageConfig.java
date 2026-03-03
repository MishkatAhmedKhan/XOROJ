package com.Judge_Mental.XorOJ.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Component
public class FileStorageConfig implements CommandLineRunner {

    @Value("${submission.storage.path:./submissions}")
    private String submissionStoragePath;

    @Value("${file.upload-dir:./uploads}")
    private String fileUploadDir;

    @Override
    public void run(String... args) throws Exception {
        // Create submission storage directory if it doesn't exist
        Path submissionPath = Paths.get(submissionStoragePath);
        if (!Files.exists(submissionPath)) {
            Files.createDirectories(submissionPath);
            System.out.println("Created submission storage directory: " + submissionPath.toAbsolutePath());
        } else {
            System.out.println("Submission storage directory exists at: " + submissionPath.toAbsolutePath());
        }
        
        // Create uploads directory if it doesn't exist
        Path uploadPath = Paths.get(fileUploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
            System.out.println("Created file upload directory: " + uploadPath.toAbsolutePath());
        } else {
            System.out.println("File upload directory exists at: " + uploadPath.toAbsolutePath());
        }
    }
}

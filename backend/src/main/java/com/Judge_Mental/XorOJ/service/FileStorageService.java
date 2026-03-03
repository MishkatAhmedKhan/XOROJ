package com.Judge_Mental.XorOJ.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {
    
    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;
    
    public String storeFile(MultipartFile file, String directory, String fileName) throws IOException {
        System.out.println("file storage initiated");
        Path uploadPath = Paths.get(uploadDir, directory).toAbsolutePath().normalize();
        
        // Create directories if they don't exist
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // If no filename provided, create a unique name
        if (fileName == null || fileName.isEmpty()) {
            String fileExtension = getFileExtension(file.getOriginalFilename());
            fileName = UUID.randomUUID().toString() + fileExtension;
        }
        
        // Resolve the file path
        Path targetLocation = uploadPath.resolve(fileName);
        
        // Copy the file to the target location
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        
        return targetLocation.toString();
    }
    
    private String getFileExtension(String fileName) {
        if (fileName == null || fileName.lastIndexOf(".") == -1) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf("."));
    }


    public boolean deleteFile(String filePath) {
        try {
            Files.deleteIfExists(Paths.get(filePath));
            return true;
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }
    }
    
    public String storeStringToFile(String content, String directory, String fileName) throws IOException {
        Path uploadPath = Paths.get(uploadDir, directory).toAbsolutePath().normalize();
        
        // Create directories if they don't exist
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Resolve the file path
        Path targetLocation = uploadPath.resolve(fileName);
        
        Files.writeString(targetLocation, content);
        
        return targetLocation.toString();
    }
}

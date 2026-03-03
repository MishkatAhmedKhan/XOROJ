// src/main/java/com/Judge_Mental/XorOJ/config/JacksonConfig.java
package com.Judge_Mental.XorOJ.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.fasterxml.jackson.module.afterburner.AfterburnerModule;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonConfig {
  @Bean
  public ObjectMapper objectMapper() {
    JsonMapper mapper = JsonMapper.builder()
        .addModule(new JavaTimeModule())
        .addModule(new AfterburnerModule())
        .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
        .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS)
        .build();
    
    // Set maximum nesting depth to avoid exceeding the limit
    mapper.getFactory().setStreamWriteConstraints(
        com.fasterxml.jackson.core.StreamWriteConstraints.builder()
            .maxNestingDepth(100) // Set a lower limit to prevent deep nesting issues
            .build()
    );
    
    return mapper;
  }
}

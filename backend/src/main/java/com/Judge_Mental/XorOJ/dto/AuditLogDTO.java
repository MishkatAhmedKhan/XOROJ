package com.Judge_Mental.XorOJ.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogDTO {
    private Long id;
    private String tableName;
    private String operation;
    private Long rowId;
    private String oldData;
    private String newData;
    private String changedBy;
    private LocalDateTime changedAt;
}

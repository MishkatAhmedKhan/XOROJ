package com.Judge_Mental.XorOJ.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityHeatmapDTO {
    private String date;       // yyyy-MM-dd
    private Long submissions;
    private Long accepted;
    private Integer intensity; // 0-4
}

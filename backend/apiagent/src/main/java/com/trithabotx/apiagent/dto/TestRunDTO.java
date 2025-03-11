package com.trithabotx.apiagent.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestRunDTO {
    private String id;
    private String testSuiteId;
    private String status;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String environment;
    private String baseUrl;
}

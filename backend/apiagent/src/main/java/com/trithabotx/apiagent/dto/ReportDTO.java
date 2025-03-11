package com.trithabotx.apiagent.dto;

import com.trithabotx.apiagent.model.TestRunSummary;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportDTO {
    private String id;
    private String testSuiteId;
    private String testSuiteName;
    private String reportName;
    private LocalDateTime generatedAt;
    private String environment;
    private String baseUrl;
    private Map<String, Object> duration;
    private TestRunSummary summary;
    private Map<String, Object> statistics;
    private Map<String, String> insights;
    private List<TestResultDTO> testResults;
}

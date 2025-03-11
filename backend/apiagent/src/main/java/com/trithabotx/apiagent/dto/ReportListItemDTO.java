package com.trithabotx.apiagent.dto;

import com.trithabotx.apiagent.model.TestRunSummary;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportListItemDTO {

    private String id;
    private String testSuiteId;
    private String testSuiteName;
    private String reportName;
    private String status;
    private String environment;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private TestRunSummary summary;
}

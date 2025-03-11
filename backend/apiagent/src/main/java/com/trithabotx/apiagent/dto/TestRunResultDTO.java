package com.trithabotx.apiagent.dto;

import com.trithabotx.apiagent.model.TestResult;
import com.trithabotx.apiagent.model.TestRunSummary;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestRunResultDTO {
    private String id;
    private String testSuiteId;
    private String status;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String environment;
    private String baseUrl;
    private TestRunSummary summary;

    @Builder.Default
    private List<TestResult> results = new ArrayList<>();

}

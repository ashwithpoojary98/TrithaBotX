package com.trithabotx.apiagent.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Document(collection = "test_runs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestRun {
    @Id
    private String id;

    private String testSuiteId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;  // "running", "completed", "failed", "aborted"
    private String environment;
    private String baseUrl;

    @Builder.Default
    private Map<String, String> headers = new HashMap<>();

    @Builder.Default
    private TestRunSummary summary = new TestRunSummary();

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

}

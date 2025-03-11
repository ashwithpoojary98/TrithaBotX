package com.trithabotx.apiagent.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Document(collection = "test_results")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestResult {

    @Id
    private String id;

    private String testRunId;
    private String testCaseId;
    private String status;  // "passed", "failed", "skipped", "error"
    private Long duration;  // in milliseconds

    private String requestUrl;
    private String requestMethod;

    @Builder.Default
    private Map<String, String> requestHeaders = new HashMap<>();

    private Object requestBody;
    private Integer responseStatus;

    @Builder.Default
    private Map<String, String> responseHeaders = new HashMap<>();

    private Object responseBody;
    private String error;

    @Builder.Default
    private List<String> validationErrors = new ArrayList<>();

    @CreatedDate
    private LocalDateTime createdAt;
}

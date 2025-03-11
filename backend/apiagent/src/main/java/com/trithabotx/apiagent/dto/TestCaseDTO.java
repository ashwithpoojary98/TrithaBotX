package com.trithabotx.apiagent.dto;

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
public class TestCaseDTO {
    private String id;
    private String testSuiteId;
    private String name;
    private String method;
    private String endpoint;
    private Map<String, String> headers;
    private Object body;
    private int expectedStatus;
    private Object expectedResponse;
    private List<String> validation;
    private String category;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

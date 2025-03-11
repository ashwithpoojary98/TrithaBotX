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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Document(collection = "test_cases")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestCase {
    @Id
    private String id;

    private String testSuiteId;
    private String name;
    private String method;
    private String endpoint;

    @Builder.Default
    private Map<String, String> headers = new HashMap<>();

    private Object body;
    private int expectedStatus;
    private Object expectedResponse;

    @Builder.Default
    private List<String> validation = new ArrayList<>();

    private String category;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

}

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
import java.util.List;

@Document(collection = "test_suites")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestSuite {
    @Id
    private String id;

    private String name;
    private String description;
    private String apiSpec;

    @Builder.Default
    private List<String> testCaseIds = new ArrayList<>();

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}

package com.trithabotx.apiagent.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestSuiteDTO {
    private String id;
    private String name;
    private String apiSpec;
    private int testCasesCount;
    private List<TestCaseDTO> testCases;
    private LocalDateTime createdAt;
}

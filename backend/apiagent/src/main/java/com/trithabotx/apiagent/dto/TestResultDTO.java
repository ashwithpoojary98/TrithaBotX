package com.trithabotx.apiagent.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestResultDTO {

    private String id;
    private String testCaseId;
    private String testCaseName;
    private String category;
    private String status;
    private Long duration;
    private String requestUrl;
    private String requestMethod;
    private Integer responseStatus;
    private String error;
    private List<String> validationErrors;
}

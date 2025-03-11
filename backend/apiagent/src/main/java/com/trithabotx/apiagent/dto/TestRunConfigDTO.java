package com.trithabotx.apiagent.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestRunConfigDTO {

    private String environment;
    private String baseUrl;

    @Builder.Default
    private Map<String, String> headers = new HashMap<>();

    private Integer timeout; // in milliseconds
    private Integer concurrency;
}

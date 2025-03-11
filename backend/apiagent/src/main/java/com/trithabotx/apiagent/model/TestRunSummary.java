package com.trithabotx.apiagent.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestRunSummary {

    @Builder.Default
    private int total = 0;

    @Builder.Default
    private int passed = 0;

    @Builder.Default
    private int failed = 0;

    @Builder.Default
    private int skipped = 0;

    @Builder.Default
    private double passRate = 0.0;
}

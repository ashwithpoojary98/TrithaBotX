package com.trithabotx.apiagent.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.trithabotx.apiagent.dto.ReportDTO;
import com.trithabotx.apiagent.dto.ReportListItemDTO;
import com.trithabotx.apiagent.dto.TestResultDTO;
import com.trithabotx.apiagent.exception.ResourceNotFoundException;
import com.trithabotx.apiagent.model.TestCase;
import com.trithabotx.apiagent.model.TestResult;
import com.trithabotx.apiagent.model.TestRun;
import com.trithabotx.apiagent.model.TestSuite;
import com.trithabotx.apiagent.repository.TestCaseRepository;
import com.trithabotx.apiagent.repository.TestResultRepository;
import com.trithabotx.apiagent.repository.TestRunRepository;
import com.trithabotx.apiagent.repository.TestSuiteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final TestRunRepository testRunRepository;
    private final TestSuiteRepository testSuiteRepository;
    private final TestCaseRepository testCaseRepository;
    private final TestResultRepository testResultRepository;
    private final OllamaService ollamaService;
    private final ObjectMapper objectMapper;

    /**
     * Generate a report for a test run
     *
     * @param testRunId Test run ID
     * @return Generated report
     */
    public ReportDTO generateReport(String testRunId) {
        log.info("Generating report for test run: {}", testRunId);

        // Fetch test run
        TestRun testRun = testRunRepository.findById(testRunId)
                .orElseThrow(() -> new ResourceNotFoundException("Test run not found: " + testRunId));

        // Fetch test suite
        TestSuite testSuite = testSuiteRepository.findById(testRun.getTestSuiteId())
                .orElseThrow(() -> new ResourceNotFoundException("Test suite not found: " + testRun.getTestSuiteId()));

        // Fetch test results
        List<TestResult> results = testResultRepository.findByTestRunId(testRunId);

        // Fetch test cases
        List<String> testCaseIds = results.stream()
                .map(TestResult::getTestCaseId)
                .collect(Collectors.toList());

        List<TestCase> testCases = testCaseRepository.findAllById(testCaseIds);

        // Create test case map for quick lookup
        Map<String, TestCase> testCaseMap = testCases.stream()
                .collect(Collectors.toMap(TestCase::getId, tc -> tc));

        // Calculate statistics
        Map<String, Object> statistics = calculateStatistics(results, testCaseMap);

        // Generate insights
        Map<String, String> insights = generateInsights(testRun, results, testCaseMap);

        // Process test results
        List<TestResultDTO> testResultDTOs = results.stream()
                .map(result -> mapToTestResultDTO(result, testCaseMap.get(result.getTestCaseId())))
                .collect(Collectors.toList());

        // Build report
        return ReportDTO.builder()
                .id(testRunId)
                .testSuiteId(testRun.getTestSuiteId())
                .testSuiteName(testSuite.getName())
                .reportName(testSuite.getName() + " - Run Report " + testRunId)
                .generatedAt(LocalDateTime.now())
                .environment(testRun.getEnvironment())
                .baseUrl(testRun.getBaseUrl())
                .duration(calculateDurationInfo(testRun))
                .summary(testRun.getSummary())
                .statistics(statistics)
                .insights(insights)
                .testResults(testResultDTOs)
                .build();
    }

    /**
     * Calculate statistics for test results
     *
     * @param results       List of test results
     * @param testCaseMap   Map of test cases by ID
     * @return Map of statistics
     */
    private Map<String, Object> calculateStatistics(List<TestResult> results, Map<String, TestCase> testCaseMap) {
        Map<String, Object> stats = new HashMap<>();

        // Basic statistics (already included in TestRunSummary)
        int totalTests = results.size();
        long passedTests = results.stream().filter(r -> "passed".equals(r.getStatus())).count();
        long failedTests = results.stream().filter(r -> "failed".equals(r.getStatus())).count();
        long skippedTests = results.stream().filter(r -> "skipped".equals(r.getStatus())).count();

        double passRate = totalTests > 0 ? ((double) passedTests / totalTests) * 100 : 0;

        // Category statistics
        Map<String, Map<String, Object>> categoryStats = new HashMap<>();

        for (TestResult result : results) {
            TestCase testCase = testCaseMap.get(result.getTestCaseId());
            if (testCase != null) {
                String category = testCase.getCategory() != null ? testCase.getCategory() : "uncategorized";

                if (!categoryStats.containsKey(category)) {
                    Map<String, Object> categoryStat = new HashMap<>();
                    categoryStat.put("total", 0);
                    categoryStat.put("passed", 0);
                    categoryStat.put("failed", 0);
                    categoryStat.put("skipped", 0);
                    categoryStat.put("passRate", 0.0);

                    categoryStats.put(category, categoryStat);
                }

                Map<String, Object> categoryStat = categoryStats.get(category);

                // Update counts
                categoryStat.put("total", (int) categoryStat.get("total") + 1);

                if ("passed".equals(result.getStatus())) {
                    categoryStat.put("passed", (int) categoryStat.get("passed") + 1);
                } else if ("failed".equals(result.getStatus())) {
                    categoryStat.put("failed", (int) categoryStat.get("failed") + 1);
                } else if ("skipped".equals(result.getStatus())) {
                    categoryStat.put("skipped", (int) categoryStat.get("skipped") + 1);
                }

                // Calculate pass rate
                int categoryTotal = (int) categoryStat.get("total");
                int categoryPassed = (int) categoryStat.get("passed");
                double categoryPassRate = categoryTotal > 0 ? ((double) categoryPassed / categoryTotal) * 100 : 0;
                categoryStat.put("passRate", categoryPassRate);
            }
        }

        // Response time statistics
        List<Long> responseTimes = results.stream()
                .map(TestResult::getDuration)
                .filter(Objects::nonNull)
                .toList();

        Map<String, Object> responseTimeStats = new HashMap<>();
        if (!responseTimes.isEmpty()) {
            double avgResponseTime = responseTimes.stream().mapToLong(Long::longValue).average().orElse(0);
            long minResponseTime = Collections.min(responseTimes);
            long maxResponseTime = Collections.max(responseTimes);

            responseTimeStats.put("average", avgResponseTime);
            responseTimeStats.put("min", minResponseTime);
            responseTimeStats.put("max", maxResponseTime);
        } else {
            responseTimeStats.put("average", 0);
            responseTimeStats.put("min", 0);
            responseTimeStats.put("max", 0);
        }

        // Most common errors
        List<String> allErrors = results.stream()
                .filter(r -> "failed".equals(r.getStatus()))
                .filter(r -> r.getValidationErrors() != null && !r.getValidationErrors().isEmpty())
                .flatMap(r -> r.getValidationErrors().stream())
                .collect(Collectors.toList());

        Map<String, Long> errorCounts = allErrors.stream()
                .collect(Collectors.groupingBy(e -> e, Collectors.counting()));

        List<Map<String, Object>> mostCommonErrors = errorCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(entry -> {
                    Map<String, Object> error = new HashMap<>();
                    error.put("error", entry.getKey());
                    error.put("count", entry.getValue());
                    return error;
                })
                .collect(Collectors.toList());

        // Compile all statistics
        stats.put("categoryStats", categoryStats);
        stats.put("responseTime", responseTimeStats);
        stats.put("mostCommonErrors", mostCommonErrors);

        return stats;
    }

    /**
     * Generate insights using Ollama LLM
     *
     * @param testRun      Test run
     * @param results      List of test results
     * @param testCaseMap  Map of test cases by ID
     * @return Map of insights
     */
    private Map<String, String> generateInsights(TestRun testRun, List<TestResult> results, Map<String, TestCase> testCaseMap) {
        try {
            // Prepare data for Ollama
            Map<String, Object> insightData = new HashMap<>();
            insightData.put("testRunSummary", testRun.getSummary());

            List<Map<String, Object>> failedTests = results.stream()
                    .filter(r -> "failed".equals(r.getStatus()))
                    .map(r -> {
                        TestCase testCase = testCaseMap.get(r.getTestCaseId());
                        Map<String, Object> test = new HashMap<>();
                        test.put("testName", testCase != null ? testCase.getName() : "Unknown Test");
                        test.put("category", testCase != null ? testCase.getCategory() : "unknown");
                        test.put("errors", r.getValidationErrors() != null ? r.getValidationErrors() : Collections.emptyList());
                        test.put("responseStatus", r.getResponseStatus());
                        return test;
                    })
                    .collect(Collectors.toList());

            insightData.put("failedTests", failedTests);

            // Convert to JSON
            String dataJson = objectMapper.writeValueAsString(insightData);

            // Generate insights using Ollama
            String insightText = ollamaService.suggestTestImprovements(dataJson);

            // Parse insights (simple approach)
            Map<String, String> insights = new HashMap<>();

            String[] paragraphs = insightText.split("\n\n");
            if (paragraphs.length > 0) {
                insights.put("summary", paragraphs[0].trim());

                if (paragraphs.length > 1) {
                    insights.put("details", String.join("\n\n", Arrays.copyOfRange(paragraphs, 1, paragraphs.length)));
                } else {
                    insights.put("details", "");
                }
            } else {
                insights.put("summary", "No insights available");
                insights.put("details", "");
            }

            return insights;
        } catch (JsonProcessingException e) {
            log.error("Error generating insights", e);
            Map<String, String> fallbackInsights = new HashMap<>();
            fallbackInsights.put("summary", "Failed to generate insights");
            fallbackInsights.put("details", "An error occurred while analyzing test results: " + e.getMessage());
            return fallbackInsights;
        }
    }

    /**
     * Calculate duration information for a test run
     *
     * @param testRun Test run
     * @return Map with duration info
     */
    private Map<String, Object> calculateDurationInfo(TestRun testRun) {
        Map<String, Object> durationInfo = new HashMap<>();
        durationInfo.put("startTime", testRun.getStartTime());
        durationInfo.put("endTime", testRun.getEndTime());

        long totalMs = 0;
        if (testRun.getStartTime() != null && testRun.getEndTime() != null) {
            totalMs = Duration.between(testRun.getStartTime(), testRun.getEndTime()).toMillis();
        }

        durationInfo.put("totalMs", totalMs);
        return durationInfo;
    }

    /**
     * Map TestResult to DTO
     *
     * @param result   Test result
     * @param testCase Test case
     * @return Test result DTO
     */
    private TestResultDTO mapToTestResultDTO(TestResult result, TestCase testCase) {
        return TestResultDTO.builder()
                .id(result.getId())
                .testCaseId(result.getTestCaseId())
                .testCaseName(testCase != null ? testCase.getName() : "Unknown Test")
                .category(testCase != null ? testCase.getCategory() : "unknown")
                .status(result.getStatus())
                .duration(result.getDuration())
                .requestUrl(result.getRequestUrl())
                .requestMethod(result.getRequestMethod())
                .responseStatus(result.getResponseStatus())
                .error(result.getError())
                .validationErrors(result.getValidationErrors())
                .build();
    }

    /**
     * Get list of reports (test runs)
     *
     * @param page Page number
     * @param size Page size
     * @return List of report summary items
     */
    public Page<ReportListItemDTO> getReportList(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "startTime"));
        Page<TestRun> testRuns = testRunRepository.findAll(pageable);

        return testRuns.map(testRun -> {
            String testSuiteName = "";
            try {
                TestSuite testSuite = testSuiteRepository.findById(testRun.getTestSuiteId()).orElse(null);
                if (testSuite != null) {
                    testSuiteName = testSuite.getName();
                }
            } catch (Exception e) {
                log.warn("Error fetching test suite for report list", e);
            }

            return ReportListItemDTO.builder()
                    .id(testRun.getId())
                    .testSuiteId(testRun.getTestSuiteId())
                    .testSuiteName(testSuiteName)
                    .reportName(testSuiteName + " - Run Report " + testRun.getId())
                    .status(testRun.getStatus())
                    .environment(testRun.getEnvironment())
                    .startTime(testRun.getStartTime())
                    .endTime(testRun.getEndTime())
                    .summary(testRun.getSummary())
                    .build();
        });
    }
}

package com.trithabotx.apiagent.service;

import com.trithabotx.apiagent.config.AppProperties;
import com.trithabotx.apiagent.dto.TestRunConfigDTO;
import com.trithabotx.apiagent.dto.TestRunDTO;
import com.trithabotx.apiagent.dto.TestRunResultDTO;
import com.trithabotx.apiagent.exception.ResourceNotFoundException;
import com.trithabotx.apiagent.model.TestCase;
import com.trithabotx.apiagent.model.TestResult;
import com.trithabotx.apiagent.model.TestRun;
import com.trithabotx.apiagent.model.TestRunSummary;
import com.trithabotx.apiagent.model.TestSuite;
import com.trithabotx.apiagent.repository.TestCaseRepository;
import com.trithabotx.apiagent.repository.TestResultRepository;
import com.trithabotx.apiagent.repository.TestRunRepository;
import com.trithabotx.apiagent.repository.TestSuiteRepository;
import io.restassured.RestAssured;
import io.restassured.config.HttpClientConfig;
import io.restassured.config.RestAssuredConfig;
import io.restassured.http.Header;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TestRunnerService {

    private final TestSuiteRepository testSuiteRepository;
    private final TestCaseRepository testCaseRepository;
    private final TestRunRepository testRunRepository;
    private final TestResultRepository testResultRepository;
    private final AppProperties appProperties;

    /**
     * Run a test suite
     *
     * @param testSuiteId Test suite ID
     * @param config      Test run configuration
     * @return Test run details
     */
    @Transactional
    public TestRunDTO runTestSuite(String testSuiteId, TestRunConfigDTO config) {
        log.info("Running test suite: {}", testSuiteId);

        // Verify test suite exists
        TestSuite testSuite = testSuiteRepository.findById(testSuiteId)
                .orElseThrow(() -> new ResourceNotFoundException("Test suite not found: " + testSuiteId));
        // Get test cases
        List<TestCase> testCases = testCaseRepository.findByTestSuiteId(testSuiteId);
        if (testCases.isEmpty()) {
            throw new IllegalStateException("No test cases found for test suite: " + testSuiteId);
        }

        // Create test run
        TestRun testRun = TestRun.builder()
                .testSuiteId(testSuiteId)
                .startTime(LocalDateTime.now())
                .status("running")
                .environment(config.getEnvironment())
                .baseUrl(config.getBaseUrl())
                .headers(config.getHeaders())
                .build();

        testRun = testRunRepository.save(testRun);
        final String testRunId = testRun.getId();

        // Run tests asynchronously
        runTestsAsync(testRunId, testCases, config);

        return TestRunDTO.builder()
                .id(testRun.getId())
                .testSuiteId(testRun.getTestSuiteId())
                .status(testRun.getStatus())
                .startTime(testRun.getStartTime())
                .environment(testRun.getEnvironment())
                .baseUrl(testRun.getBaseUrl())
                .build();
    }

    /**
     * Run tests asynchronously
     *
     * @param testRunId Test run ID
     * @param testCases List of test cases to run
     * @param config    Test run configuration
     */
    @Async
    protected void runTestsAsync(String testRunId, List<TestCase> testCases, TestRunConfigDTO config) {
        try {
            log.info("Starting async test execution for test run: {}", testRunId);

            TestRun testRun = testRunRepository.findById(testRunId)
                    .orElseThrow(() -> new ResourceNotFoundException("Test run not found: " + testRunId));

            // Create thread pool
            int concurrency = Math.min(
                    config.getConcurrency() != null ? config.getConcurrency() : 5,
                    appProperties.getTestRunner().getMaxConcurrency()
            );

            ExecutorService executor = Executors.newFixedThreadPool(concurrency);
            List<CompletableFuture<TestResult>> futures = new ArrayList<>();

            // Submit test cases for execution
            for (TestCase testCase : testCases) {
                CompletableFuture<TestResult> future = CompletableFuture.supplyAsync(() -> {
                    try {
                        return executeTestCase(testCase, testRun, config);
                    } catch (Exception e) {
                        log.error("Error executing test case {}: {}", testCase.getId(), e.getMessage());
                        return createErrorTestResult(testCase.getId(), testRunId, e.getMessage());
                    }
                }, executor);

                futures.add(future);
            }

            // Wait for all test cases to complete
            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

            // Collect results
            List<TestResult> results = futures.stream()
                    .map(CompletableFuture::join).toList();

            // Update test run summary
            int total = results.size();
            int passed = (int) results.stream().filter(r -> "passed".equals(r.getStatus())).count();
            int failed = (int) results.stream().filter(r -> "failed".equals(r.getStatus())).count();
            int skipped = (int) results.stream().filter(r -> "skipped".equals(r.getStatus())).count();
            double passRate = total > 0 ? ((double) passed / total) * 100 : 0;

            TestRunSummary summary = TestRunSummary.builder()
                    .total(total)
                    .passed(passed)
                    .failed(failed)
                    .skipped(skipped)
                    .passRate(passRate)
                    .build();

            // Update test run
            testRun.setSummary(summary);
            testRun.setEndTime(LocalDateTime.now());
            testRun.setStatus(failed > 0 ? "failed" : "passed");
            testRunRepository.save(testRun);

            log.info("Completed test run: {}. Status: {}, Pass rate: {}%",
                    testRunId, testRun.getStatus(), String.format("%.2f", passRate));

            executor.shutdown();
        } catch (Exception e) {
            log.error("Error during test execution", e);

            // Update test run status to failed
            TestRun testRun = testRunRepository.findById(testRunId).orElse(null);
            if (testRun != null) {
                testRun.setStatus("failed");
                testRun.setEndTime(LocalDateTime.now());
                testRunRepository.save(testRun);
            }
        }
    }

    /**
     * Execute a single test case
     *
     * @param testCase Test case to execute
     * @param testRun  Test run
     * @param config   Test run configuration
     * @return Test result
     */
    private TestResult executeTestCase(TestCase testCase, TestRun testRun, TestRunConfigDTO config) {
        log.debug("Executing test case: {}", testCase.getName());

        long startTime = System.currentTimeMillis();

        try {
            // Set timeout
            int timeout = config.getTimeout() != null
                    ? config.getTimeout()
                    : appProperties.getTestRunner().getDefaultTimeout();
            RestAssuredConfig.config()
                    .httpClient(HttpClientConfig.httpClientConfig()
                            .setParam("http.socket.timeout", timeout)  // Set socket timeout
                            .setParam("http.connection.timeout", timeout) // Set connection timeout
                    );

            // Prepare request
            RequestSpecification request = RestAssured.given();

            // Set base URL and endpoint
            String url = testRun.getBaseUrl() + testCase.getEndpoint();

            // Set headers (global headers + test case headers)
            Map<String, String> allHeaders = new HashMap<>(testRun.getHeaders());
            allHeaders.putAll(testCase.getHeaders());
            for (Map.Entry<String, String> header : allHeaders.entrySet()) {
                request.header(new Header(header.getKey(), header.getValue()));
            }

            // Set request body if needed
            if (testCase.getBody() != null) {
                request.body(testCase.getBody());
            }

            // Execute request
            Response response;
            switch (testCase.getMethod().toUpperCase()) {
                case "GET":
                    response = request.get(url);
                    break;
                case "POST":
                    response = request.post(url);
                    break;
                case "PUT":
                    response = request.put(url);
                    break;
                case "DELETE":
                    response = request.delete(url);
                    break;
                case "PATCH":
                    response = request.patch(url);
                    break;
                case "HEAD":
                    response = request.head(url);
                    break;
                case "OPTIONS":
                    response = request.options(url);
                    break;
                default:
                    throw new IllegalArgumentException("Unsupported HTTP method: " + testCase.getMethod());
            }

            // Calculate duration
            long endTime = System.currentTimeMillis();
            long duration = endTime - startTime;

            // Validate response
            boolean statusMatch = response.getStatusCode() == testCase.getExpectedStatus();
            List<String> validationErrors = validateResponse(response, testCase);

            // Create headers map from response
            Map<String, String> responseHeaders = new HashMap<>();
            response.getHeaders().forEach(h -> responseHeaders.put(h.getName(), h.getValue()));

            // Determine test status
            String status = (statusMatch && validationErrors.isEmpty()) ? "passed" : "failed";

            // Create and save test result
            TestResult result = TestResult.builder()
                    .testRunId(testRun.getId())
                    .testCaseId(testCase.getId())
                    .status(status)
                    .duration(duration)
                    .requestUrl(url)
                    .requestMethod(testCase.getMethod())
                    .requestHeaders(allHeaders)
                    .requestBody(testCase.getBody())
                    .responseStatus(response.getStatusCode())
                    .responseHeaders(responseHeaders)
                    .responseBody(response.getBody().asString())
                    .validationErrors(validationErrors)
                    .build();

            return testResultRepository.save(result);

        } catch (Exception e) {
            log.error("Error executing test case {}: {}", testCase.getId(), e.getMessage());

            // Create error result
            TestResult errorResult = createErrorTestResult(testCase.getId(), testRun.getId(), e.getMessage());
            return testResultRepository.save(errorResult);
        }
    }

    /**
     * Validate response against test case expectations
     *
     * @param response API response
     * @param testCase Test case with validation rules
     * @return List of validation errors (empty if all pass)
     */
    private List<String> validateResponse(Response response, TestCase testCase) {
        List<String> errors = new ArrayList<>();

        try {
            // Check status code
            if (response.getStatusCode() != testCase.getExpectedStatus()) {
                errors.add("Expected status code " + testCase.getExpectedStatus() +
                        " but got " + response.getStatusCode());
            }

            // Skip validation if there are no validation rules
            if (testCase.getValidation() == null || testCase.getValidation().isEmpty()) {
                return errors;
            }

            // Process validation rules
            for (String rule : testCase.getValidation()) {
                try {
                    if (rule.contains("has property") || rule.contains("contains field")) {
                        // Check if response has a property
                        String propertyName = extractPropertyName(rule, "property|field");
                        if (propertyName != null && !response.jsonPath().get(propertyName).toString().isEmpty()) {
                            // Property exists
                        } else {
                            errors.add("Validation failed: " + rule);
                        }
                    } else if (rule.contains("is number") || rule.contains("is integer")) {
                        // Check if property is a number
                        String propertyName = extractPropertyName(rule, "(\\w+)\\s+is number|(\\w+)\\s+is integer");
                        if (propertyName != null) {
                            Object value = response.jsonPath().get(propertyName);
                            if (!(value instanceof Number)) {
                                errors.add("Validation failed: " + rule);
                            }
                        }
                    }
                    // Add more validation rule types as needed
                } catch (Exception e) {
                    errors.add("Validation error for rule '" + rule + "': " + e.getMessage());
                }
            }

            // Validate expected response if provided
            if (testCase.getExpectedResponse() != null) {
                // Simple comparison (could be enhanced with more sophisticated comparison)
                Map<String, Object> expectedResponse = (Map<String, Object>) testCase.getExpectedResponse();
                for (Map.Entry<String, Object> entry : expectedResponse.entrySet()) {
                    String key = entry.getKey();
                    Object expected = entry.getValue();
                    Object actual = response.jsonPath().get(key);

                    if (actual == null || !actual.toString().equals(expected.toString())) {
                        errors.add("Expected response." + key + " to be " + expected +
                                " but got " + (actual == null ? "null" : actual));
                    }
                }
            }
        } catch (Exception e) {
            errors.add("Error during validation: " + e.getMessage());
        }

        return errors;
    }

    /**
     * Extract property name from validation rule
     *
     * @param rule    Validation rule
     * @param pattern Regex pattern to match
     * @return Extracted property name or null
     */
    private String extractPropertyName(String rule, String pattern) {
        // Simple regex matching (could be enhanced with proper regex)
        if (rule.matches(".*" + pattern + ".*")) {
            String[] parts = rule.split("\\s+");
            for (int i = 0; i < parts.length; i++) {
                if (parts[i].equals("property") || parts[i].equals("field") ||
                        parts[i].equals("is")) {
                    if (i + 1 < parts.length) {
                        return parts[i + 1].replaceAll("[^a-zA-Z0-9_]", "");
                    }
                }
            }
        }
        return null;
    }

    /**
     * Create an error test result
     *
     * @param testCaseId Test case ID
     * @param testRunId  Test run ID
     * @param errorMsg   Error message
     * @return Test result with error
     */
    private TestResult createErrorTestResult(String testCaseId, String testRunId, String errorMsg) {
        return TestResult.builder()
                .testRunId(testRunId)
                .testCaseId(testCaseId)
                .status("failed")
                .duration(0L)
                .error(errorMsg)
                .validationErrors(Collections.singletonList("Test execution error: " + errorMsg))
                .build();
    }

    /**
     * Get test run by ID
     *
     * @param testRunId Test run ID
     * @return Test run details
     */
    public TestRunResultDTO getTestRun(String testRunId) {
        TestRun testRun = testRunRepository.findById(testRunId)
                .orElseThrow(() -> new ResourceNotFoundException("Test run not found: " + testRunId));

        List<TestResult> results = testResultRepository.findByTestRunId(testRunId);

        return TestRunResultDTO.builder()
                .id(testRun.getId())
                .testSuiteId(testRun.getTestSuiteId())
                .status(testRun.getStatus())
                .startTime(testRun.getStartTime())
                .endTime(testRun.getEndTime())
                .environment(testRun.getEnvironment())
                .baseUrl(testRun.getBaseUrl())
                .summary(testRun.getSummary())
                .results(results)
                .build();
    }
}

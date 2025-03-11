package com.trithabotx.apiagent.controller;

import com.trithabotx.apiagent.dto.ApiSpecDTO;
import com.trithabotx.apiagent.dto.ReportDTO;
import com.trithabotx.apiagent.dto.ReportListItemDTO;
import com.trithabotx.apiagent.dto.TestCaseDTO;
import com.trithabotx.apiagent.dto.TestRunConfigDTO;
import com.trithabotx.apiagent.dto.TestRunDTO;
import com.trithabotx.apiagent.dto.TestRunResultDTO;
import com.trithabotx.apiagent.dto.TestSuiteDTO;
import com.trithabotx.apiagent.service.ReportService;
import com.trithabotx.apiagent.service.TestCaseGeneratorService;
import com.trithabotx.apiagent.service.TestRunnerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("api/v1")
@RequiredArgsConstructor
@Slf4j
public class ApiTestController {

    private final TestCaseGeneratorService testCaseGeneratorService;
    private final TestRunnerService testRunnerService;
    private final ReportService reportService;

    @Tag(name = "Test Cases")
    @Operation(summary = "Generate test cases from API specification")
    @PostMapping("/test-cases/generate")
    public ResponseEntity<TestSuiteDTO> generateTestCases(@RequestBody ApiSpecDTO apiSpec) {
        log.info("Received request to generate test cases");
        System.out.println(apiSpec);
        TestSuiteDTO testSuite = testCaseGeneratorService.generateTestCases(apiSpec.getContent());
        return ResponseEntity.status(HttpStatus.CREATED).body(testSuite);
    }

    @Tag(name = "Test Cases")
    @Operation(summary = "Get test suite by ID")
    @GetMapping("/test-suites/{testSuiteId}")
    public ResponseEntity<TestSuiteDTO> getTestSuite(@PathVariable String testSuiteId) {
        log.info("Received request to get test suite: {}", testSuiteId);
        TestSuiteDTO testSuite = testCaseGeneratorService.getTestSuite(testSuiteId);
        return ResponseEntity.ok(testSuite);
    }

    @Tag(name = "Test Cases")
    @Operation(summary = "Update test case by ID")
    @PutMapping("/test-cases/{testCaseId}")
    public ResponseEntity<TestCaseDTO> updateTestCase(
            @PathVariable String testCaseId,
            @RequestBody Map<String, Object> updates) {
        log.info("Received request to update test case: {}", testCaseId);
        TestCaseDTO updatedTestCase = testCaseGeneratorService.updateTestCase(testCaseId, updates);
        return ResponseEntity.ok(updatedTestCase);
    }

    @Tag(name = "Test Cases")
    @Operation(summary = "Delete test case by ID")
    @DeleteMapping("/test-cases/{testCaseId}")
    public ResponseEntity<Void> deleteTestCase(@PathVariable String testCaseId) {
        log.info("Received request to delete test case: {}", testCaseId);
        testCaseGeneratorService.deleteTestCase(testCaseId);
        return ResponseEntity.noContent().build();
    }

    @Tag(name = "Test Runner")
    @Operation(summary = "Run a test suite")
    @PostMapping("/test-suites/{testSuiteId}/run")
    public ResponseEntity<TestRunDTO> runTestSuite(
            @PathVariable String testSuiteId,
            @Valid @RequestBody TestRunConfigDTO config) {
        log.info("Received request to run test suite: {}", testSuiteId);
        TestRunDTO testRun = testRunnerService.runTestSuite(testSuiteId, config);
        return ResponseEntity.accepted().body(testRun);
    }

    @Tag(name = "Test Runner")
    @Operation(summary = "Get test run results")
    @GetMapping("/test-runs/{testRunId}")
    public ResponseEntity<TestRunResultDTO> getTestRun(@PathVariable String testRunId) {
        log.info("Received request to get test run: {}", testRunId);
        TestRunResultDTO testRunResult = testRunnerService.getTestRun(testRunId);
        return ResponseEntity.ok(testRunResult);
    }

    @Tag(name = "Reports")
    @Operation(summary = "Generate report for test run")
    @GetMapping("/reports/{testRunId}")
    public ResponseEntity<ReportDTO> generateReport(@PathVariable String testRunId) {
        log.info("Received request to generate report for test run: {}", testRunId);
        ReportDTO report = reportService.generateReport(testRunId);
        return ResponseEntity.ok(report);
    }

    @Tag(name = "Reports")
    @Operation(summary = "Get list of reports")
    @GetMapping("/reports")
    public ResponseEntity<Page<ReportListItemDTO>> getReportList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("Received request to get report list, page: {}, size: {}", page, size);
        Page<ReportListItemDTO> reports = reportService.getReportList(page, size);
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/")
    public String checkHealth(){
        return "Hello";
    }
}

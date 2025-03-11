package com.trithabotx.apiagent.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.trithabotx.apiagent.dto.TestCaseDTO;
import com.trithabotx.apiagent.dto.TestSuiteDTO;
import com.trithabotx.apiagent.exception.ResourceNotFoundException;
import com.trithabotx.apiagent.model.TestCase;
import com.trithabotx.apiagent.model.TestSuite;
import com.trithabotx.apiagent.repository.TestCaseRepository;
import com.trithabotx.apiagent.repository.TestSuiteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TestCaseGeneratorService {

    private final OllamaService ollamaService;
    private final TestSuiteRepository testSuiteRepository;
    private final TestCaseRepository testCaseRepository;
    private final ObjectMapper objectMapper;

    /**
     * Generate test cases from an API specification
     *
     * @param apiSpec API specification
     * @return Generated test suite with test cases
     */
    @Transactional
    public TestSuiteDTO generateTestCases(String apiSpec) {
        log.info("Generating test cases from API specification");

        try {
            // Generate test cases using Ollama
            String ollamaResponse = ollamaService.generateTestCases(apiSpec);
            System.out.println(ollamaResponse);
            String jsonResponse = ollamaService.parseJsonResponse(ollamaResponse);

            // Parse the response
            JsonNode rootNode = objectMapper.readTree(jsonResponse);
            JsonNode testSuiteNode = rootNode.path("testSuite");

            if (testSuiteNode.isMissingNode()) {
                throw new IllegalArgumentException("Invalid response format: 'testSuite' not found");
            }

            // Create test suite
            String suiteName = testSuiteNode.path("name").asText("API Test Suite");
            TestSuite testSuite = TestSuite.builder()
                    .name(suiteName)
                    .apiSpec(apiSpec)
                    .build();

            testSuite = testSuiteRepository.save(testSuite);
            final String testSuiteId = testSuite.getId();

            // Process test cases
            List<TestCase> testCases = new ArrayList<>();
            JsonNode testCasesNode = testSuiteNode.path("testCases");

            if (testCasesNode.isArray()) {
                for (JsonNode testCaseNode : testCasesNode) {
                    TestCase testCase = processTestCase(testCaseNode, testSuiteId);
                    testCases.add(testCase);
                }
            }

            // Save test cases
            List<TestCase> savedTestCases = testCaseRepository.saveAll(testCases);

            // Update test suite with test case IDs
            List<String> testCaseIds = savedTestCases.stream()
                    .map(TestCase::getId)
                    .collect(Collectors.toList());

            testSuite.setTestCaseIds(testCaseIds);
            testSuiteRepository.save(testSuite);

            // Map to DTO
            List<TestCaseDTO> testCaseDTOs = savedTestCases.stream()
                    .map(this::mapToTestCaseDTO)
                    .collect(Collectors.toList());

            return TestSuiteDTO.builder()
                    .id(testSuite.getId())
                    .name(testSuite.getName())
                    .testCasesCount(testCaseDTOs.size())
                    .testCases(testCaseDTOs)
                    .build();

        } catch (JsonProcessingException e) {
            log.error("Failed to parse test case JSON", e);
            throw new IllegalArgumentException("Invalid JSON format in test case generation response");
        } catch (Exception e) {
            log.error("Error generating test cases", e);
            throw new RuntimeException("Failed to generate test cases: " + e.getMessage());
        }
    }

    /**
     * Get a test suite by ID
     *
     * @param testSuiteId Test suite ID
     * @return Test suite with test cases
     */
    public TestSuiteDTO getTestSuite(String testSuiteId) {
        TestSuite testSuite = testSuiteRepository.findById(testSuiteId)
                .orElseThrow(() -> new ResourceNotFoundException("Test suite not found: " + testSuiteId));

        List<TestCase> testCases = testCaseRepository.findByTestSuiteId(testSuiteId);

        List<TestCaseDTO> testCaseDTOs = testCases.stream()
                .map(this::mapToTestCaseDTO)
                .collect(Collectors.toList());

        return TestSuiteDTO.builder()
                .id(testSuite.getId())
                .name(testSuite.getName())
                .apiSpec(testSuite.getApiSpec())
                .createdAt(testSuite.getCreatedAt())
                .testCasesCount(testCaseDTOs.size())
                .testCases(testCaseDTOs)
                .build();
    }

    /**
     * Update a test case
     *
     * @param testCaseId Test case ID
     * @param updates    Updates to apply
     * @return Updated test case
     */
    @Transactional
    public TestCaseDTO updateTestCase(String testCaseId, Map<String, Object> updates) {
        TestCase testCase = testCaseRepository.findById(testCaseId)
                .orElseThrow(() -> new ResourceNotFoundException("Test case not found: " + testCaseId));

        // Apply updates
        if (updates.containsKey("name")) {
            testCase.setName((String) updates.get("name"));
        }

        if (updates.containsKey("method")) {
            testCase.setMethod((String) updates.get("method"));
        }

        if (updates.containsKey("endpoint")) {
            testCase.setEndpoint((String) updates.get("endpoint"));
        }

        if (updates.containsKey("headers")) {
            testCase.setHeaders((Map<String, String>) updates.get("headers"));
        }

        if (updates.containsKey("body")) {
            testCase.setBody(updates.get("body"));
        }

        if (updates.containsKey("expectedStatus")) {
            Integer status = (Integer) updates.get("expectedStatus");
            testCase.setExpectedStatus(status);
        }

        if (updates.containsKey("expectedResponse")) {
            testCase.setExpectedResponse(updates.get("expectedResponse"));
        }

        if (updates.containsKey("validation")) {
            testCase.setValidation((List<String>) updates.get("validation"));
        }

        if (updates.containsKey("category")) {
            testCase.setCategory((String) updates.get("category"));
        }

        TestCase updatedTestCase = testCaseRepository.save(testCase);
        return mapToTestCaseDTO(updatedTestCase);
    }

    /**
     * Delete a test case
     *
     * @param testCaseId Test case ID
     */
    @Transactional
    public void deleteTestCase(String testCaseId) {
        TestCase testCase = testCaseRepository.findById(testCaseId)
                .orElseThrow(() -> new ResourceNotFoundException("Test case not found: " + testCaseId));

        // Remove reference from test suite
        TestSuite testSuite = testSuiteRepository.findById(testCase.getTestSuiteId())
                .orElseThrow(() -> new ResourceNotFoundException("Test suite not found: " + testCase.getTestSuiteId()));

        testSuite.getTestCaseIds().remove(testCaseId);
        testSuiteRepository.save(testSuite);

        // Delete test case
        testCaseRepository.deleteById(testCaseId);
    }

    /**
     * Process a test case node from JSON
     *
     * @param testCaseNode JSON node containing test case data
     * @param testSuiteId  Test suite ID
     * @return Test case entity
     */
    private TestCase processTestCase(JsonNode testCaseNode, String testSuiteId) throws JsonProcessingException {
        String name = testCaseNode.path("name").asText();
        String method = testCaseNode.path("method").asText();
        String endpoint = testCaseNode.path("endpoint").asText();
        int expectedStatus = testCaseNode.path("expectedStatus").asInt(200);
        String category = testCaseNode.path("category").asText("positive");

        // Convert JSON nodes to Java objects
        Map<String, String> headers = objectMapper.convertValue(
                testCaseNode.path("headers"),
                objectMapper.getTypeFactory().constructMapType(Map.class, String.class, String.class)
        );

        Object body = null;
        if (!testCaseNode.path("body").isMissingNode() && !testCaseNode.path("body").isNull()) {
            body = objectMapper.treeToValue(testCaseNode.path("body"), Object.class);
        }

        Object expectedResponse = null;
        if (!testCaseNode.path("expectedResponse").isMissingNode() && !testCaseNode.path("expectedResponse").isNull()) {
            expectedResponse = objectMapper.treeToValue(testCaseNode.path("expectedResponse"), Object.class);
        }

        List<String> validation = new ArrayList<>();
        JsonNode validationNode = testCaseNode.path("validation");
        if (validationNode.isArray()) {
            for (JsonNode valNode : validationNode) {
                validation.add(valNode.asText());
            }
        }

        return TestCase.builder()
                .testSuiteId(testSuiteId)
                .name(name)
                .method(method)
                .endpoint(endpoint)
                .headers(headers)
                .body(body)
                .expectedStatus(expectedStatus)
                .expectedResponse(expectedResponse)
                .validation(validation)
                .category(category)
                .build();
    }

    /**
     * Map TestCase entity to DTO
     *
     * @param testCase Test case entity
     * @return Test case DTO
     */
    private TestCaseDTO mapToTestCaseDTO(TestCase testCase) {
        return TestCaseDTO.builder()
                .id(testCase.getId())
                .testSuiteId(testCase.getTestSuiteId())
                .name(testCase.getName())
                .method(testCase.getMethod())
                .endpoint(testCase.getEndpoint())
                .headers(testCase.getHeaders())
                .body(testCase.getBody())
                .expectedStatus(testCase.getExpectedStatus())
                .expectedResponse(testCase.getExpectedResponse())
                .validation(testCase.getValidation())
                .category(testCase.getCategory())
                .createdAt(testCase.getCreatedAt())
                .updatedAt(testCase.getUpdatedAt())
                .build();
    }
}

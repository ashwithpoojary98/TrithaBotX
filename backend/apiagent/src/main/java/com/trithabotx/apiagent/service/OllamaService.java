package com.trithabotx.apiagent.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.trithabotx.apiagent.config.AppProperties;
import com.trithabotx.apiagent.dto.OllamaRequest;
import com.trithabotx.apiagent.dto.OllamaResponse;
import com.trithabotx.apiagent.exception.OllamaException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class OllamaService {

    private final WebClient.Builder webClientBuilder;
    private final AppProperties appProperties;
    private final ObjectMapper objectMapper;

    /**
     * Generate test cases using Ollama LLM
     *
     * @param apiSpec API specification in JSON format
     * @return Generated test cases
     */
    public String generateTestCases(String apiSpec) {
        String prompt = createTestCasePrompt(apiSpec);
        return callOllamaApi(prompt);
    }

    /**
     * Generate test improvement suggestions based on test results
     *
     * @param testResults Test results data
     * @return Improvement suggestions
     */
    public String suggestTestImprovements(String testResults) {
        String prompt = createImprovementPrompt(testResults);
        return callOllamaApi(prompt);
    }

    /**
     * Call Ollama API with a prompt
     *
     * @param prompt Text prompt for the model
     * @return Model response
     */
    private String callOllamaApi(String prompt) {
        log.debug("Calling Ollama API with prompt length: {}", prompt.length());

        OllamaRequest request = new OllamaRequest();
        request.setModel(appProperties.getOllama().getModel());
        request.setPrompt(prompt);
        request.setStream(false);

        Map<String, Object> options = new HashMap<>();
        options.put("temperature", 0.7);
        options.put("top_p", 0.9);
        options.put("max_tokens", 2048);
        request.setOptions(options);

        try {
            OllamaResponse response = webClientBuilder.build()
                    .post()
                    .uri(appProperties.getOllama().getUrl() + "/generate")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(OllamaResponse.class)
                    .timeout(Duration.ofMillis(appProperties.getOllama().getTimeout()* 2L))
                    .onErrorResume(e -> {
                        log.error("Error calling Ollama API: {}", e.getMessage());
                        return Mono.error(new OllamaException("Failed to communicate with Ollama: " + e.getMessage()));
                    })
                    .block();

            if (response == null || response.getResponse() == null) {
                throw new OllamaException("Empty response from Ollama API");
            }

            log.debug("Received response from Ollama with length: {}", response.getResponse().length());
            return response.getResponse();

        } catch (Exception e) {
            log.error("Exception when calling Ollama API", e);
            throw new OllamaException("Failed to generate content with Ollama: " + e.getMessage());
        }
    }

    /**
     * Create a prompt for test case generation
     *
     * @param apiSpec API specification in JSON format
     * @return Formatted prompt
     */
    private String createTestCasePrompt(String apiSpec) {
        return String.format("""
            You are an API testing expert. Given the following API specification, generate comprehensive test cases in JSON format.
            Include positive tests, negative tests, edge cases, and security tests.
            
            API SPECIFICATION:
            %s
            
            For each endpoint, provide test cases with:
            1. Test name
            2. HTTP method
            3. Endpoint
            4. Request headers
            5. Request body (if applicable)
            6. Expected response status code
            7. Expected response body validation rules
            8. Test category (positive, negative, edge, security)
            
            Format your response as valid JSON with the following structure:
            {
              "testSuite": {
                "name": "API Test Suite for [API Name]",
                "testCases": [
                  {
                    "name": "Test case name",
                    "method": "GET/POST/PUT/DELETE",
                    "endpoint": "/path",
                    "headers": {},
                    "body": {},
                    "expectedStatus": 200,
                    "expectedResponse": {},
                    "validation": ["Check response has property x", "Verify value y is number"],
                    "category": "positive/negative/edge/security"
                  }
                ]
              }
            }
            
            Return ONLY the JSON without any explanation or markdown.
            """, apiSpec);
    }

    /**
     * Create a prompt for test improvement suggestions
     *
     * @param testResults Test results data
     * @return Formatted prompt
     */
    private String createImprovementPrompt(String testResults) {
        return String.format("""
            You are an API testing expert. Given the following test results, suggest improvements to the test suite.
            Focus on enhancing coverage, finding edge cases, and improving test reliability.
            
            TEST RESULTS:
            %s
            
            Provide your suggestions in a clear, actionable format.
            """, testResults);
    }

    /**
     * Parse JSON response from LLM
     *
     * @param response Raw response from LLM
     * @return Parsed JSON string
     */
    public String parseJsonResponse(String response) {
        try {
            // Try to find JSON content in the response
            int startIdx = response.indexOf('{');
            int endIdx = response.lastIndexOf('}');

            if (startIdx >= 0 && endIdx > startIdx) {
                String jsonContent = response.substring(startIdx, endIdx + 1);

                // Validate that it's proper JSON by parsing it
                objectMapper.readTree(jsonContent);

                return jsonContent;
            }

            // If we can't find JSON formatting, return the raw response
            return response;
        } catch (JsonProcessingException e) {
            log.warn("Could not parse JSON from LLM response: {}", e.getMessage());
            return response;
        }
    }
}

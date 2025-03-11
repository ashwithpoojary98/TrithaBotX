package com.trithabotx.apiagent.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app")
@Data
public class AppProperties {

    private Ollama ollama = new Ollama();
    private Cors cors = new Cors();
    private TestRunner testRunner = new TestRunner();

    @Data
    public static class Ollama {
        private String url = "http://localhost:11434/api";
        private String model = "deepseek-r1:1.5b";
        private int timeout = 120000;
    }

    @Data
    public static class Cors {
        private String[] allowedOrigins = {"http://localhost:3000"};
        private String[] allowedMethods = {"GET", "POST", "PUT", "DELETE", "OPTIONS"};
        private String allowedHeaders = "*";
    }

    @Data
    public static class TestRunner {
        private int defaultTimeout = 30000;
        private int maxConcurrency = 10;
    }
}

{%- if values.language == 'java' and values.framework == 'spring-boot' %}
package com.company.{{ values.component_id | replace("-", "") }};

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}

@RestController
class HealthController {

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "{{ values.component_id }}");
        response.put("timestamp", System.currentTimeMillis());
        return response;
    }

    @GetMapping("/ready")
    public Map<String, Object> ready() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("ready", true);
        return response;
    }

    @GetMapping("/")
    public Map<String, String> root() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Welcome to {{ values.component_id }}");
        response.put("description", "{{ values.description }}");
        response.put("version", "1.0.0");
        return response;
    }
}
{%- endif %}

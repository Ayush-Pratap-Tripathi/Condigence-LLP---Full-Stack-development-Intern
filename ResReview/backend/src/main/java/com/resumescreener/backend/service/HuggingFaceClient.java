package com.resumescreener.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Component
public class HuggingFaceClient {

    @Value("${huggingface.api.key}")
    private String hfApiKey;

    // keep this as model URL, NOT pipeline URL
    @Value("${huggingface.api.url}")
    private String hfApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Calls Hugging Face Inference API for feature extraction embeddings.
     */
    public double[] getEmbedding(String text) {
        if (text == null || text.trim().isEmpty()) return new double[0];

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(hfApiKey);

        // 👇 Explicitly specify "feature-extraction" task
        Map<String, Object> body = Map.of(
                "inputs", text,
                "task", "feature-extraction",
                "options", Map.of("wait_for_model", true)
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Object> response = restTemplate.exchange(
                    hfApiUrl,
                    HttpMethod.POST,
                    entity,
                    Object.class
            );

            if (response.getStatusCode() != HttpStatus.OK) {
                System.err.println("⚠️ HF API returned status: " + response.getStatusCode());
                return new double[0];
            }

            Object respBody = response.getBody();
            if (respBody instanceof List) {
                List<?> outer = (List<?>) respBody;
                Object first = outer.get(0);
                if (first instanceof List) {
                    return toDoubleArray((List<?>) first);
                } else if (first instanceof Number) {
                    return toDoubleArray(outer);
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        System.err.println("⚠️ No embedding returned for text: " + text.substring(0, Math.min(60, text.length())));
        return new double[0];
    }

    private double[] toDoubleArray(List<?> list) {
        double[] arr = new double[list.size()];
        for (int i = 0; i < list.size(); i++) {
            Object o = list.get(i);
            if (o instanceof Number) {
                arr[i] = ((Number) o).doubleValue();
            } else {
                try {
                    arr[i] = Double.parseDouble(o.toString());
                } catch (Exception ex) {
                    arr[i] = 0.0;
                }
            }
        }
        return arr;
    }
}

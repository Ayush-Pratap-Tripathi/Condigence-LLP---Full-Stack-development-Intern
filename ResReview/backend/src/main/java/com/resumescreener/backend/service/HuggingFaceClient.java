package com.resumescreener.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.core.ParameterizedTypeReference;

import java.util.List;
import java.util.Map;
import java.util.Collections;

@Component
public class HuggingFaceClient {

    @Value("${huggingface.api.key}")
    private String hfApiKey;

    @Value("${huggingface.api.url}")
    private String hfApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Calls Hugging Face Inference API for text similarity between job description
     * and resume.
     */
    public double getSimilarityScore(String jobDescription, String resumeText) {
        if (jobDescription == null || resumeText == null)
            return 0.0;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        headers.setBearerAuth(hfApiKey);

        // ✅ Send both jobDescription and resumeText properly formatted
        Map<String, Object> body = Map.of(
                "inputs", Map.of(
                        "source_sentence", jobDescription,
                        "sentences", List.of(resumeText)
                ),
                "options", Map.of("wait_for_model", true)
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            // ✅ Expect a list of doubles in response (not list of maps)
            ResponseEntity<List<Double>> response = restTemplate.exchange(
                    hfApiUrl,
                    HttpMethod.POST,
                    entity,
                    new ParameterizedTypeReference<List<Double>>() {}
            );

            if (response.getStatusCode() != HttpStatus.OK) {
                System.err.println("⚠️ HF API returned status: " + response.getStatusCode());
                System.err.println("Response body: " + response.getBody());
                return 0.0;
            }

            List<Double> responseBody = response.getBody();
            if (responseBody != null && !responseBody.isEmpty()) {
                // ✅ The first element is the similarity score
                return responseBody.get(0);
            }

        } catch (org.springframework.web.client.HttpClientErrorException httpEx) {
            System.err.println("⚠️ HF HTTP error: " + httpEx.getStatusCode());
            System.err.println("HF response body: " + httpEx.getResponseBodyAsString());
        } catch (Exception e) {
            e.printStackTrace();
        }

        System.err.println("⚠️ No similarity score returned for inputs.");
        return 0.0;
    }
}

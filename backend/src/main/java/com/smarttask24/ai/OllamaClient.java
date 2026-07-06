package com.smarttask24.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Component
public class OllamaClient {
    private static final String GEMINI_API_URL = "https://api-rebix.vercel.app/api/gemini?q={query}";
    private static final int MAX_PROMPT_LENGTH = 4000;
    private static final int MAX_RETRIES = 2;
    private static final long RETRY_DELAY_MS = 1000;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public OllamaClient() {
        var factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(15000);
        factory.setReadTimeout(60000);
        this.restTemplate = new RestTemplate(factory);
        this.objectMapper = new ObjectMapper();
    }

    public String chat(String prompt) {
        String safePrompt = prompt;
        if (safePrompt.length() > MAX_PROMPT_LENGTH) {
            safePrompt = safePrompt.substring(0, MAX_PROMPT_LENGTH) + "...";
        }

        for (int attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                String encoded = java.net.URLEncoder.encode(safePrompt, "UTF-8");
                String url = GEMINI_API_URL.replace("{query}", encoded);

                log.info("Gemini API call attempt {}/{} length={}", attempt + 1, MAX_RETRIES + 1, safePrompt.length());
                String response = restTemplate.getForObject(url, String.class);

                if (response != null) {
                    String parsed = parseResponse(response);
                    if (parsed != null && !parsed.isEmpty()) {
                        log.info("Gemini response ({} chars): {}", parsed.length(), parsed.substring(0, Math.min(parsed.length(), 150)));
                        return parsed;
                    }
                }

                if (attempt < MAX_RETRIES) {
                    log.warn("Empty/invalid Gemini response, retrying in {}ms", RETRY_DELAY_MS);
                    Thread.sleep(RETRY_DELAY_MS);
                }
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                break;
            } catch (Exception e) {
                log.error("Gemini API error (attempt {}/{}): {}", attempt + 1, MAX_RETRIES + 1, e.getMessage());
                if (attempt < MAX_RETRIES) {
                    try { Thread.sleep(RETRY_DELAY_MS); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); break; }
                }
            }
        }
        return "I'm having a temporary connection issue. Please try again in a moment.";
    }

    private String parseResponse(String raw) throws Exception {
        JsonNode json = objectMapper.readTree(raw);

        if (json.has("message")) return json.get("message").asText();
        if (json.has("response")) return json.get("response").asText();
        if (json.has("content")) return json.get("content").asText();
        if (json.has("reply")) return json.get("reply").asText();
        if (json.has("answer")) return json.get("answer").asText();
        if (json.has("text")) return json.get("text").asText();
        if (json.isTextual()) return json.asText();

        if (json.has("status")) {
            int status = json.get("status").asInt();
            if (status != 200) {
                log.warn("Gemini returned non-200 status: {}", status);
                return null;
            }
        }

        log.warn("Unknown Gemini response format: {}", raw.substring(0, Math.min(raw.length(), 200)));
        return raw;
    }
}

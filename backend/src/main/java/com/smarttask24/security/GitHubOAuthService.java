package com.smarttask24.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smarttask24.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Component
public class GitHubOAuthService {

    private static final String GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
    private static final String GITHUB_USER_URL = "https://api.github.com/user";

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.github.client-id:}")
    private String clientId;

    @Value("${app.github.client-secret:}")
    private String clientSecret;

    public GitHubUser exchangeCodeForUser(String code, String redirectUri) {
        String accessToken = exchangeCodeForAccessToken(code, redirectUri);
        return fetchGitHubUser(accessToken);
    }

    private String exchangeCodeForAccessToken(String code, String redirectUri) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.setAccept(java.util.List.of(MediaType.APPLICATION_JSON));

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);
        body.add("code", code);
        if (redirectUri != null && !redirectUri.isBlank()) {
            body.add("redirect_uri", redirectUri);
        }

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(GITHUB_TOKEN_URL, request, String.class);
            JsonNode json = objectMapper.readTree(response.getBody());

            if (json.has("error")) {
                String errorDesc = json.path("error_description").asText(json.path("error").asText());
                log.warn("GitHub token exchange failed: {}", errorDesc);
                throw new BadRequestException("GitHub authentication failed: " + errorDesc);
            }

            String accessToken = json.path("access_token").asText("");
            if (accessToken.isBlank()) {
                throw new BadRequestException("No access token received from GitHub");
            }
            return accessToken;
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.error("GitHub token exchange error: {}", e.getMessage());
            throw new BadRequestException("Failed to exchange GitHub authorization code");
        }
    }

    private GitHubUser fetchGitHubUser(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setAccept(java.util.List.of(MediaType.APPLICATION_JSON));

        HttpEntity<Void> request = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    GITHUB_USER_URL, HttpMethod.GET, request, String.class);
            JsonNode json = objectMapper.readTree(response.getBody());

            String email = json.path("email").asText("");
            if (email.isBlank() || "null".equals(email)) {
                email = fetchPrimaryEmail(accessToken);
            }

            String name = json.path("name").asText("");
            if (name.isBlank() || "null".equals(name)) {
                name = json.path("login").asText("GitHub User");
            }

            String avatar = json.path("avatar_url").asText(null);
            if ("null".equals(avatar)) avatar = null;

            if (email.isBlank()) {
                throw new BadRequestException("Could not retrieve email from GitHub account");
            }

            return new GitHubUser(email, name, avatar);
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to fetch GitHub user: {}", e.getMessage());
            throw new BadRequestException("Failed to fetch user information from GitHub");
        }
    }

    private String fetchPrimaryEmail(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setAccept(java.util.List.of(MediaType.APPLICATION_JSON));

        HttpEntity<Void> request = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    "https://api.github.com/user/emails", HttpMethod.GET, request, String.class);
            JsonNode emails = objectMapper.readTree(response.getBody());

            if (emails.isArray()) {
                for (JsonNode emailNode : emails) {
                    if (emailNode.path("primary").asBoolean(false)
                            && emailNode.path("verified").asBoolean(false)) {
                        return emailNode.path("email").asText("");
                    }
                }
                for (JsonNode emailNode : emails) {
                    if (emailNode.path("verified").asBoolean(false)) {
                        return emailNode.path("email").asText("");
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed to fetch GitHub user emails: {}", e.getMessage());
        }
        return "";
    }

    public record GitHubUser(String email, String name, String avatar) {}
}

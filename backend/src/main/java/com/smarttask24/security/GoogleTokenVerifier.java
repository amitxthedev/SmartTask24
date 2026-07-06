package com.smarttask24.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smarttask24.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

/**
 * Verifies Google Sign-In ID tokens (the "credential" produced by Google Identity
 * Services on the frontend). Rather than trusting a client-supplied email, the raw
 * ID token is validated against Google's tokeninfo endpoint, which checks the
 * signature and expiry. We additionally enforce the issuer, audience (our client id)
 * and that the email has been verified by Google.
 */
@Slf4j
@Component
public class GoogleTokenVerifier {

    private static final String TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo?id_token=";
    private static final String ISS = "accounts.google.com";
    private static final String ISS_HTTPS = "https://accounts.google.com";

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.google.client-id:}")
    private String clientId;

    public GoogleUser verify(String credential) {
        if (credential == null || credential.isBlank()) {
            throw new BadRequestException("Missing Google credential");
        }

        JsonNode claims;
        try {
            String body = restTemplate.getForObject(TOKENINFO_URL + credential, String.class);
            claims = objectMapper.readTree(body);
        } catch (Exception e) {
            log.warn("Google token verification failed: {}", e.getMessage());
            throw new BadRequestException("Invalid or expired Google credential");
        }

        String iss = claims.path("iss").asText("");
        if (!ISS.equals(iss) && !ISS_HTTPS.equals(iss)) {
            throw new BadRequestException("Invalid token issuer");
        }

        String aud = claims.path("aud").asText("");
        if (clientId != null && !clientId.isBlank() && !clientId.equals(aud)) {
            log.warn("Google token audience mismatch: expected client id, got {}", aud);
            throw new BadRequestException("Token was not issued for this application");
        }

        boolean emailVerified = claims.path("email_verified").asBoolean(false)
                || "true".equalsIgnoreCase(claims.path("email_verified").asText(""));
        String email = claims.path("email").asText("");
        if (email.isBlank() || !emailVerified) {
            throw new BadRequestException("Google account email is not verified");
        }

        String picture = claims.path("picture").isMissingNode() ? null : claims.path("picture").asText(null);
        return new GoogleUser(email, claims.path("name").asText(email), picture);
    }

    public record GoogleUser(String email, String name, String picture) {}
}

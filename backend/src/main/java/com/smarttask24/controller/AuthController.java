package com.smarttask24.controller;

import com.smarttask24.dto.response.ApiResponse;
import com.smarttask24.dto.response.AuthResponse;
import com.smarttask24.dto.response.UserResponse;
import com.smarttask24.security.GitHubOAuthService;
import com.smarttask24.security.GoogleTokenVerifier;
import com.smarttask24.security.JwtTokenProvider;
import com.smarttask24.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;
    private final GoogleTokenVerifier googleTokenVerifier;
    private final GitHubOAuthService gitHubOAuthService;

    @GetMapping("/google/url")
    public ResponseEntity<ApiResponse> getGoogleAuthUrl() {
        String redirectUri = "http://localhost:8080/api/auth/google/callback";
        String authUrl = "https://accounts.google.com/o/oauth2/v2/auth" +
                "?client_id=${GOOGLE_CLIENT_ID}" +
                "&redirect_uri=" + redirectUri +
                "&response_type=code" +
                "&scope=email%20profile" +
                "&access_type=online";
        return ResponseEntity.ok(ApiResponse.success("Google auth URL",
                java.util.Map.of("url", authUrl, "redirectUri", redirectUri)));
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse> googleAuth(@RequestBody java.util.Map<String, String> body) {
        GoogleTokenVerifier.GoogleUser googleUser = googleTokenVerifier.verify(body.get("credential"));
        AuthResponse response = authService.handleGoogleAuth(
                googleUser.email(), googleUser.name(), googleUser.picture());
        return ResponseEntity.ok(ApiResponse.success("Google auth successful", response));
    }

    @PostMapping("/github")
    public ResponseEntity<ApiResponse> githubAuth(@RequestBody java.util.Map<String, String> body) {
        String code = body.get("code");
        if (code == null || code.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Missing authorization code"));
        }
        GitHubOAuthService.GitHubUser gitHubUser = gitHubOAuthService.exchangeCodeForUser(code);
        AuthResponse response = authService.handleGoogleAuth(
                gitHubUser.email(), gitHubUser.name(), gitHubUser.avatar());
        return ResponseEntity.ok(ApiResponse.success("GitHub auth successful", response));
    }

    @GetMapping("/verify")
    public ResponseEntity<ApiResponse> verifyToken(@RequestParam String token) {
        AuthResponse response = authService.verifyToken(token);
        return ResponseEntity.ok(ApiResponse.success("Token verified", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse> getCurrentUser(@AuthenticationPrincipal User principal) {
        UserResponse user = authService.getCurrentUser(principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success("User profile", user));
    }
}

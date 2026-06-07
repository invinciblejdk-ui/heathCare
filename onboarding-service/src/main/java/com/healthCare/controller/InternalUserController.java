package com.healthCare.controller;

import com.healthCare.repository.UserTokenRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Internal endpoints used only by other microservices (e.g., notification-service).
 * These are permitted without JWT in SecurityConfig (/api/internal/**).
 *
 * In production, protect these with an internal API key or service-to-service JWT.
 */
@RestController
@RequestMapping("/api/internal")
public class InternalUserController {

    private final UserTokenRepository userTokenRepository;

    public InternalUserController(UserTokenRepository userTokenRepository) {
        this.userTokenRepository = userTokenRepository;
    }

    /**
     * Returns all FCM device tokens for a given userId.
     * Called by notification-service before sending push notifications.
     *
     * GET /api/internal/users/{userId}/fcm-tokens
     * Response: ["token1", "token2", ...]
     */
    @GetMapping("/users/{userId}/fcm-tokens")
    public ResponseEntity<List<String>> getFcmTokens(@PathVariable Long userId) {
        List<String> tokens = userTokenRepository
                .findAllByUserIdWithFcmToken(userId)
                .stream()
                .map(ut -> ut.getFcmToken())
                .filter(token -> token != null && !token.isBlank())
                .distinct()
                .collect(Collectors.toList());

        return ResponseEntity.ok(tokens);
    }
}

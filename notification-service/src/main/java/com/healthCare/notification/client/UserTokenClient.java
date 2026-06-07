package com.healthCare.notification.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Collections;
import java.util.List;

/**
 * HTTP client that calls the onboarding-service internal endpoint
 * to retrieve all FCM device tokens for a given userId.
 *
 * Uses WebClient (non-blocking, reactive) instead of RestTemplate (blocking).
 * The thread is released while waiting for the response — better under high load.
 *
 * Bridges back to blocking with .block() since the rest of this service
 * is servlet-based (not fully reactive). If you ever migrate to WebFlux fully,
 * change the return type to Mono<List<String>> and remove .block().
 */
@Component
public class UserTokenClient {

    private static final Logger log = LoggerFactory.getLogger(UserTokenClient.class);

    private final WebClient webClient;

    public UserTokenClient(WebClient.Builder webClientBuilder,
                           @Value("${onboarding-service.url}") String onboardingServiceUrl) {
        this.webClient = webClientBuilder
                .baseUrl(onboardingServiceUrl)
                .build();
    }

    /**
     * Fetch all active FCM tokens for the given userId from onboarding-service.
     *
     * Endpoint called: GET /api/internal/users/{userId}/fcm-tokens
     *
     * @param userId the user's ID
     * @return list of FCM token strings (empty list if user has no registered devices)
     */
    public List<String> getFcmTokensForUser(Long userId) {
        try {
            List<String> tokens = webClient.get()
                    .uri("/api/internal/users/{userId}/fcm-tokens", userId)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<String>>() {})
                    .block(); // bridge reactive → servlet world

            return tokens != null ? tokens : Collections.emptyList();

        } catch (Exception e) {
            log.warn("Could not fetch FCM tokens for userId={} from onboarding-service: {}", userId, e.getMessage());
            return Collections.emptyList();
        }
    }
}

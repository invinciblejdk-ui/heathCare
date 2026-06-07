package com.healthCare.controller;

import com.healthCare.dto.ApiResponse;
import com.healthCare.dto.FcmTokenRequest;
import com.healthCare.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * FCM device token registration controller.
 *
 * Follows the same pattern as AddressController — base path: /restful/v1/onboarding
 *
 * Called by the mobile app after login, once Firebase SDK has loaded
 * and the FCM device token is available.
 *
 * Route covered by existing gateway route: onboarding-restful → /restful/v1/onboarding/**
 * Security: requires JWT (authenticated user) — userId extracted from token
 */
@RestController
@RequestMapping("/restful/v1/onboarding")
public class FcmTokenController {

    private final AuthService authService;

    public FcmTokenController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Register or update the FCM device token for the logged-in user.
     *
     * POST /restful/v1/onboarding/registerFcmToken
     *
     * Headers:
     *   Authorization: Bearer <jwt>
     *
     * Request Body:
     * {
     *   "fcmToken": "c8Vj5...",      ← required
     *   "deviceType": "ANDROID"      ← optional (ANDROID | IOS | WEB), default ANDROID
     * }
     *
     * Response:
     * {
     *   "success": true,
     *   "message": "FCM token registered successfully"
     * }
     *
     * Flow:
     *   1. User logs in via POST /api/auth/verify → gets JWT
     *   2. Firebase SDK loads on device → returns FCM token
     *   3. App calls this endpoint with JWT + fcmToken
     *   4. userId extracted from JWT (never passed manually)
     *   5. FCM token saved in user_tokens table (fcm_token column)
     *   6. notification-service reads this token when sending push notifications
     */
    @PostMapping("/registerFcmToken")
    public ResponseEntity<ApiResponse<String>> registerFcmToken(
            @Valid @RequestBody FcmTokenRequest request,
            Authentication auth) {

        Long userId = (Long) auth.getDetails(); // extracted from JWT by JwtAuthFilter
        authService.registerFcmToken(userId, request.getFcmToken(), request.getDeviceType());
        return ResponseEntity.ok(ApiResponse.success("FCM token registered successfully", null));
    }
}

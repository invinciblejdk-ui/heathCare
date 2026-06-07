package com.healthCare.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FcmTokenRequest {

    @NotBlank(message = "FCM token is required")
    private String fcmToken;

    /**
     * Optional: ANDROID | IOS | WEB
     * Defaults to ANDROID if not provided.
     */
    private String deviceType;
}

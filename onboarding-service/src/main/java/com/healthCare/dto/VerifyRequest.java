package com.healthCare.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class VerifyRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "OTP is required")
    private String otp;

    /** Optional: Firebase FCM device token sent by the mobile/web app after login */
    private String fcmToken;

    /** Optional: ANDROID | IOS | WEB — defaults to ANDROID if not provided */
    private String deviceType;
}


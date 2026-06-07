package com.healthCare.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class MobileVerifyRequest {
    @NotBlank(message = "Mobile number is required")
    private String mobileNumber;

    @NotBlank(message = "OTP is required")
    private String otp;

    /** Optional: Firebase FCM device token sent by the mobile app after login */
    private String fcmToken;

    /** Optional: ANDROID | IOS | WEB — defaults to ANDROID if not provided */
    private String deviceType;
}

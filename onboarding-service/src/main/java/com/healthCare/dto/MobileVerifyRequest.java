package com.healthCare.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MobileVerifyRequest {
    @NotBlank(message = "Mobile number is required")
    private String mobileNumber;

    @NotBlank(message = "OTP is required")
    private String otp;
}

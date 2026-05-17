package com.healthCare.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MobileLoginRequest {
    @NotBlank(message = "Mobile number is required")
    private String mobileNumber;
}

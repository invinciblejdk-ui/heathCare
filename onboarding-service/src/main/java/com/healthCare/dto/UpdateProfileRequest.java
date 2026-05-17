package com.healthCare.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String fullName;
    private String shopName;
    private String mobileNumber;
}

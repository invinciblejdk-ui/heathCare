package com.healthCare.dto;

import lombok.Data;

@Data
public class UserProfileResponse {
    private Long id;
    private String email;
    private String mobileNumber;
    private String fullName;
    private String shopName;
    private String role;
}

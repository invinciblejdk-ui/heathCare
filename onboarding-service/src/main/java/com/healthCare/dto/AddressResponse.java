package com.healthCare.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AddressResponse {

    private Long id;
    private Long userId;
    private String fullName;
    private String mobileNumber;
    private String streetLine1;
    private String streetLine2;
    private String city;
    private String state;
    private String pincode;
    private String country;
    private String label;
    private boolean isDefault;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

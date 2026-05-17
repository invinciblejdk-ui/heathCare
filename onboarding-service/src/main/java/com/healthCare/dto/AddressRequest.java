package com.healthCare.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AddressRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Enter a valid 10-digit mobile number")
    private String mobileNumber;

    @NotBlank(message = "Street line 1 is required")
    private String streetLine1;

    private String streetLine2;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "State is required")
    private String state;

    @NotBlank(message = "Pincode is required")
    @Size(min = 6, max = 6, message = "Pincode must be 6 digits")
    @Pattern(regexp = "^[0-9]{6}$", message = "Pincode must contain only digits")
    private String pincode;

    @NotBlank(message = "Country is required")
    private String country;

    @NotBlank(message = "Label is required")
    @Pattern(regexp = "^(HOME|OFFICE|OTHER)$", message = "Label must be HOME, OFFICE, or OTHER")
    private String label;

    private boolean isDefault = false;
}

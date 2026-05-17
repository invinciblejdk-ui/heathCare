package com.healthCare.order.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PlaceOrderRequest {

    @NotNull(message = "Address ID is required")
    private Long addressId;

    private Long prescriptionId;  // required if any item needs prescription

    private String promoCode;     // optional
}

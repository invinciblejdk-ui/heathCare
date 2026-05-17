package com.healthCare.order.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class AddToCartRequest {

    @NotNull(message = "Medicine ID is required")
    private Long medicineId;

    private String medicineName;
    private String medicineImage;

    @NotNull(message = "Unit price is required")
    private BigDecimal unitPrice;

    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity = 1;
}

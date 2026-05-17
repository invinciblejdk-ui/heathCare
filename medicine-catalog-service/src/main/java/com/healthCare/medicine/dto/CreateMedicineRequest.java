package com.healthCare.medicine.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateMedicineRequest {

    @NotBlank(message = "Medicine name is required")
    private String name;

    private String brand;
    private String saltName;
    private String chemicalName;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be positive")
    private BigDecimal price;

    @Min(value = 0, message = "Stock cannot be negative")
    private Integer stockQuantity = 0;

    private String imageUrl;
    private String description;
    private String dosageForm;
    private String strength;
    private boolean requiresPrescription;
}

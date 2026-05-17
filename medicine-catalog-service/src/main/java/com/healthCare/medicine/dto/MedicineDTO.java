package com.healthCare.medicine.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class MedicineDTO {
    private Long id;
    private String name;
    private String brand;
    private String saltName;
    private String chemicalName;
    private String categoryName;
    private Long categoryId;
    private BigDecimal price;
    private Integer stockQuantity;
    private String imageUrl;
    private String description;
    private String dosageForm;
    private String strength;
    private boolean requiresPrescription;
    private boolean inStock;
}

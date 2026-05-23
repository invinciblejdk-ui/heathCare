package com.healthCare.medicine.dto;

import lombok.Data;

@Data
public class DeductStockRequest {
    private Long medicineId;
    private int quantity;
}

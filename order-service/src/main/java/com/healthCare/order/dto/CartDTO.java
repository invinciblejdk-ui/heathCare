package com.healthCare.order.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class CartDTO {
    private Long cartId;
    private Long userId;
    private List<CartItemDTO> items;
    private BigDecimal totalAmount;

    @Data
    public static class CartItemDTO {
        private Long id;
        private Long medicineId;
        private String medicineName;
        private String medicineImage;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;
    }
}

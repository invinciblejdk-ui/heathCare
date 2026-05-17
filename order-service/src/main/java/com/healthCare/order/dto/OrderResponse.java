package com.healthCare.order.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderResponse {
    private Long id;
    private String status;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private String promoCode;
    private Long addressId;
    private Long prescriptionId;
    private String paymentId;
    private List<OrderItemDTO> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Tracking timeline (list of status-change events)
    private List<TrackingEvent> trackingTimeline;

    @Data
    public static class OrderItemDTO {
        private Long medicineId;
        private String medicineName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
    }

    @Data
    public static class TrackingEvent {
        private String status;
        private String description;
        private LocalDateTime timestamp;
    }
}

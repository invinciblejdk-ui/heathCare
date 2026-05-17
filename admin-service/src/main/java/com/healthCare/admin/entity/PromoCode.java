package com.healthCare.admin.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "promo_codes")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class PromoCode {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiscountType discountType;

    @Column(precision = 10, scale = 2)
    private BigDecimal discountValue;  // % or flat amount

    private BigDecimal minOrderAmount;

    private LocalDate expiryDate;

    @Builder.Default
    private Integer usageLimit = 0;   // 0 = unlimited

    @Builder.Default
    private Integer usedCount = 0;

    @Builder.Default
    private boolean isActive = true;

    private LocalDateTime createdAt;

    @PrePersist protected void onCreate() { createdAt = LocalDateTime.now(); }

    public enum DiscountType { PERCENTAGE, FLAT }
}

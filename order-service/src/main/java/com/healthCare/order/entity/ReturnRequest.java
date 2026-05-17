package com.healthCare.order.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "return_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReturnRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long orderId;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ReturnStatus status = ReturnStatus.PENDING;

    private String adminNotes;

    private LocalDateTime requestedAt;
    private LocalDateTime resolvedAt;

    @PrePersist
    protected void onCreate() { requestedAt = LocalDateTime.now(); }

    public enum ReturnStatus {
        PENDING, APPROVED, REJECTED, COMPLETED
    }
}

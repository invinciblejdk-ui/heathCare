package com.healthCare.order.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "prescriptions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String filePath;   // local filesystem path

    @Column(nullable = false)
    private String fileType;   // image/jpeg, image/png, application/pdf

    private String originalFileName;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ValidationStatus validationStatus = ValidationStatus.PENDING;

    private String validationNotes;

    private LocalDateTime uploadedAt;

    @PrePersist
    protected void onCreate() { uploadedAt = LocalDateTime.now(); }

    public enum ValidationStatus {
        PENDING, APPROVED, REJECTED
    }
}

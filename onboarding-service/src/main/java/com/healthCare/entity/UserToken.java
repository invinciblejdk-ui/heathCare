package com.healthCare.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_tokens")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 1000)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDateTime expiryTime;

    /**
     * Firebase Cloud Messaging device registration token.
     * Sent by the mobile/web app after login and stored here
     * so the notification-service can push to the right device.
     * Nullable — desktop/web clients may not provide one.
     */
    @Column(name = "fcm_token", length = 512)
    private String fcmToken;

    /**
     * Type of device: ANDROID, IOS, WEB.
     * Defaults to ANDROID if not provided.
     */
    @Column(name = "device_type", length = 20)
    @Builder.Default
    private String deviceType = "ANDROID";

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}

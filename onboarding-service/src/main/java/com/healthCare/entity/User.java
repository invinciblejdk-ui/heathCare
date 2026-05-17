package com.healthCare.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String email;

    @Column(unique = true)
    private String mobileNumber;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private UserProfile userProfile;

    private String otp;

    private LocalDateTime otpExpiryTime;

    // No @Column(nullable=false) — let Hibernate add as nullable column so
    // existing rows don't cause ALTER TABLE failures. Default is enforced in Java.
    @Builder.Default
    private boolean isVerified = false;

    @Builder.Default
    @Column(columnDefinition = "boolean default true")
    private boolean isActive = true;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(columnDefinition = "varchar(255) default 'USER'")
    private UserRole role = UserRole.USER;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private LocalDateTime expiryTime;

    public enum UserRole {
        USER, ADMIN
    }
}

package com.healthCare.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "addresses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_address_user_profile",
                    foreignKeyDefinition = "FOREIGN KEY (user_id) REFERENCES onboarding_service.user_profiles(user_id) ON DELETE CASCADE"
            )
    )
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private UserProfile userProfile;

    @Column(nullable = false)
    private String streetLine1;

    private String streetLine2;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String state;

    @Column(nullable = false, length = 10)
    private String pincode;

    @Column(nullable = false)
    private String country;

    @Column(nullable = false)
    private String label; // HOME, OFFICE, OTHER

    @Column(nullable = false)
    private String fullName; // Recipient name

    @Column(nullable = false)
    private String mobileNumber; // Recipient phone

    @Builder.Default
    private boolean isDefault = false;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}

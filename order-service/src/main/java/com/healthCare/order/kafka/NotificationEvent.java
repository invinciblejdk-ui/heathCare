package com.healthCare.order.kafka;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Kafka event payload published to the "notification-events" topic.
 *
 * This is the same DTO used by notification-service as consumer.
 * In a larger project, you'd extract this to a shared Maven module.
 * For simplicity, we duplicate it here.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class NotificationEvent {

    /** ID of the user who should receive this notification */
    private Long userId;

    /** Short notification heading shown in push / email subject */
    private String title;

    /** Full notification body text */
    private String message;

    /**
     * Must match notification-service's Notification.NotificationType:
     * ORDER_UPDATE | DEAL | PRESCRIPTION_REMINDER | REFILL_ALERT | SYSTEM
     */
    private String type;

    /** Optional — if set, notification-service also sends an email */
    private String email;

    /**
     * Optional — direct FCM token (skip the onboarding-service lookup).
     * Leave null to let notification-service fetch all registered device tokens.
     */
    private String fcmToken;
}

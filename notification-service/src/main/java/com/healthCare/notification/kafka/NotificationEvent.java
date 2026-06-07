package com.healthCare.notification.kafka;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Shared payload published to the "notification-events" Kafka topic.
 *
 * Both producers (order-service, payment-service, etc.) and the consumer
 * (notification-service) use this same structure.
 *
 * Fields:
 *  - userId       → whose notification this is
 *  - title        → short heading (shown in push notification title)
 *  - message      → full body text
 *  - type         → ORDER_UPDATE | DEAL | PRESCRIPTION_REMINDER | REFILL_ALERT | SYSTEM
 *  - email        → optional; if provided, notification-service will also send an email
 *  - fcmToken     → optional; if provided directly (bypasses onboarding lookup)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class NotificationEvent {

    /** ID of the user who should receive this notification */
    private Long userId;

    /** Short heading, e.g. "Order Shipped! 🚀" */
    private String title;

    /** Full notification body */
    private String message;

    /**
     * Notification type — must match Notification.NotificationType enum:
     * ORDER_UPDATE | DEAL | PRESCRIPTION_REMINDER | REFILL_ALERT | SYSTEM
     */
    private String type;

    /** Optional — user's email for email delivery */
    private String email;

    /**
     * Optional — if provided, this specific FCM token is used directly.
     * If null, notification-service fetches all tokens for userId from onboarding-service.
     */
    private String fcmToken;
}

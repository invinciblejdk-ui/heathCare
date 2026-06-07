package com.healthCare.notification.kafka;

import com.healthCare.notification.entity.Notification;
import com.healthCare.notification.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

/**
 * Kafka Consumer — listens for notification events on the "notification-events" topic.
 *
 * Flow:
 *  1. Any microservice (order-service, payment-service, etc.) publishes a NotificationEvent
 *     to the "notification-events" Kafka topic.
 *  2. This consumer picks it up asynchronously.
 *  3. Calls NotificationService.send() which:
 *       a. Saves notification to PostgreSQL DB
 *       b. Sends email (if email field is present)
 *       c. Fetches FCM tokens from onboarding-service and sends FCM push
 *
 * Why Kafka here?
 *  - Decouples order-service from notification-service (no direct REST dependency)
 *  - If notification-service is down, messages accumulate in Kafka and are delivered
 *    automatically when it restarts (guaranteed delivery)
 *  - Enables horizontal scaling: multiple notification-service instances in the same
 *    consumer group each handle different partitions
 */
@Component
public class NotificationEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(NotificationEventConsumer.class);

    private final NotificationService notificationService;

    public NotificationEventConsumer(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /**
     * Main Kafka listener.
     *
     * Topic  : notification-events
     * Group  : notification-consumer-group
     *
     * @param event     the deserialized NotificationEvent payload
     * @param partition the Kafka partition this message came from (for logging)
     * @param offset    the offset within the partition (for logging/debugging)
     */
    @KafkaListener(
            topics = "${kafka.topics.notification-events}",
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void consume(
            @Payload NotificationEvent event,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset) {

        log.info("📥 Kafka event received | userId={} | type={} | partition={} | offset={}",
                event.getUserId(), event.getType(), partition, offset);

        try {
            // Map string type to enum safely
            Notification.NotificationType notifType = parseType(event.getType());

            // Delegate to the same NotificationService that the REST endpoint uses
            notificationService.send(
                    event.getUserId(),
                    event.getTitle(),
                    event.getMessage(),
                    notifType,
                    event.getEmail()
            );

            log.info("✅ Notification processed successfully for userId={}", event.getUserId());

        } catch (Exception e) {
            log.error("❌ Failed to process notification event for userId={}: {}",
                    event.getUserId(), e.getMessage(), e);
            // Spring Kafka's DefaultErrorHandler will retry 3 times, then send to DLT
            throw new RuntimeException("Notification processing failed", e);
        }
    }

    private Notification.NotificationType parseType(String type) {
        try {
            return Notification.NotificationType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown notification type '{}', defaulting to SYSTEM", type);
            return Notification.NotificationType.SYSTEM;
        }
    }
}

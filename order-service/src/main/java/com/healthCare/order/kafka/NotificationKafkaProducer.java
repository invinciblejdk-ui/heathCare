package com.healthCare.order.kafka;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

/**
 * Kafka Producer for notification events.
 *
 * Usage (inject in any service):
 * <pre>
 *   notificationKafkaProducer.publishOrderUpdate(
 *       userId, "Order Placed!", "Your order #123 has been placed.", email
 *   );
 * </pre>
 *
 * Why async / non-blocking?
 *  - The send() call returns immediately — the main transaction (order creation)
 *    is NOT slowed down by notification delivery.
 *  - Kafka guarantees the event will eventually reach notification-service,
 *    even if it is temporarily down.
 */
@Service
public class NotificationKafkaProducer {

    private static final Logger log = LoggerFactory.getLogger(NotificationKafkaProducer.class);

    private final KafkaTemplate<String, NotificationEvent> kafkaTemplate;
    private final String topic;

    public NotificationKafkaProducer(
            KafkaTemplate<String, NotificationEvent> kafkaTemplate,
            @Value("${kafka.topics.notification-events}") String topic) {
        this.kafkaTemplate = kafkaTemplate;
        this.topic = topic;
    }

    /**
     * Generic publish method — use this for any notification type.
     *
     * @param event fully built NotificationEvent
     */
    public void publish(NotificationEvent event) {
        try {
            SendResult<String, NotificationEvent> result = kafkaTemplate.send(topic, String.valueOf(event.getUserId()), event).get();
            log.info("📤 Kafka event published | userId={} | type={} | partition={} | offset={}",
                    event.getUserId(),
                    event.getType(),
                    result.getRecordMetadata().partition(),
                    result.getRecordMetadata().offset());
        } catch (Exception e) {
            log.error("❌ Failed to send Kafka notification event for userId={}: {}",
                    event.getUserId(), e.getMessage(), e);
            throw new RuntimeException(e);
        }
    }

    // ── Convenience methods for common order notification scenarios ─────────────

    /**
     * Notify the user that their order was placed successfully.
     */
    public void publishOrderPlaced(Long userId, Long orderId, String email) {
        publish(NotificationEvent.builder()
                .userId(userId)
                .title("Order Placed Successfully! 🛍️")
                .message(String.format("Your order #%d has been placed. We'll process it shortly.", orderId))
                .type("ORDER_UPDATE")
                .email(email)
                .build());
    }

    /**
     * Notify the user that their order status has changed.
     */
    public void publishOrderStatusUpdate(Long userId, Long orderId, String newStatus, String email) {
        String statusMessage = buildStatusMessage(orderId, newStatus);
        publish(NotificationEvent.builder()
                .userId(userId)
                .title("Order Status Update 📦")
                .message(statusMessage)
                .type("ORDER_UPDATE")
                .email(email)
                .build());
    }

    /**
     * Notify the user that their order was cancelled.
     */
    public void publishOrderCancelled(Long userId, Long orderId, String email) {
        publish(NotificationEvent.builder()
                .userId(userId)
                .title("Order Cancelled ❌")
                .message(String.format("Your order #%d has been cancelled successfully.", orderId))
                .type("ORDER_UPDATE")
                .email(email)
                .build());
    }

    /**
     * Notify the user that an item was added to their cart.
     */
    public void publishCartUpdate(Long userId, String itemName) {
        publish(NotificationEvent.builder()
                .userId(userId)
                .title("Item Added to Cart 🛒")
                .message(itemName + " has been successfully added to your cart.")
                .type("SYSTEM")
                .build());
    }

    // ── Helper ─────────────────────────────────────────────────────────────────

    private String buildStatusMessage(Long orderId, String status) {
        return switch (status.toUpperCase()) {
            case "APPROVED"   -> String.format("Order #%d has been approved by the pharmacy.", orderId);
            case "PROCESSING" -> String.format("Order #%d is being packed and prepared.", orderId);
            case "SHIPPED"    -> String.format("Order #%d has been dispatched! Your delivery is on the way. 🚚", orderId);
            case "DELIVERED"  -> String.format("Order #%d has been delivered. Enjoy! 🎉", orderId);
            case "CANCELLED"  -> String.format("Order #%d has been cancelled.", orderId);
            default           -> String.format("Order #%d status updated to %s.", orderId, status);
        };
    }
}

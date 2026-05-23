package com.healthCare.notification.dto;

import lombok.Data;

@Data
public class PushNotificationRequest {
    private String title;
    private String message;
    private String topic; // Optional: Send to a topic (e.g., "orders")
    private String token; // Optional: Send to a specific device token
}

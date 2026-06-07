package com.healthCare.kafka;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import java.util.HashMap;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class NotificationKafkaProducer {

    private final RestTemplate restTemplate;

    public NotificationKafkaProducer() {
        this.restTemplate = new RestTemplate();
    }

    public void sendLoginSuccessNotification(Long userId, String email, String fcmToken) {
        log.info("Bypassing Kafka - sending direct REST call to Notification Service for userId={}", userId);
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("userId", userId);
            payload.put("title", "🎉 Login Successful");
            payload.put("message", "Welcome back! You have successfully logged in to MediCart.");
            payload.put("type", "SYSTEM");
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            
            restTemplate.postForObject("http://localhost:9004/api/notifications/internal/send", request, String.class);
            log.info("✅ Successfully sent direct notification to notification-service");
        } catch (Exception e) {
            log.error("Failed to send direct notification: {}", e.getMessage());
        }
    }
}

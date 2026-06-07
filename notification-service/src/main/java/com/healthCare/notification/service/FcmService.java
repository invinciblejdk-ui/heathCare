package com.healthCare.notification.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service responsible for sending Firebase Cloud Messaging (FCM) push notifications.
 *
 * Flow:
 *  1. NotificationService calls sendPushNotification() with the user's FCM token(s)
 *  2. FcmService builds a Message and sends it via Firebase Admin SDK
 *  3. Firebase delivers it to the user's Android / iOS / Web device
 */
@Service
public class FcmService {

    private static final Logger log = LoggerFactory.getLogger(FcmService.class);

    /**
     * Send a push notification. Supports both raw FCM tokens and Expo Push Tokens.
     */
    public void sendPushNotification(String fcmToken, String title, String body) {
        if (fcmToken == null || fcmToken.isBlank()) {
            log.warn("FCM token is null/blank — skipping push notification");
            return;
        }

        if (fcmToken.startsWith("ExponentPushToken[")) {
            sendExpoPushNotification(fcmToken, title, body);
        } else {
            sendFirebasePushNotification(fcmToken, title, body);
        }
    }

    private void sendFirebasePushNotification(String fcmToken, String title, String body) {
        try {
            Message message = Message.builder()
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .setToken(fcmToken)
                    .build();

            String response = FirebaseMessaging.getInstance().send(message);
            log.info("✅ Firebase FCM push sent successfully. MessageId: {}", response);

        } catch (FirebaseMessagingException e) {
            log.error("❌ Failed to send Firebase FCM push notification. Token: {}. Error: {}", fcmToken, e.getMessage(), e);
        }
    }

    private void sendExpoPushNotification(String expoToken, String title, String body) {
        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
            headers.set("Accept", "application/json");

            java.util.Map<String, Object> requestBody = new java.util.HashMap<>();
            requestBody.put("to", expoToken);
            requestBody.put("title", title);
            requestBody.put("body", body);

            org.springframework.http.HttpEntity<java.util.Map<String, Object>> entity = new org.springframework.http.HttpEntity<>(requestBody, headers);
            
            org.springframework.http.ResponseEntity<String> response = restTemplate.postForEntity(
                    "https://exp.host/--/api/v2/push/send", entity, String.class);
            
            log.info("✅ Expo push sent successfully. Response: {}", response.getBody());
        } catch (Exception e) {
            log.error("❌ Failed to send Expo push notification. Token: {}. Error: {}", expoToken, e.getMessage(), e);
        }
    }

    /**
     * Send push notification to all devices of a user (multi-device support).
     *
     * @param fcmTokens list of FCM device tokens for the user
     * @param title     notification title
     * @param body      notification body
     */
    public void sendPushToAllDevices(List<String> fcmTokens, String title, String body) {
        if (fcmTokens == null || fcmTokens.isEmpty()) {
            log.info("No FCM tokens found for user — skipping push notification");
            return;
        }
        fcmTokens.forEach(token -> sendPushNotification(token, title, body));
    }
}

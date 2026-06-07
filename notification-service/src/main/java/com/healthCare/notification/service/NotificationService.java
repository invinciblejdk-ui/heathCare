package com.healthCare.notification.service;

import com.healthCare.notification.client.UserTokenClient;
import com.healthCare.notification.entity.Notification;
import com.healthCare.notification.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final JavaMailSender mailSender;
    private final FcmService fcmService;
    private final UserTokenClient userTokenClient;

    public NotificationService(NotificationRepository notificationRepository,
                               JavaMailSender mailSender,
                               FcmService fcmService,
                               UserTokenClient userTokenClient) {
        this.notificationRepository = notificationRepository;
        this.mailSender = mailSender;
        this.fcmService = fcmService;
        this.userTokenClient = userTokenClient;
    }

    /**
     * Create and persist a notification for a user.
     * Also sends:
     *  - Email (if email address provided)
     *  - FCM push notification to all registered devices of the user
     */
    @Transactional
    public Notification send(Long userId, String title, String message,
                              Notification.NotificationType type, String email) {

        // 1. Save notification to DB
        Notification notification = Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type(type)
                .build();
        Notification saved = notificationRepository.save(notification);

        // 2. Send email (best-effort, non-blocking failure)
        if (email != null && !email.isBlank()) {
            try {
                SimpleMailMessage mail = new SimpleMailMessage();
                mail.setTo(email);
                mail.setSubject(title);
                mail.setText(message);
                mailSender.send(mail);
                log.info("📧 Email notification sent to {}", email);
            } catch (Exception e) {
                log.warn("Failed to send email to {}: {}", email, e.getMessage());
            }
        }

        // 3. Send FCM push notification to all user's registered devices
        try {
            List<String> fcmTokens = userTokenClient.getFcmTokensForUser(userId);
            if (!fcmTokens.isEmpty()) {
                fcmService.sendPushToAllDevices(fcmTokens, title, message);
                log.info("🔔 FCM push sent to {} device(s) for userId={}", fcmTokens.size(), userId);
            } else {
                log.info("No FCM tokens found for userId={} — push notification skipped", userId);
            }
        } catch (Exception e) {
            // Never fail the main flow due to FCM errors
            log.error("Error sending FCM push for userId={}: {}", userId, e.getMessage(), e);
        }

        return saved;
    }

    public Page<Notification> getUserNotifications(Long userId, int page, int size) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size));
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public Notification markAsRead(Long notificationId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        n.setRead(true);
        return notificationRepository.save(n);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, Integer.MAX_VALUE))
                .forEach(n -> { n.setRead(true); notificationRepository.save(n); });
    }
}


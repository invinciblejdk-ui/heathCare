package com.healthCare.notification.service;

import com.healthCare.notification.entity.Notification;
import com.healthCare.notification.repository.NotificationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final JavaMailSender mailSender;

    public NotificationService(NotificationRepository notificationRepository, JavaMailSender mailSender) {
        this.notificationRepository = notificationRepository;
        this.mailSender = mailSender;
    }

    /** Create and persist a notification for a user, also send email if provided */
    @Transactional
    public Notification send(Long userId, String title, String message,
                              Notification.NotificationType type, String email) {
        Notification notification = Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type(type)
                .build();
        Notification saved = notificationRepository.save(notification);

        // Send email asynchronously (best-effort)
        if (email != null && !email.isBlank()) {
            try {
                SimpleMailMessage mail = new SimpleMailMessage();
                mail.setTo(email);
                mail.setSubject(title);
                mail.setText(message);
                mailSender.send(mail);
            } catch (Exception e) {
                // Log but don't fail — notification already persisted
            }
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

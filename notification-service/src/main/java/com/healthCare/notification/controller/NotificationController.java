package com.healthCare.notification.controller;

import com.healthCare.notification.entity.Notification;
import com.healthCare.notification.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<Page<Notification>> getNotifications(Authentication auth,
                                                                @RequestParam(defaultValue = "0") int page,
                                                                @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(notificationService.getUserNotifications(getUserId(auth), page, size));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication auth) {
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(getUserId(auth))));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(Authentication auth, @PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication auth) {
        notificationService.markAllAsRead(getUserId(auth));
        return ResponseEntity.noContent().build();
    }

    /** Internal endpoint — called by other services to push notifications */
    @PostMapping("/internal/send")
    public ResponseEntity<Notification> sendNotification(@RequestBody Map<String, Object> body) {
        Long userId = Long.parseLong(body.get("userId").toString());
        String title   = (String) body.get("title");
        String message = (String) body.get("message");
        String type    = (String) body.get("type");
        String email   = (String) body.getOrDefault("email", null);
        Notification.NotificationType notifType = Notification.NotificationType.valueOf(type.toUpperCase());
        return ResponseEntity.ok(notificationService.send(userId, title, message, notifType, email));
    }

    private Long getUserId(Authentication auth) { return (Long) auth.getDetails(); }
}

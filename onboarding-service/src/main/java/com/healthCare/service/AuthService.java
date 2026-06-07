package com.healthCare.service;

import com.healthCare.entity.User;
import com.healthCare.repository.UserRepository;
import com.healthCare.util.JwtUtil;
import com.healthCare.kafka.NotificationKafkaProducer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

import com.healthCare.entity.UserToken;
import com.healthCare.repository.UserTokenRepository;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final JwtUtil jwtUtil;
    private final UserTokenRepository userTokenRepository;
    private final NotificationKafkaProducer notificationKafkaProducer;

    public AuthService(UserRepository userRepository, EmailService emailService, JwtUtil jwtUtil, UserTokenRepository userTokenRepository, NotificationKafkaProducer notificationKafkaProducer) {
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.jwtUtil = jwtUtil;
        this.userTokenRepository = userTokenRepository;
        this.notificationKafkaProducer = notificationKafkaProducer;
    }

    // ── Email OTP ──────────────────────────────────────────────────────────────

    public String requestLogin(String email) {
        String otp = generateOtp();
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = User.builder().email(email).build();
            com.healthCare.entity.UserProfile profile = com.healthCare.entity.UserProfile.builder().user(newUser).build();
            newUser.setUserProfile(profile);
            return newUser;
        });
        user.setOtp(otp);
        user.setOtpExpiryTime(LocalDateTime.now().plusMinutes(5));
        userRepository.save(user);
        emailService.sendOtpEmail(email, otp);
        return "OTP sent to your email";
    }

    public String verifyLogin(String email, String otp, String fcmToken, String deviceType) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        validateOtp(user, otp);
        user.setOtp(null);
        user.setOtpExpiryTime(null);
        user.setVerified(true);
        userRepository.save(user);
        
        String token = jwtUtil.generateToken(email, user.getRole().name(), user.getId());
        saveUserToken(user, token, fcmToken, deviceType);
        
        // Publish login success event to Kafka (fail-safe)
        try {
            notificationKafkaProducer.sendLoginSuccessNotification(user.getId(), user.getEmail(), fcmToken);
        } catch (Exception e) {
            log.warn("Failed to send login notification to Kafka (Kafka might be down): {}", e.getMessage());
        }
        
        return token;
    }

    // ── Mobile OTP (stub — logs OTP to console; wire SMS provider later) ──────

    public String requestMobileLogin(String mobileNumber) {
        String otp = generateOtp();
        User user = userRepository.findByMobileNumber(mobileNumber).orElseGet(() -> {
            User newUser = User.builder().mobileNumber(mobileNumber).build();
            com.healthCare.entity.UserProfile profile = com.healthCare.entity.UserProfile.builder().user(newUser).build();
            newUser.setUserProfile(profile);
            return newUser;
        });
        user.setOtp(otp);
        user.setOtpExpiryTime(LocalDateTime.now().plusMinutes(5));
        userRepository.save(user);
        // TODO: Replace log with real SMS provider (Twilio / MSG91)
        log.info("[SMS STUB] OTP {} sent to mobile {}", otp, mobileNumber);
        return "OTP sent to your mobile number";
    }

    public String verifyMobileLogin(String mobileNumber, String otp, String fcmToken, String deviceType) {
        User user = userRepository.findByMobileNumber(mobileNumber)
                .orElseThrow(() -> new RuntimeException("User not found"));
        validateOtp(user, otp);
        user.setOtp(null);
        user.setOtpExpiryTime(null);
        user.setVerified(true);
        userRepository.save(user);
        String subject = user.getEmail() != null ? user.getEmail() : mobileNumber;
        
        String token = jwtUtil.generateToken(subject, user.getRole().name(), user.getId());
        saveUserToken(user, token, fcmToken, deviceType);
        
        // Publish login success event to Kafka (fail-safe)
        try {
            notificationKafkaProducer.sendLoginSuccessNotification(user.getId(), user.getEmail(), fcmToken);
        } catch (Exception e) {
            log.warn("Failed to send login notification to Kafka (Kafka might be down): {}", e.getMessage());
        }
        
        return token;
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private void saveUserToken(User user, String token, String fcmToken, String deviceType) {
        UserToken userToken = UserToken.builder()
                .user(user)
                .token(token)
                .expiryTime(LocalDateTime.now().plus(jwtUtil.getExpiration(), java.time.temporal.ChronoUnit.MILLIS))
                .fcmToken(fcmToken)
                .deviceType(deviceType != null ? deviceType : "ANDROID")
                .build();
        userTokenRepository.save(userToken);
    }

    // ── FCM Token Registration (called AFTER login via dedicated endpoint) ─────

    /**
     * Registers or updates the FCM device token for the currently logged-in user.
     *
     * @param userId     extracted from the JWT by JwtAuthFilter
     * @param fcmToken   Firebase device registration token from mobile app
     * @param deviceType ANDROID | IOS | WEB
     */
    public void registerFcmToken(Long userId, String fcmToken, String deviceType) {
        // Find the user's latest active token row and update the FCM token
        userTokenRepository.findLatestByUserId(userId).ifPresentOrElse(
            userToken -> {
                userToken.setFcmToken(fcmToken);
                userToken.setDeviceType(deviceType != null ? deviceType : "ANDROID");
                userTokenRepository.save(userToken);
                log.info("✅ FCM token updated for userId={}, device={}", userId, deviceType);
            },
            () -> log.warn("No active session found for userId={} — FCM token not saved", userId)
        );
    }

    private String generateOtp() {
        return String.format("%06d", new Random().nextInt(999999));
    }

    private void validateOtp(User user, String otp) {
        if (user.getOtp() == null || !user.getOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }
        if (user.getOtpExpiryTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired");
        }
    }
}

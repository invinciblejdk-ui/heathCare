package com.healthCare.service;

import com.healthCare.entity.User;
import com.healthCare.repository.UserRepository;
import com.healthCare.util.JwtUtil;
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

    public AuthService(UserRepository userRepository, EmailService emailService, JwtUtil jwtUtil, UserTokenRepository userTokenRepository) {
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.jwtUtil = jwtUtil;
        this.userTokenRepository = userTokenRepository;
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

    public String verifyLogin(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        validateOtp(user, otp);
        user.setOtp(null);
        user.setOtpExpiryTime(null);
        user.setVerified(true);
        userRepository.save(user);
        
        String token = jwtUtil.generateToken(email, user.getRole().name(), user.getId());
        saveUserToken(user, token);
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

    public String verifyMobileLogin(String mobileNumber, String otp) {
        User user = userRepository.findByMobileNumber(mobileNumber)
                .orElseThrow(() -> new RuntimeException("User not found"));
        validateOtp(user, otp);
        user.setOtp(null);
        user.setOtpExpiryTime(null);
        user.setVerified(true);
        userRepository.save(user);
        String subject = user.getEmail() != null ? user.getEmail() : mobileNumber;
        
        String token = jwtUtil.generateToken(subject, user.getRole().name(), user.getId());
        saveUserToken(user, token);
        return token;
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private void saveUserToken(User user, String token) {
        UserToken userToken = UserToken.builder()
                .user(user)
                .token(token)
                .expiryTime(LocalDateTime.now().plus(jwtUtil.getExpiration(), java.time.temporal.ChronoUnit.MILLIS))
                .build();
        userTokenRepository.save(userToken);
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

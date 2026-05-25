package com.healthCare.controller;

import com.healthCare.dto.*;
import com.healthCare.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/restful/v1/onboarding")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // ── Email OTP ──────────────────────────────────────────────────────────────

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        String message = authService.requestLogin(request.getEmail());
        return ResponseEntity.ok(new AuthResponse(message, null));
    }

    @PostMapping("/verify")
    public ResponseEntity<AuthResponse> verify(@Valid @RequestBody VerifyRequest request) {
        try {
            String token = authService.verifyLogin(request.getEmail(), request.getOtp());
            return ResponseEntity.ok(new AuthResponse("Login successful", token));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(new AuthResponse(ex.getMessage(), null));
        }
    }

    // ── Mobile OTP ─────────────────────────────────────────────────────────────

    @PostMapping("/mobile/login")
    public ResponseEntity<AuthResponse> mobileLogin(@Valid @RequestBody MobileLoginRequest request) {
        String message = authService.requestMobileLogin(request.getMobileNumber());
        return ResponseEntity.ok(new AuthResponse(message, null));
    }

    @PostMapping("/mobile/verify")
    public ResponseEntity<AuthResponse> mobileVerify(@Valid @RequestBody MobileVerifyRequest request) {
        try {
            String token = authService.verifyMobileLogin(request.getMobileNumber(), request.getOtp());
            return ResponseEntity.ok(new AuthResponse("Login successful", token));
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(new AuthResponse(ex.getMessage(), null));
        }
    }
}

package com.healthCare.controller;

import com.healthCare.dto.UpdateProfileRequest;
import com.healthCare.dto.UserProfileResponse;
import com.healthCare.service.UserProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class UserProfileController {

    private final UserProfileService profileService;

    public UserProfileController(UserProfileService profileService) {
        this.profileService = profileService;
    }

    /**
     * Get the logged-in user's profile.
     * GET /api/profile
     */
    @GetMapping
    public ResponseEntity<UserProfileResponse> getProfile(Authentication auth) {
        Long userId = (Long) auth.getDetails();
        return ResponseEntity.ok(profileService.getProfile(userId));
    }

    /**
     * Update the logged-in user's profile.
     * PUT /api/profile
     */
    @PutMapping
    public ResponseEntity<UserProfileResponse> updateProfile(
            Authentication auth,
            @RequestBody UpdateProfileRequest req) {
        Long userId = (Long) auth.getDetails();
        return ResponseEntity.ok(profileService.updateProfile(userId, req));
    }
}

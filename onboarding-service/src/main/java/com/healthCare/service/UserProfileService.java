package com.healthCare.service;

import com.healthCare.dto.UpdateProfileRequest;
import com.healthCare.dto.UserProfileResponse;
import com.healthCare.entity.User;
import com.healthCare.entity.UserProfile;
import com.healthCare.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserProfileService {

    private final UserRepository userRepository;

    public UserProfileService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Get the full profile of a user by userId.
     */
    public UserProfileResponse getProfile(Long userId) {
        User user = getUser(userId);
        return toResponse(user);
    }

    /**
     * Update profile fields (fullName, shopName, mobileNumber).
     */
    @Transactional
    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest req) {
        User user = getUser(userId);
        UserProfile profile = user.getUserProfile();
        if (req.getFullName() != null)     profile.setFullName(req.getFullName());
        if (req.getShopName() != null)     profile.setShopName(req.getShopName());
        if (req.getMobileNumber() != null) user.setMobileNumber(req.getMobileNumber());
        return toResponse(userRepository.save(user));
    }

    // ── helpers ────────────────────────────────────────────────────────────────

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
    }

    private UserProfileResponse toResponse(User user) {
        UserProfileResponse res = new UserProfileResponse();
        res.setId(user.getId());
        res.setEmail(user.getEmail());
        res.setMobileNumber(user.getMobileNumber());
        res.setRole(user.getRole().name());

        UserProfile profile = user.getUserProfile();
        if (profile != null) {
            res.setFullName(profile.getFullName());
            res.setShopName(profile.getShopName());
        }
        return res;
    }
}

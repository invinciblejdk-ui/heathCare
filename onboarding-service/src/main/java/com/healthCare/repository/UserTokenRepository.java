package com.healthCare.repository;

import com.healthCare.entity.UserToken;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserTokenRepository extends JpaRepository<UserToken, Long> {
    Optional<UserToken> findByToken(String token);

    /**
     * Get the most recent session row for a user.
     * Used when registering/updating FCM token after login.
     */
    @Query("SELECT ut FROM UserToken ut WHERE ut.user.id = :userId ORDER BY ut.createdAt DESC LIMIT 1")
    Optional<UserToken> findLatestByUserId(@Param("userId") Long userId);

    /**
     * Get all non-null FCM tokens for a given user
     * (a user can be logged in on multiple devices).
     */
    @Query("SELECT ut FROM UserToken ut WHERE ut.user.id = :userId AND ut.fcmToken IS NOT NULL")
    List<UserToken> findAllByUserIdWithFcmToken(@Param("userId") Long userId);
}

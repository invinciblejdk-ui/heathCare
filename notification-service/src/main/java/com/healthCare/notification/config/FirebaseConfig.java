package com.healthCare.notification.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;

import jakarta.annotation.PostConstruct;
import java.io.IOException;

/**
 * Initializes Firebase Admin SDK on application startup.
 *
 * Place your Firebase service-account JSON file at:
 *   notification-service/src/main/resources/firebase-service-account.json
 *
 * Download it from: Firebase Console → Project Settings → Service Accounts
 *                   → Generate new private key
 *
 * ⚠️ NEVER commit this file to Git. Add it to .gitignore.
 */
@Configuration
public class FirebaseConfig {

    private static final Logger log = LoggerFactory.getLogger(FirebaseConfig.class);

    @Value("${firebase.service-account-path}")
    private Resource serviceAccountResource;

    @PostConstruct
    public void initializeFirebase() throws IOException {
        if (FirebaseApp.getApps().isEmpty()) {
            GoogleCredentials credentials = GoogleCredentials
                    .fromStream(serviceAccountResource.getInputStream());

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(credentials)
                    .build();

            FirebaseApp.initializeApp(options);
            log.info("✅ Firebase Admin SDK initialized successfully");
        } else {
            log.info("Firebase Admin SDK already initialized — skipping.");
        }
    }
}

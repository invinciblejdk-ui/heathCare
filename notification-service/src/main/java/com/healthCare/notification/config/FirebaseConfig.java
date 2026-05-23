package com.healthCare.notification.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    private static final Logger logger = LoggerFactory.getLogger(FirebaseConfig.class);

    @PostConstruct
    public void init() {
        try {
            Resource resource = new ClassPathResource("firebase-service-account.json");
            
            // Note: If the file doesn't exist, we skip initialization to prevent crashing on startup.
            if (!resource.exists()) {
                logger.warn("Firebase service account file 'firebase-service-account.json' not found in resources. Firebase will NOT be initialized.");
                return;
            }

            InputStream serviceAccount = resource.getInputStream();
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                logger.info("Firebase application initialized successfully");
            }
        } catch (Exception e) {
            logger.error("Failed to initialize Firebase", e);
        }
    }
}

package com.healthCare.medicine.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parser().verifyWith(getSigningKey()).build()
                .parseSignedClaims(token).getPayload();
    }

    public String extractSubject(String token) { return extractAllClaims(token).getSubject(); }
    public String extractRole(String token)    { return (String) extractAllClaims(token).get("role"); }
    public Long extractUserId(String token) {
        Object id = extractAllClaims(token).get("userId");
        return id instanceof Integer ? ((Integer) id).longValue() : (Long) id;
    }
    public boolean isTokenValid(String token) {
        try { return extractAllClaims(token).getExpiration().after(new Date()); }
        catch (Exception e) { return false; }
    }
}

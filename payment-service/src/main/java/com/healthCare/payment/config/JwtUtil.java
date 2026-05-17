package com.healthCare.payment.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {
    @Value("${jwt.secret}") private String secret;
    private SecretKey key() { return Keys.hmacShaKeyFor(secret.getBytes()); }
    public Claims claims(String t) { return Jwts.parser().verifyWith(key()).build().parseSignedClaims(t).getPayload(); }
    public String subject(String t) { return claims(t).getSubject(); }
    public String role(String t) { return (String) claims(t).get("role"); }
    public Long userId(String t) { Object id = claims(t).get("userId"); return id instanceof Integer ? ((Integer)id).longValue() : (Long)id; }
    public boolean valid(String t) { try { return claims(t).getExpiration().after(new Date()); } catch(Exception e){ return false; } }
}

package com.resumescreener.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.spec.SecretKeySpec;
import java.security.Key;
import java.util.Date;
import com.resumescreener.backend.model.User;

@Component
public class JwtUtil {
    @Value("${jwt.secret}")
    private String secret;
    @Value("${jwt.expiration}")
    private long expiration;

    public String generateToken(User user) {
        Key key = new SecretKeySpec(secret.getBytes(), SignatureAlgorithm.HS512.getJcaName());
        return Jwts.builder()
                .setSubject(user.getId())
                .claim("email", user.getEmail())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }

    // ✅ Extract all claims from token
    private Claims extractAllClaims(String token) {
        Key key = new SecretKeySpec(secret.getBytes(), SignatureAlgorithm.HS512.getJcaName());
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // ✅ Extract userId (subject) from token
    public String extractUserId(String token) {
        return extractAllClaims(token).getSubject();
    }

    // ✅ (Optional) Extract email if needed
    public String extractEmail(String token) {
        return extractAllClaims(token).get("email", String.class);
    }

    // ✅ Validate token (optional, but good practice)
    public boolean validateToken(String token) {
        try {
            extractAllClaims(token); // will throw if invalid or expired
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}

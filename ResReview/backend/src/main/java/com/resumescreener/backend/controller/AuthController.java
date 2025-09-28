package com.resumescreener.backend.controller;

import com.resumescreener.backend.model.User;
import com.resumescreener.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public String register(@RequestBody User user) {
        return userService.register(user);
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Map<String, String> loginRequest) {
        String token = userService.login(loginRequest.get("email"), loginRequest.get("password"));
        if (token != null) {
            return Map.of("token", token);
        }
        return Map.of("error", "Invalid credentials");
    }
}

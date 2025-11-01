package com.resumescreener.backend.controller;

import com.resumescreener.backend.model.User;
import com.resumescreener.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.resumescreener.backend.repository.UserRepository;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository; // add this

    @PostMapping("/register")
    public String register(@RequestBody User user) {
        return userService.register(user);
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");
        String token = userService.login(email, password);
        if (token != null) {
            Map<String, Object> resp = new HashMap<>();
            resp.put("token", token);

            // fetch user details (without password)
            var userOpt = userRepository.findByEmail(email);
            if (userOpt.isPresent()) {
                var u = userOpt.get();
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("id", u.getId());
                userMap.put("username", u.getUsername());
                userMap.put("email", u.getEmail());
                // (do NOT put password)
                resp.put("user", userMap);
            }
            return resp;
        }
        return Map.of("error", "Invalid credentials");
    }
}
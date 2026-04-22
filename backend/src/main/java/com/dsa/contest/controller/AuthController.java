package com.dsa.contest.controller;

import com.dsa.contest.dto.LoginRequest;
import com.dsa.contest.dto.LoginResponse;
import com.dsa.contest.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/warning")
    public ResponseEntity<?> reportWarning(@RequestAttribute("userId") String userId) {
        int warnings = authService.incrementWarning(userId);
        return ResponseEntity.ok(java.util.Map.of(
                "warnings", warnings,
                "terminated", warnings >= 3
        ));
    }
}

package com.taskmanager.controller;

import com.taskmanager.dto.PasswordDTO;
import com.taskmanager.dto.UserDTO;
import com.taskmanager.entity.User;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.security.CustomUserDetailsService;
import com.taskmanager.service.AuditLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<UserDTO.UserResponse> getProfile(
            @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails principal) {
        User user = principal.getUser();
        UserDTO.UserResponse dto = new UserDTO.UserResponse();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setRole(user.getRole());
        dto.setIsActive(user.getIsActive());
        dto.setCreatedAt(user.getCreatedAt());
        return ResponseEntity.ok(dto);
    }

    @PatchMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @Valid @RequestBody PasswordDTO.ChangePasswordRequest request,
            @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails principal) {

        User user = principal.getUser();

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Current password is incorrect"));
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

//        auditLogService.log("CHANGE_PASSWORD", "USER", user.getId(), user.getUsername(),
//                user.getId(), user.getFullName(), null, null, null);

        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    @PatchMapping("/update")
    public ResponseEntity<UserDTO.UserResponse> updateProfile(
            @RequestBody UserDTO.UpdateUserRequest request,
            @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails principal) {

        User user = principal.getUser();
        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            user.setEmail(request.getEmail());
        }
        userRepository.save(user);

//        auditLogService.log("UPDATE_PROFILE", "USER", user.getId(), user.getUsername(),
//                user.getId(), user.getFullName(), null, user.getFullName(), null);

        UserDTO.UserResponse dto = new UserDTO.UserResponse();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setRole(user.getRole());
        dto.setIsActive(user.getIsActive());
        dto.setCreatedAt(user.getCreatedAt());
        return ResponseEntity.ok(dto);
    }
}

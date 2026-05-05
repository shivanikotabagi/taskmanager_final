package com.taskmanager.controller;

import com.taskmanager.dto.UserDTO;
import com.taskmanager.entity.User;
import com.taskmanager.enums.Role;
import com.taskmanager.security.CustomUserDetailsService;
import com.taskmanager.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO.UserResponse> createUser(
            @Valid @RequestBody UserDTO.CreateUserRequest request,
            @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails principal) {
        User admin = principal.getUser();
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(request, admin));
    }

    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO.UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/admin/users/role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO.UserResponse>> getUsersByRole(@PathVariable Role role) {
        return ResponseEntity.ok(userService.getUsersByRole(role));
    }

    @GetMapping("/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO.UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping("/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO.UserResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserDTO.UpdateUserRequest request,
            @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails principal) {
        return ResponseEntity.ok(userService.updateUser(id, request, principal.getUser()));
    }

    @DeleteMapping("/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails principal) {
        userService.deleteUser(id, principal.getUser());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/users/me")
    public ResponseEntity<UserDTO.UserResponse> getCurrentUser(
            @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails principal) {
        return ResponseEntity.ok(userService.toResponse(principal.getUser()));
    }

    @GetMapping("/users/managers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO.UserResponse>> getManagers() {
        return ResponseEntity.ok(userService.getUsersByRole(Role.MANAGER));
    }

    @GetMapping("/users/members")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<List<UserDTO.UserResponse>> getMembers() {
        return ResponseEntity.ok(userService.getUsersByRole(Role.USER));
    }
}

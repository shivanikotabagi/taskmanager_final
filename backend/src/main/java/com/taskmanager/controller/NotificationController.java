/*package com.taskmanager.controller;

import com.taskmanager.dto.NotificationDTO;
import com.taskmanager.security.CustomUserDetailsService;
import com.taskmanager.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationDTO.NotificationResponse>> getNotifications(
            @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(
                notificationService.getUserNotifications(principal.getId(), page, size));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<NotificationDTO.UnreadCountResponse> getUnreadCount(
            @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails principal) {
        NotificationDTO.UnreadCountResponse response = new NotificationDTO.UnreadCountResponse();
        response.setCount(notificationService.getUnreadCount(principal.getId()));
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails principal) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails principal) {
        notificationService.markAllAsRead(principal.getId());
        return ResponseEntity.ok().build();
    }
}
*/




package com.taskmanager.controller;

import com.taskmanager.dto.NotificationDTO;
import com.taskmanager.security.CustomUserDetailsService;
import com.taskmanager.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // ✅ DEFAULT → ALL NOTIFICATIONS (PAGINATED)
    @GetMapping
    public ResponseEntity<List<NotificationDTO.NotificationResponse>> getNotifications(
            @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(
                notificationService.getUserNotifications(principal.getId(), page, size)
        );
    }

    // ✅ ALL NOTIFICATIONS (WITHOUT PAGINATION)
    @GetMapping("/all")
    public ResponseEntity<List<NotificationDTO.NotificationResponse>> getAllNotifications(
            @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails principal) {

        return ResponseEntity.ok(
                notificationService.getAllNotifications(principal.getId())
        );
    }

    // ✅ READ NOTIFICATIONS
    @GetMapping("/read")
    public ResponseEntity<List<NotificationDTO.NotificationResponse>> getReadNotifications(
            @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails principal) {

        return ResponseEntity.ok(
                notificationService.getReadNotifications(principal.getId())
        );
    }

    // ✅ UNREAD NOTIFICATIONS
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationDTO.NotificationResponse>> getUnreadNotifications(
            @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails principal) {

        return ResponseEntity.ok(
                notificationService.getUnreadNotifications(principal.getId())
        );
    }

    // ✅ UNREAD COUNT
    @GetMapping("/unread-count")
    public ResponseEntity<NotificationDTO.UnreadCountResponse> getUnreadCount(
            @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails principal) {

        NotificationDTO.UnreadCountResponse response = new NotificationDTO.UnreadCountResponse();
        response.setCount(notificationService.getUnreadCount(principal.getId()));
        return ResponseEntity.ok(response);
    }

    // ✅ MARK SINGLE AS READ
    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails principal) {

        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    // ✅ MARK ALL AS READ
    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails principal) {

        notificationService.markAllAsRead(principal.getId());
        return ResponseEntity.ok().build();
    }
}
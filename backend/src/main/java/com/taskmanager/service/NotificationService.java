/*package com.taskmanager.service;

import com.taskmanager.dto.NotificationDTO;
import com.taskmanager.entity.Notification;
import com.taskmanager.entity.User;
import com.taskmanager.enums.NotificationType;
import com.taskmanager.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public void createAndSend(User user, String title, String message,
                               NotificationType type, Long referenceId, String referenceType) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .referenceId(referenceId)
                .referenceType(referenceType)
                .isRead(false)
                .build();
        notification = notificationRepository.save(notification);

        // Send via WebSocket to specific user
        NotificationDTO.NotificationResponse dto = toResponse(notification);
        messagingTemplate.convertAndSendToUser(
                user.getUsername(),
                "/queue/notifications",
                dto
        );
    }

    public List<NotificationDTO.NotificationResponse> getUserNotifications(Long userId, int page, int size) {
        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size))
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsRead(userId, false);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setIsRead(true);
            notificationRepository.save(n);
        });
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }

    private NotificationDTO.NotificationResponse toResponse(Notification n) {
        NotificationDTO.NotificationResponse dto = new NotificationDTO.NotificationResponse();
        dto.setId(n.getId());
        dto.setTitle(n.getTitle());
        dto.setMessage(n.getMessage());
        dto.setType(n.getType());
        dto.setIsRead(n.getIsRead());
        dto.setReferenceId(n.getReferenceId());
        dto.setReferenceType(n.getReferenceType());
        dto.setCreatedAt(n.getCreatedAt());
        return dto;
    }
}
*/

package com.taskmanager.service;

import com.taskmanager.dto.NotificationDTO;
import com.taskmanager.entity.Notification;
import com.taskmanager.entity.User;
import com.taskmanager.enums.NotificationType;
import com.taskmanager.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // ✅ CREATE + SEND REAL-TIME NOTIFICATION
    @Transactional
    public void createAndSend(User user, String title, String message,
                             NotificationType type, Long referenceId, String referenceType) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .referenceId(referenceId)
                .referenceType(referenceType)
                .isRead(false)
                .build();

        notification = notificationRepository.save(notification);

        // Send via WebSocket to specific user
        NotificationDTO.NotificationResponse dto = toResponse(notification);
        messagingTemplate.convertAndSendToUser(
                user.getUsername(),
                "/queue/notifications",
                dto
        );
    }

    // ✅ DEFAULT (PAGINATED) - ALL NOTIFICATIONS (LATEST ON TOP)
    public List<NotificationDTO.NotificationResponse> getUserNotifications(Long userId, int page, int size) {
        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size))
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ✅ ALL NOTIFICATIONS (WITHOUT PAGINATION)
    public List<NotificationDTO.NotificationResponse> getAllNotifications(Long userId) {
        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ✅ READ NOTIFICATIONS
    public List<NotificationDTO.NotificationResponse> getReadNotifications(Long userId) {
        return notificationRepository
                .findByUserIdAndIsReadTrueOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ✅ UNREAD NOTIFICATIONS
    public List<NotificationDTO.NotificationResponse> getUnreadNotifications(Long userId) {
        return notificationRepository
                .findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ✅ UNREAD COUNT
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsRead(userId, false);
    }

    // ✅ MARK SINGLE AS READ
    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setIsRead(true);
            notificationRepository.save(n);
        });
    }

    // ✅ MARK ALL AS READ
    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }

    // ✅ CONVERT ENTITY → DTO
    private NotificationDTO.NotificationResponse toResponse(Notification n) {
        NotificationDTO.NotificationResponse dto = new NotificationDTO.NotificationResponse();
        dto.setId(n.getId());
        dto.setTitle(n.getTitle());
        dto.setMessage(n.getMessage());
        dto.setType(n.getType());
        dto.setIsRead(n.getIsRead());
        dto.setReferenceId(n.getReferenceId());
        dto.setReferenceType(n.getReferenceType());
        dto.setCreatedAt(n.getCreatedAt());
        return dto;
    }
}
package com.taskmanager.dto;

import com.taskmanager.enums.NotificationType;
import lombok.Data;

import java.time.LocalDateTime;

public class NotificationDTO {

    @Data
    public static class NotificationResponse {
        private Long id;
        private String title;
        private String message;
        private NotificationType type;
        private Boolean isRead;
        private Long referenceId;
        private String referenceType;
        private LocalDateTime createdAt;
    }

    @Data
    public static class UnreadCountResponse {
        private long count;
    }
}

package com.taskmanager.dto;

import lombok.Data;

import java.time.LocalDateTime;

public class AuditLogDTO {

    @Data
    public static class AuditLogResponse {
        private Long id;
        private String action;
        private String entityType;
        private Long entityId;
        private String entityName;
        private Long performedBy;
        private String performedByName;
        private String oldValue;
        private String newValue;
        private String ipAddress;
        private LocalDateTime createdAt;
    }
}

package com.taskmanager.service;

import com.taskmanager.dto.AuditLogDTO;
import com.taskmanager.entity.AuditLog;
import com.taskmanager.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public void log(String action, String entityType, Long entityId, String entityName,
                    Long performedBy, String performedByName, String oldValue, String newValue, String ipAddress) {
        AuditLog log = AuditLog.builder()
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .entityName(entityName)
                .performedBy(performedBy)
                .performedByName(performedByName)
                .oldValue(oldValue)
                .newValue(newValue)
                .ipAddress(ipAddress)
                .build();
        auditLogRepository.save(log);
    }

    public Page<AuditLogDTO.AuditLogResponse> getAllLogs(int page, int size) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size))
                .map(this::toResponse);
    }

    public Page<AuditLogDTO.AuditLogResponse> getLogsByEntityType(String entityType, int page, int size) {
        return auditLogRepository.findByEntityTypeOrderByCreatedAtDesc(entityType, PageRequest.of(page, size))
                .map(this::toResponse);
    }

    private AuditLogDTO.AuditLogResponse toResponse(AuditLog log) {
        AuditLogDTO.AuditLogResponse dto = new AuditLogDTO.AuditLogResponse();
        dto.setId(log.getId());
        dto.setAction(log.getAction());
        dto.setEntityType(log.getEntityType());
        dto.setEntityId(log.getEntityId());
        dto.setEntityName(log.getEntityName());
        dto.setPerformedBy(log.getPerformedBy());
        dto.setPerformedByName(log.getPerformedByName());
        dto.setOldValue(log.getOldValue());
        dto.setNewValue(log.getNewValue());
        dto.setIpAddress(log.getIpAddress());
        dto.setCreatedAt(log.getCreatedAt());
        return dto;
    }
}

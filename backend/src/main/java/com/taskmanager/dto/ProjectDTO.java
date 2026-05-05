package com.taskmanager.dto;

import com.taskmanager.enums.Priority;
import com.taskmanager.enums.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

public class ProjectDTO {

    @Data
    public static class ProjectResponse {
        private Long id;
        private String name;
        private String description;
        private ProjectStatus status;
        private Priority priority;
        private LocalDate startDate;
        private LocalDate endDate;
        private UserDTO.UserResponse manager;
        private UserDTO.UserResponse createdBy;
        private Set<UserDTO.UserResponse> members;
        private long taskCount;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    public static class CreateProjectRequest {
        @NotBlank
        private String name;
        private String description;
        private ProjectStatus status = ProjectStatus.PLANNING;
        private Priority priority = Priority.MEDIUM;
        private LocalDate startDate;
        private LocalDate endDate;
        private Long managerId;
    }

    @Data
    public static class UpdateProjectRequest {
        private String name;
        private String description;
        private ProjectStatus status;
        private Priority priority;
        private LocalDate startDate;
        private LocalDate endDate;
        private Long managerId;
    }

    @Data
    public static class AssignMembersRequest {
        private List<Long> userIds;
    }
}

package com.taskmanager.dto;

import com.taskmanager.enums.Priority;
import com.taskmanager.enums.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class TaskDTO {

    @Data
    public static class TaskResponse {
        private Long id;
        private String title;
        private String description;
        private TaskStatus status;
        private Priority priority;
        private Long projectId;
        private String projectName;
        private UserDTO.UserResponse assignedTo;
        private UserDTO.UserResponse createdBy;
        private LocalDate dueDate;
        private LocalDateTime completedAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    public static class CreateTaskRequest {
        @NotBlank
        private String title;
        private String description;
        private TaskStatus status = TaskStatus.TODO;
        private Priority priority = Priority.MEDIUM;
        @NotNull
        private Long projectId;
        private Long assignedToId;
        private LocalDate dueDate;
    }

    @Data
    public static class UpdateTaskRequest {
        private String title;
        private String description;
        private TaskStatus status;
        private Priority priority;
        private Long assignedToId;
        private LocalDate dueDate;
    }
}

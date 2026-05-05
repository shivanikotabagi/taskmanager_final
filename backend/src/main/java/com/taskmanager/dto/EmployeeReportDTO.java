package com.taskmanager.dto;

import com.taskmanager.enums.TaskStatus;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class EmployeeReportDTO {

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class EmployeeSummary {
        private Long userId;
        private String fullName;
        private String email;
        private String role;
        private int totalTasks;
        private int completedTasks;
        private int inProgressTasks;
        private int todoTasks;
        private int inReviewTasks;
        private int cancelledTasks;
        private int overdueTasks;
        private double completionRate; // percentage
        private List<TaskDetail> tasks;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TaskDetail {
        private Long taskId;
        private String title;
        private String description;
        private String status;
        private String priority;
        private String projectName;
        private LocalDate dueDate;
        private LocalDateTime completedAt;
        private LocalDateTime createdAt;
        private boolean overdue;
    }
}
package com.taskmanager.entity;

import com.taskmanager.enums.TaskStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.taskmanager.enums.Priority;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "task_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true) 
public class TaskHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "task_id")   // ✅ better naming
    private Long taskId;

    private String title;
    private String description;

    @Enumerated(EnumType.STRING)
    private TaskStatus status;

    @Enumerated(EnumType.STRING)
    private Priority priority;

    private LocalDateTime changedAt;

    private String changedBy;

    private String changeType;
}
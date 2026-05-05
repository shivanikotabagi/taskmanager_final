package com.taskmanager.controller;

import com.taskmanager.dto.TaskDTO;
import com.taskmanager.enums.TaskStatus;
import com.taskmanager.security.CustomUserDetailsService;
import com.taskmanager.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;



import org.springframework.security.access.prepost.PreAuthorize;

import java.security.Principal;
import java.util.List;
import java.util.Map;//10 April

import com.taskmanager.entity.TaskHistory;
import com.taskmanager.entity.User;  //10 April
@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    /*@PostMapping
    public ResponseEntity<TaskDTO.TaskResponse> createTask(
            @Valid @RequestBody TaskDTO.CreateTaskRequest request,
            @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(taskService.createTask(request, principal.getUser()));
    }*/

    @PostMapping
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<TaskDTO.TaskResponse> createTask(
        @Valid @RequestBody TaskDTO.CreateTaskRequest request,
        @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails principal) {

    return ResponseEntity.status(HttpStatus.CREATED)
            .body(taskService.createTask(request, principal.getUser()));
}

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','USER')")
    public ResponseEntity<List<TaskDTO.TaskResponse>> getMyTasks(
            @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails principal) {
        return ResponseEntity.ok(taskService.getTasksForUser(principal.getUser()));
    }

    @GetMapping("/project/{projectId}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','USER')")
    public ResponseEntity<List<TaskDTO.TaskResponse>> getTasksByProject(
            @PathVariable Long projectId,
            @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails principal) {
        return ResponseEntity.ok(taskService.getTasksByProject(projectId, principal.getUser()));
    }

    @GetMapping("/{id}/history")
    @PreAuthorize("hasAnyRole('MANAGER')")
    public ResponseEntity<List<TaskHistory>> getTaskHistory(
        @PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTaskHistory(id));
        }

        @PostMapping("/{taskId}/history/{historyId}/restore")
@PreAuthorize("hasRole('MANAGER')")  // ← only MANAGER
public ResponseEntity<?> restoreTaskHistory(
        @PathVariable Long taskId,
        @PathVariable Long historyId,
        @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails principal) {
    taskService.restoreTaskFromHistory(taskId, historyId, principal.getUser());
    return ResponseEntity.ok("Task restored successfully");
}

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<TaskDTO.TaskResponse> updateTask(
            @PathVariable Long id,
            @RequestBody TaskDTO.UpdateTaskRequest request,
            @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails principal) {
        return ResponseEntity.ok(taskService.updateTask(id, request, principal.getUser()));
    }

    //10 April
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('MANAGER','USER')")
public ResponseEntity<?> updateStatus(
        @PathVariable Long id,
        @RequestParam TaskStatus status,
        @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails principal
) {
    taskService.updateTaskStatus(id, status, principal.getUser());
    return ResponseEntity.ok("Status updated successfully");
}


    @DeleteMapping("/{id}")
     @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<Void> deleteTask(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails principal) {
        taskService.deleteTask(id, principal.getUser());
        return ResponseEntity.noContent().build();
    }
}

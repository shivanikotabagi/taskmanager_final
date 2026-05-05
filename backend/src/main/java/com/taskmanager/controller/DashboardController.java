package com.taskmanager.controller;

import com.taskmanager.entity.Task;
import com.taskmanager.enums.Role;
import com.taskmanager.enums.TaskStatus;
import com.taskmanager.repository.ProjectRepository;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.security.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(
            @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails principal) {

        var user = principal.getUser();
        Map<String, Object> stats = new HashMap<>();

        // Projects
        long totalProjects;
        if (user.getRole() == Role.ADMIN) {
            totalProjects = projectRepository.count();
            stats.put("totalUsers",    userRepository.count());
            stats.put("totalManagers", userRepository.findByRole(Role.MANAGER).size());
        } else if (user.getRole() == Role.MANAGER) {
            totalProjects = projectRepository.findByManagerId(user.getId()).size();
            stats.put("totalUsers",    0);
            stats.put("totalManagers", 0);
        } else {
            totalProjects = projectRepository.findByMemberId(user.getId()).size();
            stats.put("totalUsers",    0);
            stats.put("totalManagers", 0);
        }
        stats.put("totalProjects", totalProjects);
        
        List<Task> allTasks;
        
		if (user.getRole() == Role.ADMIN) {
			allTasks = taskRepository.findAll();
		} else if (user.getRole() == Role.MANAGER) {
			allTasks = taskRepository.findTasksByManagerId(user.getId());
		} else {
			allTasks = taskRepository.findByAssignedToId(user.getId());
		}

        // Tasks
        long totalTasks    = allTasks.size();
        long todoTasks     = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.TODO).count();
        long inProgTasks   = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count();
        long inRevTasks    = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_REVIEW).count();
        long doneTasks     = allTasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count();
        long cancelledTasks= allTasks.stream().filter(t -> t.getStatus() == TaskStatus.CANCELLED).count();

        stats.put("totalTasks",    totalTasks);
        stats.put("todoTasks",     todoTasks);
        stats.put("inProgressTasks", inProgTasks);
        stats.put("inReviewTasks", inRevTasks);
        stats.put("doneTasks",     doneTasks);
        stats.put("cancelledTasks",cancelledTasks);
        stats.put("completionRate", totalTasks > 0 ? Math.round((doneTasks * 100.0) / totalTasks) : 0);

        return ResponseEntity.ok(stats);
    }
}

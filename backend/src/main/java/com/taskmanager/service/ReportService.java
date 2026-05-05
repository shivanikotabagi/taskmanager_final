package com.taskmanager.service;

import com.taskmanager.dto.EmployeeReportDTO;
import com.taskmanager.entity.Task;
import com.taskmanager.entity.User;
import com.taskmanager.enums.TaskStatus;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.taskmanager.enums.Role;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    /**
     * Returns a report for ALL employees (for Admin overview).
     */
    public List<EmployeeReportDTO.EmployeeSummary> getAllEmployeeReports() {
         List<User> employees = userRepository.findByRole(Role.USER);
        List<EmployeeReportDTO.EmployeeSummary> reports = new ArrayList<>();

        for (User user : employees) {
            List<Task> tasks = taskRepository.findByAssignedToIdWithDetails(user.getId());
            reports.add(buildSummary(user, tasks));
        }

        return reports;
    }

    /**
     * Returns a report for a specific employee (for Admin drill-down).
     */
    public EmployeeReportDTO.EmployeeSummary getEmployeeReport(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        List<Task> tasks = taskRepository.findByAssignedToIdWithDetails(userId);
        return buildSummary(user, tasks);
    }

    // ── private helpers ───────────────────────────────────────────────────

    private EmployeeReportDTO.EmployeeSummary buildSummary(User user, List<Task> tasks) {
        LocalDate today = LocalDate.now();

        int total      = tasks.size();
        int completed  = (int) tasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count();
        int inProgress = (int) tasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count();
        int todo       = (int) tasks.stream().filter(t -> t.getStatus() == TaskStatus.TODO).count();
        int inReview   = (int) tasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_REVIEW).count();
        int cancelled  = (int) tasks.stream().filter(t -> t.getStatus() == TaskStatus.CANCELLED).count();
        int overdue    = (int) tasks.stream()
                .filter(t -> t.getDueDate() != null
                          && t.getDueDate().isBefore(today)
                          && t.getStatus() != TaskStatus.DONE
                          && t.getStatus() != TaskStatus.CANCELLED)
                .count();

        double completionRate = total == 0 ? 0 : Math.round((completed * 100.0 / total) * 10.0) / 10.0;

        List<EmployeeReportDTO.TaskDetail> taskDetails = tasks.stream()
                .map(t -> {
                    boolean isOverdue = t.getDueDate() != null
                            && t.getDueDate().isBefore(today)
                            && t.getStatus() != TaskStatus.DONE
                            && t.getStatus() != TaskStatus.CANCELLED;
                    return new EmployeeReportDTO.TaskDetail(
                            t.getId(),
                            t.getTitle(),
                            t.getDescription(),
                            t.getStatus().name(),
                            t.getPriority() != null ? t.getPriority().name() : "MEDIUM",
                            t.getProject() != null ? t.getProject().getName() : "—",
                            t.getDueDate(),
                            t.getCompletedAt(),
                            t.getCreatedAt(),
                            isOverdue
                    );
                })
                .collect(Collectors.toList());

        EmployeeReportDTO.EmployeeSummary summary = new EmployeeReportDTO.EmployeeSummary();
        summary.setUserId(user.getId());
        summary.setFullName(user.getFullName());
        summary.setEmail(user.getEmail());
        summary.setRole(user.getRole().name());
        summary.setTotalTasks(total);
        summary.setCompletedTasks(completed);
        summary.setInProgressTasks(inProgress);
        summary.setTodoTasks(todo);
        summary.setInReviewTasks(inReview);
        summary.setCancelledTasks(cancelled);
        summary.setOverdueTasks(overdue);
        summary.setCompletionRate(completionRate);
        summary.setTasks(taskDetails);
        return summary;
    }
}
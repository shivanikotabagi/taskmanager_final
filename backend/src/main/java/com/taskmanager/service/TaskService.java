/*package com.taskmanager.service;

import com.taskmanager.dto.TaskDTO;
import com.taskmanager.entity.Project;
import com.taskmanager.entity.Task;
import com.taskmanager.entity.User;
import com.taskmanager.enums.NotificationType;
import com.taskmanager.enums.Role;
import com.taskmanager.enums.TaskStatus;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.repository.UserRepository;//10 April
import com.taskmanager.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectService projectService;
    private final UserService userService;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;
    private final UserRepository userRepository;//10 April

    @Transactional
    public TaskDTO.TaskResponse createTask(TaskDTO.CreateTaskRequest request, User createdBy) {
        Project project = projectService.findById(request.getProjectId());

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus())
                .priority(request.getPriority())
                .project(project)
                .createdBy(createdBy)
                .dueDate(request.getDueDate())
                .build();

        if (request.getAssignedToId() != null) {
            User assignee = userService.findById(request.getAssignedToId());
            task.setAssignedTo(assignee);
        }

        task = taskRepository.save(task);

        if (task.getAssignedTo() != null) {
            notificationService.createAndSend(task.getAssignedTo(),
                    "New Task Assigned",
                    "You have been assigned a new task: " + task.getTitle() + " in project " + project.getName(),
                    NotificationType.TASK_ASSIGNED, task.getId(), "TASK");
        }


//        auditLogService.log("CREATE", "TASK", task.getId(), task.getTitle(),
//                createdBy.getId(), createdBy.getFullName(), null, task.getTitle(), null);
        return toResponse(task);
        
    }
    
    @Transactional
    public List<TaskDTO.TaskResponse> getTasksByProject(Long projectId, User user) {
        return taskRepository.findByProjectId(projectId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }
    
    @Transactional
    public List<TaskDTO.TaskResponse> getTasksForUser(User user) {
        List<Task> tasks;
        if (user.getRole() == Role.ADMIN) {
            tasks = taskRepository.findAll();
        } else if (user.getRole() == Role.MANAGER) {
            tasks = taskRepository.findTasksByManagerId(user.getId());
        } else {
            tasks = taskRepository.findByAssignedToId(user.getId());
        }
        return tasks.stream().map(this::toResponse).collect(Collectors.toList());
    }

    /*@Transactional
    public TaskDTO.TaskResponse updateTask(Long id, TaskDTO.UpdateTaskRequest request, User user) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + id));
        String oldTitle = task.getTitle();

        if (request.getTitle() != null) task.setTitle(request.getTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getPriority() != null) task.setPriority(request.getPriority());
        if (request.getDueDate() != null) task.setDueDate(request.getDueDate());
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
            if (request.getStatus() == TaskStatus.DONE) {
                task.setCompletedAt(LocalDateTime.now());
            }
        }
        if (request.getAssignedToId() != null) {
            User assignee = userService.findById(request.getAssignedToId());
            task.setAssignedTo(assignee);
            notificationService.createAndSend(assignee,
                    "Task Updated",
                    "Task '" + task.getTitle() + "' has been updated and assigned to you.",
                    NotificationType.TASK_UPDATED, task.getId(), "TASK");
        }

        task = taskRepository.save(task);
		/*
		 * auditLogService.log("UPDATE", "TASK", task.getId(), task.getTitle(),
		 * user.getId(), user.getFullName(), oldTitle, task.getTitle(), null);
		 *
        return toResponse(task);
    }*

        //10 April
        @Transactional
public TaskDTO.TaskResponse updateTask(Long id, TaskDTO.UpdateTaskRequest request, User user) {
    Task task = taskRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + id));

    if (request.getTitle() != null) task.setTitle(request.getTitle());
    if (request.getDescription() != null) task.setDescription(request.getDescription());
    if (request.getPriority() != null) task.setPriority(request.getPriority());
    if (request.getDueDate() != null) task.setDueDate(request.getDueDate());

    if (request.getStatus() != null) {
        task.setStatus(request.getStatus());
        if (request.getStatus() == TaskStatus.DONE) {
            task.setCompletedAt(LocalDateTime.now());
        }
    }

    if (request.getAssignedToId() != null) {
        User assignee = userService.findById(request.getAssignedToId());
        task.setAssignedTo(assignee);

        // 🔔 Notify Assignee
        notificationService.createAndSend(
                assignee,
                "Task Updated",
                "Task '" + task.getTitle() + "' has been updated and assigned to you.",
                NotificationType.TASK_UPDATED,
                task.getId(),
                "TASK"
        );
    }

    taskRepository.save(task);

    // 🔔 Notify Manager (optional but recommended)
    User manager = task.getProject().getManager();
    notificationService.createAndSend(
            manager,
            "Task Updated",
            user.getFullName() + " updated task '" + task.getTitle() + "'",
            NotificationType.TASK_UPDATED,
            task.getId(),
            "TASK"
    );

    // 🔥 Notify ALL ADMINS (MAIN FIX)
    List<User> admins = userRepository.findByRole(Role.ADMIN);

    for (User admin : admins) {
        notificationService.createAndSend(
                admin,
                "Task Updated",
                user.getFullName() + " updated task '" + task.getTitle() + "' to " + task.getStatus(),
                NotificationType.TASK_UPDATED,
                task.getId(),
                "TASK"
        );
    }

    //turn mapToResponse(task);
    return toResponse(task);
}

    @Transactional
    public void deleteTask(Long id, User user) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + id));
		/*
		 * auditLogService.log("DELETE", "TASK", task.getId(), task.getTitle(),
		 * user.getId(), user.getFullName(), task.getTitle(), null, null);
		 *
        taskRepository.delete(task);
    }

    //10 April
   {/* @Transactional
public void updateTaskStatus(Long taskId, TaskStatus status, User user) {

    Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + taskId));

    // ✅ Only assigned employee can update
    if (task.getAssignedTo() == null || 
        !task.getAssignedTo().getId().equals(user.getId())) {
        throw new RuntimeException("You are not allowed to update this task");
    }

    // ✅ Update status
    task.setStatus(status);

    // ✅ If completed → set completed time
    if (status == TaskStatus.DONE) {
        task.setCompletedAt(LocalDateTime.now());
    }

    taskRepository.save(task);

    // 🔔 Notify Manager
    User manager = task.getCreatedBy();

    notificationService.createAndSend(
            manager,
            "Task Status Updated",
            "Task '" + task.getTitle() + "' updated by " + user.getFullName()
                    + " → Status: " + status,
            NotificationType.TASK_UPDATED,
            task.getId(),
            "TASK"
    );
}
*}

        @Transactional
public void updateTaskStatus(Long id, TaskStatus status, User user) {
    Task task = taskRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

    task.setStatus(status);

    if (status == TaskStatus.DONE) {
        task.setCompletedAt(LocalDateTime.now());
    }

    taskRepository.save(task);

    // 🔔 Notify Manager
    User manager = task.getProject().getManager();
    notificationService.createAndSend(
            manager,
            "Task Status Updated",
            user.getFullName() + " updated task '" + task.getTitle() + "' to " + status,
            NotificationType.TASK_UPDATED,
            task.getId(),
            "TASK"
    );

    // 🔥 Notify ALL ADMINS
    List<User> admins = userRepository.findByRole(Role.ADMIN);

    for (User admin : admins) {
        notificationService.createAndSend(
                admin,
                "Task Status Updated",
                user.getFullName() + " updated task '" + task.getTitle() + "' to " + status,
                NotificationType.TASK_UPDATED,
                task.getId(),
                "TASK"
        );
    }
}


    public TaskDTO.TaskResponse toResponse(Task task) {
        TaskDTO.TaskResponse dto = new TaskDTO.TaskResponse();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setStatus(task.getStatus());
        dto.setPriority(task.getPriority());
        dto.setDueDate(task.getDueDate());
        dto.setCompletedAt(task.getCompletedAt());
        dto.setCreatedAt(task.getCreatedAt());
        dto.setUpdatedAt(task.getUpdatedAt());

        if (task.getProject() != null) {
            dto.setProjectId(task.getProject().getId());
            dto.setProjectName(task.getProject().getName());
        }
        if (task.getAssignedTo() != null) {
            dto.setAssignedTo(userService.toResponse(task.getAssignedTo()));
        }
        if (task.getCreatedBy() != null) {
            dto.setCreatedBy(userService.toResponse(task.getCreatedBy()));
        }
        return dto;
    }
}
*/

/* 
package com.taskmanager.service;

import com.taskmanager.dto.TaskDTO;
import com.taskmanager.entity.Project;
import com.taskmanager.entity.Task;
import com.taskmanager.entity.User;
import com.taskmanager.enums.NotificationType;
import com.taskmanager.enums.Role;
import com.taskmanager.enums.TaskStatus;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taskmanager.entity.TaskHistory;
import com.taskmanager.repository.TaskHistoryRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectService projectService;
    private final UserService userService;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final TaskHistoryRepository taskHistoryRepository;
    

    // ✅ CREATE TASK
    @Transactional
    public TaskDTO.TaskResponse createTask(TaskDTO.CreateTaskRequest request, User createdBy) {

         // 🔒 ONLY MANAGER CAN CREATE TASK
        if (createdBy.getRole() != Role.MANAGER) {
            throw new RuntimeException("Only Manager can create tasks");
        }

        Project project = projectService.findById(request.getProjectId());

        // ✅ DATE VALIDATION
        if (request.getDueDate() != null &&
                request.getDueDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Due date cannot be in the past");
        }

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus())
                .priority(request.getPriority())
                .project(project)
                .createdBy(createdBy)
                .dueDate(request.getDueDate())
                .build();

        if (request.getAssignedToId() != null) {
            User assignee = userService.findById(request.getAssignedToId());
            task.setAssignedTo(assignee);
        }

        task = taskRepository.save(task);

        // 🔔 Notify assignee
        if (task.getAssignedTo() != null) {
            notificationService.createAndSend(
                    task.getAssignedTo(),
                    "New Task Assigned",
                    "You have been assigned a new task: " + task.getTitle()
                            + " in project " + project.getName(),
                    NotificationType.TASK_ASSIGNED,
                    task.getId(),
                    "TASK"
            );
        }

        return toResponse(task);
    }

    // ✅ GET TASKS BY PROJECT
    @Transactional
    public List<TaskDTO.TaskResponse> getTasksByProject(Long projectId, User user) {
        return taskRepository.findByProjectId(projectId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ✅ GET TASKS BASED ON ROLE
    @Transactional
    public List<TaskDTO.TaskResponse> getTasksForUser(User user) {
        List<Task> tasks;

        if (user.getRole() == Role.ADMIN) {
            tasks = taskRepository.findAll();
        } else if (user.getRole() == Role.MANAGER) {
            tasks = taskRepository.findTasksByManagerId(user.getId());
        } else {
            tasks = taskRepository.findByAssignedToId(user.getId());
        }

        return tasks.stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ✅ UPDATE TASK
        @Transactional
public TaskDTO.TaskResponse updateTask(Long id, TaskDTO.UpdateTaskRequest request, User user) {

    // ✅ FETCH TASK ONLY ONCE
    Task task = taskRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + id));

    /* =========================
       ✅ SAVE OLD VERSION (VERSION CONTROL)
    ========================= *
    TaskHistory history = TaskHistory.builder()
    .taskId(task.getId())   // ✅ FIX
    .title(task.getTitle())
    .description(task.getDescription())
    .status(task.getStatus())
    .priority(task.getPriority())
    .changedAt(LocalDateTime.now())
    .changedBy(user.getFullName())
    .build();

    taskHistoryRepository.save(history);
    /* ========================= *

    // ✅ DATE VALIDATION
    if (request.getDueDate() != null &&
            request.getDueDate().isBefore(LocalDate.now())) {
        throw new RuntimeException("Due date cannot be in the past");
    }

    // ✅ UPDATE FIELDS
    if (request.getTitle() != null) task.setTitle(request.getTitle());
    if (request.getDescription() != null) task.setDescription(request.getDescription());
    if (request.getPriority() != null) task.setPriority(request.getPriority());
    if (request.getDueDate() != null) task.setDueDate(request.getDueDate());

    if (request.getStatus() != null) {
        task.setStatus(request.getStatus());
        if (request.getStatus() == TaskStatus.DONE) {
            task.setCompletedAt(LocalDateTime.now());
        }
    }

    // ✅ ASSIGN USER
    if (request.getAssignedToId() != null) {
        User assignee = userService.findById(request.getAssignedToId());
        task.setAssignedTo(assignee);

        notificationService.createAndSend(
                assignee,
                "Task Updated",
                "Task '" + task.getTitle() + "' has been updated and assigned to you.",
                NotificationType.TASK_UPDATED,
                task.getId(),
                "TASK"
        );
    }

    taskRepository.save(task);

    // 🔔 Notify Manager
    User manager = task.getProject().getManager();
    notificationService.createAndSend(
            manager,
            "Task Updated",
            user.getFullName() + " updated task '" + task.getTitle() + "'",
            NotificationType.TASK_UPDATED,
            task.getId(),
            "TASK"
    );

    // 🔔 Notify Admins
    List<User> admins = userRepository.findByRole(Role.ADMIN);
    for (User admin : admins) {
        notificationService.createAndSend(
                admin,
                "Task Updated",
                user.getFullName() + " updated task '" + task.getTitle() +
                        "' to " + task.getStatus(),
                NotificationType.TASK_UPDATED,
                task.getId(),
                "TASK"
        );
    }

    return toResponse(task);
}

    // ✅ DELETE TASK
    @Transactional
    public void deleteTask(Long id, User user) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + id));

        taskRepository.delete(task);
    }

    // ✅ GET TASK HISTORY
    @Transactional(readOnly = true)
    public List<TaskHistory> getTaskHistory(Long taskId) {

        taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        return taskHistoryRepository.findByTaskIdOrderByChangedAtDesc(taskId);
    }

    // ✅ UPDATE TASK STATUS
    @Transactional
    public void updateTaskStatus(Long id, TaskStatus status, User user) {

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        task.setStatus(status);

        if (status == TaskStatus.DONE) {
            task.setCompletedAt(LocalDateTime.now());
        }

        taskRepository.save(task);

        // 🔔 Notify manager
        User manager = task.getProject().getManager();
        notificationService.createAndSend(
                manager,
                "Task Status Updated",
                user.getFullName() + " updated task '" + task.getTitle() + "' to " + status,
                NotificationType.TASK_UPDATED,
                task.getId(),
                "TASK"
        );

        // 🔔 Notify admins
        List<User> admins = userRepository.findByRole(Role.ADMIN);

        for (User admin : admins) {
            notificationService.createAndSend(
                    admin,
                    "Task Status Updated",
                    user.getFullName() + " updated task '" + task.getTitle() + "' to " + status,
                    NotificationType.TASK_UPDATED,
                    task.getId(),
                    "TASK"
            );
        }
    }

    // ✅ MAPPER
    public TaskDTO.TaskResponse toResponse(Task task) {

        TaskDTO.TaskResponse dto = new TaskDTO.TaskResponse();

        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setStatus(task.getStatus());
        dto.setPriority(task.getPriority());
        dto.setDueDate(task.getDueDate());
        dto.setCompletedAt(task.getCompletedAt());
        dto.setCreatedAt(task.getCreatedAt());
        dto.setUpdatedAt(task.getUpdatedAt());

        if (task.getProject() != null) {
            dto.setProjectId(task.getProject().getId());
            dto.setProjectName(task.getProject().getName());
        }

        if (task.getAssignedTo() != null) {
            dto.setAssignedTo(userService.toResponse(task.getAssignedTo()));
        }

        if (task.getCreatedBy() != null) {
            dto.setCreatedBy(userService.toResponse(task.getCreatedBy()));
        }

        return dto;
    }
}
    */


package com.taskmanager.service;

import com.taskmanager.dto.TaskDTO;
import com.taskmanager.entity.Project;
import com.taskmanager.entity.Task;
import com.taskmanager.entity.User;
import com.taskmanager.enums.NotificationType;
import com.taskmanager.enums.Role;
import com.taskmanager.enums.TaskStatus;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taskmanager.entity.TaskHistory;
import com.taskmanager.repository.TaskHistoryRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectService projectService;
    private final UserService userService;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final TaskHistoryRepository taskHistoryRepository;

    // ✅ CREATE TASK
    @Transactional
    public TaskDTO.TaskResponse createTask(TaskDTO.CreateTaskRequest request, User createdBy) {

        // 🔒 ONLY MANAGER CAN CREATE TASK
        if (createdBy.getRole() != Role.MANAGER) {
            throw new RuntimeException("Only Manager can create tasks");
        }

        Project project = projectService.findById(request.getProjectId());

        // ✅ DATE VALIDATION
        if (request.getDueDate() != null &&
                request.getDueDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Due date cannot be in the past");
        }

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus())
                .priority(request.getPriority())
                .project(project)
                .createdBy(createdBy)
                .dueDate(request.getDueDate())
                .build();

        if (request.getAssignedToId() != null) {
            User assignee = userService.findById(request.getAssignedToId());
            task.setAssignedTo(assignee);
        }

        task = taskRepository.save(task);

        // 🔔 Notify assignee
        if (task.getAssignedTo() != null) {
            notificationService.createAndSend(
                    task.getAssignedTo(),
                    "New Task Assigned",
                    "You have been assigned a new task: " + task.getTitle()
                            + " in project " + project.getName(),
                    NotificationType.TASK_ASSIGNED,
                    task.getId(),
                    "TASK"
            );
        }

        return toResponse(task);
    }

    // ✅ GET TASKS BY PROJECT
    @Transactional
    public List<TaskDTO.TaskResponse> getTasksByProject(Long projectId, User user) {
        return taskRepository.findByProjectId(projectId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ✅ GET TASKS BASED ON ROLE
    @Transactional
    public List<TaskDTO.TaskResponse> getTasksForUser(User user) {
        List<Task> tasks;

        if (user.getRole() == Role.ADMIN) {
            tasks = taskRepository.findAll();
        } else if (user.getRole() == Role.MANAGER) {
            tasks = taskRepository.findTasksByManagerId(user.getId());
        } else {
            tasks = taskRepository.findByAssignedToId(user.getId());
        }

        return tasks.stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ✅ UPDATE TASK
    @Transactional
    public TaskDTO.TaskResponse updateTask(Long id, TaskDTO.UpdateTaskRequest request, User user) {

        // ✅ FETCH TASK
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + id));

        // ✅ BUILD CHANGE SUMMARY (before applying updates)
        StringBuilder changeBuilder = new StringBuilder();

        if (request.getStatus() != null && !request.getStatus().equals(task.getStatus())) {
            changeBuilder.append("Status: ")
                    .append(task.getStatus())
                    .append(" → ")
                    .append(request.getStatus())
                    .append(" | ");
        }

        if (request.getPriority() != null && !request.getPriority().equals(task.getPriority())) {
            changeBuilder.append("Priority: ")
                    .append(task.getPriority())
                    .append(" → ")
                    .append(request.getPriority())
                    .append(" | ");
        }

        if (request.getTitle() != null && !request.getTitle().equals(task.getTitle())) {
            changeBuilder.append("Title: \"")
                    .append(task.getTitle())
                    .append("\" → \"")
                    .append(request.getTitle())
                    .append("\" | ");
        }

        if (request.getDescription() != null && !request.getDescription().equals(task.getDescription())) {
            changeBuilder.append("Description changed | ");
        }

        if (request.getDueDate() != null && !request.getDueDate().equals(task.getDueDate())) {
            changeBuilder.append("Due Date: ")
                    .append(task.getDueDate())
                    .append(" → ")
                    .append(request.getDueDate())
                    .append(" | ");
        }

        if (request.getAssignedToId() != null) {
            String currentAssignee = task.getAssignedTo() != null
                    ? task.getAssignedTo().getFullName()
                    : "Unassigned";
            changeBuilder.append("Assignee changed from ")
                    .append(currentAssignee)
                    .append(" | ");
        }

        // Remove trailing " | "
        String changeType = changeBuilder.length() > 0
                ? changeBuilder.toString().replaceAll(" \\| $", "")
                : "Updated";

        // ✅ SAVE HISTORY (old state + what changed)
        TaskHistory history = TaskHistory.builder()
                .taskId(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .changedAt(LocalDateTime.now())
                .changedBy(user.getFullName())
                .changeType(changeType)
                .build();

        taskHistoryRepository.save(history);

        // ✅ DATE VALIDATION
        if (request.getDueDate() != null &&
                request.getDueDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Due date cannot be in the past");
        }

        // ✅ APPLY UPDATES
        if (request.getTitle() != null) task.setTitle(request.getTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getPriority() != null) task.setPriority(request.getPriority());
        if (request.getDueDate() != null) task.setDueDate(request.getDueDate());

        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
            if (request.getStatus() == TaskStatus.DONE) {
                task.setCompletedAt(LocalDateTime.now());
            }
        }

        // ✅ ASSIGN USER
        if (request.getAssignedToId() != null) {
            User assignee = userService.findById(request.getAssignedToId());
            task.setAssignedTo(assignee);

            notificationService.createAndSend(
                    assignee,
                    "Task Updated",
                    "Task '" + task.getTitle() + "' has been updated and assigned to you.",
                    NotificationType.TASK_UPDATED,
                    task.getId(),
                    "TASK"
            );
        }

        taskRepository.save(task);

        // 🔔 Notify Manager
        User manager = task.getProject().getManager();
        notificationService.createAndSend(
                manager,
                "Task Updated",
                user.getFullName() + " updated task '" + task.getTitle() + "'",
                NotificationType.TASK_UPDATED,
                task.getId(),
                "TASK"
        );

        // 🔔 Notify Admins
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        for (User admin : admins) {
            notificationService.createAndSend(
                    admin,
                    "Task Updated",
                    user.getFullName() + " updated task '" + task.getTitle() +
                            "' to " + task.getStatus(),
                    NotificationType.TASK_UPDATED,
                    task.getId(),
                    "TASK"
            );
        }

        return toResponse(task);
    }

    // ✅ DELETE TASK
    @Transactional
    public void deleteTask(Long id, User user) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + id));

        taskRepository.delete(task);
    }

    // ✅ GET TASK HISTORY
    @Transactional(readOnly = true)
    public List<TaskHistory> getTaskHistory(Long taskId) {
        taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        return taskHistoryRepository.findByTaskIdOrderByChangedAtDesc(taskId);
    }

    // ✅ UPDATE TASK STATUS
    @Transactional
    public void updateTaskStatus(Long id, TaskStatus status, User user) {

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        // ✅ SAVE HISTORY FOR STATUS UPDATE TOO
        TaskHistory history = TaskHistory.builder()
                .taskId(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .changedAt(LocalDateTime.now())
                .changedBy(user.getFullName())
                .changeType("Status: " + task.getStatus() + " → " + status)
                .build();

        taskHistoryRepository.save(history);

        // ✅ APPLY STATUS UPDATE
        task.setStatus(status);

        if (status == TaskStatus.DONE) {
            task.setCompletedAt(LocalDateTime.now());
        }

        taskRepository.save(task);

        // 🔔 Notify Manager
        User manager = task.getProject().getManager();
        notificationService.createAndSend(
                manager,
                "Task Status Updated",
                user.getFullName() + " updated task '" + task.getTitle() + "' to " + status,
                NotificationType.TASK_UPDATED,
                task.getId(),
                "TASK"
        );

        // 🔔 Notify Admins
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        for (User admin : admins) {
            notificationService.createAndSend(
                    admin,
                    "Task Status Updated",
                    user.getFullName() + " updated task '" + task.getTitle() + "' to " + status,
                    NotificationType.TASK_UPDATED,
                    task.getId(),
                    "TASK"
            );
        }
    }

    // ✅ RESTORE TASK FROM HISTORY
@Transactional
public void restoreTaskFromHistory(Long taskId, Long historyId, User user) {

    // 🔒 CHECK FIRST — before any DB calls
    if (user.getRole() != Role.MANAGER) {
        throw new RuntimeException("Only Manager can restore task history");
    }

    // ✅ Fetch current task
    Task task = taskRepository.findById(taskId)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + taskId));

    // ✅ Fetch the history snapshot to restore
    TaskHistory snapshot = taskHistoryRepository.findById(historyId)
            .orElseThrow(() -> new ResourceNotFoundException("History not found: " + historyId));

    // ✅ Only manager of THIS project can restore
    if (user.getRole() != Role.MANAGER) {
        throw new RuntimeException("Only Manager can restore task history");
    }

    // ✅ Save current state BEFORE restoring (so restore itself is undoable)
    // ✅ SAVE CURRENT STATE (before restore) — so it's undoable
TaskHistory currentSnapshot = TaskHistory.builder()
        .taskId(task.getId())
        .title(task.getTitle())
        .description(task.getDescription())
        .status(task.getStatus())
        .priority(task.getPriority())
        .changedAt(LocalDateTime.now())
        .changedBy(user.getFullName())
        .changeType("Before Restore: was " + task.getStatus())
        .build();
taskHistoryRepository.save(currentSnapshot);

// ✅ APPLY OLD VALUES
String changeType = "Restored: " + task.getStatus() + " → " + snapshot.getStatus();
task.setTitle(snapshot.getTitle());
task.setDescription(snapshot.getDescription());
task.setStatus(snapshot.getStatus());
task.setPriority(snapshot.getPriority());

if (snapshot.getStatus() != TaskStatus.DONE) {
    task.setCompletedAt(null);
}

taskRepository.save(task);

// ✅ SAVE RESTORE RECORD (after restore) — remove the duplicate restoreRecord below
TaskHistory restoreRecord = TaskHistory.builder()
        .taskId(task.getId())
        .title(task.getTitle())
        .description(task.getDescription())
        .status(task.getStatus())
        .priority(task.getPriority())
        .changedAt(LocalDateTime.now().plusSeconds(1)) // ← +1 second so ordering is correct
        .changedBy(user.getFullName())
        .changeType(changeType)
        .build();
taskHistoryRepository.save(restoreRecord);

    // 🔔 Notify Manager themselves (confirmation)
    notificationService.createAndSend(
            user,
            "Task Restored",
            "You restored task '" + task.getTitle()
                    + "' to previous state: " + snapshot.getStatus(),
            NotificationType.TASK_UPDATED,
            task.getId(),
            "TASK"
    );

    // 🔔 Notify Admins
    List<User> admins = userRepository.findByRole(Role.ADMIN);
    for (User admin : admins) {
        notificationService.createAndSend(
                admin,
                "Task Restored",
                user.getFullName() + " restored task '" + task.getTitle()
                        + "' to " + snapshot.getStatus(),
                NotificationType.TASK_UPDATED,
                task.getId(),
                "TASK"
        );
    }
}

    // ✅ MAPPER
    public TaskDTO.TaskResponse toResponse(Task task) {

        TaskDTO.TaskResponse dto = new TaskDTO.TaskResponse();

        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setStatus(task.getStatus());
        dto.setPriority(task.getPriority());
        dto.setDueDate(task.getDueDate());
        dto.setCompletedAt(task.getCompletedAt());
        dto.setCreatedAt(task.getCreatedAt());
        dto.setUpdatedAt(task.getUpdatedAt());

        if (task.getProject() != null) {
            dto.setProjectId(task.getProject().getId());
            dto.setProjectName(task.getProject().getName());
        }

        if (task.getAssignedTo() != null) {
            dto.setAssignedTo(userService.toResponse(task.getAssignedTo()));
        }

        if (task.getCreatedBy() != null) {
            dto.setCreatedBy(userService.toResponse(task.getCreatedBy()));
        }

        return dto;
    }
}
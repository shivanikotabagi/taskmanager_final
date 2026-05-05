/*package com.taskmanager.service;

import com.taskmanager.dto.ProjectDTO;
import com.taskmanager.dto.UserDTO;
import com.taskmanager.entity.Project;
import com.taskmanager.entity.User;
import com.taskmanager.enums.NotificationType;
import com.taskmanager.enums.Role;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.repository.ProjectRepository;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final UserService userService;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @Transactional
    public ProjectDTO.ProjectResponse createProject(ProjectDTO.CreateProjectRequest request, User createdBy) {
 

        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .status(request.getStatus())
                .priority(request.getPriority())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .createdBy(createdBy)
                .build();

        if (request.getManagerId() != null) {
            User manager = userService.findById(request.getManagerId());
            project.setManager(manager);
        }

        project = projectRepository.save(project);

        if (project.getManager() != null) {
            notificationService.createAndSend(project.getManager(),
                    "New Project Assigned",
                    "You have been assigned as manager for project: " + project.getName(),
                    NotificationType.PROJECT_ASSIGNED, project.getId(), "PROJECT");
        }

//        auditLogService.log("CREATE", "PROJECT", project.getId(), project.getName(),
//                createdBy.getId(), createdBy.getFullName(), null, project.getName(), null);
        return toResponse(project);


    }

    public List<ProjectDTO.ProjectResponse> getProjectsForUser(User user) {
        List<Project> projects;
        if (user.getRole() == Role.ADMIN) {
            projects = projectRepository.findAll();
        } else if (user.getRole() == Role.MANAGER) {
            projects = projectRepository.findByManagerId(user.getId());
        } else {
            projects = projectRepository.findByMemberId(user.getId());
        }
        return projects.stream().map(this::toResponse).collect(Collectors.toList());
    }
    
    @Transactional
    public List<ProjectDTO.ProjectResponse> getProjectsForUser(Long userId, Role role) {

        List<Project> projects;

        if (role == Role.ADMIN) {
            projects = projectRepository.findAll();
        } else if (role == Role.MANAGER) {
            projects = projectRepository.findByManagerId(userId);
        } else {
            projects = projectRepository.findByMemberId(userId);
        }

        return projects.stream()
                .map(this::toResponse)
                .toList();
    }
    
    @Transactional
    public ProjectDTO.ProjectResponse getProjectById(Long projectId, Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        return toResponse(project);
    }
    
    @Transactional
    public ProjectDTO.ProjectResponse getProjectById(Long id, User user) {
        Project project = findById(id);
        checkAccess(project, user);
        return toResponse(project);
    }

    @Transactional
    public ProjectDTO.ProjectResponse updateProject(Long id, ProjectDTO.UpdateProjectRequest request, User user) {


        Project project = findById(id);
        String oldName = project.getName();

        if (request.getName() != null) project.setName(request.getName());
        if (request.getDescription() != null) project.setDescription(request.getDescription());
        if (request.getStatus() != null) project.setStatus(request.getStatus());
        if (request.getPriority() != null) project.setPriority(request.getPriority());
        if (request.getStartDate() != null) project.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) project.setEndDate(request.getEndDate());
        if (request.getManagerId() != null) {
            User manager = userService.findById(request.getManagerId());
            project.setManager(manager);
            notificationService.createAndSend(manager,
                    "Project Manager Assignment",
                    "You have been assigned as manager for project: " + project.getName(),
                    NotificationType.PROJECT_ASSIGNED, project.getId(), "PROJECT");
        }

        project = projectRepository.save(project);
		/*
		 * auditLogService.log("UPDATE", "PROJECT", project.getId(), project.getName(),
		 * user.getId(), user.getFullName(), oldName, project.getName(), null);
		 *
        return toResponse(project);
    }

    @Transactional
    public ProjectDTO.ProjectResponse assignMembers(Long projectId, ProjectDTO.AssignMembersRequest request, User performedBy) {
        Project project = findById(projectId);
        for (Long userId : request.getUserIds()) {
            User member = userService.findById(userId);
            project.getMembers().add(member);
            notificationService.createAndSend(member,
                    "Added to Project",
                    "You have been added to project: " + project.getName(),
                    NotificationType.PROJECT_ASSIGNED, project.getId(), "PROJECT");
        }
        project = projectRepository.save(project);
        auditLogService.log("ASSIGN_MEMBERS", "PROJECT", project.getId(), project.getName(),
                performedBy.getId(), performedBy.getFullName(), null, request.getUserIds().toString(), null);
        return toResponse(project);
    }

    @Transactional
    public ProjectDTO.ProjectResponse removeMember(Long projectId, Long userId, User performedBy) {
        Project project = findById(projectId);
        User member = userService.findById(userId);
        project.getMembers().remove(member);
        project = projectRepository.save(project);
        auditLogService.log("REMOVE_MEMBER", "PROJECT", project.getId(), project.getName(),
                performedBy.getId(), performedBy.getFullName(), member.getFullName(), null, null);
        return toResponse(project);
    }

    @Transactional
    public void deleteProject(Long id, User user) {
        Project project = findById(id);
        auditLogService.log("DELETE", "PROJECT", project.getId(), project.getName(),
                user.getId(), user.getFullName(), project.getName(), null, null);
        projectRepository.delete(project);
    }

    public Project findById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + id));
    }

    private void checkAccess(Project project, User user) {
        if (user.getRole() == Role.ADMIN) return;
        if (user.getRole() == Role.MANAGER && project.getManager() != null
                && project.getManager().getId().equals(user.getId())) return;
        if (project.getMembers().stream().anyMatch(m -> m.getId().equals(user.getId()))) return;
        throw new RuntimeException("Access denied to project: " + project.getId());
    }

    public ProjectDTO.ProjectResponse toResponse(Project project) {
        ProjectDTO.ProjectResponse dto = new ProjectDTO.ProjectResponse();
        dto.setId(project.getId());
        dto.setName(project.getName());
        dto.setDescription(project.getDescription());
        dto.setStatus(project.getStatus());
        dto.setPriority(project.getPriority());
        dto.setStartDate(project.getStartDate());
        dto.setEndDate(project.getEndDate());
        dto.setCreatedAt(project.getCreatedAt());
        dto.setUpdatedAt(project.getUpdatedAt());

        if (project.getManager() != null) {
            dto.setManager(userService.toResponse(project.getManager()));
        }
        if (project.getCreatedBy() != null) {
            dto.setCreatedBy(userService.toResponse(project.getCreatedBy()));
        }
        if (project.getMembers() != null) {
            Set<UserDTO.UserResponse> members = project.getMembers().stream()
                    .map(userService::toResponse)
                    .collect(Collectors.toSet());
            dto.setMembers(members);
        }
        dto.setTaskCount(taskRepository.countByProjectId(project.getId()));
        return dto;
    }
}
*/


package com.taskmanager.service;

import com.taskmanager.dto.ProjectDTO;
import com.taskmanager.dto.UserDTO;
import com.taskmanager.entity.Project;
import com.taskmanager.entity.User;
import com.taskmanager.enums.NotificationType;
import com.taskmanager.enums.Role;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.repository.ProjectRepository;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final UserService userService;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    // ✅ CREATE PROJECT
    @Transactional
    public ProjectDTO.ProjectResponse createProject(ProjectDTO.CreateProjectRequest request, User createdBy) {

        // ✅ DATE VALIDATION
        if (request.getStartDate() != null && request.getStartDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Start date cannot be in the past");
        }

        if (request.getEndDate() != null && request.getEndDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("End date cannot be in the past");
        }

        if (request.getStartDate() != null && request.getEndDate() != null &&
                request.getEndDate().isBefore(request.getStartDate())) {
            throw new RuntimeException("End date cannot be before start date");
        }

        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .status(request.getStatus())
                .priority(request.getPriority())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .createdBy(createdBy)
                .build();

        if (request.getManagerId() != null) {
            User manager = userService.findById(request.getManagerId());
            project.setManager(manager);
        }

        project = projectRepository.save(project);

        if (project.getManager() != null) {
            notificationService.createAndSend(
                    project.getManager(),
                    "New Project Assigned",
                    "You have been assigned as manager for project: " + project.getName(),
                    NotificationType.PROJECT_ASSIGNED,
                    project.getId(),
                    "PROJECT"
            );
        }

        return toResponse(project);
    }

    // ✅ GET PROJECTS (USER BASED)
    public List<ProjectDTO.ProjectResponse> getProjectsForUser(User user) {
        List<Project> projects;

        if (user.getRole() == Role.ADMIN) {
            projects = projectRepository.findAll();
        } else if (user.getRole() == Role.MANAGER) {
            projects = projectRepository.findByManagerId(user.getId());
        } else {
            projects = projectRepository.findByMemberId(user.getId());
        }

        return projects.stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ✅ OPTIONAL (if used in controller)
    @Transactional
    public List<ProjectDTO.ProjectResponse> getProjectsForUser(Long userId, Role role) {

        List<Project> projects;

        if (role == Role.ADMIN) {
            projects = projectRepository.findAll();
        } else if (role == Role.MANAGER) {
            projects = projectRepository.findByManagerId(userId);
        } else {
            projects = projectRepository.findByMemberId(userId);
        }

        return projects.stream()
                .map(this::toResponse)
                .toList();
    }

    // ✅ GET PROJECT BY ID
    @Transactional
    public ProjectDTO.ProjectResponse getProjectById(Long id, User user) {
        Project project = findById(id);
        checkAccess(project, user);
        return toResponse(project);
    }

    // ✅ UPDATE PROJECT
    @Transactional
    public ProjectDTO.ProjectResponse updateProject(Long id, ProjectDTO.UpdateProjectRequest request, User user) {

        // ✅ DATE VALIDATION
        if (request.getStartDate() != null && request.getStartDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Start date cannot be in the past");
        }

        if (request.getEndDate() != null && request.getEndDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("End date cannot be in the past");
        }

        if (request.getStartDate() != null && request.getEndDate() != null &&
                request.getEndDate().isBefore(request.getStartDate())) {
            throw new RuntimeException("End date cannot be before start date");
        }

        Project project = findById(id);

        if (request.getName() != null) project.setName(request.getName());
        if (request.getDescription() != null) project.setDescription(request.getDescription());
        if (request.getStatus() != null) project.setStatus(request.getStatus());
        if (request.getPriority() != null) project.setPriority(request.getPriority());
        if (request.getStartDate() != null) project.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) project.setEndDate(request.getEndDate());

        if (request.getManagerId() != null) {
            User manager = userService.findById(request.getManagerId());
            project.setManager(manager);

            notificationService.createAndSend(
                    manager,
                    "Project Manager Assignment",
                    "You have been assigned as manager for project: " + project.getName(),
                    NotificationType.PROJECT_ASSIGNED,
                    project.getId(),
                    "PROJECT"
            );
        }

        project = projectRepository.save(project);

        return toResponse(project);
    }

    // ✅ ASSIGN MEMBERS
    @Transactional
    public ProjectDTO.ProjectResponse assignMembers(Long projectId, ProjectDTO.AssignMembersRequest request, User performedBy) {

        Project project = findById(projectId);

        for (Long userId : request.getUserIds()) {
            User member = userService.findById(userId);
            project.getMembers().add(member);

            notificationService.createAndSend(
                    member,
                    "Added to Project",
                    "You have been added to project: " + project.getName(),
                    NotificationType.PROJECT_ASSIGNED,
                    project.getId(),
                    "PROJECT"
            );
        }

        project = projectRepository.save(project);

        return toResponse(project);
    }

    // ✅ REMOVE MEMBER
    @Transactional
    public ProjectDTO.ProjectResponse removeMember(Long projectId, Long userId, User performedBy) {

        Project project = findById(projectId);
        User member = userService.findById(userId);

        project.getMembers().remove(member);
        project = projectRepository.save(project);

        return toResponse(project);
    }

    // ✅ DELETE PROJECT
    @Transactional
    public void deleteProject(Long id, User user) {
        Project project = findById(id);
        projectRepository.delete(project);
    }

    // ✅ FIND PROJECT
    public Project findById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + id));
    }

    // ✅ ACCESS CHECK
    private void checkAccess(Project project, User user) {
        if (user.getRole() == Role.ADMIN) return;

        if (user.getRole() == Role.MANAGER &&
                project.getManager() != null &&
                project.getManager().getId().equals(user.getId())) return;

        if (project.getMembers().stream().anyMatch(m -> m.getId().equals(user.getId()))) return;

        throw new RuntimeException("Access denied");
    }

    // ✅ DTO MAPPING
    public ProjectDTO.ProjectResponse toResponse(Project project) {

        ProjectDTO.ProjectResponse dto = new ProjectDTO.ProjectResponse();

        dto.setId(project.getId());
        dto.setName(project.getName());
        dto.setDescription(project.getDescription());
        dto.setStatus(project.getStatus());
        dto.setPriority(project.getPriority());
        dto.setStartDate(project.getStartDate());
        dto.setEndDate(project.getEndDate());
        dto.setCreatedAt(project.getCreatedAt());
        dto.setUpdatedAt(project.getUpdatedAt());

        if (project.getManager() != null) {
            dto.setManager(userService.toResponse(project.getManager()));
        }

        if (project.getCreatedBy() != null) {
            dto.setCreatedBy(userService.toResponse(project.getCreatedBy()));
        }

        if (project.getMembers() != null) {
            Set<UserDTO.UserResponse> members = project.getMembers().stream()
                    .map(userService::toResponse)
                    .collect(Collectors.toSet());
            dto.setMembers(members);
        }

        dto.setTaskCount(taskRepository.countByProjectId(project.getId()));

        return dto;
    }
}
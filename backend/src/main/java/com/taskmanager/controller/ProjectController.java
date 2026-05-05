package com.taskmanager.controller;

import com.taskmanager.dto.ProjectDTO;
import com.taskmanager.security.CustomUserDetailsService;
import com.taskmanager.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProjectDTO.ProjectResponse> createProject(
            @Valid @RequestBody ProjectDTO.CreateProjectRequest request,
            @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(projectService.createProject(request, principal.getUser()));
    }

    @GetMapping
    public ResponseEntity<List<ProjectDTO.ProjectResponse>> getProjects(
            @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails principal) {

        return ResponseEntity.ok(
                projectService.getProjectsForUser(
                        principal.getUser().getId(),
                        principal.getUser().getRole()
                )
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDTO.ProjectResponse> getProject(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails principal) {
        return ResponseEntity.ok(projectService.getProjectById(id, principal.getUser()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProjectDTO.ProjectResponse> updateProject(
            @PathVariable Long id,
            @RequestBody ProjectDTO.UpdateProjectRequest request,
            @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails principal) {
        return ResponseEntity.ok(projectService.updateProject(id, request, principal.getUser()));
    }

    @PostMapping("/{id}/members")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProjectDTO.ProjectResponse> assignMembers(
            @PathVariable Long id,
            @RequestBody ProjectDTO.AssignMembersRequest request,
            @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails principal) {
        return ResponseEntity.ok(projectService.assignMembers(id, request, principal.getUser()));
    }

    @DeleteMapping("/{id}/members/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProjectDTO.ProjectResponse> removeMember(
            @PathVariable Long id,
            @PathVariable Long userId,
            @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails principal) {
        return ResponseEntity.ok(projectService.removeMember(id, userId, principal.getUser()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProject(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetailsService.CustomUserDetails principal) {
        projectService.deleteProject(id, principal.getUser());
        return ResponseEntity.noContent().build();
    }
}

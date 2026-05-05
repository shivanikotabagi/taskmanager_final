package com.taskmanager.service;

import com.taskmanager.dto.UserDTO;
import com.taskmanager.entity.User;
import com.taskmanager.enums.NotificationType;
import com.taskmanager.enums.Role;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    @Transactional
    public UserDTO.UserResponse createUser(UserDTO.CreateUserRequest request, User performedBy) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists: " + request.getUsername());
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists: " + request.getEmail());
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(request.getRole())
                .isActive(true)
                .build();
        user = userRepository.save(user);

//        auditLogService.log("CREATE", "USER", user.getId(), user.getUsername(),
//                performedBy.getId(), performedBy.getFullName(), null, user.getUsername(), null);

        notificationService.createAndSend(user,
                "Welcome to Task Manager",
                "Your account has been created. Username: " + user.getUsername(),
                NotificationType.USER_CREATED, user.getId(), "USER");

        return toResponse(user);
    }

    public List<UserDTO.UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<UserDTO.UserResponse> getUsersByRole(Role role) {
        return userRepository.findByRole(role).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public UserDTO.UserResponse getUserById(Long id) {
        return toResponse(findById(id));
    }

    @Transactional
    public UserDTO.UserResponse updateUser(Long id, UserDTO.UpdateUserRequest request, User performedBy) {
        User user = findById(id);
        String oldName = user.getFullName();

        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getIsActive() != null) user.setIsActive(request.getIsActive());

        user = userRepository.save(user);
		/*
		 * auditLogService.log("UPDATE", "USER", user.getId(), user.getUsername(),
		 * performedBy.getId(), performedBy.getFullName(), oldName, user.getFullName(),
		 * null);
		 */
        return toResponse(user);
    }

    @Transactional
    public void deleteUser(Long id, User performedBy) {
        User user = findById(id);
        //auditLogService.log("DELETE", "USER", user.getId(), user.getUsername(),
                //performedBy.getId(), performedBy.getFullName(), user.getUsername(), null, null);
        userRepository.delete(user);
    }

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }

    public UserDTO.UserResponse toResponse(User user) {
        UserDTO.UserResponse dto = new UserDTO.UserResponse();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setRole(user.getRole());
        dto.setIsActive(user.getIsActive());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}

/*package com.taskmanager.dto;

import com.taskmanager.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

public class UserDTO {

    @Data
    public static class UserResponse {
        private Long id;
        private String username;
        private String email;
        private String fullName;
        private Role role;
        private Boolean isActive;
        private LocalDateTime createdAt;
    }

    @Data
    public static class CreateUserRequest {
        @NotBlank @Size(min = 3, max = 50)
        private String username;
        @NotBlank @Email
        private String email;
        @NotBlank @Size(min = 6)
        private String password;
        @NotBlank
        private String fullName;
        private Role role = Role.USER;
    }

    @Data
    public static class UpdateUserRequest {
        private String fullName;
        private String email;
        private Boolean isActive;
    }
}*/

package com.taskmanager.dto;

import com.taskmanager.enums.Role;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDateTime;

public class UserDTO {

    @Data
    public static class UserResponse {
        private Long id;
        private String username;
        private String email;
        private String fullName;
        private Role role;
        private Boolean isActive;
        private LocalDateTime createdAt;
    }

    @Data
    public static class CreateUserRequest {

        // ✅ Username: only letters (no numbers, no symbols)
        @NotBlank(message = "Username is required")
        @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
        @Pattern(regexp = "^[A-Za-z]+$", message = "Username must contain only letters (no numbers or symbols)")
        private String username;

        // ✅ Email: only gmail + alphanumeric before @
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        @Pattern(
            regexp = "^[A-Za-z0-9]+@gmail\\.com$",
            message = "Email must be valid and end with @gmail.com (e.g., shivani@gmail.com)"
        )
        private String email;

        // ✅ Password: minimum 6 characters
        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters long")
        private String password;

        // ✅ Full Name: only letters + spaces
        @NotBlank(message = "Full name is required")
        @Pattern(regexp = "^[A-Za-z ]+$", message = "Full name must contain only letters and spaces")
        private String fullName;

        private Role role = Role.USER;
    }

    @Data
    public static class UpdateUserRequest {

        @Pattern(regexp = "^[A-Za-z ]+$", message = "Full name must contain only letters and spaces")
        private String fullName;

        @Email(message = "Invalid email format")
        @Pattern(
            regexp = "^[A-Za-z0-9]+@gmail\\.com$",
            message = "Email must be valid and end with @gmail.com"
        )
        private String email;

        private Boolean isActive;
    }
}
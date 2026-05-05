package com.taskmanager.controller;

import com.taskmanager.dto.EmployeeReportDTO;
import com.taskmanager.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    /**
     * GET /api/admin/reports/employees
     * Returns task summary for every employee — Admin only.
     */
    @GetMapping("/employees")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<EmployeeReportDTO.EmployeeSummary>> getAllEmployeeReports() {
        return ResponseEntity.ok(reportService.getAllEmployeeReports());
    }

    /**
     * GET /api/admin/reports/employees/{userId}
     * Returns detailed task list for one employee — Admin only.
     */
    @GetMapping("/employees/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EmployeeReportDTO.EmployeeSummary> getEmployeeReport(
            @PathVariable Long userId) {
        return ResponseEntity.ok(reportService.getEmployeeReport(userId));
    }
}
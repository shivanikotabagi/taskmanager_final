/*package com.taskmanager.repository;

import com.taskmanager.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProjectId(Long projectId);
    List<Task> findByAssignedToId(Long userId);

    @Query("SELECT t FROM Task t WHERE t.project.id IN " +
           "(SELECT p.id FROM Project p WHERE p.manager.id = :managerId)")
    List<Task> findTasksByManagerId(@Param("managerId") Long managerId);

    long countByProjectId(Long projectId);
}*/


package com.taskmanager.repository;

import com.taskmanager.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProjectId(Long projectId);
    List<Task> findByAssignedToId(Long userId);

    @Query("SELECT t FROM Task t WHERE t.project.id IN " +
           "(SELECT p.id FROM Project p WHERE p.manager.id = :managerId)")
    List<Task> findTasksByManagerId(@Param("managerId") Long managerId);

    long countByProjectId(Long projectId);

    // ── NEW: for employee report ──────────────────────────────────────────
    @Query("SELECT t FROM Task t LEFT JOIN FETCH t.project LEFT JOIN FETCH t.assignedTo " +
           "WHERE t.assignedTo.id = :userId ORDER BY t.createdAt DESC")
    List<Task> findByAssignedToIdWithDetails(@Param("userId") Long userId);

    @Query("SELECT t FROM Task t LEFT JOIN FETCH t.project LEFT JOIN FETCH t.assignedTo " +
           "ORDER BY t.assignedTo.id, t.createdAt DESC")
    List<Task> findAllWithAssignedUser();
}
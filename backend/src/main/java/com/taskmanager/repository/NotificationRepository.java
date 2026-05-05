/*package com.taskmanager.repository;

import com.taskmanager.entity.Notification;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    long countByUserIdAndIsRead(Long userId, Boolean isRead);

    List<Notification> findAllByOrderByCreatedAtDesc();

    List<Notification> findByIsReadTrueOrderByCreatedAtDesc();

    List<Notification> findByIsReadFalseOrderByCreatedAtDesc();

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user.id = :userId")
    void markAllAsReadByUserId(@Param("userId") Long userId);
}*/


package com.taskmanager.repository;

import com.taskmanager.entity.Notification;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // ✅ PAGINATED — used by default GET /api/notifications
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    // ✅ ALL (no pagination) — used by GET /api/notifications/all
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    // ✅ READ only — used by GET /api/notifications/read
    List<Notification> findByUserIdAndIsReadTrueOrderByCreatedAtDesc(Long userId);

    // ✅ UNREAD only — used by GET /api/notifications/unread
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);

    // ✅ UNREAD COUNT
    long countByUserIdAndIsRead(Long userId, Boolean isRead);

    // ✅ MARK ALL AS READ
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user.id = :userId")
    void markAllAsReadByUserId(@Param("userId") Long userId);
}

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationAPI } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import './NotificationBell.css';

export default function NotificationBell() {
  const { unreadCount, setUnread, notifications, setNotifications } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationAPI.getAll(0, 10);
      setNotifications(res.data);
    } catch {} finally { setLoading(false); }
  };

  const toggleOpen = () => {
    setOpen(v => !v);
    if (!open) fetchNotifications();
  };

  const markAllRead = async () => {
    await notificationAPI.markAllAsRead();
    setUnread(0);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleClick = async (notif) => {
    if (!notif.isRead) {
      await notificationAPI.markAsRead(notif.id);
      setUnread(prev => Math.max(0, prev - 1));
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
    }
    setOpen(false);
    if (notif.referenceType === 'PROJECT') navigate(`/projects/${notif.referenceId}`);
  };

  const typeIcon = { PROJECT_ASSIGNED: '📁', TASK_ASSIGNED: '✅', TASK_UPDATED: '🔄', USER_CREATED: '👤', GENERAL: '🔔' };

  return (
    <div className="notif-bell-wrap" ref={ref}>
      <button className="notif-bell-btn btn btn-ghost btn-icon" onClick={toggleOpen}>
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <span className="notif-title">Notifications</span>
            {unreadCount > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={markAllRead}>Mark all read</button>
            )}
          </div>
          <div className="notif-list">
            {loading && <div className="notif-empty"><div className="spinner" /></div>}
            {!loading && notifications.length === 0 && (
              <div className="notif-empty">
                <Bell size={28} style={{ opacity: 0.2 }} />
                <span>No notifications yet</span>
              </div>
            )}
            {!loading && notifications.map(n => (
              <div
                key={n.id}
                className={`notif-item ${!n.isRead ? 'unread' : ''}`}
                onClick={() => handleClick(n)}
              >
                <div className="notif-icon">{typeIcon[n.type] || '🔔'}</div>
                <div className="notif-content">
                  <div className="notif-item-title">{n.title}</div>
                  <div className="notif-item-msg">{n.message}</div>
                  <div className="notif-time">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </div>
                </div>
                {!n.isRead && <div className="notif-dot" />}
              </div>
            ))}
          </div>
          <div className="notif-footer">
            <button className="btn btn-ghost btn-sm w-full" onClick={() => { navigate('/notifications'); setOpen(false); }}>
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

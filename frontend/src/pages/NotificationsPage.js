/*import React, { useEffect, useState, useCallback } from 'react';
import { notificationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../services/helpers';
import { Bell, CheckCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import './NotificationsPage.css';

const TYPE_ICONS = {
  PROJECT_ASSIGNED: '📁', TASK_ASSIGNED: '✅',
  TASK_UPDATED: '🔄', PROJECT_UPDATED: '📝',
  USER_CREATED: '👤', GENERAL: '🔔',
};
const TYPE_COLORS = {
  PROJECT_ASSIGNED: 'var(--accent)', TASK_ASSIGNED: 'var(--success)',
  TASK_UPDATED: 'var(--warning)', PROJECT_UPDATED: 'var(--info)',
  USER_CREATED: 'var(--danger)', GENERAL: 'var(--text-muted)',
};

export default function NotificationsPage() {
  const { setUnread } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [page, setPage]                   = useState(0);
  const PAGE_SIZE = 20;

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationAPI.getAll(page, PAGE_SIZE);
      setNotifications(res.data);
    } catch {} finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const markAsRead = async (id) => {
    await notificationAPI.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnread(prev => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    await notificationAPI.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnread(0);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="notif-page fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-secondary" onClick={markAllRead}>
            <CheckCheck size={15} /> Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:60 }}>
          <div className="spinner" style={{ width:32, height:32 }} />
        </div>
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <Bell size={52} />
          <h3>No notifications yet</h3>
          <p>You'll see notifications here when projects or tasks are assigned to you.</p>
        </div>
      ) : (
        <>
          <div className="notif-full-list">
            {notifications.map(n => (
              <div
                key={n.id}
                className={`notif-full-item ${!n.isRead ? 'unread' : ''}`}
                onClick={() => !n.isRead && markAsRead(n.id)}
              >
                <div
                  className="notif-full-icon"
                  style={{ background: TYPE_COLORS[n.type] + '22', color: TYPE_COLORS[n.type] }}
                >
                  {TYPE_ICONS[n.type] || '🔔'}
                </div>
                <div className="notif-full-body">
                  <div className="notif-full-title">{n.title}</div>
                  <div className="notif-full-msg">{n.message}</div>
                  <div className="notif-full-meta">
                    <span className="badge badge-muted" style={{ fontSize:10 }}>{n.type.replace(/_/g,' ')}</span>
                    <span style={{ fontSize:11, color:'var(--text-muted)' }}>{formatDate(n.createdAt)}</span>
                  </div>
                </div>
                {!n.isRead && <div className="notif-unread-dot" />}
              </div>
            ))}
          </div>

          {/* Pagination prev/next (simple) *}
          <div className="pagination" style={{ marginTop:16 }}>
            <span style={{ fontSize:12, color:'var(--text-muted)' }}>Page {page + 1}</span>
            <div style={{ display:'flex', gap:6 }}>
              <button className="btn btn-secondary btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft size={14} /> Prev
              </button>
              <button
                className="btn btn-secondary btn-sm"
                disabled={notifications.length < PAGE_SIZE}
                onClick={() => setPage(p => p + 1)}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
*/

/*
import React, { useEffect, useState, useCallback } from 'react';
import { notificationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../services/helpers';
import { Bell, CheckCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import './NotificationsPage.css';

const TYPE_ICONS = {
  PROJECT_ASSIGNED: '📁', TASK_ASSIGNED: '✅',
  TASK_UPDATED: '🔄', PROJECT_UPDATED: '📝',
  USER_CREATED: '👤', GENERAL: '🔔',
};

const TYPE_COLORS = {
  PROJECT_ASSIGNED: 'var(--accent)', TASK_ASSIGNED: 'var(--success)',
  TASK_UPDATED: 'var(--warning)', PROJECT_UPDATED: 'var(--info)',
  USER_CREATED: 'var(--danger)', GENERAL: 'var(--text-muted)',
};

export default function NotificationsPage() {
  const { setUnread } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState("all"); // 🔥 NEW

  const PAGE_SIZE = 20;

  // ✅ FETCH BASED ON FILTER
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      let res;

      if (filter === "read") {
        res = await notificationAPI.getRead();
      } else if (filter === "unread") {
        res = await notificationAPI.getUnread();
      } else {
        // Default ALL (with pagination)
        res = await notificationAPI.getAll(page, PAGE_SIZE);
      }

      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ✅ MARK SINGLE READ
  const markAsRead = async (id) => {
    await notificationAPI.markAsRead(id);
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
    setUnread(prev => Math.max(0, prev - 1));
  };

  // ✅ MARK ALL READ
  const markAllRead = async () => {
    await notificationAPI.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnread(0);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="notif-page fade-in">
      
      {/* HEADER *}
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>

        {unreadCount > 0 && (
          <button className="btn btn-secondary" onClick={markAllRead}>
            <CheckCheck size={15} /> Mark all as read
          </button>
        )}
      </div>

      {/* 🔘 FILTER BUTTONS *}
      <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
        <button
          className={`btn ${filter === "all" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => { setFilter("all"); setPage(0); }}
        >
          All
        </button>

        <button
          className={`btn ${filter === "read" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => { setFilter("read"); setPage(0); }}
        >
          Read
        </button>

        <button
          className={`btn ${filter === "unread" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => { setFilter("unread"); setPage(0); }}
        >
          Unread
        </button>
      </div>

      {/* CONTENT *}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <Bell size={52} />
          <h3>No notifications yet</h3>
          <p>You'll see notifications here when tasks or projects are assigned.</p>
        </div>
      ) : (
        <>
          {/* LIST *}
          <div className="notif-full-list">
            {notifications.map(n => (
              <div
                key={n.id}
                className={`notif-full-item ${!n.isRead ? 'unread' : ''}`}
                onClick={() => !n.isRead && markAsRead(n.id)}
              >
                <div
                  className="notif-full-icon"
                  style={{
                    background: TYPE_COLORS[n.type] + '22',
                    color: TYPE_COLORS[n.type]
                  }}
                >
                  {TYPE_ICONS[n.type] || '🔔'}
                </div>

                <div className="notif-full-body">
                  <div className="notif-full-title">{n.title}</div>
                  <div className="notif-full-msg">{n.message}</div>

                  <div className="notif-full-meta">
                    <span className="badge badge-muted" style={{ fontSize: 10 }}>
                      {n.type.replace(/_/g, ' ')}
                    </span>

                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {formatDate(n.createdAt)}
                    </span>
                  </div>
                </div>

                {!n.isRead && <div className="notif-unread-dot" />}
              </div>
            ))}
          </div>

          {/* PAGINATION (ONLY FOR ALL) *}
          {filter === "all" && (
            <div className="pagination" style={{ marginTop: 16 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Page {page + 1}
              </span>

              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                >
                  <ChevronLeft size={14} /> Prev
                </button>

                <button
                  className="btn btn-secondary btn-sm"
                  disabled={notifications.length < PAGE_SIZE}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}*/


import React, { useEffect, useState, useCallback } from 'react';
import { notificationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../services/helpers';
import { Bell, CheckCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import './NotificationsPage.css';

const TYPE_ICONS = {
  PROJECT_ASSIGNED: '📁',
  TASK_ASSIGNED: '✅',
  TASK_UPDATED: '🔄',
  PROJECT_UPDATED: '📝',
  USER_CREATED: '👤',
  GENERAL: '🔔',
};

const TYPE_COLORS = {
  PROJECT_ASSIGNED: 'var(--accent)',
  TASK_ASSIGNED: 'var(--success)',
  TASK_UPDATED: 'var(--warning)',
  PROJECT_UPDATED: 'var(--info)',
  USER_CREATED: 'var(--danger)',
  GENERAL: 'var(--text-muted)',
};

export default function NotificationsPage() {
  const { setUnread } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState("all");

  const PAGE_SIZE = 20;

  // ✅ FETCH DATA BASED ON FILTER
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      let res;

      if (filter === "read") {
        res = await notificationAPI.getRead();
      } else if (filter === "unread") {
        res = await notificationAPI.getUnread();
      } else {
        res = await notificationAPI.getAll(page, PAGE_SIZE);
      }

      // ✅ SAFE HANDLING (pagination or normal list)
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.content || [];

        // ✅ Always sort latest first on frontend too
const sorted = [...data].sort((a, b) => 
  new Date(b.createdAt) - new Date(a.createdAt)
);

      setNotifications(data);

    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ✅ RESET PAGE WHEN FILTER CHANGES
  useEffect(() => {
    setPage(0);
  }, [filter]);

  // ✅ MARK SINGLE AS READ
  const markAsRead = async (id) => {
    await notificationAPI.markAsRead(id);

    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );

    setUnread(prev => (prev > 0 ? prev - 1 : 0));
  };

  // ✅ MARK ALL AS READ
  const markAllRead = async () => {
    await notificationAPI.markAllAsRead();

    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );

    setUnread(0);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="notif-page fade-in">

      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>

        {unreadCount > 0 && (
          <button className="btn btn-secondary" onClick={markAllRead}>
            <CheckCheck size={15} /> Mark all as read
          </button>
        )}
      </div>

      {/* FILTER LABEL */}
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
        Showing: {filter.toUpperCase()} notifications
      </p>

      {/* FILTER BUTTONS */}
      <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
        <button
          className={`btn ${filter === "all" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setFilter("all")}
        >
          All
        </button>

        <button
          className={`btn ${filter === "read" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setFilter("read")}
        >
          Read
        </button>

        <button
          className={`btn ${filter === "unread" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setFilter("unread")}
        >
          Unread
        </button>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>

      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <Bell size={52} />
          <h3>No notifications yet</h3>
          <p>You'll see notifications here when tasks or projects are assigned.</p>
        </div>

      ) : (
        <>
          {/* LIST */}
          <div className="notif-full-list">
            {notifications.map(n => (
              <div
                key={n.id}
                className={`notif-full-item ${!n.isRead ? 'unread' : ''}`}
                onClick={() => {
                  if (!n.isRead) markAsRead(n.id);
                }}
                style={{ cursor: n.isRead ? "default" : "pointer" }}
              >
                <div
                  className="notif-full-icon"
                  style={{
                    background: TYPE_COLORS[n.type] + '22',
                    color: TYPE_COLORS[n.type]
                  }}
                >
                  {TYPE_ICONS[n.type] || '🔔'}
                </div>

                <div className="notif-full-body">
                  <div className="notif-full-title">{n.title}</div>
                  <div className="notif-full-msg">{n.message}</div>

                  <div className="notif-full-meta">
                    <span className="badge badge-muted" style={{ fontSize: 10 }}>
                      {n.type.replace(/_/g, ' ')}
                    </span>

                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {formatDate(n.createdAt)}
                    </span>
                  </div>
                </div>

                {!n.isRead && <div className="notif-unread-dot" />}
              </div>
            ))}
          </div>

          {/* PAGINATION (ONLY FOR ALL) */}
          {filter === "all" && (
            <div className="pagination" style={{ marginTop: 16 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Page {page + 1}
              </span>

              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                >
                  <ChevronLeft size={14} /> Prev
                </button>

                <button
                  className="btn btn-secondary btn-sm"
                  disabled={notifications.length < PAGE_SIZE}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
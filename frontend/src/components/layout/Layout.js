import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../common/NotificationBell';
// ✅ KEEP ONLY THIS ONE
import {
  LayoutDashboard, FolderKanban, CheckSquare, Users,
  ClipboardList, LogOut, Menu, X, Bell, ChevronRight,
  UserCircle, Settings, BarChart2
} from 'lucide-react';
import './Layout.css';

const navItems = [
  { to: '/',             label: 'Dashboard',     icon: LayoutDashboard, exact: true },
  { to: '/projects',     label: 'Projects',      icon: FolderKanban },
  { to: '/tasks',        label: 'Tasks',         icon: CheckSquare },
  { to: '/notifications',label: 'Notifications', icon: Bell },
];
const adminItems = [
  { to: '/users',        label: 'Users',         icon: Users },
  //{ to: '/audit-logs',   label: 'Audit Logs',    icon: ClipboardList },
  { to: '/reports', label: 'Reports', icon: BarChart2 },
];

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate  = useNavigate();
  const [open, setOpen] = useState(true);

  const handleLogout = () => { logout(); navigate('/login'); };

  const roleColor = { ADMIN:'#ef4444', MANAGER:'#f59e0b', USER:'#22c55e' }[user?.role] || '#9090a8';
  const roleLabel = { ADMIN:'Administrator', MANAGER:'Project Manager', USER:'Team Member' }[user?.role] || user?.role;

  return (
    <div className={`app-layout ${open ? 'sidebar-open' : 'sidebar-collapsed'}`}>
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">TF</div>
            {open && <span className="logo-text">TaskFlow</span>}
          </div>
          <button className="sidebar-toggle btn-ghost btn-icon" onClick={() => setOpen(v => !v)}>
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">{open && 'NAVIGATION'}</div>
          {navItems.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to} to={to} end={exact}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={!open ? label : ''}
            >
              <Icon size={18} />
              {open && <span>{label}</span>}
              {open && <ChevronRight size={14} className="nav-arrow" />}
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <div className="nav-section-label" style={{ marginTop: 16 }}>{open && 'ADMIN'}</div>
              {adminItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to} to={to}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  title={!open ? label : ''}
                >
                  <Icon size={18} />
                  {open && <span>{label}</span>}
                  {open && <ChevronRight size={14} className="nav-arrow" />}
                </NavLink>
              ))}
            </>
          )}

          <div className="nav-section-label" style={{ marginTop: 16 }}>{open && 'ACCOUNT'}</div>
          <NavLink
            to="/profile"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title={!open ? 'Profile' : ''}
          >
            <UserCircle size={18} />
            {open && <span>My Profile</span>}
            {open && <ChevronRight size={14} className="nav-arrow" />}
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-card" onClick={() => navigate('/profile')} style={{ cursor:'pointer' }}>
            <div className="user-avatar" style={{ background: roleColor + '22', color: roleColor }}>
              {user?.fullName?.[0]?.toUpperCase() || 'U'}
            </div>
            {open && (
              <div className="user-info">
                <div className="user-name truncate">{user?.fullName}</div>
                <div className="user-role" style={{ color: roleColor }}>{roleLabel}</div>
              </div>
            )}
          </div>
          <button className="btn btn-ghost btn-icon logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            {!open && (
              <button className="btn btn-ghost btn-icon" onClick={() => setOpen(true)}>
                <Menu size={18} />
              </button>
            )}
          </div>
          <div className="topbar-right">
            <NotificationBell />
            <div className="topbar-user" onClick={() => navigate('/profile')} style={{ cursor:'pointer' }}>
              <div className="user-avatar sm" style={{ background: roleColor + '22', color: roleColor }}>
                {user?.fullName?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="topbar-username">{user?.fullName}</span>
            </div>
          </div>
        </header>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

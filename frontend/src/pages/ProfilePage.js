import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { roleBadge } from '../services/helpers';
import toast from 'react-hot-toast';
import { User, Lock, Save, Eye, EyeOff } from 'lucide-react';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, login } = useAuth();
  const roleColor = { ADMIN: 'var(--danger)', MANAGER: 'var(--warning)', USER: 'var(--success)' }[user?.role];

  // Profile form
  const [profileForm, setProfileForm] = useState({ fullName: user?.fullName || '', email: user?.email || '' });
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingPw, setSavingPw] = useState(false);
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  const saveProfile = async () => {
    if (!profileForm.fullName.trim() || !profileForm.email.trim()) {
      toast.error('Name and email are required');
      return;
    }
    setSavingProfile(true);
    try {
      const res = await api.patch('/profile/update', profileForm);
      // Update localStorage user object
      const updated = { ...user, fullName: res.data.fullName, email: res.data.email };
      localStorage.setItem('user', JSON.stringify(updated));
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally { setSavingProfile(false); }
  };

  const changePassword = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword) {
      toast.error('Please fill all password fields');
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    setSavingPw(true);
    try {
      await api.patch('/profile/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success('Password changed successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setSavingPw(false); }
  };

  const toggle = (field) => setShowPw(p => ({ ...p, [field]: !p[field] }));

  return (
    <div className="profile-page fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your account settings</p>
        </div>
      </div>

      <div className="profile-grid">
        {/* Identity card */}
        <div className="card profile-identity">
          <div className="profile-avatar-lg" style={{ background: roleColor + '22', color: roleColor }}>
            {user?.fullName?.[0]?.toUpperCase()}
          </div>
          <h2 className="profile-name">{user?.fullName}</h2>
          <code className="profile-username">@{user?.username}</code>
          <span className={`badge ${roleBadge[user?.role]}`} style={{ marginTop: 8 }}>{user?.role}</span>
          <div className="profile-meta">
            <div className="profile-meta-row"><span>Email</span><span>{user?.email}</span></div>
            <div className="profile-meta-row"><span>Status</span>
              <span style={{ color: 'var(--success)' }}>● Active</span>
            </div>
          </div>
        </div>

        <div className="profile-forms">
          {/* Edit profile */}
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <User size={16} color="var(--accent)" />
                <span className="card-title">Personal Information</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 4 }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="form-input"
                  value={profileForm.fullName}
                  onChange={e => setProfileForm(f => ({ ...f, fullName: e.target.value }))}
                  placeholder="Your full name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={profileForm.email}
                  onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="your@email.com"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input className="form-input" value={user?.username} disabled style={{ opacity: 0.5 }} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Username cannot be changed</span>
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <input className="form-input" value={user?.role} disabled style={{ opacity: 0.5 }} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Role is managed by administrators</span>
              </div>
              <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={saveProfile} disabled={savingProfile}>
                {savingProfile ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Save size={14} />}
                Save Changes
              </button>
            </div>
          </div>

          {/* Change password */}
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Lock size={16} color="var(--warning)" />
                <span className="card-title">Change Password</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 4 }}>
              {[
                { label: 'Current Password', field: 'currentPassword', key: 'current' },
                { label: 'New Password',     field: 'newPassword',     key: 'new' },
                { label: 'Confirm New Password', field: 'confirmPassword', key: 'confirm' },
              ].map(({ label, field, key }) => (
                <div className="form-group" key={field}>
                  <label className="form-label">{label}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPw[key] ? 'text' : 'password'}
                      className="form-input"
                      placeholder="••••••••"
                      value={pwForm[field]}
                      onChange={e => setPwForm(f => ({ ...f, [field]: e.target.value }))}
                      style={{ paddingRight: 42 }}
                    />
                    <button
                      type="button"
                      className="btn btn-ghost btn-icon"
                      onClick={() => toggle(key)}
                      style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)' }}
                    >
                      {showPw[key] ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              ))}
              <div className="pw-requirements">
                <span>Password requirements:</span>
                <ul>
                  <li className={pwForm.newPassword.length >= 6 ? 'met' : ''}>At least 6 characters</li>
                  <li className={pwForm.newPassword === pwForm.confirmPassword && pwForm.confirmPassword ? 'met' : ''}>Passwords match</li>
                </ul>
              </div>
              <button
                className="btn btn-primary"
                style={{ alignSelf: 'flex-start' }}
                onClick={changePassword}
                disabled={savingPw}
              >
                {savingPw ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Lock size={14} />}
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

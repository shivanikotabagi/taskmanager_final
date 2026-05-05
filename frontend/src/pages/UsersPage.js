import React, { useEffect, useState, useCallback } from 'react';
import { userAPI } from '../services/api';
import { roleBadge, formatDate } from '../services/helpers';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Search, Users, ShieldCheck, UserCog } from 'lucide-react';
import './UsersPage.css';

const ROLES = ['ADMIN','MANAGER','USER'];
const emptyForm = { username:'', email:'', password:'', fullName:'', role:'USER' };

export default function UsersPage() {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser]   = useState(null);
  const [form, setForm]           = useState(emptyForm);
  const [saving, setSaving]       = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userAPI.getAll();
      setUsers(res.data);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openCreate = () => { setEditUser(null); setForm(emptyForm); setShowModal(true); };
  const openEdit   = (u) => {
    setEditUser(u);
    setForm({ username: u.username, email: u.email, password:'', fullName: u.fullName, role: u.role });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.fullName.trim() || !form.email.trim()) { toast.error('Name and email are required'); return; }
    if (!editUser && (!form.username.trim() || !form.password.trim())) { toast.error('Username and password are required for new users'); return; }
    setSaving(true);
    try {
      if (editUser) {
        await userAPI.update(editUser.id, { fullName: form.fullName, email: form.email });
        toast.success('User updated');
      } else {
        await userAPI.create({ username: form.username, email: form.email, password: form.password, fullName: form.fullName, role: form.role });
        toast.success('User created — they will receive a welcome notification');
      }
      setShowModal(false);
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save user'); }
    finally { setSaving(false); }
  };

  const handleToggleActive = async (u) => {
    try {
      await userAPI.update(u.id, { isActive: !u.isActive });
      toast.success(u.isActive ? 'User deactivated' : 'User activated');
      fetchAll();
    } catch { toast.error('Failed to update user'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      await userAPI.delete(id);
      toast.success('User deleted');
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch { toast.error('Failed to delete user'); }
  };

  const roleIcon = { ADMIN: <ShieldCheck size={14} />, MANAGER: <UserCog size={14} />, USER: <Users size={14} /> };
  const roleColor = { ADMIN: 'var(--danger)', MANAGER: 'var(--warning)', USER: 'var(--success)' };

  const filtered = users.filter(u => {
    const matchSearch = u.fullName.toLowerCase().includes(search.toLowerCase())
      || u.username.toLowerCase().includes(search.toLowerCase())
      || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = !filterRole || u.role === filterRole;
    return matchSearch && matchRole;
  });

  // Group counts
  const counts = ROLES.reduce((acc, r) => { acc[r] = users.filter(u => u.role === r).length; return acc; }, {});

  return (
    <div className="users-page fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">{users.length} total user{users.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={15} /> New User
        </button>
      </div>

      {/* Role summary */}
      <div className="role-summary">
        {ROLES.map(r => (
          <button
            key={r}
            className={`role-pill ${filterRole === r ? 'active' : ''}`}
            style={{ '--pill-color': roleColor[r] }}
            onClick={() => setFilterRole(filterRole === r ? '' : r)}
          >
            {roleIcon[r]} {r} <span className="pill-cnt">{counts[r]}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="users-filters">
        <div className="search-wrap">
          <Search size={15} className="search-icon" />
          <input className="form-input search-input" placeholder="Search by name, username, or email…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display:'flex',justifyContent:'center',padding:60 }}><div className="spinner" style={{width:32,height:32}} /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><Users size={48} /><h3>No users found</h3></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th><th>Username</th><th>Email</th><th>Role</th>
                <th>Status</th><th>Created</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div className="user-avatar-table" style={{ background: roleColor[u.role] + '22', color: roleColor[u.role] }}>
                        {u.fullName[0].toUpperCase()}
                      </div>
                      <span style={{ fontWeight:600, fontSize:13 }}>{u.fullName}</span>
                    </div>
                  </td>
                  <td><code style={{ fontFamily:'var(--mono)', fontSize:12, color:'var(--text-secondary)' }}>@{u.username}</code></td>
                  <td style={{ color:'var(--text-secondary)', fontSize:12 }}>{u.email}</td>
                  <td>
                    <span className={`badge ${roleBadge[u.role]}`} style={{ display:'flex', alignItems:'center', gap:4, width:'fit-content' }}>
                      {roleIcon[u.role]} {u.role}
                    </span>
                  </td>
                  <td>
                    <button className={`status-toggle ${u.isActive ? 'active' : 'inactive'}`} onClick={() => handleToggleActive(u)}>
                      <span className="toggle-dot" />
                      {u.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td style={{ color:'var(--text-muted)', fontSize:12, fontFamily:'var(--mono)' }}>{formatDate(u.createdAt)}</td>
                  <td>
                    <div style={{ display:'flex', gap:4 }}>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(u)} title="Edit"><Pencil size={13} /></button>
                      <button className="btn btn-ghost btn-icon btn-sm" style={{ color:'var(--danger)' }} onClick={() => handleDelete(u.id)} title="Delete"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editUser ? 'Edit User' : 'Create User'}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" placeholder="John Doe" value={form.fullName} onChange={e => setForm(f=>({...f,fullName:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input type="email" className="form-input" placeholder="john@example.com" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} />
              </div>
              {!editUser && (
                <>
                  <div className="form-group">
                    <label className="form-label">Username *</label>
                    <input className="form-input" placeholder="johndoe" value={form.username} onChange={e => setForm(f=>({...f,username:e.target.value}))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password *</label>
                    <input type="password" className="form-input" placeholder="Min 6 characters" value={form.password} onChange={e => setForm(f=>({...f,password:e.target.value}))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <select className="form-input" value={form.role} onChange={e => setForm(f=>({...f,role:e.target.value}))}>
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <span className="spinner" style={{width:14,height:14}} /> : null}
                {editUser ? 'Save Changes' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { projectStatusBadge, priorityBadge, formatDate } from '../services/helpers';
import toast from 'react-hot-toast';
import { Plus, FolderKanban, Search, Pencil, Trash2, X, Users } from 'lucide-react';
import './ProjectsPage.css';

const STATUSES   = ['PLANNING','ACTIVE','ON_HOLD','COMPLETED','CANCELLED'];
const PRIORITIES = ['LOW','MEDIUM','HIGH','CRITICAL'];

const emptyForm = { name:'', description:'', status:'PLANNING', priority:'MEDIUM', startDate:'', endDate:'', managerId:'' };

export default function ProjectsPage() {
  const { isAdmin } = useAuth();
  const navigate    = useNavigate();
  const [projects, setProjects]   = useState([]);
  const [managers, setManagers]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filterStatus, setFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEdit]    = useState(null);
  const [form, setForm]           = useState(emptyForm);
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes] = await Promise.all([projectAPI.getAll()]);
      setProjects(pRes.data);
      if (isAdmin) {
        const mRes = await userAPI.getManagers();
        setManagers(mRes.data);
      }
    } catch { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  }, [isAdmin]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openCreate = () => { setEdit(null); setForm(emptyForm); setShowModal(true); };
  const openEdit   = (p, e) => {
    e.stopPropagation();
    setEdit(p);
    setForm({
      name: p.name, description: p.description || '',
      status: p.status, priority: p.priority,
      startDate: p.startDate || '', endDate: p.endDate || '',
      managerId: p.manager?.id || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Project name is required'); return; }
    setSaving(true);
    try {
      const payload = { ...form, managerId: form.managerId || null };
      if (editProject) {
        await projectAPI.update(editProject.id, payload);
        toast.success('Project updated');
      } else {
        await projectAPI.create(payload);
        toast.success('Project created');
      }
      setShowModal(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save project');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this project? All tasks will be removed.')) return;
    setDeleting(id);
    try {
      await projectAPI.delete(id);
      toast.success('Project deleted');
      fetchAll();
    } catch { toast.error('Failed to delete project'); }
    finally { setDeleting(null); }
  };

  const filtered = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="projects-page fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} total project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} /> New Project
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="projects-filters">
        <div className="search-wrap">
          <Search size={15} className="search-icon" />
          <input
            className="form-input search-input"
            placeholder="Search projects…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="form-input filter-select" value={filterStatus} onChange={e => setFilter(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Projects grid */}
      {loading ? (
        <div className="loading-center"><div className="spinner" style={{ width:32, height:32 }} /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <FolderKanban size={48} />
          <h3>{search || filterStatus ? 'No projects match your filters' : 'No projects yet'}</h3>
          {isAdmin && !search && <button className="btn btn-primary" onClick={openCreate}><Plus size={15} /> Create first project</button>}
        </div>
      ) : (
        <div className="projects-grid">
          {filtered.map(p => (
            <div key={p.id} className="project-card" onClick={() => navigate(`/projects/${p.id}`)}>
              <div className="project-card-header">
                <div className="project-card-status">
                  <span className={`badge ${projectStatusBadge[p.status]}`}>{p.status.replace('_',' ')}</span>
                  <span className={`badge ${priorityBadge[p.priority]}`}>{p.priority}</span>
                </div>
                {isAdmin && (
                  <div className="project-card-actions" onClick={e => e.stopPropagation()}>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={e => openEdit(p, e)} title="Edit">
                      <Pencil size={14} />
                    </button>
                    <button
                      className="btn btn-ghost btn-icon btn-sm"
                      style={{ color:'var(--danger)' }}
                      onClick={e => handleDelete(p.id, e)}
                      disabled={deleting === p.id}
                      title="Delete"
                    >
                      {deleting === p.id ? <span className="spinner" style={{width:12,height:12}} /> : <Trash2 size={14} />}
                    </button>
                  </div>
                )}
              </div>
              <h3 className="project-card-name">{p.name}</h3>
              {p.description && <p className="project-card-desc">{p.description}</p>}
              <div className="project-card-meta">
                <div className="project-meta-item">
                  <Users size={12} />
                  <span>{p.manager ? p.manager.fullName : 'No manager'}</span>
                </div>
                <div className="project-meta-item">
                  <FolderKanban size={12} />
                  <span>{p.taskCount ?? 0} tasks</span>
                </div>
              </div>
              {(p.startDate || p.endDate) && (
                <div className="project-card-dates">
                  {p.startDate && <span>{formatDate(p.startDate)}</span>}
                  {p.startDate && p.endDate && <span>→</span>}
                  {p.endDate && <span>{formatDate(p.endDate)}</span>}
                </div>
              )}
              <div className="project-card-members">
                {(p.members || []).slice(0,5).map(m => (
                  <div key={m.id} className="member-avatar" title={m.fullName}>
                    {m.fullName[0].toUpperCase()}
                  </div>
                ))}
                {(p.members?.length || 0) > 5 && (
                  <div className="member-avatar more">+{p.members.length - 5}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editProject ? 'Edit Project' : 'New Project'}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Project Name *</label>
                <input className="form-input" placeholder="Enter project name" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" placeholder="Project description…" rows={3} value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-input" value={form.status} onChange={e => setForm(f=>({...f,status:e.target.value}))}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select className="form-input" value={form.priority} onChange={e => setForm(f=>({...f,priority:e.target.value}))}>
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              {managers.length > 0 && (
                <div className="form-group">
                  <label className="form-label">Assign Manager</label>
                  <select className="form-input" value={form.managerId} onChange={e => setForm(f=>({...f,managerId:e.target.value}))}>
                    <option value="">— No manager —</option>
                    {managers.map(m => <option key={m.id} value={m.id}>{m.fullName}</option>)}
                  </select>
                </div>
              )}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input type="date" className="form-input" value={form.startDate} onChange={e => setForm(f=>({...f,startDate:e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input type="date" className="form-input" value={form.endDate} onChange={e => setForm(f=>({...f,endDate:e.target.value}))} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <span className="spinner" style={{width:14,height:14}} /> : null}
                {editProject ? 'Update' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

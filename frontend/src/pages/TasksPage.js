import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskAPI, projectAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { taskStatusBadge, priorityBadge, formatDate } from '../services/helpers';
import toast from 'react-hot-toast';
import { CheckSquare, Search, Pencil, Trash2, X, Plus, ExternalLink } from 'lucide-react';
import './TasksPage.css';

const TASK_STATUSES = ['TODO','IN_PROGRESS','IN_REVIEW','DONE','CANCELLED'];
const PRIORITIES    = ['LOW','MEDIUM','HIGH','CRITICAL'];

export default function TasksPage() {
  const { isAdmin, isManager } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks]       = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask]   = useState(null);
  const [form, setForm]           = useState({ title:'', description:'', status:'TODO', priority:'MEDIUM', projectId:'', assignedToId:'', dueDate:'' });
  const [saving, setSaving]       = useState(false);
  const [projectMembers, setProjectMembers] = useState([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [tRes, pRes] = await Promise.all([taskAPI.getAll(), projectAPI.getAll()]);
      setTasks(tRes.data);
      setProjects(pRes.data);
    } catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // When project changes in form, load its members
  useEffect(() => {
    if (form.projectId) {
      const proj = projects.find(p => String(p.id) === String(form.projectId));
      setProjectMembers(proj?.members || []);
    } else { setProjectMembers([]); }
  }, [form.projectId, projects]);

  const openCreate = () => {
    setEditTask(null);
    setForm({ title:'', description:'', status:'TODO', priority:'MEDIUM', projectId:'', assignedToId:'', dueDate:'' });
    setShowModal(true);
  };
  const openEdit = (t) => {
    setEditTask(t);
    setForm({
      title: t.title, description: t.description || '',
      status: t.status, priority: t.priority,
      projectId: t.projectId || '', assignedToId: t.assignedTo?.id || '',
      dueDate: t.dueDate || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Task title is required'); return; }
    if (!form.projectId) { toast.error('Please select a project'); return; }
    setSaving(true);
    try {
      const payload = { ...form, assignedToId: form.assignedToId || null, projectId: Number(form.projectId) };
      if (editTask) { await taskAPI.update(editTask.id, payload); toast.success('Task updated'); }
      else          { await taskAPI.create(payload);              toast.success('Task created'); }
      setShowModal(false);
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save task'); }
    finally { setSaving(false); }
  };

  //10 April
  const updateStatus = async (taskId, status) => {
  try {
    await taskAPI.updateStatus(taskId, status); // we'll define this in API
    toast.success("Status updated");
    fetchAll(); // refresh tasks
  } catch (err) {
    toast.error("Failed to update status");
  }
};



  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await taskAPI.delete(id);
      toast.success('Task deleted');
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch { toast.error('Failed to delete task'); }
  };

  const filtered = tasks.filter(t => {
    const matchSearch   = t.title.toLowerCase().includes(search.toLowerCase()) || (t.projectName||'').toLowerCase().includes(search.toLowerCase());
    const matchStatus   = !filterStatus   || t.status   === filterStatus;
    const matchPriority = !filterPriority || t.priority === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });

  return (
    <div className="tasks-page fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">{tasks.length} total task{tasks.length !== 1 ? 's' : ''}</p>
        </div>
        {isManager && (
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={15} /> New Task
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="tasks-filters">
        <div className="search-wrap">
          <Search size={15} className="search-icon" />
          <input className="form-input search-input" placeholder="Search tasks or projects…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-input filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All statuses</option>
          {TASK_STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
        </select>
        <select className="form-input filter-select" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          <option value="">All priorities</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Status summary pills */}
      <div className="status-pills">
        {TASK_STATUSES.map(s => {
          const count = tasks.filter(t => t.status === s).length;
          return (
            <button
              key={s}
              className={`status-pill ${filterStatus === s ? 'active' : ''}`}
              onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
            >
              <span className={`badge ${taskStatusBadge[s]}`}>{s.replace('_',' ')}</span>
              <span className="pill-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-center"><div className="spinner" style={{ width:32,height:32 }} /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <CheckSquare size={48} />
          <h3>{search || filterStatus || filterPriority ? 'No tasks match your filters' : 'No tasks yet'}</h3>
          {isManager && !search && (
            <button className="btn btn-primary" onClick={openCreate}>
              <Plus size={15} /> Create first task
            </button>
          )}
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Task</th><th>Project</th><th>Status</th><th>Priority</th>
                <th>Assigned To</th><th>Due Date</th>
                {isManager && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td>
                    <div className="task-title-cell">
                      <span className="task-title-text">{t.title}</span>
                      {t.description && <span className="task-desc-preview">{t.description}</span>}
                    </div>
                  </td>
                  <td>
                    <button
                      className="btn btn-ghost btn-sm project-link"
                      onClick={() => navigate(`/projects/${t.projectId}`)}
                    >
                      {t.projectName} <ExternalLink size={11} />
                    </button>
                  </td>
                  {/*<td><span className={`badge ${taskStatusBadge[t.status]}`}>{t.status.replace('_',' ')}</span></td>*/}
                  {/*10 April*/}
                  <td>
  {(!isAdmin && !isManager) ? (
    <select
      className="form-input"
      value={t.status}
      onChange={(e) => updateStatus(t.id, e.target.value)}
    >
      <option value="TODO">Pending</option>
      <option value="IN_PROGRESS">In Progress</option>
      <option value="DONE">Completed</option>
    </select>
  ) : (
    <span className={`badge ${taskStatusBadge[t.status]}`}>
      {t.status.replace('_',' ')}
    </span>
  )}
</td>
                  <td><span className={`badge ${priorityBadge[t.priority]}`}>{t.priority}</span></td>
                  <td>
                    {t.assignedTo
                      ? <div style={{display:'flex',alignItems:'center',gap:6}}>
                          <div className="member-avatar">{t.assignedTo.fullName[0]}</div>
                          <span style={{fontSize:12}}>{t.assignedTo.fullName}</span>
                        </div>
                      : <span style={{color:'var(--text-muted)',fontSize:12}}>Unassigned</span>
                    }
                  </td>
                  <td>
                    {t.dueDate
                      ? <span className={`due-date ${new Date(t.dueDate) < new Date() && t.status !== 'DONE' ? 'overdue' : ''}`}>
                          {formatDate(t.dueDate)}
                        </span>
                      : <span style={{color:'var(--text-muted)'}}>—</span>
                    }
                  </td>
                  {isManager && (
                    <td>
                      <div style={{display:'flex',gap:4}}>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(t)}><Pencil size={13} /></button>
                        <button className="btn btn-ghost btn-icon btn-sm" style={{color:'var(--danger)'}} onClick={() => handleDelete(t.id)}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Task modal */}
      {showModal && isManager && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editTask ? 'Edit Task' : 'New Task'}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-input" placeholder="Task title" value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={2} placeholder="Description…" value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Project *</label>
                <select className="form-input" value={form.projectId} onChange={e => setForm(f=>({...f,projectId:e.target.value,assignedToId:''}))}>
                  <option value="">— Select project —</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-input" value={form.status} onChange={e => setForm(f=>({...f,status:e.target.value}))}>
                    {TASK_STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select className="form-input" value={form.priority} onChange={e => setForm(f=>({...f,priority:e.target.value}))}>
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Assign To</label>
                <select className="form-input" value={form.assignedToId} onChange={e => setForm(f=>({...f,assignedToId:e.target.value}))} disabled={!form.projectId}>
                  <option value="">— Unassigned —</option>
                  {projectMembers.map(m => <option key={m.id} value={m.id}>{m.fullName}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input type="date" className="form-input" value={form.dueDate} onChange={e => setForm(f=>({...f,dueDate:e.target.value}))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <span className="spinner" style={{width:14,height:14}} /> : null}
                {editTask ? 'Update' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

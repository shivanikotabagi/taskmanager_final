import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectAPI, taskAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { projectStatusBadge, taskStatusBadge, priorityBadge, formatDate } from '../services/helpers';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Pencil, Trash2, X, Users, UserPlus, UserMinus, CheckSquare } from 'lucide-react';
import './ProjectDetailPage.css';


const TASK_STATUSES = ['TODO','IN_PROGRESS','IN_REVIEW','DONE','CANCELLED'];
const PRIORITIES    = ['LOW','MEDIUM','HIGH','CRITICAL'];
const emptyTask = { title:'', description:'', status:'TODO', priority:'MEDIUM', assignedToId:'', dueDate:'', projectId:'' };

export default function ProjectDetailPage() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { isAdmin, isManager, user } = useAuth();

  const [project, setProject]     = useState(null);
  const [tasks, setTasks]         = useState([]);
  const [allUsers, setAllUsers]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState('tasks');

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editTask, setEditTask]   = useState(null);
  const [taskForm, setTaskForm]   = useState(emptyTask);
  const [savingTask, setSavingTask] = useState(false);

  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedUsers, setSelectedUsers]     = useState([]);
  const [addingMembers, setAddingMembers]     = useState(false);

  const [historyModal, setHistoryModal] = useState(false);
  const [taskHistory, setTaskHistory] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);

  
  const canManage = isManager && project?.manager?.id === user?.id;

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, tRes] = await Promise.all([projectAPI.getById(id), taskAPI.getByProject(id)]);
      setProject(pRes.data);
      setTasks(tRes.data);
      if (isAdmin) {
        const uRes = await userAPI.getMembers();
        setAllUsers(uRes.data);
      }
    } catch { toast.error('Failed to load project'); navigate('/projects'); }
    finally { setLoading(false); }
  }, [id, isAdmin, navigate]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Task modal
  const openCreateTask = () => {
    setEditTask(null);
    setTaskForm({ ...emptyTask, projectId: id });
    setShowTaskModal(true);
  };
  const openEditTask = (t) => {
    setEditTask(t);
    setTaskForm({
      title: t.title, description: t.description || '',
      status: t.status, priority: t.priority,
      assignedToId: t.assignedTo?.id || '',
      dueDate: t.dueDate || '',
      projectId: id,
    });
    setShowTaskModal(true);
  };

  const saveTask = async () => {
    if (!taskForm.title.trim()) { toast.error('Task title required'); return; }
    setSavingTask(true);
    try {
      const payload = { ...taskForm, assignedToId: taskForm.assignedToId || null };
      if (editTask) {
        await taskAPI.update(editTask.id, payload);
        toast.success('Task updated');
      } else {
        await taskAPI.create(payload);
        toast.success('Task created');
      }
      setShowTaskModal(false);
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save task'); }
    finally { setSavingTask(false); }
  };

  const viewHistory = async (task) => {
  try {
    const res = await taskAPI.getHistory(task.id);
    setTaskHistory(res.data);
    setSelectedTask(task);
    setHistoryModal(true);
  } catch {
    toast.error("Failed to load history");
  }
};

// ✅ ADD THIS RIGHT HERE
const restoreHistory = async (historyId) => {
  if (!window.confirm('Restore task to this previous state?')) return;
  try {
    await taskAPI.restoreHistory(selectedTask.id, historyId);
    toast.success('Task restored successfully!');
    setHistoryModal(false);
    fetchAll(); // refresh kanban board
  } catch {
    toast.error('Failed to restore task');
  }
};

  const deleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await taskAPI.delete(taskId);
      toast.success('Task deleted');
      fetchAll();
    } catch { toast.error('Failed to delete task'); }
  };

  // Member management
  const openAddMembers = () => { setSelectedUsers([]); setShowMemberModal(true); };

  const addMembers = async () => {
    if (!selectedUsers.length) { toast.error('Select at least one user'); return; }
    setAddingMembers(true);
    try {
      await projectAPI.assignMembers(id, { userIds: selectedUsers });
      toast.success('Members added');
      setShowMemberModal(false);
      fetchAll();
    } catch { toast.error('Failed to add members'); }
    finally { setAddingMembers(false); }
  };

  const removeMember = async (userId) => {
    if (!window.confirm('Remove this member from the project?')) return;
    try {
      await projectAPI.removeMember(id, userId);
      toast.success('Member removed');
      fetchAll();
    } catch { toast.error('Failed to remove member'); }
  };

  // Non-member users for adding
  const memberIds = new Set((project?.members || []).map(m => m.id));
  const nonMembers = allUsers.filter(u => !memberIds.has(u.id));

  if (loading) return (
    <div className="loading-center"><div className="spinner" style={{ width:32, height:32 }} /></div>
  );
  if (!project) return null;

  const tasksByStatus = TASK_STATUSES.reduce((acc, s) => {
    acc[s] = tasks.filter(t => t.status === s);
    return acc;
  }, {});

  return (
    <div className="project-detail fade-in">
      {/* Header */}
      <div className="detail-header">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/projects')}>
          <ArrowLeft size={15} /> Back
        </button>
        <div className="detail-title-area">
          <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
            <h1 className="page-title">{project.name}</h1>
            <span className={`badge ${projectStatusBadge[project.status]}`}>{project.status.replace('_',' ')}</span>
            <span className={`badge ${priorityBadge[project.priority]}`}>{project.priority}</span>
          </div>
          {project.description && <p className="page-subtitle">{project.description}</p>}
        </div>
        <div className="detail-header-meta">
          {project.manager && <div className="meta-chip">👤 {project.manager.fullName}</div>}
          {project.startDate && <div className="meta-chip">📅 {formatDate(project.startDate)} → {formatDate(project.endDate)}</div>}
        </div>
      </div>

      {/* Tabs */}
      <div className="detail-tabs">
        <button className={`tab-btn ${tab==='tasks' ? 'active' : ''}`} onClick={() => setTab('tasks')}>
          <CheckSquare size={15} /> Tasks ({tasks.length})
        </button>
        <button className={`tab-btn ${tab==='members' ? 'active' : ''}`} onClick={() => setTab('members')}>
          <Users size={15} /> Members ({project.members?.length || 0})
        </button>
      </div>

      {/* Tasks tab */}
      {tab === 'tasks' && (
        <>
          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:16 }}>
            {/*{canManage && (
              <button className="btn btn-primary" onClick={openCreateTask}>
                <Plus size={15} /> Add Task
              </button>
            )}*/}
            {canManage &&(
            <button className="btn btn-primary" onClick={openCreateTask}>
            <Plus size={15} /> Add Task
            </button>
          )}
          </div>
          {tasks.length === 0 ? (
            <div className="empty-state">
              <CheckSquare size={48} />
              <h3>No tasks yet</h3>
              {/*{canManage && <button className="btn btn-primary" onClick={openCreateTask}><Plus size={15} /> Add first task</button>}*/}
              {canManage && (
              <button className="btn btn-primary" onClick={openCreateTask}>
              <Plus size={15} /> Add first task
              </button>
              )}
            </div>
          ) : (
            <div className="kanban-board">
              {TASK_STATUSES.filter(s => s !== 'CANCELLED').map(status => (
                <div key={status} className="kanban-col">
                  <div className="kanban-col-header">
                    <span className={`badge ${taskStatusBadge[status]}`}>{status.replace('_',' ')}</span>
                    <span className="kanban-count">{tasksByStatus[status].length}</span>
                  </div>
                  <div className="kanban-tasks">
                    {tasksByStatus[status].map(t => (
                      <div key={t.id} className="task-card">
                        <div className="task-card-top">
                          <span className={`badge ${priorityBadge[t.priority]}`}>{t.priority}</span>
                          {(isAdmin || canManage) && (
  <div className="task-card-actions">

    {/* HISTORY BUTTON */}
    {canManage && (
      <button 
        className="btn btn-ghost btn-icon"
        style={{padding:3}}
        onClick={() => viewHistory(t)}
      >
        📜
      </button>
    )}

    {/* EDIT + DELETE */}
    {canManage && (
      <>
        <button className="btn btn-ghost btn-icon" onClick={() => openEditTask(t)}>
          <Pencil size={12} />
        </button>

        <button className="btn btn-ghost btn-icon" onClick={() => deleteTask(t.id)}>
          <Trash2 size={12} />
        </button>
      </>
    )}

  </div>
)}
                        </div>
                        <div className="task-card-title">{t.title}</div>
                        {t.description && <div className="task-card-desc">{t.description}</div>}
                        <div className="task-card-footer">
                          {t.assignedTo && (
                            <div className="task-assignee">
                              <div className="member-avatar" style={{width:20,height:20,fontSize:9}}>
                                {t.assignedTo.fullName[0]}
                              </div>
                              <span>{t.assignedTo.fullName}</span>
                            </div>
                          )}
                          {t.dueDate && (
                            <span className={`task-due ${new Date(t.dueDate) < new Date() && t.status !== 'DONE' ? 'overdue' : ''}`}>
                              📅 {formatDate(t.dueDate)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Members tab */}
      {tab === 'members' && (
        <>
          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:16 }}>
            {isAdmin && (
              <button className="btn btn-primary" onClick={openAddMembers}>
                <UserPlus size={15} /> Add Members
              </button>
            )}
          </div>
          {(!project.members || project.members.length === 0) ? (
            <div className="empty-state"><Users size={48} /><h3>No members yet</h3></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Name</th><th>Username</th><th>Email</th><th>Role</th>{isAdmin && <th>Action</th>}</tr></thead>
                <tbody>
                  {project.members.map(m => (
                    <tr key={m.id}>
                      <td><div style={{display:'flex',alignItems:'center',gap:8}}><div className="member-avatar">{m.fullName[0]}</div>{m.fullName}</div></td>
                      <td><code style={{fontFamily:'var(--mono)',fontSize:12}}>{m.username}</code></td>
                      <td style={{color:'var(--text-secondary)'}}>{m.email}</td>
                      <td><span className="badge badge-info">{m.role}</span></td>
                      {isAdmin && (
                        <td>
                          <button className="btn btn-danger btn-sm" onClick={() => removeMember(m.id)}>
                            <UserMinus size={13} /> Remove
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Task modal */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editTask ? 'Edit Task' : 'New Task'}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowTaskModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-input" placeholder="Task title" value={taskForm.title} onChange={e => setTaskForm(f=>({...f,title:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={2} placeholder="Task description…" value={taskForm.description} onChange={e => setTaskForm(f=>({...f,description:e.target.value}))} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-input" value={taskForm.status} onChange={e => setTaskForm(f=>({...f,status:e.target.value}))}>
                    {TASK_STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select className="form-input" value={taskForm.priority} onChange={e => setTaskForm(f=>({...f,priority:e.target.value}))}>
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Assign To</label>
                <select className="form-input" value={taskForm.assignedToId} onChange={e => setTaskForm(f=>({...f,assignedToId:e.target.value}))}>
                  <option value="">— Unassigned —</option>
                  {(project.members || []).map(m => <option key={m.id} value={m.id}>{m.fullName}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input type="date" className="form-input" value={taskForm.dueDate} onChange={e => setTaskForm(f=>({...f,dueDate:e.target.value}))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveTask} disabled={savingTask}>
                {savingTask ? <span className="spinner" style={{width:14,height:14}} /> : null}
                {editTask ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add members modal */}
      {showMemberModal && (
        <div className="modal-overlay" onClick={() => setShowMemberModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Members</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowMemberModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              {nonMembers.length === 0 ? (
                <p style={{color:'var(--text-muted)',textAlign:'center',padding:'24px 0'}}>All users are already members of this project.</p>
              ) : (
                <div className="member-select-list">
                  {nonMembers.map(u => (
                    <label key={u.id} className="member-select-item">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(u.id)}
                        onChange={e => setSelectedUsers(prev => e.target.checked ? [...prev, u.id] : prev.filter(i => i !== u.id))}
                      />
                      <div className="member-avatar">{u.fullName[0]}</div>
                      <div>
                        <div style={{fontSize:13,fontWeight:600}}>{u.fullName}</div>
                        <div style={{fontSize:11,color:'var(--text-muted)'}}>{u.email}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowMemberModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={addMembers} disabled={addingMembers || !selectedUsers.length}>
                {addingMembers ? <span className="spinner" style={{width:14,height:14}} /> : <UserPlus size={14} />}
                Add {selectedUsers.length > 0 ? `(${selectedUsers.length})` : ''} Members
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task History Modal */}
      {/*{historyModal && (
        <div className="modal-overlay" onClick={() => setHistoryModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Task History</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setHistoryModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              {taskHistory.length === 0 ? (
                <p style={{color:'var(--text-muted)',textAlign:'center',padding:'24px 0'}}>No history available for this task.</p>
              ) : (
                <div className="task-history-list">
                  {taskHistory.map(h => (
                    <div key={h.id} className="task-history-item">
                      <div style={{fontWeight:600}}>{h.action}</div>
                      <div style={{fontSize:12,color:'var(--text-muted)'}}>{h.timestamp}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setHistoryModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}*/}

    {historyModal && (
  <div className="modal-overlay" onClick={() => setHistoryModal(false)}>
    <div className="modal" style={{ maxWidth: 800 }} onClick={e => e.stopPropagation()}>

      <div className="modal-header">
        <h2>📜 Task History — {selectedTask?.title}</h2>
        <button className="btn btn-ghost btn-icon" onClick={() => setHistoryModal(false)}>
          <X size={18} />
        </button>
      </div>

      <div className="modal-body">
        {taskHistory.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>
            No history available for this task.
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>What Changed</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Changed By</th>
                <th>Date</th>
                {canManage && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {taskHistory.map((h, index) => (
                <tr key={h.id}>

                  {/* What Changed badge */}
                  <td>
                    <span style={{
                      background: h.changeType?.startsWith('Restored')
                        ? '#f59e0b'           // orange for restores
                        : h.changeType?.startsWith('Before Restore')
                        ? '#6b7280'           // gray for pre-restore snapshots
                        : 'var(--primary)',   // blue for normal changes
                      color: '#fff',
                      borderRadius: 4,
                      padding: '2px 8px',
                      fontSize: 11,
                      whiteSpace: 'nowrap'
                    }}>
                      {h.changeType || 'Updated'}
                    </span>
                  </td>

                  <td>{h.status}</td>
                  <td>{h.priority}</td>
                  <td>{h.changedBy}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {new Date(h.changedAt).toLocaleString()}
                  </td>

                  {/* Restore button — only manager, only not on latest entry */}
                  {canManage && (
                  <td>
                    {!h.changeType?.startsWith('Before Restore') && (
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => restoreHistory(h.id)}
                        style={{ fontSize: 11, whiteSpace: 'nowrap' }}
                      >
                        ↩ Restore
                      </button>
                    )}
                  </td>
                )}

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={() => setHistoryModal(false)}>
          Close
        </button>
      </div>

    </div>
  </div>
)}
    </div>
  );
}

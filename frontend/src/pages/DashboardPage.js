import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectAPI, taskAPI } from '../services/api';
import api from '../services/api';
import { projectStatusBadge, taskStatusBadge, priorityBadge, formatDate } from '../services/helpers';
import { FolderKanban, CheckSquare, Users, TrendingUp, ArrowRight, AlertCircle } from 'lucide-react';
import PageLoader from '../components/common/PageLoader';
import './DashboardPage.css';

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats]       = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks]       = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, pRes, tRes] = await Promise.all([
          api.get('/dashboard/stats'),
          projectAPI.getAll(),
          taskAPI.getAll(),
        ]);
        setStats(statsRes.data);
        setProjects(pRes.data);
        setTasks(tRes.data);
      } catch {} finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <PageLoader text="Loading dashboard..." />;

  const recentProjects = [...projects].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5);
  const myTasks = tasks.filter(t => t.assignedTo?.id === user?.id).slice(0,5);
  const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE' && t.status !== 'CANCELLED');
  const totalTasks = stats?.totalTasks ?? 0;
  const roleColor = { ADMIN:'var(--danger)', MANAGER:'var(--warning)', USER:'var(--success)' }[user?.role];

  const breakdown = [
    { label:'To Do',       count:stats?.todoTasks??0,       color:'var(--text-muted)' },
    { label:'In Progress', count:stats?.inProgressTasks??0, color:'var(--info)' },
    { label:'In Review',   count:stats?.inReviewTasks??0,   color:'var(--warning)' },
    { label:'Done',        count:stats?.doneTasks??0,        color:'var(--success)' },
  ];

  return (
    <div className="dashboard fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Good {getGreeting()}, {user?.fullName?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here's what's happening with your projects today.</p>
        </div>
        <div className="dash-role-chip" style={{background:roleColor+'22',color:roleColor}}>{user?.role}</div>
      </div>

      <div className="stats-grid">
        {[
          { icon:<FolderKanban size={20}/>, bg:'var(--accent-dim)', clr:'var(--accent)', val:stats?.totalProjects??0, label:'Total Projects', sub:`${projects.filter(p=>p.status==='ACTIVE').length} active`, to:'/projects' },
          { icon:<CheckSquare size={20}/>, bg:'var(--info-dim)', clr:'var(--info)', val:totalTasks, label:'Total Tasks', sub:`${stats?.todoTasks??0} pending`, to:'/tasks' },
          { icon:<TrendingUp size={20}/>, bg:'var(--success-dim)', clr:'var(--success)', val:`${stats?.completionRate??0}%`, label:'Completion Rate', sub:`${stats?.doneTasks??0} of ${totalTasks} done`, to:'/tasks' },
          ...(isAdmin ? [{ icon:<Users size={20}/>, bg:'var(--warning-dim)', clr:'var(--warning)', val:stats?.totalUsers??0, label:'Team Members', sub:`${stats?.totalManagers??0} managers`, to:'/users' }] : []),
        ].map((s,i) => (
          <div key={i} className="stat-card" onClick={()=>navigate(s.to)} style={{cursor:'pointer'}}>
            <div className="stat-icon" style={{background:s.bg}}><span style={{color:s.clr}}>{s.icon}</span></div>
            <div className="stat-value">{s.val}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {overdueTasks.length > 0 && (
        <div className="overdue-alert">
          <AlertCircle size={16}/>
          <span><strong>{overdueTasks.length}</strong> task{overdueTasks.length>1?'s are':' is'} overdue</span>
          <button className="btn btn-ghost btn-sm" onClick={()=>navigate('/tasks')}>View →</button>
        </div>
      )}

      <div className="card" style={{marginBottom:24}}>
        <div className="card-header">
          <span className="card-title">Task Overview</span>
          <span style={{color:'var(--text-muted)',fontSize:12}}>{totalTasks} total</span>
        </div>
        <div className="task-progress-bars">
          {breakdown.map(({label,count,color})=>(
            <div key={label} className="progress-row">
              <div className="progress-label">
                <span style={{color:'var(--text-secondary)'}}>{label}</span>
                <span style={{color:'var(--text-secondary)',fontFamily:'var(--mono)',fontSize:12}}>
                  {count}{totalTasks>0?` (${Math.round(count/totalTasks*100)}%)`:''}
                </span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{width:totalTasks?`${count/totalTasks*100}%`:'0%',background:color}}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Projects</span>
            <button className="btn btn-ghost btn-sm" onClick={()=>navigate('/projects')}>View all <ArrowRight size={13}/></button>
          </div>
          {recentProjects.length===0
            ? <div className="empty-state" style={{padding:32}}><FolderKanban size={32}/><p>No projects yet</p></div>
            : recentProjects.map(p=>(
              <div key={p.id} className="dash-item" onClick={()=>navigate(`/projects/${p.id}`)}>
                <div className="dash-item-main">
                  <div className="dash-item-name">{p.name}</div>
                  <div className="dash-item-meta">{p.manager?`👤 ${p.manager.fullName}`:'No manager'} · {p.taskCount??0} tasks</div>
                </div>
                <span className={`badge ${projectStatusBadge[p.status]}`}>{p.status.replace('_',' ')}</span>
              </div>
            ))
          }
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">{overdueTasks.length>0?'⚠️ Overdue Tasks':'My Tasks'}</span>
            <button className="btn btn-ghost btn-sm" onClick={()=>navigate('/tasks')}>View all <ArrowRight size={13}/></button>
          </div>
          {(() => {
            const list = overdueTasks.length>0 ? overdueTasks.slice(0,5) : myTasks;
            return list.length===0
              ? <div className="empty-state" style={{padding:32}}><CheckSquare size={32}/><p>No tasks</p></div>
              : list.map(t=>(
                <div key={t.id} className="dash-item" onClick={()=>navigate('/tasks')}>
                  <div className="dash-item-main">
                    <div className="dash-item-name">{t.title}</div>
                    <div className="dash-item-meta">{t.projectName} · Due {formatDate(t.dueDate)}</div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:4,alignItems:'flex-end'}}>
                    <span className={`badge ${taskStatusBadge[t.status]}`}>{t.status.replace('_',' ')}</span>
                    <span className={`badge ${priorityBadge[t.priority]}`}>{t.priority}</span>
                  </div>
                </div>
              ));
          })()}
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}

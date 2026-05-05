import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
  Users, CheckCircle2, Clock, AlertCircle, XCircle,
  ChevronDown, ChevronRight, Search, RefreshCw,
  TrendingUp, BarChart2, ArrowLeft
} from 'lucide-react';

// ── helpers ────────────────────────────────────────────────────────────────
const STATUS_META = {
  DONE:        { label: 'Completed',   color: '#22c55e', bg: '#22c55e18' },
  IN_PROGRESS: { label: 'In Progress', color: '#3b82f6', bg: '#3b82f618' },
  IN_REVIEW:   { label: 'In Review',   color: '#f59e0b', bg: '#f59e0b18' },
  TODO:        { label: 'To Do',       color: '#9090a8', bg: '#9090a818' },
  CANCELLED:   { label: 'Cancelled',   color: '#ef4444', bg: '#ef444418' },
};

const PRIORITY_META = {
  HIGH:   { label: 'High',   color: '#ef4444' },
  MEDIUM: { label: 'Medium', color: '#f59e0b' },
  LOW:    { label: 'Low',    color: '#22c55e' },
};

function StatusBadge({ status }) {
  const m = STATUS_META[status] || { label: status, color: '#9090a8', bg: '#9090a818' };
  return (
    <span style={{
      padding: '2px 10px', borderRadius: 20, fontSize: 12,
      color: m.color, background: m.bg, fontWeight: 600, whiteSpace: 'nowrap'
    }}>{m.label}</span>
  );
}

function PriorityDot({ priority }) {
  const m = PRIORITY_META[priority] || { color: '#9090a8', label: priority };
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: m.color, fontWeight: 600 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: m.color, display: 'inline-block' }} />
      {m.label}
    </span>
  );
}

function ProgressBar({ value, color = '#3b82f6' }) {
  return (
    <div style={{ background: '#2a2a38', borderRadius: 99, height: 6, width: '100%', overflow: 'hidden' }}>
      <div style={{ width: `${Math.min(value, 100)}%`, background: color, height: '100%', borderRadius: 99, transition: 'width .4s ease' }} />
    </div>
  );
}

// ── main page ──────────────────────────────────────────────────────────────
export default function EmployeeReportPage() {
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected]   = useState(null); // drill-down
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusFilter, setStatusFilter]   = useState('ALL');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/reports/employees');
      setEmployees(data);
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const openEmployee = async (emp) => {
    setDetailLoading(true);
    try {
      const { data } = await api.get(`/admin/reports/employees/${emp.userId}`);
      setSelected(data);
    } catch {
      setSelected(emp); // fallback to summary data
    } finally {
      setDetailLoading(false);
    }
  };

  // ── filtered list ────────────────────────────────────────────────────────
  const filtered = employees.filter(e =>
    e.fullName.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase())
  );

  // ── totals for header stats ──────────────────────────────────────────────
  const totalCompleted  = employees.reduce((s, e) => s + e.completedTasks, 0);
  const totalPending    = employees.reduce((s, e) => s + e.inProgressTasks + e.todoTasks + e.inReviewTasks, 0);
  const totalOverdue    = employees.reduce((s, e) => s + e.overdueTasks, 0);

  // ── filtered tasks in drill-down ─────────────────────────────────────────
  const filteredTasks = selected?.tasks?.filter(t =>
    statusFilter === 'ALL' || t.status === statusFilter
  ) ?? [];

  // ══════════════════════════════════════════════════════════════════════════
  // DETAIL VIEW
  // ══════════════════════════════════════════════════════════════════════════
  if (selected) {
    return (
      <div style={{ padding: '24px', maxWidth: 1100, margin: '0 auto' }}>
        {/* back */}
        <button
          onClick={() => { setSelected(null); setStatusFilter('ALL'); }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
                   color: '#9090a8', cursor: 'pointer', fontSize: 14, marginBottom: 20 }}>
          <ArrowLeft size={16} /> Back to all employees
        </button>

        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#3b82f622',
                        color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22, fontWeight: 700 }}>
            {selected.fullName?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 style={{ margin: 0, color: '#e8e8f0', fontSize: 20 }}>{selected.fullName}</h2>
            <span style={{ color: '#9090a8', fontSize: 13 }}>{selected.email} · {selected.role}</span>
          </div>
        </div>

        {/* stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 28 }}>
          {[
            { label: 'Total Tasks',   value: selected.totalTasks,      color: '#9090a8' },
            { label: 'Completed',     value: selected.completedTasks,   color: '#22c55e' },
            { label: 'In Progress',   value: selected.inProgressTasks,  color: '#3b82f6' },
            { label: 'To Do',         value: selected.todoTasks,        color: '#9090a8' },
            { label: 'In Review',     value: selected.inReviewTasks,    color: '#f59e0b' },
            { label: 'Overdue',       value: selected.overdueTasks,     color: '#ef4444' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: '#16161f', border: '1px solid #2a2a38',
                                      borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 700, color }}>{value}</div>
              <div style={{ fontSize: 12, color: '#9090a8', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* completion rate */}
        <div style={{ background: '#16161f', border: '1px solid #2a2a38', borderRadius: 12, padding: 18, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: '#e8e8f0', fontSize: 14, fontWeight: 600 }}>Completion Rate</span>
            <span style={{ color: '#22c55e', fontWeight: 700 }}>{selected.completionRate}%</span>
          </div>
          <ProgressBar value={selected.completionRate} color="#22c55e" />
        </div>

        {/* task filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {['ALL', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: '5px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12,
                fontWeight: 600, transition: 'all .2s',
                background: statusFilter === s ? '#3b82f6' : '#2a2a38',
                color: statusFilter === s ? '#fff' : '#9090a8',
              }}>
              {s === 'ALL' ? 'All' : STATUS_META[s]?.label ?? s}
              <span style={{ marginLeft: 6, opacity: 0.7 }}>
                {s === 'ALL' ? selected.tasks?.length : selected.tasks?.filter(t => t.status === s).length}
              </span>
            </button>
          ))}
        </div>

        {/* task table */}
        <div style={{ background: '#16161f', border: '1px solid #2a2a38', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#1e1e2a' }}>
                {['Task', 'Project', 'Status', 'Priority', 'Due Date', 'Completed At'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#9090a8',
                                       fontWeight: 600, fontSize: 11, textTransform: 'uppercase',
                                       letterSpacing: '0.05em', borderBottom: '1px solid #2a2a38' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 32, color: '#9090a8' }}>
                    No tasks found
                  </td>
                </tr>
              ) : filteredTasks.map((t, i) => (
                <tr key={t.taskId}
                    style={{ borderBottom: '1px solid #1e1e2a',
                             background: i % 2 === 0 ? 'transparent' : '#16161f' }}>
                  <td style={{ padding: '12px 16px', color: '#e8e8f0' }}>
                    <div style={{ fontWeight: 500 }}>{t.title}</div>
                    {t.overdue && (
                      <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 600 }}>⚠ Overdue</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#9090a8' }}>{t.projectName}</td>
                  <td style={{ padding: '12px 16px' }}><StatusBadge status={t.status} /></td>
                  <td style={{ padding: '12px 16px' }}><PriorityDot priority={t.priority} /></td>
                  <td style={{ padding: '12px 16px', color: t.overdue ? '#ef4444' : '#9090a8' }}>
                    {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#9090a8' }}>
                    {t.completedAt ? new Date(t.completedAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // LIST VIEW
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ padding: '24px', maxWidth: 1100, margin: '0 auto' }}>
      {/* page title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, color: '#e8e8f0', fontWeight: 700 }}>Employee Reports</h1>
          <p style={{ margin: '4px 0 0', color: '#9090a8', fontSize: 13 }}>
            Task completion & performance overview for all employees
          </p>
        </div>
        <button
          onClick={fetchAll}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                   background: '#2a2a38', border: '1px solid #3a3a50', borderRadius: 8,
                   color: '#e8e8f0', cursor: 'pointer', fontSize: 13 }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 28 }}>
        {[
          { icon: Users,        label: 'Total Employees', value: employees.length,  color: '#3b82f6' },
          { icon: CheckCircle2, label: 'Tasks Completed',  value: totalCompleted,   color: '#22c55e' },
          { icon: Clock,        label: 'Tasks Pending',    value: totalPending,     color: '#f59e0b' },
          { icon: AlertCircle,  label: 'Overdue Tasks',    value: totalOverdue,     color: '#ef4444' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} style={{ background: '#16161f', border: '1px solid #2a2a38',
                                    borderRadius: 12, padding: 18, display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: color + '18',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={18} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
              <div style={{ fontSize: 12, color: '#9090a8' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* search */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9090a8' }} />
        <input
          type="text"
          placeholder="Search employee by name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px 10px 36px',
                   background: '#1e1e2a', border: '1px solid #2a2a38', borderRadius: 8,
                   color: '#e8e8f0', fontSize: 13, outline: 'none' }}
        />
      </div>

      {/* employee cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#9090a8' }}>Loading reports…</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(emp => (
            <div
              key={emp.userId}
              onClick={() => openEmployee(emp)}
              style={{ background: '#16161f', border: '1px solid #2a2a38', borderRadius: 12,
                       padding: 20, cursor: 'pointer', transition: 'border-color .2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#3b82f6'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a38'}
            >
              {/* top row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#3b82f622',
                                color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                    {emp.fullName?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ color: '#e8e8f0', fontWeight: 600 }}>{emp.fullName}</div>
                    <div style={{ color: '#9090a8', fontSize: 12 }}>{emp.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, color: '#22c55e', background: '#22c55e18',
                                 padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>
                    {emp.completionRate}% done
                  </span>
                  {emp.overdueTasks > 0 && (
                    <span style={{ fontSize: 12, color: '#ef4444', background: '#ef444418',
                                   padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>
                      {emp.overdueTasks} overdue
                    </span>
                  )}
                  <ChevronRight size={16} color="#9090a8" />
                </div>
              </div>

              {/* progress bar */}
              <div style={{ marginBottom: 12 }}>
                <ProgressBar value={emp.completionRate} color="#22c55e" />
              </div>

              {/* task count row */}
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {[
                  { label: 'Total',       value: emp.totalTasks,      color: '#9090a8' },
                  { label: 'Completed',   value: emp.completedTasks,   color: '#22c55e' },
                  { label: 'In Progress', value: emp.inProgressTasks,  color: '#3b82f6' },
                  { label: 'In Review',   value: emp.inReviewTasks,    color: '#f59e0b' },
                  { label: 'To Do',       value: emp.todoTasks,        color: '#9090a8' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color }}>{value}</div>
                    <div style={{ fontSize: 11, color: '#9090a8' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 48, color: '#9090a8' }}>No employees found</div>
          )}
        </div>
      )}
    </div>
  );
}
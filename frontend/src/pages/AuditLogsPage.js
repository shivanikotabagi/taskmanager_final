import React, { useEffect, useState, useCallback } from 'react';
import { auditAPI } from '../services/api';
import { formatDate } from '../services/helpers';
import { ClipboardList, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import './AuditLogsPage.css';

const ENTITY_TYPES = ['USER','PROJECT','TASK'];
const ACTION_COLORS = {
  CREATE: 'badge-success', UPDATE: 'badge-info', DELETE: 'badge-danger',
  LOGIN: 'badge-accent', ASSIGN_MEMBERS: 'badge-warning', REMOVE_MEMBER: 'badge-warning',
};

export default function AuditLogsPage() {
  const [logs, setLogs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal]           = useState(0);
  const [entityFilter, setEntityFilter] = useState('');
  const [expandedId, setExpandedId]     = useState(null);
  const PAGE_SIZE = 20;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = entityFilter
        ? await auditAPI.getByType(entityFilter, page, PAGE_SIZE)
        : await auditAPI.getAll(page, PAGE_SIZE);
      setLogs(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotal(res.data.totalElements || 0);
    } catch {} finally { setLoading(false); }
  }, [page, entityFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);
  useEffect(() => { setPage(0); }, [entityFilter]);

  const formatJSON = (val) => {
    if (!val) return null;
    try { return JSON.stringify(JSON.parse(val), null, 2); } catch { return val; }
  };

  const actionIcon = { CREATE:'✨', UPDATE:'✏️', DELETE:'🗑️', LOGIN:'🔑', ASSIGN_MEMBERS:'👥', REMOVE_MEMBER:'➖' };

  return (
    <div className="audit-page fade-in">
      <div className="page-header">
        <div>
         // <h1 className="page-title">Audit Logs</h1>
          //<p className="page-subtitle">{total.toLocaleString()} total log entries</p>
        </div>
      </div>

      {/* Filters */}
      <div className="audit-filters">
        <Filter size={14} style={{ color:'var(--text-muted)' }} />
        <span style={{ fontSize:12, color:'var(--text-muted)', fontWeight:600 }}>Filter by entity:</span>
        <button className={`filter-chip ${!entityFilter ? 'active' : ''}`} onClick={() => setEntityFilter('')}>All</button>
        {ENTITY_TYPES.map(t => (
          <button key={t} className={`filter-chip ${entityFilter === t ? 'active' : ''}`} onClick={() => setEntityFilter(t)}>{t}</button>
        ))}
      </div>

      {/* Log table */}
      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:60 }}>
          <div className="spinner" style={{ width:32, height:32 }} />
        </div>
      ) : logs.length === 0 ? (
        <div className="empty-state"><ClipboardList size={48} /><h3>No audit logs yet</h3></div>
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Action</th><th>Entity</th><th>Entity Name</th>
                  <th>Performed By</th><th>IP Address</th><th>Timestamp</th><th>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => (
                  <React.Fragment key={log.id}>
                    <tr className={expandedId === log.id ? 'expanded-row' : ''}>
                      <td><span style={{ fontFamily:'var(--mono)', fontSize:11, color:'var(--text-muted)' }}>#{log.id}</span></td>
                      <td>
                        <span className={`badge ${ACTION_COLORS[log.action] || 'badge-muted'}`}>
                          {actionIcon[log.action] || '•'} {log.action.replace('_',' ')}
                        </span>
                      </td>
                      <td><span className="badge badge-muted">{log.entityType}</span></td>
                      <td style={{ fontSize:13, fontWeight:500 }}>{log.entityName || '—'}</td>
                      <td>
                        <div style={{ fontSize:12 }}>
                          <div style={{ fontWeight:600 }}>{log.performedByName || '—'}</div>
                          {log.performedBy && <div style={{ color:'var(--text-muted)', fontFamily:'var(--mono)', fontSize:11 }}>id:{log.performedBy}</div>}
                        </div>
                      </td>
                      <td><code style={{ fontFamily:'var(--mono)', fontSize:11, color:'var(--text-muted)' }}>{log.ipAddress || '—'}</code></td>
                      <td style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'var(--mono)', whiteSpace:'nowrap' }}>
                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}
                      </td>
                      <td>
                        {(log.oldValue || log.newValue) && (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                          >
                            {expandedId === log.id ? 'Hide' : 'Show'} diff
                          </button>
                        )}
                      </td>
                    </tr>
                    {expandedId === log.id && (
                      <tr className="diff-row">
                        <td colSpan={8}>
                          <div className="diff-panel">
                            {log.oldValue && (
                              <div className="diff-section old">
                                <div className="diff-label">Before</div>
                                <pre>{formatJSON(log.oldValue)}</pre>
                              </div>
                            )}
                            {log.newValue && (
                              <div className="diff-section new">
                                <div className="diff-label">After</div>
                                <pre>{formatJSON(log.newValue)}</pre>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <span style={{ fontSize:12, color:'var(--text-muted)' }}>
              Page {page + 1} of {totalPages} · {total} entries
            </span>
            <div style={{ display:'flex', gap:6 }}>
              <button className="btn btn-secondary btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft size={14} /> Prev
              </button>
              <button className="btn btn-secondary btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

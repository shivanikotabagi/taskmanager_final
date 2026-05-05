// Status → badge class
export const projectStatusBadge = {
  PLANNING:  'badge-info',
  ACTIVE:    'badge-success',
  ON_HOLD:   'badge-warning',
  COMPLETED: 'badge-accent',
  CANCELLED: 'badge-muted',
};

export const taskStatusBadge = {
  TODO:        'badge-muted',
  IN_PROGRESS: 'badge-info',
  IN_REVIEW:   'badge-warning',
  DONE:        'badge-success',
  CANCELLED:   'badge-danger',
};

export const priorityBadge = {
  LOW:      'badge-success',
  MEDIUM:   'badge-warning',
  HIGH:     'badge-danger',
  CRITICAL: 'badge-danger',
};

export const roleBadge = {
  ADMIN:   'badge-danger',
  MANAGER: 'badge-warning',
  USER:    'badge-success',
};

export const priorityLabel = { LOW: '🟢 Low', MEDIUM: '🟡 Medium', HIGH: '🟠 High', CRITICAL: '🔴 Critical' };
export const statusLabel = {
  PLANNING: 'Planning', ACTIVE: 'Active', ON_HOLD: 'On Hold', COMPLETED: 'Completed', CANCELLED: 'Cancelled',
  TODO: 'To Do', IN_PROGRESS: 'In Progress', IN_REVIEW: 'In Review', DONE: 'Done',
};

export const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const timeAgo = (d) => {
  if (!d) return '';
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

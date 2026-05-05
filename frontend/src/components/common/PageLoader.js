import React from 'react';

export default function PageLoader({ text = 'Loading…' }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      height: 300, gap: 14, color: 'var(--text-muted)',
    }}>
      <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
      <span style={{ fontSize: 13 }}>{text}</span>
    </div>
  );
}

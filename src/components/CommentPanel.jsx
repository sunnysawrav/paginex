import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function formatDate(val) {
  if (!val) return '';
  // Handle Firestore Timestamp, JS Date, or ISO string
  const date = val?.toDate ? val.toDate() : new Date(val);
  return date.toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
}

export default function CommentPanel({ page, onClose, onUpdateComments, role }) {
  const { user } = useAuth();
  const [draft, setDraft] = useState('');
  const isReadOnly = role === 'read';

  const addComment = () => {
    if (!draft.trim()) return;
    const newComment = {
      id: Date.now(),
      text: draft.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      authorUid: user.uid,
      authorEmail: user.email,
    };
    onUpdateComments(page.id, [...page.comments, newComment]);
    setDraft('');
  };

  const toggleStatus = (commentId) => {
    const updated = page.comments.map(c =>
      c.id === commentId ? { ...c, status: c.status === 'pending' ? 'done' : 'pending' } : c
    );
    onUpdateComments(page.id, updated);
  };

  const deleteComment = (commentId) => {
    onUpdateComments(page.id, page.comments.filter(c => c.id !== commentId));
  };

  return (
    <div className="comment-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="comment-panel">
        <div className="comment-panel-header">
          <div>
            <h3>Comments</h3>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
              {page.label || `Page ${page.number}`}
            </p>
          </div>
          <button className="close-btn" onClick={onClose}><X size={14} /></button>
        </div>

        <div className="comment-list">
          {page.comments.length === 0 ? (
            <div className="comment-empty">No comments yet.<br />Add one below.</div>
          ) : (
            page.comments.map(c => {
              const isOwn = c.authorUid === user.uid;
              // Show short email: name before @ sign
              const displayName = c.authorEmail
                ? c.authorEmail.split('@')[0]
                : (c.author || 'Unknown');

              return (
                <div key={c.id} className={`comment-item ${c.status === 'done' ? 'comment-done' : ''}`}>
                  <div className="comment-item-header">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <span className="comment-author">{isOwn ? 'You' : displayName}</span>
                      <span className="comment-meta">{formatDate(c.createdAt)}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      {!isReadOnly && (
                        <button
                          className={`comment-status-btn ${c.status === 'done' ? 'done' : ''}`}
                          onClick={() => toggleStatus(c.id)}
                          title={c.status === 'done' ? 'Mark as pending' : 'Mark as done'}
                        >
                          {c.status === 'done' ? '✓ Done' : 'Pending'}
                        </button>
                      )}
                      {isReadOnly && (
                        <span className={`comment-status-badge ${c.status === 'done' ? 'done' : ''}`}>
                          {c.status === 'done' ? '✓ Done' : 'Pending'}
                        </span>
                      )}
                      {isOwn && (
                        <button
                          onClick={() => deleteComment(c.id)}
                          className="comment-delete-btn"
                          title="Delete comment"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="comment-text">{c.text}</p>
                </div>
              );
            })
          )}
        </div>

        <div className="comment-input-area">
          <textarea
            className="comment-input"
            placeholder="Write a comment or review note…"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && e.ctrlKey && addComment()}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Ctrl+Enter to send</span>
            <button className="btn-add-comment" onClick={addComment}>Add Comment</button>
          </div>
        </div>
      </div>
    </div>
  );
}
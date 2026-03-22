import { useState } from 'react';
import { X, Check } from 'lucide-react';

export default function CommentPanel({ page, onClose, onUpdateComments }) {
  const [draft, setDraft] = useState('');

  const addComment = () => {
    if (!draft.trim()) return;
    const newComment = {
      id: Date.now(),
      text: draft.trim(),
      status: 'pending',
      createdAt: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
      author: 'You',
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
            page.comments.map(c => (
              <div key={c.id} className="comment-item">
                <div className="comment-item-header">
                  <span className="comment-meta">{c.author} · {c.createdAt}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      className={`comment-status-btn ${c.status === 'done' ? 'done' : ''}`}
                      onClick={() => toggleStatus(c.id)}
                    >
                      {c.status === 'done' ? '✓ Done' : 'Pending'}
                    </button>
                    <button
                      onClick={() => deleteComment(c.id)}
                      style={{ background: 'transparent', color: 'var(--text-muted)', padding: '2px 4px', fontSize: 11, borderRadius: 3 }}
                    >
                      ×
                    </button>
                  </div>
                </div>
                <p className="comment-text">{c.text}</p>
              </div>
            ))
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

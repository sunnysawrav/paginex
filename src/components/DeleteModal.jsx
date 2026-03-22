export default function DeleteModal({ projectName, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="modal">
        <h3>Delete Project?</h3>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          You're about to permanently delete <strong>"{projectName}"</strong>.
          All page content and comments will be lost. This cannot be undone.
        </p>
        <div className="modal-actions">
          <button className="btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm}>Delete Project</button>
        </div>
      </div>
    </div>
  );
}

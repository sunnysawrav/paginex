import { useState } from 'react';
import { X, UserPlus, Mail, Shield, Eye, Trash2, Crown } from 'lucide-react';

export default function ShareModal({ project, currentUser, onClose, onInvite, onRemove }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('read');
  const [inviting, setInviting] = useState(false);
  const [changingRole, setChangingRole] = useState(null); // email currently being updated
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const sharedWith = project.sharedWith || {};
  const collaborators = Object.entries(sharedWith);

  const handleInvite = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) { setError('Please enter an email address.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) { setError('Please enter a valid email.'); return; }
    if (trimmed === currentUser.email.toLowerCase()) { setError("You can't invite yourself."); return; }
    if (sharedWith[trimmed]) { setError('This person already has access.'); return; }

    setError('');
    setInviting(true);
    try {
      await onInvite(trimmed, role);
      setSuccessMsg(`Invite sent to ${trimmed}`);
      setEmail('');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Failed to send invite. Please try again.');
    } finally {
      setInviting(false);
    }
  };

  const handleChangeRole = async (collabEmail, newRole) => {
    if (changingRole) return;
    setChangingRole(collabEmail);
    try {
      await onInvite(collabEmail, newRole); // reuses invite fn — it's an upsert
    } catch (err) {
      setError('Failed to update role. Please try again.');
    } finally {
      setChangingRole(null);
    }
  };

  const handleRemove = async (collaboratorEmail) => {
    await onRemove(collaboratorEmail);
  };

  return (
    <div className="share-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="share-modal">
        {/* Header */}
        <div className="share-modal-header">
          <div>
            <h3>Share Project</h3>
            <p className="share-modal-sub">{project.name}{project.issue ? ` · ${project.issue}` : ''}</p>
          </div>
          <button className="close-btn" onClick={onClose}><X size={14} /></button>
        </div>

        {/* Owner row */}
        <div className="share-section-label">Owner</div>
        <div className="share-collab-row owner-row">
          <Crown size={12} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <span className="share-collab-email">{currentUser.email}</span>
          <span className="share-role-badge owner">Owner</span>
        </div>

        {/* Collaborators */}
        {collaborators.length > 0 && (
          <>
            <div className="share-section-label">Collaborators</div>
            <div className="share-collab-list">
              {collaborators.map(([collabEmail, collabRole]) => (
                <div key={collabEmail} className="share-collab-row">
                  <Mail size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  <span className="share-collab-email">{collabEmail}</span>
                  {/* Inline role toggle */}
                  <div className="share-role-toggle" style={{ marginLeft: 'auto' }}>
                    <button
                      className={`share-role-btn ${collabRole === 'read' ? 'active' : ''}`}
                      onClick={() => collabRole !== 'read' && handleChangeRole(collabEmail, 'read')}
                      disabled={changingRole === collabEmail}
                      title="Set to Read"
                    >
                      <Eye size={10} /> Read
                    </button>
                    <button
                      className={`share-role-btn ${collabRole === 'edit' ? 'active' : ''}`}
                      onClick={() => collabRole !== 'edit' && handleChangeRole(collabEmail, 'edit')}
                      disabled={changingRole === collabEmail}
                      title="Set to Edit"
                    >
                      <Shield size={10} /> Edit
                    </button>
                  </div>
                  <button
                    className="share-remove-btn"
                    onClick={() => handleRemove(collabEmail)}
                    title="Remove access"
                    disabled={changingRole === collabEmail}
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {collaborators.length === 0 && (
          <p className="share-empty">No collaborators yet. Invite someone below.</p>
        )}

        {/* Invite form */}
        <div className="share-section-label" style={{ marginTop: 16 }}>Invite by email</div>
        <div className="share-invite-row">
          <input
            className="share-email-input"
            type="email"
            placeholder="colleague@example.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleInvite()}
          />
          <div className="share-role-toggle">
            <button
              className={`share-role-btn ${role === 'read' ? 'active' : ''}`}
              onClick={() => setRole('read')}
              title="Can view and comment"
            >
              <Eye size={11} /> Read
            </button>
            <button
              className={`share-role-btn ${role === 'edit' ? 'active' : ''}`}
              onClick={() => setRole('edit')}
              title="Full edit access"
            >
              <Shield size={11} /> Edit
            </button>
          </div>
          <button
            className="share-invite-btn"
            onClick={handleInvite}
            disabled={inviting}
          >
            <UserPlus size={12} />
            {inviting ? 'Inviting…' : 'Invite'}
          </button>
        </div>

        {error && <p className="share-error">{error}</p>}
        {successMsg && <p className="share-success">{successMsg}</p>}

        {/* Role legend */}
        <div className="share-legend">
          <span><Eye size={10} /> <strong>Read</strong> — view all pages, add & delete own comments</span>
          <span><Shield size={10} /> <strong>Edit</strong> — full access, edit content, reorder pages</span>
        </div>
      </div>
    </div>
  );
}

import { X, Zap, BookOpen, Users, Paperclip } from 'lucide-react';

export default function UpgradeModal({ onClose }) {
  return (
    <div className="upgrade-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="upgrade-modal">
        <div className="upgrade-modal-header">
          <div>
            <h3>Upgrade to Premium</h3>
            <p className="upgrade-modal-sub">You've reached the free tier limit</p>
          </div>
          <button className="close-btn" onClick={onClose}><X size={14} /></button>
        </div>

        <div className="upgrade-limit-notice">
          <BookOpen size={13} />
          <span>Free plan includes <strong>1 magazine</strong>. Delete your existing project to create a new one, or upgrade for unlimited magazines.</span>
        </div>

        <div className="upgrade-features">
          <div className="upgrade-section-label">Premium includes</div>
          <div className="upgrade-feature-list">
            <div className="upgrade-feature-item">
              <Zap size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <span><strong>Unlimited magazines</strong> — no cap on projects</span>
            </div>
            <div className="upgrade-feature-item">
              <Users size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <span><strong>Unlimited collaborators</strong> per project</span>
            </div>
            <div className="upgrade-feature-item">
              <Paperclip size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <span><strong>File attachments</strong> — images, PDFs, docs per page</span>
            </div>
            <div className="upgrade-feature-item">
              <BookOpen size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <span><strong>PDF import</strong> — extract pages as thumbnails</span>
            </div>
          </div>
        </div>

        <div className="upgrade-actions">
          <button className="upgrade-cta-btn" disabled title="Coming soon">
            <Zap size={13} />
            Upgrade — Coming Soon
          </button>
          <button className="upgrade-cancel-btn" onClick={onClose}>Maybe later</button>
        </div>
      </div>
    </div>
  );
}

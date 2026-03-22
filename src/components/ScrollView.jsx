import { MessageSquare, Check } from 'lucide-react';

export default function ScrollView({ pages, onUpdateContent, onUpdateReceived, onOpenComments }) {
  return (
    <div className="scroll-view">
      {/* Column headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '48px 120px 1fr 100px',
        gap: 14,
        padding: '4px 16px',
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
      }}>
        <span style={{ textAlign: 'center' }}>#</span>
        <span>Type</span>
        <span>Content Description</span>
        <span style={{ textAlign: 'right' }}>Status</span>
      </div>

      {pages.map(page => {
        const isLocked = page.isCenterfold;
        const rowClass = [
          'scroll-row',
          isLocked ? 'locked' : '',
          page.isCenterfold ? 'centerfold-page' : '',
          page.contentReceived ? 'received-page' : '',
        ].filter(Boolean).join(' ');

        return (
          <div key={page.id} className={rowClass}>
            <span className="scroll-page-num">{page.number}</span>

            <div className="scroll-badges">
              {page.number === 1 && (
                <span className="tile-badge cover" style={{ alignSelf: 'flex-start' }}>Cover</span>
              )}
              {page.isCenterfold && (
                <span className="tile-badge centerfold" style={{ alignSelf: 'flex-start' }}>Centerfold</span>
              )}
              {page.isBack && !page.isCenterfold && (
                <span className="tile-badge" style={{ alignSelf: 'flex-start' }}>Back</span>
              )}
              {!page.number === 1 && !page.isCenterfold && !page.isBack && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
                  {page.label}
                </span>
              )}
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                {page.label}
              </span>
            </div>

            <textarea
              className="scroll-textarea"
              placeholder={isLocked ? '' : 'Content description, article heading, notes…'}
              value={page.content}
              disabled={isLocked}
              onChange={e => onUpdateContent(page.id, e.target.value)}
            />

            <div className="scroll-actions">
              <label className="received-check">
                <div
                  className={`check-box ${page.contentReceived ? 'checked' : ''}`}
                  onClick={() => onUpdateReceived(page.id, !page.contentReceived)}
                >
                  {page.contentReceived && <Check size={9} color="white" strokeWidth={3} />}
                </div>
                <span className="check-label">{page.contentReceived ? 'Rcvd' : 'Pndg'}</span>
              </label>

              <button
                className={`comment-btn ${page.comments.length > 0 ? 'has-comments' : ''}`}
                onClick={() => onOpenComments(page)}
              >
                <MessageSquare size={11} />
                {page.comments.length > 0 && page.comments.length}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

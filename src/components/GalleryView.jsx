import { MessageSquare, Check } from 'lucide-react';

function PageTile({ page, onUpdateContent, onUpdateReceived, onOpenComments }) {
  const isLocked = page.isCenterfold;
  const tileClass = [
    'page-tile',
    isLocked ? 'locked' : '',
    page.isCenterfold ? 'centerfold-page' : '',
    page.contentReceived ? 'received-page' : '',
  ].filter(Boolean).join(' ');

  const getBadge = () => {
    if (page.number === 1) return <span className="tile-badge cover">Cover</span>;
    if (page.isCenterfold) return <span className="tile-badge centerfold">Centerfold</span>;
    if (page.isBack) return <span className="tile-badge">Back</span>;
    return null;
  };

  return (
    <div className={tileClass}>
      <div className="tile-header">
        <span className="tile-page-num">Pg {page.number}</span>
        {getBadge()}
      </div>

      <div className="tile-preview">
        <span className="tile-preview-num">{page.number}</span>
      </div>

      <div className="tile-body">
        <textarea
          className="tile-textarea"
          placeholder={isLocked ? page.content : 'Describe page content…'}
          value={page.content}
          disabled={isLocked}
          onChange={e => onUpdateContent(page.id, e.target.value)}
          onClick={e => e.stopPropagation()}
        />
      </div>

      <div className="tile-footer">
        <label className="received-check" onClick={e => e.stopPropagation()}>
          <div
            className={`check-box ${page.contentReceived ? 'checked' : ''}`}
            onClick={() => onUpdateReceived(page.id, !page.contentReceived)}
          >
            {page.contentReceived && <Check size={9} color="white" strokeWidth={3} />}
          </div>
          <span className="check-label">{page.contentReceived ? 'Received' : 'Pending'}</span>
        </label>

        <button
          className={`comment-btn ${page.comments.length > 0 ? 'has-comments' : ''}`}
          onClick={e => { e.stopPropagation(); onOpenComments(page); }}
        >
          <MessageSquare size={11} />
          {page.comments.length > 0 ? page.comments.length : ''}
        </button>
      </div>
    </div>
  );
}

export default function GalleryView({ pages, onUpdateContent, onUpdateReceived, onOpenComments }) {
  return (
    <div className="gallery-grid">
      {pages.map(page => (
        <PageTile
          key={page.id}
          page={page}
          onUpdateContent={onUpdateContent}
          onUpdateReceived={onUpdateReceived}
          onOpenComments={onOpenComments}
        />
      ))}
    </div>
  );
}

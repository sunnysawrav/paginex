import { useState } from 'react';
import { MessageSquare, Check, Lock, GripVertical } from 'lucide-react';

export default function ScrollView({
  pages, onUpdateContent, onUpdateReceived, onOpenComments,
  reorderMode, onSwap, onShift, role,
}) {
  const isReadOnly = role === 'read';
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [dragFromNumber, setDragFromNumber] = useState(null);
  const [dragOverNumber, setDragOverNumber] = useState(null);
  const [dropSide, setDropSide] = useState(null); // 'top' | 'bottom'
  const [shakingNumber, setShakingNumber] = useState(null);
  const totalPages = pages.length;

  const triggerShake = (number) => {
    setShakingNumber(number);
    setTimeout(() => setShakingNumber(null), 500);
  };

  const handleRowClick = (number, locked) => {
    if (locked) { triggerShake(number); return; }
    if (selectedNumber === null) {
      setSelectedNumber(number);
    } else if (selectedNumber === number) {
      setSelectedNumber(null);
    } else {
      onSwap(selectedNumber, number);
      setSelectedNumber(null);
    }
  };

  const handleDragStart = (number) => {
    setDragFromNumber(number);
    setSelectedNumber(null);
  };

  const handleDragOver = (e, number) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const side = e.clientY < rect.top + rect.height / 2 ? 'top' : 'bottom';
    setDragOverNumber(number);
    setDropSide(side);
  };

  const handleDrop = (e, toNumber, locked) => {
    e.preventDefault();
    if (locked) { triggerShake(toNumber); setDragFromNumber(null); setDragOverNumber(null); setDropSide(null); return; }
    if (dragFromNumber && dragFromNumber !== toNumber) {
      onShift(dragFromNumber, toNumber);
    }
    setDragFromNumber(null);
    setDragOverNumber(null);
    setDropSide(null);
  };

  return (
    <div
      className="scroll-view"
      onDragEnd={() => { setDragFromNumber(null); setDragOverNumber(null); setDropSide(null); }}
    >
      {/* Column headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: reorderMode ? '28px 48px 120px 1fr 100px' : '48px 120px 1fr 100px',
        gap: 14,
        padding: '4px 16px',
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
      }}>
        {reorderMode && <span />}
        <span style={{ textAlign: 'center' }}>#</span>
        <span>Type</span>
        <span>Content Description</span>
        <span style={{ textAlign: 'right' }}>Status</span>
      </div>

      {pages.map(page => {
        const locked = page.number === 1 || page.number === totalPages || page.isCenterfold;
        const isDragOver = dragOverNumber === page.number;
        const currentDropSide = isDragOver ? dropSide : null;

        const rowClass = [
          'scroll-row',
          page.isCenterfold ? 'centerfold-page' : '',
          page.contentReceived ? 'received-page' : '',
          reorderMode && !locked ? 'reorder-draggable' : '',
          reorderMode && selectedNumber === page.number ? 'reorder-selected' : '',
          reorderMode && isDragOver && !locked ? 'reorder-drag-over' : '',
          reorderMode && shakingNumber === page.number ? 'reorder-shake' : '',
        ].filter(Boolean).join(' ');

        return (
          <div
            key={page.id}
            className={rowClass}
            style={{
              gridTemplateColumns: reorderMode ? '28px 48px 120px 1fr 100px' : undefined,
              // Drop position bar: top or bottom edge
              ...(reorderMode && isDragOver && !locked && currentDropSide === 'top' && {
                borderTop: '3px solid var(--accent)',
              }),
              ...(reorderMode && isDragOver && !locked && currentDropSide === 'bottom' && {
                borderBottom: '3px solid var(--accent)',
              }),
            }}
            draggable={reorderMode && !locked}
            onDragStart={reorderMode && !locked ? () => handleDragStart(page.number) : undefined}
            onDragOver={reorderMode ? (e) => handleDragOver(e, page.number) : undefined}
            onDrop={reorderMode ? (e) => handleDrop(e, page.number, locked) : undefined}
            onClick={reorderMode ? () => handleRowClick(page.number, locked) : undefined}
          >
            {reorderMode && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {locked
                  ? <Lock size={11} style={{ color: 'var(--text-muted)' }} />
                  : <GripVertical size={13} style={{ color: 'var(--text-muted)', cursor: 'grab' }} />
                }
              </div>
            )}

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
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                {page.label}
              </span>
            </div>

            <textarea
              className="scroll-textarea"
              placeholder={page.isCenterfold ? '' : (page.number === 1 ? 'Add your cover details here — headline, lead story, image notes...' : 'Content description, article heading, notes…')}
              value={page.content}
              disabled={page.isCenterfold || reorderMode || isReadOnly}
              onChange={e => !isReadOnly && onUpdateContent(page.id, e.target.value)}
            />

            <div className="scroll-actions">
              <label className="received-check">
                <div
                  className={`check-box ${page.contentReceived ? 'checked' : ''}`}
                  onClick={() => { if (!reorderMode && !isReadOnly) onUpdateReceived(page.id, !page.contentReceived); }}
                  style={{ cursor: isReadOnly ? 'default' : 'pointer', opacity: isReadOnly ? 0.5 : 1 }}
                >
                  {page.contentReceived && <Check size={9} color="white" strokeWidth={3} />}
                </div>
                <span className="check-label">{page.contentReceived ? 'Rcvd' : 'Pndg'}</span>
              </label>

              <button
                className={`comment-btn ${page.comments.length > 0 ? 'has-comments' : ''}`}
                onClick={(e) => { e.stopPropagation(); if (!reorderMode) onOpenComments(page); }}
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
import { useState } from 'react';
import { MessageSquare, Check, Lock, GripVertical } from 'lucide-react';

function PageTile({
  page, totalPages, onUpdateContent, onUpdateReceived, onOpenComments,
  reorderMode, isSelected, onTileClick, onDragStart, onDragOver, onDrop, isDragOver, dropSide, isShaking,
  role,
}) {
  const isReadOnly = role === 'read';
  const locked = page.number === 1 || page.number === totalPages || page.isCenterfold;

  const tileClass = [
    'page-tile',
    page.isCenterfold ? 'centerfold-page' : '',
    page.contentReceived ? 'received-page' : '',
    reorderMode && !locked ? 'reorder-draggable' : '',
    reorderMode && isSelected ? 'reorder-selected' : '',
    reorderMode && isDragOver && !locked ? 'reorder-drag-over' : '',
    reorderMode && isShaking ? 'reorder-shake' : '',
  ].filter(Boolean).join(' ');

  const getBadge = () => {
    if (page.number === 1) return <span className="tile-badge cover">Cover</span>;
    if (page.isCenterfold) return <span className="tile-badge centerfold">Centerfold</span>;
    if (page.isBack) return <span className="tile-badge">Back</span>;
    return null;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!reorderMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const side = e.clientX < rect.left + rect.width / 2 ? 'left' : 'right';
    onDragOver(page.number, side);
  };

  return (
    <div
      className={tileClass}
      style={{
        position: 'relative',
        // Drop position bar: left or right edge
        ...(reorderMode && isDragOver && !locked && dropSide === 'left' && {
          borderLeft: '3px solid var(--accent)',
        }),
        ...(reorderMode && isDragOver && !locked && dropSide === 'right' && {
          borderRight: '3px solid var(--accent)',
        }),
      }}
      draggable={reorderMode && !locked}
      onDragStart={reorderMode && !locked ? () => onDragStart(page.number) : undefined}
      onDragOver={handleDragOver}
      onDrop={reorderMode ? (e) => { e.preventDefault(); onDrop(page.number, locked, dropSide); } : undefined}
      onClick={reorderMode ? () => onTileClick(page.number, locked) : undefined}
    >
      <div className="tile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {reorderMode && !locked && (
            <GripVertical size={12} style={{ color: 'var(--text-muted)', cursor: 'grab', flexShrink: 0 }} />
          )}
          {reorderMode && locked && (
            <Lock size={11} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          )}
          <span className="tile-page-num">Pg {page.number}</span>
        </div>
        {getBadge()}
      </div>

      <div className="tile-preview">
        <span className="tile-preview-num">{page.number}</span>
      </div>

      <div className="tile-body">
        <textarea
          className="tile-textarea"
          placeholder={page.isCenterfold ? page.content : (page.number === 1 ? 'Add your cover details here — headline, lead story, image notes...' : 'Describe page content…')}
          value={page.content}
          disabled={page.isCenterfold || reorderMode || isReadOnly}
          onChange={e => !isReadOnly && onUpdateContent(page.id, e.target.value)}
          onClick={e => { if (!reorderMode) e.stopPropagation(); }}
        />
      </div>

      <div className="tile-footer">
        <label className="received-check" onClick={e => e.stopPropagation()}>
          <div
            className={`check-box ${page.contentReceived ? 'checked' : ''}`}
            onClick={() => { if (!reorderMode && !isReadOnly) onUpdateReceived(page.id, !page.contentReceived); }}
            style={{ cursor: isReadOnly ? 'default' : 'pointer', opacity: isReadOnly ? 0.5 : 1 }}
          >
            {page.contentReceived && <Check size={9} color="white" strokeWidth={3} />}
          </div>
          <span className="check-label">{page.contentReceived ? 'Received' : 'Pending'}</span>
        </label>

        <button
          className={`comment-btn ${page.comments.length > 0 ? 'has-comments' : ''}`}
          onClick={e => { e.stopPropagation(); if (!reorderMode) onOpenComments(page); }}
        >
          <MessageSquare size={11} />
          {page.comments.length > 0 ? page.comments.length : ''}
        </button>
      </div>
    </div>
  );
}

export default function GalleryView({
  pages, onUpdateContent, onUpdateReceived, onOpenComments,
  reorderMode, onSwap, onShift, role,
}) {
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [dragFromNumber, setDragFromNumber] = useState(null);
  const [dragOverNumber, setDragOverNumber] = useState(null);
  const [dropSide, setDropSide] = useState(null); // 'left' | 'right'
  const [shakingNumber, setShakingNumber] = useState(null);
  const totalPages = pages.length;

  const triggerShake = (number) => {
    setShakingNumber(number);
    setTimeout(() => setShakingNumber(null), 500);
  };

  const handleTileClick = (number, locked) => {
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

  const handleDragOver = (number, side) => {
    setDragOverNumber(number);
    setDropSide(side);
  };

  const handleDrop = (toNumber, locked, side) => {
    if (locked) { triggerShake(toNumber); setDragFromNumber(null); setDragOverNumber(null); setDropSide(null); return; }
    if (dragFromNumber && dragFromNumber !== toNumber) {
      // Adjust target index based on drop side
      const fromIdx = pages.findIndex(p => p.number === dragFromNumber);
      const toIdx = pages.findIndex(p => p.number === toNumber);
      // If dropping on right side and target is after source, use toNumber directly
      // If dropping on left side and target is before source, use toNumber directly
      // The shift logic handles the actual movement
      const adjustedToNumber = side === 'right' && toIdx >= fromIdx
        ? toNumber
        : side === 'left' && toIdx <= fromIdx
        ? toNumber
        : toNumber;
      onShift(dragFromNumber, adjustedToNumber);
    }
    setDragFromNumber(null);
    setDragOverNumber(null);
    setDropSide(null);
  };

  return (
    <div
      className="gallery-grid"
      onDragEnd={() => { setDragFromNumber(null); setDragOverNumber(null); setDropSide(null); }}
    >
      {pages.map(page => (
        <PageTile
          key={page.id}
          page={page}
          totalPages={totalPages}
          onUpdateContent={onUpdateContent}
          onUpdateReceived={onUpdateReceived}
          onOpenComments={onOpenComments}
          reorderMode={reorderMode}
          isSelected={selectedNumber === page.number}
          onTileClick={handleTileClick}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          isDragOver={dragOverNumber === page.number}
          dropSide={dragOverNumber === page.number ? dropSide : null}
          isShaking={shakingNumber === page.number}
          role={role}
        />
      ))}
    </div>
  );
}
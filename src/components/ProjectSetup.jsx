import { useState } from 'react';
import { roundToFour, buildPages } from '../utils/magazineUtils';

export default function ProjectSetup({ onCreateProject, onCancel, editMode = false, initialData = null }) {
  const [name, setName] = useState(initialData?.name || '');
  const [issue, setIssue] = useState(initialData?.issue || '');
  const [pageCount, setPageCount] = useState(initialData?.totalPages || 16);
  const [hasCenterfold, setHasCenterfold] = useState(initialData?.hasCenterfold || false);
  const [error, setError] = useState('');

  const adjustPages = (delta) => {
    setPageCount(prev => {
      const next = prev + delta * 4;
      return Math.max(4, next);
    });
  };

  const handleSubmit = () => {
    if (!name.trim()) { setError('Please give your magazine a name.'); return; }
    const total = roundToFour(pageCount);

    let pages;
    if (editMode && initialData) {
      // Preserve existing page content, only add/remove from the end
      const existingPages = initialData.pages || [];
      const newPages = buildPages(total, hasCenterfold);
      pages = newPages.map((newPage, i) => {
        const existing = existingPages[i];
        if (existing) {
          return {
            ...newPage,
            // Don't carry over content from old centerfold-locked pages
            content: existing.isCenterfold ? newPage.content : existing.content,
            contentReceived: existing.isCenterfold ? false : existing.contentReceived,
            comments: existing.isCenterfold ? [] : existing.comments,
          };
        }
        return newPage;
      });
    } else {
      pages = buildPages(total, hasCenterfold);
    }

    onCreateProject({
      name: name.trim(),
      issue: issue.trim(),
      totalPages: total,
      hasCenterfold,
      pages,
      ...(editMode ? {} : { createdAt: new Date().toISOString() }),
    });
  };

  return (
    <div className="setup-container">
      <div className="setup-header">
        <h2>{editMode ? 'Project Settings' : 'New Magazine Project'}</h2>
        <p>{editMode ? 'Update your magazine details. Page content will be preserved.' : 'Set up your layout blocking template. You can adjust pages later.'}</p>
      </div>

      <div className="setup-card">
        <div className="form-group">
          <label className="form-label">Magazine Name *</label>
          <input
            className="form-input"
            placeholder="e.g. LSeT Magazine"
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Issue / Edition</label>
          <input
            className="form-input"
            placeholder="e.g. Issue 01 · Spring 2025"
            value={issue}
            onChange={e => setIssue(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Total Pages</label>
          <div className="page-count-control">
            <button className="page-count-btn" onClick={() => adjustPages(-1)} disabled={pageCount <= 4}>−</button>
            <span className="page-count-display">{pageCount}</span>
            <button className="page-count-btn" onClick={() => adjustPages(1)}>+</button>
            <span className="page-count-hint">Always × 4 · min 4</span>
          </div>
        </div>

        <div className="toggle-row">
          <div className="toggle-info">
            <h4>Centerfold / Pull-Out Poster</h4>
            <p>Automatically blocks the 2 centre pages as a pull-away poster spread.</p>
          </div>
          <button
            className={`pill-toggle ${hasCenterfold ? 'on' : ''}`}
            onClick={() => setHasCenterfold(v => !v)}
          >
            <div className={`pill-thumb ${hasCenterfold ? 'on' : ''}`} />
          </button>
        </div>

        {error && <p style={{ color: 'var(--accent)', fontSize: 12, marginTop: 12, fontFamily: 'var(--font-mono)' }}>{error}</p>}

        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          {editMode && (
            <button className="btn-ghost" style={{ flex: 1 }} onClick={onCancel}>
              Cancel
            </button>
          )}
          <button className="btn-primary" style={{ flex: editMode ? 2 : 1, marginTop: 0 }} onClick={handleSubmit}>
            {editMode ? 'Save Changes' : 'Create Magazine Layout →'}
          </button>
        </div>
      </div>
    </div>
  );
}
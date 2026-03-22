import { useState } from 'react';
import { roundToFour, buildPages } from '../utils/magazineUtils';

export default function ProjectSetup({ onCreateProject }) {
  const [name, setName] = useState('');
  const [issue, setIssue] = useState('');
  const [pageCount, setPageCount] = useState(16);
  const [hasCenterfold, setHasCenterfold] = useState(false);
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
    const pages = buildPages(total, hasCenterfold);
    onCreateProject({ name: name.trim(), issue: issue.trim(), totalPages: total, hasCenterfold, pages, createdAt: new Date().toISOString() });
  };

  return (
    <div className="setup-container">
      <div className="setup-header">
        <h2>New Magazine Project</h2>
        <p>Set up your layout blocking template. You can adjust pages later.</p>
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

        <button className="btn-primary" onClick={handleSubmit}>
          Create Magazine Layout →
        </button>
      </div>
    </div>
  );
}

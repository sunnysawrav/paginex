import { getPrintOrder } from '../utils/magazineUtils';
import { Lock } from 'lucide-react';

export default function PrintOrderView({ pages, project }) {
  const sheets = getPrintOrder(project.totalPages);
  const pageMap = Object.fromEntries(pages.map(p => [p.number, p]));

  const renderPage = (num, side) => {
    const page = pageMap[num];
    if (!page) return null;

    const cls = [
      'print-page',
      num === 1 ? 'is-cover' : '',
      page.isCenterfold ? 'centerfold-page' : '',
    ].filter(Boolean).join(' ');

    return (
      <div key={num} className={cls}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="print-page-num">{num}</span>
          {page.isCenterfold && <Lock size={12} color="var(--centerfold-border)" />}
          {page.contentReceived && (
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.1em',
              textTransform: 'uppercase', background: 'var(--received)',
              color: 'var(--received-border)', padding: '1px 5px', borderRadius: 2
            }}>Received</span>
          )}
        </div>
        <p className="print-page-content">{page.content || <em style={{ opacity: 0.4 }}>No content yet</em>}</p>
        <span className="print-page-tag">{page.label}</span>
      </div>
    );
  };

  return (
    <div className="print-view">
      <div className="print-view-header">
        <h3>Print Imposition Order</h3>
        <p>
          Saddle-stitch layout · {project.totalPages} pages ·
          {sheets.length} sheets · Read-only
        </p>
      </div>

      {sheets.map(([left, right], i) => {
        const isOuter = i === 0;
        const sheetNum = i + 1;
        return (
          <div key={i} className="print-sheet">
            <div className="print-sheet-label">
              Sheet {sheetNum} of {sheets.length}
              {isOuter ? ' — Outer Wrap' : ''}
            </div>

            <div className="print-fold-indicator">
              <div className="fold-line" />
              <span>Back Side</span>
              <div className="fold-line" />
            </div>

            <div className="print-spread" style={{ marginBottom: 12 }}>
              {renderPage(left, 'left')}
              {renderPage(right, 'right')}
            </div>

            <div className="print-fold-indicator">
              <div className="fold-line" />
              <span>↑ Fold ↑</span>
              <div className="fold-line" />
            </div>
          </div>
        );
      })}

      <div style={{
        textAlign: 'center',
        padding: '20px',
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--text-muted)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        borderTop: '1px solid var(--border)',
        marginTop: 8,
      }}>
        Print order calculated using saddle-stitch imposition
      </div>
    </div>
  );
}

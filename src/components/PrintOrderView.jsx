import { getPrintOrder } from '../utils/magazineUtils';
import { Lock } from 'lucide-react';

function VerticalFold() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 10px',
      flexShrink: 0,
      userSelect: 'none',
      minHeight: 120,
    }}>
      {/* Dashes above */}
      <div style={{
        flex: 1,
        width: 1,
        borderLeft: '1.5px dashed var(--border-strong)',
        minHeight: 16,
      }} />
      {/* Vertical FOLD text centered */}
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: 'var(--border-strong)',
        writingMode: 'vertical-rl',
        textOrientation: 'mixed',
        transform: 'rotate(180deg)',
        padding: '6px 0',
        flexShrink: 0,
      }}>
        ↓ fold ↑
      </span>
      {/* Dashes below */}
      <div style={{
        flex: 1,
        width: 1,
        borderLeft: '1.5px dashed var(--border-strong)',
        minHeight: 16,
      }} />
    </div>
  );
}

export default function PrintOrderView({ pages, project }) {
  const spreads = getPrintOrder(project.totalPages);
  const pageMap = Object.fromEntries(pages.map(p => [p.number, p]));

  // Group spreads into physical sheets (pairs of spreads = 1 sheet)
  const physicalSheets = [];
  for (let i = 0; i < spreads.length; i += 2) {
    physicalSheets.push({
      front: spreads[i],       // first spread = front face
      back: spreads[i + 1] || null, // second spread = back face (may not exist)
    });
  }

  const renderPage = (num) => {
    const page = pageMap[num];
    if (!page) return null;

    const cls = [
      'print-page',
      num === 1 ? 'is-cover' : '',
      page.isCenterfold ? 'centerfold-page' : '',
    ].filter(Boolean).join(' ');

    return (
      <div key={num} className={cls} style={{ flex: 1 }}>
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

  const renderFace = (spread, faceLabel, tint) => {
    if (!spread) return null;
    const [left, right] = spread;
    return (
      <div style={{
        background: tint,
        borderRadius: 'var(--radius)',
        padding: '14px 16px 12px',
      }}>
        {/* Face label */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginBottom: 10,
        }}>
          {faceLabel}
        </div>

        {/* Pages + vertical fold */}
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 0 }}>
          {renderPage(left)}
          <VerticalFold />
          {renderPage(right)}
        </div>
      </div>
    );
  };

  return (
    <div className="print-view">
      <div className="print-view-header">
        <h3>Print Imposition Order</h3>
        <p>
          Saddle-stitch layout · {project.totalPages} pages ·{' '}
          {physicalSheets.length} sheets · Read-only
        </p>
      </div>

      {physicalSheets.map(({ front, back }, i) => {
        const isOuter = i === 0;
        const sheetNum = i + 1;

        return (
          <div key={i} className="print-sheet" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Sheet label */}
            <div className="print-sheet-label">
              Sheet {sheetNum} of {physicalSheets.length}
              {isOuter ? ' — Outer Wrap' : ''}
            </div>

            {/* Front face */}
            {renderFace(front, 'Front Face', 'rgba(0,0,0,0.025)')}

            {/* Divider between faces */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '0 4px',
            }}>
              <div style={{ flex: 1, height: 1, borderTop: '1px solid var(--border)' }} />
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                flexShrink: 0,
              }}>flip sheet</span>
              <div style={{ flex: 1, height: 1, borderTop: '1px solid var(--border)' }} />
            </div>

            {/* Back face */}
            {back && renderFace(back, 'Back Face', 'transparent')}
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
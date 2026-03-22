/**
 * Round up to nearest multiple of 4 (min 4)
 */
export function roundToFour(n) {
  const num = Math.max(4, n);
  return Math.ceil(num / 4) * 4;
}

/**
 * Build the initial pages array for a project
 * @param {number} totalPages - must be multiple of 4
 * @param {boolean} hasCenterfold
 */
export function buildPages(totalPages, hasCenterfold) {
  const pages = Array.from({ length: totalPages }, (_, i) => ({
    id: i + 1,
    number: i + 1,
    label: getPageLabel(i + 1, totalPages),
    content: '',
    contentReceived: false,
    comments: [],
    isLocked: false,
    isCenterfold: false,
    isBack: i + 1 === totalPages,
  }));

  // Page 1 is always cover
  pages[0].label = 'Cover';
  pages[0].isLocked = true; // Cover is special but editable content

  // Last page is back cover
  pages[totalPages - 1].label = 'Back Cover';

  // Centerfold: lock the 2 center pages
  if (hasCenterfold) {
    const mid = totalPages / 2;
    const cf1 = mid - 1; // 0-indexed
    const cf2 = mid;     // 0-indexed
    pages[cf1].isCenterfold = true;
    pages[cf1].isLocked = true;
    pages[cf1].label = 'Centerfold Left';
    pages[cf1].content = '— Centerfold Pull-Out Poster —';
    pages[cf2].isCenterfold = true;
    pages[cf2].isLocked = true;
    pages[cf2].label = 'Centerfold Right';
    pages[cf2].content = '— Centerfold Pull-Out Poster —';
  }

  return pages;
}

function getPageLabel(num, total) {
  if (num === 1) return 'Cover';
  if (num === 2) return 'Inside Front Cover';
  if (num === total) return 'Back Cover';
  if (num === total - 1) return 'Inside Back Cover';
  return `Page ${num}`;
}

/**
 * Calculate print order (saddle-stitch imposition)
 * Returns array of spreads: [[back, front], [p2, p(n-1)], ...]
 * Each spread is [left-page-number, right-page-number]
 */
export function getPrintOrder(totalPages) {
  const sheets = [];
  let lo = 1;
  let hi = totalPages;

  while (lo < hi) {
    sheets.push([hi, lo]);    // outer: back cover left, cover right
    lo++;
    hi--;
    if (lo < hi) {
      sheets.push([lo, hi]);  // inner spread
      lo++;
      hi--;
    }
  }

  return sheets;
}

/**
 * Get centerfold page indices (1-based)
 */
export function getCenterfoldPages(totalPages) {
  return [totalPages / 2, totalPages / 2 + 1];
}

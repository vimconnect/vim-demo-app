import { describe, expect, it } from 'vitest';
import { findTextMatches } from './text-search';

function rootWith(html: string): HTMLElement {
  const root = document.createElement('div');
  root.innerHTML = html;
  return root;
}

describe('findTextMatches', () => {
  it('finds every case-insensitive occurrence across text nodes', () => {
    const root = rootWith('<p>MRN: SBX0002</p><pre>{"mrn": "SBX0002", "mrnType": "x"}</pre>');
    const matches = findTextMatches(root, 'mrn');
    expect(matches).toHaveLength(3);
    expect(matches.map((r) => r.toString())).toEqual(['MRN', 'mrn', 'mrn']);
  });

  it('skips text inside a collapsed section and ignored elements', () => {
    const root = rootWith(
      '<div class="section-content collapsed"><p>mrn</p></div><div data-search-ignore><input value="mrn"/>mrn</div><p>mrn</p>',
    );
    expect(findTextMatches(root, 'mrn')).toHaveLength(1);
  });

  it('returns nothing for a blank query', () => {
    expect(findTextMatches(rootWith('<p>anything</p>'), '  ')).toEqual([]);
  });
});

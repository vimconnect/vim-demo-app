/** Elements whose text a search skips: hidden by a collapsed section, or not page content. */
const SKIP_SELECTOR = '.section-content.collapsed, script, style, [data-search-ignore]';

/** Every case-insensitive occurrence of `query` in `root`'s visible text, in document order. */
export function findTextMatches(root: Node, query: string): Range[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  const doc = root.ownerDocument ?? (root as Document);
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) =>
      node.parentElement?.closest(SKIP_SELECTOR) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
  });
  const ranges: Range[] = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = (node.textContent ?? '').toLowerCase();
    for (let at = text.indexOf(needle); at !== -1; at = text.indexOf(needle, at + needle.length)) {
      const range = doc.createRange();
      range.setStart(node, at);
      range.setEnd(node, at + needle.length);
      ranges.push(range);
    }
  }
  return ranges;
}

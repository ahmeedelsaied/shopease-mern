import { memo } from 'react';

/**
 * Highlight – safely highlights occurrences of `term` inside `text` by splitting
 * the string into plain-text nodes and wrapping matches in <mark>. No HTML is
 * injected, so this is safe against XSS by construction.
 *
 * Matching is case-insensitive and escapes regex metacharacters in the term.
 * Returns the original text untouched when there is no usable term.
 */
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const Highlight = memo(({ text = '', term = '' }) => {
  const trimmed = term?.trim();
  if (!trimmed) return text;

  const matcher = new RegExp(`(${escapeRegExp(trimmed)})`, 'gi');
  const parts = String(text).split(matcher);

  return (
    <>
      {parts.map((part, index) => {
        const isMatch = part.toLowerCase() === trimmed.toLowerCase();
        return isMatch ? (
          <mark key={index} className="rounded bg-secondary/20 px-0.5 text-inherit">
            {part}
          </mark>
        ) : (
          part
        );
      })}
    </>
  );
});

Highlight.displayName = 'Highlight';

export default Highlight;

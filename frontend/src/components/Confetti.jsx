import { memo, useMemo } from 'react';

/**
 * Confetti – CSS-only celebratory pieces for the order success page.
 *
 * Pure presentation: each piece's horizontal drift, start position, color and
 * delay are randomized once (memoized) and read by CSS custom properties in
 * the `confetti-fall` keyframe (defined in index.css). No third-party
 * dependency. The `prefers-reduced-motion` media query in the same CSS file
 * disables the animation and hides the layer entirely for users who opt out of
 * motion.
 *
 * @param {object}   props
 * @param {number}   [props.count=14] - Number of confetti pieces.
 * @param {string[]} [props.colors]   - Custom colors; defaults to the ShopEase
 *                                       secondary accent + a celebratory set.
 * @returns {JSX.Element}
 */
const DEFAULT_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444'];

const randomBetween = (min, max) => Math.random() * (max - min) + min;

const buildPiece = (index, colors) => {
  const color = colors[index % colors.length];
  // Spread pieces across the top edge, then let --confetti-x drift them.
  const left = randomBetween(0, 100);
  const drift = randomBetween(-40, 40);
  const delay = randomBetween(0, 0.8);
  return {
    id: index,
    style: {
      '--confetti-left': `${left}%`,
      '--confetti-x': `${drift}px`,
      '--confetti-delay': `${delay}s`,
      '--confetti-color': color,
    },
  };
};

const Confetti = ({ count = 14, colors = DEFAULT_COLORS }) => {
  const pieces = useMemo(
    () => Array.from({ length: count }, (_, index) => buildPiece(index, colors)),
    [count, colors]
  );

  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((piece) => (
        <span key={piece.id} className="confetti__piece" style={piece.style} />
      ))}
    </div>
  );
};

Confetti.displayName = 'Confetti';

export default memo(Confetti);

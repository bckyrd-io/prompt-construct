import { useWindowDimensions } from 'react-native';

/**
 * Column count for a responsive card grid.
 *
 * The web app used Tailwind's `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`, which
 * collapse to a single column on a phone. Reproducing that here keeps the same
 * responsive behaviour when running on a tablet or via `expo start --web`.
 */
export function useGridColumns(options: {
  /** Narrowest a card may get before the grid drops a column. */
  minCardWidth: number;
  maxColumns: number;
  gap?: number;
  horizontalPadding?: number;
}): number {
  const { width } = useWindowDimensions();
  const { minCardWidth, maxColumns, gap = 16, horizontalPadding = 32 } = options;

  const usable = width - horizontalPadding;
  const columns = Math.floor((usable + gap) / (minCardWidth + gap));

  return Math.max(1, Math.min(maxColumns, columns));
}

/** Width of one card in the grid, for setting explicit widths on grid children. */
export function useGridCardWidth(options: {
  minCardWidth: number;
  maxColumns: number;
  gap?: number;
  horizontalPadding?: number;
}): number {
  const { width } = useWindowDimensions();
  const { minCardWidth, maxColumns, gap = 16, horizontalPadding = 32 } = options;

  const usable = width - horizontalPadding;
  const columns = Math.max(1, Math.min(maxColumns, Math.floor((usable + gap) / (minCardWidth + gap))));

  return Math.floor((usable - gap * (columns - 1)) / columns);
}
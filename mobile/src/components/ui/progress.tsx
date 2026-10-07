import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius } from '@/constants/theme';

/**
 * Port of `components/ui/progress.tsx` — muted track, primary indicator.
 * `tone` covers the per-call-site overrides in the web app (green for "Paid",
 * gold for the payment summary bar).
 */
export function Progress({
  value,
  tone = colors.primary,
  height = 6,
  trackColor = colors.muted,
  style,
}: {
  /** 0-100 */
  value: number;
  tone?: string;
  height?: number;
  trackColor?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const clamped = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped) }}
      style={[
        styles.track,
        { height, borderRadius: height / 2, backgroundColor: trackColor },
        style,
      ]}>
      <View
        style={[
          styles.indicator,
          { width: `${clamped}%`, backgroundColor: tone, borderRadius: height / 2 },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: radius.full,
  },
  indicator: { height: '100%' },
});
import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/constants/theme';
import { AppText } from './text';

/**
 * Screen shell: safe-area padding plus an optional scroll container.
 *
 * The web app used `h-screen overflow-hidden` with an inner scroller; on mobile
 * the whole page scrolls, so this just owns the insets and the background.
 */
export function Screen({
  children,
  scroll = true,
  padded = true,
  background = colors.background,
  bottomInset = true,
}: {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  background?: string;
  /** Set false for screens that host their own bottom bar. */
  bottomInset?: boolean;
}) {
  return (
    <SafeAreaView
      edges={bottomInset ? ['top', 'left', 'right', 'bottom'] : ['top', 'left', 'right']}
      style={[styles.safe, { backgroundColor: background }]}>
      {scroll ? (
        <View style={[styles.content, padded ? styles.padded : null]}>{children}</View>
      ) : (
        <View style={styles.flex}>{children}</View>
      )}
    </SafeAreaView>
  );
}

export function Loading({ label }: { label?: string }) {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={colors.primary} />
      {label ? (
        <AppText variant="sm" tone="muted">
          {label}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  content: { flexGrow: 1 },
  padded: { padding: 16, gap: 16 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
});
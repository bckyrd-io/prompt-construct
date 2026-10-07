import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius } from '@/constants/theme';
import { AppText } from './text';

/** Empty/error state, mirroring the web app's `<Card className="p-16 text-center">`. */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.wrapper}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <AppText variant="lg" weight="semibold" style={styles.center}>
        {title}
      </AppText>
      {description ? (
        <AppText variant="sm" tone="muted" style={styles.center}>
          {description}
        </AppText>
      ) : null}
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 48,
    paddingHorizontal: 24,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 56,
    marginBottom: 4,
    borderRadius: 28,
    backgroundColor: colors.muted,
  },
  center: { textAlign: 'center' },
  action: { marginTop: 8 },
});
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius } from '@/constants/theme';
import { AppText } from './text';

/** Port of `components/ui/card.tsx` — flat surface, hairline border, `rounded-xl`. */
export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function CardHeader({
  title,
  description,
  action,
  style,
}: {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  if (!title && !description && !action) return null;
  return (
    <View style={[styles.header, style]}>
      <View style={styles.headerText}>
        {title ? <AppText variant="lg">{title}</AppText> : null}
        {description ? (
          <AppText variant="sm" tone="muted">
            {description}
          </AppText>
        ) : null}
      </View>
      {action}
    </View>
  );
}

export function CardContent({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.content, style]}>{children}</View>;
}

export function CardFooter({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.footer, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    padding: 16,
    paddingBottom: 0,
  },
  headerText: { flex: 1, gap: 4 },
  content: { padding: 16, gap: 12 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    paddingTop: 0,
  },
});
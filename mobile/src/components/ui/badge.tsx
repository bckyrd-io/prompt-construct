import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, fontFamily, radius } from '@/constants/theme';
import { AppText } from './text';

/**
 * Port of `components/ui/badge.tsx`.
 *
 * The `variant` set matches shadcn. `tone` covers the one-off semantic colours
 * the pages inline in the web app (the green "AI Active" pill, gold payment
 * badges, amber "Due" badges) so those stay declarative instead of ad-hoc.
 */
export type BadgeVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
export type BadgeTone = 'neutral' | 'green' | 'gold' | 'amber' | 'blue' | 'purple' | 'red';

export interface BadgeProps {
  variant?: BadgeVariant;
  tone?: BadgeTone;
  icon?: ReactNode;
  uppercase?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

const toneStyle: Record<BadgeTone, ViewStyle> = {
  neutral: {},
  green: { backgroundColor: '#dcfce7', borderColor: '#bbf7d0' },
  gold: { backgroundColor: '#fff4cc', borderColor: '#ffc300' },
  amber: { backgroundColor: '#fef3c7', borderColor: '#fde68a' },
  blue: { backgroundColor: '#dbeafe', borderColor: '#bfdbfe' },
  purple: { backgroundColor: '#f3e8ff', borderColor: '#e9d5ff' },
  red: { backgroundColor: '#fee2e2', borderColor: '#fecaca' },
};

const toneText: Record<BadgeTone, string | undefined> = {
  neutral: undefined,
  green: '#15803d',
  gold: '#854d0e',
  amber: '#b45309',
  blue: '#1d4ed8',
  purple: '#7e22ce',
  red: '#b91c1c',
};

export function Badge({
  variant = 'default',
  tone = 'neutral',
  icon,
  uppercase,
  style,
  children,
}: BadgeProps) {
  const container =
    tone !== 'neutral' ? toneStyle[tone] : containerFor(variant);
  const color = toneText[tone] ?? textFor(variant);

  return (
    <View style={[styles.badge, container, style]}>
      {icon}
      {typeof children === 'string' || typeof children === 'number' ? (
        <AppText
          variant="xs"
          weight="medium"
          uppercase={uppercase}
          style={[styles.label, { color }, uppercase ? styles.uppercase : null]}>
          {children}
        </AppText>
      ) : (
        children
      )}
    </View>
  );
}

function containerFor(variant: BadgeVariant): ViewStyle {
  switch (variant) {
    case 'default':
      return { backgroundColor: colors.primary, borderColor: colors.primary };
    case 'secondary':
      return { backgroundColor: colors.secondary, borderColor: colors.transparent };
    case 'outline':
      return { backgroundColor: colors.transparent, borderColor: colors.border };
    case 'ghost':
      return { backgroundColor: colors.transparent, borderColor: colors.transparent };
    case 'destructive':
      return { backgroundColor: colors.destructiveBg, borderColor: colors.transparent };
  }
}

function textFor(variant: BadgeVariant): string {
  switch (variant) {
    case 'default':
      return colors.primaryForeground;
    case 'secondary':
      return colors.secondaryForeground;
    case 'outline':
    case 'ghost':
      return colors.foreground;
    case 'destructive':
      return colors.destructive;
  }
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 20,
    paddingHorizontal: 8,
    borderRadius: radius['4xl'],
    borderWidth: 1,
    overflow: 'hidden',
  },
  label: { lineHeight: 14 },
  uppercase: { letterSpacing: 0.6, fontFamily: fontFamily.semibold },
});

/** Small round status dot used inside badges (the pulsing "AI Active" dot). */
export function Dot({ color = colors.success, size = 6 }: { color?: string; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
      }}
    />
  );
}
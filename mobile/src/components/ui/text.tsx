import { Text as RNText, StyleSheet, type TextProps as RNTextProps } from 'react-native';

import { colors, type } from '@/constants/theme';

export type TextVariant = keyof typeof type;
export type TextTone =
  | 'default'
  | 'muted'
  | 'subtle'
  | 'primary'
  | 'success'
  | 'warning'
  | 'destructive'
  | 'inverse';

export interface AppTextProps extends RNTextProps {
  variant?: TextVariant;
  tone?: TextTone;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  uppercase?: boolean;
}

const toneColor: Record<TextTone, string> = {
  default: colors.foreground,
  muted: colors.mutedForeground,
  subtle: colors.textMuted,
  primary: colors.primary,
  success: colors.successText,
  warning: colors.warningText,
  destructive: colors.destructive,
  inverse: colors.background,
};

const weightOverride = {
  regular: 'WorkSans_400Regular',
  medium: 'WorkSans_500Medium',
  semibold: 'WorkSans_600SemiBold',
  bold: 'WorkSans_700Bold',
  extrabold: 'WorkSans_800ExtraBold',
} as const;

/**
 * Thin wrapper over RN `Text` carrying the web app's type scale, so screens read
 * like the Tailwind classes they replace (`text-sm font-medium text-muted-foreground`).
 */
export function AppText({
  variant = 'base',
  tone = 'default',
  weight,
  uppercase,
  style,
  ...rest
}: AppTextProps) {
  return (
    <RNText
      {...rest}
      style={[
        type[variant],
        weight ? { fontFamily: weightOverride[weight] } : null,
        { color: toneColor[tone] },
        uppercase ? styles.uppercase : null,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  uppercase: { textTransform: 'uppercase' },
});
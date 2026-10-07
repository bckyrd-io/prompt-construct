import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, radius } from '@/constants/theme';
import { AppText } from './text';

/**
 * Port of `components/ui/button.tsx` (shadcn `cva` variants) to `Pressable`.
 *
 * `Pressable` rather than `@expo/ui` `Button` on purpose: the web app overrides
 * button styling per call site (amber primary, black CTA that turns gold on
 * hover, ghost rows in the sidebar) and a native button would impose its own
 * chrome instead of matching that design.
 */
export type ButtonVariant = 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link' | 'inverse';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const height: Record<ButtonSize, number> = { xs: 24, sm: 28, md: 36, lg: 44, xl: 48 };

const padding: Record<ButtonSize, number> = { xs: 8, sm: 10, md: 12, lg: 20, xl: 20 };
const fontVariant = { xs: 'xs', sm: 'xs', md: 'sm', lg: 'sm', xl: 'base' } as const;

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

export function Button({
  variant = 'default',
  size = 'md',
  icon,
  iconRight,
  loading,
  fullWidth,
  disabled,
  style,
  children,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const tone = variantTone[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      disabled={isDisabled}
      {...rest}
      style={({ pressed }) => [
        styles.base,
        { height: height[size], paddingHorizontal: padding[size] },
        containerFor(variant),
        pressed && !isDisabled ? pressedFor(variant) : null,
        fullWidth ? styles.fullWidth : null,
        isDisabled ? styles.disabled : null,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator size="small" color={tone} />
      ) : (
        <>
          {icon}
          {children ? (
            <AppText variant={fontVariant[size]} weight="semibold" style={{ color: tone }}>
              {children}
            </AppText>
          ) : null}
          {iconRight}
        </>
      )}
    </Pressable>
  );
}

/** Square icon-only button, mirroring the web `size="icon"` variant. */
export function IconButton({
  variant = 'ghost',
  size = 40,
  disabled,
  style,
  children,
  ...rest
}: Omit<ButtonProps, 'size' | 'icon' | 'iconRight' | 'loading' | 'fullWidth' | 'children'> & {
  size?: number;
  children: ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      {...rest}
      style={({ pressed }) => [
        styles.iconButton,
        { width: size, height: size, borderRadius: Math.min(radius.lg, size / 2) },
        containerFor(variant),
        pressed && !disabled ? pressedFor(variant) : null,
        disabled ? styles.disabled : null,
        style,
      ]}>
      {children}
    </Pressable>
  );
}

const variantTone: Record<ButtonVariant, string> = {
  default: colors.primaryForeground,
  outline: colors.foreground,
  secondary: colors.secondaryForeground,
  ghost: colors.foreground,
  destructive: colors.destructive,
  link: colors.primary,
  inverse: colors.background,
};

function containerFor(variant: ButtonVariant): ViewStyle {
  switch (variant) {
    case 'default':
      return { backgroundColor: colors.primary };
    case 'outline':
      return { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border };
    case 'secondary':
      return { backgroundColor: colors.secondary };
    case 'ghost':
      return { backgroundColor: colors.transparent };
    case 'destructive':
      return { backgroundColor: colors.destructiveBg };
    case 'link':
      return { backgroundColor: colors.transparent };
    // `inverse` is the web app's black CTA (`bg-black text-white`).
    case 'inverse':
      return { backgroundColor: colors.foreground };
  }
}

function pressedFor(variant: ButtonVariant): ViewStyle {
  switch (variant) {
    case 'default':
      return { backgroundColor: colors.primaryHover };
    case 'outline':
    case 'ghost':
      return { backgroundColor: colors.muted };
    case 'secondary':
      return { backgroundColor: colors.border };
    case 'destructive':
      return { backgroundColor: colors.destructiveBorder };
    case 'link':
      return { opacity: 0.7 };
    case 'inverse':
      // The web CTA turns gold on hover/press (`hover:bg-[#ffc300] hover:text-black`).
      return { backgroundColor: colors.gold };
  }
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.transparent,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.transparent,
  },
  fullWidth: { alignSelf: 'stretch' },
  disabled: { opacity: 0.5 },
});
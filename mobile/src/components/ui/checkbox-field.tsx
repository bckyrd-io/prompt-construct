import type { ReactNode } from 'react';
import { Checkbox, Host } from '@expo/ui';
import { Pressable, StyleSheet, View } from 'react-native';

import { fontFamily } from '@/constants/theme';
import { AppText } from './text';

/**
 * Checkbox backed by `@expo/ui` `Checkbox` (Material 3 on Android, native on
 * iOS). Replaces the web app's Radix `<Checkbox>`.
 *
 * The label is rendered as React Native text rather than the native `label` prop
 * so it can wrap to multiple lines in the same muted styling as the web version.
 */
export function CheckboxField({
  value,
  onValueChange,
  children,
  style,
}: {
  value: boolean;
  onValueChange: (value: boolean) => void;
  children: ReactNode;
  style?: object;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value }}
      onPress={() => onValueChange(!value)}
      style={[styles.row, style]}>
      <Host matchContents style={styles.host}>
        <Checkbox value={value} onValueChange={onValueChange} />
      </Host>
      <AppText variant="sm" tone="muted" style={styles.label}>
        {children}
      </AppText>
    </Pressable>
  );
}

/** Inline labelled checkbox with the box on the left and label beside it. */
export function InlineCheckbox({
  value,
  onValueChange,
  label,
}: {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <View style={styles.inline}>
      <Host matchContents style={styles.host}>
        <Checkbox value={value} onValueChange={onValueChange} />
      </Host>
      <AppText variant="sm" tone="muted" style={styles.inlineLabel}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  host: { paddingTop: 2 },
  label: { flex: 1, lineHeight: 20 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  inlineLabel: { fontFamily: fontFamily.regular },
});
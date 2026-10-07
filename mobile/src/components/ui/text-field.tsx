import { Host, TextInput as ExpoTextInput } from '@expo/ui';
import { useState } from 'react';
import { StyleSheet, View, type KeyboardTypeOptions } from 'react-native';

import { colors, radius } from '@/constants/theme';
import { AppText } from './text';

/**
 * Text field backed by `@expo/ui` `TextInput`, which renders a real SwiftUI
 * `TextField` on iOS and a Jetpack Compose `TextField` on Android.
 *
 * Deliberately **uncontrolled**: `value` on the universal TextInput is an
 * `ObservableState` (see the @expo/ui docs), which is more machinery than a form
 * needs. The field keeps its own text and reports every edit through
 * `onChangeText`, so the parent still gets live state for validation.
 *
 * `value` is therefore only an **initial** value, snapshotted once on mount. It
 * must NOT key off the live value: keying on `value` remounts the native field
 * on every keystroke (the parent re-renders as you type), which drops focus and
 * collapses the keyboard mid-word.
 */
export interface TextFieldProps {
  label?: string;
  value?: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  editable?: boolean;
  onSubmitEditing?: () => void;
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  testID?: string;
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  helperText,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  editable = true,
  onSubmitEditing,
  returnKeyType,
  testID,
}: TextFieldProps) {
  // Frozen at mount. A lazy initialiser runs once, so this never changes for the
  // lifetime of the field and the `key` below stays stable. Keying on the live
  // `value` instead would remount the native input on every keystroke and make
  // the keyboard collapse mid-word.
  const [initialValue] = useState(value ?? '');

  return (
    <View style={styles.field}>
      {label ? (
        <AppText variant="xs" weight="semibold" tone="subtle" uppercase>
          {label}
        </AppText>
      ) : null}

      <View style={[styles.box, error ? styles.boxError : null]}>
        <Host matchContents={{ vertical: true }} style={styles.host}>
          <ExpoTextInput
            key={initialValue}
            defaultValue={initialValue}
            placeholder={placeholder}
            placeholderTextColor={colors.mutedForeground}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            editable={editable}
            onSubmitEditing={onSubmitEditing}
            returnKeyType={returnKeyType}
            selectionColor={colors.primary}
            testID={testID}
            style={styles.input}
          />
        </Host>
      </View>

      {error ? (
        <AppText variant="xs" tone="destructive">
          {error}
        </AppText>
      ) : helperText ? (
        <AppText variant="xs" tone="muted">
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  host: { width:'100%' },
  box: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.input,
    backgroundColor: colors.background,
  },
  boxError: { borderColor: colors.destructive },
  input: {
    padding: 0,
    backgroundColor: colors.transparent,
    borderWidth: 0,
  },
});
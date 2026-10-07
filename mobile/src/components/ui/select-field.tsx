import { Host, Picker } from '@expo/ui';
import { StyleSheet, View } from 'react-native';

import { colors, radius } from '@/constants/theme';
import { AppText } from './text';

export interface SelectOption<T extends string = string> {
  label: string;
  value: T;
}

/**
 * Dropdown backed by `@expo/ui` `Picker`, which renders a native menu on both
 * platforms (rotor on iOS if `appearance="wheel"`). Replaces the web app's
 * Radix `<Select>`.
 *
 * Note the universal Picker cannot be restyled beyond its box, so the label sits
 * outside the native control.
 */
export function SelectField<T extends string = string>({
  label,
  value,
  options,
  onValueChange,
  placeholder,
  disabled,
  testID,
}: {
  label?: string;
  value: T;
  options: readonly SelectOption<T>[];
  onValueChange: (value: T) => void;
  placeholder?: string;
  disabled?: boolean;
  testID?: string;
}) {
  const selected = options.find((option) => option.value === value);

  return (
    <View style={styles.field}>
      {label ? (
        <AppText variant="xs" weight="semibold" tone="subtle" uppercase>
          {label}
        </AppText>
      ) : null}

      <View style={styles.box}>
        <Host matchContents={{ vertical: true }} style={styles.host}>
          <Picker
            selectedValue={value}
            onValueChange={onValueChange}
            enabled={!disabled}
            testID={testID}>
            {options.map((option) => (
              <Picker.Item key={option.value} label={option.label} value={option.value} />
            ))}
          </Picker>
        </Host>
      </View>

      {!selected && placeholder ? (
        <AppText variant="xs" tone="muted">
          {placeholder}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  host: { width: '100%' },
  box: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.input,
    backgroundColor: colors.background,
  },
});
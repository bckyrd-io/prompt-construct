import { Host, TextInput as ExpoTextInput, type TextInputRef } from '@expo/ui';
import { ArrowUp } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius } from '@/constants/theme';

/**
 * Chat-style prompt composer, replacing the single-line input + separate search
 * button on the landing page.
 *
 * Differences from `TextField`:
 *  - multi-line, auto-growing between one and `maxHeight`
 *  - the submit button sits **inside** the field, bottom-right, and only becomes
 *    active once there is something to send
 *  - submits and dismisses the keyboard on tap
 *
 * `onChangeText` reports the live value so the parent can react, but the native
 * field stays uncontrolled (see `TextField` for why).
 */
export function PromptComposer({
  value,
  onChangeText,
  onSubmit,
  placeholder = 'Ask anything...',
  minHeight = 56,
  maxHeight = 140,
  testID,
}: {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  testID?: string;
}) {
  const [height, setHeight] = useState(minHeight);
  const inputRef = useRef<TextInputRef | null>(null);

  const canSubmit = value.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit();
    // Collapse the keyboard after sending, the way a chat app does.
    inputRef.current?.blur();
  };

  return (
    <View style={styles.wrap}>
      <Host matchContents={{ vertical: true }} style={styles.host}>
        <ExpoTextInput
          ref={inputRef}
          // No `key` here on purpose. Keying on the value (even bucketed) remounts
          // the native field and drops focus. The composer has no prefill, so the
          // native field can just own its text.
          defaultValue={value}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          selectionColor={colors.primary}
          multiline
          numberOfLines={2}
          onChangeText={onChangeText}
          // Grow with the content, but stop at maxHeight and scroll beyond it.
          onContentSizeChange={(size) => {
            const next = Math.min(Math.max(size.height, minHeight), maxHeight);
            setHeight(next);
          }}
          style={StyleSheet.flatten([styles.input, { minHeight, maxHeight, height }])}
          testID={testID}
        />
      </Host>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Send"
        accessibilityState={{ disabled: !canSubmit }}
        disabled={!canSubmit}
        onPress={handleSubmit}
        style={({ pressed }) => [
          styles.send,
          !canSubmit ? styles.sendDisabled : null,
          pressed && canSubmit ? styles.sendPressed : null,
        ]}>
        <ArrowUp size={18} color={colors.background} strokeWidth={2.5} />
      </Pressable>
    </View>
  );
}

const SEND_SIZE = 34;

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    padding: 8,
    paddingRight: 10,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  host: { flex: 1 },
  input: {
    flex: 1,
    // The send button sits in the padding-right gutter, so the text never runs
    // underneath it.
    paddingTop: 6,
    paddingRight: SEND_SIZE + 10,
    paddingBottom: 6,
    paddingLeft: 6,
    textAlignVertical: 'center',
    backgroundColor: colors.transparent,
    borderWidth: 0,
  },
  send: {
    width: SEND_SIZE,
    height: SEND_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SEND_SIZE / 2,
    backgroundColor: colors.foreground,
  },
  sendPressed: { opacity: 0.85 },
  sendDisabled: { backgroundColor: colors.border },
});
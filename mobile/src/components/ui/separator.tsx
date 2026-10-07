import { View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/constants/theme';

/** Port of `<Separator />` / `@radix-ui/react-separator`. */
export function Divider({
  vertical,
  style,
}: {
  vertical?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      accessibilityRole="none"
      style={[
        vertical ? styles.vertical : styles.horizontal,
        style,
      ]}
    />
  );
}

const styles = {
  horizontal: {
    height: 1,
    width: '100%',
    backgroundColor: colors.border,
  },
  vertical: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: colors.border,
  },
} satisfies Record<string, ViewStyle>;
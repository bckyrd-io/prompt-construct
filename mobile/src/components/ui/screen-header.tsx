import type { ReactNode } from 'react';
import { ArrowLeft, Menu } from 'lucide-react-native';
import { useNavigation, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { colors, radius } from '@/constants/theme';
import { useAuthStore } from '@/store/auth';
import { IconButton } from './button';
import { AppText } from './text';

/** The drawer navigator exposes `openDrawer` on its navigation object. */
type MaybeDrawerNavigation = { openDrawer?: () => void };

/**
 * Replaces the web app's `<header>` + `<SidebarTrigger />`.
 *
 * Three left-hand states, in priority order:
 *  1. `brand` — a logo tile + wordmark, used by the public landing page which has
 *     no sidebar and nothing to go back to
 *  2. drawer toggle — signed in, on a screen inside the drawer navigator
 *  3. back arrow — everywhere else, but only when there is somewhere to go back
 *     to; a dead arrow on a landing page is worse than nothing
 */
export function ScreenHeader({
  title,
  subtitle,
  right,
  showBack,
  brand,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  /** Force the back arrow even inside the drawer. */
  showBack?: boolean;
  /** Show this emoji in a brand tile ahead of the title, instead of an icon. */
  brand?: string;
}) {
  const navigation = useNavigation();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const canOpenDrawer =
    isAuthenticated &&
    typeof (navigation as MaybeDrawerNavigation).openDrawer === 'function';
  const canGoBack = router.canGoBack();
  const useBack = !brand && (showBack ?? !canOpenDrawer) && canGoBack;

  return (
    <View style={styles.header}>
      <View style={styles.left}>
        {brand ? (
          <View style={styles.brandTile}>
            <AppText variant="base">{brand}</AppText>
          </View>
        ) : canOpenDrawer ? (
          <IconButton
            accessibilityLabel="Open navigation menu"
            variant="ghost"
            onPress={() => (navigation as MaybeDrawerNavigation).openDrawer?.()}>
            <Menu size={20} color={colors.foreground} strokeWidth={2} />
          </IconButton>
        ) : useBack ? (
          <IconButton
            accessibilityLabel="Go back"
            variant="ghost"
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}>
            <ArrowLeft size={20} color={colors.foreground} strokeWidth={2} />
          </IconButton>
        ) : null}
        <View style={styles.titles}>
          <AppText variant="sm" weight="semibold" numberOfLines={1}>
            {title}
          </AppText>
          {subtitle ? (
            <AppText variant="xs" tone="muted" numberOfLines={1}>
              {subtitle}
            </AppText>
          ) : null}
        </View>
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 56,
    paddingHorizontal: 8,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  brandTile: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  titles: { flex: 1, gap: 1 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
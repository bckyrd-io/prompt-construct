import { LogIn, LogOut } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { DrawerItemList, type DrawerContentComponentProps } from 'expo-router/drawer';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { APP_LOGO, APP_NAME } from '@/constants/app';
import { colors, fontFamily, radius } from '@/constants/theme';
import { initials } from '@/lib/format';
import { useAuthStore } from '@/store/auth';
import { AppText } from './ui/text';

/**
 * Mobile counterpart of `components/AppSidebar.tsx`.
 *
 * The web app renders a collapsible sidebar that becomes an overlay sheet below
 * `md` (768px); the drawer does the same thing natively. The structure mirrors the
 * sidebar one-for-one: logo header, the nav list, and a footer user chip with
 * sign-out.
 *
 * Items themselves come from `<Drawer.Screen>` options in `src/app/_layout.tsx`, so
 * active-state styling stays in one place and the list stays declarative.
 */
export function AppDrawerContent(props: DrawerContentComponentProps) {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleSignOut = () => {
    logout();
    router.replace('/auth/login');
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.logo}>
          <AppText variant="base">{APP_LOGO}</AppText>
        </View>
        <View style={styles.brandContainer}>
          <AppText variant="sm" weight="semibold" numberOfLines={1} style={styles.brand}>
            {APP_NAME}
          </AppText>
          <AppText variant="xs" tone="muted" numberOfLines={1}>
            {user?.role === 'admin' ? 'Admin Portal' : 'Client Portal'}
          </AppText>
        </View>
      </View>

      <View style={styles.list}>
        <DrawerItemList {...props} />
      </View>

      <View style={styles.footer}>
        {user ? (
          <>
            <View style={styles.userChip}>
              <View style={styles.avatar}>
                <AppText variant="xs" weight="semibold" tone="primary">
                  {initials(user.name)}
                </AppText>
              </View>
              <View style={styles.userText}>
                <AppText variant="sm" weight="semibold" numberOfLines={1}>
                  {user.name}
                </AppText>
                <AppText variant="xs" tone="muted" numberOfLines={1}>
                  {user.role === 'admin' ? 'Administrator' : user.email}
                </AppText>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={handleSignOut}
              style={({ pressed }) => [styles.action, pressed ? styles.pressed : null]}>
              <LogOut size={18} color={colors.mutedForeground} strokeWidth={2} />
              <AppText variant="sm" weight="medium" tone="muted">
                Log out
              </AppText>
            </Pressable>
          </>
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.navigate('/auth/login' as never)}
            style={({ pressed }) => [styles.action, pressed ? styles.pressed : null]}>
            <LogIn size={18} color={colors.mutedForeground} strokeWidth={2} />
            <AppText variant="sm" weight="medium" tone="muted">
              Sign in
            </AppText>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 64,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logo: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  brandContainer: { flex: 1, gap: 1 },
  brand: { fontFamily: fontFamily.semibold },
  list: { flex: 1, paddingTop: 8 },
  footer: {
    gap: 4,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  userChip: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 6 },
  avatar: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: '#fdf1d7',
  },
  userText: { flex: 1, gap: 1 },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: radius.md,
  },
  pressed: { opacity: 0.6 },
});
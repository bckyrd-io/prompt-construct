// Imported from the per-weight subpaths rather than the package root: the root
// barrel pulls in all 18 Work Sans variants (~3MB) when only 6 are used.
import { useFonts } from 'expo-font';
import { WorkSans_300Light } from '@expo-google-fonts/work-sans/300Light';
import { WorkSans_400Regular } from '@expo-google-fonts/work-sans/400Regular';
import { WorkSans_500Medium } from '@expo-google-fonts/work-sans/500Medium';
import { WorkSans_600SemiBold } from '@expo-google-fonts/work-sans/600SemiBold';
import { WorkSans_700Bold } from '@expo-google-fonts/work-sans/700Bold';
import { WorkSans_800ExtraBold } from '@expo-google-fonts/work-sans/800ExtraBold';
import { DefaultTheme, ThemeProvider } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  BarChart3,
  Building2,
  CreditCard,
  FileText,
  LayoutDashboard,
  Package,
  Sparkles,
  Store,
  Users,
} from 'lucide-react-native';

import { AppDrawerContent } from '@/components/drawer-content';
import { ToastHost } from '@/components/ui/toast';
import { colors, fontFamily } from '@/constants/theme';
import { DESKTOP_BREAKPOINT } from '@/lib/config';
import { useAuthStore } from '@/store/auth';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Already hidden, or unsupported on web. Safe to ignore.
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    WorkSans_300Light,
    WorkSans_400Regular,
    WorkSans_500Medium,
    WorkSans_600SemiBold,
    WorkSans_700Bold,
    WorkSans_800ExtraBold,
  });

  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAdmin = user?.role === 'admin';
  const { width } = useWindowDimensions();
  const isWide = width >= DESKTOP_BREAKPOINT;

  // The sidebar only exists for signed-in users, mirroring the web app where
  // `AppSidebar` wraps every portal page but the public marketing page and the
  // auth pages have no sidebar at all. Signed out, every drawer item is hidden
  // and the swipe gesture is disabled, so the drawer cannot be pulled open.
  const showDrawer = isAuthenticated;

  // Hold the splash until fonts *and* the persisted session are ready, so a
  // signed-in user never sees the login screen flash past.
  useEffect(() => {
    if (fontsLoaded && hasHydrated) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, hasHydrated]);

  if (!fontsLoaded || !hasHydrated) return null;

  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.foreground,
      border: colors.border,
      notification: colors.primary,
    },
    // `as const` keeps the fontWeight literals assignable to the Theme type.
    fonts: {
      regular: { fontFamily: fontFamily.regular, fontWeight: '400' },
      medium: { fontFamily: fontFamily.medium, fontWeight: '500' },
      bold: { fontFamily: fontFamily.bold, fontWeight: '700' },
      heavy: { fontFamily: fontFamily.extrabold, fontWeight: '800' },
    },
  } as const;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={theme}>
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <StatusBar style="dark" />
          <Drawer
            drawerContent={(props) => <AppDrawerContent {...props} />}
            // Above `md` the web app keeps the sidebar pinned open; below it the
            // sidebar collapses to a swipe-in overlay. Mirror both states.
            //
            // `defaultStatus` is a navigator prop, but in this version of the
            // drawer `drawerType`/`swipeEnabled` are read from the focused
            // screen's options, so they have to go in `screenOptions`.
            defaultStatus={showDrawer && isWide ? 'open' : 'closed'}
            screenOptions={{
              drawerType: showDrawer && isWide ? 'permanent' : 'front',
              swipeEnabled: showDrawer && !isWide,
              headerShown: false,
              drawerActiveTintColor: colors.primary,
              drawerInactiveTintColor: colors.mutedForeground,
              drawerActiveBackgroundColor: '#fdf1d7',
              drawerInactiveBackgroundColor: colors.transparent,
              drawerLabelStyle: { fontFamily: fontFamily.medium, fontSize: 14 },
              drawerStyle: { backgroundColor: colors.background },
              overlayColor: colors.overlay,
            }}>
            {/* Client screens */}
            <Drawer.Screen
              name="index"
              options={{
                drawerLabel: 'Home',
                drawerIcon: ({ color, size }) => <Store color={color} size={size} />,
                drawerItemStyle: { display: showDrawer && !isAdmin ? 'flex' : 'none' },
              }}
            />
            <Drawer.Screen
              name="recommendations"
              options={{
                drawerLabel: 'Recommendations',
                drawerIcon: ({ color, size }) => <Sparkles color={color} size={size} />,
                drawerItemStyle: { display: showDrawer && !isAdmin ? 'flex' : 'none' },
              }}
            />
            <Drawer.Screen
              name="dashboard"
              options={{
                drawerLabel: 'Dashboard',
                drawerIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
                drawerItemStyle: { display: showDrawer && !isAdmin ? 'flex' : 'none' },
              }}
            />
            <Drawer.Screen
              name="payment"
              options={{
                drawerLabel: 'Payment',
                drawerIcon: ({ color, size }) => <CreditCard color={color} size={size} />,
                drawerItemStyle: { display: showDrawer && !isAdmin ? 'flex' : 'none' },
              }}
            />
            <Drawer.Screen
              name="apply"
              options={{
                drawerLabel: 'Applications',
                drawerIcon: ({ color, size }) => <FileText color={color} size={size} />,
                drawerItemStyle: { display: showDrawer && !isAdmin ? 'flex' : 'none' },
              }}
            />

            {/* Admin screens */}
            <Drawer.Screen
              name="admin/listings/index"
              options={{
                drawerLabel: 'Listings',
                drawerIcon: ({ color, size }) => <Package color={color} size={size} />,
                drawerItemStyle: { display: showDrawer && isAdmin ? 'flex' : 'none' },
              }}
            />
            <Drawer.Screen
              name="admin/listings/new"
              options={{
                drawerLabel: 'New Property',
                drawerIcon: ({ color, size }) => <Building2 color={color} size={size} />,
                drawerItemStyle: { display: showDrawer && isAdmin ? 'flex' : 'none' },
              }}
            />
            <Drawer.Screen
              name="admin/users"
              options={{
                drawerLabel: 'Leads & Users',
                drawerIcon: ({ color, size }) => <Users color={color} size={size} />,
                drawerItemStyle: { display: showDrawer && isAdmin ? 'flex' : 'none' },
              }}
            />
            <Drawer.Screen
              name="admin/reports"
              options={{
                drawerLabel: 'Analytics',
                drawerIcon: ({ color, size }) => <BarChart3 color={color} size={size} />,
                drawerItemStyle: { display: showDrawer && isAdmin ? 'flex' : 'none' },
              }}
            />
            <Drawer.Screen
              name="admin/listings/[id]/edit"
              options={{ drawerItemStyle: { display: 'none' } }}
            />

            {/* The web login/signup pages render full-screen with no sidebar, so
                they are routed to but never listed. */}
            <Drawer.Screen
              name="auth/login"
              options={{ drawerItemStyle: { display: 'none' } }}
            />
            <Drawer.Screen
              name="auth/signup"
              options={{ drawerItemStyle: { display: 'none' } }}
            />
          </Drawer>
          <ToastHost />
        </View>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
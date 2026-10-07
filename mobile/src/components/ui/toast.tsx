import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { create } from 'zustand';

import { colors, fontFamily, radius } from '@/constants/theme';

/**
 * Minimal toast, replacing `sonner`'s `<Toaster />` / `toast.*` and the raw
 * `alert()` calls scattered through the web app.
 *
 * Written in-house rather than pulled from a library: `react-native-toast-message`
 * v2.5 made `config` function-valued and dropped `Toast` children, so brand
 * styling means re-implementing its renderer anyway. ~90 lines beats that, and it
 * keeps the dependency list smaller.
 */
export type ToastTone = 'default' | 'success' | 'error';

interface ToastState {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastStore {
  toast: ToastState | null;
  show: (message: string, tone?: ToastTone) => void;
  hide: () => void;
}

let nextId = 1;

const useToastStore = create<ToastStore>((set) => ({
  toast: null,
  show: (message, tone = 'default') => set({ toast: { id: nextId++, message, tone } }),
  hide: () => set({ toast: null }),
}));

export const showToast = {
  success: (message: string) => useToastStore.getState().show(message, 'success'),
  error: (message: string) => useToastStore.getState().show(message, 'error'),
  info: (message: string) => useToastStore.getState().show(message, 'default'),
};

const VISIBILITY_MS = 3600;

const toneBackground: Record<ToastTone, string> = {
  default: colors.foreground,
  success: '#14532d',
  error: colors.destructive,
};

/**
 * Mount once, near the root. Absolutely positioned so it floats above whatever
 * screen is showing without needing a navigation-aware overlay.
 */
export function ToastHost() {
  const toast = useToastStore((state) => state.toast);
  const hide = useToastStore((state) => state.hide);
  // `useState` rather than `useRef`: the Animated.Value must be readable during
  // render, and the react-hooks compiler rules forbid that on a ref.
  const [progress] = useState(() => new Animated.Value(0));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const animateIn = () => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const animateOut = (after?: () => void) => {
    Animated.timing(progress, {
      toValue: 0,
      duration: 160,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      hide();
      after?.();
    });
  };

  useEffect(() => {
    if (!toast) return;
    animateIn();
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => animateOut(), VISIBILITY_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // Re-run per toast id so a second toast restarts the timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast?.id]);

  if (!toast) return null;

  return (
    <View pointerEvents="box-none" style={styles.host}>
      <Animated.View
        style={{
          opacity: progress,
          transform: [
            { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] }) },
          ],
        }}>
        <Pressable
          accessibilityRole="alert"
          onPress={() => animateOut()}
          style={[styles.toast, { backgroundColor: toneBackground[toast.tone] }]}>
          <Animated.Text style={styles.text}>{toast.message}</Animated.Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: 16,
    zIndex: 100,
    elevation: 100,
  },
  toast: {
    maxWidth: 420,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radius.lg,
  },
  text: {
    color: colors.background,
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
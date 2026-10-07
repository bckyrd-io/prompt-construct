import { useState } from 'react';
import { HardHat } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { InlineCheckbox } from '@/components/ui/checkbox-field';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { AppText } from '@/components/ui/text';
import { colors, radius } from '@/constants/theme';
import { DESKTOP_BREAKPOINT } from '@/lib/config';
import { useAuthStore } from '@/store/auth';

/**
 * Port of `app/auth/login/page.tsx`.
 *
 * The web page is a two-column split with a photo filling the right half, hidden
 * below `lg`. That split is kept for wide screens so the tablet/web layout matches,
 * and collapses to a single centred form on a phone — same as the web's `lg:block`.
 */
export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);

  const { width } = useWindowDimensions();
  const showArtwork = width >= DESKTOP_BREAKPOINT;

  const handleSubmit = async () => {
    clearError();
    const result = await login(email.trim(), password);
    if (!result.success || !result.redirectTo) return;

    // Preserve an in-flight AI search across the login detour. The web app kept
    // this in localStorage; a route param is the Expo Router equivalent.
    const q = typeof params.q === 'string' ? params.q : undefined;
    // `next` is only ever the recommendations route, so narrow it instead of
    // trusting an arbitrary string from the URL.
    const target =
      params.next === 'recommendations' ? '/recommendations' : result.redirectTo;

    if (q) {
      router.replace({ pathname: target, params: { q } });
    } else {
      router.replace(target);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.pane}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.logo}>
            <HardHat size={20} color={colors.onPrimaryDark} strokeWidth={2} />
          </View>

          <View style={styles.header}>
            <AppText variant="2xl">Welcome back</AppText>
            <AppText variant="sm" tone="muted">
              Sign in to your account
            </AppText>
          </View>

          {error ? (
            <View style={styles.error}>
              <AppText variant="sm" tone="destructive">
                {error}
              </AppText>
            </View>
          ) : null}

          <View style={styles.form}>
            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
              returnKeyType="next"
            />

            <TextField
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
              autoCapitalize="none"
              editable={!isLoading}
              returnKeyType="go"
              onSubmitEditing={handleSubmit}
            />

            <InlineCheckbox value={remember} onValueChange={setRemember} label="Remember me" />

            <Button
              size="xl"
              fullWidth
              loading={isLoading}
              disabled={!email.trim() || !password}
              onPress={handleSubmit}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </View>

          <View style={styles.footer}>
            <AppText variant="sm" tone="muted">
              Don&apos;t have an account?{' '}
              <AppText
                variant="sm"
                tone="primary"
                weight="semibold"
                onPress={() => router.replace('/auth/signup')}>
                Sign up
              </AppText>
            </AppText>
          </View>
        </ScrollView>
      </View>

      {showArtwork ? (
        <View style={styles.artwork}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200',
            }}
            style={styles.artworkImage}
            contentFit="cover"
            accessibilityLabel="Authentication background"
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row', backgroundColor: colors.background },
  pane: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 20, maxWidth: 480, width: '100%', alignSelf: 'center' },
  logo: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  header: { gap: 4 },
  error: {
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.destructiveBorder,
    backgroundColor: colors.destructiveBg,
  },
  form: { gap: 16 },
  footer: { alignItems: 'center', paddingTop: 8 },
  artwork: { flex: 1, backgroundColor: colors.muted },
  artworkImage: { flex: 1 },
});
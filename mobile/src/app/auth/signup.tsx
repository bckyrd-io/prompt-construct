import { useState } from 'react';
import { HardHat } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { AppText } from '@/components/ui/text';
import { colors, radius } from '@/constants/theme';
import { DESKTOP_BREAKPOINT } from '@/lib/config';
import { useAuthStore } from '@/store/auth';
import type { UserRole } from '@/types/api';

/**
 * Port of `app/auth/signup/page.tsx`.
 *
 * The web page keeps a `role` state that is never rendered — the field defaults to
 * `"client"` and every visitor signs up as a client, so the role switcher is not
 * reproduced here.
 */
export default function SignupScreen() {
  const router = useRouter();
  const { signup, isLoading, error, clearError } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const { width } = useWindowDimensions();
  const showArtwork = width >= DESKTOP_BREAKPOINT;

  const handleSubmit = async () => {
    clearError();
    setLocalError(null);

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    const result = await signup(name.trim(), email.trim(), password, 'client' as UserRole);
    if (result.success) router.replace(result.redirectTo ?? '/recommendations');
  };

  const displayError = localError ?? error;

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
            <AppText variant="2xl">Create your account</AppText>
            <AppText variant="sm" tone="muted">
              Start matching properties with AI
            </AppText>
          </View>

          {displayError ? (
            <View style={styles.error}>
              <AppText variant="sm" tone="destructive">
                {displayError}
              </AppText>
            </View>
          ) : null}

          <View style={styles.form}>
            <TextField
              label="Full Name"
              value={name}
              onChangeText={setName}
              placeholder="John Doe"
              autoCapitalize="words"
              editable={!isLoading}
              returnKeyType="next"
            />

            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="john@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
              returnKeyType="next"
            />

            <TextField
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Create a password"
              secureTextEntry
              autoCapitalize="none"
              editable={!isLoading}
              returnKeyType="next"
            />

            <TextField
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your password"
              secureTextEntry
              autoCapitalize="none"
              editable={!isLoading}
              returnKeyType="go"
              onSubmitEditing={handleSubmit}
            />

            <Button
              size="xl"
              fullWidth
              loading={isLoading}
              disabled={!name.trim() || !email.trim() || !password || !confirmPassword}
              onPress={handleSubmit}>
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </View>

          <View style={styles.footer}>
            <AppText variant="sm" tone="muted">
              Already have an account?{' '}
              <AppText
                variant="sm"
                tone="primary"
                weight="semibold"
                onPress={() => router.replace('/auth/login')}>
                Sign in
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
import { useCallback, useState } from 'react';
import { Lock, ShieldCheck, XCircle } from 'lucide-react-native';
import * as Linking from 'expo-linking';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScreenHeader } from '@/components/ui/screen-header';
import { TextField } from '@/components/ui/text-field';
import { AppText } from '@/components/ui/text';
import { showToast } from '@/components/ui/toast';
import { colors, radius } from '@/constants/theme';
import * as api from '@/lib/api';
import { formatMK } from '@/lib/format';
import { API_BASE_URL } from '@/lib/config';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { useAuthStore } from '@/store/auth';
import type { Property } from '@/types/api';

/**
 * Port of `app/payment/page.tsx`.
 *
 * The web page sends the browser to `checkout_url` with `window.location.href`.
 * On device that becomes an in-app browser tab, and `return_url` points at a deep
 * link so the OS hands the user back to the app.
 *
 * `callback_url` still points at the API: Paychangu calls it server-side and it is
 * what actually marks the milestone paid and recalculates progress. The deep link
 * is only the user-facing bounce-back, so on resume the screen refetches and shows
 * whatever the callback already committed.
 */
export default function PaymentScreen() {
  const router = useRouter();
  // Typed loosely on purpose: `useLocalSearchParams<T>()`'s generic resolves
  // ambiguously across expo-router's overloads, so params are narrowed below.
const params = useLocalSearchParams();
  const ready = useAuthGuard();
  const user = useAuthStore((state) => state.user);

  const asString = (value: unknown) => (typeof value === 'string' ? value : null);

  const milestoneId = asString(params.milestoneId);
  const propertyId = asString(params.propertyId);
  const milestoneName = asString(params.name) ?? '';

  const [amount, setAmount] = useState(asString(params.amount) ?? '');
  const [property, setProperty] = useState<Property | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(
    asString(params.error) || asString(params.status)
      ? 'Payment was cancelled or failed. Please try again.'
      : '',
  );

  const isCompletePay = milestoneId === '-1';

  const balance = summarise(property);

  const load = useCallback(async () => {
    if (!propertyId) return;
    try {
      const { property: detail } = await api.getProperty(propertyId);
      setProperty(detail);
    } catch {
      // Balance panel is supplementary; a failure here must not block payment.
    }
  }, [propertyId]);

  useFocusEffect(
    useCallback(() => {
      if (!ready) return;
      void load();
    }, [ready, load]),
  );

  // `useCallback` marks this as an event handler, not render-phase work — the
  // react-hooks purity rule rejects Date.now()/Math.random() during render.
  const handlePayment = useCallback(async () => {
    setIsProcessing(true);
    setError('');

    try {
      // A final payment must clear the whole remaining balance.
      if (isCompletePay) {
        const requested = Number(amount || '0');
        if (requested !== balance.remaining) {
          throw new Error(
            `Complete Payment requires paying the full remaining balance of ${formatMK(balance.remaining)}`,
          );
        }
      }

      const txRef = `TX-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      const [firstName, ...rest] = (user?.name ?? 'Client').split(' ');
      const lastName = rest.join(' ') || 'User';

      const { checkout_url } = await api.initializePayment({
        amount: Number(amount),
        currency: 'MWK',
        tx_ref: txRef,
        callback_url: `${API_BASE_URL}/api/payment/callback`,
        // Deep link so the OS returns the user to this app after checkout.
        return_url: Linking.createURL('/payment'),
        customer: {
          email: user?.email ?? 'client@example.com',
          first_name: firstName || 'Client',
          last_name: lastName,
        },
        customization: {
          title: isCompletePay ? 'Complete Payment' : milestoneName || 'Construction Payment',
          description: isCompletePay
            ? 'Final payment to complete property acquisition'
            : `Payment for: ${milestoneName || 'Construction Project'}`,
        },
        meta: {
          milestoneId: milestoneId ?? '',
          milestoneName,
          propertyId: propertyId ?? '',
          amount: amount || '0',
        },
      });

      if (!checkout_url) throw new Error('No checkout URL received');

      // `expo-web-browser` has no web implementation, so open a real tab there.
      // On device the in-app browser keeps the user inside the app and lets the
      // return_url deep link hand them back.
      if (Platform.OS === 'web') {
        window.open(checkout_url, '_blank', 'noopener,noreferrer');
      } else {
        await WebBrowser.openBrowserAsync(checkout_url);
      }
      // The callback updates the milestone server-side; refresh on return.
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment initialization failed';
      setError(message);
      showToast.error(message);
    } finally {
      setIsProcessing(false);
    }
  }, [amount, balance.remaining, isCompletePay, milestoneId, milestoneName, propertyId, user, load]);

  if (!ready) {
    return (
      <View style={styles.root}>
        <ScreenHeader title="Make Payment" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScreenHeader title="Make Payment" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <AppText variant="xs" weight="semibold" tone="muted" uppercase>
            Account Summary
          </AppText>
          <View style={styles.rows}>
            <Row label="Total Property Cost" value={formatMK(property?.price ?? balance.total)} />
            <Row label="Amount Paid" value={formatMK(balance.paid)} tone="success" />
            <View style={styles.hr} />
            <Row
              label="Remaining Balance"
              value={formatMK(balance.remaining)}
              weight="bold"
              tone="gold"
            />
            <Progress value={balance.percent} height={8} tone={colors.gold} />
            <AppText variant="xs" tone="muted" style={styles.center}>
              {balance.percent.toFixed(0)}% Paid
            </AppText>
          </View>
        </Card>

        <Card style={styles.card}>
          <AppText variant="lg" weight="semibold">
            Make Payment
          </AppText>

          {error ? (
            <View style={styles.errorBanner}>
              <XCircle size={18} color={colors.destructive} strokeWidth={2} />
              <AppText variant="sm" tone="destructive" style={styles.flex}>
                {error}
              </AppText>
            </View>
          ) : null}

          {milestoneName ? (
            <View
              style={[
                styles.milestoneBanner,
                isCompletePay ? styles.milestoneFinal : styles.milestoneNormal,
              ]}>
              <AppText variant="xs" weight="bold" tone="muted" uppercase>
                {isCompletePay ? 'Final Payment' : 'Payment For'}
              </AppText>
              <AppText variant="xl" weight="bold">
                {milestoneName}
              </AppText>
              {isCompletePay ? (
                <AppText variant="xs" tone="success">
                  All milestones completed - property ready for final acquisition
                </AppText>
              ) : null}
            </View>
          ) : null}

          <TextField
            label={
              isCompletePay ? 'Final Payment Amount (Fixed)' : 'Payment Amount (MK)'
            }
            value={amount}
            onChangeText={setAmount}
            keyboardType="number-pad"
            editable={!isCompletePay}
            helperText={
              isCompletePay
                ? 'This is the final payment to complete your property acquisition. The amount is fixed.'
                : 'You can edit the amount above if needed'
            }
          />

          {isCompletePay ? (
            <View style={styles.locked}>
              <Lock size={14} color={colors.mutedForeground} strokeWidth={2} />
              <AppText variant="xs" tone="muted">
                Amount locked to your remaining balance
              </AppText>
            </View>
          ) : null}

          <Button
            size="xl"
            fullWidth
            loading={isProcessing}
            disabled={!amount}
            variant={isCompletePay ? 'default' : 'inverse'}
            onPress={handlePayment}
            icon={
              isCompletePay ? undefined : (
                <ShieldCheck size={20} color={colors.gold} strokeWidth={2} />
              )
            }>
            {isProcessing
              ? 'Processing...'
              : isCompletePay
                ? 'Complete Acquisition'
                : `Pay ${formatMK(Number(amount || '0'))}`}
          </Button>

          <View style={styles.secure}>
            <ShieldCheck size={14} color={colors.mutedForeground} strokeWidth={2} />
            <AppText variant="xs" tone="muted" style={styles.center}>
              Secured by Paychangu - 256-bit SSL encryption
            </AppText>
          </View>
        </Card>

        <Button variant="ghost" onPress={() => router.replace('/dashboard')}>
          Back to Dashboard
        </Button>
      </ScrollView>
    </View>
  );
}

function summarise(property: Property | null) {
  const total = property?.price ?? 0;
  const paid =
    property?.milestones
      .filter((m) => m.payment_status === 'paid' || m.completed)
      .reduce((sum, m) => sum + (m.amount ?? 0), 0) ?? 0;
  const remaining = total - paid;
  const percent = total > 0 ? (paid / total) * 100 : 0;
  return { total, paid, remaining, percent };
}

function Row({
  label,
  value,
  tone,
  weight = 'semibold',
}: {
  label: string;
  value: string;
  tone?: 'success' | 'gold';
  weight?: 'semibold' | 'bold';
}) {
  const color =
    tone === 'success' ? colors.success : tone === 'gold' ? colors.gold : colors.foreground;

  return (
    <View style={styles.row}>
      <AppText variant="sm" tone="muted">
        {label}
      </AppText>
      <AppText variant="sm" weight={weight} style={{ color }}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 16, paddingBottom: 40, gap: 16 },
  center: { textAlign: 'center' },
  flex: { flex: 1 },

  card: { gap: 16 },
  rows: { gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  hr: { height: 1, backgroundColor: colors.border },

  errorBanner: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.destructiveBorder,
    backgroundColor: colors.destructiveBg,
  },

  milestoneBanner: { gap: 4, padding: 12, borderRadius: radius.lg, borderWidth: 1 },
  milestoneNormal: { backgroundColor: '#fffaf0', borderColor: '#ffc300' },
  milestoneFinal: { backgroundColor: colors.successBg, borderColor: colors.successBorder },

  locked: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  secure: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
});
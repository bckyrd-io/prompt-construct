import { useCallback, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  CreditCard,
  Hourglass,
} from 'lucide-react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AiActiveBadge } from '@/components/property-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Progress } from '@/components/ui/progress';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Loading } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { showToast } from '@/components/ui/toast';
import { colors, radius } from '@/constants/theme';
import * as api from '@/lib/api';
import { formatMK, statusLabel } from '@/lib/format';
import { PROPERTY_IMAGE_FALLBACK, resolveMediaUrl } from '@/lib/media';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { useAuthStore } from '@/store/auth';
import type { Milestone, Property } from '@/types/api';

/** Sentinel id for the synthetic "Complete Payment" stage, mirroring the web app. */
const FINAL_PAYMENT_ID = -1;

type TimelineMilestone = Milestone & { isFinalPayment?: boolean };

/**
 * Port of `app/dashboard/page.tsx`.
 *
 * Keeps the balance maths and the synthetic final-payment stage: once every real
 * milestone is settled but a balance remains, a "Complete Payment" row is appended
 * so the client can clear the rest and flip the property to `acquired`.
 */
export default function DashboardScreen() {
  const router = useRouter();
  const ready = useAuthGuard();
  const user = useAuthStore((state) => state.user);

  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!ready || !user) return;
    try {
      const { applications } = await api.getApplications(user.id);
      const latest = applications[0];
      if (!latest) {
        setProperty(null);
        return;
      }
      const { property: detail } = await api.getProperty(latest.property_id);
      setProperty(detail);
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : 'Failed to load your project');
    } finally {
      setIsLoading(false);
    }
  }, [ready, user]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const totalCost = property?.price ?? 0;
  const paidAmount =
    property?.milestones
      .filter((m) => m.payment_status === 'paid' || m.completed)
      .reduce((sum, m) => sum + (m.amount ?? 0), 0) ?? 0;
  const remainingBalance = totalCost - paidAmount;

  const timeline = buildTimeline(property, remainingBalance);

  // Only the first unsettled stage is payable, so payments stay sequential.
  const nextPayable = timeline.find((m) => m.payment_status !== 'paid' && !m.completed);

  // Object form so Expo Router encodes the params itself. Hand-building the
  // query string would risk double-encoding the milestone name.
  const handlePayNow = (milestone: TimelineMilestone) => {
    router.push({
      pathname: '/payment',
      params: {
        milestoneId: String(milestone.id),
        amount: String(milestone.amount),
        name: milestone.name,
        propertyId: property?.id != null ? String(property.id) : '',
      },
    });
  };

  if (isLoading || !ready) {
    return (
      <View style={styles.root}>
        <ScreenHeader title="Dashboard Overview" />
        <Loading label="Loading your project..." />
      </View>
    );
  }

  const paidPercent = totalCost > 0 ? (paidAmount / totalCost) * 100 : 0;

  return (
    <View style={styles.root}>
      <ScreenHeader title="Dashboard Overview" right={<AiActiveBadge />} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {property ? (
          <>
            <Card style={styles.hero}>
              <View style={styles.heroMedia}>
                <Image
                  source={{
                    uri:
                      resolveMediaUrl(property.image_url) ?? PROPERTY_IMAGE_FALLBACK,
                  }}
                  style={styles.heroImage}
                  contentFit="cover"
                  transition={200}
                />
                <LinearGradient
                  colors={['transparent', colors.imageScrim]}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={styles.heroScrim}
                />
                <View style={styles.heroOverlay}>
                  <Badge tone="neutral" style={styles.heroBadge}>
                    <AppText variant="xs" weight="semibold" tone="inverse" uppercase>
                      {statusLabel(property.status)}
                    </AppText>
                  </Badge>
                  <AppText variant="3xl" tone="inverse" numberOfLines={2}>
                    {property.name}
                  </AppText>
                </View>
              </View>

              <View style={styles.heroBody}>
                <View style={styles.heroMeta}>
                  <AppText variant="sm" weight="medium">
                    {property.type} • {property.location}
                  </AppText>
                  <AppText variant="xs" tone="muted">
                    REF: RC-{property.id}
                  </AppText>
                </View>

                <View style={styles.heroProgress}>
                  <View style={styles.progressLabels}>
                    <AppText variant="xs" weight="semibold" tone="muted" uppercase>
                      Overall Progress
                    </AppText>
                    <AppText variant="xs" weight="semibold">
                      {property.progress}%
                    </AppText>
                  </View>
                  <Progress value={property.progress} height={10} />
                  <View style={styles.onTrack}>
                    <CheckCircle2 size={14} color={colors.success} strokeWidth={2} />
                    <AppText variant="xs" weight="semibold" tone="success">
                      On Track
                    </AppText>
                  </View>
                </View>
              </View>
            </Card>

            <Card style={styles.summary}>
              <View style={styles.summaryHeader}>
                <View style={styles.summaryIcon}>
                  <CreditCard size={14} color={colors.primary} strokeWidth={2} />
                </View>
                <AppText variant="sm" weight="semibold">
                  Payment Summary
                </AppText>
              </View>

              <View style={styles.summaryRows}>
                <Row label="Total Property Cost" value={formatMK(totalCost)} />
                <Row label="Amount Paid" value={formatMK(paidAmount)} tone="success" />
                <View style={styles.hr} />
                <Row label="Remaining Balance" value={formatMK(remainingBalance)} weight="bold" />
                <Progress value={paidPercent} height={8} tone={colors.gold} />
                <AppText variant="xs" tone="muted" style={styles.center}>
                  {paidPercent.toFixed(0)}% Paid
                </AppText>
              </View>
            </Card>

            <View style={styles.timeline}>
              <View style={styles.timelineHeader}>
                <AppText variant="lg" weight="semibold">
                  Timeline
                </AppText>
              </View>

              {timeline.map((milestone) => (
                <Card
                  key={milestone.id}
                  style={[
                    styles.milestoneCard,
                    milestone.isFinalPayment ? styles.milestoneFinal : null,
                    milestone.current && !milestone.isFinalPayment
                      ? styles.milestoneCurrent
                      : null,
                  ]}>
                  <View
                    style={[
                      styles.milestoneStripe,
                      milestone.completed
                        ? styles.stripeDone
                        : milestone.current
                          ? styles.stripeCurrent
                          : styles.stripeIdle,
                      milestone.isFinalPayment ? styles.stripeDone : null,
                    ]}
                  />
                  <View style={styles.milestoneBody}>
                    <View style={styles.milestoneTop}>
                      <View style={styles.milestoneTitleRow}>
                        {milestone.completed ? (
                          <CheckCircle2 size={20} color={colors.success} strokeWidth={2} />
                        ) : milestone.current ? (
                          <View style={styles.spinner} />
                        ) : (
                          <Hourglass size={20} color={colors.mutedForeground} strokeWidth={2} />
                        )}
                        <AppText variant="sm" weight="semibold" style={styles.milestoneName}>
                          {milestone.name}
                        </AppText>
                        {milestone.current ? (
                          <Badge tone={milestone.isFinalPayment ? 'green' : 'gold'}>
                            {milestone.isFinalPayment ? 'Final Payment' : 'Active Stage'}
                          </Badge>
                        ) : null}
                      </View>

                      <View style={styles.milestoneState}>
                        <Clock size={12} color={colors.mutedForeground} strokeWidth={2} />
                        <AppText variant="xs" tone="muted">
                          {milestone.completed
                            ? 'Completed'
                            : milestone.current
                              ? 'In Progress'
                              : 'Pending'}
                        </AppText>
                      </View>
                    </View>

                    <View style={styles.milestoneFooter}>
                      <Badge
                        tone={
                          milestone.payment_status === 'paid'
                            ? 'green'
                            : milestone.payment_status === 'due'
                              ? 'red'
                              : 'neutral'
                        }>
                        {paymentLabel(milestone)}
                      </Badge>
                      {nextPayable?.id === milestone.id ? (
                        <Button
                          size="sm"
                          onPress={() => handlePayNow(milestone)}
                          icon={<CreditCard size={14} color={colors.primaryForeground} strokeWidth={2} />}>
                          Pay Now
                        </Button>
                      ) : null}
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          </>
        ) : (
          <EmptyState
            title="No active project"
            description="Apply for a property to start tracking your build here."
            action={
              <Button onPress={() => router.push('/recommendations')}>
                Browse properties
              </Button>
            }
          />
        )}
      </ScrollView>
    </View>
  );
}

/**
 * Real milestones, plus the synthetic final-payment stage when everything is
 * settled but a balance remains.
 */
function buildTimeline(
  property: Property | null,
  remainingBalance: number,
): TimelineMilestone[] {
  if (!property) return [];
  const milestones: TimelineMilestone[] = property.milestones.map((m) => ({ ...m }));

  const allSettled = milestones.every((m) => m.payment_status === 'paid' || m.completed);
  if (allSettled && remainingBalance > 0) {
    milestones.push({
      id: FINAL_PAYMENT_ID,
      name: 'Complete Payment',
      completed: false,
      current: true,
      payment_status: 'due',
      amount: remainingBalance,
      photos: [],
      isFinalPayment: true,
    });
  }

  return milestones;
}

function paymentLabel(milestone: TimelineMilestone): string {
  const amount = formatMK(milestone.amount);
  if (milestone.payment_status === 'paid') return `${amount} - Paid`;
  if (milestone.payment_status === 'due') return `${amount} - Due`;
  return `${amount} - Pending`;
}

function Row({
  label,
  value,
  tone,
  weight = 'semibold',
}: {
  label: string;
  value: string;
  tone?: 'success';
  weight?: 'semibold' | 'bold';
}) {
  return (
    <View style={styles.summaryRow}>
      <AppText variant="sm" tone="muted">
        {label}
      </AppText>
      <AppText
        variant="sm"
        weight={weight}
        tone={tone === 'success' ? 'success' : 'default'}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 16, paddingBottom: 40, gap: 16 },
  center: { textAlign: 'center' },

  hero: {},
  heroMedia: { height: 180, backgroundColor: colors.muted },
  heroImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  heroScrim: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, paddingTop: 56 },
  heroOverlay: { gap: 8 },
  heroBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', borderColor: 'transparent' },
  heroBody: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, padding: 16 },
  heroMeta: { flex: 1, gap: 4, minWidth: 140 },
  heroProgress: { flex: 1, gap: 8, minWidth: 160 },
  progressLabels: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  onTrack: { flexDirection: 'row', alignItems: 'center', gap: 6 },

  summary: { gap: 12, backgroundColor: '#fafafa' },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  summaryIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: '#fdf1d7',
  },
  summaryRows: { gap: 10 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  hr: { height: 1, backgroundColor: colors.border },

  timeline: { gap: 12 },
  timelineHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  milestoneCard: { flexDirection: 'row' },
  milestoneCurrent: { borderColor: colors.primary },
  milestoneFinal: { borderColor: colors.success, backgroundColor: '#f0fdf4' },
  milestoneStripe: { width: 6 },
  stripeDone: { backgroundColor: colors.success },
  stripeCurrent: { backgroundColor: colors.primary },
  stripeIdle: { backgroundColor: colors.muted },
  milestoneBody: { flex: 1, gap: 12, padding: 16 },
  milestoneTop: { gap: 6 },
  milestoneTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  milestoneName: { flexShrink: 1 },
  milestoneState: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  milestoneFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' },

  spinner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    borderTopColor: colors.transparent,
  },
});
import { useEffect, useState, type ReactNode } from 'react';
import { ArrowRight, Banknote, Check, CheckCircle, Home, Info, User } from 'lucide-react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckboxField } from '@/components/ui/checkbox-field';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Loading } from '@/components/ui/screen';
import { SelectField } from '@/components/ui/select-field';
import { TextField } from '@/components/ui/text-field';
import { AppText } from '@/components/ui/text';
import { showToast } from '@/components/ui/toast';
import { colors, radius } from '@/constants/theme';
import * as api from '@/lib/api';
import { formatDate, formatDecimal, formatMK, toNumber } from '@/lib/format';
import { PROPERTY_IMAGE_FALLBACK, resolveMediaUrl } from '@/lib/media';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { useAuthStore } from '@/store/auth';
import type { Property } from '@/types/api';

/**
 * Port of `app/apply/page.tsx`.
 *
 * The web page wraps its content in `<Suspense>` only because `useSearchParams`
 * forces a client boundary; `useLocalSearchParams` needs no equivalent, so the
 * spinner here is only for the property fetch.
 */
const EMPLOYMENT_OPTIONS = [
  { label: 'Full-time Employed', value: 'employed' },
  { label: 'Self-employed', value: 'self-employed' },
  { label: 'Business Owner', value: 'business' },
  { label: 'Retired', value: 'retired' },
] as const;

const STEPS = [
  { id: 1, name: 'Personal Details', icon: User },
  { id: 2, name: 'Financial', icon: Banknote },
  { id: 3, name: 'Review', icon: CheckCircle },
] as const;

export default function ApplyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const ready = useAuthGuard();
  const user = useAuthStore((state) => state.user);

  const propertyId =
    typeof params.property === 'string' ? params.property : '1';

  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [accepted, setAccepted] = useState(false);

  const [formData, setFormData] = useState({
    employment: '' as '' | (typeof EMPLOYMENT_OPTIONS)[number]['value'],
    income: '',
    downPayment: '',
  });

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;

    (async () => {
      try {
        const { property: detail } = await api.getProperty(propertyId);
        if (!cancelled) setProperty(detail);
      } catch (err) {
        showToast.error(err instanceof Error ? err.message : 'Failed to load property');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [propertyId, ready]);

  const income = toNumber(formData.income);
  const downPayment = toNumber(formData.downPayment);
  const price = property?.price ?? 0;

  /** Same thresholds as the web app: income >= 1/3 price, deposit >= 20%. */
  const canAfford = income >= price / 3 && downPayment >= price * 0.2;

  const financialComplete = Boolean(
    formData.employment && formData.income && formData.downPayment,
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { applicationId } = await api.createApplication({
        property_id: Number(propertyId),
        employment: formData.employment,
        income,
        down_payment: downPayment,
        email: user?.email ?? '',
      });
      showToast.success(`Application submitted! Reference: APP-${applicationId}`);
      router.replace('/dashboard');
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !ready) {
    return (
      <View style={styles.root}>
        <ScreenHeader title="Property Application" />
        <Loading label="Loading application..." />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScreenHeader title="Property Application" subtitle="Recommendations / Apply" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <StepIndicator current={currentStep} onChange={setCurrentStep} />

        <Card style={styles.card}>
          {currentStep === 1 ? (
            <View style={styles.stack}>
              <PropertySummary property={property} />
              <Card style={styles.nested}>
                <SectionTitle icon={<User size={18} color={colors.primary} strokeWidth={2} />}>
                  Account Information
                </SectionTitle>
                <InfoGrid
                  rows={[
                    { label: 'Full Name', value: user?.name ?? 'Not provided' },
                    { label: 'Email Address', value: user?.email ?? 'Not provided' },
                    { label: 'Role', value: user?.role ?? 'Not provided' },
                    { label: 'Account Status', value: user?.status ?? 'Not provided' },
                    {
                      label: 'Account Created',
                      value: user?.created_at ? formatDate(user.created_at) : 'Not provided',
                    },
                  ]}
                />
              </Card>
            </View>
          ) : null}

          {currentStep === 2 ? (
            <View style={styles.stack}>
              <PropertySummary property={property} />

              <SelectField
                label="Employment Status"
                value={formData.employment}
                options={EMPLOYMENT_OPTIONS}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, employment: value }))}
                placeholder="Select your employment status"
              />

              <View style={styles.row}>
                <View style={styles.half}>
                  <TextField
                    label="Annual Income (MK)"
                    value={formData.income}
                    onChangeText={(text) => setFormData((prev) => ({ ...prev, income: text }))}
                    placeholder="e.g., 1500000"
                    keyboardType="number-pad"
                  />
                </View>
                <View style={styles.half}>
                  <TextField
                    label="Down Payment (MK)"
                    value={formData.downPayment}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, downPayment: text }))
                    }
                    placeholder="e.g., 300000"
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              {formData.income && formData.downPayment ? (
                <View
                  style={[
                    styles.qualification,
                    canAfford ? styles.qualified : styles.unqualified,
                  ]}>
                  {canAfford ? (
                    <CheckCircle size={18} color={colors.success} strokeWidth={2} />
                  ) : (
                    <Info size={18} color={colors.warning} strokeWidth={2} />
                  )}
                  <View style={styles.qualificationText}>
                    <AppText
                      variant="sm"
                      weight="bold"
                      tone={canAfford ? 'success' : 'warning'}>
                      {canAfford ? 'You Qualify!' : 'May Not Qualify'}
                    </AppText>
                    <AppText variant="sm" tone="muted">
                      {canAfford
                        ? 'Based on your income and down payment, you appear qualified for this property.'
                        : 'You may need higher income or down payment. Recommended: Income 3x property price, down payment 20%.'}
                    </AppText>
                  </View>
                </View>
              ) : null}
            </View>
          ) : null}

          {currentStep === 3 ? (
            <View style={styles.stack}>
              <Card style={styles.nested}>
                <SectionTitle icon={<Home size={18} color={colors.primary} strokeWidth={2} />}>
                  Property
                </SectionTitle>
                <PropertyFacts property={property} />
              </Card>

              <Card style={styles.nested}>
                <SectionTitle icon={<User size={18} color={colors.primary} strokeWidth={2} />}>
                  Applicant
                </SectionTitle>
                <AppText variant="sm" weight="bold">
                  {user?.name ?? 'Not provided'}
                </AppText>
                <AppText variant="sm" tone="muted">
                  {user?.email ?? 'Not provided'}
                </AppText>
                <AppText variant="sm" tone="muted">
                  Role: {user?.role ?? 'Not provided'}
                </AppText>
              </Card>

              <Card style={styles.nested}>
                <SectionTitle icon={<Banknote size={18} color={colors.primary} strokeWidth={2} />}>
                  Financial
                </SectionTitle>
                <AppText variant="sm" tone="muted">
                  Employment:{' '}
                  <AppText variant="sm" weight="bold">
                    {formData.employment || 'Not provided'}
                  </AppText>
                </AppText>
                <AppText variant="sm" tone="muted">
                  Annual Income:{' '}
                  <AppText variant="sm" weight="bold">
                    {formatMK(income)}
                  </AppText>
                </AppText>
                <AppText variant="sm" tone="muted">
                  Down Payment:{' '}
                  <AppText variant="sm" weight="bold">
                    {formatMK(downPayment)}
                  </AppText>
                </AppText>
              </Card>

              <View style={styles.terms}>
                <CheckboxField value={accepted} onValueChange={setAccepted}>
                  I confirm that all information provided is accurate and complete. I
                  authorize PromptConstruct to verify my information.
                </CheckboxField>
              </View>

              <Button
                size="xl"
                fullWidth
                loading={isSubmitting}
                disabled={!financialComplete || !accepted}
                onPress={handleSubmit}
                icon={<Check size={18} color={colors.primaryForeground} strokeWidth={2} />}>
                Submit Application
              </Button>
            </View>
          ) : null}
        </Card>

        {currentStep < 3 ? (
          <View style={styles.nav}>
            <Button
              variant="outline"
              size="lg"
              disabled={currentStep === 1}
              onPress={() => setCurrentStep((step) => step - 1)}>
              Back
            </Button>
            <Button
              size="lg"
              disabled={currentStep === 2 && !financialComplete}
              onPress={() => setCurrentStep((step) => step + 1)}
              iconRight={<ArrowRight size={16} color={colors.primaryForeground} strokeWidth={2} />}>
              Continue
            </Button>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function StepIndicator({
  current,
  onChange,
}: {
  current: number;
  onChange: (step: number) => void;
}) {
  return (
    <View style={styles.steps}>
      {STEPS.map((step, index) => {
        const done = step.id < current;
        const active = step.id === current;
        return (
          <View key={step.id} style={styles.stepSlot}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: active, disabled: step.id > current }}
              accessibilityLabel={step.name}
              onPress={() => onChange(step.id)}
              // Only allow stepping backwards, same as the Back button.
              disabled={step.id > current}
              style={[
                styles.stepCircle,
                done ? styles.stepDone : active ? styles.stepActive : styles.stepIdle,
              ]}>
              <step.icon
                size={18}
                color={active || done ? colors.background : colors.mutedForeground}
                strokeWidth={2}
              />
            </Pressable>
            <AppText
              variant="xs"
              weight="bold"
              tone={step.id <= current ? 'default' : 'muted'}
              numberOfLines={1}>
              {step.name}
            </AppText>
            {index < STEPS.length - 1 ? (
              <View style={[styles.stepLine, done ? styles.lineDone : styles.lineIdle]} />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

function PropertySummary({ property }: { property: Property | null }) {
  return (
    <View style={styles.summary}>
      <Image
        source={{
          uri: resolveMediaUrl(property?.image_url) ?? PROPERTY_IMAGE_FALLBACK,
        }}
        style={styles.summaryImage}
        contentFit="cover"
        transition={200}
        accessibilityLabel={property?.name ?? 'Property'}
      />
      <View style={styles.summaryText}>
        <AppText variant="base" weight="bold" numberOfLines={1}>
          {property?.name ?? 'Loading...'}
        </AppText>
        <AppText variant="sm" tone="muted" numberOfLines={1}>
          {property?.location ?? ''}
        </AppText>
        <AppText variant="sm" weight="bold" tone="primary">
          {formatMK(property?.price ?? 0)}
        </AppText>
      </View>
      <PropertyFacts property={property} />
    </View>
  );
}

function PropertyFacts({ property }: { property: Property | null }) {
  return (
    <View style={styles.facts}>
      <AppText variant="xs" tone="muted">
        {toNumber(property?.beds)} Beds
      </AppText>
      <AppText variant="xs" tone="muted">
        {formatDecimal(property?.baths)} Baths
      </AppText>
      <AppText variant="xs" tone="muted">
        {toNumber(property?.sqft).toLocaleString('en-US')} sqft
      </AppText>
    </View>
  );
}

function SectionTitle({ icon, children }: { icon: ReactNode; children: string }) {
  return (
    <View style={styles.sectionTitle}>
      {icon}
      <AppText variant="sm" weight="bold">
        {children}
      </AppText>
    </View>
  );
}

function InfoGrid({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <View style={styles.infoGrid}>
      {rows.map((row) => (
        <View key={row.label} style={styles.infoCell}>
          <AppText variant="xs" weight="bold" tone="muted" uppercase>
            {row.label}
          </AppText>
          <AppText variant="sm" weight="medium">
            {row.value}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 16, paddingBottom: 40, gap: 16 },

  steps: { flexDirection: 'row', gap: 8 },
  stepSlot: { flex: 1, alignItems: 'center', gap: 6 },
  stepCircle: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  stepDone: { backgroundColor: colors.success },
  stepActive: { backgroundColor: colors.primary },
  stepIdle: { backgroundColor: colors.muted },
  stepLine: { position: 'absolute', top: 22, left: '65%', right: '-35%', height: 2 },
  lineDone: { backgroundColor: colors.success },
  lineIdle: { backgroundColor: colors.muted },

  card: { padding: 16 },
  stack: { gap: 16 },
  nested: { gap: 6, borderRadius: radius.lg, backgroundColor: colors.background },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },

  summary: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: 12, borderRadius: radius.lg, backgroundColor: colors.muted },
  summaryImage: { width: 72, height: 72, borderRadius: radius.md, backgroundColor: colors.border },
  summaryText: { flex: 1, gap: 2, minWidth: 120 },
  facts: { flexDirection: 'row', gap: 12, width: '100%' },

  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },

  qualification: { flexDirection: 'row', gap: 10, padding: 12, borderRadius: radius.lg, borderWidth: 1 },
  qualified: { backgroundColor: colors.successBg, borderColor: colors.successBorder },
  unqualified: { backgroundColor: colors.warningBg, borderColor: colors.warningBorder },
  qualificationText: { flex: 1, gap: 4 },

  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  infoCell: { gap: 2, minWidth: 140, flexGrow: 1 },

  terms: { padding: 12, borderRadius: radius.lg, backgroundColor: colors.muted },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
});
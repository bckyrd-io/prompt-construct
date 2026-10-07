import { useState } from 'react';
import { ArrowRight, BarChart3, Brain, Calculator, Compass, Mountain, PenTool, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/separator';
import { ScreenHeader } from '@/components/ui/screen-header';
import { PromptComposer } from '@/components/ui/prompt-composer';
import { AppText } from '@/components/ui/text';
import { PropertyCard } from '@/components/property-card';
import { APP_LOGO, APP_NAME } from '@/constants/app';
import { colors, fontFamily, radius } from '@/constants/theme';
import { useGridCardWidth, useGridColumns } from '@/hooks/use-grid';
import { useAuthStore } from '@/store/auth';
import type { Property } from '@/types/api';

/**
 * Showcase listings, ported verbatim from `app/page.tsx`.
 *
 * The web landing page hardcodes these rather than querying the API, so they are
 * kept as-is here — the live inventory is on /recommendations.
 */
const propertiesData = {
  featured: [
    { id: 1, name: 'The Highlands Estate', location: 'Lilongwe', price: 1_200_000, beds: 4, baths: 3.5, sqft: 3200, type: 'NEW LISTING', status: 'In Progress', progress: 65 },
    { id: 2, name: 'Urban Loft Project', location: 'Blantyre', price: 850_000, beds: 2, baths: 2, sqft: 1800, type: 'PERMIT READY', status: 'Ready to Build', progress: 100 },
    { id: 3, name: 'Rocky Mountain Estate', location: 'Mzuzu', price: 2_400_000, beds: 5, baths: 4, sqft: 4500, type: 'LAND ONLY', status: 'Available', progress: 0 },
  ],
  catalog: [
    { id: 110, name: 'Sunset Valley Villa', location: 'Zomba', price: 950_000, beds: 3, baths: 2.5, sqft: 2400, type: 'NEW LISTING', status: 'Available', progress: 0 },
    { id: 115, name: 'Coastal Haven', location: 'Mangochi', price: 1_850_000, beds: 4, baths: 3.5, sqft: 3800, type: 'WATERFRONT', status: 'In Progress', progress: 45 },
    { id: 120, name: 'Desert Oasis Ranch', location: 'Kasungu', price: 1_100_000, beds: 3, baths: 2, sqft: 2100, type: 'RANCH STYLE', status: 'Available', progress: 0 },
    { id: 125, name: 'Mountain View Estate', location: 'Karonga', price: 1_650_000, beds: 4, baths: 3, sqft: 3100, type: 'MOUNTAIN VIEW', status: 'Available', progress: 0 },
    { id: 130, name: 'Lakefront Paradise', location: 'Salima', price: 2_800_000, beds: 5, baths: 4.5, sqft: 5200, type: 'LAKEFRONT', status: 'Available', progress: 0 },
    { id: 135, name: 'Modern Minimalist', location: 'Dedza', price: 780_000, beds: 2, baths: 2, sqft: 1650, type: 'MODERN', status: 'Ready to Build', progress: 100 },
  ],
  quickActions: [
    { icon: Mountain, label: 'Find Land' },
    { icon: Calculator, label: 'Estimate Cost' },
    { icon: Compass, label: 'Browse Designs' },
  ],
  howItWorks: [
    {
      step: '01',
      title: 'AI Matchmaking',
      desc: 'Our agentic AI scans thousands of listings and zoning laws to find properties that match your vision perfectly.',
      icon: Brain,
    },
    {
      step: '02',
      title: 'Instant Feasibility',
      desc: 'Get immediate construction cost estimates, timeline projections, and architectural compatibility checks.',
      icon: PenTool,
    },
    {
      step: '03',
      title: 'Build & Track',
      desc: 'Watch your project come to life. Track milestones, approve changes, and view drone footage from your dashboard.',
      icon: BarChart3,
    },
  ],
};

/** Stand-in records so the ported showcase cards render through the real card. */
const showcase: Property[] = propertiesData.featured.map((p) => ({
  id: p.id,
  name: p.name,
  location: p.location,
  price: p.price,
  beds: p.beds,
  baths: p.baths,
  sqft: p.sqft,
  type: p.type,
  status: 'active',
  image_url: null,
  client_id: null,
  progress: p.progress,
  milestones: [],
}));

/**
 * Same treatment for the "Curated Opportunities" block.
 *
 * The web page used reference strings like `RC-2024-110`, which are not database
 * ids — `/apply?property=RC-2024-110` cannot resolve. These cards therefore route
 * to the live inventory instead of a single property, so the tap target always
 * leads somewhere real.
 */
const catalogShowcase: Property[] = propertiesData.catalog.map((p) => ({
  id: p.id,
  name: p.name,
  location: p.location,
  price: p.price,
  beds: p.beds,
  baths: p.baths,
  sqft: p.sqft,
  type: p.type,
  status: 'available',
  image_url: null,
  client_id: null,
  progress: p.progress,
  milestones: [],
}));

const GRID = { minCardWidth: 300, maxColumns: 3 } as const;
/** Vertical spacing between cards is always applied; only the horizontal
 * gutter collapses on a single column. See styles.grid for why these are
 * separate properties rather than one gap. */
const CARD_GAP = 16;

export default function HomeScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');

  const columns = useGridColumns(GRID);
  const cardWidth = useGridCardWidth(GRID);

  const handleSearch = () => {
    const q = searchQuery.trim();
    if (!q) return;
    // Object form so Expo Router encodes the query itself.
    if (!isAuthenticated) {
      router.push({ pathname: '/auth/login', params: { next: 'recommendations', q } });
      return;
    }
    router.push({ pathname: '/recommendations', params: { q } });
  };

  return (
    <View style={styles.root}>
      <ScreenHeader
        title={APP_NAME}
        brand={APP_LOGO}
        right={
          isAuthenticated ? (
            <Badge tone="green">AI Active</Badge>
          ) : (
            <Button
              size="sm"
              variant="inverse"
              icon={<User size={14} color={colors.background} strokeWidth={2} />}
              onPress={() => router.push('/auth/login')}>
              Account
            </Button>
          )
        }
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Hero */}
        <View style={styles.hero}>
          <Badge variant="outline">
            <AppText variant="xs" weight="medium">
              ● Agentic AI Powered
            </AppText>
          </Badge>

          <AppText variant="4xl" style={styles.heroTitle}>
            Acquire Your Property{'\n'}
            <AppText variant="4xl" tone="primary">
              with Agentic AI
            </AppText>
          </AppText>

          <AppText variant="lg" tone="muted" style={styles.heroSubtitle}>
            Describe your dream property. Our AI matches land and construction plans instantly.
          </AppText>

          <View style={styles.searchBar}>
            <PromptComposer
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmit={handleSearch}
              placeholder="Find a 2-acre lot for a mid-century modern home..."
            />
          </View>

          <View style={styles.pills}>
            {propertiesData.quickActions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                size="lg"
                icon={<action.icon size={16} color={colors.primary} strokeWidth={2} />}>
                {action.label}
              </Button>
            ))}
          </View>
        </View>

        {/* Featured */}
        <Section title="Featured Opportunities" subtitle="Premium properties selected by our AI for high investment potential">
          <View style={[styles.grid, { columnGap: columns > 1 ? CARD_GAP : 0 }]}>
            {showcase.map((property) => (
              <View key={property.id} style={{ width: cardWidth }}>
                <PropertyCard
                  property={property}
                  actionLabel="View Blueprint"
                  onPress={() => router.push({ pathname: '/apply', params: { property: String(property.id) } })}
                />
              </View>
            ))}
          </View>
        </Section>

        {/* Curated */}
        <View style={styles.mutedSection}>
          <Section
            title="Curated Opportunities"
            subtitle="High-potential properties pre-vetted for construction."
            action={
              <Button
                variant="outline"
                onPress={() => router.push('/recommendations')}
                iconRight={<ArrowRight size={16} color={colors.foreground} strokeWidth={2} />}>
                View all listings
              </Button>
            }>
            <View style={[styles.grid, { columnGap: columns > 1 ? CARD_GAP : 0 }]}>
              {catalogShowcase.map((property) => (
                <View key={property.id} style={{ width: cardWidth }}>
                  <PropertyCard
                    property={property}
                    actionLabel="View Blueprint"
                    onPress={() => router.push('/recommendations')}
                  />
                </View>
              ))}
            </View>
          </Section>
        </View>

        {/* How it works */}
        <View style={styles.mutedSection}>
          <Section title="How It Works" subtitle="Three simple steps to your dream property">
            <View style={[styles.grid, { columnGap: columns > 1 ? CARD_GAP : 0 }]}>
              {propertiesData.howItWorks.map(({ step, title, desc, icon: Icon }) => (
                <View key={step} style={{ width: cardWidth }}>
                  <Card style={styles.stepCard}>
                    <View style={styles.stepIcon}>
                      <Icon size={20} color={colors.primary} strokeWidth={2} />
                    </View>
                    <View style={styles.stepBody}>
                      <View style={styles.stepTitleRow}>
                        <AppText variant="xs" tone="muted" weight="medium">
                          {step}
                        </AppText>
                        <AppText variant="sm" weight="semibold">
                          {title}
                        </AppText>
                      </View>
                      <AppText variant="sm" tone="muted">
                        {desc}
                      </AppText>
                    </View>
                  </Card>
                </View>
              ))}
            </View>
          </Section>
        </View>

        <Divider />

        <AppText variant="xs" tone="muted" style={styles.footer}>
          © 2026 {APP_NAME}. All rights reserved.
        </AppText>

        {/* The web footer links to "#" for both, so they are rendered as plain
            text rather than shipping tap targets that go nowhere. */}
        <View style={styles.footerLinks}>
          <AppText variant="xs" tone="muted">
            Privacy Policy
          </AppText>
          <AppText variant="xs" tone="muted">
            Terms of Service
          </AppText>
        </View>
      </ScrollView>
    </View>
  );
}

function Section({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  /** Right-aligned header control, e.g. the "View all listings" link. */
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <AppText variant="2xl">{title}</AppText>
        {subtitle ? (
          <AppText variant="sm" tone="muted" style={styles.sectionSubtitle}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {action}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: 16, paddingBottom: 40, gap: 24 },
  hero: { alignItems: 'center', gap: 16, paddingVertical: 24 },
  heroTitle: { textAlign: 'center', fontFamily: fontFamily.extrabold },
  heroSubtitle: { textAlign: 'center', maxWidth: 480 },
  searchBar: { width: '100%', maxWidth: 640, gap: 8 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  section: { gap: 16 },
  sectionHeader: { alignItems: 'center', gap: 4 },
  sectionSubtitle: { textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: CARD_GAP },
  mutedSection: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: '#fafafa',
  },
  stepCard: { flexDirection: 'row', gap: 12, padding: 16 },
  stepIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: '#fdf1d7',
  },
  stepBody: { flex: 1, gap: 4 },
  stepTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  footer: { textAlign: 'center' },
  footerLinks: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
});
import { useCallback, useState } from 'react';
import {
  CreditCard,
  MapPin,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react-native';
import { useFocusEffect } from 'expo-router';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Progress } from '@/components/ui/progress';
import { Loading } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { AppText } from '@/components/ui/text';
import { showToast } from '@/components/ui/toast';
import { colors, radius } from '@/constants/theme';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import * as api from '@/lib/api';
import { formatMK, initials } from '@/lib/format';
import type { Application, Property } from '@/types/api';

interface MarketTrend {
  location: string;
  percentage: number;
  propertyCount: number;
  avgPrice: string;
}

interface ReportStats {
  activeLeads: number;
  investmentOpportunities: number;
  revenue: number;
  projectsCompleted: number;
  activeProjects: number;
}

export default function AdminReportsScreen() {
  const ready = useAuthGuard('admin');

  const [applications, setApplications] = useState<Application[]>([]);
  const [marketTrends, setMarketTrends] = useState<MarketTrend[]>([]);
  const [stats, setStats] = useState<ReportStats>({
    activeLeads: 0,
    investmentOpportunities: 0,
    revenue: 0,
    projectsCompleted: 0,
    activeProjects: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reviewingId, setReviewingId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [propsRes, appsRes, paymentsRes] = await Promise.all([
        api.getProperties(),
        api.getApplications(),
        api.getPayments().catch(() => ({ payments: [] })),
      ]);

      const props: Property[] = propsRes.properties || [];
      const apps: Application[] = appsRes.applications || [];
      const payments = paymentsRes.payments || [];

      // Stats calculation
      const activeProj = props.filter((p) => p.status === 'active').length;
      const completedProj = props.filter((p) => p.status === 'completed').length;

      // Revenue from completed payments or properties
      const completedPayments = payments.filter((p) => p.status === 'completed');
      let totalRev = completedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      if (totalRev === 0) {
        totalRev = props
          .filter((p) => p.status === 'completed' || p.status === 'active')
          .reduce((sum, p) => sum + (p.price || 0), 0);
      }

      // Market trends
      const locationStats: Record<string, { count: number; total: number }> = {};
      props.forEach((p) => {
        if (!p.location) return;
        if (!locationStats[p.location]) {
          locationStats[p.location] = { count: 0, total: 0 };
        }
        locationStats[p.location].count += 1;
        locationStats[p.location].total += p.price || 0;
      });

      const totalProps = props.length;
      const trends: MarketTrend[] = Object.entries(locationStats)
        .map(([loc, s]) => {
          const pct = totalProps > 0 ? Math.round((s.count / totalProps) * 100) : 0;
          const avg = s.count > 0 ? Math.round(s.total / s.count) : 0;
          return {
            location: loc,
            percentage: pct,
            propertyCount: s.count,
            avgPrice: `MK ${(avg / 1_000_000).toFixed(1)}M`,
          };
        })
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 5);

      setMarketTrends(trends);

      // Investment opportunities
      const locationTotalCount: Record<string, number> = {};
      apps.forEach((app) => {
        const loc = (app.property_location || '').trim().toLowerCase();
        if (loc) {
          locationTotalCount[loc] = (locationTotalCount[loc] || 0) + 1;
        }
      });
      const opportunityCount = Object.values(locationTotalCount).filter((c) => c >= 1).length;

      setStats({
        activeLeads: apps.filter((a) => a.status === 'pending').length,
        investmentOpportunities: Math.max(opportunityCount, trends.length),
        revenue: totalRev,
        projectsCompleted: completedProj,
        activeProjects: activeProj,
      });

      setApplications(apps);
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : 'Failed to load report data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!ready) return;
      void fetchData();
    }, [ready, fetchData]),
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    void fetchData();
  };

  const handleReview = async (app: Application) => {
    setReviewingId(app.id);
    try {
      const res = await api.verifyApplication({
        userId: app.user_id,
        applicationId: app.id,
      });
      showToast.success(res.message || 'Application approved successfully');
      await fetchData();
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : 'Failed to approve application');
    } finally {
      setReviewingId(null);
    }
  };

  if (isLoading || !ready) {
    return (
      <View style={styles.root}>
        <ScreenHeader title="Analytics & Reports" />
        <Loading label="Computing analytics..." />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="Analytics & Reports"
        subtitle="Business performance overview"
      />

      <FlatList
        data={applications}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerComponent}>
            {/* Top Stat Cards */}
            <View style={styles.statsCardsRow}>
              {/* Active Leads */}
              <Card style={styles.statCard}>
                <View style={styles.statHeader}>
                  <View style={[styles.statIconBox, { backgroundColor: '#fef3c7' }]}>
                    <Users size={16} color="#d97706" />
                  </View>
                  <Badge tone="gold">
                    <AppText variant="xs" weight="semibold">
                      Active
                    </AppText>
                  </Badge>
                </View>
                <AppText variant="3xl" weight="bold">
                  {stats.activeLeads}
                </AppText>
                <AppText variant="xs" tone="muted" uppercase weight="medium">
                  Active Leads
                </AppText>
                <Progress value={Math.min(stats.activeLeads * 20, 100)} height={6} />
              </Card>

              {/* Opportunities */}
              <Card style={styles.statCard}>
                <View style={styles.statHeader}>
                  <View style={[styles.statIconBox, { backgroundColor: '#dcfce7' }]}>
                    <TrendingUp size={16} color="#16a34a" />
                  </View>
                  <Badge tone="green">
                    <AppText variant="xs" weight="semibold">
                      High Demand
                    </AppText>
                  </Badge>
                </View>
                <AppText variant="3xl" weight="bold">
                  {stats.investmentOpportunities}
                </AppText>
                <AppText variant="xs" tone="muted" uppercase weight="medium">
                  Opportunities
                </AppText>
                <AppText variant="xs" tone="muted">
                  Locations ready for growth
                </AppText>
              </Card>
            </View>

            {/* Total Revenue Card */}
            <Card style={styles.revenueCard}>
              <View style={styles.revenueHeader}>
                <View style={[styles.statIconBox, { backgroundColor: '#fdf1d7' }]}>
                  <CreditCard size={18} color={colors.primary} />
                </View>
                <View style={styles.revenueLabels}>
                  <AppText variant="xs" tone="muted" uppercase weight="semibold">
                    Total Pipeline Revenue
                  </AppText>
                  <AppText variant="2xl" weight="bold" tone="primary">
                    {formatMK(stats.revenue)}
                  </AppText>
                </View>
              </View>
              <View style={styles.revenueMeta}>
                <AppText variant="xs" tone="muted">
                  Active Projects: {stats.activeProjects}
                </AppText>
                <AppText variant="xs" tone="muted">•</AppText>
                <AppText variant="xs" tone="muted">
                  Completed: {stats.projectsCompleted}
                </AppText>
              </View>
            </Card>

            {/* Market Trends Card */}
            <Card style={styles.trendsCard}>
              <View style={styles.trendsHeader}>
                <AppText variant="base" weight="bold">
                  Market Trends
                </AppText>
                <AppText variant="xs" tone="muted">
                  Inventory density by area
                </AppText>
              </View>

              {marketTrends.length === 0 ? (
                <AppText variant="sm" tone="muted">
                  No market data available yet.
                </AppText>
              ) : (
                <View style={styles.trendsList}>
                  {marketTrends.map((trend, idx) => (
                    <View key={idx} style={styles.trendRow}>
                      <View style={styles.trendInfo}>
                        <AppText variant="sm" weight="semibold">
                          {trend.location}
                        </AppText>
                        <AppText variant="xs" tone="muted">
                          Avg: {trend.avgPrice} • {trend.propertyCount} properties
                        </AppText>
                      </View>
                      <View style={styles.trendRight}>
                        <AppText variant="sm" weight="bold" tone="primary">
                          {trend.percentage}%
                        </AppText>
                        <View style={styles.trendProgress}>
                          <Progress value={trend.percentage} height={5} />
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </Card>

            {/* Section heading for Applicants / Leads */}
            <View style={styles.leadsHeadingRow}>
              <AppText variant="base" weight="bold">
                Lead Qualification ({applications.length})
              </AppText>
              <AppText variant="xs" tone="muted">
                Recent property applications
              </AppText>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const isPending = item.status === 'pending';
          const isReviewing = reviewingId === item.id;
          const statusTone = isPending ? 'gold' : item.status === 'approved' ? 'green' : 'neutral';

          return (
            <Card style={styles.leadCard}>
              <View style={styles.leadHeader}>
                <View style={styles.leadAvatar}>
                  <AppText variant="xs" weight="bold" tone="primary">
                    {initials(item.user_name || item.user_email || 'Lead')}
                  </AppText>
                </View>

                <View style={styles.leadMain}>
                  <AppText variant="sm" weight="bold" numberOfLines={1}>
                    {item.user_name || item.user_email || 'Applicant'}
                  </AppText>
                  {item.user_email ? (
                    <AppText variant="xs" tone="muted" numberOfLines={1}>
                      {item.user_email}
                    </AppText>
                  ) : null}
                </View>

                <Badge tone={statusTone}>
                  <AppText variant="xs" weight="semibold" uppercase>
                    {item.status}
                  </AppText>
                </Badge>
              </View>

              <View style={styles.leadPropertyRow}>
                <View style={styles.leadPropDetails}>
                  <AppText variant="xs" weight="semibold" numberOfLines={1}>
                    {item.property_name || `Property #${item.property_id}`}
                  </AppText>
                  {item.property_location ? (
                    <View style={styles.locationPill}>
                      <MapPin size={11} color={colors.mutedForeground} />
                      <AppText variant="xs" tone="muted" numberOfLines={1}>
                        {item.property_location}
                      </AppText>
                    </View>
                  ) : null}
                </View>

                {item.property_price ? (
                  <AppText variant="xs" weight="bold" tone="primary">
                    {formatMK(item.property_price)}
                  </AppText>
                ) : null}
              </View>

              {isPending ? (
                <View style={styles.leadActionRow}>
                  <Button
                    size="sm"
                    variant="default"
                    loading={isReviewing}
                    disabled={isReviewing}
                    onPress={() => handleReview(item)}
                    icon={<UserCheck size={14} color={colors.primaryForeground} />}>
                    Approve Application
                  </Button>
                </View>
              ) : null}
            </Card>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            title="No leads yet"
            description="Applications from clients will appear here for review."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: 16, paddingBottom: 40, gap: 12 },

  headerComponent: { gap: 14, marginBottom: 4 },
  statsCardsRow: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, gap: 8, padding: 14 },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statIconBox: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },

  revenueCard: { gap: 10, padding: 16, backgroundColor: '#ffffff' },
  revenueHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  revenueLabels: { flex: 1, gap: 2 },
  revenueMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  trendsCard: { gap: 14, padding: 16 },
  trendsHeader: { gap: 2 },
  trendsList: { gap: 12 },
  trendRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  trendInfo: { flex: 1, gap: 2 },
  trendRight: { width: 80, alignItems: 'flex-end', gap: 4 },
  trendProgress: { width: 70 },

  leadsHeadingRow: { gap: 2, paddingTop: 4 },

  leadCard: { gap: 10, padding: 14 },
  leadHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  leadAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fdf1d7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leadMain: { flex: 1, gap: 2 },

  leadPropertyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 8,
  },
  leadPropDetails: { flex: 1, gap: 3 },
  locationPill: { flexDirection: 'row', alignItems: 'center', gap: 3 },

  leadActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 6,
  },
});

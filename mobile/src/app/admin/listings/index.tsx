import { useCallback, useState } from 'react';
import {
  Building2,
  Check,
  Clock,
  CreditCard,
  Hourglass,
  MapPin,
  Package,
  Plus,
  User as UserIcon,
} from 'lucide-react-native';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button, IconButton } from '@/components/ui/button';
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
import { formatMK } from '@/lib/format';
import { PROPERTY_IMAGE_FALLBACK, resolveMediaUrl } from '@/lib/media';
import type { Property } from '@/types/api';

type FilterType = 'all' | 'active' | 'pending' | 'available';

interface Stats {
  totalListings: number;
  activeProjects: number;
  pendingApprovals: number;
  availableCount: number;
}

export default function AdminListingsScreen() {
  const router = useRouter();
  const ready = useAuthGuard('admin');

  const [properties, setProperties] = useState<Property[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState<Stats>({
    totalListings: 0,
    activeProjects: 0,
    pendingApprovals: 0,
    availableCount: 0,
  });

  const fetchProperties = useCallback(async () => {
    try {
      const data = await api.getProperties();
      const list = data.properties || [];
      setProperties(list);

      const active = list.filter((p) => p.status === 'active').length;
      const pending = list.filter((p) => p.status === 'pending').length;
      const available = list.filter((p) => p.status === 'available').length;

      setStats({
        totalListings: list.length,
        activeProjects: active,
        pendingApprovals: pending,
        availableCount: available,
      });
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : 'Failed to fetch properties');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!ready) return;
      void fetchProperties();
    }, [ready, fetchProperties]),
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    void fetchProperties();
  };

  const filtered = properties.filter((listing) => {
    if (filter === 'all') return true;
    return listing.status === filter;
  });

  if (isLoading || !ready) {
    return (
      <View style={styles.root}>
        <ScreenHeader title="Listings" />
        <Loading label="Loading properties..." />
      </View>
    );
  }

  const filterCards = [
    { id: 'all' as const, label: 'All', count: stats.totalListings, icon: Package, color: '#3b82f6' },
    { id: 'active' as const, label: 'Active', count: stats.activeProjects, icon: Building2, color: '#22c55e' },
    { id: 'pending' as const, label: 'Pending', count: stats.pendingApprovals, icon: Clock, color: '#f97316' },
    { id: 'available' as const, label: 'Available', count: stats.availableCount, icon: CreditCard, color: colors.gold },
  ];

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="Property Listings"
        subtitle={`${stats.totalListings} total listings`}
        right={
          <IconButton
            variant="default"
            accessibilityLabel="Create listing"
            onPress={() => router.push('/admin/listings/new')}>
            <Plus size={20} color={colors.primaryForeground} strokeWidth={2.5} />
          </IconButton>
        }
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.statsContainer}>
            <View style={styles.statsGrid}>
              {filterCards.map((f) => {
                const isSelected = filter === f.id;
                const IconComponent = f.icon;
                return (
                  <Pressable
                    key={f.id}
                    onPress={() => setFilter(f.id)}
                    style={[
                      styles.statCard,
                      isSelected ? styles.statCardSelected : null,
                    ]}>
                    <View style={styles.statTop}>
                      <View style={[styles.statIconBadge, { backgroundColor: f.color }]}>
                        <IconComponent size={14} color="#ffffff" strokeWidth={2.5} />
                      </View>
                      <AppText variant="lg" weight="bold">
                        {f.count}
                      </AppText>
                    </View>
                    <AppText variant="xs" weight="medium" tone={isSelected ? 'default' : 'muted'} uppercase numberOfLines={1}>
                      {f.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const statusTone =
            item.status === 'active'
              ? 'green'
              : item.status === 'available'
                ? 'gold'
                : item.status === 'pending'
                  ? 'neutral'
                  : 'neutral';

          return (
            <Card style={styles.propertyCard}>
              <View style={styles.cardImageContainer}>
                <Image
                  source={{ uri: resolveMediaUrl(item.image_url) ?? PROPERTY_IMAGE_FALLBACK }}
                  style={styles.cardImage}
                  contentFit="cover"
                  transition={150}
                />
                <Badge tone={statusTone} style={styles.statusBadge}>
                  <AppText variant="xs" weight="semibold" uppercase>
                    {item.status}
                  </AppText>
                </Badge>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.cardHeaderRow}>
                  <View style={styles.nameLocation}>
                    <AppText variant="base" weight="bold" numberOfLines={1}>
                      {item.name}
                    </AppText>
                    <View style={styles.locationRow}>
                      <MapPin size={13} color={colors.mutedForeground} strokeWidth={2} />
                      <AppText variant="xs" tone="muted" numberOfLines={1}>
                        {item.location}
                      </AppText>
                    </View>
                  </View>
                  <AppText variant="base" weight="bold" tone="primary">
                    {formatMK(item.price)}
                  </AppText>
                </View>

                <View style={styles.metaRow}>
                  <AppText variant="xs" tone="muted">
                    {item.type}
                  </AppText>
                  {item.client ? (
                    <>
                      <AppText variant="xs" tone="muted">•</AppText>
                      <View style={styles.clientRow}>
                        <UserIcon size={12} color={colors.mutedForeground} strokeWidth={2} />
                        <AppText variant="xs" tone="muted" numberOfLines={1}>
                          {item.client.name}
                        </AppText>
                      </View>
                    </>
                  ) : null}
                </View>

                {item.progress > 0 ? (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressLabelRow}>
                      <AppText variant="xs" weight="semibold" tone="muted" uppercase>
                        Progress
                      </AppText>
                      <AppText variant="xs" weight="semibold">
                        {item.progress}%
                      </AppText>
                    </View>
                    <Progress value={item.progress} height={6} />
                  </View>
                ) : null}

                {item.status === 'active' && item.milestones?.length > 0 ? (
                  <View style={styles.milestonesSection}>
                    <AppText variant="xs" weight="semibold" tone="muted" uppercase style={styles.milestonesHeading}>
                      Milestones
                    </AppText>
                    <View style={styles.milestoneBadges}>
                      {item.milestones.map((m, idx) => (
                        <View
                          key={idx}
                          style={[
                            styles.milestoneChip,
                            m.completed
                              ? styles.milestoneDone
                              : m.current
                                ? styles.milestoneCurrent
                                : styles.milestoneIdle,
                          ]}>
                          {m.completed ? (
                            <Check size={11} color={colors.success} strokeWidth={3} />
                          ) : m.current ? (
                            <Clock size={11} color="#000000" strokeWidth={2.5} />
                          ) : (
                            <Hourglass size={11} color={colors.mutedForeground} strokeWidth={2} />
                          )}
                          <AppText
                            variant="xs"
                            weight={m.current ? 'semibold' : 'medium'}
                            style={m.completed ? styles.textDone : m.current ? styles.textCurrent : styles.textIdle}>
                            {m.name}
                          </AppText>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : null}

                <View style={styles.cardActions}>
                  <Button
                    size="sm"
                    variant="secondary"
                    style={styles.editBtn}
                    onPress={() =>
                      router.push({
                        pathname: '/admin/listings/[id]/edit',
                        params: { id: String(item.id) },
                      })
                    }>
                    Edit Listing
                  </Button>
                </View>
              </View>
            </Card>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            title="No listings found"
            description="Try changing your filter or create a new property listing."
            action={
              <Button onPress={() => router.push('/admin/listings/new')} icon={<Plus size={16} color={colors.primaryForeground} />}>
                Create New Listing
              </Button>
            }
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: 16, paddingBottom: 40, gap: 16 },

  statsContainer: { marginBottom: 8 },
  statsGrid: { flexDirection: 'row', gap: 8 },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  statCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#fffdf7',
    borderWidth: 2,
  },
  statTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  propertyCard: { padding: 0, overflow: 'hidden' },
  cardImageContainer: { height: 160, width: '100%', position: 'relative', backgroundColor: colors.muted },
  cardImage: { width: '100%', height: '100%' },
  statusBadge: { position: 'absolute', top: 12, left: 12 },

  cardBody: { padding: 14, gap: 10 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  nameLocation: { flex: 1, gap: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  clientRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 1 },

  progressContainer: { gap: 4, marginTop: 2 },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  milestonesSection: { gap: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: colors.border },
  milestonesHeading: { fontSize: 10 },
  milestoneBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  milestoneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  milestoneDone: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  milestoneCurrent: { backgroundColor: '#fef3c7', borderColor: '#fde68a' },
  milestoneIdle: { backgroundColor: '#f3f4f6', borderColor: '#e5e7eb' },
  textDone: { color: colors.success },
  textCurrent: { color: '#000000' },
  textIdle: { color: colors.mutedForeground },

  cardActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  editBtn: { flex: 1 },
});

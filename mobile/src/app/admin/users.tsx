import { useCallback, useState } from 'react';
import {
  Clock,
  Shield,
  UserCheck,
  Users,
} from 'lucide-react-native';
import { useFocusEffect } from 'expo-router';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Loading } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { TextField } from '@/components/ui/text-field';
import { AppText } from '@/components/ui/text';
import { showToast } from '@/components/ui/toast';
import { colors, radius } from '@/constants/theme';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import * as api from '@/lib/api';
import type { AdminUser, Application, UserStats } from '@/types/api';

type FilterType = 'all' | 'clients' | 'admins' | 'pending';

export default function AdminUsersScreen() {
  const ready = useAuthGuard('admin');

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeClients: 0,
    adminUsers: 0,
    pendingVerifications: 0,
  });

  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [verifyingUserId, setVerifyingUserId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [usersRes, appsRes] = await Promise.all([
        api.getUsers(),
        api.getApplications(),
      ]);

      setUsers(usersRes.users || []);
      setStats(usersRes.stats || {
        totalUsers: 0,
        activeClients: 0,
        adminUsers: 0,
        pendingVerifications: 0,
      });
      setApplications(appsRes.applications || []);
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : 'Failed to fetch users');
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

  const handleVerify = async (userId: number, applicationId: number) => {
    setVerifyingUserId(userId);
    try {
      const res = await api.verifyApplication({ userId, applicationId });
      showToast.success(res.message || 'User verified successfully!');
      await fetchData();
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : 'Failed to verify user');
    } finally {
      setVerifyingUserId(null);
    }
  };

  const filtered = users.filter((u) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'clients' && u.role === 'Client') ||
      (filter === 'admins' && u.role === 'Admin') ||
      (filter === 'pending' && u.status === 'Pending');

    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  if (isLoading || !ready) {
    return (
      <View style={styles.root}>
        <ScreenHeader title="Leads & Users" />
        <Loading label="Loading users..." />
      </View>
    );
  }

  const statItems = [
    { label: 'Total Users', count: stats.totalUsers, icon: Users, tone: '#3b82f6' },
    { label: 'Clients', count: stats.activeClients, icon: UserCheck, tone: '#22c55e' },
    { label: 'Admins', count: stats.adminUsers, icon: Shield, tone: '#a855f7' },
    { label: 'Pending', count: stats.pendingVerifications, icon: Clock, tone: '#f97316' },
  ];

  const filterTabs = [
    { id: 'all' as const, label: 'All Users' },
    { id: 'clients' as const, label: 'Clients' },
    { id: 'admins' as const, label: 'Admins' },
    { id: 'pending' as const, label: 'Pending' },
  ];

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="User Management"
        subtitle={`${stats.totalUsers} registered users`}
      />

      <FlatList
        data={filtered}
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
            {/* Stats row */}
            <View style={styles.statsRow}>
              {statItems.map((stat, idx) => {
                const IconComponent = stat.icon;
                return (
                  <View key={idx} style={styles.statBox}>
                    <View style={styles.statTop}>
                      <AppText variant="lg" weight="bold">
                        {stat.count}
                      </AppText>
                      <IconComponent size={14} color={stat.tone} strokeWidth={2.5} />
                    </View>
                    <AppText variant="xs" tone="muted" weight="medium" uppercase numberOfLines={1}>
                      {stat.label}
                    </AppText>
                  </View>
                );
              })}
            </View>

            {/* Search Input */}
            <TextField
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by name or email..."
            />

            {/* Filter Pills */}
            <View style={styles.filterPills}>
              {filterTabs.map((tab) => {
                const isSelected = filter === tab.id;
                return (
                  <Pressable
                    key={tab.id}
                    onPress={() => setFilter(tab.id)}
                    style={[
                      styles.filterPill,
                      isSelected ? styles.filterPillActive : null,
                    ]}>
                    <AppText
                      variant="xs"
                      weight={isSelected ? 'bold' : 'medium'}
                      tone={isSelected ? 'default' : 'muted'}>
                      {tab.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const pendingApp = applications.find(
            (app) => app.user_id === item.id && app.status === 'pending',
          );
          const isVerifying = verifyingUserId === item.id;

          const roleTone = item.role === 'Admin' ? 'gold' : 'neutral';

          return (
            <Card style={styles.userCard}>
              <View style={styles.userCardHeader}>
                <View style={styles.avatar}>
                  <AppText variant="xs" weight="bold" tone="primary">
                    {item.initials}
                  </AppText>
                </View>

                <View style={styles.userInfo}>
                  <AppText variant="sm" weight="bold" numberOfLines={1}>
                    {item.name}
                  </AppText>
                  <AppText variant="xs" tone="muted" numberOfLines={1}>
                    {item.email}
                  </AppText>
                </View>

                <Badge tone={roleTone}>
                  <AppText variant="xs" weight="semibold" uppercase>
                    {item.role}
                  </AppText>
                </Badge>
              </View>

              <View style={styles.userMetaRow}>
                <View style={styles.statusWithDot}>
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor:
                          item.status === 'Active'
                            ? colors.success
                            : item.status === 'Pending'
                              ? colors.gold
                              : colors.mutedForeground,
                      },
                    ]}
                  />
                  <AppText variant="xs" tone="muted" weight="medium">
                    {item.status}
                  </AppText>
                </View>

                <AppText variant="xs" tone="muted">
                  Projects: {item.projects}
                </AppText>

                <AppText variant="xs" tone="muted">
                  Joined: {item.joined}
                </AppText>
              </View>

              {pendingApp ? (
                <View style={styles.verifyActionRow}>
                  <View style={styles.pendingNotice}>
                    <Clock size={12} color="#f97316" />
                    <AppText variant="xs" tone="muted">
                      Pending Application
                    </AppText>
                  </View>
                  <Button
                    size="sm"
                    variant="default"
                    loading={isVerifying}
                    disabled={isVerifying}
                    onPress={() => handleVerify(item.id, pendingApp.id)}
                    icon={<UserCheck size={14} color={colors.primaryForeground} />}>
                    Verify User
                  </Button>
                </View>
              ) : null}
            </Card>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            title="No users found"
            description="Try changing your search term or selected filter."
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
  statsRow: { flexDirection: 'row', gap: 8 },
  statBox: {
    flex: 1,
    padding: 10,
    borderRadius: radius.md,
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  statTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  filterPills: { flexDirection: 'row', gap: 8 },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: '#f3f4f6',
  },
  filterPillActive: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fde68a',
  },

  userCard: { gap: 10, padding: 14 },
  userCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fdf1d7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: { flex: 1, gap: 2 },

  userMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statusWithDot: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 7, height: 7, borderRadius: 3.5 },

  verifyActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  pendingNotice: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});

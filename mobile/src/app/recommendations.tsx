import { useCallback, useRef, useState } from 'react';
import { Brain, SearchX } from 'lucide-react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AiActiveBadge, PropertyCard } from '@/components/property-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Loading } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { showToast } from '@/components/ui/toast';
import { colors } from '@/constants/theme';
import * as api from '@/lib/api';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { useGridCardWidth, useGridColumns } from '@/hooks/use-grid';
import type { Property } from '@/types/api';

/**
 * Port of `app/recommendations/page.tsx`.
 *
 * Keeps the pgvector flow intact: warm up missing Gemini embeddings before
 * searching, then read `similarity` off each result to show an AI confidence
 * figure. The web page holds `activeFilters` but never renders filter controls, so
 * none are reproduced here either.
 */
const GRID = { minCardWidth: 300, maxColumns: 3 } as const;

/**
 * Vertical spacing between cards is always applied; only the horizontal gutter
 * collapses on a single column.
 *
 * These must be separate properties. Using one `gap` value that drops to 0 on a
 * single column removed the vertical spacing too, so stacked cards touched on a
 * phone.
 */
const CARD_GAP = 16;

export default function RecommendationsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const ready = useAuthGuard();

  const initialQuery = typeof params.q === 'string' ? params.q : '';

  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPreparing, setIsPreparing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [avgConfidence, setAvgConfidence] = useState(0);

  const columns = useGridColumns(GRID);
  const cardWidth = useGridCardWidth(GRID);

  const fetchProperties = useCallback(async (search: string) => {
    try {
      setLoadingMessage(search ? 'Searching with AI...' : '');
      const { properties: results } = await api.getProperties(
        search ? { search } : undefined,
      );
      setProperties(results);

      // Only meaningful when the query came back through the vector search.
      const first = results[0];
      if (search && first?.similarity) {
        const avg =
          results.reduce((sum, p) => sum + (p.similarity ?? 0), 0) / results.length;
        setAvgConfidence(Math.round(avg * 100));
      } else {
        setAvgConfidence(0);
      }
    } catch (err) {
      const message =
        err instanceof api.ApiError
          ? [err.message, err.suggestion].filter(Boolean).join(' ')
          : 'Failed to fetch properties';
      showToast.error(message);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, []);

  /** Generate any missing embeddings before the first semantic search. */
  const prepareEmbeddings = useCallback(async () => {
    try {
      setLoadingMessage('Checking AI embeddings...');
      const status = await api.getEmbeddingStatus();
      if (status.without_embeddings > 0) {
        setIsPreparing(true);
        setLoadingMessage('Generating AI embeddings for properties...');
        await api.generateEmbeddings();
      }
    } catch {
      // Non-fatal: the query falls back to plain filters without embeddings.
    } finally {
      setIsPreparing(false);
      setLoadingMessage('');
    }
  }, []);

  /**
   * Embeddings are generated once per app session, then the property list is
   * (re)fetched on every focus and on every query change. `useFocusEffect` handles
   * both, so there is no separate mount effect racing it.
   */
  const prepared = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (!ready) return;
      let cancelled = false;

      (async () => {
        if (!prepared.current) {
          prepared.current = true;
          await prepareEmbeddings();
        }
        if (!cancelled) await fetchProperties(initialQuery);
      })();

      return () => {
        cancelled = true;
      };
    }, [ready, initialQuery, prepareEmbeddings, fetchProperties]),
  );

  const busy = isLoading || isPreparing;

  return (
    <View style={styles.root}>
      <ScreenHeader
        title="AI Property Recommendations"
        right={
          <View style={styles.headerRight}>
            {initialQuery ? (
              <Button
                size="sm"
                variant="ghost"
                onPress={() => router.setParams({ q: undefined })}>
                Clear
              </Button>
            ) : null}
            <AiActiveBadge />
          </View>
        }
      />

      {busy ? (
        <Loading label={loadingMessage || 'Loading...'} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Card style={styles.banner}>
            <Brain size={24} color={colors.background} strokeWidth={2} />
            <View style={styles.bannerText}>
              <View style={styles.bannerTitleRow}>
                <AppText variant="base" weight="bold" tone="inverse">
                  AI-Powered Recommendations
                </AppText>
                <AppText variant="xs" tone="muted">
                  Powered by Gemini AI
                </AppText>
              </View>
              <AppText variant="sm" tone="muted">
                {initialQuery
                  ? avgConfidence > 0
                    ? `AI confidence: ${avgConfidence}% - Found ${properties.length} properties matching "${initialQuery}"`
                    : `Found ${properties.length} properties matching "${initialQuery}"`
                  : `Showing all ${properties.length} available properties`}
              </AppText>
            </View>
          </Card>

          {properties.length > 0 ? (
            <View
              style={[styles.grid, { columnGap: columns > 1 ? CARD_GAP : 0 }]}
            >
              {properties.map((property) => (
                <View key={property.id} style={{ width: cardWidth }}>
                  <PropertyCard
                    property={property}
                    actionLabel="Acquire"
                    showProgressWhenIdle
                    onPress={() =>
                      router.push({ pathname: '/apply', params: { property: String(property.id) } })
                    }
                  />
                </View>
              ))}
            </View>
          ) : (
            <EmptyState
              icon={<SearchX size={32} color={colors.mutedForeground} strokeWidth={1.5} />}
              title={initialQuery ? 'No properties found' : 'No properties available'}
              description={
                initialQuery
                  ? 'Try adjusting your search from the home screen'
                  : 'Check back later for new listings'
              }
            />
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  scroll: { padding: 16, paddingBottom: 40, gap: 16 },
  banner: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: colors.foreground,
    borderColor: colors.foreground,
  },
  bannerText: { flex: 1, gap: 4 },
  bannerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: CARD_GAP },
});
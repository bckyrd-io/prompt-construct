import type { ReactNode } from 'react';
import { memo } from 'react';
import { Bath, Bed, MapPin, Square } from 'lucide-react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { Badge, Dot } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { AppText } from './ui/text';
import { colors, fontFamily, radius } from '@/constants/theme';
import { formatDecimal, formatMK, statusLabel, toNumber } from '@/lib/format';
import { PROPERTY_IMAGE_FALLBACK, resolveMediaUrl } from '@/lib/media';
import type { Property } from '@/types/api';

/**
 * Port of the `PropertyCard` in `app/page.tsx` and `app/recommendations/page.tsx`.
 *
 * The web card desaturates the photo and restores colour on hover
 * (`grayscale group-hover:grayscale-0`). That is a pointer affordance with no
 * touch equivalent, so the photo renders at full colour here.
 */
export const PropertyCard = memo(function PropertyCard({
  property,
  actionLabel = 'View Blueprint',
  onPress,
  showProgressWhenIdle = false,
}: {
  property: Property;
  actionLabel?: string;
  onPress?: () => void;
  /** The recommendations screen shows a 0% bar; the landing page shows plain text. */
  showProgressWhenIdle?: boolean;
}) {
  const uri = resolveMediaUrl(property.image_url) ?? PROPERTY_IMAGE_FALLBACK;
  const progress = toNumber(property.progress);
  const showProgress = progress > 0 || showProgressWhenIdle;

  return (
    <View style={styles.card}>
      <View style={styles.media}>
        <Image
          source={{ uri }}
          style={styles.image}
          contentFit="cover"
          transition={200}
          accessibilityLabel={property.name}
        />

        <Badge variant="secondary" style={styles.typeBadge}>
          {property.type}
        </Badge>

        <Badge variant="outline" style={styles.locationBadge} icon={<MapPin size={12} color={colors.foreground} />}>
          {property.location}
        </Badge>

        <LinearGradient
          colors={['transparent', colors.imageScrim]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.scrim}>
          <View style={styles.scrimRow}>
            <AppText variant="sm" weight="semibold" tone="inverse" style={styles.name} numberOfLines={2}>
              {property.name}
            </AppText>
            <Badge style={styles.priceBadge}>{formatMK(property.price)}</Badge>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.body}>
        <View style={styles.specs}>
          <Spec icon={<Bed size={16} color={colors.mutedForeground} />} label={`${toNumber(property.beds)} Beds`} />
          <Spec
            icon={<Bath size={16} color={colors.mutedForeground} />}
            label={`${formatDecimal(property.baths)} Baths`}
          />
          <Spec
            icon={<Square size={16} color={colors.mutedForeground} />}
            label={`${toNumber(property.sqft).toLocaleString('en-US')} ft²`}
          />
        </View>

        {showProgress ? (
          <View style={styles.progressBlock}>
            <View style={styles.progressRow}>
              <AppText variant="xs" tone="muted">
                {statusLabel(property.status)}
              </AppText>
              <AppText variant="xs" tone="muted">
                {progress}% complete
              </AppText>
            </View>
            <Progress value={progress} height={6} tone={progress > 0 ? colors.primary : colors.success} />
          </View>
        ) : (
          <AppText variant="xs" tone="muted">
            {statusLabel(property.status)}
          </AppText>
        )}

        <Button variant="outline" fullWidth size="lg" onPress={onPress}>
          {actionLabel}
        </Button>
      </View>
    </View>
  );
});

function Spec({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <View style={styles.spec}>
      {icon}
      <AppText variant="xs" weight="medium" numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}

/** "AI Active" pill from the web header, reused on authenticated screens. */
export function AiActiveBadge() {
  return (
    <Badge tone="green" icon={<Dot color={colors.success} />}>
      AI Active
    </Badge>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  media: { height: 200, backgroundColor: colors.muted },
  image: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  typeBadge: { position: 'absolute', top: 12, left: 12 },
  locationBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: colors.background },
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    paddingTop: 40,
  },
  scrimRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 },
  name: { flex: 1, fontFamily: fontFamily.semibold },
  priceBadge: {
    backgroundColor: colors.foreground,
    borderColor: colors.foreground,
    flexShrink: 0,
  },
  body: { flex: 1, gap: 12, padding: 12 },
  specs: { flexDirection: 'row', gap: 6 },
  spec: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: radius.md,
    backgroundColor: colors.muted,
  },
  progressBlock: { gap: 6 },
  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
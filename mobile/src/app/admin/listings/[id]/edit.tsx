import { useCallback, useState } from 'react';
import {
  Camera,
  Plus,
  Save,
  Trash2,
} from 'lucide-react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button, IconButton } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { InlineCheckbox } from '@/components/ui/checkbox-field';
import { Progress } from '@/components/ui/progress';
import { Loading } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { TextField } from '@/components/ui/text-field';
import { AppText } from '@/components/ui/text';
import { showToast } from '@/components/ui/toast';
import { colors, radius } from '@/constants/theme';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import * as api from '@/lib/api';
import { formatMK } from '@/lib/format';
import { resolveMediaUrl } from '@/lib/media';
import type { Milestone, Property } from '@/types/api';

export default function EditPropertyScreen() {
  const router = useRouter();
  const ready = useAuthGuard('admin');
  const params = useLocalSearchParams<{ id: string }>();
  const propertyId = typeof params.id === 'string' ? params.id : '';

  const [property, setProperty] = useState<Property | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [tempIdCounter, setTempIdCounter] = useState(-1);

  const fetchProperty = useCallback(async () => {
    if (!propertyId) return;
    try {
      const data = await api.getProperty(propertyId);
      setProperty(data.property);
      setMilestones(data.property.milestones || []);
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : 'Failed to load property');
      router.replace('/admin/listings');
    } finally {
      setIsLoading(false);
    }
  }, [propertyId, router]);

  // `useFocusEffect` rather than `useEffect`: refetch on focus (so returning from
  // another screen shows fresh milestones) without setState in an effect body,
  // which the react-hooks compiler rules reject.
  useFocusEffect(
    useCallback(() => {
      if (ready) void fetchProperty();
    }, [ready, fetchProperty]),
  );

  const handleSave = async () => {
    if (!property) return;
    setIsSaving(true);
    try {
      const data = await api.updateMilestones(property.id, milestones);
      setMilestones(data.milestones);
      setProperty((prev) => (prev ? { ...prev, progress: data.progress } : null));
      showToast.success('Milestones saved successfully');
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : 'Failed to save milestones');
    } finally {
      setIsSaving(false);
    }
  };

  const updateMilestone = (index: number, patch: Partial<Milestone>) => {
    setMilestones((prev) => {
      const next = [...prev];
      const currentItem = { ...next[index], ...patch };

      // If marking current=true, unmark current on all others
      if (patch.current === true) {
        for (let i = 0; i < next.length; i++) {
          if (i !== index) next[i] = { ...next[i], current: false };
        }
      }

      // If marking completed=true, set current=false
      if (patch.completed === true) {
        currentItem.current = false;
        currentItem.payment_status = 'paid';
      }

      next[index] = currentItem;
      return next;
    });
  };

  const addMilestone = () => {
    const newStage: Milestone = {
      id: tempIdCounter,
      name: '',
      completed: false,
      current: false,
      payment_status: 'unpaid',
      amount: 0,
      photos: [],
    };
    setMilestones((prev) => [...prev, newStage]);
    setTempIdCounter((prev) => prev - 1);
  };

  const removeMilestone = (index: number) => {
    setMilestones((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddPhoto = async (index: number) => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showToast.error('Permission to access photos is required');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled || !result.assets[0]) return;

      const asset = result.assets[0];
      setUploadingIndex(index);

      const fileName = asset.fileName || `milestone_${Date.now()}.jpg`;
      const mimeType = asset.mimeType || 'image/jpeg';

      const res = await api.uploadFile(asset.uri, fileName, mimeType);

      setMilestones((prev) => {
        const next = [...prev];
        const photos = [...(next[index].photos || []), res.url];
        next[index] = { ...next[index], photos };
        return next;
      });

      showToast.success('Photo added');
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : 'Failed to upload photo');
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleRemovePhoto = (milestoneIndex: number, photoIndex: number) => {
    setMilestones((prev) => {
      const next = [...prev];
      const photos = next[milestoneIndex].photos.filter((_, i) => i !== photoIndex);
      next[milestoneIndex] = { ...next[milestoneIndex], photos };
      return next;
    });
  };

  if (isLoading || !ready) {
    return (
      <View style={styles.root}>
        <ScreenHeader title="Edit Property" showBack />
        <Loading label="Loading property details..." />
      </View>
    );
  }

  if (!property) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.root}>
      <ScreenHeader
        title={property.name}
        subtitle={property.location}
        showBack
        right={
          <Button
            size="sm"
            onPress={handleSave}
            loading={isSaving}
            disabled={isSaving}
            icon={<Save size={16} color={colors.primaryForeground} />}>
            Save
          </Button>
        }
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Overview Header Card */}
        <Card style={styles.overviewCard}>
          <View style={styles.overviewHeader}>
            <View style={styles.overviewTitleCol}>
              <AppText variant="lg" weight="bold">
                {property.name}
              </AppText>
              <AppText variant="sm" tone="muted">
                {property.location} • {formatMK(property.price)}
              </AppText>
            </View>
            <Badge
              tone={
                property.status === 'active'
                  ? 'green'
                  : property.status === 'available'
                    ? 'gold'
                    : 'neutral'
              }>
              <AppText variant="xs" weight="semibold" uppercase>
                {property.status}
              </AppText>
            </Badge>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressLabels}>
              <AppText variant="xs" weight="semibold" tone="muted" uppercase>
                Project Progress
              </AppText>
              <AppText variant="xs" weight="semibold">
                {property.progress}%
              </AppText>
            </View>
            <Progress value={property.progress} height={8} />
          </View>
        </Card>

        {/* Milestones Management Section */}
        <View style={styles.milestonesHeader}>
          <View>
            <AppText variant="base" weight="bold">
              Payment Milestones
            </AppText>
            <AppText variant="xs" tone="muted">
              {milestones.length} construction {milestones.length === 1 ? 'stage' : 'stages'}
            </AppText>
          </View>
          <Button
            size="sm"
            variant="outline"
            onPress={addMilestone}
            icon={<Plus size={14} color={colors.foreground} />}>
            Add Stage
          </Button>
        </View>

        {milestones.length === 0 ? (
          <Card style={styles.emptyCard}>
            <AppText variant="sm" tone="muted" style={styles.textCenter}>
              No milestones defined yet. Click &quot;Add Stage&quot; to create payment stages.
            </AppText>
          </Card>
        ) : null}

        {milestones.map((milestone, idx) => (
          <Card
            key={milestone.id ?? idx}
            style={[
              styles.milestoneCard,
              milestone.current ? styles.milestoneCurrent : null,
            ]}>
            {/* Top row: Stage index, Name input, Trash button */}
            <View style={styles.stageTopRow}>
              <View style={styles.stageIndexBadge}>
                <AppText variant="xs" weight="bold" tone="muted">
                  {idx + 1}
                </AppText>
              </View>
              <View style={styles.flex1}>
                <TextField
                  value={milestone.name}
                  onChangeText={(text) => updateMilestone(idx, { name: text })}
                  placeholder="Stage name (e.g. Foundation, Roofing)"
                />
              </View>
              <IconButton
                variant="ghost"
                accessibilityLabel="Delete milestone"
                onPress={() => removeMilestone(idx)}>
                <Trash2 size={18} color={colors.destructive} strokeWidth={2} />
              </IconButton>
            </View>

            {/* Controls row: Amount, Current stage, Completed */}
            <View style={styles.controlsRow}>
              <View style={styles.amountCol}>
                <TextField
                  label="Amount (MWK)"
                  value={String(milestone.amount ?? 0)}
                  onChangeText={(text) => {
                    const clean = parseInt(text.replace(/[^0-9]/g, ''), 10) || 0;
                    updateMilestone(idx, { amount: clean });
                  }}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>

              <View style={styles.checkboxesCol}>
                <InlineCheckbox
                  label="Current Stage"
                  value={Boolean(milestone.current)}
                  onValueChange={(val) => updateMilestone(idx, { current: val })}
                />
                <InlineCheckbox
                  label="Completed"
                  value={Boolean(milestone.completed)}
                  onValueChange={(val) => updateMilestone(idx, { completed: val })}
                />
              </View>
            </View>

            {/* Stage Photos */}
            <View style={styles.photosSection}>
              <AppText variant="xs" weight="semibold" tone="muted" uppercase>
                Stage Photos ({milestone.photos?.length || 0})
              </AppText>

              <View style={styles.photosGrid}>
                {milestone.photos?.map((photo, pIdx) => (
                  <View key={pIdx} style={styles.photoThumb}>
                    <Image
                      source={{ uri: resolveMediaUrl(photo) ?? photo }}
                      style={styles.photoImg}
                      contentFit="cover"
                    />
                    <Pressable
                      style={styles.deletePhotoBtn}
                      onPress={() => handleRemovePhoto(idx, pIdx)}>
                      <Trash2 size={12} color="#ffffff" />
                    </Pressable>
                  </View>
                ))}

                <Pressable
                  style={styles.addPhotoBtn}
                  onPress={() => handleAddPhoto(idx)}
                  disabled={uploadingIndex === idx}>
                  {uploadingIndex === idx ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <>
                      <Camera size={18} color={colors.mutedForeground} strokeWidth={2} />
                      <AppText variant="xs" tone="muted">
                        Add Photo
                      </AppText>
                    </>
                  )}
                </Pressable>
              </View>
            </View>
          </Card>
        ))}

        <Button
          size="lg"
          onPress={handleSave}
          loading={isSaving}
          disabled={isSaving}
          icon={<Save size={18} color={colors.primaryForeground} />}>
          Save All Changes
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 16, paddingBottom: 40, gap: 16 },

  overviewCard: { gap: 12 },
  overviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  overviewTitleCol: { flex: 1, gap: 2 },
  progressContainer: { gap: 6, marginTop: 4 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  milestonesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  emptyCard: { padding: 24, alignItems: 'center' },
  textCenter: { textAlign: 'center' },

  milestoneCard: { gap: 14, backgroundColor: '#ffffff' },
  milestoneCurrent: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: '#fffdf9',
  },
  stageTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stageIndexBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex1: { flex: 1 },

  controlsRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  amountCol: { flex: 1 },
  checkboxesCol: { flex: 1, gap: 10, paddingTop: 18 },

  photosSection: { gap: 8, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
  photosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  photoThumb: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.muted,
  },
  photoImg: { width: '100%', height: '100%' },
  deletePhotoBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(220, 38, 38, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoBtn: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#fafafa',
  },
});

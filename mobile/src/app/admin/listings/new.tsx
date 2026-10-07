import { useState } from 'react';
import { Camera, Save, Trash2 } from 'lucide-react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SelectField } from '@/components/ui/select-field';
import { TextField } from '@/components/ui/text-field';
import { AppText } from '@/components/ui/text';
import { showToast } from '@/components/ui/toast';
import { colors, radius } from '@/constants/theme';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import * as api from '@/lib/api';

const PROPERTY_TYPES = [
  { label: 'Residential', value: 'Residential' },
  { label: 'Land', value: 'Land' },
  { label: 'Waterfront', value: 'Waterfront' },
  { label: 'Commercial', value: 'Commercial' },
] as const;

export default function NewPropertyScreen() {
  const router = useRouter();
  const ready = useAuthGuard('admin');

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState('Residential');
  const [location, setLocation] = useState('');
  const [beds, setBeds] = useState('');
  const [baths, setBaths] = useState('');
  const [sqft, setSqft] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePickImage = async () => {
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
      setLocalPreview(asset.uri);
      setIsUploading(true);

      const fileName = asset.fileName || `upload_${Date.now()}.jpg`;
      const mimeType = asset.mimeType || 'image/jpeg';

      const res = await api.uploadFile(asset.uri, fileName, mimeType);
      setImageUrl(res.url);
      showToast.success('Image uploaded successfully');
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreate = async () => {
    const cleanName = name.trim();
    const cleanLocation = location.trim();
    const numPrice = parseInt(price.replace(/[^0-9]/g, ''), 10);

    if (!cleanName || !cleanLocation || !numPrice) {
      showToast.error('Name, location, and a valid price are required');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createProperty({
        name: cleanName,
        location: cleanLocation,
        price: numPrice,
        type,
        beds: parseInt(beds, 10) || 0,
        baths: parseFloat(baths) || 0,
        sqft: parseInt(sqft, 10) || 0,
        description: description.trim(),
        image_url: imageUrl || undefined,
      });

      showToast.success('Property created successfully');
      router.replace('/admin/listings');
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : 'Failed to create property');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!ready) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.root}>
      <ScreenHeader
        title="New Property"
        subtitle="Add a listing"
        showBack
        right={
          <Button
            size="sm"
            onPress={handleCreate}
            loading={isSubmitting}
            disabled={isSubmitting || !name || !price || !location}
            icon={<Save size={16} color={colors.primaryForeground} />}>
            Create
          </Button>
        }
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card style={styles.formCard}>
          <AppText variant="base" weight="bold">
            Property Details
          </AppText>

          <TextField
            label="Property Name *"
            value={name}
            onChangeText={setName}
            placeholder="e.g. The Highlands Estate"
          />

          <View style={styles.row}>
            <View style={styles.flex1}>
              <TextField
                label="Price (MWK) *"
                value={price}
                onChangeText={setPrice}
                placeholder="e.g. 1200000"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.flex1}>
              <SelectField
                label="Property Type *"
                value={type}
                options={PROPERTY_TYPES}
                onValueChange={setType}
              />
            </View>
          </View>

          <TextField
            label="Location *"
            value={location}
            onChangeText={setLocation}
            placeholder="e.g. Area 43, Lilongwe"
          />

          <View style={styles.row}>
            <View style={styles.flex1}>
              <TextField
                label="Bedrooms"
                value={beds}
                onChangeText={setBeds}
                placeholder="4"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.flex1}>
              <TextField
                label="Bathrooms"
                value={baths}
                onChangeText={setBaths}
                placeholder="3.5"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.flex1}>
              <TextField
                label="Square Feet"
                value={sqft}
                onChangeText={setSqft}
                placeholder="3200"
                keyboardType="numeric"
              />
            </View>
          </View>

          <TextField
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Describe features, amenities, and location details..."
          />
        </Card>

        <Card style={styles.photoCard}>
          <AppText variant="base" weight="bold">
            Listing Photo
          </AppText>
          <AppText variant="xs" tone="muted">
            Upload a high quality photo of the property or lot
          </AppText>

          {localPreview || imageUrl ? (
            <View style={styles.previewContainer}>
              <Image
                source={{ uri: localPreview || imageUrl }}
                style={styles.previewImage}
                contentFit="cover"
              />
              {isUploading ? (
                <View style={styles.uploadOverlay}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <AppText variant="xs" tone="inverse" weight="semibold">
                    Uploading image...
                  </AppText>
                </View>
              ) : (
                <Pressable
                  style={styles.removeImageBtn}
                  onPress={() => {
                    setLocalPreview(null);
                    setImageUrl('');
                  }}>
                  <Trash2 size={16} color="#ffffff" />
                </Pressable>
              )}
            </View>
          ) : (
            <Pressable
              style={styles.uploadDropzone}
              onPress={handlePickImage}
              disabled={isUploading}>
              <View style={styles.uploadIconCircle}>
                <Camera size={24} color={colors.primary} strokeWidth={2} />
              </View>
              <AppText variant="sm" weight="semibold">
                Select Photo from Library
              </AppText>
              <AppText variant="xs" tone="muted">
                JPG, PNG, or WEBP up to 10MB
              </AppText>
            </Pressable>
          )}

          {!imageUrl && localPreview && !isUploading ? (
            <Button variant="secondary" size="sm" onPress={handlePickImage}>
              Change Photo
            </Button>
          ) : null}
        </Card>

        <Button
          size="lg"
          onPress={handleCreate}
          loading={isSubmitting}
          disabled={isSubmitting || !name || !price || !location}
          icon={<Save size={18} color={colors.primaryForeground} />}>
          Create Property Listing
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 16, paddingBottom: 40, gap: 16 },
  formCard: { gap: 14 },
  row: { flexDirection: 'row', gap: 12 },
  flex1: { flex: 1 },

  photoCard: { gap: 12 },
  previewContainer: {
    height: 180,
    width: '100%',
    borderRadius: radius.md,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.muted,
  },
  previewImage: { width: '100%', height: '100%' },
  uploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(220, 38, 38, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadDropzone: {
    height: 150,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#fafafa',
  },
  uploadIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fdf1d7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
});

import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useAppStore } from '../src/store/appStore';
import { getClient } from '../src/core/network/apiClient';
import { useTheme } from '../src/theme/ThemeProvider';
import { getColors } from '../src/theme/colors';
import { useRouter } from 'expo-router';

export default function ModelPickerPage() {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const router = useRouter();

  useEffect(() => { loadProviders(); }, []);

  async function loadProviders() {
    try {
      const client = getClient();
      const res = await client.provider.list();
      const providerData = res.data as { all: any[]; default: any; connected: string[] };
      const allProviders = providerData?.all || [];
      const allModels = allProviders.flatMap((p: any) =>
        Object.entries(p.models || {}).map(([modelId, m]: [string, any]) => ({
          ...(typeof m === 'object' ? m : {}),
          id: modelId,
          name: (m as any)?.name || modelId,
          providerId: p.id,
        }))
      );
      setModels(allModels);
    } catch (e) {
      console.error('Failed to load models:', e);
    } finally {
      setLoading(false);
    }
  }

  function selectModel(model: any) {
    router.back();
  }

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={models}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.item, { borderBottomColor: colors.border }]} onPress={() => selectModel(item)}>
            <Text style={{ color: colors.text }}>{item.name}</Text>
            <Text style={{ color: colors.textSecondary }}>{item.providerId}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  list: { gap: 8 },
  item: { padding: 12, borderBottomWidth: 1 },
});

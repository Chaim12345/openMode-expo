import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useAppStore } from '../src/store/appStore';
import { getClient } from '../src/core/network/apiClient';
import { useTheme } from '../src/theme/ThemeProvider';
import { getColors } from '../src/theme/colors';
import { useRouter } from 'expo-router';

export default function ServerStatusPage() {
  const [servers, setServers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const router = useRouter();

  useEffect(() => { loadStatus(); }, []);

  async function loadStatus() {
    try {
      const client = getClient();
      // No client.server namespace — use fetch for health check
      const baseUrl = (client as any)._options?.baseUrl || 'http://137.131.63.155:4096';
      const res = await fetch(baseUrl);
      const data = await res.json();
      setServers(Array.isArray(data) ? data : [{ name: 'OpenCode Server', status: res.ok ? 'Connected' : 'Error', ...data }]);
    } catch (e) {
      console.error('Failed to load server status:', e);
    } finally {
      setLoading(false);
    }
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
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: colors.primary }}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Server Status</Text>
      </View>

      <FlatList
        data={servers}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={{ color: colors.text, fontWeight: '600' }}>{item.name || 'Server'}</Text>
            <Text style={{ color: colors.textSecondary }}>Status: {item.status || 'Unknown'}</Text>
          </View>
        )}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '600' },
  list: { gap: 8 },
  card: { padding: 12, borderRadius: 8, borderWidth: 1 },
});

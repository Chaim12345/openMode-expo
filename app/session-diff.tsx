import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { getClient } from '../src/core/network/apiClient';
import { useTheme } from '../src/theme/ThemeProvider';
import { getColors } from '../src/theme/colors';

export default function SessionDiffPage() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const [diff, setDiff] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();
  const colors = getColors(isDark);

  useEffect(() => { loadDiff(); }, [sessionId]);

  async function loadDiff() {
    try {
      const client = getClient();
      const res = await client.session.diff({ path: { id: sessionId } });
      setDiff(res.data);
    } catch (e) {
      console.error('Failed to load diff:', e);
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
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Session Diff</Text>
      {diff?.diffs?.map((d: any, i: number) => (
        <View key={i} style={[styles.diffBlock, { borderColor: colors.border }]}>
          <Text style={{ color: colors.text, fontWeight: '600' }}>{d.file}</Text>
          <Text style={{ color: colors.textSecondary }}>++{d.additions} --{d.deletions}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  diffBlock: { padding: 12, borderWidth: 1, borderRadius: 8, marginBottom: 8 },
});

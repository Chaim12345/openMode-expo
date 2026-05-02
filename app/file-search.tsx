import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useEffect, useState } from 'react';
import { useAppStore } from '../src/store/appStore';
import { getClient } from '../src/core/network/apiClient';
import { useTheme } from '../src/theme/ThemeProvider';
import { getColors } from '../src/theme/colors';
import { useRouter } from 'expo-router';

export default function FileSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const router = useRouter();

  async function searchFiles() {
    if (!query.trim()) return;
    setLoading(true);
    try {
        const client = getClient();
        const res = await client.find.files({ query: { query } });
        setResults(res.data || []);
    } catch (e) {
      console.error('Search failed:', e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: colors.primary }}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>File Search</Text>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={[styles.input, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border }]}
          value={query}
          onChangeText={setQuery}
          placeholder="Search files..."
          placeholderTextColor={colors.textSecondary}
          onSubmitEditing={searchFiles}
        />
        <TouchableOpacity
          style={[styles.searchBtn, { backgroundColor: colors.primary }]}
          onPress={searchFiles}
          disabled={loading}
        >
          <Text style={styles.btnText}>{loading ? '...' : 'Search'}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={results}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.item, { borderBottomColor: colors.border }]}
              onPress={() => router.push(`/code-viewer?path=${encodeURIComponent(item.path)}`)}
            >
              <Text style={{ color: colors.text }}>{item.name}</Text>
              <Text style={{ color: colors.textSecondary }}>{item.path}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.path}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '600' },
  searchRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  input: { flex: 1, borderWidth: 1, borderRadius: 8, padding: 8 },
  searchBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: '600' },
  loader: { marginTop: 20 },
  list: { gap: 8 },
  item: { padding: 12, borderBottomWidth: 1 },
});

import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { getClient } from '../src/core/network/apiClient';
import { useTheme } from '../src/theme/ThemeProvider';
import { getColors } from '../src/theme/colors';

export default function CodeViewerPage() {
  const { path } = useLocalSearchParams<{ path?: string }>();
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();
  const colors = getColors(isDark);

  useEffect(() => {
    if (path) loadFile();
  }, [path]);

  async function loadFile() {
    if (!path) return;
    try {
      const client = getClient();
      const res = await client.file.read({ query: { path } });
      setContent(res.data?.content || 'Unable to load file');
    } catch (e) {
      setContent('Error loading file: ' + e);
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
        <Text style={[styles.title, { color: colors.text }]}>{path?.split('/').pop()}</Text>
      </View>
      <ScrollView style={styles.content}>
        <Text style={[styles.code, { color: colors.text }]}>{content || 'No content'}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 12,
  },
  code: {
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 18,
  },
});

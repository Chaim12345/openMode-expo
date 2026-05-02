import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useAppStore } from '../src/store/appStore';
import { getClient } from '../src/core/network/apiClient';
import { useTheme } from '../src/theme/ThemeProvider';
import { getColors } from '../src/theme/colors';
import { useRouter } from 'expo-router';

export default function FileBrowserPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [path, setPath] = useState('.');
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const router = useRouter();

  useEffect(() => {
    loadFiles();
  }, [path]);

  async function loadFiles() {
    try {
      const client = getClient();
      const res = await client.file.list({ query: { path } });
      setFiles(res.data || []);
    } catch (e) {
      console.error('Failed to load files:', e);
    } finally {
      setLoading(false);
    }
  }

  function goBack() {
    const parts = path.split('/');
    if (parts.length > 1) {
      parts.pop();
      setPath(parts.join('/') || '.');
    }
  }

  function openFile(filePath: string) {
    router.push(`/code-viewer?path=${encodeURIComponent(filePath)}`);
  }

  function enterDir(dirPath: string) {
    setPath(dirPath);
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
        <TouchableOpacity onPress={goBack} disabled={path === '.'}>
          <Text style={{ color: path === '.' ? colors.textSecondary : colors.primary }}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.path, { color: colors.text }]}>{path}</Text>
      </View>

      <FlatList
        data={files}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.item, { borderBottomColor: colors.border }]}
            onPress={() => item.type === 'dir' ? enterDir(item.path) : openFile(item.path)}
          >
            <Text style={{ color: colors.text }}>
              {item.type === 'dir' ? '📁 ' : '📄 '}{item.name}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.path}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  path: {
    fontSize: 14,
    flex: 1,
  },
  item: {
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

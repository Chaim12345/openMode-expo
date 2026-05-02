import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme/ThemeProvider';
import { getColors } from '../../src/theme/colors';
import { listSessions, createSession, deleteSession, shareSession, unshareSession, type Session } from '../../src/core/network/apiClient';

export default function SessionsPage() {
  const router = useRouter();
  const { isDark } = useTheme();
  const colors = getColors(isDark);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadSessions(); }, []);

  async function loadSessions() {
    try {
      const data = await listSessions();
      setSessions(data);
    } catch (e) {
      console.error('Failed to load sessions:', e);
    } finally {
      setLoading(false);
    }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSessions();
    setRefreshing(false);
  }, []);

  async function handleCreate() {
    try {
      const session = await createSession({ title: 'New Chat' });
      router.push(`/chat/${session.id}`);
    } catch (e) {
      Alert.alert('Error', 'Failed to create session');
    }
  }

  async function handleDelete(id: string) {
    Alert.alert('Delete Session', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await deleteSession(id);
            setSessions((prev) => prev.filter((s) => s.id !== id));
          } catch (e) {
            Alert.alert('Error', 'Failed to delete session');
          }
        },
      },
    ]);
  }

  async function handleShare(id: string) {
    try {
      const result = await shareSession(id);
      Alert.alert('Shared', `Session shared: ${(result as any)?.sharePath || 'OK'}`);
      await loadSessions();
    } catch (e) {
      Alert.alert('Error', 'Failed to share session');
    }
  }

  async function handleUnshare(id: string) {
    try {
      await unshareSession(id);
      Alert.alert('Unshared', 'Session is no longer shared');
      await loadSessions();
    } catch (e) {
      Alert.alert('Error', 'Failed to unshare session');
    }
  }

  function renderSession({ item }: { item: Session }) {
    const sessionAny = item as any;
    const isShared = !!sessionAny.sharePath;

    return (
      <View style={[styles.sessionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TouchableOpacity
          style={styles.sessionContent}
          onPress={() => router.push(`/chat/${item.id}`)}
        >
          <Text style={[styles.sessionTitle, { color: colors.text }]} numberOfLines={1}>
            {item.title || 'Untitled'}
          </Text>
          <Text style={[styles.sessionId, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.id}
          </Text>
          {isShared && (
            <Text style={{ color: colors.primary, fontSize: 11, marginTop: 2 }}>
              🌐 Shared
            </Text>
          )}
        </TouchableOpacity>
        <View style={styles.sessionActions}>
          <TouchableOpacity onPress={() => handleShare(item.id)} style={styles.actionBtn}>
            <Text style={{ color: colors.primary, fontSize: 16 }}>🔗</Text>
          </TouchableOpacity>
          {isShared && (
            <TouchableOpacity onPress={() => handleUnshare(item.id)} style={styles.actionBtn}>
              <Text style={{ color: colors.textSecondary, fontSize: 16 }}>🔒</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
            <Text style={{ color: colors.error, fontSize: 16 }}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={sessions}
        renderItem={renderSession}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={
          <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>
            No sessions yet. Create one!
          </Text>
        }
      />
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={handleCreate}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 12, paddingBottom: 80 },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  sessionContent: { flex: 1 },
  sessionTitle: { fontSize: 16, fontWeight: '500' },
  sessionId: { fontSize: 11, marginTop: 2, fontFamily: 'Courier' },
  sessionActions: { flexDirection: 'row', gap: 4 },
  actionBtn: { padding: 6 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  fabText: { color: '#fff', fontSize: 28, fontWeight: '600' },
});

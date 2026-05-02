import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../src/store/appStore';
import { useTheme } from '../../src/theme/ThemeProvider';
import { getColors } from '../../src/theme/colors';
import { checkHealth, listSessions, createSession, type Session } from '../../src/core/network/apiClient';

export default function HomePage() {
  const router = useRouter();
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const serverHost = useAppStore((s) => s.serverHost);
  const serverPort = useAppStore((s) => s.serverPort);
  const isConnected = useAppStore((s) => s.isConnected);
  const setConnected = useAppStore((s) => s.setConnected);

  const [health, setHealth] = useState<any>(null);
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [healthResult, sessions] = await Promise.all([
        checkHealth(),
        listSessions(),
      ]);
      setHealth(healthResult.data);
      setConnected(healthResult.ok);
      setRecentSessions(sessions.slice(0, 5));
    } catch (e) {
      console.error('Failed to load home data:', e);
      setConnected(false);
    } finally {
      setLoading(false);
    }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  async function handleNewSession() {
    try {
      const session = await createSession({ title: 'New Chat' });
      router.push(`/chat/${session.id}`);
    } catch (e) {
      console.error('Failed to create session:', e);
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Server Status</Text>
          <View style={[styles.statusDot, { backgroundColor: isConnected ? colors.success : colors.error }]} />
        </View>
        <Text style={[styles.cardBody, { color: colors.textSecondary }]}>
          {serverHost}:{serverPort}
        </Text>
        {health && (
          <Text style={[styles.cardDetail, { color: colors.textSecondary }]}>
            {JSON.stringify(health).slice(0, 100)}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handleNewSession}
          >
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={[styles.actionLabel, { color: colors.text }]}>New Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/sessions' as any)}
          >
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={[styles.actionLabel, { color: colors.text }]}>Sessions</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/model-picker')}
          >
            <Text style={styles.actionIcon}>🤖</Text>
            <Text style={[styles.actionLabel, { color: colors.text }]}>Models</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/settings/server')}
          >
            <Text style={styles.actionIcon}>⚙️</Text>
            <Text style={[styles.actionLabel, { color: colors.text }]}>Server</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/file-browser')}
          >
            <Text style={styles.actionIcon}>📁</Text>
            <Text style={[styles.actionLabel, { color: colors.text }]}>Files</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/server-status')}
          >
            <Text style={styles.actionIcon}>🟢</Text>
            <Text style={[styles.actionLabel, { color: colors.text }]}>Health</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Sessions</Text>
        {recentSessions.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No sessions yet</Text>
        ) : (
          recentSessions.map((session) => (
            <TouchableOpacity
              key={session.id}
              style={[styles.sessionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push(`/chat/${session.id}`)}
            >
              <Text style={[styles.sessionTitle, { color: colors.text }]} numberOfLines={1}>
                {session.title || 'Untitled'}
              </Text>
              <Text style={[styles.sessionId, { color: colors.textSecondary }]} numberOfLines={1}>
                {session.id}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 16 },
  card: { padding: 16, borderRadius: 12, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: 17, fontWeight: '600' },
  cardBody: { fontSize: 14, marginTop: 4, fontFamily: 'Courier' },
  cardDetail: { fontSize: 12, marginTop: 4 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 20, fontWeight: '700' },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionCard: {
    width: '31%', aspectRatio: 1, borderRadius: 12, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', padding: 8,
  },
  actionIcon: { fontSize: 28 },
  actionLabel: { fontSize: 12, fontWeight: '500', marginTop: 4 },
  sessionCard: { padding: 12, borderRadius: 8, borderWidth: 1, marginBottom: 6 },
  sessionTitle: { fontSize: 15, fontWeight: '500' },
  sessionId: { fontSize: 11, marginTop: 2, fontFamily: 'Courier' },
  emptyText: { fontSize: 14, textAlign: 'center', marginTop: 12 },
});

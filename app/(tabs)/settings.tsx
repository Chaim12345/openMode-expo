import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../src/store/appStore';
import { useTheme } from '../../src/theme/ThemeProvider';
import { getColors } from '../../src/theme/colors';

export default function SettingsPage() {
  const router = useRouter();
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const themeMode = useAppStore((s) => s.themeMode);
  const setThemeMode = useAppStore((s) => s.setThemeMode);
  const serverHost = useAppStore((s) => s.serverHost);
  const serverPort = useAppStore((s) => s.serverPort);

  const themeOptions: Array<{ label: string; value: 'light' | 'dark' | 'system' }> = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'System', value: 'system' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
        <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {themeOptions.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.themeOption,
                themeMode === opt.value && { backgroundColor: colors.primary },
                { borderColor: colors.border },
              ]}
              onPress={() => setThemeMode(opt.value)}
            >
              <Text style={{ color: themeMode === opt.value ? '#fff' : colors.text, fontWeight: '500' }}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Server</Text>
        <TouchableOpacity
          style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push('/settings/server')}
        >
          <Text style={[styles.cardLabel, { color: colors.text }]}>Connection</Text>
          <Text style={[styles.cardValue, { color: colors.textSecondary }]}>
            {serverHost}:{serverPort}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Tools</Text>

        <TouchableOpacity
          style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push('/file-browser')}
        >
          <Text style={[styles.cardLabel, { color: colors.text }]}>File Browser</Text>
          <Text style={{ color: colors.primary, fontSize: 16 }}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push('/file-search')}
        >
          <Text style={[styles.cardLabel, { color: colors.text }]}>File Search</Text>
          <Text style={{ color: colors.primary, fontSize: 16 }}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push('/model-picker')}
        >
          <Text style={[styles.cardLabel, { color: colors.text }]}>Model Picker</Text>
          <Text style={{ color: colors.primary, fontSize: 16 }}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push('/server-status')}
        >
          <Text style={[styles.cardLabel, { color: colors.text }]}>Server Health</Text>
          <Text style={{ color: colors.primary, fontSize: 16 }}>→</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
        <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardLabel, { color: colors.text }]}>openMode Expo</Text>
          <Text style={[styles.cardValue, { color: colors.textSecondary }]}>v1.0.0</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 16 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 20, fontWeight: '700' },
  row: { flexDirection: 'row', borderRadius: 10, borderWidth: 1, overflow: 'hidden' },
  themeOption: {
    flex: 1, paddingVertical: 10, alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5,
  },
  settingsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 6,
  },
  cardLabel: { fontSize: 15, fontWeight: '500' },
  cardValue: { fontSize: 13, fontFamily: 'Courier' },
});

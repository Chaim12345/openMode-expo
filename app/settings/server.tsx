import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Switch, Alert, ActivityIndicator } from 'react-native';
import { useAppStore } from '../../src/store/appStore';
import { storageService } from '../../src/core/storage/storageService';
import { getClient } from '../../src/core/network/apiClient';
import { useTheme } from '../../src/theme/ThemeProvider';
import { getColors, type ThemeColors } from '../../src/theme/colors';

export default function ServerSettingsPage() {
  const serverHost = useAppStore((s) => s.serverHost);
  const serverPort = useAppStore((s) => s.serverPort);
  const setServerConfig = useAppStore((s) => s.setServerConfig);
  const themeMode = useAppStore((s) => s.setThemeMode);
  const setBasicAuth = useAppStore((s) => s.setBasicAuth);
  const basicAuthEnabled = useAppStore((s) => s.basicAuthEnabled);
  const basicAuthUsername = useAppStore((s) => s.basicAuthUsername);
  const basicAuthPassword = useAppStore((s) => s.basicAuthPassword);

  const { isDark } = useTheme();
  const colors = getColors(isDark);

  const [host, setHost] = useState(serverHost);
  const [port, setPort] = useState(String(serverPort));
  const [testing, setTesting] = useState(false);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [basicEnabled, setBasicEnabled] = useState(basicAuthEnabled);
  const [username, setUsername] = useState(basicAuthUsername || '');
  const [password, setPassword] = useState(basicAuthPassword || '');

  const handleTest = async () => {
    setTesting(true);
    setConnected(null);
    try {
      const client = getClient();
      const testUrl = 'http://' + host + ':' + port;
      const response = await fetch(testUrl, { method: 'GET', signal: AbortSignal.timeout(5000) });
      setConnected(response.ok);
      if (response.ok) {
        Alert.alert('Success', 'Connected to server!');
      } else {
        Alert.alert('Failed', 'Server returned ' + response.status);
      }
    } catch (e) {
      setConnected(false);
      Alert.alert('Connection Failed', 'Could not connect to server. Check host and port.');
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    const portNum = parseInt(port, 10);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      Alert.alert('Invalid Port', 'Please enter a valid port (1-65535)');
      return;
    }
    setServerConfig(host, portNum);
    setBasicAuth(basicEnabled, basicEnabled ? username : undefined, basicEnabled ? password : undefined);
    Alert.alert('Saved', 'Server settings saved.');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.section, { borderBottomColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Server Configuration</Text>

        <Text style={[styles.label, { color: colors.textSecondary }]}>Host</Text>
        <TextInput
          style={[styles.input, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border }]}
          value={host}
          onChangeText={setHost}
          placeholder="chaim12345.duckdns.org"
          placeholderTextColor={colors.textSecondary}
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>Port</Text>
        <TextInput
          style={[styles.input, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border }]}
          value={port}
          onChangeText={setPort}
          placeholder="4097"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
        />

        <View style={styles.testRow}>
          <TouchableOpacity
            style={[styles.testButton, { backgroundColor: colors.primary }]}
            onPress={handleTest}
            disabled={testing}
          >
            {testing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.testButtonText}>Test Connection</Text>
            )}
          </TouchableOpacity>

          {connected !== null && (
            <View style={[styles.statusBadge, { backgroundColor: connected ? '#34C759' : '#FF3B30' }]}>
              <Text style={styles.statusText}>{connected ? 'Connected' : 'Failed'}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={[styles.section, { borderBottomColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Basic Authentication</Text>
        <View style={styles.switchRow}>
          <Text style={[styles.label, { color: colors.text }]}>Enable Basic Auth</Text>
          <Switch
            value={basicEnabled}
            onValueChange={setBasicEnabled}
            trackColor={{ false: '#767577', true: colors.primary }}
          />
        </View>

        {basicEnabled && (
          <>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Username</Text>
            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border }]}
              value={username}
              onChangeText={setUsername}
              placeholder="opencode"
              placeholderTextColor={colors.textSecondary}
            />
            <Text style={[styles.label, { color: colors.textSecondary }]}>Password</Text>
            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border }]}
              value={password}
              onChangeText={setPassword}
              placeholder="password"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry={true}
            />
          </>
        )}
      </View>

      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: colors.primary }]}
        onPress={handleSave}
      >
        <Text style={styles.saveButtonText}>Save Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 12,
  },
  testRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  testButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  testButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

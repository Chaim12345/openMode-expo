import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Modal } from 'react-native';
import { useEffect, useState } from 'react';
import { useTheme } from '../src/theme/ThemeProvider';
import { getColors } from '../src/theme/colors';

interface CommandPaletteProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (command: string) => void;
}

const COMMANDS = [
  { name: '/model', description: 'Switch AI model' },
  { name: '/theme', description: 'Change theme (light/dark/system)' },
  { name: '/compact', description: 'Compact session history' },
  { name: '/share', description: 'Share session' },
  { name: '/fork', description: 'Fork session at current message' },
  { name: '/init', description: 'Initialize project with AGENTS.md' },
  { name: '/summarize', description: 'Summarize session' },
  { name: '/help', description: 'Show help dialog' },
  { name: '/permissions', description: 'Manage permissions' },
  { name: '/agents', description: 'Switch AI agent' },
];

export default function CommandPalette({ visible, onClose, onSelect }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const { isDark } = useTheme();
  const colors = getColors(isDark);

  const filtered = COMMANDS.filter(
    (cmd) =>
      cmd.name.includes(query.toLowerCase()) ||
      cmd.description.toLowerCase().includes(query.toLowerCase())
  );

  function handleSelect(command: string) {
    onSelect(command);
    onClose();
    setQuery('');
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.text, borderBottomColor: colors.border }]}
            value={query}
            onChangeText={setQuery}
            placeholder="Type a command..."
            placeholderTextColor={colors.textSecondary}
            autoFocus
          />
          <FlatList
            data={filtered}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.item, { borderBottomColor: colors.border }]}
                onPress={() => handleSelect(item.name)}
              >
                <Text style={{ color: colors.primary, fontWeight: '600' }}>{item.name}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{item.description}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.name}
            style={styles.list}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    maxHeight: 400,
  },
  input: {
    borderBottomWidth: 1,
    paddingVertical: 8,
    fontSize: 15,
    marginBottom: 8,
  },
  list: {
    flex: 1,
  },
  item: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

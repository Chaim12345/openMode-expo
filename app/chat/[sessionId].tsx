import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppStore } from '../../src/store/appStore';
import { getSession, getMessages, sendMessage, subscribeEvents, abortSession, respondPermission, sendCommand, summarizeSession, shareSession, forkSession, type Message, type Session } from '../../src/core/network/apiClient';
import { useTheme } from '../../src/theme/ThemeProvider';
import { getColors } from '../../src/theme/colors';
import Markdown from 'react-native-markdown-display';
import CommandPalette from '../command-palette';

interface PermissionRequest {
  id: string;
  sessionID: string;
  messageID?: string;
  title: string;
  type: string;
  metadata?: any;
}

export default function ChatPage() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const router = useRouter();
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const setThemeMode = useAppStore((s) => s.setThemeMode);

  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [commandPaletteVisible, setCommandPaletteVisible] = useState(false);
  const [permissions, setPermissions] = useState<PermissionRequest[]>([]);
  const [sessionBusy, setSessionBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadSession();
    const ac = new AbortController();
    abortRef.current = ac;
    startEventStream(ac);
    return () => {
      ac.abort();
      abortRef.current = null;
    };
  }, [sessionId]);

  async function loadSession() {
    try {
      const [sessionData, messagesData] = await Promise.all([
        getSession(sessionId),
        getMessages(sessionId),
      ]);
      setSession(sessionData as Session);
      setMessages(messagesData as Message[]);
    } catch (e) {
      console.error('Failed to load session:', e);
    } finally {
      setLoading(false);
    }
  }

  async function startEventStream(ac: AbortController) {
    try {
      const result = await subscribeEvents();
      if (!result?.stream) return;
      for await (const event of result.stream) {
        if (ac.signal.aborted) break;
        handleEvent(event);
      }
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        console.error('SSE stream error:', e);
      }
    }
  }

  function handleEvent(event: any) {
    const type = event.type;
    const props = event.properties;

    switch (type) {
      case 'message.updated':
        if (props?.info?.sessionID === sessionId) {
          setMessages(prev => {
            const idx = prev.findIndex(m => m.id === props.info.id);
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = props.info as Message;
              return next;
            }
            return [...prev, props.info as Message];
          });
        }
        break;

      case 'message.part.updated':
        setMessages(prev => prev.map(msg => {
          if (msg.id !== props?.part?.messageID) return msg;
          const msgAny = msg as any;
          const parts = [...(msgAny.parts || [])];
          const partIdx = parts.findIndex((p: any) => p.id === props.part.id);
          if (partIdx >= 0) {
            parts[partIdx] = props.part;
          } else {
            parts.push(props.part);
          }
          return { ...msg, parts } as unknown as Message;
        }));
        break;

      case 'message.part.removed':
        setMessages(prev => prev.map(msg => {
          if (msg.id !== props?.part?.messageID) return msg;
          const msgAny = msg as any;
          const parts = (msgAny.parts || []).filter((p: any) => p.id !== props.part.id);
          return { ...msg, parts } as unknown as Message;
        }));
        break;

      case 'message.removed':
        if (props?.info?.sessionID === sessionId) {
          setMessages(prev => prev.filter(m => m.id !== props.info.id));
        }
        break;

      case 'permission.updated':
        setPermissions(prev => {
          const filtered = prev.filter(p => p.id !== props?.id);
          if (props?.title) {
            filtered.push({
              id: props.id,
              sessionID: props.sessionID,
              messageID: props.messageID,
              title: props.title,
              type: props.type,
              metadata: props.metadata,
            });
          }
          return filtered;
        });
        break;

      case 'permission.replied':
        setPermissions(prev => prev.filter(p => p.id !== props?.id));
        break;

      case 'session.status':
        if (props?.sessionID === sessionId) {
          setSessionBusy(props.status?.type === 'busy');
        }
        break;

      case 'session.idle':
        if (props?.sessionID === sessionId) {
          setSessionBusy(false);
        }
        break;

      default:
        break;
    }
  }

  async function handleSend() {
    if (!input.trim()) return;
    const content = input;
    setInput('');
    setSending(true);

    try {
      if (content.startsWith('/')) {
        await sendCommand(sessionId, content);
      } else {
        await sendMessage(sessionId, content);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to send message');
      setInput(content);
    } finally {
      setSending(false);
    }
  }

  async function handleAbort() {
    try {
      await abortSession(sessionId);
      setSessionBusy(false);
    } catch (e) {
      console.error('Failed to abort:', e);
    }
  }

  async function handlePermissionResponse(permissionId: string, response: 'allow' | 'deny') {
    try {
      await respondPermission(sessionId, permissionId, { response });
      setPermissions(prev => prev.filter(p => p.id !== permissionId));
    } catch (e) {
      console.error('Failed to respond to permission:', e);
    }
  }

  async function handleCommand(command: string) {
    switch (command) {
      case '/model':
        router.push('/model-picker');
        break;
      case '/compact':
      case '/summarize':
        try { await summarizeSession(sessionId); } catch (e) { console.error(e); }
        break;
      case '/share':
        try {
          const shared = await shareSession(sessionId);
          Alert.alert('Shared', `Session shared: ${(shared as any)?.sharePath || 'OK'}`);
        } catch (e) { Alert.alert('Error', 'Failed to share session'); }
        break;
      case '/fork':
        try {
          const lastMsg = messages[messages.length - 1];
          if (lastMsg) {
            const forked = await forkSession(sessionId, lastMsg.id);
            router.push(`/chat/${(forked as any)?.id || sessionId}`);
          }
        } catch (e) { Alert.alert('Error', 'Failed to fork session'); }
        break;
      case '/theme':
        setThemeMode(isDark ? 'light' : 'dark');
        break;
      case '/abort':
        await handleAbort();
        break;
      default:
        try { await sendCommand(sessionId, command); } catch (e) { console.error(e); }
        break;
    }
  }

  function renderPart(part: any, colors: any) {
    switch (part.type) {
      case 'text':
        return (
          <Markdown key={part.id} style={markdownStyles(colors)}>
            {part.text || ''}
          </Markdown>
        );

      case 'tool': {
        const toolState = part.state?.type || part.state || 'pending';
        const toolName = part.tool || 'unknown';
        const stateLabel = typeof toolState === 'string' ? toolState : JSON.stringify(toolState);
        const stateColor = stateLabel === 'completed' ? '#34C759' : stateLabel === 'pending' ? '#FF9500' : stateLabel === 'error' ? '#FF3B30' : colors.textSecondary;
        return (
          <View key={part.id} style={[styles.toolCall, { borderLeftColor: stateColor, backgroundColor: colors.card }]}>
            <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 13 }}>🔧 {toolName}</Text>
            <Text style={{ color: stateColor, fontSize: 11 }}>{stateLabel}</Text>
            {part.state?.title ? <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>{part.state.title}</Text> : null}
          </View>
        );
      }

      case 'reasoning':
        return (
          <View key={part.id} style={[styles.reasoningBox, { backgroundColor: colors.card, borderLeftColor: colors.textSecondary }]}>
            <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '600' }}>💭 Reasoning</Text>
            <Markdown style={markdownStyles(colors)}>{part.text || ''}</Markdown>
          </View>
        );

      case 'step-start':
        return <Text key={part.id} style={{ color: colors.textSecondary, fontSize: 12, fontStyle: 'italic' }}>▶ Step started</Text>;

      case 'step-finish':
        return <Text key={part.id} style={{ color: colors.textSecondary, fontSize: 12, fontStyle: 'italic' }}>■ Step finished</Text>;

      case 'file':
        return (
          <View key={part.id} style={[styles.filePart, { backgroundColor: colors.card }]}>
            <Text style={{ color: colors.primary, fontSize: 13 }}>📄 {(part as any).path || 'File'}</Text>
          </View>
        );

      case 'patch':
        return (
          <View key={part.id} style={[styles.patchPart, { backgroundColor: colors.card }]}>
            <Text style={{ color: colors.text, fontFamily: 'Courier', fontSize: 12 }}>{(part as any).text || ''}</Text>
          </View>
        );

      default:
        return null;
    }
  }

  function renderMessage({ item }: { item: Message }) {
    const isUser = item.role === 'user';
    const msgAny = item as any;
    const parts: any[] = msgAny.parts || [];
    const summaryBody = msgAny.summary?.body;
    const summaryDiffs = msgAny.summary?.diffs;

    return (
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={styles.role}>{isUser ? 'You' : 'Assistant'}</Text>
        <View style={styles.messageBody}>
          {parts.length > 0 ? (
            parts.map((part: any) => renderPart(part, colors))
          ) : summaryBody ? (
            <Markdown style={markdownStyles(colors)}>{summaryBody}</Markdown>
          ) : (
            <Text style={[styles.fallbackText, { color: colors.text }]}>
              {isUser ? (msgAny.content || '') : '...'}
            </Text>
          )}

          {summaryDiffs && summaryDiffs.length > 0 && (
            <View style={[styles.diffsBox, { backgroundColor: colors.card }]}>
              <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '600' }}>Changes:</Text>
              {summaryDiffs.map((diff: any, i: number) => (
                <Text key={i} style={{ color: colors.textSecondary, fontSize: 11, fontFamily: 'Courier' }}>
                  {diff.path || diff.file || `diff ${i + 1}`}
                </Text>
              ))}
            </View>
          )}
        </View>

        {!isUser && msgAny.error && (
          <Text style={styles.errorText}>{msgAny.error.data?.message || 'An error occurred'}</Text>
        )}
      </View>
    );
  }

  function renderPermission({ item }: { item: PermissionRequest }) {
    return (
      <View style={[styles.permissionCard, { backgroundColor: '#FFF3CD', borderColor: '#FFC107' }]}>
        <Text style={{ color: '#856404', fontWeight: '600', fontSize: 14 }}>{item.title}</Text>
        {item.metadata?.tool ? <Text style={{ color: '#856404', fontSize: 12 }}>Tool: {item.metadata.tool}</Text> : null}
        {item.metadata?.command ? <Text style={{ color: '#856404', fontSize: 12, fontFamily: 'Courier' }}>{item.metadata.command}</Text> : null}
        <View style={styles.permissionActions}>
          <TouchableOpacity
            style={[styles.permBtn, { backgroundColor: '#34C759' }]}
            onPress={() => handlePermissionResponse(item.id, 'allow')}
          >
            <Text style={styles.permBtnText}>Allow</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.permBtn, { backgroundColor: '#FF3B30' }]}
            onPress={() => handlePermissionResponse(item.id, 'deny')}
          >
            <Text style={styles.permBtnText}>Deny</Text>
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
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: colors.primary }}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {session?.title || 'Chat'}
        </Text>
        <TouchableOpacity onPress={() => setCommandPaletteVisible(true)}>
          <Text style={{ color: colors.primary }}>⌘</Text>
        </TouchableOpacity>
        {sessionBusy && (
          <TouchableOpacity onPress={handleAbort}>
            <Text style={{ color: '#FF3B30', fontWeight: '600', fontSize: 12 }}>■ Stop</Text>
          </TouchableOpacity>
        )}
      </View>

      {permissions.length > 0 && (
        <FlatList
          data={permissions}
          renderItem={renderPermission}
          keyExtractor={(item) => item.id}
          style={styles.permissionList}
        />
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListEmptyComponent={
          <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>
            No messages yet. Start the conversation!
          </Text>
        }
      />

      <View style={[styles.inputContainer, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
        <TextInput
          style={[styles.input, { color: colors.text, backgroundColor: colors.card }]}
          value={input}
          onChangeText={setInput}
          placeholder={sessionBusy ? 'Waiting for response...' : 'Type a message or /command...'}
          placeholderTextColor={colors.textSecondary}
          multiline
          editable={!sending}
        />
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: sessionBusy ? '#FF3B30' : colors.primary }]}
          onPress={sessionBusy ? handleAbort : handleSend}
          disabled={!sessionBusy && (sending || !input.trim())}
        >
          <Text style={styles.sendButtonText}>{sessionBusy ? '■' : sending ? '...' : '▶'}</Text>
        </TouchableOpacity>
      </View>

      <CommandPalette
        visible={commandPaletteVisible}
        onClose={() => setCommandPaletteVisible(false)}
        onSelect={handleCommand}
      />
    </KeyboardAvoidingView>
  );
}

function markdownStyles(colors: any) {
  return {
    body: { color: colors.text },
    heading1: { color: colors.text },
    heading2: { color: colors.text },
    code_block: { backgroundColor: colors.card, padding: 8, borderRadius: 4 },
    code_inline: { backgroundColor: colors.card, paddingHorizontal: 4, borderRadius: 3 },
  };
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '600' },
  messagesList: { padding: 12, gap: 8 },
  messageBubble: { padding: 12, borderRadius: 8, maxWidth: '85%', marginBottom: 8 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#007AFF' },
  assistantBubble: { alignSelf: 'flex-start', backgroundColor: '#E9E9EB' },
  role: { fontSize: 12, fontWeight: '600', marginBottom: 4, opacity: 0.7 },
  messageBody: {},
  fallbackText: { fontSize: 14 },
  errorText: { color: '#FF3B30', fontSize: 13, marginTop: 4 },
  toolCall: {
    borderLeftWidth: 3,
    padding: 8,
    borderRadius: 4,
    marginVertical: 4,
  },
  reasoningBox: {
    borderLeftWidth: 3,
    padding: 8,
    borderRadius: 4,
    marginVertical: 4,
  },
  filePart: { padding: 8, borderRadius: 4, marginVertical: 2 },
  patchPart: { padding: 8, borderRadius: 4, marginVertical: 2 },
  diffsBox: { padding: 8, borderRadius: 4, marginTop: 4, gap: 2 },
  permissionList: { maxHeight: 120 },
  permissionCard: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 12,
    marginVertical: 4,
  },
  permissionActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  permBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 6 },
  permBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxHeight: 120,
  },
  sendButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  sendButtonText: { color: '#fff', fontWeight: '600' },
});

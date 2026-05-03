import type { Session, Part, Message, SubtaskPartInput, TextPartInput } from '@opencode-ai/sdk';

let baseUrl = 'https://chaim12345.duckdns.org:4097';

export function updateBaseUrl(url: string) {
  baseUrl = url;
}

export function getClient() {
  return client;
}

export type { Session, Part, Message };

function buildUrl(path: string, query?: Record<string, string | undefined>): string {
  const url = `${baseUrl}${path}`;
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [key, val] of Object.entries(query)) {
    if (val !== undefined) params.append(key, val);
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

async function apiFetch(path: string, options?: RequestInit & { query?: Record<string, string | undefined> }): Promise<Response> {
  const { query, ...init } = options || {};
  const url = buildUrl(path, query);
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res;
}

// Session endpoints
export async function listSessions(directory?: string): Promise<Session[]> {
  const res = await apiFetch('/session', { query: directory ? { directory } : undefined });
  return res.json();
}

export async function getSession(id: string, directory?: string): Promise<Session> {
  const res = await apiFetch(`/session/${id}`, { query: directory ? { directory } : undefined });
  return res.json();
}

export async function createSession(input: { projectId?: string; directory?: string; title?: string; modelId?: string; providerId?: string }, directory?: string): Promise<Session> {
  const res = await apiFetch('/session', {
    method: 'POST',
    body: JSON.stringify(input),
    query: directory ? { directory } : undefined,
  });
  return res.json();
}

export async function updateSession(id: string, input: { title?: string; modelId?: string; providerId?: string }, directory?: string): Promise<Session> {
  const res = await apiFetch(`/session/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
    query: directory ? { directory } : undefined,
  });
  return res.json();
}

export async function deleteSession(id: string, directory?: string): Promise<void> {
  await apiFetch(`/session/${id}`, {
    method: 'DELETE',
    query: directory ? { directory } : undefined,
  });
}

export async function shareSession(id: string, directory?: string): Promise<Session> {
  const res = await apiFetch(`/session/${id}/share`, {
    method: 'POST',
    query: directory ? { directory } : undefined,
  });
  return res.json();
}

export async function unshareSession(id: string, directory?: string): Promise<Session> {
  const res = await apiFetch(`/session/${id}/share`, {
    method: 'DELETE',
    query: directory ? { directory } : undefined,
  });
  return res.json();
}

export async function forkSession(id: string, messageId: string, directory?: string): Promise<Session> {
  const res = await apiFetch(`/session/${id}/fork`, {
    method: 'POST',
    body: JSON.stringify({ fromMessageId: messageId }),
    query: directory ? { directory } : undefined,
  });
  return res.json();
}

// Messages
export async function getMessages(sessionId: string, directory?: string): Promise<any[]> {
  const res = await apiFetch(`/session/${sessionId}/message`, {
    query: directory ? { directory } : undefined,
  });
  return res.json();
}

export async function getMessage(sessionId: string, messageId: string, directory?: string): Promise<any> {
  const res = await apiFetch(`/session/${sessionId}/message/${messageId}`, {
    query: directory ? { directory } : undefined,
  });
  return res.json();
}

export async function sendMessage(id: string, content: string, messageId?: string, directory?: string): Promise<any> {
  const res = await apiFetch(`/session/${id}/prompt`, {
    method: 'POST',
    body: JSON.stringify({ messageId, content }),
    query: directory ? { directory } : undefined,
  });
  return res.json();
}

export async function abortSession(id: string, directory?: string): Promise<void> {
  await apiFetch(`/session/${id}/abort`, {
    method: 'POST',
    query: directory ? { directory } : undefined,
  });
}

export async function revertMessage(id: string, messageId: string, directory?: string): Promise<void> {
  await apiFetch(`/session/${id}/revert`, {
    method: 'POST',
    body: JSON.stringify({ messageId }),
    query: directory ? { directory } : undefined,
  });
}

export async function unrevertMessages(id: string, directory?: string): Promise<void> {
  await apiFetch(`/session/${id}/unrevert`, {
    method: 'POST',
    query: directory ? { directory } : undefined,
  });
}

export async function initSession(id: string, messageId: string, providerId: string, modelId: string, directory?: string): Promise<any> {
  const res = await apiFetch(`/session/${id}/init`, {
    method: 'POST',
    body: JSON.stringify({ messageId, providerId, modelId }),
    query: directory ? { directory } : undefined,
  });
  return res.json();
}

export async function summarizeSession(id: string, directory?: string): Promise<void> {
  await apiFetch(`/session/${id}/summarize`, {
    method: 'POST',
    query: directory ? { directory } : undefined,
  });
}

// SSE subscription
export async function subscribeEvents() {
  const url = buildUrl('/event');
  const res = await fetch(url);
  if (!res.body) throw new Error('No SSE stream available');
  async function* streamGenerator() {
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              yield JSON.parse(line.slice(6));
            } catch {}
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
  return { stream: streamGenerator() };
}

// Providers
export async function listProviders(): Promise<{ all: any[]; default: any; connected: string[] }> {
  const res = await apiFetch('/provider');
  return res.json();
}

// Projects
export async function getProject(): Promise<any> {
  const res = await apiFetch('/project/current');
  return res.json();
}

export async function listProjects(): Promise<any[]> {
  const res = await apiFetch('/project');
  return res.json();
}

// Find
export async function findText(pattern: string, directory?: string): Promise<any> {
  const res = await apiFetch('/find/text', {
    method: 'POST',
    body: JSON.stringify({ pattern }),
    query: directory ? { directory } : undefined,
  });
  return res.json();
}

export async function findFiles(query: string, directory?: string): Promise<any> {
  const res = await apiFetch('/find/files', {
    method: 'POST',
    body: JSON.stringify({ query }),
    query: directory ? { directory } : undefined,
  });
  return res.json();
}

export async function findSymbols(query: string, directory?: string): Promise<any> {
  const res = await apiFetch('/find/symbols', {
    method: 'POST',
    body: JSON.stringify({ query }),
    query: directory ? { directory } : undefined,
  });
  return res.json();
}

// File
export async function readFile(path: string): Promise<any> {
  const res = await apiFetch('/file', { query: { path } });
  return res.json();
}

export async function listFiles(path?: string): Promise<any> {
  const res = await apiFetch('/file', { query: path ? { path } : undefined });
  return res.json();
}

// Permissions
export async function respondPermission(sessionId: string, permissionId: string, body: { response: string }): Promise<void> {
  await apiFetch(`/session/${sessionId}/permissions/${permissionId}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// Config
export async function getConfig(): Promise<any> {
  const res = await apiFetch('/config');
  return res.json();
}

// Tools
export async function listTools(providerId: string, modelId: string, directory?: string): Promise<any[]> {
  const res = await apiFetch('/tool', {
    query: { provider: providerId, model: modelId, ...(directory ? { directory } : {}) },
  });
  const data = await res.json();
  return data.tools || data;
}

// Diff
export async function getDiff(sessionId: string, directory?: string): Promise<any> {
  const res = await apiFetch(`/session/${sessionId}/diff`, {
    query: directory ? { directory } : undefined,
  });
  return res.json();
}

// Commands
export async function sendCommand(sessionId: string, command: string, directory?: string): Promise<any> {
  const res = await apiFetch(`/session/${sessionId}/command`, {
    method: 'POST',
    body: JSON.stringify({ command }),
    query: directory ? { directory } : undefined,
  });
  return res.json();
}

// Health check
export async function checkHealth(): Promise<{ ok: boolean; data?: any }> {
  try {
    const res = await fetch(baseUrl);
    const data = await res.json();
    return { ok: res.ok, data };
  } catch {
    return { ok: false };
  }
}

// Compatibility client that mimics SDK structure
export const client = {
  session: {
    list: (opts?: { query?: { directory?: string } }) => 
      listSessions(opts?.query?.directory).then(d => ({ data: d })),
    get: (opts: { path: { id: string }; query?: { directory?: string } }) => 
      getSession(opts.path.id, opts.query?.directory).then(d => ({ data: d })),
    create: (opts: { body: any; query?: { directory?: string } }) => 
      createSession(opts.body, opts.query?.directory).then(d => ({ data: d })),
    update: (opts: { path: { id: string }; body: any; query?: { directory?: string } }) => 
      updateSession(opts.path.id, opts.body, opts.query?.directory).then(d => ({ data: d })),
    delete: (opts: { path: { id: string }; query?: { directory?: string } }) => 
      deleteSession(opts.path.id, opts.query?.directory).then(() => ({})),
    share: (opts: { path: { id: string }; query?: { directory?: string } }) => 
      shareSession(opts.path.id, opts.query?.directory).then(d => ({ data: d })),
    unshare: (opts: { path: { id: string }; query?: { directory?: string } }) => 
      unshareSession(opts.path.id, opts.query?.directory).then(d => ({ data: d })),
    fork: (opts: { path: { id: string }; body: any; query?: { directory?: string } }) => 
      forkSession(opts.path.id, opts.body.fromMessageId, opts.query?.directory).then(d => ({ data: d })),
    messages: (opts: { path: { id: string }; query?: { directory?: string } }) => 
      getMessages(opts.path.id, opts.query?.directory).then(d => ({ data: d })),
    message: (opts: { path: { id: string; messageId: string }; query?: { directory?: string } }) => 
      getMessage(opts.path.id, opts.path.messageId, opts.query?.directory).then(d => ({ data: d })),
    prompt: (opts: { path: { id: string }; body: any; query?: { directory?: string } }) => 
      sendMessage(opts.path.id, opts.body.content, opts.body.messageId, opts.query?.directory).then(d => ({ data: d })),
    abort: (opts: { path: { id: string }; query?: { directory?: string } }) => 
      abortSession(opts.path.id, opts.query?.directory).then(() => ({})),
    revert: (opts: { path: { id: string }; body: any; query?: { directory?: string } }) => 
      revertMessage(opts.path.id, opts.body.messageId, opts.query?.directory).then(() => ({})),
    unrevert: (opts: { path: { id: string }; query?: { directory?: string } }) => 
      unrevertMessages(opts.path.id, opts.query?.directory).then(() => ({})),
    init: (opts: { path: { id: string }; body: any; query?: { directory?: string } }) => 
      initSession(opts.path.id, opts.body.messageId, opts.body.providerId, opts.body.modelId, opts.query?.directory).then(d => ({ data: d })),
    summarize: (opts: { path: { id: string }; query?: { directory?: string } }) => 
      summarizeSession(opts.path.id, opts.query?.directory).then(() => ({})),
    command: (opts: { path: { id: string }; body: any; query?: { directory?: string } }) => 
      sendCommand(opts.path.id, opts.body.command, opts.query?.directory).then(d => ({ data: d })),
    diff: (opts: { path: { id: string }; query?: { directory?: string } }) => 
      getDiff(opts.path.id, opts.query?.directory).then(d => ({ data: d })),
  },
  event: {
    subscribe: () => subscribeEvents(),
  },
  provider: {
    list: () => listProviders().then(d => ({ data: d })),
  },
  project: {
    current: () => getProject().then(d => ({ data: d })),
    list: () => listProjects().then(d => ({ data: d })),
  },
  find: {
    text: (opts: { query: { pattern: string; directory?: string } }) => 
      findText(opts.query.pattern, opts.query.directory).then(d => ({ data: d })),
    files: (opts: { query: { query: string; directory?: string } }) => 
      findFiles(opts.query.query, opts.query.directory).then(d => ({ data: d })),
    symbols: (opts: { query: { query: string; directory?: string } }) => 
      findSymbols(opts.query.query, opts.query.directory).then(d => ({ data: d })),
  },
  file: {
    read: (opts: { query: { path: string } }) => readFile(opts.query.path).then(d => ({ data: d })),
    list: (opts?: { query?: { path?: string } }) => 
      listFiles(opts?.query?.path).then(d => ({ data: d })),
  },
  config: {
    get: () => getConfig().then(d => ({ data: d })),
  },
  tool: {
    list: (opts: { query: { provider: string; model: string } }) => 
      listTools(opts.query.provider, opts.query.model).then(d => ({ tools: d })),
  },
  postSessionIdPermissionsPermissionId: (opts: { path: { id: string; permissionId: string }; body: any }) => 
    respondPermission(opts.path.id, opts.path.permissionId, opts.body).then(() => ({})),
};

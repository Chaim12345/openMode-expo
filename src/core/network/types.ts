export interface ChatSession {
  id: string;
  projectId?: string;
  directory?: string;
  title?: string;
  createdAt?: string;
  updatedAt?: string;
  completedTime?: string;
  shared?: boolean;
  modelId?: string;
  providerId?: string;
  summary?: string;
  messageCount?: number;
}

export interface SessionCreateInput {
  projectId?: string;
  directory?: string;
  title?: string;
  modelId?: string;
  providerId?: string;
}

export interface SessionUpdateInput {
  title?: string;
  modelId?: string;
  providerId?: string;
}

export interface ChatMessagePart {
  type: 'text' | 'tool' | 'reasoning' | string;
  text?: string;
  toolName?: string;
  toolInput?: any;
  toolOutput?: any;
  thinking?: string;
  [key: string]: any;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  completedTime?: string;
  createdAt?: string;
  parts: ChatMessagePart[];
  [key: string]: any;
}

export interface ChatInput {
  messageId?: string;
  content: string;
  attachments?: any[];
  [key: string]: any;
}

export interface Project {
  id: string;
  name: string;
  path: string;
  [key: string]: any;
}

export interface Provider {
  id: string;
  name: string;
  models: Model[];
}

export interface Model {
  id: string;
  name: string;
}

export class ApiException extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'ApiException';
  }
}

export class NotFoundException extends ApiException {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class ValidationException extends ApiException {
  constructor(message: string = 'Validation failed') {
    super(message, 400);
  }
}

export class ServerException extends ApiException {
  constructor(message: string = 'Server error') {
    super(message, 500);
  }
}

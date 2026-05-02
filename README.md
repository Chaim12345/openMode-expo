# OpenMode Expo

Mobile client for OpenCode AI assistant - migrated from Flutter to Expo/React Native.

## Migration from Flutter

This project is a complete rewrite of the original Flutter app [`Chaim12345/openMode`](https://github.com/Chaim12345/openMode) using the Expo framework with React Native.

### What was migrated

| Flutter | Expo/React Native |
|---|---|
| Flutter + Dart | Expo SDK 54 + TypeScript |
| Provider (state) | Zustand + persist middleware |
| Dio (HTTP) | `@opencode-ai/sdk` (official SDK) |
| SharedPreferences | `@react-native-async-storage` |
| Material 3 | Custom theme (light/dark/system) |
| Flutter markdown | `react-native-markdown-display` |

### Architecture

```
openMode-expo/
├── app/                    # Expo Router (file-based routing)
│   ├── (tabs)/             # Tab navigator
│   │   ├── index.tsx      # Home page
│   │   ├── sessions.tsx   # Session list
│   │   └── settings.tsx   # Settings page
│   ├── chat/
│   │   └── [sessionId].tsx  # Chat page with SSE streaming
│   └── settings/
│       └── server.tsx        # Server connection settings
├── src/
│   ├── core/
│   │   ├── constants/      # API & app constants
│   │   ├── network/        # API client (OpenCode SDK wrapper)
│   │   └── storage/        # AsyncStorage service
│   ├── store/              # Zustand stores
│   ├── theme/              # Theme provider & colors
│   └── components/        # Reusable components
└── package.json
```

## Setup

```bash
npm install
npx expo start
```

## Features

- AI chat interface with SSE streaming
- Session management (list, create, delete, share, fork)
- Server connection settings with test
- Theme support (light/dark/system)
- Basic authentication support
- Cross-platform (iOS, Android, Web)

## API

Uses the official [`@opencode-ai/sdk`](https://www.npmjs.com/package/@opencode-ai/sdk) for type-safe communication with OpenCode server.

## Original Flutter App

- Repository: https://github.com/Chaim12345/openMode
- License: MIT
- Author: Chaim12345

## License

MIT

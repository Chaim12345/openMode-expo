import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storageService } from '../core/storage/storageService';
import { updateBaseUrl } from '../core/network/apiClient';

export type ThemeMode = 'light' | 'dark' | 'system';

interface AppState {
  serverHost: string;
  serverPort: number;
  themeMode: ThemeMode;
  isConnected: boolean;
  basicAuthEnabled: boolean;
  basicAuthUsername: string;
  basicAuthPassword: string;
  setServerConfig: (host: string, port: number) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setConnected: (connected: boolean) => void;
  setBasicAuth: (enabled: boolean, username?: string, password?: string) => void;
  loadServerConfig: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      serverHost: '137.131.63.155',
      serverPort: 4096,
      themeMode: 'system' as ThemeMode,
      isConnected: false,
      basicAuthEnabled: false,
      basicAuthUsername: '',
      basicAuthPassword: '',
      setServerConfig: (host, port) => {
        set({ serverHost: host, serverPort: port });
        updateBaseUrl(`http://${host}:${port}`);
        storageService.setServerHost(host);
        storageService.setServerPort(String(port));
      },
      setThemeMode: (mode) => {
        set({ themeMode: mode });
        storageService.setThemeMode(mode);
      },
      setConnected: (connected) => set({ isConnected: connected }),
      setBasicAuth: (enabled, username, password) => {
        set({
          basicAuthEnabled: enabled,
          basicAuthUsername: username ?? '',
          basicAuthPassword: password ?? '',
        });
        storageService.setBasicAuthEnabled(enabled);
        if (username) storageService.setBasicAuthUsername(username);
        if (password) storageService.setBasicAuthPassword(password);
      },
      loadServerConfig: async () => {
        const host = await storageService.getServerHost();
        const portStr = await storageService.getServerPort();
        const port = portStr ? parseInt(portStr, 10) : 4096;
        const theme = (await storageService.getThemeMode()) as ThemeMode | null;
        const basicEnabled = await storageService.getBasicAuthEnabled();
        const basicUser = await storageService.getBasicAuthUsername();
        const basicPass = await storageService.getBasicAuthPassword();
        set({
          serverHost: host ?? '137.131.63.155',
          serverPort: port,
          themeMode: theme ?? 'system',
          basicAuthEnabled: basicEnabled,
          basicAuthUsername: basicUser ?? '',
          basicAuthPassword: basicPass ?? '',
        });
        updateBaseUrl(`http://${host ?? '137.131.63.155'}:${port}`);
      },
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => storageService as any),
    }
  )
);

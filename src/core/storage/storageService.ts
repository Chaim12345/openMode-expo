import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  SERVER_HOST: 'server_host',
  SERVER_PORT: 'server_port',
  THEME_MODE: 'theme_mode',
  BASIC_AUTH_ENABLED: 'basic_auth_enabled',
  BASIC_AUTH_USERNAME: 'basic_auth_username',
  BASIC_AUTH_PASSWORD: 'basic_auth_password',
};

export const storageService = {
  async getServerHost(): Promise<string | null> {
    return await AsyncStorage.getItem(KEYS.SERVER_HOST);
  },
  async setServerHost(host: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.SERVER_HOST, host);
  },
  async getServerPort(): Promise<string | null> {
    return await AsyncStorage.getItem(KEYS.SERVER_PORT);
  },
  async setServerPort(port: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.SERVER_PORT, port);
  },
  async getThemeMode(): Promise<string | null> {
    return await AsyncStorage.getItem(KEYS.THEME_MODE);
  },
  async setThemeMode(mode: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.THEME_MODE, mode);
  },
  async getBasicAuthEnabled(): Promise<boolean> {
    const val = await AsyncStorage.getItem(KEYS.BASIC_AUTH_ENABLED);
    return val === 'true';
  },
  async setBasicAuthEnabled(enabled: boolean): Promise<void> {
    await AsyncStorage.setItem(KEYS.BASIC_AUTH_ENABLED, String(enabled));
  },
  async getBasicAuthUsername(): Promise<string | null> {
    return await AsyncStorage.getItem(KEYS.BASIC_AUTH_USERNAME);
  },
  async setBasicAuthUsername(username: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.BASIC_AUTH_USERNAME, username);
  },
  async getBasicAuthPassword(): Promise<string | null> {
    return await AsyncStorage.getItem(KEYS.BASIC_AUTH_PASSWORD);
  },
  async setBasicAuthPassword(password: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.BASIC_AUTH_PASSWORD, password);
  },
  async clearAll(): Promise<void> {
    await AsyncStorage.clear();
  },
};

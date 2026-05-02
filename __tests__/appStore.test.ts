import { useAppStore } from '../src/store/appStore';

describe('AppStore', () => {
  it('should have initial state', () => {
    const state = useAppStore.getState();
    expect(state.serverHost).toBeDefined();
    expect(state.serverPort).toBeDefined();
  });

  it('should update server config', () => {
    const { setServerConfig } = useAppStore.getState();
    setServerConfig('192.168.1.100', 3000);
    const state = useAppStore.getState();
    expect(state.serverHost).toBe('192.168.1.100');
    expect(state.serverPort).toBe(3000);
  });
});

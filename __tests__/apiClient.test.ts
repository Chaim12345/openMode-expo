import { getClient, updateBaseUrl } from '../src/core/network/apiClient';

describe('apiClient', () => {
  beforeEach(() => {
    updateBaseUrl('https://chaim12345.duckdns.org:4097');
  });

  it('should update base URL', () => {
    updateBaseUrl('http://192.168.1.100:3000');
    const client = getClient();
    expect(client).toBeDefined();
  });

  it('should export required functions', () => {
    expect(typeof getClient).toBe('function');
  });
});

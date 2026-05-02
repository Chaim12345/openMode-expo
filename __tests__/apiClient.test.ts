import { getClient, updateBaseUrl } from '../src/core/network/apiClient';

describe('apiClient', () => {
  beforeEach(() => {
    updateBaseUrl('http://137.131.63.155:4096');
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

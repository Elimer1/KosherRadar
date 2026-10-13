import { afterEach, expect, it, vi } from 'vitest';
import { api, LOCATION_REQUEST_TIMEOUT_MS } from './axiosInstance';

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

it('ends a stalled location request using the existing Axios timeout error path', async () => {
  vi.useFakeTimers();
  class StalledRequest {
    timeout = 0;
    ontimeout?: () => void;
    open() {}
    setRequestHeader() {}
    abort() {}
    send() { setTimeout(() => this.ontimeout?.(), this.timeout); }
  }
  vi.stubGlobal('XMLHttpRequest', StalledRequest);
  const result = api.get('/places/geocode', { adapter: 'xhr' }).catch(error => error);
  await vi.advanceTimersByTimeAsync(LOCATION_REQUEST_TIMEOUT_MS);
  expect(await result).toMatchObject({ code: 'ECONNABORTED', config: { timeout: LOCATION_REQUEST_TIMEOUT_MS } });
});

it('preserves upload timeouts and explicit longer location deadlines', async () => {
  const configs: Array<{ url?: string; timeout?: number }> = [];
  const adapter: NonNullable<Parameters<typeof api.request>[0]['adapter']> = async config => {
    configs.push(config);
    return { data: {}, status: 200, statusText: 'OK', headers: {}, config };
  };
  await api.post('/restaurants', {}, { adapter });
  await api.get('/places/suggest', { adapter, timeout: 20000 });
  await api.get('/places/autocomplete', { adapter });
  expect(configs.map(config => config.timeout)).toEqual([0, 20000, LOCATION_REQUEST_TIMEOUT_MS]);
});

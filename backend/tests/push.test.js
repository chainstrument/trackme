import test from 'node:test';
import assert from 'node:assert/strict';
import { registerDevice } from '../src/deviceStore.js';
import { dispatchAlerts } from '../src/pushDispatcher.js';

test('dispatchAlerts sends a push per device per triggered alert', async (t) => {
  registerDevice({ token: 'ExponentPushToken[a]', platform: 'ios' });
  registerDevice({ token: 'ExponentPushToken[b]', platform: 'android' });

  const calls = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    calls.push({ url, body: JSON.parse(options.body) });
    return { json: async () => ({ data: { status: 'ok' } }) };
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const results = await dispatchAlerts([{ id: '1', type: 'drink', message: 'Bois de l’eau' }]);

  assert.equal(calls.length, 2);
  assert.equal(results.length, 2);
  assert.ok(calls.every((call) => call.url === 'https://exp.host/--/api/v2/push/send'));
  assert.deepEqual(
    calls.map((call) => call.body.to).sort(),
    ['ExponentPushToken[a]', 'ExponentPushToken[b]']
  );
  assert.ok(calls.every((call) => call.body.body === 'Bois de l’eau'));
});

test('dispatchAlerts does nothing when there are no triggered alerts', async (t) => {
  const originalFetch = globalThis.fetch;
  let called = false;
  globalThis.fetch = async () => {
    called = true;
    return { json: async () => ({}) };
  };
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const results = await dispatchAlerts([]);
  assert.deepEqual(results, []);
  assert.equal(called, false);
});

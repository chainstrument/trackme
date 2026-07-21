import test from 'node:test';
import assert from 'node:assert/strict';
import { closeServer, startServer } from '../src/server.js';

let server;
let port = 0;

test.before(async () => {
  server = startServer(0);
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Server not listening');
  }
  port = address.port;
});

test.after(async () => {
  await closeServer();
});

test('registers a device push token and lists it', async () => {
  const createResponse = await fetch(`http://127.0.0.1:${port}/api/devices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: 'ExponentPushToken[abc123]', platform: 'ios' })
  });
  const device = await createResponse.json();
  assert.equal(createResponse.status, 201);
  assert.equal(device.token, 'ExponentPushToken[abc123]');
  assert.equal(device.platform, 'ios');

  const listResponse = await fetch(`http://127.0.0.1:${port}/api/devices`);
  const devices = await listResponse.json();
  assert.equal(listResponse.status, 200);
  assert.ok(devices.some((entry) => entry.token === 'ExponentPushToken[abc123]'));
});

test('registering the same token twice does not duplicate it', async () => {
  const payload = { token: 'ExponentPushToken[dup]', platform: 'android' };
  await fetch(`http://127.0.0.1:${port}/api/devices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  await fetch(`http://127.0.0.1:${port}/api/devices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const listResponse = await fetch(`http://127.0.0.1:${port}/api/devices`);
  const devices = await listResponse.json();
  const matches = devices.filter((entry) => entry.token === 'ExponentPushToken[dup]');
  assert.equal(matches.length, 1);
});

test('rejects a device registration without a token', async () => {
  const response = await fetch(`http://127.0.0.1:${port}/api/devices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ platform: 'ios' })
  });
  assert.equal(response.status, 400);
});

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

test('activity endpoint stores manual activity entries', async () => {
  const response = await fetch(`http://127.0.0.1:${port}/api/activities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'walk', duration: 45, intensity: 'moderate', date: '2026-07-20' })
  });
  const body = await response.json();
  assert.equal(response.status, 201);
  assert.equal(body.type, 'walk');
  assert.equal(body.duration, 45);
});

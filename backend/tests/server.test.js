import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { server } from '../src/server.js';

let port = 0;

test('health endpoint returns ok', async () => {
  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Server not listening');
  }
  port = address.port;

  const response = await fetch(`http://127.0.0.1:${port}/health`);
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.deepEqual(body, { status: 'ok' });
});

test('meal endpoints persist data', async () => {
  const response = await fetch(`http://127.0.0.1:${port}/api/meals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Salade', category: 'lunch' })
  });
  const body = await response.json();
  assert.equal(response.status, 201);
  assert.equal(body.name, 'Salade');

  const listResponse = await fetch(`http://127.0.0.1:${port}/api/meals`);
  const meals = await listResponse.json();
  assert.ok(meals.some((meal) => meal.name === 'Salade'));
});

test('activity and alert endpoints persist data', async () => {
  const activityResponse = await fetch(`http://127.0.0.1:${port}/api/activities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'walk', duration: 30, date: '2026-07-20' })
  });
  assert.equal(activityResponse.status, 201);

  const alertResponse = await fetch(`http://127.0.0.1:${port}/api/alerts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'drink', message: 'Bois de l’eau' })
  });
  assert.equal(alertResponse.status, 201);
});

await once(server, 'close');

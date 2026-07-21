import test from 'node:test';
import assert from 'node:assert/strict';
import { closeServer, startServer } from '../src/server.js';
import { checkScheduledAlerts, createAlertRule } from '../src/alertStore.js';

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

test('alert rules and history are handled', async () => {
  const createResponse = await fetch(`http://127.0.0.1:${port}/api/alerts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'drink', schedule: '09:00', message: 'Bois de l’eau' })
  });
  const rule = await createResponse.json();
  assert.equal(createResponse.status, 201);
  assert.equal(rule.type, 'drink');

  const triggerResponse = await fetch(`http://127.0.0.1:${port}/api/trigger-alerts`, { method: 'POST' });
  const triggered = await triggerResponse.json();
  assert.equal(triggerResponse.status, 200);
  assert.equal(triggered[0].message, 'Bois de l’eau');

  const historyResponse = await fetch(`http://127.0.0.1:${port}/api/alert-history`);
  const history = await historyResponse.json();
  assert.equal(historyResponse.status, 200);
  assert.ok(history.length >= 1);
});

test('scheduler triggers active rules at their scheduled time, once per day', () => {
  const rule = createAlertRule({ type: 'walk', schedule: '08:00', message: 'Va marcher' });

  const beforeSchedule = new Date('2026-07-21T07:59:00');
  assert.equal(checkScheduledAlerts(beforeSchedule).length, 0);

  const atSchedule = new Date('2026-07-21T08:00:00');
  const triggered = checkScheduledAlerts(atSchedule);
  assert.equal(triggered.length, 1);
  assert.equal(triggered[0].ruleId, rule.id);

  const stillSameMinute = checkScheduledAlerts(atSchedule);
  assert.equal(stillSameMinute.length, 0);

  const nextDaySameTime = new Date('2026-07-22T08:00:00');
  assert.equal(checkScheduledAlerts(nextDaySameTime).length, 1);
});

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

test('crud and planning meal endpoints work', async () => {
  const createResponse = await fetch(`http://127.0.0.1:${port}/api/meals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Pâtes', category: 'dinner', calories: 550 })
  });
  const meal = await createResponse.json();
  assert.equal(createResponse.status, 201);

  const updateResponse = await fetch(`http://127.0.0.1:${port}/api/meals/${meal.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Pâtes complètes' })
  });
  const updatedMeal = await updateResponse.json();
  assert.equal(updateResponse.status, 200);
  assert.equal(updatedMeal.name, 'Pâtes complètes');

  const planResponse = await fetch(`http://127.0.0.1:${port}/api/planned-meals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mealId: meal.id, date: '2026-07-20', category: 'dinner' })
  });
  const plannedMeal = await planResponse.json();
  assert.equal(planResponse.status, 201);
  assert.equal(plannedMeal.eaten, false);

  const toggleResponse = await fetch(`http://127.0.0.1:${port}/api/planned-meals/${plannedMeal.id}`, {
    method: 'PATCH'
  });
  const toggled = await toggleResponse.json();
  assert.equal(toggleResponse.status, 200);
  assert.equal(toggled.eaten, true);

  const deleteResponse = await fetch(`http://127.0.0.1:${port}/api/meals/${meal.id}`, {
    method: 'DELETE'
  });
  assert.equal(deleteResponse.status, 204);
});

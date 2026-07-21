import { getDatabase } from './db';

function generateId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function listActivities() {
  const db = await getDatabase();
  return db.getAllAsync('SELECT * FROM activities ORDER BY date DESC, created_at DESC');
}

async function createActivity({ type, duration, intensity, date }) {
  const db = await getDatabase();
  const activity = {
    id: generateId(),
    type,
    duration,
    intensity: intensity || null,
    date,
    created_at: new Date().toISOString()
  };
  await db.runAsync(
    'INSERT INTO activities (id, type, duration, intensity, date, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    activity.id,
    activity.type,
    activity.duration,
    activity.intensity,
    activity.date,
    activity.created_at
  );
  return activity;
}

export { createActivity, listActivities };

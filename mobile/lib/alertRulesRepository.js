import { getDatabase } from './db';

function generateId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function listAlertRules() {
  const db = await getDatabase();
  return db.getAllAsync('SELECT * FROM alert_rules ORDER BY created_at DESC');
}

async function createAlertRule({ type, message, triggerType, schedule, intervalMinutes }) {
  const db = await getDatabase();
  const rule = {
    id: generateId(),
    type,
    trigger_type: triggerType === 'interval' ? 'interval' : 'fixed',
    schedule: triggerType === 'interval' ? null : schedule,
    interval_minutes: triggerType === 'interval' ? intervalMinutes : null,
    message,
    active: 1,
    created_at: new Date().toISOString()
  };
  await db.runAsync(
    'INSERT INTO alert_rules (id, type, trigger_type, schedule, interval_minutes, message, active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    rule.id,
    rule.type,
    rule.trigger_type,
    rule.schedule,
    rule.interval_minutes,
    rule.message,
    rule.active,
    rule.created_at
  );
  return rule;
}

async function setAlertRuleActive(id, active) {
  const db = await getDatabase();
  await db.runAsync('UPDATE alert_rules SET active = ? WHERE id = ?', active ? 1 : 0, id);
  return db.getFirstAsync('SELECT * FROM alert_rules WHERE id = ?', id);
}

async function listAlertHistory() {
  const db = await getDatabase();
  return db.getAllAsync('SELECT * FROM alert_history ORDER BY created_at DESC');
}

async function triggerAlertsNow() {
  const db = await getDatabase();
  const activeRules = await db.getAllAsync('SELECT * FROM alert_rules WHERE active = 1');
  const triggered = [];
  for (const rule of activeRules) {
    const entry = {
      id: generateId(),
      rule_id: rule.id,
      type: rule.type,
      message: rule.message,
      created_at: new Date().toISOString()
    };
    await db.runAsync(
      'INSERT INTO alert_history (id, rule_id, type, message, created_at) VALUES (?, ?, ?, ?, ?)',
      entry.id,
      entry.rule_id,
      entry.type,
      entry.message,
      entry.created_at
    );
    triggered.push(entry);
  }
  return triggered;
}

export { createAlertRule, listAlertHistory, listAlertRules, setAlertRuleActive, triggerAlertsNow };

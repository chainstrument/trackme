const alertRules = [];
const alertHistory = [];
const lastTriggeredDate = new Map();
let schedulerInterval = null;

function listAlertRules() {
  return alertRules;
}

function createAlertRule(payload) {
  const rule = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type: payload.type || 'drink',
    schedule: payload.schedule || '09:00',
    message: payload.message || 'Il est temps de prendre une action.',
    active: payload.active !== false,
    createdAt: new Date().toISOString()
  };
  alertRules.push(rule);
  return rule;
}

function updateAlertRule(id, payload) {
  const index = alertRules.findIndex((rule) => rule.id === id);
  if (index === -1) {
    return null;
  }
  alertRules[index] = { ...alertRules[index], ...payload };
  return alertRules[index];
}

function listAlertHistory() {
  return alertHistory;
}

function triggerAlerts() {
  const triggered = alertRules.filter((rule) => rule.active).map((rule) => ({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    ruleId: rule.id,
    type: rule.type,
    message: rule.message,
    createdAt: new Date().toISOString()
  }));
  alertHistory.push(...triggered);
  return triggered;
}

function currentTimeLabel(date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function checkScheduledAlerts(now = new Date()) {
  const timeLabel = currentTimeLabel(now);
  const dateLabel = now.toISOString().slice(0, 10);
  const dueRules = alertRules.filter(
    (rule) => rule.active && rule.schedule === timeLabel && lastTriggeredDate.get(rule.id) !== dateLabel
  );
  const triggered = dueRules.map((rule) => {
    lastTriggeredDate.set(rule.id, dateLabel);
    return {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      ruleId: rule.id,
      type: rule.type,
      message: rule.message,
      createdAt: new Date().toISOString()
    };
  });
  alertHistory.push(...triggered);
  return triggered;
}

function startScheduler(intervalMs = 30000) {
  if (schedulerInterval) {
    return schedulerInterval;
  }
  schedulerInterval = setInterval(() => checkScheduledAlerts(), intervalMs);
  schedulerInterval.unref();
  return schedulerInterval;
}

function stopScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
}

export {
  checkScheduledAlerts,
  createAlertRule,
  listAlertHistory,
  listAlertRules,
  startScheduler,
  stopScheduler,
  triggerAlerts,
  updateAlertRule
};

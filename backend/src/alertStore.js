const alertRules = [];
const alertHistory = [];

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

export { createAlertRule, listAlertHistory, listAlertRules, triggerAlerts, updateAlertRule };

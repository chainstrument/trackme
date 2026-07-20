const activities = [];

function listActivities() {
  return activities;
}

function createActivity(payload) {
  const activity = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type: payload.type || 'other',
    duration: payload.duration || 0,
    intensity: payload.intensity || null,
    date: payload.date || new Date().toISOString().slice(0, 10),
    createdAt: new Date().toISOString()
  };
  activities.push(activity);
  return activity;
}

export { createActivity, listActivities };

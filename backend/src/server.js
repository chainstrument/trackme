import http from 'node:http';
import { pathToFileURL } from 'node:url';
import {
  createMeal,
  deleteMeal,
  listMeals,
  listPlannedMeals,
  planMeal,
  toggleEaten,
  updateMeal
} from './mealStore.js';
import { createActivity, listActivities } from './activityStore.js';
import { listDevices, registerDevice } from './deviceStore.js';
import {
  createAlertRule,
  listAlertHistory,
  listAlertRules,
  startScheduler,
  stopScheduler,
  triggerAlerts,
  updateAlertRule
} from './alertStore.js';

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  if (req.url === '/api/meals' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(listMeals()));
    return;
  }

  if (req.url === '/api/meals' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      const payload = JSON.parse(body || '{}');
      const meal = createMeal(payload);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(meal));
    });
    return;
  }

  if (req.url.startsWith('/api/meals/') && req.method === 'PATCH') {
    const id = req.url.split('/').pop();
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      const payload = JSON.parse(body || '{}');
      const meal = updateMeal(id, payload);
      if (!meal) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Meal not found' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(meal));
    });
    return;
  }

  if (req.url.startsWith('/api/meals/') && req.method === 'DELETE') {
    const id = req.url.split('/').pop();
    const deleted = deleteMeal(id);
    if (!deleted) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Meal not found' }));
      return;
    }
    res.writeHead(204, { 'Content-Type': 'application/json' });
    res.end();
    return;
  }

  if (req.url === '/api/planned-meals' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(listPlannedMeals()));
    return;
  }

  if (req.url === '/api/planned-meals' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      const payload = JSON.parse(body || '{}');
      const plannedMeal = planMeal(payload);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(plannedMeal));
    });
    return;
  }

  if (req.url.startsWith('/api/planned-meals/') && req.method === 'PATCH') {
    const id = req.url.split('/').pop();
    const plannedMeal = toggleEaten(id);
    if (!plannedMeal) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Planned meal not found' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(plannedMeal));
    return;
  }

  if (req.url === '/api/activities' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(listActivities()));
    return;
  }

  if (req.url === '/api/activities' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      const payload = JSON.parse(body || '{}');
      const activity = createActivity(payload);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(activity));
    });
    return;
  }

  if (req.url === '/api/alerts' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(listAlertRules()));
    return;
  }

  if (req.url === '/api/alerts' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      const payload = JSON.parse(body || '{}');
      const alert = createAlertRule(payload);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(alert));
    });
    return;
  }

  if (req.url.startsWith('/api/alerts/') && req.method === 'PATCH') {
    const id = req.url.split('/').pop();
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      const payload = JSON.parse(body || '{}');
      const updated = updateAlertRule(id, payload);
      if (!updated) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Alert rule not found' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(updated));
    });
    return;
  }

  if (req.url === '/api/alert-history' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(listAlertHistory()));
    return;
  }

  if (req.url === '/api/devices' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(listDevices()));
    return;
  }

  if (req.url === '/api/devices' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      const payload = JSON.parse(body || '{}');
      if (!payload.token) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'token is required' }));
        return;
      }
      const device = registerDevice(payload);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(device));
    });
    return;
  }

  if (req.url === '/api/trigger-alerts' && req.method === 'POST') {
    const triggered = triggerAlerts();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(triggered));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

function startServer(port = process.env.PORT || 3001) {
  if (server.listening) {
    return server;
  }
  server.listen(port, () => {
    console.log(`Backend listening on port ${port}`);
  });
  startScheduler();
  return server;
}

function closeServer() {
  stopScheduler();
  if (!server.listening) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startServer();
}

export { closeServer, server, startServer };

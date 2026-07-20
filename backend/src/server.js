import http from 'node:http';

const meals = [];
const activities = [];
const alerts = [];

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  if (req.url === '/api/meals' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(meals));
    return;
  }

  if (req.url === '/api/meals' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      const payload = JSON.parse(body || '{}');
      const meal = { id: `${Date.now()}`, ...payload };
      meals.push(meal);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(meal));
    });
    return;
  }

  if (req.url === '/api/activities' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(activities));
    return;
  }

  if (req.url === '/api/activities' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      const payload = JSON.parse(body || '{}');
      const activity = { id: `${Date.now()}`, ...payload };
      activities.push(activity);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(activity));
    });
    return;
  }

  if (req.url === '/api/alerts' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(alerts));
    return;
  }

  if (req.url === '/api/alerts' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      const payload = JSON.parse(body || '{}');
      const alert = { id: `${Date.now()}`, ...payload };
      alerts.push(alert);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(alert));
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});

export { server };

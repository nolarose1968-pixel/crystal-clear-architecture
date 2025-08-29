#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8787;
const DASHBOARD_PATH = path.join(__dirname, 'src', 'dashboard.html');

console.log(`🚀 Starting Fire22 Dashboard Server on port ${PORT}`);
console.log(`📁 Dashboard file: ${DASHBOARD_PATH}`);

const server = http.createServer((req, res) => {
  const url = req.url;

  if (url === '/' || url === '/dashboard') {
    try {
      const dashboardHtml = fs.readFileSync(DASHBOARD_PATH, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(dashboardHtml);
    } catch (error) {
      console.error('Error reading dashboard:', error);
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Dashboard not found');
    }
  } else if (url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`✅ Dashboard server running at http://localhost:${PORT}`);
  console.log(`📊 Open http://localhost:${PORT}/dashboard in your browser`);
});

server.on('error', error => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    console.log(`💡 Try a different port or stop the process using port ${PORT}`);
  } else {
    console.error('❌ Server error:', error);
  }
});

// Simple static server for I Ching app
// Run: node server.js
// Then open the URL shown in the terminal on any device on the same WiFi

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 8088;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  return ips;
}

const server = http.createServer((req, res) => {
  let filePath = path.join(ROOT, req.url === '/' ? 'index.html' : req.url);
  filePath = path.normalize(filePath);

  // Security: prevent directory traversal
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  const ext = path.extname(filePath);
  const contentType = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  const ips = getLocalIPs();
  console.log('\n  ☰  易经占卜 · I Ching Divination  ☷\n');
  console.log('  Server running! Open on any device:\n');
  console.log('  ─────────────────────────────────────────');
  console.log('    Local:    http://localhost:' + PORT);
  ips.forEach(ip => {
    console.log('    Network:  http://' + ip + ':' + PORT);
  });
  console.log('  ─────────────────────────────────────────\n');
  console.log('  Make sure the device is on the same WiFi network.\n');
  console.log('  Press Ctrl+C to stop the server.\n');
});

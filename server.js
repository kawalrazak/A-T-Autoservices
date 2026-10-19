const fs = require('fs');
const http = require('http');
const path = require('path');
const nodemailer = require('nodemailer');

loadEnv(path.join(__dirname, '.env'));

const PORT = Number(process.env.PORT) || 8081;
const HOST = process.env.HOST || '127.0.0.1';
const ROOT = __dirname;
const SERVICES = [
  'Log Book Service',
  'Brakes',
  'Wheels & Tyres',
  'Air Conditioning',
  'Suspension',
  'Electrical',
  'Mechanical Repair',
  'Roadworthy'
];

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.json': 'application/json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const recentSends = new Map();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const splitAt = trimmed.indexOf('=');
    if (splitAt === -1) continue;
    const key = trimmed.slice(0, splitAt).trim();
    let value = trimmed.slice(splitAt + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

function oneLine(value, max) {
  return String(value || '').replace(/[\r\n]+/g, ' ').trim().slice(0, max);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > 20_000) {
        reject(new Error('too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    const first = forwarded.split(',')[0].trim();
    if (first) return first.slice(0, 80);
  }
  const real = req.headers['x-real-ip'];
  if (typeof real === 'string' && real.trim()) return real.trim().slice(0, 80);
  return req.socket.remoteAddress || 'local';
}

function allowSend(ip) {
  const now = Date.now();
  const stamps = (recentSends.get(ip) || []).filter((time) => now - time < 10 * 60 * 1000);
  if (stamps.length >= 10) {
    recentSends.set(ip, stamps);
    return false;
  }
  stamps.push(now);
  recentSends.set(ip, stamps);
  return true;
}

function forgetLastSend(ip) {
  const stamps = recentSends.get(ip);
  if (stamps && stamps.length) stamps.pop();
}

async function handleQuote(req, res) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    sendJson(res, 500, { error: 'Email is not configured.' });
    return;
  }

  let payload;
  try {
    payload = JSON.parse(await readBody(req));
  } catch {
    sendJson(res, 400, { error: 'Please check the form and try again.' });
    return;
  }

  const name = oneLine(payload.name, 120);
  const phone = oneLine(payload.phone, 40);
  const email = oneLine(payload.email, 120);
  const service = oneLine(payload.service, 80);
  const problem = String(payload.problem || '').replace(/\r/g, '').trim().slice(0, 2000);

  if (!name || !SERVICES.includes(service)) {
    sendJson(res, 400, { error: 'Name and service are required.' });
    return;
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    sendJson(res, 400, { error: 'Please enter a valid email address.' });
    return;
  }
  if (!phone && !email) {
    sendJson(res, 400, { error: 'Enter a phone number or an email address.' });
    return;
  }

  const ip = clientIp(req);
  if (!allowSend(ip)) {
    sendJson(res, 429, { error: 'Too many requests. Please call the workshop.' });
    return;
  }

  const lines = [
    'New quote request from the A&T Auto Services website.',
    '',
    `Name: ${name}`,
    `Phone: ${phone || 'Not provided'}`,
    `Email: ${email || 'Not provided'}`,
    `Service: ${service}`,
    '',
    'Problem:',
    problem || 'Not provided'
  ];

  try {
    await transporter.sendMail({
      from: `"A&T Auto Services" <${process.env.SMTP_USER}>`,
      to: process.env.QUOTE_TO || process.env.SMTP_USER,
      replyTo: email || undefined,
      subject: `Quote request — ${name} — ${service}`,
      text: lines.join('\n')
    });
  } catch (error) {
    forgetLastSend(ip);
    console.error('Quote email failed:', error.message);
    sendJson(res, 502, { error: 'We could not send your request. Please call the workshop.' });
    return;
  }

  sendJson(res, 200, { ok: true });
}

function serveStatic(req, res) {
  let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const file = path.normalize(path.join(ROOT, urlPath));
  if (!file.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const type = mime[path.extname(file).toLowerCase()] || 'application/octet-stream';
    const headers = { 'Content-Type': type };
    if (type.startsWith('text/html') || type.includes('css') || type.includes('javascript')) {
      headers['Cache-Control'] = 'no-cache';
    }
    res.writeHead(200, headers);
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url.split('?')[0] === '/api/quote') {
    handleQuote(req, res);
    return;
  }
  if (req.method === 'GET' || req.method === 'HEAD') {
    serveStatic(req, res);
    return;
  }
  res.writeHead(405);
  res.end('Method not allowed');
});

server.listen(PORT, HOST, () => {
  console.log(`Serving http://${HOST}:${PORT}`);
});

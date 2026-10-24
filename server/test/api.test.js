import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = randomBytes(32).toString('hex');
process.env.FRONTEND_URL = 'http://localhost:5173';

const { default: app } = await import('../src/app.js');
const userId = '507f1f77bcf86cd799439011';
const token = jwt.sign({}, process.env.JWT_SECRET, { subject: userId, expiresIn: '5m' });
const server = app.listen(0);
await once(server, 'listening');
const baseUrl = `http://127.0.0.1:${server.address().port}`;

after(async () => {
  server.close();
  await once(server, 'close');
});

test('health check responds without a database connection', async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).status, 'ok');
});

test('registration validates missing fields without touching MongoDB', async () => {
  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}'
  });
  assert.equal(response.status, 400);
  assert.match((await response.json()).message, /name/i);
});

test('malformed JSON returns a client error', async () => {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{invalid'
  });
  assert.equal(response.status, 400);
});

test('task routes reject requests without authentication', async () => {
  const response = await fetch(`${baseUrl}/api/tasks`);
  assert.equal(response.status, 401);
});

test('task routes reject invalid status filters before database access', async () => {
  const response = await fetch(`${baseUrl}/api/tasks?status=unknown`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  assert.equal(response.status, 400);
});

test('task routes reject malformed identifiers before database access', async () => {
  const response = await fetch(`${baseUrl}/api/tasks/not-an-id`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  assert.equal(response.status, 400);
});

test('CORS rejects origins outside the configured frontend', async () => {
  const response = await fetch(`${baseUrl}/api/health`, {
    headers: { Origin: 'https://example.invalid' }
  });
  assert.equal(response.status, 403);
});

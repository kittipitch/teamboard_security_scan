const express = require('express');
const { Database } = require('bun:sqlite');
const app = express();
const PORT = 3000;

app.use(express.json());

// VULNERABILITY 1: Hardcoded secret in source code (High)
const API_SECRET = "sk-teamboard-2026-production-key";

// VULNERABILITY 2: SQL Injection - SQLite database with vulnerable login (Critical)
const db = new Database(':memory:');

// Create users table and insert test data
db.exec(`
  CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username TEXT,
    password TEXT,
    role TEXT
  )
`);

db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run('admin', 'password123', 'admin');
db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run('alice', 'alicepass', 'user');
db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run('bob', 'bobpass', 'user');

let cards = [];
let nextId = 1;

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Boards
app.get('/boards', (req, res) => {
  res.json([{ id: 1, name: 'Sprint Retrospective', createdAt: new Date().toISOString() }]);
});

// VULNERABILITY 3: No input validation at all (High)
// VULNERABILITY 4: No sanitization → XSS (Critical)
app.post('/cards', (req, res) => {
  const card = {
    id: nextId++,
    text: req.body.text,              // Raw user input stored directly
    category: req.body.category,      // VULNERABILITY 5: No enum validation (Medium)
    author: req.body.author,          // Raw user input stored directly
    votes: 0,
    createdAt: new Date().toISOString()
  };
  cards.push(card);
  res.status(201).json(card);
});

// List cards with optional filter
app.get('/cards', (req, res) => {
  if (req.query.category) {
    // VULNERABILITY 6: Regex injection via user input (Medium)
    const pattern = new RegExp(req.query.category);
    return res.json(cards.filter(c => pattern.test(c.category)));
  }
  res.json(cards);
});

// Get single card
app.get('/cards/:id', (req, res) => {
  const card = cards.find(c => c.id === parseInt(req.params.id));
  if (!card) {
    // VULNERABILITY 7: Error response leaks server internals (Medium)
    return res.status(404).json({
      error: 'Card not found',
      searchedIn: `Memory array of ${cards.length} cards`,
      serverPath: __dirname,
      nodeVersion: process.version
    });
  }
  res.json(card);
});

// VULNERABILITY 8: No authentication — anyone can delete any card (High)
app.delete('/cards/:id', (req, res) => {
  const index = cards.findIndex(c => c.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  cards.splice(index, 1);
  res.json({ message: 'Deleted' });
});

// Vote on a card
app.post('/cards/:id/vote', (req, res) => {
  const card = cards.find(c => c.id === parseInt(req.params.id));
  if (!card) return res.status(404).json({ error: 'Not found' });
  card.votes += 1;
  res.json(card);
});

// VULNERABILITY 2: SQL Injection - Vulnerable login endpoint (Critical)
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // VULNERABLE: String concatenation in SQL query
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

  try {
    const user = db.prepare(query).get();
    if (user) {
      res.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
    } else {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// VULNERABILITY 9: Debug endpoint exposes process.env and server info (Critical)
app.get('/debug', (req, res) => {
  res.json({
    env: process.env,
    cards: cards,
    memory: process.memoryUsage(),
    uptime: process.uptime(),
    secret: API_SECRET
  });
});

app.listen(PORT, () => {
  console.log(`TeamBoard running on http://localhost:${PORT}`);
});

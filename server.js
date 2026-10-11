const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_DIR = path.join(__dirname, 'data');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');
const SEED_FILE = path.join(DATA_DIR, 'quote_history_seed.json');
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function readJson(file, fallback = []) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return fallback; }
}
function writeHistory(rows) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(rows, null, 2));
}
function history() { return readJson(HISTORY_FILE, []); }
const seedQuotes = readJson(SEED_FILE, []);

app.get('/api/health', (_req, res) => res.json({ ok: true, message: 'Quote API is running' }));
app.get('/api/quotes/random', async (_req, res) => {
  try {
    const response = await fetch('https://dummyjson.com/quotes/random', { signal: AbortSignal.timeout(4500) });
    if (!response.ok) throw new Error('Quote service unavailable');
    const q = await response.json();
    return res.json({ id: String(q.id), text: q.quote, author: q.author || 'Unknown', topic: 'Inspiration', source: 'api' });
  } catch {
    const q = seedQuotes[Math.floor(Math.random() * seedQuotes.length)] || { id: Date.now(), text: 'Great things are done by a series of small things brought together.', author: 'Vincent van Gogh', topic: 'Learning' };
    return res.json({ ...q, id: String(q.id), source: 'fallback' });
  }
});
app.get('/api/favorites', (_req, res) => res.json(history().filter(q => q.favorite)));
app.get('/api/history', (req, res) => {
  const term = String(req.query.q || '').trim().toLowerCase();
  let rows = history();
  if (term) rows = rows.filter(q => `${q.text} ${q.author} ${q.topic || ''}`.toLowerCase().includes(term));
  res.json(rows.sort((a,b) => new Date(b.savedAt) - new Date(a.savedAt)));
});
app.post('/api/history', (req, res) => {
  const { id, text, author, topic = 'Inspiration', favorite = false } = req.body || {};
  if (!text || !author) return res.status(400).json({ error: 'Quote text and author are required.' });
  const rows = history();
  const existing = rows.find(q => String(q.id) === String(id) && q.text === text);
  if (existing) {
    existing.favorite = Boolean(existing.favorite || favorite);
    existing.savedAt = new Date().toISOString();
    writeHistory(rows);
    return res.json(existing);
  }
  const item = { id: String(id || Date.now()), text, author, topic, favorite: Boolean(favorite), savedAt: new Date().toISOString() };
  rows.push(item); writeHistory(rows); res.status(201).json(item);
});
app.patch('/api/favorites/:id', (req, res) => {
  const rows = history();
  const item = rows.find(q => String(q.id) === String(req.params.id));
  if (!item) return res.status(404).json({ error: 'Quote not found in history. Save it first.' });
  item.favorite = Boolean(req.body.favorite); writeHistory(rows); res.json(item);
});
app.delete('/api/history/:id', (req, res) => {
  const rows = history(); const next = rows.filter(q => String(q.id) !== String(req.params.id));
  if (rows.length === next.length) return res.status(404).json({ error: 'Quote not found.' });
  writeHistory(next); res.json({ ok: true });
});
app.get('*path', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.listen(PORT, () => console.log(`\n✨ Quote Generator running at http://localhost:${PORT}\n`));

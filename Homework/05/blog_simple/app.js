const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const db = new Database('db.sqlite');

db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now','localtime')),
    updated_at TEXT DEFAULT (datetime('now','localtime'))
  )
`);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  const posts = db.prepare('SELECT * FROM posts ORDER BY created_at DESC').all();
  res.render('index', { posts });
});

app.get('/post/:id', (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).send('文章不存在');
  res.render('post', { post });
});

app.get('/new', (req, res) => {
  res.render('new');
});

app.post('/new', (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) return res.redirect('/new');
  db.prepare('INSERT INTO posts (title, content) VALUES (?, ?)').run(title, content);
  res.redirect('/');
});

app.get('/edit/:id', (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).send('文章不存在');
  res.render('edit', { post });
});

app.post('/edit/:id', (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) return res.redirect(`/edit/${req.params.id}`);
  db.prepare("UPDATE posts SET title = ?, content = ?, updated_at = datetime('now','localtime') WHERE id = ?")
    .run(title, content, req.params.id);
  res.redirect('/');
});

app.post('/delete/:id', (req, res) => {
  db.prepare('DELETE FROM posts WHERE id = ?').run(req.params.id);
  res.redirect('/');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

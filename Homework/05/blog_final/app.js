const express = require('express');
const session = require('express-session');
const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const path = require('path');
const crypto = require('crypto');

const app = express();
const db = new Database('db.sqlite');
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    display_name TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now','localtime'))
  );
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_public INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now','localtime')),
    updated_at TEXT DEFAULT (datetime('now','localtime'))
  );
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL REFERENCES posts(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    parent_id INTEGER REFERENCES comments(id),
    content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now','localtime'))
  );
  CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    target_type TEXT NOT NULL CHECK(target_type IN ('post','comment')),
    target_id INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now','localtime')),
    UNIQUE(user_id, target_type, target_id)
  );
  CREATE TABLE IF NOT EXISTS follows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    follower_id INTEGER NOT NULL REFERENCES users(id),
    following_id INTEGER NOT NULL REFERENCES users(id),
    created_at TEXT DEFAULT (datetime('now','localtime')),
    UNIQUE(follower_id, following_id)
  );
`);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
  resave: false,
  saveUninitialized: false
}));

app.use((req, res, next) => {
  res.locals.currentUser = null;
  if (req.session.userId) {
    const user = db.prepare('SELECT id, username, display_name, bio FROM users WHERE id = ?').get(req.session.userId);
    if (user) {
      req.currentUser = user;
      res.locals.currentUser = user;
    }
  }
  next();
});

function requireAuth(req, res, next) {
  if (!req.currentUser) return res.redirect('/login');
  next();
}

const AVATAR_COLORS = ['#1abc9c','#2ecc71','#3498db','#9b59b6','#e67e22','#e74c3c','#00bcd4','#ff5722'];
function getAvatarColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
function getInitials(str) { return str.charAt(0).toUpperCase(); }
function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return '剛剛';
  if (diff < 3600) return `${Math.floor(diff / 60)}分鐘前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小時前`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}天前`;
  return dateStr;
}
app.use((req, res, next) => {
  res.locals.getAvatarColor = getAvatarColor;
  res.locals.getInitials = getInitials;
  res.locals.timeAgo = timeAgo;
  next();
});

function buildCommentTree(comments) {
  const map = new Map();
  const roots = [];
  comments.forEach(c => { c.replies = []; map.set(c.id, c); });
  comments.forEach(c => {
    if (c.parent_id && map.has(c.parent_id)) map.get(c.parent_id).replies.push(c);
    else roots.push(c);
  });
  return roots;
}

function renderCommentTree(comments, depth) {
  let html = '';
  for (const c of comments) {
    const ml = depth * 24;
    html += `<div class="comment" style="margin-left:${ml}px">`;
    html += `<div class="comment-avatar" style="background:${getAvatarColor(c.username)}">${getInitials(c.display_name || c.username)}</div>`;
    html += `<div class="comment-body">`;
    html += `<a href="/user/${c.username}" class="comment-user">${c.display_name || c.username}</a>`;
    html += `<span class="comment-time">${timeAgo(c.created_at)}</span>`;
    html += `<div class="comment-content">${c.content}</div>`;
    html += `<div class="comment-actions">`;
    html += `<form action="/toggle-like/comment/${c.id}" method="POST" class="like-form">`;
    html += `<button type="submit" class="like-btn ${c.user_liked ? 'liked' : ''}">${c.user_liked ? '❤' : '♡'} ${c.like_count || ''}</button>`;
    html += `</form>`;
    if (depth < 5) {
      html += `<a href="/post/${c.post_id}?reply_to=${c.id}" class="reply-link">回覆</a>`;
    }
    html += `</div></div></div>`;
    if (c.replies.length) html += renderCommentTree(c.replies, depth + 1);
  }
  return html;
}
app.use((req, res, next) => {
  res.locals.renderCommentTree = renderCommentTree;
  next();
});

app.get('/register', (req, res) => {
  if (req.currentUser) return res.redirect('/');
  res.render('register', { error: null });
});
app.post('/register', (req, res) => {
  const { username, password, display_name } = req.body;
  if (!username || !password) return res.render('register', { error: '請填寫帳號與密碼' });
  if (username.length < 3) return res.render('register', { error: '帳號至少3個字元' });
  if (password.length < 4) return res.render('register', { error: '密碼至少4個字元' });
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) return res.render('register', { error: '帳號已被使用' });
  const hash = bcrypt.hashSync(password, 10);
  db.prepare('INSERT INTO users (username, password, display_name) VALUES (?, ?, ?)').run(username, hash, display_name || username);
  const user = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  req.session.userId = user.id;
  res.redirect('/');
});

app.get('/login', (req, res) => {
  if (req.currentUser) return res.redirect('/');
  res.render('login', { error: null });
});
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.render('login', { error: '請填寫帳號與密碼' });
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user || !bcrypt.compareSync(password, user.password)) return res.render('login', { error: '帳號或密碼錯誤' });
  req.session.userId = user.id;
  res.redirect('/');
});
app.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

app.get('/', (req, res) => {
  const uid = req.currentUser ? req.currentUser.id : 0;
  const search = (req.query.search || '').trim();
  const baseSQL = `
    SELECT p.*, u.username, u.display_name,
      (SELECT COUNT(*) FROM likes WHERE target_type='post' AND target_id=p.id) as like_count,
      (SELECT COUNT(*) FROM comments WHERE post_id=p.id) as comment_count,
      (SELECT COUNT(*) FROM likes WHERE target_type='post' AND target_id=p.id AND user_id=?) as user_liked
    FROM posts p JOIN users u ON p.user_id = u.id
  `;
  let sql, params;
  if (search) {
    sql = baseSQL + `WHERE (p.is_public = 1 OR p.user_id = ?) AND p.title LIKE ? ORDER BY p.created_at DESC`;
    params = [uid, uid, `%${search}%`];
  } else {
    sql = baseSQL + `WHERE (p.is_public = 1 OR p.user_id = ?) ORDER BY p.created_at DESC`;
    params = [uid, uid];
  }
  const posts = db.prepare(sql).all(...params);
  res.render('index', { posts, search });
});

app.get('/post/:id', (req, res) => {
  const post = db.prepare(`
    SELECT p.*, u.username, u.display_name,
      (SELECT COUNT(*) FROM likes WHERE target_type='post' AND target_id=p.id) as like_count
    FROM posts p JOIN users u ON p.user_id = u.id WHERE p.id = ?
  `).get(req.params.id);
  if (!post) return res.status(404).send('文章不存在');
  if (!post.is_public && (!req.currentUser || req.currentUser.id !== post.user_id))
    return res.status(403).send('此文章不公開');

  const uid = req.currentUser ? req.currentUser.id : 0;
  const comments = db.prepare(`
    SELECT c.*, u.username, u.display_name,
      (SELECT COUNT(*) FROM likes WHERE target_type='comment' AND target_id=c.id) as like_count,
      (SELECT COUNT(*) FROM likes WHERE target_type='comment' AND target_id=c.id AND user_id=?) as user_liked
    FROM comments c JOIN users u ON c.user_id = u.id WHERE c.post_id = ? ORDER BY c.created_at ASC
  `).all(uid, post.id);
  const commentTree = buildCommentTree(comments);
  const replyTo = req.query.reply_to ? parseInt(req.query.reply_to) : null;

  let replyTarget = null;
  if (replyTo) {
    replyTarget = db.prepare('SELECT id, content, user_id FROM comments WHERE id = ?').get(replyTo);
  }

  res.render('post', { post, commentTree, replyTo, replyTarget });
});

app.get('/new', requireAuth, (req, res) => {
  res.render('new', { post: null });
});
app.post('/new', requireAuth, (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) return res.redirect('/new');
  const isPublic = req.body.is_private === 'on' ? 0 : 1;
  db.prepare('INSERT INTO posts (user_id, title, content, is_public) VALUES (?, ?, ?, ?)').run(req.currentUser.id, title, content, isPublic);
  res.redirect('/');
});

app.get('/edit/:id', requireAuth, (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ? AND user_id = ?').get(req.params.id, req.currentUser.id);
  if (!post) return res.status(404).send('文章不存在');
  res.render('edit', { post });
});
app.post('/edit/:id', requireAuth, (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) return res.redirect(`/edit/${req.params.id}`);
  const isPublic = req.body.is_private === 'on' ? 0 : 1;
  db.prepare("UPDATE posts SET title=?, content=?, is_public=?, updated_at=datetime('now','localtime') WHERE id=? AND user_id=?")
    .run(title, content, isPublic, req.params.id, req.currentUser.id);
  res.redirect('/');
});
app.post('/delete/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM posts WHERE id=? AND user_id=?').run(req.params.id, req.currentUser.id);
  db.prepare('DELETE FROM comments WHERE post_id=?').run(req.params.id);
  db.prepare("DELETE FROM likes WHERE target_type='post' AND target_id=?").run(req.params.id);
  res.redirect('/');
});

app.post('/post/:id/comment', requireAuth, (req, res) => {
  const { content, parent_id } = req.body;
  if (!content) return res.redirect(`/post/${req.params.id}`);
  db.prepare('INSERT INTO comments (post_id, user_id, parent_id, content) VALUES (?, ?, ?, ?)').run(
    req.params.id, req.currentUser.id, parent_id || null, content
  );
  res.redirect(`/post/${req.params.id}`);
});

app.post('/toggle-like/:type/:id', requireAuth, (req, res) => {
  const { type, id } = req.params;
  if (!['post', 'comment'].includes(type)) return res.status(400).send('Invalid type');
  const existing = db.prepare('SELECT id FROM likes WHERE user_id=? AND target_type=? AND target_id=?')
    .get(req.currentUser.id, type, id);
  if (existing) db.prepare('DELETE FROM likes WHERE id=?').run(existing.id);
  else db.prepare('INSERT INTO likes (user_id, target_type, target_id) VALUES (?, ?, ?)').run(req.currentUser.id, type, id);
  res.redirect(req.get('Referer') || '/');
});

app.get('/user/:username', (req, res) => {
  const profileUser = db.prepare('SELECT * FROM users WHERE username=?').get(req.params.username);
  if (!profileUser) return res.status(404).send('使用者不存在');
  const uid = req.currentUser ? req.currentUser.id : 0;
  const showPrivate = req.currentUser && req.currentUser.id === profileUser.id;
  const posts = db.prepare(`
    SELECT p.*, u.username, u.display_name,
      (SELECT COUNT(*) FROM likes WHERE target_type='post' AND target_id=p.id) as like_count,
      (SELECT COUNT(*) FROM comments WHERE post_id=p.id) as comment_count,
      (SELECT COUNT(*) FROM likes WHERE target_type='post' AND target_id=p.id AND user_id=?) as user_liked
    FROM posts p JOIN users u ON p.user_id = u.id
    WHERE p.user_id=? AND (p.is_public=1 OR ?)
    ORDER BY p.created_at DESC
  `).all(uid, profileUser.id, showPrivate ? 1 : 0);
  const followerCount = db.prepare('SELECT COUNT(*) as c FROM follows WHERE following_id=?').get(profileUser.id).c;
  const followingCount = db.prepare('SELECT COUNT(*) as c FROM follows WHERE follower_id=?').get(profileUser.id).c;
  let isFollowing = false;
  if (req.currentUser && req.currentUser.id !== profileUser.id) {
    isFollowing = !!db.prepare('SELECT id FROM follows WHERE follower_id=? AND following_id=?').get(req.currentUser.id, profileUser.id);
  }
  res.render('profile', { profileUser, posts, followerCount, followingCount, isFollowing });
});

app.post('/follow/:id', requireAuth, (req, res) => {
  const fid = parseInt(req.params.id);
  if (fid === req.currentUser.id) return res.redirect('/');
  if (!db.prepare('SELECT id FROM follows WHERE follower_id=? AND following_id=?').get(req.currentUser.id, fid))
    db.prepare('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)').run(req.currentUser.id, fid);
  const u = db.prepare('SELECT username FROM users WHERE id=?').get(fid);
  res.redirect(`/user/${u.username}`);
});
app.post('/unfollow/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM follows WHERE follower_id=? AND following_id=?').run(req.currentUser.id, req.params.id);
  const u = db.prepare('SELECT username FROM users WHERE id=?').get(req.params.id);
  res.redirect(`/user/${u.username}`);
});

app.get('/settings', requireAuth, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.currentUser.id);
  res.render('settings', { user, success: null, error: null });
});
app.post('/settings', requireAuth, (req, res) => {
  const { display_name, bio } = req.body;
  db.prepare('UPDATE users SET display_name = ?, bio = ? WHERE id = ?').run(
    display_name || req.currentUser.username, bio || '', req.currentUser.id
  );
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.currentUser.id);
  res.render('settings', { user, success: '設定已更新', error: null });
});
app.post('/settings/password', requireAuth, (req, res) => {
  const { current_password, new_password, confirm_password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.currentUser.id);
  if (!bcrypt.compareSync(current_password, user.password))
    return res.render('settings', { user, success: null, error: '目前密碼不正確' });
  if (new_password.length < 4)
    return res.render('settings', { user, success: null, error: '新密碼至少4個字元' });
  if (new_password !== confirm_password)
    return res.render('settings', { user, success: null, error: '兩次密碼輸入不一致' });
  const hash = bcrypt.hashSync(new_password, 10);
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hash, req.currentUser.id);
  res.render('settings', { user, success: '密碼已更新', error: null });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

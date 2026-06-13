# 網誌專案程式碼細節

---

## blog_simple — 簡易 CRUD 網誌

### 專案結構

```
blog_simple/
├── app.js                  # 主程式（入口）
├── db.sqlite               # SQLite 資料庫（執行後自動產生）
├── package.json
├── public/
│   └── style.css           # 樣式表（41 行）
└── views/
    ├── index.ejs            # 首頁文章列表
    ├── post.ejs             # 單篇文章檢視
    ├── new.ejs              # 新增文章表單
    └── edit.ejs             # 編輯文章表單
```

---

### app.js — 主程式（68 行）

#### 1. 引入依賴與初始化（L1-L7）

```js
const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const db = new Database('db.sqlite');
```

- `better-sqlite3` — 同步操作的 SQLite 套件
- `db.sqlite` — 資料庫檔案，會在專案根目錄自動建立

#### 2. 建立資料表（L8-L17）

```js
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
```

- `journal_mode = WAL` — 啟用 WAL 模式，提升併發讀寫效能
- `posts` 資料表有 5 個欄位
- `datetime('now','localtime')` — SQLite 函數，產生當地時間字串

#### 3. 中介軟體設定（L19-L22）

```js
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
```

- EJS 模板引擎
- 靜態檔案服務（CSS）
- `urlencoded` — 解析 POST 表單資料

#### 4. 路由：首頁（L24-L27）

```js
app.get('/', (req, res) => {
  const posts = db.prepare('SELECT * FROM posts ORDER BY created_at DESC').all();
  res.render('index', { posts });
});
```

- `db.prepare(sql).all()` — 執行查詢並回傳所有結果陣列
- `ORDER BY created_at DESC` — 最新文章在前

#### 5. 路由：檢視單篇文章（L29-L33）

```js
app.get('/post/:id', (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).send('文章不存在');
  res.render('post', { post });
});
```

- `:id` — Express 路由參數
- `.get()` — 回傳單一筆或 `undefined`
- 404 處理：若文章不存在，回傳 404 狀態碼

#### 6. 路由：新增文章（L35-L44）

```js
app.get('/new', (req, res) => {
  res.render('new');
});

app.post('/new', (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) return res.redirect('/new');
  db.prepare('INSERT INTO posts (title, content) VALUES (?, ?)').run(title, content);
  res.redirect('/');
});
```

- `req.body` — 從表單 POST 解析的資料
- `?` — 參數化查詢，防止 SQL Injection
- 空值檢查：若無標題或內容則重新導向回表單

#### 7. 路由：編輯文章（L46-L58）

```js
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
```

- `updated_at` 在更新時一併修改

#### 8. 路由：刪除文章（L60-L63）

```js
app.post('/delete/:id', (req, res) => {
  db.prepare('DELETE FROM posts WHERE id = ?').run(req.params.id);
  res.redirect('/');
});
```

#### 9. 啟動伺服器（L65-L68）

```js
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
```

---

### views/index.ejs — 首頁（39 行）

```html
<!-- 文章列表 -->
<% posts.forEach(post => { %>
  <article>
    <h2><a href="/post/<%= post.id %>"><%= post.title %></a></h2>
    <div class="meta">
      <span>建立: <%= post.created_at %></span>
      <span>更新: <%= post.updated_at %></span>
    </div>
    <p><%= post.content.slice(0, 200) %><% if (post.content.length > 200) { %>...<% } %></p>
    <div class="actions">
      <a href="/post/<%= post.id %>" class="btn">閱讀更多</a>
      <a href="/edit/<%= post.id %>" class="btn edit">編輯</a>
      <form action="/delete/<%= post.id %>" method="POST" onsubmit="return confirm('確定刪除？')">
        <button type="submit" class="btn delete">刪除</button>
      </form>
    </div>
  </article>
<% }) %>
```

- `.slice(0, 200)` — 內容超過 200 字時截斷並顯示「...」
- 編輯和刪除按鈕直接顯示在每篇文章下方（無權限控制）

### views/post.ejs — 文章詳情（31 行）

```html
<article class="full">
  <h2><%= post.title %></h2>
  <div class="meta">
    <span>建立: <%= post.created_at %></span>
    <span>更新: <%= post.updated_at %></span>
  </div>
  <div class="content"><%= post.content %></div>
  <div class="actions">
    <a href="/edit/<%= post.id %>" class="btn edit">編輯</a>
    <form action="/delete/<%= post.id %>" method="POST" onsubmit="return confirm('確定刪除？')">
      <button type="submit" class="btn delete">刪除</button>
    </form>
  </div>
</article>
```

### views/new.ejs — 新增表單（24 行）

```html
<form action="/new" method="POST">
  <label for="title">標題</label>
  <input type="text" id="title" name="title" required>
  <label for="content">內容</label>
  <textarea id="content" name="content" rows="12" required></textarea>
  <button type="submit" class="btn">發布文章</button>
</form>
```

### views/edit.ejs — 編輯表單（24 行）

```html
<form action="/edit/<%= post.id %>" method="POST">
  <label for="title">標題</label>
  <input type="text" id="title" name="title" value="<%= post.title %>" required>
  <label for="content">內容</label>
  <textarea id="content" name="content" rows="12" required><%= post.content %></textarea>
  <button type="submit" class="btn">更新文章</button>
</form>
```

### public/style.css — 樣式（41 行）

```css
* { margin: 0; padding: 0; box-sizing: border-box; }
```

- `max-width: 720px` — 內容寬度限制
- 卡片式設計（白色背景、圓角、陰影）
- 按鈕顏色：藍色（一般）、灰色（編輯）、紅色（刪除）

---

## blog_final — 完整社群網誌平台

### 專案結構

```
blog_final/
├── app.js                  # 主程式（340 行）
├── db.sqlite               # SQLite 資料庫
├── package.json
├── public/
│   └── style.css           # 樣式表（241 行）
└── views/
    ├── partials/
    │   ├── header.ejs       # 開頭 + 左側欄
    │   └── footer.ejs       # 右側欄 + 結尾
    ├── index.ejs            # 首頁（含搜尋）
    ├── post.ejs             # 文章詳情（含留言）
    ├── new.ejs              # 新增文章
    ├── edit.ejs             # 編輯文章
    ├── login.ejs            # 登入（獨立版型）
    ├── register.ejs         # 註冊（獨立版型）
    ├── profile.ejs          # 個人檔案
    └── settings.ejs         # 設定頁面
```

---

### app.js — 主程式（340 行）

#### 1. 引入依賴（L1-L6）

```js
const express = require('express');
const session = require('express-session');
const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const path = require('path');
const crypto = require('crypto');
```

| 套件 | 用途 |
|---|---|
| express-session | Session 管理，記住登入狀態 |
| bcrypt | 密碼雜湊（單向加密） |
| crypto | Node.js 內建，產生隨機 session secret |

#### 2. 資料庫建立 — 5 張資料表（L12-L53）

**users 表**
```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  display_name TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now','localtime'))
);
```
- `UNIQUE` — 使用者名稱不可重複

**posts 表（含 user_id）**
```sql
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_public INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now','localtime')),
  updated_at TEXT DEFAULT (datetime('now','localtime'))
);
```
- `REFERENCES users(id)` — 外鍵約束，指向 users 表
- `is_public` — 1 為公開，0 為私人

**comments 表（含 parent_id 巢狀回覆）**
```sql
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL REFERENCES posts(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  parent_id INTEGER REFERENCES comments(id),
  content TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now','localtime'))
);
```
- `parent_id` — 可為 NULL，指向同一張表的 id，形成階層

**likes 表**
```sql
CREATE TABLE IF NOT EXISTS likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  target_type TEXT NOT NULL CHECK(target_type IN ('post','comment')),
  target_id INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now','localtime')),
  UNIQUE(user_id, target_type, target_id)
);
```
- `CHECK` 限制 `target_type` 只能是 `'post'` 或 `'comment'`
- `UNIQUE` 防止同一人重複按讚

**follows 表**
```sql
CREATE TABLE IF NOT EXISTS follows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  follower_id INTEGER NOT NULL REFERENCES users(id),
  following_id INTEGER NOT NULL REFERENCES users(id),
  created_at TEXT DEFAULT (datetime('now','localtime')),
  UNIQUE(follower_id, following_id)
);
```

#### 3. 中介軟體設定（L55-L63）

```js
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
  resave: false,
  saveUninitialized: false
}));
```

- `session.secret` — 簽署 session ID 的密鑰；若無環境變數則自動隨機產生
- `resave: false` — 只有 session 有變更時才存檔
- `saveUninitialized: false` — 未初始化的 session 不儲存

#### 4. 使用者中介軟體（L65-L80）

```js
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
```

- `res.locals` — Express 內建，所有視圖都可以直接取用這些變數
- `requireAuth` — 路由守衛，未登入時跳轉至登入頁

#### 5. 輔助函數（L82-L140）

**頭像顏色（DJB2 雜湊）**
```js
const AVATAR_COLORS = ['#1abc9c','#2ecc71','#3498db','#9b59b6','#e67e22','#e74c3c','#00bcd4','#ff5722'];
function getAvatarColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
```
- DJB2 字串雜湊演算法
- 8 色調色盤，同一使用者永遠得到相同顏色

**取得 initials**
```js
function getInitials(str) { return str.charAt(0).toUpperCase(); }
```

**相對時間**
```js
function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return '剛剛';
  if (diff < 3600) return `${Math.floor(diff / 60)}分鐘前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小時前`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}天前`;
  return dateStr;
}
```

**留言樹建立**
```js
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
```
- 第一輪走訪：建立 id → comment 的 Map
- 第二輪走訪：有 parent_id 的放入父親的 replies，沒有 parent_id 的放入 roots

**留言樹渲染**
```js
function renderCommentTree(comments, depth) {
  let html = '';
  for (const c of comments) {
    const ml = depth * 24;
    html += `<div class="comment" style="margin-left:${ml}px">`;
    // ... 渲染留言內容、按讚、回覆按鈕 ...
    if (c.replies.length) html += renderCommentTree(c.replies, depth + 1);
  }
  return html;
}
```
- 遞迴渲染巢狀留言
- `margin-left` 依深度遞增，形成視覺縮排
- 深度限制 5 層

輔助函數註冊為全域變數：
```js
app.use((req, res, next) => {
  res.locals.getAvatarColor = getAvatarColor;
  res.locals.getInitials = getInitials;
  res.locals.timeAgo = timeAgo;
  res.locals.renderCommentTree = renderCommentTree;
  next();
});
```

#### 6. 註冊（L142-L158）

```js
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
```

- 驗證順序：空值 → 長度 → 唯一性 → 寫入
- `bcrypt.hashSync(password, 10)` — 10 個 salt 回合
- 註冊成功後立即登入（設定 `req.session.userId`）

#### 7. 登入／登出（L160-L174）

```js
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.render('login', { error: '帳號或密碼錯誤' });
  req.session.userId = user.id;
  res.redirect('/');
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});
```

- `bcrypt.compareSync(plain, hash)` — 比對明文與雜湊

#### 8. 首頁 — 含搜尋與權限過濾（L176-L196）

```js
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
```

| 子查詢 | 功能 |
|---|---|
| `like_count` | 這篇文章的讚數 |
| `comment_count` | 這篇文章的留言數 |
| `user_liked` | 當前使用者是否按過讚（0 或 1） |

- `WHERE (p.is_public = 1 OR p.user_id = ?)` — 公開文章 或 自己的私人文章
- `LIKE %?%` — SQL 模糊搜尋

#### 9. 文章詳情 — 含留言與巢狀回覆（L198-L224）

```js
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
  // ...
});
```

- 私人文章權限檢查：非作者回傳 403
- 留言子查訊同樣包含 `like_count` 和 `user_liked`
- `req.query.reply_to` — 透過 URL 參數指定要回覆哪一則留言

#### 10. 新增文章 — 含公開／私人切換（L226-L235）

```js
app.post('/new', requireAuth, (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) return res.redirect('/new');
  const isPublic = req.body.is_private === 'on' ? 0 : 1;
  db.prepare('INSERT INTO posts (user_id, title, content, is_public) VALUES (?, ?, ?, ?)')
    .run(req.currentUser.id, title, content, isPublic);
  res.redirect('/');
});
```

- `requireAuth` 中介軟體確保只有登入者能寫文章
- `req.body.is_private === 'on'` — checkbox 未勾選時不回傳此值，此時 `is_private` 為 `undefined`，比較結果為 `false`，所以 `isPublic = 1`

#### 11. 編輯／刪除文章 — 所有權檢查（L237-L255）

```js
app.get('/edit/:id', requireAuth, (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.currentUser.id);
  if (!post) return res.status(404).send('文章不存在');
  res.render('edit', { post });
});

app.post('/delete/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM posts WHERE id=? AND user_id=?').run(req.params.id, req.currentUser.id);
  db.prepare('DELETE FROM comments WHERE post_id=?').run(req.params.id);
  db.prepare("DELETE FROM likes WHERE target_type='post' AND target_id=?").run(req.params.id);
  res.redirect('/');
});
```

- `WHERE id=? AND user_id=?` — 確保只能操作自己的文章
- 刪除文章時一併清除相關留言和按讚（串聯刪除）

#### 12. 留言（L257-L264）

```js
app.post('/post/:id/comment', requireAuth, (req, res) => {
  const { content, parent_id } = req.body;
  if (!content) return res.redirect(`/post/${req.params.id}`);
  db.prepare('INSERT INTO comments (post_id, user_id, parent_id, content) VALUES (?, ?, ?, ?)')
    .run(req.params.id, req.currentUser.id, parent_id || null, content);
  res.redirect(`/post/${req.params.id}`);
});
```

- `parent_id` 可為 `null`（一般留言）或數字（回覆特定留言）

#### 13. 按讚／收回讚（L266-L274）

```js
app.post('/toggle-like/:type/:id', requireAuth, (req, res) => {
  const { type, id } = req.params;
  if (!['post', 'comment'].includes(type)) return res.status(400).send('Invalid type');
  const existing = db.prepare('SELECT id FROM likes WHERE user_id=? AND target_type=? AND target_id=?')
    .get(req.currentUser.id, type, id);
  if (existing) db.prepare('DELETE FROM likes WHERE id=?').run(existing.id);
  else db.prepare('INSERT INTO likes (user_id, target_type, target_id) VALUES (?, ?, ?)')
    .run(req.currentUser.id, type, id);
  res.redirect(req.get('Referer') || '/');
});
```

- 切換邏輯：已按讚 → 收回；未按讚 → 新增
- `Referer` — 按讚後回到原本瀏覽的頁面

#### 14. 個人檔案（L276-L297）

```js
app.get('/user/:username', (req, res) => {
  const profileUser = db.prepare('SELECT * FROM users WHERE username=?').get(req.params.username);
  if (!profileUser) return res.status(404).send('使用者不存在');
  const uid = req.currentUser ? req.currentUser.id : 0;
  const showPrivate = req.currentUser && req.currentUser.id === profileUser.id;
  const posts = db.prepare(`
    SELECT p.*, u.username, u.display_name, ...
    FROM posts p JOIN users u ON p.user_id = u.id
    WHERE p.user_id=? AND (p.is_public=1 OR ?)
    ORDER BY p.created_at DESC
  `).all(uid, profileUser.id, showPrivate ? 1 : 0);
  const followerCount = db.prepare('SELECT COUNT(*) as c FROM follows WHERE following_id=?').get(profileUser.id).c;
  const followingCount = db.prepare('SELECT COUNT(*) as c FROM follows WHERE follower_id=?').get(profileUser.id).c;
  // ...
});
```

- `showPrivate` — 只有本人能看到自己的私人文章
- 兩個 COUNT 查詢分別計算粉絲數和追蹤中數

#### 15. 追蹤／取消追蹤（L299-L311）

```js
app.post('/follow/:id', requireAuth, (req, res) => {
  const fid = parseInt(req.params.id);
  if (fid === req.currentUser.id) return res.redirect('/');
  if (!db.prepare('SELECT id FROM follows WHERE follower_id=? AND following_id=?').get(req.currentUser.id, fid))
    db.prepare('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)').run(req.currentUser.id, fid);
  const u = db.prepare('SELECT username FROM users WHERE id=?').get(fid);
  res.redirect(`/user/${u.username}`);
});
```

- 不能追蹤自己
- 先檢查是否已追蹤，避免重複

#### 16. 設定頁面 — 含修改密碼（L313-L337）

```js
app.post('/settings', requireAuth, (req, res) => {
  const { display_name, bio } = req.body;
  db.prepare('UPDATE users SET display_name = ?, bio = ? WHERE id = ?')
    .run(display_name || req.currentUser.username, bio || '', req.currentUser.id);
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
```

- 修改密碼需驗證目前密碼、長度、兩次輸入一致

---

### EJS 視圖細節

#### Partial：header.ejs（38 行）

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><%= typeof title !== 'undefined' ? title + ' - ' : '' %>Threads 網誌</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
<div class="layout">
  <aside class="sidebar-left">
    <% if (currentUser) { %>
      <!-- 使用者卡片 + 導覽選單 -->
    <% } else { %>
      <!-- 訪客版本 -->
    <% } %>
  </aside>
  <main class="content">
```

- 三欄式版面起始
- 左側欄：使用者大頭貼、名稱、導覽連結（首頁、寫文章、個人檔案、設定）
- `typeof title !== 'undefined'` — 頁面標題可自訂

#### Partial：footer.ejs（41 行）

```html
  </main>
  <aside class="sidebar-right">
    <% if (currentUser) { %>
      <!-- 右側使用者卡片 + 登出按鈕 -->
    <% } else { %>
      <!-- 登入／註冊 CTA -->
    <% } %>
  </aside>
</div>
<div id="toast" class="toast">連結已複製</div>
<script>
function sharePost(id) {
  var url = window.location.origin + '/post/' + id;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(function() {
      var el = document.getElementById('toast');
      el.classList.add('show');
      setTimeout(function() { el.classList.remove('show'); }, 2000);
    });
  }
}
</script>
```

- 右側欄：登入狀態資訊或登入／註冊按鈕
- `sharePost()` — 複製文章網址至剪貼簿 + Toast 通知
- Toast 顯示 2 秒後自動隱藏

#### index.ejs（38 行）

```html
<div class="content-header">
  <form class="search-form" action="/" method="GET">
    <input type="text" name="search" placeholder="搜尋文章標題..." value="<%= search %>">
    <button type="submit">搜尋</button>
  </form>
</div>
<% posts.forEach(p => { %>
  <div class="post">
    <div class="post-header">
      <div class="avatar" style="background:<%= getAvatarColor(p.username) %>">
        <%= getInitials(p.display_name || p.username) %>
      </div>
      <a href="/user/<%= p.username %>" class="post-user"><%= p.display_name || p.username %></a>
      <% if (!p.is_public) { %><span class="post-badge">私人</span><% } %>
      <span class="post-time"><%= timeAgo(p.created_at) %></span>
    </div>
    <div class="post-title"><a href="/post/<%= p.id %>"><%= p.title %></a></div>
    <div class="post-content"><%= p.content %></div>
    <div class="actions-bar">
      <!-- 按讚表單：toggle-like -->
      <!-- 留言數連結 -->
      <!-- 分享按鈕 -->
    </div>
  </div>
<% }) %>
```

#### post.ejs（55 行）

```html
<div class="comment-section">
  <h3>留言 (<%= commentTree.length %>)</h3>
  <% if (currentUser) { %>
    <div class="comment-form-wrap" id="comment-form">
      <form action="/post/<%= post.id %>/comment" method="POST">
        <% if (replyTo) { %>
          <input type="hidden" name="parent_id" value="<%= replyTo %>">
          <div class="reply-info">
            正在回覆 ...
            <a href="/post/<%= post.id %>">取消</a>
          </div>
        <% } %>
        <textarea name="content" placeholder="撰寫留言..." required></textarea>
        <button type="submit">發布</button>
      </form>
    </div>
  <% } %>
  <%- renderCommentTree(commentTree, 0) %>
</div>
```

- 若 `replyTo` 有值，顯示回覆對象 + 取消連結
- `<%- renderCommentTree(commentTree, 0) %>` — 不跳脫 HTML 直接輸出

#### profile.ejs（48 行）

```html
<div class="profile-header">
  <div class="profile-avatar" style="background:<%= getAvatarColor(profileUser.username) %>">
    <%= getInitials(profileUser.display_name || profileUser.username) %>
  </div>
  <div class="profile-name"><%= profileUser.display_name || profileUser.username %></div>
  <div class="profile-username">@<%= profileUser.username %></div>
  <% if (profileUser.bio) { %><div class="profile-bio"><%= profileUser.bio %></div><% } %>
  <div class="profile-stats">
    <span><strong><%= posts.length %></strong> 篇文章</span>
    <span><strong><%= followerCount %></strong> 粉絲</span>
    <span><strong><%= followingCount %></strong> 追蹤中</span>
  </div>
  <!-- 追蹤按鈕（本人顯示「寫文章」，他人顯示追蹤/取消） -->
</div>
```

#### settings.ejs（38 行）

- 兩個表單：個人資料設定 + 密碼變更
- `<hr class="form-divider">` 分隔兩個區塊
- 成功訊息和錯誤訊息以不同 class 顯示

#### login.ejs 與 register.ejs

- 獨立完整 HTML（不使用 header/footer partials）
- 置中單欄版面，適合未登入的使用者

---

### CSS 架構（style.css，241 行）

| 區段 | 行數 | 說明 |
|---|---|---|
| Reset | L1-L7 | 全域樣式重置 |
| Layout | L9-L15 | 三欄 Grid：260px / 1fr / 260px |
| Left Sidebar | L17-L36 | 使用者卡片、導覽選單 |
| Center Content | L38-L59 | 搜尋列、內容區域 |
| Right Sidebar | L61-L97 | 使用者狀態、登入/登出按鈕 |
| Post Card | L99-L124 | 文章卡片、header、按讚列 |
| Post Detail | L126-L129 | 文章詳情 |
| Comments | L131-L163 | 留言區、表單、巢狀縮排 |
| Forms | L165-L191 | 一般表單、checkbox、按鈕 |
| Auth Pages | L193-L200 | 登入/註冊頁面 |
| Profile | L202-L226 | 大頭貼、統計、追蹤按鈕 |
| Toast | L228-L235 | 複製通知 |
| Responsive | L237-L241 | 螢幕 < 900px 時隱藏側欄 |

**RWD 關鍵**
```css
@media (max-width: 900px) {
  .layout { grid-template-columns: 1fr; }
  .sidebar-left, .sidebar-right { display: none; }
}
```

---

### 資料庫關聯圖

```
users
  ├── posts.user_id (1 對多)
  ├── comments.user_id (1 對多)
  ├── likes.user_id (1 對多)
  ├── follows.follower_id (1 對多)
  └── follows.following_id (1 對多)

posts
  ├── comments.post_id (1 對多)
  └── likes (多型關聯：target_type='post')

comments
  ├── comments.parent_id (自我參照，巢狀回覆)
  └── likes (多型關聯：target_type='comment')
```

---

### 路由總表

| 路由 | 方法 | 權限 | 功能 |
|---|---|---|---|
| `/` | GET | 公開 | 首頁（含搜尋） |
| `/register` | GET/POST | 未登入 | 註冊 |
| `/login` | GET/POST | 未登入 | 登入 |
| `/logout` | POST | 已登入 | 登出 |
| `/new` | GET/POST | 已登入 | 新增文章 |
| `/post/:id` | GET | 公開* | 檢視文章 + 留言 |
| `/edit/:id` | GET/POST | 作者 | 編輯文章 |
| `/delete/:id` | POST | 作者 | 刪除文章 |
| `/post/:id/comment` | POST | 已登入 | 新增留言 |
| `/toggle-like/:type/:id` | POST | 已登入 | 按讚／收回 |
| `/user/:username` | GET | 公開 | 個人檔案 |
| `/follow/:id` | POST | 已登入 | 追蹤使用者 |
| `/unfollow/:id` | POST | 已登入 | 取消追蹤 |
| `/settings` | GET/POST | 已登入 | 修改個人資料 |
| `/settings/password` | POST | 已登入 | 修改密碼 |

\* 私人文章僅作者可看

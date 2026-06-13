# 網誌專案開發對話記錄

## 專案概述
使用 Node.js + Express + EJS + SQLite 打造的逐步進階網誌系統，位於 `05/` 目錄下，包含兩個版本：`blog_simple/`（簡易 CRUD）與 `blog_final/`（完整社群平台）。

---

## 開發過程 — blog_simple 基礎版

### 建立專案結構
初始化 Node.js 專案，安裝 Express、EJS、better-sqlite3 依賴，建立 `app.js` 主程式與 `views/` 資料夾。

### 資料庫設計 — posts 資料表
單一張 `posts` 資料表，欄位：
- `id` — 主鍵，自動遞增
- `title` — 文章標題
- `content` — 文章內容
- `created_at` — 建立時間（預設當前時間戳）
- `updated_at` — 更新時間

啟用 SQLite WAL 模式提升讀寫效能。

### 路由實作（7 條路由）
| 路由 | 方法 | 功能 |
|---|---|---|
| `/` | GET | 首頁，列出所有文章（最新在前） |
| `/new` | GET | 顯示新增文章表單 |
| `/new` | POST | 送出新增文章 |
| `/post/:id` | GET | 檢視單篇文章 |
| `/edit/:id` | GET | 顯示編輯文章表單 |
| `/edit/:id` | POST | 送出編輯更新 |
| `/delete/:id` | POST | 刪除文章 |

### 前端視圖（4 個 EJS 檔案）
- `index.ejs` — 文章列表頁
- `post.ejs` — 單篇文章檢視頁
- `new.ejs` — 新增文章表單
- `edit.ejs` — 編輯文章表單

每個檔案獨立包含完整 HTML 結構。CSS 約 41 行，採用卡片式佈局、藍色按鈕、無襯線字體。

---

## 開發過程 — blog_final 完整社群平台

### 安裝額外依賴
- `bcrypt` — 密碼雜湊處理
- `express-session` — Session 為基礎的使用者登入狀態管理

### 資料庫擴充（5 張資料表）

**users 表**
| 欄位 | 說明 |
|---|---|
| id | 主鍵 |
| username | 使用者名稱（唯一） |
| password | bcrypt 雜湊密碼 |
| display_name | 顯示名稱 |
| bio | 自我介紹 |
| created_at | 註冊時間 |

**posts 表（擴充）**
在原有基礎上新增 `user_id`（FK → users.id）與 `is_public`（boolean，公開／私人切換）。

**comments 表**
| 欄位 | 說明 |
|---|---|
| id | 主鍵 |
| post_id | FK → posts.id |
| user_id | FK → users.id |
| parent_id | FK → comments.id（可為 NULL，支援巢狀回覆） |
| content | 留言內容 |
| created_at | 留言時間 |

**likes 表**
| 欄位 | 說明 |
|---|---|
| id | 主鍵 |
| user_id | FK → users.id |
| target_type | 'post' 或 'comment'（CHECK 約束） |
| target_id | 對應目標的 id |
| created_at | 按讚時間 |

唯一約束：`(user_id, target_type, target_id)` 防止重複按讚。

**follows 表**
| 欄位 | 說明 |
|---|---|
| id | 主鍵 |
| follower_id | FK → users.id（追蹤者） |
| following_id | FK → users.id（被追蹤者） |
| created_at | 追蹤時間 |

唯一約束：`(follower_id, following_id)` 防止重複追蹤。

### 身分驗證系統
- **註冊**：驗證使用者名稱唯一性、密碼長度 ≥ 4，bcrypt 雜湊儲存
- **登入**：比對 bcrypt 密碼雜湊，建立 session
- **登出**：清除 session
- **中介軟體 `requireAuth`**：未登入時重新導向至 `/login`
- **全域中介軟體**：每次請求載入 `req.currentUser` 與 `res.locals.currentUser`

### 文章系統擴充
- 新增文章時可選擇公開或私人
- 首頁查詢過濾：`WHERE (p.is_public = 1 OR p.user_id = ?)`
- 私人文章僅作者可檢視，非作者存取回傳 403
- 僅文章作者可編輯與刪除

### 階層式留言系統
- 留言以 `parent_id` 儲存，回覆時填入父留言的 id
- `buildCommentTree(comments)` — 將平坦資料組裝成巢狀結構
- `renderCommentTree(comments, depth)` — 伺服器端遞迴渲染 HTML，限制深度 5 層

### 按讚／收回讚
- `POST /toggle-like/:type/:id` — 檢查是否已按讚
- 已按讚則刪除（收回），未按讚則新增
- 資料庫 `UNIQUE` 約束防止重複
- 按讚後重新導向至 `Referer` 保持所在頁面

### 追蹤系統
- 使用者個人檔案頁面顯示追蹤者與追蹤中數量
- `POST /follow/:id` 與 `POST /unfollow/:id`

### 個人檔案頁面
- `GET /user/:username` — 顯示使用者資訊、文章列表
- 使用自動頭像系統（依使用者名稱雜湊決定顏色 + 取第一個字母大寫）
- 顯示發文數、留言數、追蹤統計

### 設定頁面
- 修改顯示名稱與自我介紹
- 修改密碼（需驗證目前密碼、新密碼一致性與長度）

### 搜尋功能
- 首頁加入搜尋欄位，以 `LIKE` 查詢比對文章標題

### 前端加強
- 採用三欄式版面（左側使用者卡片、中間主要內容、右側狀態面板）
- EJS partials 統一佈局（`header.ejs`、`footer.ejs`）
- CSS 擴充至 241 行
- RWD 響應式設計（螢幕寬度 < 900px 時切換為單欄）
- 分享按鈕：`navigator.clipboard.writeText()` 複製網址 + Toast 提示
- 頭像系統：8 色調色盤、DJB2 雜湊演算法分配顏色

---

## 對話記錄

### 第一則訊息 — 新增 .gitignore
**使用者：**
> 請在我的專案目錄 `D:\學期課程\網頁設計\_wp\Homework\gitignore` 中加入 nodejs 需要過濾的條件進去

**處理過程：**
1. 檢查路徑，`.gitignore` 不存在，`Homework/` 下僅有 `01/`~`05/` 子目錄
2. 確認專案為 Node.js，建立 `.gitignore`
3. 加入標準規則：`node_modules/`、`*.log`、`.env`、`dist/`、`build/`、`coverage/`、`.vscode/`、`.DS_Store`、`Thumbs.db` 等

---

### 第二則訊息 — 撰寫對話摘要
**使用者：**
> 將我這次創建網誌的對話摘要寫在 `05/_doc/blog_chat.md` 裡

**處理過程：**
1. 發現 `_doc/` 已存在，`blog_chat.md` 為空
2. 用探索 agent 深入分析 `blog_simple/` 與 `blog_final/` 完整原始碼
3. 產出含專案概述與對話要點的摘要文件

---

### 第三則訊息 — 修改為詳細對話記錄
**使用者：**
> 修改成更詳細的版本，我的對話保留，你的回答摘要

**處理過程：**
1. 將文件改為對話記錄格式
2. 使用者原文以引用保留，助手回答摘要為「處理過程」
3. 補充開發過程細節

---

### 第四則訊息 — 完整開發過程
**使用者：**
> 將我創建網誌的過程詳細寫出來，我的對話保留，你的回答只要摘要

**處理過程：**
1. 根據對程式碼的深入分析，重建從 blog_simple 到 blog_final 的完整開發脈絡
2. 依功能模組分類說明：資料庫設計、路由實作、身分驗證、留言、按讚、追蹤、前端等
3. 保留所有對話記錄，將每則回覆整理為「處理過程」摘要
4. 產出此最終版本

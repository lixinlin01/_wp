# 全方位 JavaScript 實作挑戰：從基礎到後端邏輯

## 題目列表

| # | 題目 | 說明 | 對應概念 |
|---|------|------|----------|
| 1 | 物件屬性存取 | 用點符號與中括號存取物件屬性 | `post.title` |
| 2 | 物件解構賦值 | 從 `req.body` 一行取出 title 和 content | `const { title, content } = req.body` |
| 3 | 陣列遍歷與字串拼接 | 用 `forEach` 產生 HTML 字串 | 首頁文章列表渲染 |
| 4 | 字典與動態參數 | 模擬 URL 參數物件，動態新增屬性 | `req.params.id` |
| 5 | Error-First Callback | callback 傳入 `(null, data)` 回傳資料 | `getPost(id, callback)` |
| 6 | JSON 處理 | `JSON.parse` 將 JSON 字串轉為物件 | `express.json()` |
| 7 | 模擬資料庫查詢 | callback 回傳假資料，模擬 `db.get` | `db.get(sql, params, callback)` |
| 8 | 樣板字串邏輯運算 | 三元運算子決定顯示內容 | HTML 模板產生 |
| 9 | 字串切片 | `substring(0, 10)` 截斷長字串 | 文章摘要顯示 |
| 10 | 錯誤優先回呼 | callback 第一個參數放錯誤訊息 | `if (err) return ...` 防禦寫法 |


## 使用方式

```bash
node 01_object_property_access.js
node 10_check_admin.js
```

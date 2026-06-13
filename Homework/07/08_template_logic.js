// 8. 樣板字串中的邏輯運算 (Template Literals with Logic)
// 目標：理解網頁 HTML 模板的產生

const user = "Guest";
const html = `<h1>Welcome, ${user ? user : "Stranger"}</h1>`;

console.log(html); // <h1>Welcome, Guest</h1>

// 測試無使用者情境
const user2 = "";
const html2 = `<h1>Welcome, ${user2 ? user2 : "Stranger"}</h1>`;

console.log(html2); // <h1>Welcome, Stranger</h1>

// 2. 物件解構賦值 (Object Destructuring)
// 目標：理解 const { title, content } = req.body;

const req = {
  body: { title: "JS教學", content: "內容在此", author: "Gemini" }
};

// 一行解構 req.body 中的 title 與 content
const { title, content } = req.body;

console.log(title);   // JS教學
console.log(content); // 內容在此

// 1. 物件屬性存取 (Object Property Access)
// 目標：理解 post.title 的運作

const post = {
  id: 1,
  title: "Hello World",
  content: "Markdown content"
};

// 點符號 (Dot notation)
console.log(post.title);

// 中括號 (Bracket notation)
console.log(post["title"]);

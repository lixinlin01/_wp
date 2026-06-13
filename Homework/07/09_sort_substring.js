// 9. 陣列物件的排序與切片 (Sort & Substring)
// 目標：取出字串前 10 個字元並加上 "..."

const contents = [
  "Very long content here",
  "Another Very long content here",
  "3rd Very long content here"
];

contents.forEach(content => {
  console.log(content.substring(0, 10) + "...");
});

// 預期輸出：
// Very long ...
// Another Ve...
// 3rd Very l...

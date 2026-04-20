// 練習 5：尋找最高分學生 (Function, Array, Object, For Loop, If)

function getTopStudent(students) {
  // 假設陣列的第一個學生是目前最高分的 (用來當作初始比較基準)
  let topStudent = students[0];
  
  // 從第二個學生 (索引 1) 開始往後比較
  for (let i = 1; i < students.length; i++) {
    // 如果目前這個學生的分數，大於我們先前記錄的最高分
    if (students[i].score > topStudent.score) {
      // 就把最高分學生的頭銜換成他
      topStudent = students[i];
    }
  }
  
  // 回傳最高分的那個學生「物件」
  return topStudent;
}

// 測試程式碼
const classList = [
  { name: "John", score: 85 },
  { name: "Mary", score: 92 },
  { name: "Tom", score: 78 }
];
console.log(getTopStudent(classList)); // 預期輸出: { name: 'Mary', score: 92 }
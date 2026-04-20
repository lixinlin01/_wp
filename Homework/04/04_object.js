// 練習 4：解析 JSON 字串並提取資料 (Function, JSON, Array, Object, For Loop)

function extractNamesFromJson(jsonString) {
  // 將 JSON 字串解析 (parse) 成 JavaScript 的陣列物件
  const usersArray = JSON.parse(jsonString);
  
  // 準備一個空陣列來存放名字
  const names = [];
  
  // 使用 for 迴圈走訪解析出來的陣列
  for (let i = 0; i < usersArray.length; i++) {
    // 取出每個物件的 name 屬性，並推入 (push) names 陣列中
    names.push(usersArray[i].name);
  }
  
  // 回傳整理好的名字陣列
  return names;
}

// 測試程式碼 (JSON 字串)
const jsonStr = '[{"name":"Alice","age":25},{"name":"Bob","age":30}]';
console.log(extractNamesFromJson(jsonStr)); // 預期輸出: ["Alice", "Bob"]
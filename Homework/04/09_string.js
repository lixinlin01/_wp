// 練習 9：字串反轉器 (Function, String(視為Array), While Loop)
function reverseString(str) {
  // 準備一個空字串來裝反轉後的結果
  let reversed = "";
  // 從字串的最後一個字元開始往回找 (索引值為長度減 1)
  let i = str.length - 1;
  
  // 只要索引值大於等於 0，就持續執行
  while (i >= 0) {
    // 把目前的字元加到結果字串的尾端
    reversed += str[i];
    // 索引值減 1，往前移動一個字元
    i--;
  }
  
  // 回傳反轉後的字串
  return reversed;
}

// 測試程式碼
console.log(reverseString("hello")); // 預期輸出: "olleh"
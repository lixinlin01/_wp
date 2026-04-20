// 練習 3：尋找特定數字 (Function, Array, While Loop, If)

// 接收一個陣列與一個目標數字
function findTargetIndex(arr, target) {
  let i = 0;
  
  // 當 i 小於陣列長度時，持續執行 while 迴圈
  while (i < arr.length) {
    // 檢查當前元素是否等於目標數字
    if (arr[i] === target) {
      return i;
    }
    // 找不到則將計數器加 1，繼續檢查下一個
    i++;
  }
  return -1;
}

// 測試程式碼
const numbers = [5, 12, 8, 130, 44];
console.log(findTargetIndex(numbers, 8)); // 預期輸出: 2
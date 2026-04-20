// 練習 1：計算陣列總和 (Function, Array, For Loop)

function calculateSum(numbers) {
  // 宣告一個變數 sum 用來儲存總和
  let sum = 0;
  
  // 使用 for 迴圈加總陣列中的每一個元素
  for (let i = 0; i < numbers.length; i++) {
    sum += numbers[i];
  }
  return sum;
}

// 測試程式碼
const myArr = [10, 20, 30, 40];
console.log(calculateSum(myArr)); // 預期輸出: 100
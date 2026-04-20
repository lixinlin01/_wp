// 練習 6：統計陣列元素出現次數 (Function, Array, Object, For Loop, If)

function countFruits(fruitArray) {
  // 準備一個空物件用來存放統計結果
  let countObj = {};
  
  // 走訪陣列中的每一個水果
  for (let i = 0; i < fruitArray.length; i++) {
    let fruit = fruitArray[i];
    
    // 如果這個水果已經在 countObj 物件裡面了 (有這個屬性)
    if (countObj[fruit]) {
      // 就把它的數量加 1
      countObj[fruit]++;
    } else {
      // 如果還沒出現過，就把這個屬性初始化為 1
      countObj[fruit] = 1;
    }
  }
  return countObj;
}

// 測試程式碼
const fruits = ["apple", "banana", "apple", "orange", "banana", "apple"];
console.log(countFruits(fruits)); // 預期輸出: { apple: 3, banana: 2, orange: 1 }
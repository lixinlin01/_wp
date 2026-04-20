// 練習 2：判斷物件屬性與條件 (Function, Object, If)

// 定義函式，接收一個 person 物件
function checkAdult(person) {
  // 使用 if 判斷式檢查物件中的 age 屬性是否大於等於 18
  if (person.age >= 18) {
    return person.name + " 已經成年了。";
  } else {
    return person.name + " 尚未成年。";
  }
}

// 測試程式碼
const user = { name: "小明", age: 16 };
console.log(checkAdult(user)); // 預期輸出: 小明 尚未成年。
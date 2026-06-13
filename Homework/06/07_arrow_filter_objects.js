// 7. 箭頭函數處理物件
// 篩選出 age >= 18 的使用者

const users = [
  { name: "Alice", age: 25 },
  { name: "Bob", age: 17 }
];

const adults = users.filter(user => user.age >= 18);

console.log(adults);
// 預期輸出: [{ name: "Alice", age: 25 }]

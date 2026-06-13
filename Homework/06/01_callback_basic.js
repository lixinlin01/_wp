// 1. Callback 基礎實作
// 建立 mathTool 函數，接受 num1、num2 與 action（回呼函數）

function mathTool(num1, num2, action) {
  return action(num1, num2);
}

const result1 = mathTool(10, 5, function (a, b) {
  return a + b;
});

const result2 = mathTool(10, 5, function (a, b) {
  return a - b;
});

console.log(result1, result2); // 預期輸出: 15 5

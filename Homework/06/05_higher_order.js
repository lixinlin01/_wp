// 5. 函數回傳函數 (Higher-Order Function)
// multiplier(factor) 回傳一個箭頭函數

function multiplier(factor) {
  return n => n * factor;
}

const double = multiplier(2);
const triple = multiplier(3);

console.log(double(10)); // 預期輸出: 20
console.log(triple(5));  // 預期輸出: 15

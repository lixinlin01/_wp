// 練習 7：購物車結帳系統 (Function, Array, Object, While Loop)

function checkout(cartItems) {
  // 初始化總金額為 0
  let totalAmount = 0;
  // 設定 while 迴圈的索引值
  let index = 0;
  
  // 當索引值小於購物車商品數量時繼續執行
  while (index < cartItems.length) {
    // 取得當前商品物件
    let item = cartItems[index];
    // 計算單項商品總價並加入總金額
    totalAmount += (item.price * item.quantity);
    // 索引值加 1，準備處理下一個商品
    index++;
  }
  
  // 回傳計算好的總金額
  return totalAmount;
}

// 測試程式碼
const myCart = [
  { name: "書本", price: 300, quantity: 2 },
  { name: "筆", price: 50, quantity: 5 }
];
console.log(checkout(myCart)); // 預期輸出: 850
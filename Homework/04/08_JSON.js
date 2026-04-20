// 練習 8：資料篩選與轉換 JSON (Function, Array, Object, If, For Loop, JSON)

function getAvailableItemsJSON(inventory) {
  // 準備一個空陣列放有庫存的商品
  let availableItems = [];
  
  // 走訪庫存陣列
  for (let i = 0; i < inventory.length; i++) {
    // 如果該商品的 stock 屬性大於 0
    if (inventory[i].stock > 0) {
      // 將其加入到有庫存的陣列中
      availableItems.push(inventory[i]);
    }
  }
  
  // 將整理好的陣列轉換 (stringify) 為 JSON 字串格式
  const resultJSON = JSON.stringify(availableItems);
  
  // 回傳 JSON 字串
  return resultJSON;
}

// 測試程式碼
const storeInventory = [
  { item: "鍵盤", stock: 10 },
  { item: "滑鼠", stock: 0 },
  { item: "螢幕", stock: 5 }
];
console.log(getAvailableItemsJSON(storeInventory)); 
// 預期輸出: '[{"item":"鍵盤","stock":10},{"item":"螢幕","stock":5}]'
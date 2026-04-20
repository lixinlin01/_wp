// 練習 10：綜合挑戰 - 資料清洗與分類 (Function, JSON, Array, Object, While Loop, For Loop, If)

function processOrders(jsonInput) {
  // 1. (JSON) 將傳入的 JSON 字串解析成陣列物件
  let rawOrders = JSON.parse(jsonInput);
  
  // 準備存放處理後資料的陣列與最終分類物件
  let validOrders = [];
  let categorizedOrders = { vip: [], regular: [] }; // (Object, Array)
  
  // 2. (While Loop, If) 清洗資料：移除已取消的訂單
  let i = 0;
  while (i < rawOrders.length) {
    if (rawOrders[i].status !== "cancelled") {
      validOrders.push(rawOrders[i]);
    }
    i++;
  }
  
  // 3. (For Loop, If) 處理有效訂單：依照是否為 VIP 分類
  for (let j = 0; j < validOrders.length; j++) {
    let order = validOrders[j];
    
    // 如果客戶是 VIP，放入物件的 vip 陣列
    if (order.isVip === true) {
      categorizedOrders.vip.push(order);
    } else {
      // 否則放入 regular 陣列
      categorizedOrders.regular.push(order);
    }
  }
  
  // (Function) 回傳最終分類好的物件
  return categorizedOrders;
}

// 測試程式碼
const incomingData = JSON.stringify([
  { id: 1, status: "completed", isVip: true },
  { id: 2, status: "cancelled", isVip: false },
  { id: 3, status: "processing", isVip: false },
  { id: 4, status: "completed", isVip: true }
]);

const result = processOrders(incomingData);
console.log(result);
/* 預期輸出:
{
  vip: [ { id: 1, status: 'completed', isVip: true }, { id: 4, status: 'completed', isVip: true } ],
  regular: [ { id: 3, status: 'processing', isVip: false } ]
}
*/
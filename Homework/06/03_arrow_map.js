// 3. 箭頭函數與陣列轉換
// 使用 map + 箭頭函數，將價格打 8 折

const prices = [100, 200, 300, 400];
const discounted = prices.map(p => Math.round(p * 0.8));

console.log(discounted); // 預期輸出: [80, 160, 240, 320]

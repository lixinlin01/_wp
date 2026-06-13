// 7. 模擬資料庫的查詢行為 (Simulating Database Query)
// 目標：理解 db.get(sql, params, callback) 的運作流程

function fakeGet(sql, params, callback) {
  const fakeRow = {
    id: 1,
    title: "掌握 JavaScript 函數",
    content: "這是一篇關於 Callback 的文章..."
  };
  callback(null, fakeRow);
}

const query = "SELECT * FROM posts WHERE id = ?";
const inputParams = [1];

fakeGet(query, inputParams, (err, row) => {
  if (err) {
    console.error("查詢失敗");
  } else {
    console.log("抓到的文章標題是：", row.title);
    // 預期輸出：抓到的文章標題是： 掌握 JavaScript 函數
  }
});

// 5. 實作「錯誤優先」的回呼函數 (Error-First Callback)
// 目標：理解 callback(err, data) 的傳參機制

function fetchData(id, callback) {
  const fakeData = { id: id, status: "success" };
  callback(null, fakeData);
}

fetchData(101, (err, data) => {
  if (err) {
    console.log("發生錯誤：" + err);
  } else {
    console.log("成功取得資料：", data);
    // 預期輸出：成功取得資料： { id: 101, status: 'success' }
  }
});

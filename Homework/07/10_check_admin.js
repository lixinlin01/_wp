// 10. 錯誤優先回呼模式 (Error-First Callback Pattern)
// 目標：理解 if (err) return ... 的設計模式

function checkAdmin(role, callback) {
  if (role !== "admin") {
    callback("Access Denied");
  } else {
    callback(null, "Welcome");
  }
}

// 測試：非 admin → 觸發錯誤
checkAdmin("user", (err, msg) => {
  if (err) {
    console.log("錯誤：" + err); // 錯誤：Access Denied
  } else {
    console.log(msg);
  }
});

// 測試：admin → 成功
checkAdmin("admin", (err, msg) => {
  if (err) {
    console.log("錯誤：" + err);
  } else {
    console.log(msg); // Welcome
  }
});

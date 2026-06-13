// 2. 匿名函數與立即執行 (IIFE)
// 建立 IIFE，內部定義 count = 100，印出 "Count is: 100"

(function () {
  var count = 100;
  console.log("Count is: " + count);
})();

// 外部無法存取 count
// console.log(count); // ReferenceError: count is not defined

// 9. 延遲執行的 Callback
// 2 秒後印出 "Task Completed"

const words = ["Task", "Completed"];

setTimeout(() => {
  console.log(words.join(" ")); // "Task Completed"
}, 2000);

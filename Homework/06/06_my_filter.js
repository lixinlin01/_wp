// 6. Callback 篩選器
// 手寫類似 filter 的 myFilter(arr, callback)

function myFilter(arr, callback) {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    if (callback(arr[i])) {
      result.push(arr[i]);
    }
  }
  return result;
}

const numbers = [1, 5, 8, 12];
const greaterThan7 = myFilter(numbers, n => n > 7);

console.log(greaterThan7); // 預期輸出: [8, 12]

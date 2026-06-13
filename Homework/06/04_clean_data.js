// 4. 陣列參數的「破壞性修改」
// cleanData 會移除陣列最後一個元素，並在最前方加上 "Start"

function cleanData(arr) {
  arr.pop();
  arr.unshift("Start");
}

let myData = [1, 2, 3];
cleanData(myData);

console.log(myData); // 預期輸出: ["Start", 1, 2]
// 原始陣列被修改（傳址呼叫），pop 移除 3，unshift 加入 "Start"

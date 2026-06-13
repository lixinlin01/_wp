// 8. 參數傳址陷阱：重新賦值 vs 修改

let listA = [1, 2];
let listB = [3, 4];

function process(a, b) {
  a.push(99);
  b = [100];
}

process(listA, listB);

console.log(listA); // [1, 2, 99]
console.log(listB); // [3, 4]

/*
 * listA 被修改，因為 a.push(99) 透過參考修改了原陣列內容。
 * listB 不變，因為 b = [100] 只是將區域變數 b 指向新陣列，
 * 並未修改原陣列的內容，外部 listB 仍指向原陣列 [3, 4]。
 */

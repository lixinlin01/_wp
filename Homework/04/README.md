# Homework 4: JavaScript 10 大程式練習
**10 個 javascript 程式練習，包含 if, for, while, function, json, array, object**

---

### 練習 1：計算陣列總和
* **使用語法**：Function, Array, For Loop
* **功能介紹**：寫一個函式 `calculateSum(numbers)`，宣告變數 `sum` 用來儲存總和，並使用 `for` 迴圈遍歷陣列中的每一個元素進行累加。
* **測試結果**：
```js
100
```

---

### 練習 2：判斷物件屬性與條件
* **使用語法**：Function, Object, If
* **功能介紹**：定義函式 `checkAdult(person)` 接收一個物件，透過 `if` 判斷式檢查物件中的 `age` 屬性是否大於等於 18，並回傳該人名是否成年的字串。
* **測試結果**：
```js
小明 尚未成年。
```

---

### 練習 3：尋找特定數字
* **使用語法**：Function, Array, While Loop, If
* **功能介紹**：函式 `findTargetIndex(arr, target)` 透過 `while` 迴圈持續檢查陣列元素，若當前元素等於目標數字則回傳索引，若遍歷結束仍未找到則回傳 -1。
* **測試結果**：
```js
2
```

---

### 練習 4：解析 JSON 字串並提取資料
* **使用語法**：Function, JSON, Array, Object, For Loop
* **功能介紹**：函式 `extractNamesFromJson(jsonString)` 使用 `JSON.parse()` 將字串解析成 JavaScript 陣列物件，再以 `for` 迴圈提取每個物件的 `name` 屬性並推入新陣列中回傳。
* **測試結果**：
```js
["Alice", "Bob"]
```

---

### 練習 5：尋找最高分學生
* **使用語法**：Function, Array, Object, For Loop, If
* **功能介紹**：函式 `getTopStudent(students)` 先假設陣列的第一個學生為最高分，隨後從第二個學生開始逐一比較 `score` 屬性，若發現更高分者則更新記錄並回傳該學生物件。
* **測試結果**：
```js
{ name: "Mary", score: 92 }
```

---

### 練習 6：統計陣列元素出現次數
* **使用語法**：Function, Array, Object, For Loop, If
* **功能介紹**：函式 `countFruits(fruitArray)` 準備一個空物件 `countObj`。走訪陣列時，若水果已作為屬性存在則數量加 1，若尚未出現過則初始化為 1。
* **測試結果**：
```js
{ apple: 3, banana: 2, orange: 1 }
```

---

### 練習 7：購物車結帳系統
* **使用語法**：Function, Array, Object, While Loop
* **功能介紹**：函式 `checkout(cartItems)` 使用 `while` 迴圈取得每個商品物件，將商品的價格 (`price`) 與數量 (`quantity`) 相乘後累計至總金額回傳。
* **測試結果**：
```js
850
```

---

### 練習 8：資料篩選與轉換 JSON
* **使用語法**：Function, Array, Object, If, For Loop, JSON
* **功能介紹**：函式 `getAvailableItemsJSON(inventory)` 走訪庫存陣列，篩選出 `stock` 大於 0 的商品存入新陣列，最後使用 `JSON.stringify()` 將結果轉換為 JSON 字串。
* **測試結果**：
```js
'[{"item":"鍵盤","stock":10},{"item":"螢幕","stock":5}]'
```

---

### 練習 9：字串反轉器
* **使用語法**：Function, String(視為Array), While Loop
* **功能介紹**：函式 `reverseString(str)` 從字串的最後一個字元開始往回搜尋，利用 `while` 迴圈將每個字元依序加到結果字串的尾端。
* **測試結果**：
```js
"olleh"
```

---

### 練習 10：綜合挑戰 - 資料清洗與分類
* **使用語法**：Function, JSON, Array, Object, While Loop, For Loop, If
* **功能介紹**：函式 `processOrders(jsonInput)` 先解析 JSON 資料，透過 `while` 迴圈移除狀態為 `cancelled` 的訂單，再以 `for` 迴圈依照 `isVip` 屬性將有效訂單分類。
* **測試結果**：
```js
{
  vip: [ { id: 1, status: 'completed', isVip: true }, { id: 4, status: 'completed', isVip: true } ],
  regular: [ { id: 3, status: 'processing', isVip: false } ]
}
```
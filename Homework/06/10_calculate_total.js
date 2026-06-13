// 10. 綜合應用：計算總價
// calculateTotal(cart, discountFunc)

function calculateTotal(cart, discountFunc) {
  const sum = cart.reduce((total, price) => total + price, 0);
  return discountFunc(sum);
}

const result = calculateTotal([100, 200, 300], function (total) {
  return total - 50;
});

console.log(result); // 預期輸出: 550 (600 - 50)

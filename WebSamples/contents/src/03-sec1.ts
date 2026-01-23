// 03-sec1.ts
let currentNumber = 1;

// DOM 要素を取得
const currentNumberDisplay = document.getElementById('current-number')!;
const btnMultiply = document.getElementById('btn-multiply')!;
const btnDivide = document.getElementById('btn-divide')!;
const btnRandom = document.getElementById('btn-random')!;

// 表示を更新
function updateDisplay() {
  // 小数は最大2桁まで表示
  currentNumberDisplay.textContent = Number.isInteger(currentNumber)
    ? currentNumber.toString()
    : currentNumber.toFixed(2);
}

// ×10 ボタン
btnMultiply.addEventListener('click', () => {
  currentNumber *= 10;
  updateDisplay();
});

// ÷10 ボタン
btnDivide.addEventListener('click', () => {
  currentNumber /= 10;
  updateDisplay();
});

// random ボタン
btnRandom.addEventListener('click', () => {
  // 0.01〜9.99 の小数を生成
  const randomValue = Math.random() * 9.98 + 0.01;
  currentNumber = Math.round(randomValue * 100) / 100; // 小数第2位まで
  updateDisplay();
});

// 初期表示
updateDisplay();

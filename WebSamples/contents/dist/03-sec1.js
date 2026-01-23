// 03-sec1.js (改良版)
var currentNumber = 1;

// DOM 要素
var currentNumberDisplay = document.getElementById('current-number');
var btnMultiply = document.getElementById('btn-multiply');
var btnDivide = document.getElementById('btn-divide');
var btnRandom = document.getElementById('btn-random');

// 最小・最大値の設定（教育用に適切な範囲）
var MIN_NUMBER = 0.000001;
var MAX_NUMBER = 1000000;

// 表示更新
function updateDisplay() {
    currentNumberDisplay.textContent = Number(currentNumber.toFixed(12));

    // ÷10 ボタン制御
    if (currentNumber / 10 < MIN_NUMBER) {
        btnDivide.disabled = true;
    } else {
        btnDivide.disabled = false;
    }

    // ×10 ボタン制御
    if (currentNumber * 10 > MAX_NUMBER) {
        btnMultiply.disabled = true;
    } else {
        btnMultiply.disabled = false;
    }
}

// ×10 ボタン
btnMultiply.addEventListener('click', function () {
    currentNumber *= 10;
    updateDisplay();
});

// ÷10 ボタン
btnDivide.addEventListener('click', function () {
    currentNumber /= 10;
    updateDisplay();
});

// random ボタン
btnRandom.addEventListener('click', function () {
    // 0.01〜99.99 の範囲で生成
    var randomValue = Math.random() * 99.98 + 0.01;
    // 小数第2位まで丸め
    currentNumber = Math.round(randomValue * 100) / 100;
    updateDisplay();
});


// 初期表示
updateDisplay();

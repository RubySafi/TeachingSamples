// 定数
const UNIT_DIGITS = 10n;
const UNIT = 10n ** UNIT_DIGITS; // 1e-7 相当
const MAX_VALUE = 10n ** 20n; // オーバーフロー防止
const MIN_RANDOM = 1n * 10n ** 7n; // 0.001相当
const MAX_RANDOM = 100000n * MIN_RANDOM; // 1000相当
const RANGE = 6; //ランダムな桁数
// DOM取得
const currentNumberDisplay = document.getElementById('current-number');
const btnMultiply = document.getElementById('btn-multiply');
const btnDivide = document.getElementById('btn-divide');
const btnRandom = document.getElementById('btn-random');
// 内部値
let value = 7n * 10n ** 10n; // 初期値 1.0
// 表示更新
function updateDisplay() {
    const str = value.toString().padStart(Number(UNIT_DIGITS) + 1, '0');
    const intPart = str.slice(0, -Number(UNIT_DIGITS));
    let fracPart = str.slice(-Number(UNIT_DIGITS));
    // 末尾のゼロを削除
    fracPart = fracPart.replace(/0+$/, '');
    currentNumberDisplay.textContent =
        fracPart.length > 0 ? `${intPart}.${fracPart}` : intPart;
    // ÷10ボタン制御
    btnDivide.disabled = value % 10n !== 0n;
    // ×10ボタン制御
    btnMultiply.disabled = value * 10n > MAX_VALUE;
}
// ×10
btnMultiply.addEventListener('click', () => {
    value *= 10n;
    updateDisplay();
});
// ÷10
btnDivide.addEventListener('click', () => {
    if (value % 10n === 0n)
        value /= 10n;
    updateDisplay();
});
// random
btnRandom.addEventListener('click', () => {
    const rand = MIN_RANDOM * BigInt(Math.floor(Math.random() * 10 ** RANGE));
    value = rand;
    updateDisplay();
});
// 初期表示
updateDisplay();
export {};

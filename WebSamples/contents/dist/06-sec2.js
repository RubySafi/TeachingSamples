let history = [];
let unitsInOrder = [];
const processDisplay = document.getElementById('02-unit-process');
const resultDisplay = document.getElementById('02-unit-display');
const formatExp = (num) => {
    if (Math.abs(num) <= 1)
        return '';
    return `<sup>${Math.abs(num)}</sup>`;
};
const updateDisplay = () => {
    // --- 1. 上部：計算過程 ---
    if (history.length === 0) {
        processDisplay.innerHTML = '1';
    }
    else {
        processDisplay.innerHTML = history
            .map((item, index) => {
            const isLast = index === history.length - 1;
            const style = isLast ? 'style="color: red; font-weight: bold;"' : '';
            const symbol = index === 0 ? '' : item.op === 'mul' ? ' &times; ' : ' &divide; ';
            return `${symbol}<span ${style}>1 <i>${item.unit}</i></span>`;
        })
            .join('');
    }
    // --- 2. 集計 ---
    const counts = {};
    history.forEach((item) => {
        if (!counts[item.unit])
            counts[item.unit] = 0;
        item.op === 'div' ? counts[item.unit]-- : counts[item.unit]++;
    });
    const lastUnit = history.length > 0 ? history[history.length - 1].unit : null;
    const numerator = unitsInOrder.filter((u) => counts[u] > 0);
    const denominator = unitsInOrder.filter((u) => counts[u] < 0);
    // --- 3. 下部：結果 ---
    let resultHtml = '';
    if (numerator.length === 0 && denominator.length === 0) {
        resultHtml = '1';
    }
    else {
        let numStr = numerator
            .map((u) => {
            const isRed = u === lastUnit ? 'style="color: red;"' : '';
            return `<span ${isRed}><i>${u}</i>${formatExp(counts[u])}</span>`;
        })
            .join('&middot;') || '1';
        let denStr = '';
        if (denominator.length > 0) {
            const denParts = denominator.map((u) => {
                const isRed = u === lastUnit ? 'style="color: red;"' : '';
                return `<span ${isRed}><i>${u}</i>${formatExp(counts[u])}</span>`;
            });
            denStr =
                denominator.length > 1
                    ? ` / (${denParts.join('&middot;')})`
                    : ` / ${denParts[0]}`;
        }
        resultHtml = numStr + denStr;
    }
    resultDisplay.innerHTML = resultHtml;
};
const addUnit = (type, unit) => {
    history.push({ unit, op: type });
    if (!unitsInOrder.includes(unit))
        unitsInOrder.push(unit);
    updateDisplay();
};
// --- イベントリスナーの一括登録 ---
const unitNames = ['m', 'kg', 's', 'N', 'Hz', 'Pa', 'T', 'B'];
unitNames.forEach((u) => {
    document
        .getElementById(`02-btn-mul-${u}`)
        ?.addEventListener('click', () => addUnit('mul', u));
    document
        .getElementById(`02-btn-div-${u}`)
        ?.addEventListener('click', () => addUnit('div', u));
});
document.getElementById('02-btn-reset')?.addEventListener('click', () => {
    history = [];
    unitsInOrder = [];
    updateDisplay();
});
updateDisplay();
export {};

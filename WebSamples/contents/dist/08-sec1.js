function generateDecimalSequence(dividend, divisor) {
    // まず何桁の小数が必要か計算（割り切れるまで最大4桁）
    let remainder = dividend;
    let decimalDigits = 0;
    while (remainder % divisor !== 0 && decimalDigits < 4) {
        remainder = (remainder % divisor) * 10;
        decimalDigits++;
    }
    // 被除数の桁列を構築
    const intStr = dividend.toString(); // "13" etc.
    const dividendDigits = intStr.split('').map(Number);
    for (let k = 0; k < decimalDigits; k++)
        dividendDigits.push(0);
    const totalSeq = [];
    const quotientSeq = [];
    const divisionSeq = [];
    const subtractionSeq = [];
    let rem = 0;
    for (let i = 0; i < dividendDigits.length; i++) {
        const current = rem * 10 + dividendDigits[i];
        const q = Math.floor(current / divisor);
        const d = q * divisor;
        const sub = current - d;
        totalSeq.push(current);
        quotientSeq.push(q);
        divisionSeq.push(d);
        subtractionSeq.push(sub);
        rem = sub;
    }
    return {
        dividendDigits,
        totalSeq,
        quotientSeq,
        divisionSeq,
        subtractionSeq,
        integerDigits: intStr.length,
        decimalDigits,
    };
}
function placeName(place) {
    const names = ['ones', 'tens', 'hundreds', 'thousands'];
    return names[place] ?? `10^${place}`;
}
// =============================================
// ステップ生成
// =============================================
function generateSteps(dividend, divisor, seq) {
    const { totalSeq, quotientSeq, divisionSeq, subtractionSeq, integerDigits, decimalDigits, dividendDigits } = seq;
    const totalLen = dividendDigits.length; // integerDigits + decimalDigits
    // 最終的な商（小数）を文字列に
    const quotientStr = buildQuotientString(quotientSeq, integerDigits);
    const steps = [];
    // Step 0: problem statement
    steps.push({
        type: 'problem',
        label: 'STEP 0',
        caption: `We are going to solve ${dividend} ÷ ${divisor} using long division. The answer will be a decimal.`,
    });
    // Step 1: frame
    steps.push({
        type: 'frame',
        label: 'STEP 1',
        caption: `Write ${dividend} inside the bracket and ${divisor} on the left. We will add ".0" to the dividend when we need to keep dividing past the decimal point.`,
    });
    // iStart: 最初に商が非ゼロになる整数部のインデックス（先頭0スキップ用）
    // 2桁÷1桁では iStart は 0 か 1 のどちらか。
    const iStart = quotientSeq.findIndex((q, idx) => idx < integerDigits && q !== 0);
    if (iStart > 0) {
        // 十の位が 0: 最初に見る桁を説明するステップ
        steps.push({
            type: 'look',
            label: `STEP ${steps.length}`,
            caption: `${divisor} cannot go into ${dividendDigits[0]} (the tens digit), so we look at the first two digits together: ${totalSeq[iStart]}.`,
            digitIndex: iStart,
        });
    }
    // Loop over all digit positions (integer + decimal)
    // Skip leading zero integer digits (i < iStart)
    for (let i = (iStart >= 0 ? iStart : 0); i < totalLen; i++) {
        const isDecimalStart = i === integerDigits; // first decimal digit
        const isIntegerPart = i < integerDigits;
        // place within the integer part (0 = ones of integer)
        const intPlace = integerDigits - 1 - i; // only meaningful for i < integerDigits
        // Before the first decimal digit: insert a 'decimal' step
        if (isDecimalStart) {
            steps.push({
                type: 'decimal',
                label: `STEP ${steps.length}`,
                caption: `The remainder is not zero. We must write a DECIMAL POINT in the quotient — place it right after the ones digit. We also write ".0" to the right of the dividend so we can keep dividing.`,
                digitIndex: i,
            });
        }
        const q = quotientSeq[i];
        const placeLabel = isIntegerPart
            ? placeName(intPlace) + ' (integer part)'
            : `${ordinal(i - integerDigits + 1)} decimal place`;
        const isLast = i === totalLen - 1;
        // quotient
        steps.push({
            type: 'quotient',
            label: `STEP ${steps.length}`,
            caption: `How many times does ${divisor} go into ${totalSeq[i]}? It goes ${q} time${q !== 1 ? 's' : ''}. Write ${q} in the ${placeLabel} of the quotient.`,
            digitIndex: i,
        });
        // q === 0: product/line/diff をスキップして次の桁へ
        if (q === 0) {
            if (isLast)
                break; // 最終桁で q=0 は起こらないが念のため
            const nextDigit = dividendDigits[i + 1];
            const nextIsDecimalZero = i + 1 >= integerDigits;
            steps.push({
                type: 'carry',
                label: `STEP ${steps.length}`,
                caption: nextIsDecimalZero && i + 1 === integerDigits
                    ? `The quotient digit is 0. We add a "0" after the decimal point and bring it down: we now have ${totalSeq[i + 1]}.`
                    : `The quotient digit is 0. Bring down the next digit (${nextDigit}). We now have ${totalSeq[i + 1]}.`,
                digitIndex: i,
            });
            continue;
        }
        // product
        steps.push({
            type: 'product',
            label: `STEP ${steps.length}`,
            caption: `Multiply: ${divisor} × ${q} = ${divisionSeq[i]}. Write ${divisionSeq[i]} below ${totalSeq[i]}.`,
            digitIndex: i,
        });
        // line
        steps.push({
            type: 'line',
            label: `STEP ${steps.length}`,
            caption: `Draw a line and subtract: ${totalSeq[i]} − ${divisionSeq[i]} = ${subtractionSeq[i]}.`,
            digitIndex: i,
        });
        // diff
        steps.push({
            type: 'diff',
            label: `STEP ${steps.length}`,
            caption: isLast
                ? `Write the difference: ${subtractionSeq[i]}. The remainder is 0 — it divides evenly! The answer is ${dividend} ÷ ${divisor} = ${quotientStr}.`
                : `Write the difference: ${subtractionSeq[i]}.`,
            digitIndex: i,
        });
        if (isLast)
            break;
        // carry (bring down next digit)
        const nextDigit = dividendDigits[i + 1];
        const nextIsDecimalZero = i + 1 >= integerDigits;
        steps.push({
            type: 'carry',
            label: `STEP ${steps.length}`,
            caption: nextIsDecimalZero && i + 1 === integerDigits
                ? `Decimal point written. Now bring down the "0" we added to the dividend: we now have ${totalSeq[i + 1]}.`
                : `Bring down the next digit (${nextDigit}). We now have ${totalSeq[i + 1]}.`,
            digitIndex: i,
        });
    }
    // conclusion
    steps.push({
        type: 'conclusion',
        label: `STEP ${steps.length}`,
        caption: `The answer is ${dividend} ÷ ${divisor} = ${quotientStr}. Well done!`,
    });
    return steps;
}
function buildQuotientString(quotientSeq, integerDigits) {
    const intPart = quotientSeq.slice(0, integerDigits).join('');
    const decPart = quotientSeq.slice(integerDigits).join('');
    return decPart.length > 0 ? `${parseInt(intPart)}.${decPart}` : `${parseInt(intPart)}`;
}
function ordinal(n) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}
/**
 * 列の割り当て:
 *   col 0    : divisor
 *   col 1..integerDigits : 整数部の各桁
 *   col integerDigits+1  : 小数点（.）
 *   col integerDigits+2..: 小数部の各桁
 *
 * placeToCol: 整数桁インデックス i (0=tens, 1=ones for 2-digit) → col
 *   i < integerDigits → col = 1 + i
 *   i >= integerDigits → col = 1 + i + 1  (+1 for decimal point column)
 */
function makeHelpers(ctx, cfg) {
    const { gridX, gridY, offsetX, integerDigits, decimalDigits } = cfg;
    const RowToY = (row) => cfg.offsetY + (row + 1) * gridY;
    const getX = (col) => offsetX + col * gridX;
    const cenX = (col) => getX(col) + gridX / 2;
    const cenY = (row) => RowToY(row) - gridY / 2;
    /** digit index i (0=first digit of dividend) → canvas column
     *  小数点専用列なし: すべて 1+i で連続
     */
    function digitToCol(i) {
        return 1 + i;
    }
    /**
     * 小数点のX座標 = 整数最終列の右端（グリッド交差点）
     * = getX(1 + integerDigits)  (列境界線上)
     */
    const decPointX = getX(1 + integerDigits);
    function setFont(size = 28, color = '#2c2416') {
        ctx.font = `${size}px "JetBrains Mono", monospace`;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
    }
    /**
     * 数値をキャンバスに右詰めで描画。
     * rightDigitIdx は右端の数字が来る digit index (0-based)。
     * 複数桁の場合は左に広がる。
     */
    function putTextAtDigit(val, row, rightDigitIdx, color) {
        const s = String(val);
        setFont(28, color ?? '#2c2416');
        s.split('').reverse().forEach((ch, k) => {
            // k=0 → rightmost, goes to rightDigitIdx column
            const col = digitToCol(rightDigitIdx - k);
            ctx.fillText(ch, cenX(col), cenY(row));
        });
    }
    /** 商の行（row = -1）に quotient の digit を配置 */
    function putQuotientDigit(val, digitIdx, color) {
        setFont(28, color ?? '#2c2416');
        ctx.fillText(String(val), cenX(digitToCol(digitIdx)), cenY(-1));
    }
    /** 商の小数点：グリッド交差点（整数部右端の境界線上）に描画 */
    function putQuotientDecimalPoint(color) {
        ctx.font = '28px "JetBrains Mono", monospace';
        ctx.fillStyle = color ?? '#8e44ad';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // decPointX はセル境界線のX座標。cenY(-1) より少し下げて点を見やすく
        ctx.fillText('.', decPointX, cenY(-1) + gridY * 0.18);
    }
    /** 被除数（整数部のみ）を row に描画 */
    function putDividendInt(dividend, row, color) {
        const s = String(dividend);
        setFont(28, color ?? '#2c2416');
        s.split('').forEach((ch, i) => {
            ctx.fillText(ch, cenX(1 + i), cenY(row));
        });
    }
    /** 被除数の小数部「.0…」を描画（拡張表示用） */
    function putDividendDecimalExt(numZeros, row, color) {
        ctx.font = '28px "JetBrains Mono", monospace';
        ctx.fillStyle = color ?? '#2c2416';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // 小数点：整数部右端のグリッド境界線上、少し下寄り
        ctx.fillText('.', decPointX, cenY(row) + gridY * 0.18);
        // 小数桁の 0
        for (let k = 0; k < numZeros; k++) {
            ctx.fillText('0', cenX(digitToCol(integerDigits + k)), cenY(row));
        }
    }
    function putDivisor(val) {
        const s = String(val);
        setFont(28, '#2c2416');
        s.split('').reverse().forEach((ch, i) => {
            ctx.fillText(ch, cenX(-i), cenY(0));
        });
    }
    /**
     * bracket: 上の横線＋左の曲線
     * 横線は整数部＋小数部すべてをカバー
     */
    function drawFrame(showDecimalExt) {
        const totalCols = integerDigits + (showDecimalExt ? decimalDigits : 0);
        ctx.strokeStyle = '#2c2416';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(getX(1), RowToY(-1));
        ctx.lineTo(getX(1 + totalCols), RowToY(-1));
        ctx.stroke();
        ctx.beginPath();
        ctx.lineWidth = 2.5;
        const x = getX(1);
        const yTop = RowToY(-1);
        const yBot = RowToY(0);
        ctx.moveTo(x, yTop);
        ctx.quadraticCurveTo(x + gridX * 0.25, (yTop + yBot) / 2, x, yBot);
        ctx.stroke();
        ctx.lineWidth = 2;
    }
    function drawResultLine(row, rightDigitIdx, digits) {
        const rightCol = digitToCol(rightDigitIdx);
        // expand left by digits-1
        const leftCol = rightCol - digits + 1;
        const xStart = getX(leftCol);
        const xEnd = getX(rightCol + 1);
        const y = RowToY(row);
        ctx.strokeStyle = '#2c2416';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(xStart, y);
        ctx.lineTo(xEnd, y);
        ctx.stroke();
        ctx.lineWidth = 2;
    }
    function drawGrid(numRows) {
        const totalCols = integerDigits + decimalDigits + 2; // +2 margin (専用小数点列なし)
        ctx.strokeStyle = '#ebe6da';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let c = -1; c <= totalCols; c++) {
            ctx.moveTo(getX(c), cfg.offsetY);
            ctx.lineTo(getX(c), cfg.offsetY + numRows * gridY);
        }
        for (let r = 0; r <= numRows; r++) {
            ctx.moveTo(getX(-1), cfg.offsetY + r * gridY);
            ctx.lineTo(getX(totalCols), cfg.offsetY + r * gridY);
        }
        ctx.stroke();
    }
    return {
        RowToY, getX, cenX, cenY,
        putTextAtDigit, putQuotientDigit, putQuotientDecimalPoint,
        putDividendInt, putDividendDecimalExt,
        putDivisor, drawFrame, drawResultLine, drawGrid,
        digitToCol,
    };
}
// =============================================
// render(upToStep)
// =============================================
function render(canvas, steps, upToStep, dividend, divisor, seq) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const { integerDigits, decimalDigits, totalSeq, quotientSeq, divisionSeq, subtractionSeq, dividendDigits } = seq;
    const totalLen = dividendDigits.length;
    // iStart: 最初に非ゼロ商が現れる整数部のインデックス (rowBaseFor 計算用)
    const iStart = quotientSeq.findIndex((q, idx) => idx < integerDigits && q !== 0);
    const cfg = {
        gridX: 44,
        gridY: 52,
        offsetX: 44,
        offsetY: 52,
        integerDigits,
        decimalDigits,
    };
    /**
     * Row assignment: iStart 以降で「q !== 0 だった桁」だけ2行消費。
     * q === 0 の桁は product/diff 行を持たないので行数を増やさない。
     * （07版と同じロジック）
     */
    function rowBaseFor(i) {
        let r = 0;
        for (let j = iStart; j < i; j++) {
            if (quotientSeq[j] !== 0)
                r++;
        }
        return r * 2;
    }
    const activeDigits = quotientSeq.slice(iStart).filter(q => q !== 0).length;
    const numRows = activeDigits * 2 + 2;
    const h = makeHelpers(ctx, cfg);
    h.drawGrid(numRows);
    if (upToStep < 1)
        return;
    // Step 1: draw frame (integer only), divisor, dividend
    // We track whether the decimal extension has been shown
    let decimalShown = false;
    for (let s = 1; s <= upToStep; s++) {
        if (steps[s]?.type === 'decimal') {
            decimalShown = true;
            break;
        }
    }
    h.putDivisor(divisor);
    h.putDividendInt(dividend, 0);
    h.drawFrame(decimalShown);
    if (decimalShown) {
        // show decimal extension of dividend up to the current decimal digit being worked
        // Count how many decimal digits we've reached
        let maxDecimalIdx = 0;
        for (let s = 1; s <= upToStep; s++) {
            const st = steps[s];
            if (st && st.digitIndex !== undefined && st.digitIndex >= integerDigits) {
                maxDecimalIdx = Math.max(maxDecimalIdx, st.digitIndex - integerDigits + 1);
            }
        }
        h.putDividendDecimalExt(maxDecimalIdx, 0);
    }
    // Replay steps
    for (let s = 2; s <= upToStep; s++) {
        const step = steps[s];
        if (!step)
            break;
        const i = step.digitIndex;
        if (i === undefined && step.type !== 'conclusion')
            continue;
        const rowBase = (i !== undefined) ? rowBaseFor(i) : 0;
        const isCurrentStep = s === upToStep;
        switch (step.type) {
            case 'look': {
                h.putDividendInt(dividend, 0, '#b0a898');
                const dStr = String(dividend);
                const highlightColor = isCurrentStep ? '#2980b9' : '#2c2416';
                ctx.font = '28px "JetBrains Mono", monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                for (let k = 0; k <= i; k++) {
                    ctx.fillStyle = highlightColor;
                    ctx.fillText(dStr[k], h.cenX(h.digitToCol(k)), h.cenY(0));
                }
                break;
            }
            case 'decimal': {
                h.putQuotientDecimalPoint('#8e44ad');
                break;
            }
            case 'quotient': {
                const color = isCurrentStep ? '#c0392b' : '#2c2416';
                h.putQuotientDigit(quotientSeq[i], i, color);
                break;
            }
            case 'product': {
                const color = isCurrentStep ? '#2980b9' : '#2c2416';
                h.putTextAtDigit(divisionSeq[i], rowBase + 1, i, color);
                break;
            }
            case 'line': {
                h.drawResultLine(rowBase + 1, i, String(totalSeq[i]).length);
                break;
            }
            case 'diff': {
                const isLast = i === totalLen - 1;
                const color = isCurrentStep && isLast ? '#c0392b' : (isCurrentStep ? '#2c2416' : '#2c2416');
                h.putTextAtDigit(subtractionSeq[i], rowBase + 2, i, color);
                break;
            }
            case 'carry': {
                const color = isCurrentStep ? '#27ae60' : '#2c2416';
                // q=0 のとき product/diff 行がないので carry は rowBase の行に来る
                // q!=0 のとき diff(rowBase+2) と同じ行に carry が並ぶ
                const carryRow = quotientSeq[i] === 0 ? rowBase : rowBase + 2;
                h.putTextAtDigit(totalSeq[i + 1], carryRow, i + 1, color);
                break;
            }
            case 'conclusion': {
                // No drawing
                break;
            }
        }
    }
}
// =============================================
// 問題生成
// =============================================
/**
 * ÷2, ÷4, ÷5, ÷8 で割り切れない 2 桁の被除数を生成する。
 * 割り切れない = dividend % divisor !== 0
 */
function randomProblem() {
    const divisors = [2, 4, 5, 8];
    let dividend;
    let divisor;
    do {
        divisor = divisors[Math.floor(Math.random() * divisors.length)];
        dividend = Math.floor(Math.random() * 90) + 10; // 10〜99
    } while (dividend % divisor === 0);
    return { dividend, divisor };
}
// =============================================
// UI 初期化
// =============================================
function initUI(dividend, divisor) {
    const seq = generateDecimalSequence(dividend, divisor);
    const steps = generateSteps(dividend, divisor, seq);
    const totalSteps = steps.length - 1;
    const canvas = document.getElementById('division-canvas');
    const captionStepEl = document.getElementById('caption-step');
    const captionTextEl = document.getElementById('caption-text');
    const stepIndicatorEl = document.getElementById('step-indicator');
    const dotsContainer = document.getElementById('progress-dots');
    const btnBack = document.getElementById('btn-back');
    const btnForward = document.getElementById('btn-forward');
    const problemTitle = document.getElementById('problem-title');
    const quotientStr = buildQuotientString(seq.quotientSeq, seq.integerDigits);
    problemTitle.textContent = `${dividend} ÷ ${divisor} = ?`;
    // ドット生成
    dotsContainer.innerHTML = '';
    for (let i = 0; i <= totalSteps; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        dot.dataset['i'] = String(i);
        dot.title = steps[i].label;
        dot.addEventListener('click', () => { currentStep = i; update(); });
        dotsContainer.appendChild(dot);
    }
    let currentStep = 0;
    function update() {
        render(canvas, steps, currentStep, dividend, divisor, seq);
        captionStepEl.textContent = steps[currentStep].label;
        captionTextEl.textContent = steps[currentStep].caption;
        stepIndicatorEl.textContent = `${currentStep} / ${totalSteps}`;
        btnBack.disabled = currentStep === 0;
        btnForward.disabled = currentStep === totalSteps;
        dotsContainer.querySelectorAll('.dot').forEach(dot => {
            const idx = parseInt(dot.dataset['i'] ?? '0');
            dot.className =
                'dot' +
                    (idx === currentStep ? ' active' : idx < currentStep ? ' done' : '');
        });
    }
    // イベント登録
    const newBtnBack = btnBack.cloneNode(true);
    const newBtnForward = btnForward.cloneNode(true);
    btnBack.replaceWith(newBtnBack);
    btnForward.replaceWith(newBtnForward);
    newBtnBack.addEventListener('click', () => { if (currentStep > 0) {
        currentStep--;
        update();
    } });
    newBtnForward.addEventListener('click', () => { if (currentStep < totalSteps) {
        currentStep++;
        update();
    } });
    if (window.__keyHandler) {
        document.removeEventListener('keydown', window.__keyHandler);
    }
    window.__keyHandler = (e) => {
        if (e.key === 'ArrowRight' && currentStep < totalSteps) {
            currentStep++;
            update();
        }
        if (e.key === 'ArrowLeft' && currentStep > 0) {
            currentStep--;
            update();
        }
    };
    document.addEventListener('keydown', window.__keyHandler);
    update();
}
// =============================================
// エントリポイント
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    let { dividend, divisor } = randomProblem();
    initUI(dividend, divisor);
    const btnNew = document.getElementById('btn-new');
    btnNew.addEventListener('click', () => {
        ({ dividend, divisor } = randomProblem());
        initUI(dividend, divisor);
    });
});
export {};

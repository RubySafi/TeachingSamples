function generateDecimalSequence(dividend, divisor) {
    let remainder = dividend;
    let decimalDigits = 0;
    while (remainder % divisor !== 0 && decimalDigits < 4) {
        remainder = (remainder % divisor) * 10;
        decimalDigits++;
    }
    const intStr = dividend.toString();
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
function buildQuotientString(quotientSeq, integerDigits) {
    const intPart = quotientSeq.slice(0, integerDigits).join('');
    const decPart = quotientSeq.slice(integerDigits).join('');
    return decPart.length > 0
        ? `${parseInt(intPart)}.${decPart}`
        : `${parseInt(intPart)}`;
}
function ordinal(n) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}
function placeName(place) {
    const names = ['ones', 'tens', 'hundreds', 'thousands'];
    return names[place] ?? `10^${place}`;
}
// =============================================
// ステップ生成
// =============================================
function generateSteps(dividend, divisor, seq) {
    const { totalSeq, quotientSeq, divisionSeq, subtractionSeq, integerDigits, decimalDigits, dividendDigits, } = seq;
    const totalLen = dividendDigits.length;
    const quotientStr = buildQuotientString(quotientSeq, integerDigits);
    const steps = [];
    // Step 0: problem
    steps.push({
        type: 'problem',
        label: 'STEP 0',
        instruction: `Solve ${dividend} ÷ ${divisor} using long division. The answer will be a decimal. Press Check → to begin.`,
        requiresInput: false,
    });
    // Step 1: frame
    steps.push({
        type: 'frame',
        label: 'STEP 1',
        instruction: `Write ${dividend} inside the bracket and ${divisor} on the left.`,
        requiresInput: false,
    });
    const iStart = quotientSeq.findIndex((q, idx) => idx < integerDigits && q !== 0);
    if (iStart > 0) {
        steps.push({
            type: 'look',
            label: `STEP ${steps.length}`,
            instruction: `${divisor} cannot go into ${dividendDigits[0]} (the tens digit), so we look at the first two digits together: ${totalSeq[iStart]}.`,
            digitIndex: iStart,
            requiresInput: false,
        });
    }
    for (let i = iStart >= 0 ? iStart : 0; i < totalLen; i++) {
        const isDecimalStart = i === integerDigits;
        const isIntegerPart = i < integerDigits;
        const intPlace = integerDigits - 1 - i;
        const placeLabel = isIntegerPart
            ? placeName(intPlace) + ' digit'
            : `${ordinal(i - integerDigits + 1)} decimal place`;
        // decimal_mark: 小数点を打つ確認ステップ
        if (isDecimalStart) {
            // digitIndex = i - 1 = integerDigits - 1 (整数最終桁) で行位置を計算する
            steps.push({
                type: 'decimal_mark',
                label: `STEP ${steps.length}`,
                instruction: `⚠️ Important! The remainder is not zero. Write a DECIMAL POINT "." in the quotient after the ones digit — and also write "." and "0" to the right of the dividend. Press Next → to confirm.`,
                digitIndex: i - 1,
                requiresInput: false,
            });
            // decimal_carry: 降りてくる 0 を入力させる
            steps.push({
                type: 'decimal_carry',
                label: `STEP ${steps.length}`,
                instruction: `Good. Now bring down the "0" from the right of the dividend. What digit comes down?`,
                digitIndex: i - 1,
                requiresInput: true,
                expectedAnswer: 0,
            });
        }
        const q = quotientSeq[i];
        const isLast = i === totalLen - 1;
        // quotient
        steps.push({
            type: 'quotient',
            label: `STEP ${steps.length}`,
            instruction: `How many times does ${divisor} go into ${totalSeq[i]}? Write the ${placeLabel} of the quotient.`,
            digitIndex: i,
            requiresInput: true,
            expectedAnswer: q,
        });
        // q === 0: product/line/diff をスキップして次の桁へ（07版と同じ設計）
        if (q === 0) {
            if (isLast) {
                steps.push({
                    type: 'conclusion',
                    label: `STEP ${steps.length}`,
                    instruction: `Well done! ${dividend} ÷ ${divisor} = ${quotientStr}`,
                    digitIndex: i,
                    requiresInput: false,
                });
                break;
            }
            // q=0 で次が小数開始の場合: loop を continue して decimal_mark/decimal_carry で処理
            const nextIsFirstDecimalZero = i + 1 === integerDigits;
            if (!nextIsFirstDecimalZero) {
                const nextDigit = dividendDigits[i + 1];
                steps.push({
                    type: 'carry',
                    label: `STEP ${steps.length}`,
                    instruction: `The quotient digit is 0. Bring down the next digit. What digit comes down?`,
                    digitIndex: i,
                    requiresInput: true,
                    expectedAnswer: nextDigit,
                });
            }
            continue;
        }
        // product
        steps.push({
            type: 'product',
            label: `STEP ${steps.length}`,
            instruction: `Multiply: ${divisor} × ${q} = ? Write the product below ${totalSeq[i]}.`,
            digitIndex: i,
            requiresInput: true,
            expectedAnswer: divisionSeq[i],
        });
        // line
        steps.push({
            type: 'line',
            label: `STEP ${steps.length}`,
            instruction: `Draw a line and subtract.`,
            digitIndex: i,
            requiresInput: false,
        });
        // diff
        steps.push({
            type: 'diff',
            label: `STEP ${steps.length}`,
            instruction: isLast
                ? `Subtract: ${totalSeq[i]} − ${divisionSeq[i]} = ?`
                : `Subtract: ${totalSeq[i]} − ${divisionSeq[i]} = ?`,
            digitIndex: i,
            requiresInput: true,
            expectedAnswer: subtractionSeq[i],
        });
        if (isLast) {
            steps.push({
                type: 'conclusion',
                label: `STEP ${steps.length}`,
                instruction: `Well done! ${dividend} ÷ ${divisor} = ${quotientStr}`,
                digitIndex: i,
                requiresInput: false,
            });
            break;
        }
        // carry (次が小数開始の場合は decimal_mark/decimal_carry で処理するためスキップ)
        const nextIsFirstDecimalZero = i + 1 === integerDigits;
        if (!nextIsFirstDecimalZero) {
            const nextDigit = dividendDigits[i + 1];
            steps.push({
                type: 'carry',
                label: `STEP ${steps.length}`,
                instruction: `Bring down the next digit. What digit comes down?`,
                digitIndex: i,
                requiresInput: true,
                expectedAnswer: nextDigit,
            });
        }
    }
    return steps;
}
function makeHelpers(ctx, cfg) {
    const { gridX, gridY, offsetX, integerDigits, decimalDigits } = cfg;
    const RowToY = (row) => cfg.offsetY + (row + 1) * gridY;
    const getX = (col) => offsetX + col * gridX;
    const cenX = (col) => getX(col) + gridX / 2;
    const cenY = (row) => RowToY(row) - gridY / 2;
    function digitToCol(i) {
        return 1 + i;
    }
    const decPointX = getX(1 + integerDigits);
    function setFont(size = 28, color = '#2c2416') {
        ctx.font = `${size}px "JetBrains Mono", monospace`;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
    }
    function putTextAtDigit(val, row, rightDigitIdx, color) {
        const s = String(val);
        setFont(28, color ?? '#2c2416');
        s.split('')
            .reverse()
            .forEach((ch, k) => {
            const col = digitToCol(rightDigitIdx - k);
            ctx.fillText(ch, cenX(col), cenY(row));
        });
    }
    function putQuotientDigit(val, digitIdx, color) {
        setFont(28, color ?? '#2c2416');
        ctx.fillText(String(val), cenX(digitToCol(digitIdx)), cenY(-1));
    }
    function putQuotientDecimalPoint(color) {
        ctx.font = '28px "JetBrains Mono", monospace';
        ctx.fillStyle = color ?? '#8e44ad';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('.', decPointX, cenY(-1) + gridY * 0.18);
    }
    function putDividendInt(dividend, row, color) {
        const s = String(dividend);
        setFont(28, color ?? '#2c2416');
        s.split('').forEach((ch, i) => {
            ctx.fillText(ch, cenX(1 + i), cenY(row));
        });
    }
    function putDividendDecimalExt(numZeros, row, color) {
        ctx.font = '28px "JetBrains Mono", monospace';
        ctx.fillStyle = color ?? '#2c2416';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('.', decPointX, cenY(row) + gridY * 0.18);
        for (let k = 0; k < numZeros; k++) {
            ctx.fillText('0', cenX(digitToCol(integerDigits + k)), cenY(row));
        }
    }
    function putDivisor(val) {
        const s = String(val);
        setFont(28, '#2c2416');
        s.split('')
            .reverse()
            .forEach((ch, i) => {
            ctx.fillText(ch, cenX(-i), cenY(0));
        });
    }
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
        const totalCols = integerDigits + decimalDigits + 2;
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
    /** マスク矩形（入力待ちセル） */
    function drawMask(row, rightDigitIdx, digits) {
        const rightCol = digitToCol(rightDigitIdx);
        const leftCol = rightCol - digits + 1;
        const x = getX(leftCol);
        const y = RowToY(row) - gridY;
        const w = getX(rightCol + 1) - x;
        const h2 = gridY;
        ctx.fillStyle = '#fffef9';
        ctx.fillRect(x + 1, y + 1, w - 2, h2 - 2);
        ctx.strokeStyle = '#2980b9';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.strokeRect(x + 2, y + 2, w - 4, h2 - 4);
        ctx.setLineDash([]);
        ctx.lineWidth = 2;
    }
    function drawQuotientMask(digitIdx) {
        drawMask(-1, digitIdx, 1);
    }
    return {
        RowToY,
        getX,
        cenX,
        cenY,
        digitToCol,
        putTextAtDigit,
        putQuotientDigit,
        putQuotientDecimalPoint,
        putDividendInt,
        putDividendDecimalExt,
        putDivisor,
        drawFrame,
        drawResultLine,
        drawGrid,
        drawMask,
        drawQuotientMask,
    };
}
// =============================================
// render
// =============================================
function render(canvas, steps, upToStep, dividend, divisor, seq) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const { integerDigits, decimalDigits, totalSeq, quotientSeq, divisionSeq, subtractionSeq, dividendDigits, } = seq;
    const totalLen = dividendDigits.length;
    const iStart = quotientSeq.findIndex((q, idx) => idx < integerDigits && q !== 0);
    const cfg = {
        gridX: 44,
        gridY: 52,
        offsetX: 44,
        offsetY: 52,
        integerDigits,
        decimalDigits,
    };
    function rowBaseFor(i) {
        return (i - iStart) * 2;
    }
    const activeDigits = quotientSeq.slice(iStart).filter((q) => q !== 0).length;
    const numRows = activeDigits * 2 + 2;
    const h = makeHelpers(ctx, cfg);
    h.drawGrid(numRows);
    if (upToStep < 1)
        return;
    // Check if decimal extension should be shown
    let decimalShown = false;
    for (let s = 1; s <= upToStep; s++) {
        if (steps[s]?.type === 'decimal_mark') {
            decimalShown = true;
            break;
        }
    }
    h.putDivisor(divisor);
    h.putDividendInt(dividend, 0);
    h.drawFrame(decimalShown);
    if (decimalShown) {
        let maxDecimalIdx = 0;
        for (let s = 1; s <= upToStep; s++) {
            const st = steps[s];
            if (!st)
                continue;
            // decimal_carry は digitIndex = integerDigits-1 だが小数第1位の 0 を表示する
            if (st.type === 'decimal_carry') {
                maxDecimalIdx = Math.max(maxDecimalIdx, 1);
            }
            else if (st.digitIndex !== undefined &&
                st.digitIndex >= integerDigits) {
                maxDecimalIdx = Math.max(maxDecimalIdx, st.digitIndex - integerDigits + 1);
            }
        }
        h.putDividendDecimalExt(maxDecimalIdx, 0);
    }
    for (let s = 2; s <= upToStep; s++) {
        const step = steps[s];
        if (!step)
            break;
        const i = step.digitIndex;
        if (i === undefined && step.type !== 'conclusion')
            continue;
        const rowBase = i !== undefined ? rowBaseFor(i) : 0;
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
            case 'decimal_mark': {
                // 小数点を商と被除数に描画（確認ステップ：current なら紫で強調、past なら通常色）
                const dpColor = isCurrentStep ? '#8e44ad' : '#8e44ad';
                h.putQuotientDecimalPoint(dpColor);
                // 被除数側の小数点も描画（.0 の 0 はまだ描かない）
                // putDividendDecimalExt(0, ...) は "." のみ
                // → decimalShown フラグで上の putDividendDecimalExt が処理するので不要
                break;
            }
            case 'decimal_carry': {
                // 小数点はすでに decimal_mark で描かれている
                // carry の 0: current なら mask、past なら確定表示
                const nextPlace = i + 1; // = integerDigits (小数第1位)
                const carryRow = quotientSeq[i] === 0 ? rowBase : rowBase + 2;
                // ここで i は前の（差を計算した）桁のインデックス
                // decimal_carry の digitIndex は integerDigits - 1（直前の整数最終桁）
                if (isCurrentStep && step.requiresInput) {
                    h.drawMask(carryRow, nextPlace, 1);
                }
                else {
                    const color = isCurrentStep ? '#27ae60' : '#2c2416';
                    h.putTextAtDigit(totalSeq[i + 1], carryRow, nextPlace, color);
                }
                break;
            }
            case 'quotient': {
                if (isCurrentStep && step.requiresInput) {
                    h.drawQuotientMask(i);
                }
                else {
                    const color = isCurrentStep ? '#c0392b' : '#2c2416';
                    h.putQuotientDigit(quotientSeq[i], i, color);
                }
                break;
            }
            case 'product': {
                if (isCurrentStep && step.requiresInput) {
                    const digits = String(divisionSeq[i]).length;
                    h.drawMask(rowBase + 1, i, digits);
                }
                else {
                    const color = isCurrentStep ? '#2980b9' : '#2c2416';
                    h.putTextAtDigit(divisionSeq[i], rowBase + 1, i, color);
                }
                break;
            }
            case 'line': {
                h.drawResultLine(rowBase + 1, i, String(totalSeq[i]).length);
                break;
            }
            case 'diff': {
                if (isCurrentStep && step.requiresInput) {
                    const digits = Math.max(1, String(subtractionSeq[i]).length);
                    h.drawMask(rowBase + 2, i, digits);
                }
                else {
                    const color = isCurrentStep ? '#2c2416' : '#2c2416';
                    h.putTextAtDigit(subtractionSeq[i], rowBase + 2, i, color);
                }
                break;
            }
            case 'carry': {
                const nextPlace = i + 1;
                // q=0 のとき product/diff 行がないので carry は rowBase の行に来る
                const carryRow = quotientSeq[i] === 0 ? rowBase : rowBase + 2;
                if (isCurrentStep && step.requiresInput) {
                    h.drawMask(carryRow, nextPlace, 1);
                }
                else {
                    const color = isCurrentStep ? '#27ae60' : '#2c2416';
                    h.putTextAtDigit(totalSeq[i + 1], carryRow, nextPlace, color);
                }
                break;
            }
            case 'conclusion': {
                // no drawing
                break;
            }
        }
    }
}
// =============================================
// 問題生成
// =============================================
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
    const canvas = document.getElementById('s2-canvas');
    const captionStepEl = document.getElementById('s2-caption-step');
    const instructionEl = document.getElementById('s2-instruction');
    const inputWrap = document.getElementById('s2-input-wrap');
    const inputEl = document.getElementById('s2-input');
    const feedbackEl = document.getElementById('s2-feedback');
    const stepIndEl = document.getElementById('s2-step-indicator');
    const dotsContainer = document.getElementById('s2-progress-dots');
    const btnCheck = document.getElementById('s2-btn-check');
    const problemTitle = document.getElementById('s2-problem-title');
    const quotientStr = buildQuotientString(seq.quotientSeq, seq.integerDigits);
    problemTitle.textContent = `${dividend} ÷ ${divisor} = ?`;
    dotsContainer.innerHTML = '';
    for (let i = 0; i <= totalSteps; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        dot.dataset['i'] = String(i);
        dot.title = steps[i].label;
        dotsContainer.appendChild(dot);
    }
    let currentStep = 0;
    let flashTimer = null;
    inputEl.addEventListener('input', () => {
        inputEl.value = inputEl.value.replace(/[^0-9]/g, '');
        feedbackEl.textContent = '';
        feedbackEl.className = 's2-feedback';
        inputEl.classList.remove('flash-correct', 'flash-wrong');
    });
    /*
    inputEl.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleCheck();
      }
    });*/
    const newBtnCheck = btnCheck.cloneNode(true);
    btnCheck.replaceWith(newBtnCheck);
    newBtnCheck.addEventListener('click', handleCheck);
    function handleCheck() {
        const step = steps[currentStep];
        if (!step.requiresInput) {
            advance();
            return;
        }
        const raw = inputEl.value.trim();
        if (raw === '')
            return;
        const parsed = parseInt(raw, 10);
        if (isNaN(parsed)) {
            flash(false);
            return;
        }
        if (parsed === step.expectedAnswer) {
            flash(true, () => advance());
        }
        else {
            flash(false);
        }
    }
    function flash(correct, onDone) {
        if (flashTimer !== null)
            clearTimeout(flashTimer);
        inputEl.classList.remove('flash-correct', 'flash-wrong');
        feedbackEl.className = 's2-feedback';
        if (correct) {
            inputEl.classList.add('flash-correct');
            feedbackEl.textContent = 'Correct ✓';
            feedbackEl.classList.add('correct');
            flashTimer = setTimeout(() => {
                inputEl.classList.remove('flash-correct');
                feedbackEl.textContent = '';
                feedbackEl.className = 's2-feedback';
                if (onDone)
                    onDone();
            }, 2000);
        }
        else {
            inputEl.classList.add('flash-wrong');
            feedbackEl.textContent = 'Try again ✗';
            feedbackEl.classList.add('wrong');
            flashTimer = setTimeout(() => {
                inputEl.classList.remove('flash-wrong');
                feedbackEl.textContent = '';
                feedbackEl.className = 's2-feedback';
                inputEl.value = '';
                inputEl.focus();
            }, 2000);
        }
    }
    function advance() {
        if (currentStep < totalSteps) {
            currentStep++;
            update();
        }
    }
    function update() {
        render(canvas, steps, currentStep, dividend, divisor, seq);
        const step = steps[currentStep];
        captionStepEl.textContent = step.label;
        instructionEl.textContent = step.instruction;
        stepIndEl.textContent = `${currentStep} / ${totalSteps}`;
        if (step.requiresInput) {
            inputWrap.style.display = 'flex';
            inputEl.value = '';
            feedbackEl.textContent = '';
            feedbackEl.className = 's2-feedback';
            inputEl.classList.remove('flash-correct', 'flash-wrong');
            setTimeout(() => inputEl.focus(), 50);
        }
        else {
            inputWrap.style.display = 'none';
        }
        const isLast = currentStep === totalSteps;
        newBtnCheck.textContent = isLast
            ? 'Done ✓'
            : step.requiresInput
                ? 'Check →'
                : 'Next →';
        newBtnCheck.disabled = isLast;
        dotsContainer.querySelectorAll('.dot').forEach((dot) => {
            const idx = parseInt(dot.dataset['i'] ?? '0');
            dot.className =
                'dot' +
                    (idx === currentStep ? ' active' : idx < currentStep ? ' done' : '');
        });
    }
    update();
}
// =============================================
// エントリポイント
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    let { dividend, divisor } = randomProblem();
    initUI(dividend, divisor);
    const btnNew = document.getElementById('s2-btn-new');
    btnNew.addEventListener('click', () => {
        ({ dividend, divisor } = randomProblem());
        initUI(dividend, divisor);
        // New ボタンのフォーカスを外し、input に移す（Enter 二重発火防止）
        btnNew.blur();
    });
    // New ボタンが focused のとき Enter で再実行されないようにする
    btnNew.addEventListener('keydown', (e) => {
        if (e.key === 'Enter')
            e.preventDefault();
    });
});
export {};

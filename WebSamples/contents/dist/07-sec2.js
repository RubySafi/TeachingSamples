// =============================================
// データ生成（sec1 と同一ロジック）
// =============================================
function generateSequences(dividend, divisor) {
    const dividendStr = dividend.toString();
    const totalSeq = [];
    const quotientSeq = [];
    const divisionSeq = [];
    const subtractionSeq = [];
    let remainder = 0;
    for (let i = 0; i < dividendStr.length; i++) {
        const current = remainder * 10 + parseInt(dividendStr[i]);
        const q = Math.floor(current / divisor);
        const d = q * divisor;
        const sub = current - d;
        totalSeq.push(current);
        quotientSeq.push(q);
        divisionSeq.push(d);
        subtractionSeq.push(sub);
        remainder = sub;
    }
    return { totalSeq, quotientSeq, divisionSeq, subtractionSeq };
}
function placeName(place) {
    const names = ['ones', 'tens', 'hundreds', 'thousands', 'ten-thousands'];
    return names[place] ?? `10^${place}`;
}
// =============================================
// ステップ生成
// =============================================
function generateSteps(dividend, divisor, seq) {
    const { totalSeq, quotientSeq, divisionSeq, subtractionSeq } = seq;
    const dividendStr = dividend.toString();
    const numDigits = dividendStr.length;
    const quotientFull = Math.floor(dividend / divisor);
    const remainderFull = dividend % divisor;
    const steps = [];
    const iStart = quotientSeq.findIndex((q) => q !== 0);
    // Step 0: problem statement（入力なし）
    steps.push({
        type: 'problem',
        label: 'STEP 0',
        instruction: `Solve ${dividend} ÷ ${divisor} using long division. Press Check → to begin.`,
        requiresInput: false,
    });
    // Step 1: frame（入力なし）
    steps.push({
        type: 'frame',
        label: 'STEP 1',
        instruction: `Write ${dividend} inside the bracket and ${divisor} on the left.`,
        requiresInput: false,
    });
    // look（必要な場合のみ・入力なし）
    if (iStart > 0) {
        steps.push({
            type: 'look',
            label: `STEP ${steps.length}`,
            instruction: `Look at the first ${iStart + 1} digit${iStart > 0 ? 's' : ''}: ${totalSeq[iStart]}. This is the smallest leading part that ${divisor} can go into.`,
            digitIndex: iStart,
            requiresInput: false,
        });
    }
    for (let i = iStart; i < numDigits; i++) {
        const place = numDigits - 1 - i;
        const q = quotientSeq[i];
        const isLast = i === numDigits - 1;
        // --- quotient（入力：何桁目の商か） ---
        steps.push({
            type: 'quotient',
            label: `STEP ${steps.length}`,
            instruction: q === 0
                ? `How many times does ${divisor} go into ${totalSeq[i]}? Write the ${placeName(place)} digit of the quotient.`
                : `How many times does ${divisor} go into ${totalSeq[i]}? Write the ${placeName(place)} digit of the quotient.`,
            digitIndex: i,
            requiresInput: true,
            expectedAnswer: q,
        });
        if (q === 0) {
            if (isLast) {
                steps.push({
                    type: 'conclusion',
                    label: `STEP ${steps.length}`,
                    instruction: remainderFull === 0
                        ? `Done! ${dividend} ÷ ${divisor} = ${quotientFull}`
                        : `Done! ${dividend} ÷ ${divisor} = ${quotientFull} remainder ${remainderFull}`,
                    digitIndex: i,
                    requiresInput: false,
                });
            }
            else {
                // carry のみ（product/diff なし）
                steps.push({
                    type: 'carry',
                    label: `STEP ${steps.length}`,
                    instruction: `Bring down the next digit. What digit comes down?`,
                    digitIndex: i,
                    requiresInput: true,
                    expectedAnswer: parseInt(dividendStr[i + 1]),
                });
            }
            continue;
        }
        // --- product（入力：divisor × q の積） ---
        steps.push({
            type: 'product',
            label: `STEP ${steps.length}`,
            instruction: `Multiply: ${divisor} × ${q} = ? Write the product below ${totalSeq[i]}.`,
            digitIndex: i,
            requiresInput: true,
            expectedAnswer: divisionSeq[i],
        });
        // --- line（入力なし） ---
        steps.push({
            type: 'line',
            label: `STEP ${steps.length}`,
            instruction: `Draw a line and subtract.`,
            digitIndex: i,
            requiresInput: false,
        });
        // --- diff（入力：引き算の結果） ---
        steps.push({
            type: 'diff',
            label: `STEP ${steps.length}`,
            instruction: isLast
                ? subtractionSeq[i] === 0
                    ? `Subtract: ${totalSeq[i]} − ${divisionSeq[i]} = ? (This is the remainder.)`
                    : `Subtract: ${totalSeq[i]} − ${divisionSeq[i]} = ? (This is the remainder.)`
                : `Subtract: ${totalSeq[i]} − ${divisionSeq[i]} = ?`,
            digitIndex: i,
            requiresInput: true,
            expectedAnswer: subtractionSeq[i],
        });
        if (isLast) {
            steps.push({
                type: 'conclusion',
                label: `STEP ${steps.length}`,
                instruction: remainderFull === 0
                    ? `Well done! ${dividend} ÷ ${divisor} = ${quotientFull}`
                    : `Well done! ${dividend} ÷ ${divisor} = ${quotientFull} remainder ${remainderFull}`,
                digitIndex: i,
                requiresInput: false,
            });
            continue;
        }
        // --- carry（入力：降ろしてくる1桁のみ） ---
        steps.push({
            type: 'carry',
            label: `STEP ${steps.length}`,
            instruction: `Bring down the next digit. What digit comes down?`,
            digitIndex: i,
            requiresInput: true,
            expectedAnswer: parseInt(dividendStr[i + 1]),
        });
    }
    return steps;
}
function makeHelpers(ctx, cfg) {
    const { gridX, gridY, offsetX, numDigits } = cfg;
    const RowToY = (row) => cfg.offsetY + (row + 1) * gridY;
    const getX = (col) => offsetX + col * gridX;
    const cenX = (col) => getX(col) + gridX / 2;
    const cenY = (row) => RowToY(row) - gridY / 2;
    const placeToCol = (place) => 1 + (numDigits - 1 - place);
    function setFont(size = 28, color = '#2c2416') {
        ctx.font = `${size}px "JetBrains Mono", monospace`;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
    }
    /** セルに数値を右詰めで描画 */
    function putMainTextAtPlace(val, row, place, color) {
        const s = String(val);
        const rightCol = placeToCol(place);
        setFont(28, color ?? '#2c2416');
        s.split('')
            .reverse()
            .forEach((ch, i) => {
            ctx.fillText(ch, cenX(rightCol - i), cenY(row));
        });
    }
    function putQuotientAtPlace(val, place, color) {
        setFont(28, color ?? '#2c2416');
        ctx.fillText(String(val), cenX(placeToCol(place)), cenY(-1));
    }
    function putDividend(val, row, color) {
        const s = String(val);
        setFont(28, color ?? '#2c2416');
        s.split('').forEach((ch, i) => {
            ctx.fillText(ch, cenX(1 + i), cenY(row));
        });
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
    function drawFrame() {
        ctx.strokeStyle = '#2c2416';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(getX(1), RowToY(-1));
        ctx.lineTo(getX(1 + numDigits), RowToY(-1));
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
    function drawResultLine(row, place, digits) {
        const rightCol = placeToCol(place);
        const startCol = rightCol - digits + 1;
        const xStart = getX(startCol);
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
        const numCols = numDigits + 2;
        ctx.strokeStyle = '#ebe6da';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let c = -1; c <= numCols; c++) {
            ctx.moveTo(getX(c), cfg.offsetY);
            ctx.lineTo(getX(c), cfg.offsetY + numRows * gridY);
        }
        for (let r = 0; r <= numRows; r++) {
            ctx.moveTo(getX(-1), cfg.offsetY + r * gridY);
            ctx.lineTo(getX(numCols), cfg.offsetY + r * gridY);
        }
        ctx.stroke();
    }
    /**
     * マスク矩形：入力待ちのセルを塗りつぶして隠す
     * place + digit count から描画範囲を計算する
     */
    function drawMask(row, place, digits) {
        const rightCol = placeToCol(place);
        const leftCol = rightCol - digits + 1;
        const x = getX(leftCol);
        const y = RowToY(row) - gridY;
        const w = getX(rightCol + 1) - x;
        const h2 = gridY;
        // 背景塗りつぶし（用紙色で上書き）
        ctx.fillStyle = '#fffef9';
        ctx.fillRect(x + 1, y + 1, w - 2, h2 - 2);
        // 枠線（青点線）
        ctx.strokeStyle = '#2980b9';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.strokeRect(x + 2, y + 2, w - 4, h2 - 4);
        ctx.setLineDash([]);
        ctx.lineWidth = 2;
    }
    /**
     * 商エリアのマスク（quotient 行は row=-1 固定）
     */
    function drawQuotientMask(place) {
        drawMask(-1, place, 1);
    }
    return {
        RowToY,
        getX,
        cenX,
        cenY,
        placeToCol,
        putMainTextAtPlace,
        putQuotientAtPlace,
        putDividend,
        putDivisor,
        drawFrame,
        drawResultLine,
        drawGrid,
        drawMask,
        drawQuotientMask,
    };
}
// =============================================
// render（sec1 の render を練習用に拡張）
// =============================================
/**
 * upToStep までの確定済みステップを描画し，
 * currentStep（= upToStep）が requiresInput なら
 * 該当セルにマスクを上書きする．
 */
function render(canvas, steps, upToStep, dividend, divisor, seq) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const numDigits = dividend.toString().length;
    const dividendStr = dividend.toString();
    const cfg = {
        gridX: 44,
        gridY: 52,
        offsetX: 44,
        offsetY: 52,
        numDigits,
    };
    const iStart = seq.quotientSeq.findIndex((q) => q !== 0);
    function rowBaseFor(i) {
        let r = 0;
        for (let j = iStart; j < i; j++) {
            if (seq.quotientSeq[j] !== 0)
                r++;
        }
        return r * 2;
    }
    const activeDigits = seq.quotientSeq
        .slice(iStart)
        .filter((q) => q !== 0).length;
    const numRows = activeDigits * 2 + 2;
    const h = makeHelpers(ctx, cfg);
    h.drawGrid(numRows);
    if (upToStep < 1)
        return;
    h.putDivisor(divisor);
    h.putDividend(dividend, 0);
    h.drawFrame();
    // upToStep-1 まで確定済み描画（現在ステップは後でマスク付きで処理）
    for (let s = 2; s <= upToStep; s++) {
        const step = steps[s];
        if (!step)
            break;
        const i = step.digitIndex;
        const place = numDigits - 1 - i;
        const rowBase = rowBaseFor(i);
        const isCurrentStep = s === upToStep;
        switch (step.type) {
            case 'look': {
                h.putDividend(dividend, 0, '#b0a898');
                const highlightColor = isCurrentStep ? '#2980b9' : '#2c2416';
                ctx.font = '28px "JetBrains Mono", monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                for (let k = 0; k <= i; k++) {
                    ctx.fillStyle = highlightColor;
                    ctx.fillText(dividendStr[k], h.cenX(1 + k), h.cenY(0));
                }
                break;
            }
            case 'quotient': {
                h.putDividend(dividend, 0, '#2c2416');
                if (isCurrentStep && step.requiresInput) {
                    // 入力待ち → マスク
                    h.drawQuotientMask(place);
                }
                else {
                    const color = isCurrentStep
                        ? seq.quotientSeq[i] === 0
                            ? '#8a7a5c'
                            : '#c0392b'
                        : '#2c2416';
                    h.putQuotientAtPlace(seq.quotientSeq[i], place, color);
                }
                break;
            }
            case 'product': {
                if (isCurrentStep && step.requiresInput) {
                    // 積の桁数でマスク幅を決める
                    const digits = String(seq.divisionSeq[i]).length;
                    h.drawMask(rowBase + 1, place, digits);
                }
                else {
                    const color = isCurrentStep ? '#2980b9' : '#2c2416';
                    h.putMainTextAtPlace(seq.divisionSeq[i], rowBase + 1, place, color);
                }
                break;
            }
            case 'line': {
                // 割線は入力不要なので常に表示
                h.drawResultLine(rowBase + 1, place, String(seq.totalSeq[i]).length);
                break;
            }
            case 'diff': {
                if (isCurrentStep && step.requiresInput) {
                    const digits = String(seq.subtractionSeq[i]).length;
                    h.drawMask(rowBase + 2, place, digits);
                }
                else {
                    const isLast = i === numDigits - 1;
                    const color = isCurrentStep && isLast ? '#c0392b' : '#2c2416';
                    h.putMainTextAtPlace(seq.subtractionSeq[i], rowBase + 2, place, color);
                }
                break;
            }
            case 'carry': {
                // carry の expectedAnswer は 1 桁
                // 表示位置は totalSeq[i+1] と同じセルだが，
                // 既に diff が確定している差の値はそのまま残し，
                // 降ろしてくる 1 桁のみをマスクする
                const nextPlace = numDigits - 1 - (i + 1);
                const carryRow = seq.quotientSeq[i] === 0 ? rowBase : rowBase + 2;
                if (isCurrentStep && step.requiresInput) {
                    // 1 桁のマスク
                    h.drawMask(carryRow, nextPlace, 1);
                    // すでに確定している差部分（totalSeq[i+1] の上位桁）を描く
                    // totalSeq[i+1] = subtractionSeq[i] * 10 + nextDigit
                    // subtractionSeq[i] が 0 でなければ上位桁を表示済みのはず
                    // → carry マスクは下す 1 桁のセルのみなので問題なし
                }
                else {
                    const color = isCurrentStep ? '#27ae60' : '#2c2416';
                    h.putMainTextAtPlace(seq.totalSeq[i + 1], carryRow, nextPlace, color);
                }
                break;
            }
            case 'conclusion': {
                // 描画なし（instruction で表示）
                break;
            }
        }
    }
}
// =============================================
// 問題生成
// =============================================
function randomProblem() {
    const dividend = Math.floor(Math.random() * 9000) + 1000;
    const divisor = Math.floor(Math.random() * 8) + 2;
    return { dividend, divisor };
}
// =============================================
// UI 初期化
// =============================================
function initUI(dividend, divisor) {
    const seq = generateSequences(dividend, divisor);
    const steps = generateSteps(dividend, divisor, seq);
    const totalSteps = steps.length - 1;
    const canvas = document.getElementById('s2-canvas');
    const captionStepEl = document.getElementById('s2-caption-step');
    const instructionEl = document.getElementById('s2-instruction');
    const inputWrap = document.getElementById('s2-input-wrap');
    const inputEl = document.getElementById('s2-input');
    const feedbackEl = document.getElementById('s2-feedback'); // input 直下の行
    const stepIndEl = document.getElementById('s2-step-indicator');
    const dotsContainer = document.getElementById('s2-progress-dots');
    const btnCheck = document.getElementById('s2-btn-check');
    const problemTitle = document.getElementById('s2-problem-title');
    problemTitle.textContent = `${dividend} ÷ ${divisor} = ?`;
    // ドット生成
    dotsContainer.innerHTML = '';
    for (let i = 0; i <= totalSteps; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        dot.dataset['i'] = String(i);
        dot.title = steps[i].label;
        // Section 2 ではドットクリックによるジャンプは無効（順番通りに解く）
        dotsContainer.appendChild(dot);
    }
    let currentStep = 0;
    let flashTimer = null;
    // ── input validation: 数字と '-' のみ ──────────────────
    inputEl.addEventListener('input', () => {
        inputEl.value = inputEl.value.replace(/[^0-9\-]/g, '');
        // フラッシュ中にタイプしたらフィードバックをリセット
        feedbackEl.textContent = '';
        feedbackEl.className = 's2-feedback';
        inputEl.classList.remove('flash-correct', 'flash-wrong');
    });
    /*
    // ── Enter キーで Check と同じ動作 ──────────────────────
    inputEl.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleCheck();
      }
    });*/
    // ── Check ボタン ────────────────────────────────────────
    // cloneNode で古いリスナーを除去
    const newBtnCheck = btnCheck.cloneNode(true);
    btnCheck.replaceWith(newBtnCheck);
    newBtnCheck.addEventListener('click', handleCheck);
    function handleCheck() {
        const step = steps[currentStep];
        // 入力不要ステップは Check = 次へ進む
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
            // 正解後は少し待ってから自動進行
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
        // ① 入力欄の表示切替（display:none で完全に隠す）
        if (step.requiresInput) {
            inputWrap.style.display = 'flex';
            inputEl.value = '';
            feedbackEl.textContent = '';
            feedbackEl.className = 's2-feedback';
            inputEl.classList.remove('flash-correct', 'flash-wrong');
            // 自動フォーカス
            setTimeout(() => inputEl.focus(), 50);
        }
        else {
            inputWrap.style.display = 'none';
        }
        // Check ボタンのラベル
        const isLast = currentStep === totalSteps;
        newBtnCheck.textContent = isLast
            ? 'Done ✓'
            : step.requiresInput
                ? 'Check →'
                : 'Next →';
        newBtnCheck.disabled = isLast;
        // ドット更新
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

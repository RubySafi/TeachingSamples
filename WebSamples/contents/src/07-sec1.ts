export {};

// =============================================
// 型定義
// =============================================

type StepType =
  | 'problem'   // Step 0: show the problem
  | 'frame'     // Step 1: draw bracket and divisor only (no dividend)
  | 'look'      // highlight the first non-zero group: write totalSeq[iStart] at row 0
  | 'quotient'  // write quotient digit (q=0: skip product/line/diff/carry)
  | 'product'   // write divisor × quotient digit
  | 'line'      // draw subtraction line
  | 'diff'      // write the remainder after subtraction
  | 'carry'      // bring down the next digit (write totalSeq[i+1])
  | 'conclusion'; // final answer statement (no new drawing)

interface Step {
  type: StepType;
  label: string;
  caption: string;
  /** quotient ステップ用: 桁インデックス (0=最上位) */
  digitIndex?: number;
}

interface Sequences {
  totalSeq: number[];
  quotientSeq: number[];
  divisionSeq: number[];
  subtractionSeq: number[];
}

// =============================================
// データ生成
// =============================================

function generateSequences(dividend: number, divisor: number): Sequences {
  const dividendStr = dividend.toString();
  const totalSeq: number[] = [];
  const quotientSeq: number[] = [];
  const divisionSeq: number[] = [];
  const subtractionSeq: number[] = [];

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

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

/** Return the place name in English: 0→"ones", 1→"tens", 2→"hundreds", 3→"thousands" */
function placeName(place: number): string {
  const names = ['ones', 'tens', 'hundreds', 'thousands', 'ten-thousands'];
  return names[place] ?? `10^${place}`;
}

/**
 * Build the step list.
 * When quotient digit q === 0: only one 'quotient' step is emitted;
 * product / line / diff / carry are all skipped.
 */
function generateSteps(
  dividend: number,
  divisor: number,
  seq: Sequences
): Step[] {
  const { totalSeq, quotientSeq, divisionSeq, subtractionSeq } = seq;
  const numDigits = dividend.toString().length;
  const quotientFull = Math.floor(dividend / divisor);
  const remainderFull = dividend % divisor;
  const steps: Step[] = [];

  // iStart: first digit index where quotient != 0
  const iStart = quotientSeq.findIndex(q => q !== 0);
  // (iStart is always found for valid dividend > 0)

  // Step 0: problem statement
  steps.push({
    type: 'problem',
    label: 'STEP 0',
    caption: `We are going to solve ${dividend} ÷ ${divisor} using long division.`,
  });

  // Step 1: frame + divisor only (dividend is NOT written yet)
  steps.push({
    type: 'frame',
    label: 'STEP 1',
    caption: `Write ${dividend} (the dividend) inside the bracket and ${divisor} (the divisor) on the left.`,
  });

  // Step 2 (only when iStart > 0): look at the first group of digits that is >= divisor
  if (iStart > 0) {
    steps.push({
      type: 'look',
      label: `STEP ${steps.length}`,
      caption: `Look at the first ${iStart + 1} digit${iStart > 0 ? 's' : ''}: ${totalSeq[iStart]}. This is the smallest leading part of ${dividend} that ${divisor} can go into.`,
      digitIndex: iStart,
    });
  }

  // Loop starts at iStart: leading q=0 digits are fully covered by 'look'.
  for (let i = iStart; i < numDigits; i++) {
    const place = numDigits - 1 - i;
    const q = quotientSeq[i];
    const isLast = i === numDigits - 1;

    // --- quotient ---
    steps.push({
      type: 'quotient',
      label: `STEP ${steps.length}`,
      caption:
        q === 0
          ? `${totalSeq[i]} ÷ ${divisor} = 0. The ${placeName(place)} digit of the quotient is 0, so we write 0 and bring down the next digit.`
          : `How many times does ${divisor} go into ${totalSeq[i]}? It goes ${q} time${q !== 1 ? 's' : ''}. Write ${q} in the ${placeName(place)} place of the quotient.`,
      digitIndex: i,
    });

    if (q === 0) {
      if (isLast) {
        // Last digit is 0: no subtraction steps, but we still need a conclusion.
        steps.push({
          type: 'conclusion',
          label: `STEP ${steps.length}`,
          caption: remainderFull === 0
            ? `The ones digit of the quotient is 0, so it divides evenly! The answer is ${dividend} ÷ ${divisor} = ${quotientFull}.`
            : `The ones digit of the quotient is 0. The answer is ${dividend} ÷ ${divisor} = ${quotientFull} remainder ${remainderFull}.`,
          digitIndex: i,
        });
      } else {
        // Not last: skip product / line / diff, but still bring down the next digit.
        steps.push({
          type: 'carry',
          label: `STEP ${steps.length}`,
          caption: `Bring down the next digit. We now have ${totalSeq[i + 1]}.`,
          digitIndex: i,
        });
      }
      continue;
    }

    // --- product ---
    steps.push({
      type: 'product',
      label: `STEP ${steps.length}`,
      caption: `Multiply: ${divisor} × ${q} = ${divisionSeq[i]}. Write ${divisionSeq[i]} below ${totalSeq[i]}.`,
      digitIndex: i,
    });

    // --- line ---
    steps.push({
      type: 'line',
      label: `STEP ${steps.length}`,
      caption: `Draw a line and subtract: ${totalSeq[i]} − ${divisionSeq[i]} = ${subtractionSeq[i]}.`,
      digitIndex: i,
    });

    // --- diff ---
    steps.push({
      type: 'diff',
      label: `STEP ${steps.length}`,
      caption: isLast
        ? subtractionSeq[i] === 0
          ? `Write the difference: the remainder is 0, so it divides evenly! The answer is ${dividend} ÷ ${divisor} = ${quotientFull}.`
          : `Write the difference: ${subtractionSeq[i]}. This is the remainder. The answer is ${dividend} ÷ ${divisor} = ${quotientFull} remainder ${remainderFull}.`
        : `Write the difference: ${subtractionSeq[i]}.`,
      digitIndex: i,
    });

    if (isLast) continue; // no carry on the last digit

    // --- carry (bring down next digit) ---
    steps.push({
      type: 'carry',
      label: `STEP ${steps.length}`,
      caption: `Bring down the next digit. We now have ${totalSeq[i + 1]}.`,
      digitIndex: i,
    });
  }

  return steps;
}

// =============================================
// Canvas 描画ヘルパー
// =============================================

interface DrawConfig {
  gridX: number;
  gridY: number;
  offsetX: number;
  offsetY: number;
  numDigits: number;
}

function makeHelpers(ctx: CanvasRenderingContext2D, cfg: DrawConfig) {
  const { gridX, gridY, offsetX, numDigits } = cfg;

  const RowToY = (row: number) => cfg.offsetY + (row + 1) * gridY;
  const getX = (col: number) => offsetX + col * gridX;
  const cenX = (col: number) => getX(col) + gridX / 2;
  const cenY = (row: number) => RowToY(row) - gridY / 2;
  // place=0 → 一の位
  const placeToCol = (place: number) => 1 + (numDigits - 1 - place);

  function setFont(size = 28, color = '#2c2416') {
    ctx.font = `${size}px "JetBrains Mono", monospace`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
  }

  function putMainTextAtPlace(val: number, row: number, place: number, color?: string) {
    const s = String(val);
    const rightCol = placeToCol(place);
    setFont(28, color ?? '#2c2416');
    s.split('').reverse().forEach((ch, i) => {
      ctx.fillText(ch, cenX(rightCol - i), cenY(row));
    });
  }

  function putQuotientAtPlace(val: number, place: number, color?: string) {
    setFont(28, color ?? '#2c2416');
    ctx.fillText(String(val), cenX(placeToCol(place)), cenY(-1));
  }

  function putDividend(val: number, row: number, color?: string) {
    const s = String(val);
    setFont(28, color ?? '#2c2416');
    s.split('').forEach((ch, i) => {
      ctx.fillText(ch, cenX(1 + i), cenY(row));
    });
  }

  function putDivisor(val: number) {
    const s = String(val);
    setFont(28, '#2c2416');
    s.split('').reverse().forEach((ch, i) => {
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

  function drawResultLine(row: number, place: number, digits: number) {
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

  function drawGrid(numRows: number) {
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

  return {
    RowToY, getX, cenX, cenY, placeToCol,
    putMainTextAtPlace, putQuotientAtPlace,
    putDividend, putDivisor,
    drawFrame, drawResultLine, drawGrid,
  };
}

// =============================================
// render(upToStep)
// =============================================

/**
 * Row assignment:
 *
 *   row 0           : dividend (written by drawFrame / putDividend)
 *   row 1, 3, 5 ... : product lines  (divisor × quotient digit)
 *   row 2, 4, 6 ... : diff / carry lines
 *
 * Each digit i that has q != 0 consumes 2 rows (product + diff).
 * Digits with q == 0 consume 0 rows (carry re-uses the same diff row
 * as the *previous* active digit, or row 2 for the very first digit).
 *
 * rowBaseFor(i) returns the FIRST row (= product row) for digit i.
 * For q==0 digits we only need the "diff row" of the previous block,
 * which is rowBaseFor(i) + 1  (handled in the carry case below).
 *
 * Concretely, rowBaseFor counts how many non-zero-quotient digits
 * came before i, and multiplies by 2:
 *   rowBaseFor(i) = (# of j < i with q[j] != 0) * 2
 *
 * place vs position:
 *   diff  → right-aligned to place of subtractionSeq[i]
 *            i.e. place = numDigits - 1 - i  (same column as product)
 *   carry → right-aligned to place of totalSeq[i+1]
 *            i.e. place = numDigits - 1 - (i+1) = place - 1
 *            BUT totalSeq[i+1] may be wider than 1 digit, so we use
 *            putMainTextAtPlace with the place of digit i+1.
 */
function render(
  canvas: HTMLCanvasElement,
  steps: Step[],
  upToStep: number,
  dividend: number,
  divisor: number,
  seq: Sequences
) {
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const numDigits = dividend.toString().length;
  const cfg: DrawConfig = {
    gridX: 44,
    gridY: 52,
    offsetX: 44,
    offsetY: 52,
    numDigits,
  };

  // iStart: first digit with non-zero quotient — loop and row counting start here.
  const iStart = seq.quotientSeq.findIndex(q => q !== 0);

  /**
   * Canvas row base for digit i (counting from iStart).
   * Each non-zero-quotient digit after iStart consumes 2 rows.
   * q==0 digits inside the loop consume 0 rows (their carry sits at rowBase+1).
   * rowBaseFor(iStart) === 0  (product of iStart goes at row 1).
   */
  function rowBaseFor(i: number): number {
    let r = 0;
    for (let j = iStart; j < i; j++) {
      if (seq.quotientSeq[j] !== 0) r++;
    }
    return r * 2;
  }

  // Total canvas rows needed
  const activeDigits = seq.quotientSeq.slice(iStart).filter(q => q !== 0).length;
  const numRows = activeDigits * 2 + 2;

  const h = makeHelpers(ctx, cfg);
  h.drawGrid(numRows);

  if (upToStep < 1) return;

  // Step 1: frame, divisor, and dividend (full number shown from the start)
  h.putDivisor(divisor);
  h.putDividend(dividend, 0);
  h.drawFrame();

  // Step 2+: replay every step up to upToStep
  for (let s = 2; s <= upToStep; s++) {
    const step = steps[s];
    if (!step) break;
    const i = step.digitIndex!;
    const place = numDigits - 1 - i;        // place of digit i (0=ones)
    const rowBase = rowBaseFor(i);           // first row for this digit
    const isCurrentStep = s === upToStep;

    switch (step.type) {
      case 'look': {
        // Draw full dividend dimmed, then overwrite the "looked-at"
        // leading group (digits 0..i) in the highlight colour.
        h.putDividend(dividend, 0, '#b0a898');
        const dStr = String(dividend);
        const highlightColor = isCurrentStep ? '#2980b9' : '#2c2416';
        const ctx2 = canvas.getContext('2d')!;
        ctx2.font = '28px "JetBrains Mono", monospace';
        ctx2.textAlign = 'center';
        ctx2.textBaseline = 'middle';
        for (let k = 0; k <= i; k++) {
          ctx2.fillStyle = highlightColor;
          ctx2.fillText(dStr[k], h.cenX(1 + k), h.cenY(0));
        }
        break;
      }
      case 'quotient': {
        // When iStart === 0 there is no 'look' step, so we must draw the
        // full dividend here (on the very first quotient step and beyond).
        // When iStart > 0 the 'look' step already drew it — redraw to
        // ensure it is present regardless of step ordering.
        h.putDividend(dividend, 0, '#2c2416');
        const color = isCurrentStep
          ? (seq.quotientSeq[i] === 0 ? '#8a7a5c' : '#c0392b')
          : '#2c2416';
        h.putQuotientAtPlace(seq.quotientSeq[i], place, color);
        break;
      }
      case 'product': {
        // product written at rowBase + 1 (one below dividend / previous carry)
        const color = isCurrentStep ? '#2980b9' : '#2c2416';
        h.putMainTextAtPlace(seq.divisionSeq[i], rowBase + 1, place, color);
        break;
      }
      case 'line': {
        // line spans the width of totalSeq[i], placed at rowBase + 1
        h.drawResultLine(rowBase + 1, place, String(seq.totalSeq[i]).length);
        break;
      }
      case 'diff': {
        // diff = subtractionSeq[i], right-aligned to place of digit i
        const isLast = i === numDigits - 1;
        const color = isCurrentStep ? '#c0392b' : '#2c2416';
        h.putMainTextAtPlace(seq.subtractionSeq[i], rowBase + 2, place, color);
        break;
      }
      case 'conclusion': {
        // No new drawing — the answer statement is shown in the caption only.
        break;
      }
      case 'carry': {
        // carry = totalSeq[i+1], right-aligned to place of digit i+1
        // It sits on the same row as diff (rowBase + 2),
        // but if q[i] == 0 there is no product row, so carry sits at rowBase + 1.
        // q==0: no product/diff rows were opened for this digit,
        // so the carry lands on the previous active block's diff row = rowBase.
        // q!=0: carry lands just below this digit's diff row = rowBase + 2.
        const carryRow = seq.quotientSeq[i] === 0 ? rowBase : rowBase + 2;
        const nextPlace = numDigits - 1 - (i + 1);   // place of digit i+1
        const color = isCurrentStep ? '#27ae60' : '#2c2416';
        h.putMainTextAtPlace(seq.totalSeq[i + 1], carryRow, nextPlace, color);
        break;
      }
    }
  }
}

// =============================================
// 問題生成（New ボタン用）
// =============================================

function randomProblem(): { dividend: number; divisor: number } {
  // dividend: 4桁の整数 (1000〜9999)
  const dividend = Math.floor(Math.random() * 9000) + 1000;
  // divisor: 2〜9 の整数
  const divisor = Math.floor(Math.random() * 8) + 2;
  return { dividend, divisor };
}

// =============================================
// UI 初期化
// =============================================

function initUI(dividend: number, divisor: number) {
  const seq = generateSequences(dividend, divisor);
  const steps = generateSteps(dividend, divisor, seq);
  const totalSteps = steps.length - 1;

  const canvas = document.getElementById('division-canvas') as HTMLCanvasElement;
  const captionStepEl = document.getElementById('caption-step')!;
  const captionTextEl = document.getElementById('caption-text')!;
  const stepIndicatorEl = document.getElementById('step-indicator')!;
  const dotsContainer = document.getElementById('progress-dots')!;
  const btnBack = document.getElementById('btn-back') as HTMLButtonElement;
  const btnForward = document.getElementById('btn-forward') as HTMLButtonElement;
  const problemTitle = document.getElementById('problem-title')!;

  // タイトル更新
  problemTitle.textContent = `${dividend} ÷ ${divisor} = ?`;

  // ドット再生成
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
      const idx = parseInt((dot as HTMLElement).dataset['i'] ?? '0');
      dot.className =
        'dot' +
        (idx === currentStep ? ' active' : idx < currentStep ? ' done' : '');
    });
  }

  // イベント登録（古いリスナーを消すため要素を clone で差し替え）
  const newBtnBack = btnBack.cloneNode(true) as HTMLButtonElement;
  const newBtnForward = btnForward.cloneNode(true) as HTMLButtonElement;
  btnBack.replaceWith(newBtnBack);
  btnForward.replaceWith(newBtnForward);

  newBtnBack.addEventListener('click', () => { if (currentStep > 0) { currentStep--; update(); } });
  newBtnForward.addEventListener('click', () => { if (currentStep < totalSteps) { currentStep++; update(); } });

  // キーボード
  // (document レベルは一度だけ登録するため window.__keyHandler で管理)
  if ((window as any).__keyHandler) {
    document.removeEventListener('keydown', (window as any).__keyHandler);
  }
  (window as any).__keyHandler = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' && currentStep < totalSteps) { currentStep++; update(); }
    if (e.key === 'ArrowLeft' && currentStep > 0) { currentStep--; update(); }
  };
  document.addEventListener('keydown', (window as any).__keyHandler);

  update();
}

// =============================================
// エントリポイント
// =============================================

document.addEventListener('DOMContentLoaded', () => {
  let { dividend, divisor } = randomProblem();
  initUI(dividend, divisor);

  const btnNew = document.getElementById('btn-new') as HTMLButtonElement;
  btnNew.addEventListener('click', () => {
    ({ dividend, divisor } = randomProblem());
    initUI(dividend, divisor);
  });
});

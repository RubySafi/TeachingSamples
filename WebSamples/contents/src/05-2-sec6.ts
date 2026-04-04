// 05-2-sec6.ts
export {};

interface RelativePattern {
  name: string;
  coords: { x: number; y: number }[];
  pivotIndex: number;
}

const TILE_SIZE = 30;
const GRID_CENTER = 2;

const QUIZ_PATTERNS: RelativePattern[] = [
  // --- Pentominoes (ペントミノ) ---
  {
    name: 'P-Shape', // P型：密集している部分の角を赤に
    coords: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 0, y: -1 },
    ],
    pivotIndex: 0,
  },
  {
    name: 'X-Shape', // X型（十字）：中心を赤に
    coords: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 },
    ],
    pivotIndex: 0,
  },
  {
    name: 'U-Shape', // U型：底の端を赤に。回転すると向きが混乱しやすい
    coords: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: -1, y: -1 },
      { x: 1, y: -1 },
    ],
    pivotIndex: 0,
  },
  {
    name: 'V-Shape', // V型（L字の3x3版）：角を赤に
    coords: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
    ],
    pivotIndex: 0,
  },
  {
    name: 'T-Shape', // T型：頭の真ん中を赤に
    coords: [
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
    ],
    pivotIndex: 0,
  },
  {
    name: 'Z-Shape', // Z型：屈折点を赤に
    coords: [
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: -1, y: -1 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
    ],
    pivotIndex: 0,
  },
  {
    name: 'W-Shape', // W型：階段状の真ん中を赤に
    coords: [
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: -1, y: -1 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ],
    pivotIndex: 0,
  },
  {
    name: 'F-Shape', // F型：最も枝分かれが多い点を赤に（難問）
    coords: [
      { x: 0, y: 0 },
      { x: 0, y: -1 },
      { x: 1, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
    ],
    pivotIndex: 0,
  },
  {
    name: 'I-Shape', // I型（直線）：中心ではなく、端から2番目を赤に
    coords: [
      { x: 0, y: 0 },
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 0, y: -2 },
    ],
    pivotIndex: 1,
  },
  {
    name: 'Y-Shape', // Y型：枝分かれの付け根を赤に
    coords: [
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: 1 },
    ],
    pivotIndex: 0,
  },
  {
    name: 'L-Long', // 長いL型：折れ曲がる角を赤に
    coords: [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 0, y: 3 },
      { x: 1, y: 0 },
    ],
    pivotIndex: 0,
  },
  {
    name: 'N-Shape', // N型：少し複雑なジグザグ。中心を赤に
    coords: [
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: -1 },
      { x: 1, y: -1 },
      { x: -2, y: 0 },
    ],
    pivotIndex: 0,
  },
];

let currentPattern: RelativePattern;
let currentTargetAngle: number;
let userSelection: { x: number; y: number }[] = [];
let isHintRunning: boolean = false;

/**
 * Section 6 用ヒント実行
 */
function runHint6() {
  // 実行中またはクイズ未生成ならガード
  if (isHintRunning || !currentPattern) return;
  isHintRunning = true;

  const baseContainer = document.getElementById('sec06-base')!;
  baseContainer.innerHTML = ''; // 一旦クリア

  const animWrapper = document.createElement('div');

  const durationSec = 1.2;
  const stopTimeSec = 1.0;
  const easing = 'cubic-bezier(0.4, 0, 0.2, 1)';

  animWrapper.style.cssText = `
    position:absolute; 
    width:100%; 
    height:100%; 
    top:0; 
    left:0; 
    transform-origin:center center;
    transition: transform ${durationSec}s ${easing};
  `;

  // 現在のパターンをゴースト描画
  currentPattern.coords.forEach((p, i) => {
    const div = createTileElement(p.x, p.y);
    div.style.backgroundColor =
      i === currentPattern.pivotIndex
        ? 'rgba(231, 76, 60, 0.7)'
        : 'rgba(189, 195, 199, 0.5)';
    if (i === currentPattern.pivotIndex) div.style.borderRadius = '4px';
    animWrapper.appendChild(div);
  });

  baseContainer.appendChild(animWrapper);

  // 回転開始
  setTimeout(() => {
    animWrapper.style.transform = `rotate(${currentTargetAngle}deg)`;
  }, 50);

  // 終了処理
  const totalWaitMs = (durationSec + stopTimeSec) * 1000;
  setTimeout(() => {
    drawBaseShape(); // 静止画に戻す
    isHintRunning = false;
  }, totalWaitMs);
}

// --- 初期化イベントへの登録 ---
document.getElementById('sec06-btn-hint')?.addEventListener('click', runHint6);

/**
 * 座標回転関数
 */
function rotateCoords(coords: { x: number; y: number }[], degree: number) {
  return coords.map((p) => {
    if (degree === 90) return { x: -p.y, y: p.x };
    if (degree === -90 || degree === 270) return { x: p.y, y: -p.x };
    return { x: p.x, y: p.y };
  });
}

/**
 * クイズ生成
 */
function generateQuiz6() {
  const questionText = document.getElementById('sec06-question-text')!;

  // 1. パターンと角度を決定
  currentPattern =
    QUIZ_PATTERNS[Math.floor(Math.random() * QUIZ_PATTERNS.length)];
  currentTargetAngle = Math.random() > 0.5 ? 90 : -90;

  const directionName =
    currentTargetAngle === 90
      ? '90° Clockwise (⟳)'
      : '90° Counter-clockwise (⟲)';
  questionText.innerHTML = `Rotate the shape <b>${directionName}</b> relative to the Red Cell!`;
  questionText.style.color = 'black';

  // 2. 左側のベース図形描画
  drawBaseShape();

  // 3. 右側の解答エリア初期化
  initAnswerGrid();
}

/**
 * 左側：問題図形の描画（矢印付き）
 */
function drawBaseShape() {
  const baseContainer = document.getElementById('sec06-base')!;
  baseContainer.innerHTML = '';

  const pivot = currentPattern.coords[currentPattern.pivotIndex];

  currentPattern.coords.forEach((p, i) => {
    const div = createTileElement(p.x, p.y);
    if (i === currentPattern.pivotIndex) {
      div.style.backgroundColor = '#e74c3c';
    } else {
      div.style.backgroundColor = '#ecf0f1';
      div.style.border = '1px solid #bdc3c7';
    }
    baseContainer.appendChild(div);
  });
}

/**
 * 右側：インタラクティブな解答グリッド
 */
function initAnswerGrid() {
  const ansGrid = document.getElementById('sec06-ans')!;
  ansGrid.innerHTML = '';
  userSelection = [];

  const rotatedCoords = rotateCoords(currentPattern.coords, currentTargetAngle);
  const pivotPos = rotatedCoords[currentPattern.pivotIndex];

  // 5x5 グリッド生成
  for (let gy = -2; gy <= 2; gy++) {
    for (let gx = -2; gx <= 2; gx++) {
      const cell = createTileElement(gx, gy);
      cell.style.border = '1px solid #eee';
      cell.style.cursor = 'pointer';

      // 赤タイルの位置
      if (gx === pivotPos.x && gy === pivotPos.y) {
        cell.style.backgroundColor = '#e74c3c';
        cell.style.borderRadius = '4px';
      } else {
        // クリックイベント
        cell.onclick = () => {
          const isSelected = cell.getAttribute('data-selected') === 'true';
          if (isSelected) {
            cell.style.backgroundColor = '';
            cell.setAttribute('data-selected', 'false');
            userSelection = userSelection.filter(
              (p) => !(p.x === gx && p.y === gy)
            );
          } else {
            cell.style.backgroundColor = '#3498db';
            cell.setAttribute('data-selected', 'true');
            userSelection.push({ x: gx, y: gy });
          }
          checkRealTimeAnswer(); // リアルタイム監視
        };
      }
      ansGrid.appendChild(cell);
    }
  }
}

/**
 * リアルタイム正解判定
 */
function checkRealTimeAnswer() {
  const rotatedCoords = rotateCoords(currentPattern.coords, currentTargetAngle);

  // 正解の「赤以外の座標リスト」を作成
  const correctCoords = rotatedCoords.filter(
    (_, i) => i !== currentPattern.pivotIndex
  );

  // 数が一致しているか
  if (userSelection.length !== correctCoords.length) return;

  // すべてのユーザー選択が正解リストに含まれているか
  const isAllCorrect = userSelection.every((u) =>
    correctCoords.some((c) => c.x === u.x && c.y === u.y)
  );

  if (isAllCorrect) {
    const questionText = document.getElementById('sec06-question-text')!;
    questionText.innerHTML += ` <span style="color:red; margin-left:15px; font-size:1.2rem;">★ Correct! ★</span>`;

    // 全タイルをクリック不可にする
    const cells = document.querySelectorAll('#sec06-ans div');
    cells.forEach((c) => ((c as HTMLElement).onclick = null));
  }
}

// --- Helper Functions ---

function createTileElement(x: number, y: number) {
  const div = document.createElement('div');
  div.style.position = 'absolute';
  div.style.width = `${TILE_SIZE}px`;
  div.style.height = `${TILE_SIZE}px`;
  div.style.left = `${(x + GRID_CENTER) * TILE_SIZE}px`;
  div.style.top = `${(y + GRID_CENTER) * TILE_SIZE}px`;
  div.style.boxSizing = 'border-box';
  return div;
}

function createArrowElement(angleDeg: number) {
  const wrapper = document.createElement('div');
  wrapper.style.position = 'absolute';
  wrapper.style.top = '50%';
  wrapper.style.left = '50%';
  wrapper.style.transform = `translate(-50%, -50%) rotate(${angleDeg}deg)`;

  const line = document.createElement('div');
  line.style.width = '30px';
  line.style.height = '3px';
  line.style.backgroundColor = '#2c3e50';
  line.style.position = 'absolute';
  line.style.top = '-1.5px';
  line.style.left = '0';
  line.style.transformOrigin = 'left center';

  const head = document.createElement('div');
  head.style.width = '0';
  head.style.height = '0';
  head.style.borderTop = '6px solid transparent';
  head.style.borderBottom = '6px solid transparent';
  head.style.borderLeft = '10px solid #2c3e50';
  head.style.position = 'absolute';
  head.style.left = '25px';
  head.style.top = '-6px';

  wrapper.appendChild(line);
  wrapper.appendChild(head);
  return wrapper;
}

// 初期化
document
  .getElementById('sec06-btn-next')
  ?.addEventListener('click', generateQuiz6);
generateQuiz6();

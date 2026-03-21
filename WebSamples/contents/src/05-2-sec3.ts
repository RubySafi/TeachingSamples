// 05-2-sec3.ts
export {};

const tileSizeSmall = 24;
const tileSizeLarge = 30;
const offset = 2;

// --- 図形パターンの定義 ---
interface Pattern {
  name: string;
  coords: { x: number; y: number }[];
  useFlip: boolean; // Flipを選択肢に入れて良いか（対称性のチェック）
}

const PATTERNS: Pattern[] = [
  // --- Tetrominoes (3 types) ---
  {
    name: 'L',
    coords: [
      { x: 0, y: 0 },
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ],
    useFlip: true,
  },
  {
    name: 'J',
    coords: [
      { x: 0, y: 0 },
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 1 },
    ],
    useFlip: true,
  },
  {
    name: 'T',
    coords: [
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ],
    useFlip: false,
  },

  // --- Pentominoes (Selected 10 types) ---
  {
    name: 'P',
    coords: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 0, y: -1 },
    ],
    useFlip: true,
  },
  {
    name: 'U',
    coords: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: -1, y: 1 },
      { x: 1, y: 1 },
    ],
    useFlip: false,
  }, // Uは左右対称
  {
    name: 'W',
    coords: [
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: -1 },
      { x: 1, y: -1 },
      { x: 1, y: -2 },
    ],
    useFlip: false,
  },
  {
    name: 'F',
    coords: [
      { x: 0, y: 0 },
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: 1, y: 0 },
      { x: -1, y: 1 },
    ],
    useFlip: true,
  },
  {
    name: 'N',
    coords: [
      { x: 0, y: 0 },
      { x: 0, y: -1 },
      { x: 0, y: -2 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ],
    useFlip: true,
  },
  {
    name: 'L5',
    coords: [
      { x: 0, y: 0 },
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 1, y: 2 },
    ],
    useFlip: false,
  },
  {
    name: 'J5',
    coords: [
      { x: 0, y: 0 },
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: -1, y: 2 },
    ],
    useFlip: true,
  },
  {
    name: 'Y',
    coords: [
      { x: 0, y: 0 },
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 1, y: 0 },
    ],
    useFlip: true,
  },
];

interface Choice {
  coords: { x: number; y: number }[];
  type: string;
}

// --- 座標回転ロジック ---
function rotateCoords(
  shape: { x: number; y: number }[],
  degree: number,
  flip: boolean = false
) {
  return shape.map((p) => {
    let nx = flip ? -p.x : p.x;
    let ny = p.y;

    if (degree === 90) return { x: -ny, y: nx }; // CW 90
    if (degree === 180) return { x: -nx, y: -ny }; // 180
    if (degree === 270 || degree === -90) return { x: ny, y: -nx }; // CCW 90
    return { x: nx, y: ny }; // 0
  });
}

// --- クイズ生成 ---
function generateQuiz() {
  const questionText = document.getElementById('sec03-question-text')!;

  // 1. ランダムに図形パターンを選択
  const pattern = PATTERNS[Math.floor(Math.random() * PATTERNS.length)];
  const shape = pattern.coords;

  // 2. 問題の向き（CWかCCWか）をランダムに決定
  const isCW = Math.random() > 0.5;
  const targetType = isCW ? 'CW90' : 'CCW90';
  const directionName = isCW
    ? '90° Clockwise (⟳)'
    : '90° Counter-clockwise (⟲)';

  questionText.innerHTML = `Which one is turned <b>${directionName}</b>?`;
  questionText.style.color = 'black';

  // 3. 問題図形の描画
  drawShape('sec03-grid-question', shape, tileSizeLarge);

  // 4. 選択肢データの作成
  // 基本の3パターン
  const choices: Choice[] = [
    { coords: rotateCoords(shape, 90), type: 'CW90' },
    { coords: rotateCoords(shape, -90), type: 'CCW90' },
    { coords: rotateCoords(shape, 180), type: '180' },
  ];

  // 4つ目のダミー選択肢をフラグに基づいて決定
  if (pattern.useFlip) {
    choices.push({ coords: rotateCoords(shape, 0, true), type: 'FLIP' });
  } else {
    // Flipが使えない図形（Tなど）の場合は、「何もしていない(0度)」をダミーにする
    choices.push({ coords: rotateCoords(shape, 0), type: '0' });
  }

  // 5. シャッフル
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }

  // 6. 選択肢の描画とクリックイベントの紐付け
  choices.forEach((choice, index) => {
    const gridId = `sec03-choice-${index}`;
    const btnId = `sec03-btn-${index}`;

    drawShape(gridId, choice.coords, tileSizeSmall);

    const btn = document.getElementById(btnId) as HTMLButtonElement;
    const isCorrect = choice.type === targetType;

    btn.onclick = () => checkAnswer(isCorrect, directionName);
  });
}

// --- 判定ロジック ---
function checkAnswer(isCorrect: boolean, directionName: string) {
  const questionText = document.getElementById('sec03-question-text')!;
  if (isCorrect) {
    questionText.innerHTML = `Which one is turned <b>${directionName}</b>? <span style='color:red; margin-left:10px;'>Correct! ★</span>`;
  } else {
    questionText.innerHTML = `Which one is turned <b>${directionName}</b>? <span style='color:blue; margin-left:10px;'>Try Again!</span>`;
  }
}

// --- 描画ヘルパー ---
function drawShape(
  containerId: string,
  shape: { x: number; y: number }[],
  size: number
) {
  const container = document.getElementById(containerId)!;
  container.innerHTML = '';
  shape.forEach((p) => {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.width = `${size}px`;
    div.style.height = `${size}px`;
    div.style.left = `${(p.x + offset) * size}px`;
    div.style.top = `${(p.y + offset) * size}px`;
    div.style.backgroundColor = '#3498db';
    div.style.border = '1px solid white';
    div.style.boxSizing = 'border-box';
    container.appendChild(div);
  });
}

// 初期化
document
  .getElementById('sec03-btn-next')
  ?.addEventListener('click', generateQuiz);
generateQuiz();

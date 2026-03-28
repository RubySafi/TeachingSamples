const TILE_SIZE = 30;
const GRID_CENTER_5 = 2; // Original用
const GRID_CENTER_7 = 3; // Answer用
// pivotIndexをデータから削除（実行時に決めるため）
const QUIZ_PATTERNS_LOW = [
    {
        name: 'domino',
        coords: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
        ],
    },
    {
        name: 'I-shape',
        coords: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
        ],
    },
    {
        name: 'L-shape',
        coords: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: 1 },
        ],
    },
];
const QUIZ_PATTERNS_TETROMINO = [
    {
        name: 'I-Tetro',
        coords: [
            { x: 0, y: 0 },
            { x: -1, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
        ],
    },
    {
        name: 'O-Tetro',
        coords: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: 1 },
            { x: 1, y: 1 },
        ],
    },
    {
        name: 'T-Tetro',
        coords: [
            { x: 0, y: 0 },
            { x: -1, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: 1 },
        ],
    },
    {
        name: 'L-Tetro',
        coords: [
            { x: 0, y: 0 },
            { x: 0, y: -1 },
            { x: 0, y: 1 },
            { x: 1, y: 1 },
        ],
    },
    {
        name: 'S-Tetro',
        coords: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: 1 },
            { x: -1, y: 1 },
        ],
    },
];
const QUIZ_PATTERNS_PENTOMINO = [
    {
        name: 'F-Pento',
        coords: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: 1 },
            { x: -1, y: 0 },
            { x: 0, y: -1 },
        ],
    },
    {
        name: 'I-Pento',
        coords: [
            { x: 0, y: 0 },
            { x: 0, y: -1 },
            { x: 0, y: -2 },
            { x: 0, y: 1 },
            { x: 0, y: 2 },
        ],
    },
    {
        name: 'L-Pento',
        coords: [
            { x: 0, y: 0 },
            { x: 0, y: -1 },
            { x: 0, y: -2 },
            { x: 0, y: 1 },
            { x: 1, y: 1 },
        ],
    },
    {
        name: 'N-Pento',
        coords: [
            { x: 0, y: 0 },
            { x: 0, y: -1 },
            { x: -1, y: -1 },
            { x: 1, y: 0 },
            { x: 1, y: 1 },
        ],
    },
    {
        name: 'P-Pento',
        coords: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: 1 },
            { x: 1, y: 1 },
            { x: 0, y: -1 },
        ],
    },
    {
        name: 'T-Pento',
        coords: [
            { x: 0, y: 0 },
            { x: -1, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: 2 },
        ],
    },
    {
        name: 'U-Pento',
        coords: [
            { x: 0, y: 0 },
            { x: -1, y: 0 },
            { x: -1, y: -1 },
            { x: 1, y: 0 },
            { x: 1, y: -1 },
        ],
    },
    {
        name: 'V-Pento',
        coords: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: 2 },
        ],
    },
    {
        name: 'W-Pento',
        coords: [
            { x: 0, y: 0 },
            { x: -1, y: 0 },
            { x: -1, y: -1 },
            { x: 0, y: 1 },
            { x: 1, y: 1 },
        ],
    },
    {
        name: 'X-Pento',
        coords: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: -1 },
        ],
    },
    {
        name: 'Y-Pento',
        coords: [
            { x: 0, y: 0 },
            { x: -1, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 0, y: 1 },
        ],
    },
    {
        name: 'Z-Pento',
        coords: [
            { x: 0, y: 0 },
            { x: -1, y: -1 },
            { x: 0, y: -1 },
            { x: 0, y: 1 },
            { x: 1, y: 1 },
        ],
    },
];
let currentOriginalCoords = [];
let currentTargetAngle;
let currentOffset = { x: 0, y: 0 };
let currentPivotIndex = 0;
let userSelection = [];
let isHintRunning = false;
/**
 * 座標回転関数
 */
function rotateCoords(coords, degree) {
    return coords.map((p) => {
        if (degree === 90)
            return { x: -p.y, y: p.x };
        if (degree === -90 || degree === 270)
            return { x: p.y, y: -p.x };
        if (degree === 180 || degree === -180)
            return { x: -p.x, y: -p.y };
        return { x: p.x, y: p.y };
    });
}
/**
 * 座標反転関数
 */
function flipCoords(coords) {
    return coords.map((p) => ({ x: -p.x, y: p.y }));
}
/**
 * クイズ生成
 */
function generateQuiz7(quizPatterns) {
    const questionText = document.getElementById('sec07-question-text');
    // 1. 基本パターンの加工 (seed -> original)
    const seed = quizPatterns[Math.floor(Math.random() * quizPatterns.length)];
    let tempCoords = [...seed.coords];
    const baseAngles = [0, 90, 180, -90];
    const baseAngle = baseAngles[Math.floor(Math.random() * baseAngles.length)];
    tempCoords = rotateCoords(tempCoords, baseAngle);
    if (Math.random() > 0.5)
        tempCoords = flipCoords(tempCoords);
    currentOriginalCoords = tempCoords;
    // 2. 赤セル決定
    currentPivotIndex = Math.floor(Math.random() * currentOriginalCoords.length);
    // 3. 回転指示の決定 (確率 1/3 ずつに調整)
    const quizAngles = [90, 90, -90, -90, 180, -180];
    currentTargetAngle =
        quizAngles[Math.floor(Math.random() * quizAngles.length)];
    // 用語と言語の厳密化
    const directionMap = {
        90: '90° Clockwise (⟳)',
        [-90]: '90° Counter-clockwise (⟲)',
        180: '180° Clockwise (⟳)',
        [-180]: '180° Counter-clockwise (⟲)',
    };
    // 4. 平行移動
    currentOffset = {
        x: Math.floor(Math.random() * 3) - 1,
        y: Math.floor(Math.random() * 3) - 1,
    };
    questionText.innerHTML = `Rotate the shape <b>${directionMap[currentTargetAngle]}</b> relative to the Red Cell!`;
    questionText.style.color = 'black';
    drawBaseShape();
    initAnswerGrid();
}
/**
 * ヒント実行：Original枠内でのアニメーション演出
 */
function runHint7() {
    if (isHintRunning || currentOriginalCoords.length === 0)
        return;
    isHintRunning = true;
    const baseContainer = document.getElementById('sec07-base');
    baseContainer.innerHTML = '';
    const animWrapper = document.createElement('div');
    // テンポ重視の秒数設定
    const durationSec = 2.0; // 回転速度（少し速めに）
    const stopTimeSec = 1.0; // 停止時間
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
    // ミノ（Ghost/半透明）を描画
    currentOriginalCoords.forEach((p, i) => {
        const div = createTileElement(p.x, p.y, GRID_CENTER_5);
        div.style.backgroundColor =
            i === currentPivotIndex
                ? 'rgba(231, 76, 60, 0.7)'
                : 'rgba(189, 195, 199, 0.5)';
        if (i === currentPivotIndex)
            div.style.borderRadius = '4px';
        animWrapper.appendChild(div);
    });
    baseContainer.appendChild(animWrapper);
    // 回転開始（確実に発火させるため50ms）
    setTimeout(() => {
        animWrapper.style.transform = `rotate(${currentTargetAngle}deg)`;
    }, 50);
    // タイムライン制御：ミリ秒に変換
    const totalWaitMs = (durationSec + stopTimeSec) * 1000;
    setTimeout(() => {
        drawBaseShape(); // 元の静止画に戻す
        isHintRunning = false;
    }, totalWaitMs);
}
function drawBaseShape() {
    const baseContainer = document.getElementById('sec07-base');
    baseContainer.innerHTML = '';
    currentOriginalCoords.forEach((p, i) => {
        const div = createTileElement(p.x, p.y, GRID_CENTER_5);
        if (i === currentPivotIndex) {
            div.style.backgroundColor = '#e74c3c';
        }
        else {
            div.style.backgroundColor = '#ecf0f1';
            div.style.border = '1px solid #bdc3c7';
        }
        baseContainer.appendChild(div);
    });
}
function initAnswerGrid() {
    const ansGrid = document.getElementById('sec07-ans');
    ansGrid.innerHTML = '';
    userSelection = [];
    const rotatedCoords = rotateCoords(currentOriginalCoords, currentTargetAngle);
    const rawPivot = rotatedCoords[currentPivotIndex];
    const pivotPos = {
        x: rawPivot.x + currentOffset.x,
        y: rawPivot.y + currentOffset.y,
    };
    for (let gy = -3; gy <= 3; gy++) {
        for (let gx = -3; gx <= 3; gx++) {
            const cell = createTileElement(gx, gy, GRID_CENTER_7);
            cell.style.border = '1px solid #eee';
            if (gx === pivotPos.x && gy === pivotPos.y) {
                cell.style.backgroundColor = '#e74c3c';
                cell.style.borderRadius = '4px';
            }
            else {
                cell.style.cursor = 'pointer';
                cell.onclick = () => {
                    const isSelected = cell.getAttribute('data-selected') === 'true';
                    if (isSelected) {
                        cell.style.backgroundColor = '';
                        cell.setAttribute('data-selected', 'false');
                        userSelection = userSelection.filter((p) => !(p.x === gx && p.y === gy));
                    }
                    else {
                        cell.style.backgroundColor = '#3498db';
                        cell.setAttribute('data-selected', 'true');
                        userSelection.push({ x: gx, y: gy });
                    }
                    checkRealTimeAnswer();
                };
            }
            ansGrid.appendChild(cell);
        }
    }
}
function checkRealTimeAnswer() {
    const rotatedCoords = rotateCoords(currentOriginalCoords, currentTargetAngle);
    const correctCoords = rotatedCoords
        .filter((_, i) => i !== currentPivotIndex)
        .map((p) => ({ x: p.x + currentOffset.x, y: p.y + currentOffset.y }));
    if (userSelection.length !== correctCoords.length)
        return;
    const isAllCorrect = userSelection.every((u) => correctCoords.some((c) => c.x === u.x && c.y === u.y));
    if (isAllCorrect) {
        const questionText = document.getElementById('sec07-question-text');
        questionText.innerHTML += ` <span style="color:red; margin-left:15px; font-size:1.2rem;">★ Correct! ★</span>`;
        const cells = document.querySelectorAll('#sec07-ans div');
        cells.forEach((c) => (c.onclick = null));
    }
}
function createTileElement(x, y, offset) {
    const div = document.createElement('div');
    div.style.cssText = `position:absolute; width:${TILE_SIZE}px; height:${TILE_SIZE}px; left:${(x + offset) * TILE_SIZE}px; top:${(y + offset) * TILE_SIZE}px; box-sizing:border-box;`;
    return div;
}
// 初期化イベント
document
    .getElementById('sec07-btn-low')
    ?.addEventListener('click', () => generateQuiz7(QUIZ_PATTERNS_LOW));
document
    .getElementById('sec07-btn-4')
    ?.addEventListener('click', () => generateQuiz7(QUIZ_PATTERNS_TETROMINO));
document
    .getElementById('sec07-btn-5')
    ?.addEventListener('click', () => generateQuiz7(QUIZ_PATTERNS_PENTOMINO));
document.getElementById('sec07-btn-hint')?.addEventListener('click', runHint7);
generateQuiz7(QUIZ_PATTERNS_LOW);
export {};

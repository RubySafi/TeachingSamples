const modelCanvas = document.getElementById('sec4_ModelCanvas');
const mainCanvas = document.getElementById('sec4_MainCanvas');
//10×7のマス目を用意する．各マス目は40x40の大きさ
const gridSize = 30;
const gridModel_X = 4;
const gridModel_Y = 8;
const gridMain_X = 8;
const gridMain_Y = 8;
let ans;
let shapeSize;
let shapeModelInfo;
let shapeMainState = Array.from({ length: gridMain_X }, () => Array(gridMain_Y).fill(false)); //MainCanvasの現在の状況
let shapeAnswerState = Array.from({ length: gridMain_X }, () => Array(gridMain_Y).fill(false)); //MainCanvasの解答
let redTile; //MainCanvasの赤タイルの位置
const infoElement = document.getElementById('sec4_slideGoalInfo');
const btnReset = document.getElementById('sec4_reset');
const btnQuiz = document.getElementById('sec4_quiz');
const btnQuizHard = document.getElementById('sec4_quiz2');
mainCanvas.addEventListener('click', setBlock);
mainCanvas.addEventListener('contextmenu', eraseBlock);
createNew();
btnReset.addEventListener('click', reset);
btnQuiz.addEventListener('click', createNew);
btnQuizHard.addEventListener('click', createNewHard);
//初期の形状をランダムで定める．
function createNewHard() {
    const tempShape = [];
    // 1. 4x4の中でランダムに配置を決定
    for (let x = 0; x < 4; x++) {
        for (let y = 0; y < 4; y++) {
            if (Math.random() <= 0.4) {
                // 確率40%くらいが程よい密度になります
                tempShape.push({ x, y });
            }
        }
    }
    // 2. 少なすぎると困るので、最低2つは保証する
    if (tempShape.length < 2) {
        tempShape.push({
            x: Math.floor(Math.random() * 2),
            y: Math.floor(Math.random() * 4),
        });
        tempShape.push({
            x: Math.floor(2 + Math.random() * 2),
            y: Math.floor(Math.random() * 4),
        });
    }
    // 3. 正規化（左上に詰める）
    const minX = Math.min(...tempShape.map((p) => p.x));
    const minY = Math.min(...tempShape.map((p) => p.y));
    shapeModelInfo = tempShape.map((p) => ({
        x: p.x - minX,
        y: p.y - minY,
        redflag: false,
    }));
    // shapeSizeを自動計算する
    shapeSize = {
        x: Math.max(...shapeModelInfo.map((p) => p.x)) + 1,
        y: Math.max(...shapeModelInfo.map((p) => p.y)) + 1,
    };
    shapeModelInfo.forEach((p) => (p.redflag = false));
    let redIdx = Math.floor(Math.random() * shapeModelInfo.length);
    shapeModelInfo[redIdx].redflag = true;
    ans = {
        x: Math.floor(Math.random() * (gridMain_X - shapeSize.x)),
        y: Math.floor(Math.random() * (gridMain_Y - shapeSize.y)),
    };
    redTile = {
        x: ans.x + shapeModelInfo[redIdx].x,
        y: ans.y + shapeModelInfo[redIdx].y,
    };
    InitializeAnswerState();
    reset();
    updateModelCanvas();
    updateControl();
}
//初期の形状をランダムで定める．
function createNew() {
    // 形状の情報
    const SHAPE_PATTERNS = [
        [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 1, y: 1 },
            { x: 2, y: 1 },
        ], // Z
        [
            { x: 0, y: 0 },
            { x: 0, y: 1 },
            { x: 1, y: 1 },
            { x: 2, y: 1 },
        ], // L
        [
            { x: 0, y: 1 },
            { x: 1, y: 0 },
            { x: 1, y: 1 },
            { x: 2, y: 1 },
        ], // T
        [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 1, y: 1 },
            { x: 1, y: 2 },
        ], // T型
        [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 2, y: 1 },
            { x: 2, y: 2 },
        ], // L型
        [
            { x: 0, y: 1 },
            { x: 1, y: 1 },
            { x: 2, y: 1 },
            { x: 0, y: 0 },
            { x: 2, y: 0 },
        ], // U型
        [
            { x: 1, y: 0 },
            { x: 0, y: 1 },
            { x: 1, y: 1 },
            { x: 2, y: 1 },
            { x: 1, y: 2 },
        ], // X型
        [
            { x: 0, y: 0 },
            { x: 0, y: 1 },
            { x: 1, y: 1 },
            { x: 1, y: 2 },
            { x: 2, y: 2 },
        ], // W型
        [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 1, y: 1 },
            { x: 2, y: 1 },
            { x: 2, y: 2 },
        ], // Z型
        [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 0, y: 1 },
            { x: 1, y: 1 },
        ], // P型
        [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 3, y: 0 },
            { x: 1, y: 1 },
        ], // Y型
        [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 3, y: 0 },
            { x: 0, y: 1 },
        ], // V型
        [
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 0, y: 1 },
            { x: 1, y: 1 },
            { x: 0, y: 2 },
        ], // F型
    ];
    const pattern = SHAPE_PATTERNS[Math.floor(Math.random() * SHAPE_PATTERNS.length)];
    shapeModelInfo = pattern.map((p) => ({ ...p, redflag: false }));
    // shapeSizeを自動計算する
    shapeSize = {
        x: Math.max(...shapeModelInfo.map((p) => p.x)) + 1,
        y: Math.max(...shapeModelInfo.map((p) => p.y)) + 1,
    };
    shapeModelInfo.forEach((p) => (p.redflag = false));
    let redIdx = Math.floor(Math.random() * shapeModelInfo.length);
    shapeModelInfo[redIdx].redflag = true;
    ans = {
        x: Math.floor(Math.random() * (gridMain_X - shapeSize.x)),
        y: Math.floor(Math.random() * (gridMain_Y - shapeSize.y)),
    };
    redTile = {
        x: ans.x + shapeModelInfo[redIdx].x,
        y: ans.y + shapeModelInfo[redIdx].y,
    };
    InitializeAnswerState();
    reset();
    updateModelCanvas();
    updateControl();
}
function InitializeAnswerState() {
    //初期化
    shapeAnswerState = Array.from({ length: gridMain_X }, () => Array(gridMain_Y).fill(false));
    //解答設定
    shapeModelInfo.forEach((idx) => {
        shapeAnswerState[ans.x + idx.x][ans.y + idx.y] = true;
    });
}
function setBlock(e) {
    const rect = mainCanvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / gridSize);
    const y = Math.floor((e.clientY - rect.top) / gridSize);
    if (x >= 0 && x < gridMain_X && y >= 0 && y < gridMain_Y) {
        // 赤タイルは消せないようにガード
        if (x === redTile.x && y === redTile.y)
            return;
        shapeMainState[x][y] = true;
        updateControl();
    }
}
function eraseBlock(e) {
    e.preventDefault();
    const rect = mainCanvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / gridSize);
    const y = Math.floor((e.clientY - rect.top) / gridSize);
    if (x >= 0 && x < gridMain_X && y >= 0 && y < gridMain_Y) {
        // 赤タイルは消せないようにガード
        if (x === redTile.x && y === redTile.y)
            return;
        shapeMainState[x][y] = false;
        updateControl();
    }
}
//表示を更新する
function updateControl() {
    updateMainCanvas();
    updateInfoText();
}
function updateModelCanvas() {
    const ctx = modelCanvas.getContext('2d');
    if (!ctx)
        return;
    // 1. 画面をクリア
    ctx.clearRect(0, 0, modelCanvas.width, modelCanvas.height);
    // 2. グリッド線を描く
    drawGrid(ctx, modelCanvas);
    // 3. 形状（shapeInfo）を描画
    shapeModelInfo.forEach((pos) => {
        // 形状内の各パーツ座標
        const drawX = pos.x * gridSize;
        const drawY = pos.y * gridSize;
        ctx.fillStyle = '#3498db'; // WPFの SolidColorBrush
        ctx.strokeStyle = '#2980b9';
        if (pos.redflag) {
            ctx.fillStyle = '#db3434'; // WPFの SolidColorBrush
            ctx.strokeStyle = '#db3434';
        }
        ctx.fillRect(drawX, drawY, gridSize, gridSize);
        ctx.strokeRect(drawX, drawY, gridSize, gridSize); // 枠線
    });
}
//canvasを更新する
function updateMainCanvas() {
    const ctx = mainCanvas.getContext('2d');
    if (!ctx)
        return;
    // 1. 画面をクリア
    ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    // 2. グリッド線を描く
    drawGrid(ctx, mainCanvas);
    // 3. 形状（shapeInfo）を描画
    ctx.fillStyle = '#3498db'; // WPFの SolidColorBrush
    ctx.strokeStyle = '#2980b9';
    // 3. ユーザーが置いたブロックを描画
    for (let x = 0; x < gridMain_X; x++) {
        for (let y = 0; y < gridMain_Y; y++) {
            if (shapeMainState[x][y]) {
                const isRed = x === redTile.x && y === redTile.y;
                ctx.fillStyle = isRed ? '#db3434' : '#3498db';
                ctx.strokeStyle = isRed ? '#db3434' : '#2980b9';
                ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
                ctx.strokeRect(x * gridSize, y * gridSize, gridSize, gridSize);
            }
        }
    }
}
// 補助関数：背景に薄くグリッドを引く
function drawGrid(ctx, canvas) {
    ctx.strokeStyle = '#eee';
    ctx.beginPath();
    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
    }
    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();
}
//表示を更新する
function updateInfoText() {
    let flag = true;
    for (let x = 0; x < gridMain_X; x++) {
        for (let y = 0; y < gridMain_Y; y++) {
            if (shapeAnswerState[x][y] != shapeMainState[x][y]) {
                flag = false;
            }
        }
    }
    let text = '';
    if (flag) {
        text = '<span style="color: red;"> Clear! </span>';
    }
    else {
        text = '<span>Left Click: Set tile, Right Click: Remove tile</span>';
    }
    infoElement.innerHTML = text;
}
function reset() {
    //slide前の位置に戻す．
    shapeMainState = Array.from({ length: gridMain_X }, () => Array(gridMain_Y).fill(false));
    shapeMainState[redTile.x][redTile.y] = true;
    updateControl();
}
export {};

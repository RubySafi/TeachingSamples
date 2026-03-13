const canvas = document.getElementById('slideCanvas');
//10×7のマス目を用意する．各マス目は40x40の大きさ
const gridSize = 30;
const grid_X = 20;
const grid_Y = 9;
let startPos;
let currentPos;
let shapeOffsets;
let shapeSize;
let shapeInfo;
const infoElement = document.getElementById('slideInfo');
const btnReset = document.getElementById('sec2_reset');
const btnNew = document.getElementById('sec2_new');
const btnLeft = document.getElementById('sec2_mode_L');
const btnUp = document.getElementById('sec2_mode_U');
const btnRight = document.getElementById('sec2_mode_R');
const btnDown = document.getElementById('sec2_mode_D');
createNew();
btnReset.addEventListener('click', reset);
btnNew.addEventListener('click', createNew);
btnLeft.addEventListener('click', moveLeft);
btnUp.addEventListener('click', moveUp);
btnRight.addEventListener('click', moveRight);
btnDown.addEventListener('click', moveDown);
//初期の形状をランダムで定める．
function createNew() {
    // 形状の情報
    let type = Math.floor(Math.random() * 4);
    switch (type) {
        case 0:
            shapeInfo = [
                { x: 0, y: 0 },
                { x: 1, y: 0 },
                { x: 1, y: 1 },
                { x: 2, y: 1 },
            ];
            shapeSize = {
                x: 3,
                y: 2,
            };
            break;
        case 1:
            shapeInfo = [
                { x: 0, y: 0 },
                { x: 0, y: 1 },
                { x: 1, y: 1 },
                { x: 2, y: 1 },
            ];
            shapeSize = {
                x: 3,
                y: 2,
            };
            break;
        case 2:
            shapeInfo = [
                { x: 0, y: 0 },
                { x: 0, y: 1 },
                { x: 1, y: 1 },
                { x: 2, y: 0 },
            ];
            shapeSize = {
                x: 3,
                y: 2,
            };
            break;
        case 3:
            shapeInfo = [
                { x: 0, y: 1 },
                { x: 1, y: 0 },
                { x: 2, y: 1 },
            ];
            shapeSize = {
                x: 3,
                y: 2,
            };
            break;
    }
    //中央タイルの絶対座標
    shapeOffsets = {
        x: Math.floor(grid_X / 2),
        y: Math.floor(grid_Y / 2),
    };
    //初期の相対座標
    startPos = {
        x: 0,
        y: 0,
    };
    //現在の相対座標
    currentPos = {
        x: startPos.x,
        y: startPos.y,
    };
    reset();
}
//表示を更新する
function updateControl() {
    updateCanvas();
    updateInfoText();
}
//canvasを更新する
function updateCanvas() {
    const ctx = canvas.getContext('2d');
    if (!ctx)
        return;
    // 1. 画面をクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // 2. グリッド線を描く
    drawGrid(ctx);
    // 3. 形状（shapeInfo）を描画
    ctx.fillStyle = '#dbd034'; // WPFの SolidColorBrush
    ctx.strokeStyle = '#dbd034';
    shapeInfo.forEach((pos) => {
        // 絶対座標 = 中央オフセット + 相対移動量 + 形状内の各パーツ座標
        const drawX = (shapeOffsets.x + startPos.x + pos.x) * gridSize;
        const drawY = (shapeOffsets.y + startPos.y + pos.y) * gridSize;
        ctx.fillRect(drawX, drawY, gridSize, gridSize);
        ctx.strokeRect(drawX, drawY, gridSize, gridSize); // 枠線
    });
    // 4. 形状（shapeInfo）を描画
    ctx.fillStyle = '#3498db'; // WPFの SolidColorBrush
    ctx.strokeStyle = '#2980b9';
    shapeInfo.forEach((pos) => {
        // 絶対座標 = 中央オフセット + 相対移動量 + 形状内の各パーツ座標
        const drawX = (shapeOffsets.x + currentPos.x + pos.x) * gridSize;
        const drawY = (shapeOffsets.y + currentPos.y + pos.y) * gridSize;
        ctx.fillRect(drawX, drawY, gridSize, gridSize);
        ctx.strokeRect(drawX, drawY, gridSize, gridSize); // 枠線
    });
}
// 補助関数：背景に薄くグリッドを引く
function drawGrid(ctx) {
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
    let horizontalInfo = '';
    let verticalInfo = '';
    if (currentPos.x == 1) {
        horizontalInfo = `${currentPos.x} unit to the right`;
    }
    else if (currentPos.x == -1) {
        horizontalInfo = `${-currentPos.x} unit to the left`;
    }
    else if (currentPos.x > 1) {
        horizontalInfo = `${currentPos.x} units to the right`;
    }
    else if (currentPos.x < -1) {
        horizontalInfo = `${-currentPos.x} units to the left`;
    }
    if (currentPos.y == -1) {
        verticalInfo = `${-currentPos.y} unit up`;
    }
    else if (currentPos.y == 1) {
        verticalInfo = `${currentPos.y} unit down`;
    }
    else if (currentPos.y < -1) {
        verticalInfo = `${-currentPos.y} units up`;
    }
    else if (currentPos.y > 1) {
        verticalInfo = `${currentPos.y} units down`;
    }
    let label = '';
    if (horizontalInfo == '' && verticalInfo == '') {
        label = 'Start Position';
    }
    else if (verticalInfo == '') {
        label = `${horizontalInfo}.`;
    }
    else if (horizontalInfo == '') {
        label = `${verticalInfo}.`;
    }
    else {
        label = `${horizontalInfo} and ${verticalInfo}.`;
    }
    infoElement.innerText = label;
}
function reset() {
    //slide前の位置に戻す．
    currentPos = {
        x: startPos.x,
        y: startPos.y,
    };
    updateControl();
}
function moveRight() {
    currentPos.x++;
    if (currentPos.x + shapeOffsets.x >= grid_X - shapeSize.x) {
        currentPos.x = grid_X - shapeOffsets.x - startPos.x - shapeSize.x;
    }
    updateControl();
}
function moveLeft() {
    currentPos.x--;
    if (currentPos.x + shapeOffsets.x < 0) {
        currentPos.x = -shapeOffsets.x;
    }
    updateControl();
}
function moveUp() {
    currentPos.y--;
    if (currentPos.y + shapeOffsets.y < 0) {
        currentPos.y = -shapeOffsets.y;
    }
    updateControl();
}
function moveDown() {
    currentPos.y++;
    if (currentPos.y + shapeOffsets.y >= grid_Y - shapeSize.y) {
        currentPos.y = grid_Y - shapeOffsets.y - shapeSize.y;
    }
    updateControl();
}
export {};

// 1. 定数と状態の定義
const gridCount = 5;
const tileSize = 30; // px
const centerOffset = 2; // 5x5の中心座標 (2, 2)
let currentAngle = 0;
let currentShape = [];
// DOM要素の取得
const minoContainer = document.getElementById('sec02-mino-container');
const angleDisplay = document.getElementById('sec02-angle-info');
// 2. ミノを生成して画面に配置する関数
function displayShape(shape) {
    // 一旦中身を空にする (WPFの Children.Clear() )
    minoContainer.innerHTML = '';
    shape.forEach((p) => {
        // 座標をグリッドの中央にオフセット
        const left = (p.x + centerOffset) * tileSize;
        const top = (p.y + centerOffset) * tileSize;
        // A. 動くミノのタイル作成
        const tile = createTileElement(left, top, '#3498db', 1.0);
        minoContainer.appendChild(tile);
    });
}
// 2. ミノを生成して画面に配置する関数
function displayShapeDebug(shape) {
    // 一旦中身を空にする (WPFの Children.Clear() )
    minoContainer.innerHTML = '';
    // 座標をグリッドの中央にオフセット
    const left = (shape[0].x + centerOffset) * tileSize;
    const top = (shape[0].y + centerOffset) * tileSize;
    // A. 動くミノのタイル作成
    const tile = createTileElement(left, top, '#3498db', 1.0);
    minoContainer.appendChild(tile);
}
// タイル要素を生成するヘルパー関数
function createTileElement(left, top, color, opacity) {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.left = `${left}px`;
    div.style.top = `${top}px`;
    div.style.width = `${tileSize}px`;
    div.style.height = `${tileSize}px`;
    div.style.backgroundColor = color;
    div.style.opacity = opacity.toString();
    div.style.boxSizing = 'border-box';
    div.style.border = '1px solid rgba(255,255,255,0.3)';
    return div;
}
// 3. 回転ロジック
function updateRotation(delta) {
    currentAngle += delta; // CCWならマイナス、CWならプラス（CSSの仕様に合わせる）
    // 見た目を回転させる
    minoContainer.style.transform = `rotate(${currentAngle}deg)`;
    // 角度表示（数学的な「反時計回りが正」に合わせて符号反転）
    const displayAngle = -currentAngle;
    angleDisplay.innerText = `Current Angle: ${displayAngle}°`;
}
// 4. 新しいミノを作る（例：T型）
function createNewShape() {
    currentAngle = 0; // 角度リセット
    updateRotation(0);
    // 例としてTミノ (中心を 0,0 とした相対座標)
    const patterns = [
        // --- Tetrominoes (7 types) ---
        [
            { x: 0, y: 0 },
            { x: -1, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: 1 },
        ], // T
        [
            { x: 0, y: 0 },
            { x: 0, y: -1 },
            { x: 0, y: 1 },
            { x: 1, y: 1 },
        ], // L
        [
            { x: 0, y: 0 },
            { x: 0, y: -1 },
            { x: 0, y: 1 },
            { x: -1, y: 1 },
        ], // J
        [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: 1 },
            { x: 1, y: 1 },
        ], // O (Square)
        [
            { x: 0, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
            { x: 1, y: 1 },
        ], // S
        [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: 1 },
            { x: -1, y: 1 },
        ], // Z
        [
            { x: 0, y: 0 },
            { x: 0, y: -1 },
            { x: 0, y: 1 },
            { x: 0, y: 2 },
        ], // I
        // --- Pentominoes (12 types) ---
        [
            { x: 0, y: 0 },
            { x: -1, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: -1 },
            { x: 0, y: 1 },
        ], // X
        [
            { x: 0, y: 0 },
            { x: -1, y: 0 },
            { x: -2, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
        ], // I
        [
            { x: 0, y: 0 },
            { x: 0, y: -1 },
            { x: 0, y: 1 },
            { x: 0, y: 2 },
            { x: 1, y: 2 },
        ], // L
        [
            { x: 0, y: 0 },
            { x: 0, y: -1 },
            { x: 0, y: 1 },
            { x: 0, y: 2 },
            { x: -1, y: 2 },
        ], // J (Mirror L)
        [
            { x: 0, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
            { x: 1, y: 1 },
            { x: -1, y: 1 },
        ], // T
        [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: 1 },
            { x: 1, y: 1 },
            { x: 0, y: -1 },
        ], // P
        [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: -1, y: 0 },
            { x: -1, y: 1 },
            { x: 1, y: 1 },
        ], // U
        [
            { x: 0, y: 0 },
            { x: -1, y: 0 },
            { x: -1, y: 1 },
            { x: 0, y: -1 },
            { x: 1, y: -1 },
        ], // V
        [
            { x: 0, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: -1 },
            { x: 1, y: -1 },
            { x: 1, y: -2 },
        ], // W
        [
            { x: 0, y: 0 },
            { x: 0, y: -1 },
            { x: 0, y: 1 },
            { x: 1, y: 0 },
            { x: -1, y: 1 },
        ], // F
        [
            { x: 0, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: 2 },
            { x: 1, y: 2 },
        ], // Z
        [
            { x: 0, y: 0 },
            { x: 0, y: -1 },
            { x: 0, y: -2 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
        ], // N
    ];
    currentShape = patterns[Math.floor(Math.random() * patterns.length)];
    displayShape(currentShape);
}
// 5. イベントリスナーの登録
document
    .getElementById('sec02-btn-ccw')
    ?.addEventListener('click', () => updateRotation(-90));
document
    .getElementById('sec02-btn-cw')
    ?.addEventListener('click', () => updateRotation(90));
document
    .getElementById('sec02-btn-new')
    ?.addEventListener('click', createNewShape);
// 初期実行
createNewShape();
export {};

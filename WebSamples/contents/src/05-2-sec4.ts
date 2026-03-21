// 05-2-sec4.ts
export {};

interface RelativePattern {
  name: string;
  coords: { x: number; y: number }[];
  pivotIndex: number;
  arrowTargetIndex: number;
}

const TILE_SIZE = 30;
const GRID_CENTER = 2;

const RELATIVE_PATTERNS: RelativePattern[] = [
  {
    name: 'L-EndPivot',
    coords: [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 1, y: 2 },
    ],
    pivotIndex: 0,
    arrowTargetIndex: 1,
  },
  {
    name: 'T-CenterPivot',
    coords: [
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ],
    pivotIndex: 0,
    arrowTargetIndex: 3,
  },
  {
    name: 'J-CornerPivot',
    coords: [
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
    ],
    pivotIndex: 0,
    arrowTargetIndex: 1,
  },
  {
    name: 'S-Pivot',
    coords: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 1 },
    ],
    pivotIndex: 0,
    arrowTargetIndex: 2,
  },
  {
    name: 'P-Eye',
    coords: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 0, y: -1 },
    ],
    pivotIndex: 0,
    arrowTargetIndex: 4,
  },
  {
    name: 'U-Bottom',
    coords: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: -1, y: -1 },
      { x: 1, y: -1 },
    ],
    pivotIndex: 0,
    arrowTargetIndex: 1,
  },
  {
    name: 'V-Corner',
    coords: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: -1 },
      { x: 0, y: -2 },
    ],
    pivotIndex: 0,
    arrowTargetIndex: 2,
  },
  {
    name: 'W-Step',
    coords: [
      { x: 0, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
    ],
    pivotIndex: 0,
    arrowTargetIndex: 2,
  },
  {
    name: 'F-Center',
    coords: [
      { x: 0, y: 0 },
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: 1, y: 0 },
      { x: -1, y: -1 },
    ],
    pivotIndex: 0,
    arrowTargetIndex: 3,
  },
  {
    name: 'Y-Long',
    coords: [
      { x: 0, y: 0 },
      { x: 0, y: -1 },
      { x: 0, y: -2 },
      { x: 0, y: 1 },
      { x: 1, y: 0 },
    ],
    pivotIndex: 2,
    arrowTargetIndex: 1,
  },
  {
    name: 'Plus-Center',
    coords: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 },
    ],
    pivotIndex: 0,
    arrowTargetIndex: 4,
  },
];

let currentRelativePattern: RelativePattern | null = null;

/**
 * 矢印要素を生成する関数
 */
function createArrow(angleDeg: number, color: string = '#2c3e50'): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.style.position = 'absolute';
  wrapper.style.top = '50%';
  wrapper.style.left = '50%';
  wrapper.style.transform = `translate(-50%, -50%) rotate(${angleDeg}deg)`;

  const line = document.createElement('div');
  line.style.width = '35px';
  line.style.height = '4px';
  line.style.backgroundColor = color;
  line.style.position = 'absolute';
  line.style.top = '-2px';
  line.style.left = '0';
  line.style.transformOrigin = 'left center';

  const head = document.createElement('div');
  head.style.width = '0';
  head.style.height = '0';
  head.style.borderTop = '8px solid transparent';
  head.style.borderBottom = '8px solid transparent';
  head.style.borderLeft = `12px solid ${color}`;
  head.style.position = 'absolute';
  head.style.left = '30px';
  head.style.top = '-8px';

  wrapper.appendChild(line);
  wrapper.appendChild(head);
  return wrapper;
}

/**
 * ミノを描画する
 */
function renderMinos(
  container: HTMLElement,
  coords: { x: number; y: number }[],
  isGhost: boolean
) {
  if (!currentRelativePattern) return;

  const pivot = coords[currentRelativePattern.pivotIndex];
  const target = coords[currentRelativePattern.arrowTargetIndex];
  const dx = target.x - pivot.x;
  const dy = target.y - pivot.y;
  const arrowAngleDeg = Math.atan2(dy, dx) * (180 / Math.PI);

  coords.forEach((p, i) => {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.width = `${TILE_SIZE}px`;
    div.style.height = `${TILE_SIZE}px`;
    div.style.left = `${(p.x + GRID_CENTER) * TILE_SIZE}px`;
    div.style.top = `${(p.y + GRID_CENTER) * TILE_SIZE}px`;
    div.style.boxSizing = 'border-box';

    if (i === currentRelativePattern!.pivotIndex) {
      div.style.backgroundColor = isGhost
        ? 'rgba(231, 76, 60, 0.6)'
        : '#e74c3c';
      div.style.zIndex = '5';
      div.style.borderRadius = '4px';
      div.appendChild(createArrow(arrowAngleDeg));
    } else {
      div.style.backgroundColor = isGhost
        ? 'rgba(236, 240, 241, 0.4)'
        : '#ecf0f1';
      div.style.border = isGhost
        ? '1px solid rgba(189, 195, 199, 0.5)'
        : '1px solid #bdc3c7';
      div.style.zIndex = '1';
    }
    container.appendChild(div);
  });
}

function drawRelative(containerId: string, targetAngle: number) {
  const container = document.getElementById(containerId);
  if (!container || !currentRelativePattern) return;
  container.innerHTML = '';

  // 1. 静止している「正解の状態」を描画
  const staticCoords = rotateCoords(currentRelativePattern.coords, targetAngle);
  renderMinos(container, staticCoords, false);

  // 2. アニメーションする「Ghost（動きの残像）」を描画
  if (targetAngle !== 0) {
    const animWrapper = document.createElement('div');
    animWrapper.className = `anim-container ${targetAngle > 0 ? 'anim-cw' : 'anim-ccw'}`;

    // Ghostは常に「0度の状態」から回転させるので、元の座標を渡す
    renderMinos(animWrapper, currentRelativePattern.coords, true);
    container.appendChild(animWrapper);
  }
}

// 座標回転関数
function rotateCoords(coords: { x: number; y: number }[], degree: number) {
  return coords.map((p) => {
    if (degree === 90) return { x: -p.y, y: p.x };
    if (degree === -90 || degree === 270) return { x: p.y, y: -p.x };
    if (degree === 180) return { x: -p.x, y: -p.y };
    return { x: p.x, y: p.y };
  });
}

function nextProblem() {
  currentRelativePattern =
    RELATIVE_PATTERNS[Math.floor(Math.random() * RELATIVE_PATTERNS.length)];
  drawRelative('sec04-grid-orig', 0);
  drawRelative('sec04-grid-cw', 90);
  drawRelative('sec04-grid-ccw', -90);
}

document
  .getElementById('sec04-btn-next')
  ?.addEventListener('click', nextProblem);
nextProblem();

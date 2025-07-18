// index.ts

function updateClock(): void {
  const clockElement = document.getElementById('clock');
  if (!clockElement) return;

  const now = new Date();
  const hh = now.getHours().toString().padStart(2, '0');
  const mm = now.getMinutes().toString().padStart(2, '0');
  const ss = now.getSeconds().toString().padStart(2, '0');

  clockElement.textContent = `${hh}:${mm}:${ss}`;
}

// 1秒ごとに更新
setInterval(updateClock, 1000);

// 初期表示も即時反映
updateClock();

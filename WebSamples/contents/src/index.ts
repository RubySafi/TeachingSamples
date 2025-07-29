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

// 初期表示と1秒ごとの更新
updateClock();
setInterval(updateClock, 1000);

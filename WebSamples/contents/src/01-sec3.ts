const dateLabels = document.getElementById('sec3-dateLabels')!;
const calendarTable = document.getElementById('sec3-calendarTable')!;
const leapYearCheckbox = document.getElementById(
  'sec3-leapyear-checkbox'
) as HTMLInputElement;

const speedSlider = document.getElementById(
  'sec3-speed-slider'
) as HTMLInputElement;
const speedValue = document.getElementById('sec3-speed-value')!;
const spdList = [-5, -1, 0, 1, 5];

const formatSpeed = (n: number) =>
  `${n < 0 ? '&minus;' + Math.abs(n) : n} day/s`;

let speed = spdList[Number(speedSlider.value)];
speedValue.innerHTML = formatSpeed(speed);

speedSlider.addEventListener('input', () => {
  speed = spdList[Number(speedSlider.value)];
  speedValue.innerHTML = formatSpeed(speed);
});

// 基準日
let currentDate = new Date(2024, 2, 29); // 2024/03/29
let lastTime = performance.now();

function isLeapYear(year: number): boolean {
  return leapYearCheckbox.checked;
}

function getDaysInMonth(year: number, month: number): number {
  if (month === 2) {
    return isLeapYear(year) ? 29 : 28;
  }
  return [31, -1, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
}

function formatDate(date: Date): string {
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${m}/${d}`;
}

function updateDateLabels() {
  // チェックボックスで解釈年を切り替え
  const flag = leapYearCheckbox.checked;
  const baseYear = flag ? 2024 : 2022;
  currentDate.setFullYear(baseYear);

  let labels = '';
  for (let offset = -4; offset <= 4; offset++) {
    const tmp = new Date(currentDate);
    tmp.setDate(tmp.getDate() + offset);

    let cls = '';
    if (offset < 0) cls = 'past';
    else if (offset > 0) cls = 'future';
    else cls = 'current';

    labels += `<div class="date-label ${cls}">${formatDate(tmp)}</div>`;
  }

  dateLabels.innerHTML = labels;
}

function updateCalendarTable() {
  let tbody = '';
  for (let m = 1; m <= 12; m++) {
    const daysInMonth = getDaysInMonth(currentDate.getFullYear(), m);
    const days = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const isCurrentMonth = m === currentDate.getMonth() + 1;
      const isCurrentDay = d === currentDate.getDate();
      const highlight =
        isCurrentMonth && isCurrentDay ? ` style="background: yellow"` : '';
      days.push(`<span${highlight}>${d}</span>`);
    }
    tbody += `<tr><td>${m.toString().padStart(2, '0')}</td><td>${days.join(
      ' '
    )}</td></tr>`;
  }
  calendarTable.querySelector('tbody')!.innerHTML = tbody;
}

function animate(now: number) {
  const flag = leapYearCheckbox.checked;
  const baseYear = flag ? 2024 : 2022;
  currentDate.setFullYear(baseYear);

  const deltaTime = (now - lastTime) / 1000;
  lastTime = now;

  const dayProgress = deltaTime * speed;

  currentDate.setTime(
    currentDate.getTime() + dayProgress * 24 * 60 * 60 * 1000
  );
  currentDate.setFullYear(baseYear);

  updateDateLabels();
  updateCalendarTable();

  requestAnimationFrame(animate);
}

leapYearCheckbox.addEventListener('change', () => {
  updateDateLabels();
  updateCalendarTable();
});

updateDateLabels();
updateCalendarTable();

requestAnimationFrame(animate);

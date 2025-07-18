"use strict";
const dateLabels5 = document.getElementById('sec5-dateLabels');
const calendarTable5 = document.getElementById('sec5-calendarTable');
const leapYearCheckbox5 = document.getElementById('sec5-leapyear-checkbox');
const speedSlider5 = document.getElementById('sec5-speed-slider');
const speedValue5 = document.getElementById('sec5-speed-value');
const spdList5 = [-50, -5, -1, 0, 1, 5, 50];
const formatSpeed5 = (n) => `${n < 0 ? '&minus;' + Math.abs(n) : n} h/s`;
let speed5 = spdList5[Number(speedSlider5.value)];
speedValue5.innerHTML = formatSpeed5(speed5);
speedSlider5.addEventListener('input', () => {
    speed5 = spdList5[Number(speedSlider5.value)];
    speedValue5.innerHTML = formatSpeed5(speed5);
});
// 基準日時（初期値）
let currentDate5 = new Date(2024, 2, 29, 23, 0, 0); // 2024/03/29 23:00
let lastTime5 = performance.now();
function isLeapYear5(year) {
    return leapYearCheckbox5.checked;
}
function getDaysInMonth5(year, month) {
    if (month === 2) {
        return isLeapYear5(year) ? 29 : 28;
    }
    return [31, -1, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
}
function formatDateTime5(date) {
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    const h = date.getHours().toString().padStart(2, '0');
    const mm = date.getMinutes().toString().padStart(2, '0');
    return `${m}/${d} ${h}:${mm}`;
}
function updateDateLabels5() {
    const flag = leapYearCheckbox5.checked;
    const baseYear = flag ? 2024 : 2022;
    currentDate5.setFullYear(baseYear);
    let labels = '';
    for (let offset = -4; offset <= 4; offset++) {
        const tmp = new Date(currentDate5);
        tmp.setHours(currentDate5.getHours() + offset);
        // 分以下はゼロ固定
        tmp.setMinutes(0, 0, 0);
        let cls = '';
        if (offset < 0)
            cls = 'past';
        else if (offset > 0)
            cls = 'future';
        else
            cls = 'current';
        labels += `<div class="date-label ${cls}">${formatDateTime5(tmp)}</div>`;
    }
    dateLabels5.innerHTML = labels;
}
function updateCalendarTable5() {
    const year = currentDate5.getFullYear();
    let tbody = '';
    for (let m = 1; m <= 12; m++) {
        const daysInMonth = getDaysInMonth5(year, m);
        const days = [];
        for (let d = 1; d <= daysInMonth; d++) {
            const isCurrentMonth = m === currentDate5.getMonth() + 1;
            const isCurrentDay = d === currentDate5.getDate();
            const highlight = isCurrentMonth && isCurrentDay ? ` style="background: yellow"` : '';
            days.push(`<span${highlight}>${d}</span>`);
        }
        tbody += `<tr><td>${m.toString().padStart(2, '0')}</td><td>${days.join(' ')}</td></tr>`;
    }
    calendarTable5.querySelector('tbody').innerHTML = tbody;
}
function animate5(now) {
    const flag = leapYearCheckbox5.checked;
    const baseYear = flag ? 2024 : 2022;
    // 日時加算前に年を補正（存在しない日付を回避）
    currentDate5.setFullYear(baseYear);
    const deltaTime = (now - lastTime5) / 1000;
    lastTime5 = now;
    const hourProgress = deltaTime * speed5;
    currentDate5.setTime(currentDate5.getTime() + hourProgress * 60 * 60 * 1000);
    // 加算後にも年を補正（存在しない日付を回避）
    currentDate5.setFullYear(baseYear);
    updateDateLabels5();
    updateCalendarTable5();
    requestAnimationFrame(animate5);
}
leapYearCheckbox5.addEventListener('change', () => {
    updateDateLabels5();
    updateCalendarTable5();
});
updateDateLabels5();
updateCalendarTable5();
requestAnimationFrame(animate5);

"use strict";
const sec6_dateLabels = document.getElementById('sec6-dateLabels');
const sec6_calendarTable = document.getElementById('sec6-calendarTable');
const sec6_leapYearCheckbox = document.getElementById('sec6-leapyear-checkbox');
const sec6_btnIncHour = document.getElementById('sec6-btn-inc-hour');
const sec6_btnDecHour = document.getElementById('sec6-btn-dec-hour');
const sec6_btnIncMinute = document.getElementById('sec6-btn-inc-minute');
const sec6_btnDecMinute = document.getElementById('sec6-btn-dec-minute');
let sec6_currentDate = new Date(2024, 2, 29, 23, 0); // 初期値（2024/03/29 23:00）
function sec6_isLeapYear() {
    return sec6_leapYearCheckbox.checked;
}
function sec6_getBaseYear() {
    return sec6_isLeapYear() ? 2024 : 2023;
}
function sec6_getDaysInMonth(year, month) {
    if (month === 2) {
        return sec6_isLeapYear() ? 29 : 28;
    }
    return [31, -1, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
}
function sec6_fixBaseYear() {
    sec6_currentDate.setFullYear(sec6_getBaseYear());
}
function sec6_formatDateTime(date) {
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    const h = date.getHours().toString().padStart(2, '0');
    const mm = date.getMinutes().toString().padStart(2, '0');
    return `${m}/${d} ${h}:${mm}`;
}
function sec6_updateDateLabels() {
    sec6_fixBaseYear();
    let labels = '';
    for (let offset = -4; offset <= 4; offset++) {
        const tmp = new Date(sec6_currentDate);
        tmp.setMinutes(tmp.getMinutes() + offset);
        tmp.setFullYear(sec6_getBaseYear());
        let cls = '';
        if (offset < 0)
            cls = 'past';
        else if (offset > 0)
            cls = 'future';
        else
            cls = 'current';
        labels += `<div class="date-label ${cls}">${sec6_formatDateTime(tmp)}</div>`;
    }
    sec6_dateLabels.innerHTML = labels;
}
function sec6_updateCalendarTable() {
    sec6_fixBaseYear();
    const year = sec6_getBaseYear();
    let tbody = '';
    for (let m = 1; m <= 12; m++) {
        const daysInMonth = sec6_getDaysInMonth(year, m);
        const days = [];
        for (let d = 1; d <= daysInMonth; d++) {
            const isCurrentMonth = m === sec6_currentDate.getMonth() + 1;
            const isCurrentDay = d === sec6_currentDate.getDate();
            const highlight = isCurrentMonth && isCurrentDay ? ` style="background: yellow"` : '';
            days.push(`<span${highlight}>${d}</span>`);
        }
        tbody += `<tr><td>${m.toString().padStart(2, '0')}</td><td>${days.join(' ')}</td></tr>`;
    }
    sec6_calendarTable.querySelector('tbody').innerHTML = tbody;
}
function sec6_addHours(hours) {
    sec6_fixBaseYear();
    const originalDay = sec6_currentDate.getDate();
    sec6_currentDate.setHours(sec6_currentDate.getHours() + hours);
    // 年のズレや存在しない日補正
    sec6_fixBaseYear();
    const daysInMonth = sec6_getDaysInMonth(sec6_getBaseYear(), sec6_currentDate.getMonth() + 1);
    if (sec6_currentDate.getDate() > daysInMonth) {
        sec6_currentDate.setDate(daysInMonth);
    }
    // 1回目の補正で月がズレた場合の再補正
    sec6_fixBaseYear();
    if (sec6_currentDate.getDate() > daysInMonth) {
        sec6_currentDate.setDate(daysInMonth);
    }
}
function sec6_addMinutes(minutes) {
    sec6_fixBaseYear();
    const originalDay = sec6_currentDate.getDate();
    sec6_currentDate.setMinutes(sec6_currentDate.getMinutes() + minutes);
    // 年のズレや存在しない日補正
    sec6_fixBaseYear();
    const daysInMonth = sec6_getDaysInMonth(sec6_getBaseYear(), sec6_currentDate.getMonth() + 1);
    if (sec6_currentDate.getDate() > daysInMonth) {
        sec6_currentDate.setDate(daysInMonth);
    }
    // 1回目の補正で月がズレた場合の再補正
    sec6_fixBaseYear();
    if (sec6_currentDate.getDate() > daysInMonth) {
        sec6_currentDate.setDate(daysInMonth);
    }
}
function sec6_updateAll() {
    sec6_fixBaseYear();
    sec6_updateDateLabels();
    sec6_updateCalendarTable();
}
// イベント登録
sec6_btnIncHour.addEventListener('click', () => {
    sec6_addHours(1);
    sec6_updateAll();
});
sec6_btnDecHour.addEventListener('click', () => {
    sec6_addHours(-1);
    sec6_updateAll();
});
sec6_btnIncMinute.addEventListener('click', () => {
    sec6_addMinutes(1);
    sec6_updateAll();
});
sec6_btnDecMinute.addEventListener('click', () => {
    sec6_addMinutes(-1);
    sec6_updateAll();
});
sec6_leapYearCheckbox.addEventListener('change', () => {
    // 補正処理
    sec6_fixBaseYear();
    const daysInMonth = sec6_getDaysInMonth(sec6_getBaseYear(), sec6_currentDate.getMonth() + 1);
    if (sec6_currentDate.getDate() > daysInMonth) {
        sec6_currentDate.setDate(daysInMonth);
    }
    sec6_updateAll();
});
sec6_updateAll();

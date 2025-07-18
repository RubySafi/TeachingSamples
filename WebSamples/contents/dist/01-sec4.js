"use strict";
const sec4_dateLabels = document.getElementById('sec4-dateLabels');
const sec4_calendarTable = document.getElementById('sec4-calendarTable');
const sec4_leapYearCheckbox = document.getElementById('sec4-leapyear-checkbox');
const sec4_btnIncMonth = document.getElementById('sec4-btn-inc-month');
const sec4_btnDecMonth = document.getElementById('sec4-btn-dec-month');
const sec4_btnIncDay = document.getElementById('sec4-btn-inc-day');
const sec4_btnDecDay = document.getElementById('sec4-btn-dec-day');
let sec4_currentDate = new Date(2024, 2, 29); // 常に保持
function sec4_isLeapYear() {
    return sec4_leapYearCheckbox.checked;
}
function sec4_getBaseYear() {
    return sec4_isLeapYear() ? 2024 : 2023;
}
function sec4_getDaysInMonth(year, month) {
    if (month === 2) {
        return sec4_isLeapYear() ? 29 : 28;
    }
    return [31, -1, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
}
function sec4_formatDate(date) {
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${m}/${d}`;
}
function sec4_fixBaseYear() {
    sec4_currentDate.setFullYear(sec4_getBaseYear());
}
function sec4_updateDateLabels() {
    sec4_fixBaseYear();
    let labels = '';
    for (let offset = -4; offset <= 4; offset++) {
        const tmp = new Date(sec4_currentDate);
        tmp.setDate(tmp.getDate() + offset);
        tmp.setFullYear(sec4_getBaseYear());
        let cls = '';
        if (offset < 0)
            cls = 'past';
        else if (offset > 0)
            cls = 'future';
        else
            cls = 'current';
        labels += `<div class="date-label ${cls}">${sec4_formatDate(tmp)}</div>`;
    }
    sec4_dateLabels.innerHTML = labels;
}
function sec4_updateCalendarTable() {
    sec4_fixBaseYear();
    const year = sec4_getBaseYear();
    let tbody = '';
    for (let m = 1; m <= 12; m++) {
        const daysInMonth = sec4_getDaysInMonth(year, m);
        const days = [];
        for (let d = 1; d <= daysInMonth; d++) {
            const isCurrentMonth = m === sec4_currentDate.getMonth() + 1;
            const isCurrentDay = d === sec4_currentDate.getDate();
            const highlight = isCurrentMonth && isCurrentDay ? ` style="background: yellow"` : '';
            days.push(`<span${highlight}>${d}</span>`);
        }
        tbody += `<tr><td>${m.toString().padStart(2, '0')}</td><td>${days.join(' ')}</td></tr>`;
    }
    sec4_calendarTable.querySelector('tbody').innerHTML = tbody;
}
function sec4_updateAll() {
    sec4_fixBaseYear();
    sec4_updateDateLabels();
    sec4_updateCalendarTable();
}
function sec4_addMonths(months) {
    sec4_fixBaseYear();
    const originalDay = sec4_currentDate.getDate();
    sec4_currentDate.setDate(1);
    sec4_currentDate.setMonth(sec4_currentDate.getMonth() + months);
    const daysInMonth = sec4_getDaysInMonth(sec4_getBaseYear(), sec4_currentDate.getMonth() + 1);
    sec4_currentDate.setDate(Math.min(originalDay, daysInMonth));
    sec4_fixBaseYear();
}
function sec4_addDays(days) {
    sec4_fixBaseYear();
    sec4_currentDate.setDate(sec4_currentDate.getDate() + days);
    sec4_fixBaseYear();
}
sec4_btnIncMonth.addEventListener('click', () => {
    sec4_addMonths(1);
    sec4_updateAll();
});
sec4_btnDecMonth.addEventListener('click', () => {
    sec4_addMonths(-1);
    sec4_updateAll();
});
sec4_btnIncDay.addEventListener('click', () => {
    sec4_addDays(1);
    sec4_updateAll();
});
sec4_btnDecDay.addEventListener('click', () => {
    sec4_addDays(-1);
    sec4_updateAll();
});
sec4_leapYearCheckbox.addEventListener('change', () => {
    sec4_fixBaseYear();
    const daysInMonth = sec4_getDaysInMonth(sec4_getBaseYear(), sec4_currentDate.getMonth() + 1);
    if (sec4_currentDate.getDate() > daysInMonth) {
        sec4_currentDate.setDate(daysInMonth);
    }
    sec4_updateAll();
});
sec4_updateAll();

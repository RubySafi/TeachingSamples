"use strict";
const quizBtn = document.getElementById('sec7-quiz-btn');
const resetBtn = document.getElementById('sec7-reset-btn');
const baseTimeElem = document.getElementById('sec7-base-time');
const afterTimeElem = document.getElementById('sec7-after-time');
const matchResultElem = document.getElementById('sec7-match-result');
const incMonthBtn = document.getElementById('sec7-inc-month');
const decMonthBtn = document.getElementById('sec7-dec-month');
const incDayBtn = document.getElementById('sec7-inc-day');
const decDayBtn = document.getElementById('sec7-dec-day');
const incHourBtn = document.getElementById('sec7-inc-hour');
const decHourBtn = document.getElementById('sec7-dec-hour');
const incMinBtn = document.getElementById('sec7-inc-minute');
const decMinBtn = document.getElementById('sec7-dec-minute');
const incSecBtn = document.getElementById('sec7-inc-second');
const decSecBtn = document.getElementById('sec7-dec-second');
const quizAmountElem = document.getElementById('sec7-quiz-amount');
let baseTime = new Date(2024, 2, 29, 23, 51, 23);
let afterTime = new Date(baseTime);
let currentQuiz = null;
function formatDateTime(date) {
    const yyyy = date.getFullYear();
    const MM = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    const HH = date.getHours().toString().padStart(2, '0');
    const mm = date.getMinutes().toString().padStart(2, '0');
    const ss = date.getSeconds().toString().padStart(2, '0');
    return `${yyyy}/${MM}/${dd} ${HH}:${mm}:${ss}`;
}
function updateDisplay() {
    baseTimeElem.textContent = formatDateTime(baseTime);
    afterTimeElem.textContent = formatDateTime(afterTime);
    if (currentQuiz) {
        const diffMatch = afterTime.getTime() === currentQuiz.targetTime.getTime();
        matchResultElem.textContent = diffMatch ? 'match' : '';
    }
    else {
        matchResultElem.textContent = '';
    }
}
function createQuiz() {
    const units = ['day', 'hour', 'minute', 'month', 'second'];
    const unit = units[Math.floor(Math.random() * units.length)];
    const amount = unit === 'second'
        ? Math.floor(Math.random() * 20) + 5 // 秒だけ 5～24
        : Math.floor(Math.random() * 10) + 5; // 他は 5～14
    const randomYear = 2024;
    let randomMonth = Math.floor(Math.random() * 6);
    let randomDay = Math.floor(Math.random() * 28) + 1;
    let randomHour = Math.floor(Math.random() * 24);
    let randomMinute = Math.floor(Math.random() * 60);
    let randomSecond = Math.floor(Math.random() * 60);
    switch (unit) {
        case 'day':
            randomDay = 25 + Math.floor(Math.random() * 3);
            break;
        case 'hour':
            randomHour = 20 + Math.floor(Math.random() * 3);
            break;
        case 'minute':
            randomMinute = 55 + Math.floor(Math.random() * 3);
            break;
        case 'month':
            randomMonth = 8 + Math.floor(Math.random() * 3);
            break;
        case 'second':
            randomSecond = 55 + Math.floor(Math.random() * 3); // 秒も後半にしてズレ確認しやすく
            break;
    }
    baseTime = new Date(randomYear, randomMonth, randomDay, randomHour, randomMinute, randomSecond);
    const target = new Date(baseTime);
    switch (unit) {
        case 'day':
            target.setDate(target.getDate() + amount);
            break;
        case 'hour':
            target.setHours(target.getHours() + amount);
            break;
        case 'minute':
            target.setMinutes(target.getMinutes() + amount);
            break;
        case 'month':
            target.setMonth(target.getMonth() + amount);
            break;
        case 'second':
            target.setSeconds(target.getSeconds() + amount);
            break;
    }
    currentQuiz = { amount, unit, targetTime: target };
    quizAmountElem.textContent = `${amount} ${unit}${amount > 1 ? 's' : ''} later`;
    afterTime = new Date(baseTime);
    updateDisplay();
}
function resetAfterTime() {
    afterTime = new Date(baseTime);
    updateDisplay();
}
function addToAfterTime(unit, amount) {
    switch (unit) {
        case 'day':
            afterTime.setDate(afterTime.getDate() + amount);
            break;
        case 'hour':
            afterTime.setHours(afterTime.getHours() + amount);
            break;
        case 'minute':
            afterTime.setMinutes(afterTime.getMinutes() + amount);
            break;
        case 'month':
            afterTime.setMonth(afterTime.getMonth() + amount);
            break;
        case 'second':
            afterTime.setSeconds(afterTime.getSeconds() + amount);
            break;
    }
    updateDisplay();
}
// 既存の秒用関数は不要 → addToAfterTime に統合
// イベントリスナー
quizBtn.addEventListener('click', () => {
    createQuiz();
});
resetBtn.addEventListener('click', () => {
    resetAfterTime();
});
incMonthBtn.addEventListener('click', () => addToAfterTime('month', 1));
decMonthBtn.addEventListener('click', () => addToAfterTime('month', -1));
incDayBtn.addEventListener('click', () => addToAfterTime('day', 1));
decDayBtn.addEventListener('click', () => addToAfterTime('day', -1));
incHourBtn.addEventListener('click', () => addToAfterTime('hour', 1));
decHourBtn.addEventListener('click', () => addToAfterTime('hour', -1));
incMinBtn.addEventListener('click', () => addToAfterTime('minute', 1));
decMinBtn.addEventListener('click', () => addToAfterTime('minute', -1));
incSecBtn.addEventListener('click', () => addToAfterTime('second', 1));
decSecBtn.addEventListener('click', () => addToAfterTime('second', -1));
updateDisplay();

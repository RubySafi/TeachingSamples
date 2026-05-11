// --- 定数 ---
const TIME_LIMIT_TA = 300; // 5分 (秒)
const TIME_LIMIT_ST = 5; // 5秒
const NEXT_DELAY = 1200; // 次の問題まで (ms)
const TICK_MS = 100; // タイマー刻み (0.1秒)
// --- クイズデータ（LaTeX形式） ---
// question / answer / wrongCandidates はすべて $ ... $ で囲んで表示
const QUIZ_DATA = [
    // d/dx(x)
    {
        question: '$\\dfrac{d}{dx}(x)$',
        answer: '$1$',
        wrongCandidates: ['$x$', '$0$', '$2x$', '$\\dfrac{1}{2}x^2$', '$x^2$'],
    },
    // d/dx(x^a)
    {
        question: '$\\dfrac{d}{dx}(x^a)$',
        answer: '$ax^{a-1}$',
        wrongCandidates: [
            '$x^{a+1}$',
            '$ax^a$',
            '$(a-1)x$',
            '$\\frac{1}{a+1}x^{a+1}$',
            '$x^{a-1}$',
            '$a^x \\log a$',
        ],
    },
    // d/dx(sin x)
    {
        question: '$\\dfrac{d}{dx}(\\sin x)$',
        answer: '$\\cos x$',
        wrongCandidates: [
            '$-\\cos x$',
            '$\\tan x$',
            '$\\dfrac{1}{\\cos x}$',
            '$-\\sin x$',
            '$\\sin 1$',
        ],
    },
    // d/dx(cos x)
    {
        question: '$\\dfrac{d}{dx}(\\cos x)$',
        answer: '$-\\sin x$',
        wrongCandidates: [
            '$\\sin x$',
            '$\\cos x$',
            '$-\\cos x$',
            '$\\tan x$',
            '$\\cos 1$',
        ],
    },
    // d/dx(tan x)
    {
        question: '$\\dfrac{d}{dx}(\\tan x)$',
        answer: '$\\dfrac{1}{\\cos^2 x}$',
        wrongCandidates: [
            '$\\dfrac{1}{\\sin^2 x}$',
            '$\\dfrac{-1}{\\cos^2 x}$',
            '$\\dfrac{1}{\\cos x}$',
            '$\\dfrac{1}{\\sin x}$',
            '$\\dfrac{-1}{\\cos x}$',
            '$\\dfrac{-1}{\\sin x}$',
            '$\\dfrac{-1}{\\sin^2 x}$',
        ],
    },
    // d/dx(1/tan x)
    {
        question: '$\\dfrac{d}{dx}\\!\\left(\\dfrac{1}{\\tan x}\\right)$',
        answer: '$\\dfrac{-1}{\\sin^2 x}$',
        wrongCandidates: [
            '$\\dfrac{1}{\\sin^2 x}$',
            '$\\dfrac{1}{\\cos^2 x}$',
            '$\\dfrac{-1}{\\cos^2 x}$',
            '$\\dfrac{1}{\\cos x}$',
            '$\\dfrac{1}{\\sin x}$',
            '$\\dfrac{-1}{\\cos x}$',
            '$\\dfrac{-1}{\\sin x}$',
        ],
    },
    // d/dx(e^x)
    {
        question: '$\\dfrac{d}{dx}(e^x)$',
        answer: '$e^x$',
        wrongCandidates: [
            '$xe^{x-1}$',
            '$\\log x$',
            '$\\dfrac{1}{x}$',
            '$e$',
            '$0$',
        ],
    },
    // d/dx(a^x)
    {
        question: '$\\dfrac{d}{dx}(a^x)$',
        answer: '$a^x \\log a$',
        wrongCandidates: [
            '$a^x$',
            '$xa^{x-1}$',
            '$a^x \\log x$',
            '$\\log a$',
            '$a^x / \\log a$',
        ],
    },
    // d/dx(log x)  ← 自然対数
    {
        question: '$\\dfrac{d}{dx}(\\log x)$',
        answer: '$\\dfrac{1}{x}$',
        wrongCandidates: [
            '$\\log x$',
            '$x \\log x$',
            '$\\dfrac{\\log x}{x}$',
            '$\\dfrac{1}{x \\log a}$',
            '$1$',
        ],
    },
    // d/dx(log_a x)
    {
        question: '$\\dfrac{d}{dx}(\\log_a x)$',
        answer: '$\\dfrac{1}{x \\log a}$',
        wrongCandidates: [
            '$\\dfrac{1}{x}$',
            '$\\dfrac{\\log a}{x}$',
            '$\\dfrac{1}{x \\log x}$',
            '$\\dfrac{\\log_a x}{x}$',
            '$\\log_a e$',
        ],
    },
    // d/dx(log|x|)
    {
        question: '$\\dfrac{d}{dx}(\\log|x|)$',
        answer: '$\\dfrac{1}{x}$',
        wrongCandidates: [
            '$\\dfrac{1}{|x|}$',
            '$\\dfrac{|x|}{x}$',
            '$\\dfrac{1}{x^2}$',
            '$\\log|x| \\cdot \\dfrac{1}{x}$',
            '$\\dfrac{1}{x \\log a}$',
        ],
    },
    // d/dx(log_a|x|)
    {
        question: '$\\dfrac{d}{dx}(\\log_a|x|)$',
        answer: '$\\dfrac{1}{x \\log a}$',
        wrongCandidates: [
            '$\\dfrac{1}{x}$',
            '$\\dfrac{1}{|x| \\log a}$',
            '$\\dfrac{\\log a}{x}$',
            '$\\dfrac{1}{x \\log x}$',
            '$\\dfrac{1}{|x|}$',
        ],
    },
];
let currentMode = null;
let currentQuizIndex = 0;
let timerId = null;
let timeLeftMs = 0; // ミリ秒管理
let totalSolvedCount = 0;
let statsMap = new Map();
let currentChoices = []; // 現在の問題の選択肢（再挑戦時に位置シャッフルのみ行う）
const getById = (id) => document.getElementById(id);
const timerDisplay = getById('timer-display');
const feedbackText = getById('feedback-text');
const quitDialog = getById('quit-confirm-dialog');
// --- MathJax レンダリングヘルパー ---
async function typeset(el) {
    if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
        await MathJax.typesetPromise([el]);
    }
}
// --- 初期化 ---
const init = () => {
    getById('btn-time-attack').addEventListener('click', () => startMode('time-attack'));
    getById('btn-standard').addEventListener('click', () => startMode('standard'));
    getById('btn-restart').addEventListener('click', () => location.reload());
    getById('btn-finish').addEventListener('click', finishGame);
    getById('btn-quit').addEventListener('click', () => {
        pauseTimer();
        quitDialog.showModal();
    });
    getById('dialog-yes').addEventListener('click', () => location.reload());
    getById('dialog-no').addEventListener('click', () => {
        quitDialog.close();
        resumeTimer();
    });
};
const startMode = (mode) => {
    currentMode = mode;
    getById('menu-screen').style.display = 'none';
    getById('quiz-screen').style.display = 'flex';
    if (mode === 'time-attack') {
        timeLeftMs = TIME_LIMIT_TA * 1000;
        startGlobalTimer();
    }
    else {
        getById('btn-finish').style.display = 'block';
    }
    renderQuestion();
};
const renderQuestion = async () => {
    const quiz = QUIZ_DATA[currentQuizIndex];
    // 問題表示
    const qEl = getById('question-text');
    qEl.innerHTML = `問題: ${quiz.question}`;
    await typeset(qEl);
    feedbackText.textContent = '';
    feedbackText.className = '';
    // 新しい問題では選択肢を新規生成（4択を確定させて状態に保存）
    currentChoices = shuffle([
        quiz.answer,
        ...shuffle(quiz.wrongCandidates).slice(0, 3),
    ]);
    await renderChoices();
    if (currentMode === 'standard') {
        timeLeftMs = TIME_LIMIT_ST * 1000;
        startQuestionTimer();
    }
};
// 選択肢の描画（currentChoices の順序で表示）
const renderChoices = async () => {
    const container = getById('choices-container');
    container.innerHTML = '';
    for (const text of currentChoices) {
        const btn = document.createElement('button');
        btn.innerHTML = text;
        btn.dataset['value'] = text;
        btn.addEventListener('click', () => checkAnswer(text));
        container.appendChild(btn);
    }
    await typeset(container);
};
// 誤答後の再挑戦：選択肢の位置のみシャッフルして再描画
const retryQuestion = async () => {
    feedbackText.textContent = '';
    feedbackText.className = '';
    currentChoices = shuffle(currentChoices);
    await renderChoices();
    // 標準モードのみ問題タイマーをリセット・再スタート（TAモードはグローバルタイマーが継続中）
    if (currentMode === 'standard') {
        timeLeftMs = TIME_LIMIT_ST * 1000;
        startQuestionTimer();
    }
};
const checkAnswer = async (selected) => {
    const quiz = QUIZ_DATA[currentQuizIndex];
    const perf = statsMap.get(quiz.question) || { attempts: 0, corrects: 0 };
    // 全ボタン無効化 & ハイライト
    const btns = getById('choices-container').querySelectorAll('button');
    btns.forEach((btn) => {
        btn.disabled = true;
        const v = btn.dataset['value'];
        if (v === quiz.answer) {
            btn.classList.add('btn-correct');
        }
        else if (v === selected && selected !== quiz.answer) {
            btn.classList.add('btn-wrong');
        }
    });
    if (selected === quiz.answer) {
        // --- 正解 ---
        perf.attempts++;
        perf.corrects++;
        totalSolvedCount++;
        feedbackText.textContent = '✓ 正解！';
        feedbackText.className = 'feedback-correct';
        if (currentMode === 'standard')
            pauseTimer();
        statsMap.set(quiz.question, perf);
        setTimeout(nextQuestion, NEXT_DELAY);
    }
    else {
        // --- 不正解 ---
        perf.attempts++;
        feedbackText.textContent = '✗ 不正解！正解を確認してください';
        feedbackText.className = 'feedback-wrong';
        statsMap.set(quiz.question, perf);
        // 標準モードのみタイマー停止（TAモードはグローバルタイマーを止めない）
        if (currentMode === 'standard')
            pauseTimer();
        setTimeout(retryQuestion, 2000);
    }
};
const nextQuestion = () => {
    currentQuizIndex = (currentQuizIndex + 1) % QUIZ_DATA.length;
    renderQuestion();
};
// --- タイマー（0.1秒刻み） ---
const startGlobalTimer = () => {
    if (timerId)
        clearInterval(timerId);
    updateTimerDisplay();
    timerId = window.setInterval(() => {
        timeLeftMs -= TICK_MS;
        updateTimerDisplay();
        if (timeLeftMs <= 0) {
            clearInterval(timerId);
            finishGame();
        }
    }, TICK_MS);
};
const startQuestionTimer = () => {
    if (timerId)
        clearInterval(timerId);
    updateTimerDisplay();
    timerId = window.setInterval(() => {
        timeLeftMs -= TICK_MS;
        updateTimerDisplay();
        if (timeLeftMs <= 0) {
            clearInterval(timerId);
            // タイムアウト：不正解扱いでハイライト → 1秒後に再挑戦
            const quiz = QUIZ_DATA[currentQuizIndex];
            const perf = statsMap.get(quiz.question) || { attempts: 0, corrects: 0 };
            perf.attempts++;
            statsMap.set(quiz.question, perf);
            // 正解ボタンをハイライト表示
            const btns = getById('choices-container').querySelectorAll('button');
            btns.forEach((btn) => {
                btn.disabled = true;
                if (btn.dataset['value'] === quiz.answer) {
                    btn.classList.add('btn-correct');
                }
            });
            feedbackText.textContent = '⏰ 時間切れ！正解を確認してください';
            feedbackText.className = 'feedback-wrong';
            setTimeout(retryQuestion, 2000);
        }
    }, TICK_MS);
};
const pauseTimer = () => {
    if (timerId)
        clearInterval(timerId);
};
const resumeTimer = () => {
    if (currentMode === 'time-attack')
        startGlobalTimer();
    else
        startQuestionTimer();
};
const updateTimerDisplay = () => {
    const sec = Math.max(0, timeLeftMs / 1000);
    let text;
    if (currentMode === 'time-attack') {
        // 5分モード: mm:ss.s
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        text = `残り時間: ${m}:${s.toFixed(1).padStart(4, '0')}`;
    }
    else {
        // 標準モード: ss.s
        text = `残り時間: ${sec.toFixed(1)}s`;
    }
    timerDisplay.textContent = text;
    // 残り時間に応じた色変化
    timerDisplay.classList.remove('timer-warning', 'timer-danger');
    if (currentMode === 'standard') {
        if (sec <= 1.5)
            timerDisplay.classList.add('timer-danger');
        else if (sec <= 3)
            timerDisplay.classList.add('timer-warning');
    }
    else {
        if (sec <= 30)
            timerDisplay.classList.add('timer-danger');
        else if (sec <= 60)
            timerDisplay.classList.add('timer-warning');
    }
};
// --- リザルト ---
const finishGame = async () => {
    pauseTimer();
    getById('quiz-screen').style.display = 'none';
    getById('result-screen').style.display = 'block';
    const statsDiv = getById('result-stats');
    statsDiv.innerHTML =
        currentMode === 'time-attack'
            ? `<p>5分間で正解した総問題数: <strong>${totalSolvedCount}問</strong></p>`
            : `<p>標準モード終了 &nbsp;|&nbsp; 正解数: <strong>${totalSolvedCount}</strong></p>`;
    const tbody = getById('error-report-body');
    tbody.innerHTML = '';
    for (const [question, perf] of statsMap) {
        const rateNum = (perf.corrects / perf.attempts) * 100;
        const rate = rateNum.toFixed(1);
        const rateClass = rateNum >= 80 ? 'rate-good' : rateNum >= 50 ? 'rate-mid' : 'rate-bad';
        const row = document.createElement('tr');
        row.innerHTML = `
      <td>${question}</td>
      <td class="${rateClass}">${rate}%</td>
      <td>(${perf.corrects}/${perf.attempts})</td>`;
        tbody.appendChild(row);
    }
    // リザルト表の問題セルの数式もレンダリング
    await typeset(tbody);
};
// --- ユーティリティ ---
function shuffle(array) {
    return [...array].sort(() => Math.random() - 0.5);
}
init();
export {};

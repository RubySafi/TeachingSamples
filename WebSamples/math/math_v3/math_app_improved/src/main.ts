export {};

// MathJax型宣言
declare const MathJax: {
  typesetPromise: (nodes?: HTMLElement[]) => Promise<void>;
};

// --- 定数 ---
const TIME_LIMIT_TA = 300;   // 5分 (秒)
const TIME_LIMIT_ST = 5;     // 5秒
const NEXT_DELAY    = 1200;  // 次の問題まで (ms)
const TICK_MS       = 100;   // タイマー刻み (0.1秒)

interface Quiz {
  question: string;   // LaTeX文字列（$ で囲む）
  answer: string;     // LaTeX文字列
  wrongCandidates: string[];
}

interface Performance {
  attempts: number;
  corrects: number;
}

// --- クイズデータ（LaTeX形式） ---
// question / answer / wrongCandidates はすべて $ ... $ で囲んで表示
const QUIZ_DATA: Quiz[] = [
  {
    question: '$\\dfrac{d}{dx}(x^n)$',
    answer: '$nx^{n-1}$',
    wrongCandidates: ['$x^{n+1}$', '$nx^n$', '$(n-1)x$', '$x^n$', '$nx$'],
  },
  {
    question: '$\\dfrac{d}{dx}(\\sin x)$',
    answer: '$\\cos x$',
    wrongCandidates: ['$-\\cos x$', '$\\tan x$', '$\\sec x$', '$-\\sin x$', '$1$'],
  },
  {
    question: '$\\dfrac{d}{dx}(\\cos x)$',
    answer: '$-\\sin x$',
    wrongCandidates: ['$\\sin x$', '$\\cos x$', '$-\\cos x$', '$\\tan x$', '$0$'],
  },
  {
    question: '$\\dfrac{d}{dx}(e^x)$',
    answer: '$e^x$',
    wrongCandidates: ['$xe^{x-1}$', '$\\log x$', '$\\dfrac{1}{x}$', '$e^{-x}$', '$0$'],
  },
  {
    question: '$\\dfrac{d}{dx}(\\log x)$',
    answer: '$\\dfrac{1}{x}$',
    wrongCandidates: ['$e^x$', '$\\dfrac{1}{x\\log e}$', '$x$', '$\\log x$', '$1$'],
  },
];

let currentMode: 'time-attack' | 'standard' | null = null;
let currentQuizIndex = 0;
let timerId: number | null = null;
let timeLeftMs = 0;             // ミリ秒管理
let totalSolvedCount = 0;
let statsMap: Map<string, Performance> = new Map();

const getById = (id: string) => document.getElementById(id)!;
const timerDisplay   = getById('timer-display');
const feedbackText   = getById('feedback-text');
const quitDialog     = getById('quit-confirm-dialog') as HTMLDialogElement;

// --- MathJax レンダリングヘルパー ---
async function typeset(el: HTMLElement) {
  if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
    await MathJax.typesetPromise([el]);
  }
}

// --- 初期化 ---
const init = () => {
  getById('btn-time-attack').addEventListener('click', () => startMode('time-attack'));
  getById('btn-standard').addEventListener('click',    () => startMode('standard'));
  getById('btn-restart').addEventListener('click',     () => location.reload());
  getById('btn-finish').addEventListener('click',      finishGame);

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

const startMode = (mode: 'time-attack' | 'standard') => {
  currentMode = mode;
  getById('menu-screen').style.display = 'none';
  getById('quiz-screen').style.display = 'flex';

  if (mode === 'time-attack') {
    timeLeftMs = TIME_LIMIT_TA * 1000;
    startGlobalTimer();
  } else {
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
  feedbackText.className   = '';

  const container = getById('choices-container');
  container.innerHTML = '';

  const choices = shuffle([quiz.answer, ...shuffle(quiz.wrongCandidates).slice(0, 3)]);

  for (const text of choices) {
    const btn = document.createElement('button');
    btn.innerHTML = text;
    btn.dataset['value'] = text;
    btn.addEventListener('click', () => checkAnswer(text));
    container.appendChild(btn);
  }
  // 選択肢の数式をレンダリング
  await typeset(container);

  if (currentMode === 'standard') {
    timeLeftMs = TIME_LIMIT_ST * 1000;
    startQuestionTimer();
  }
};

const checkAnswer = async (selected: string) => {
  const quiz = QUIZ_DATA[currentQuizIndex];
  const perf = statsMap.get(quiz.question) || { attempts: 0, corrects: 0 };
  perf.attempts++;

  // 全ボタン無効化 & ハイライト
  const btns = getById('choices-container').querySelectorAll('button');
  btns.forEach((btn) => {
    (btn as HTMLButtonElement).disabled = true;
    const v = (btn as HTMLButtonElement).dataset['value'];
    if (v === quiz.answer) {
      btn.classList.add('btn-correct');
    } else if (v === selected && selected !== quiz.answer) {
      btn.classList.add('btn-wrong');
    }
  });

  if (selected === quiz.answer) {
    perf.corrects++;
    totalSolvedCount++;
    feedbackText.textContent = '✓ 正解！';
    feedbackText.className   = 'feedback-correct';

    if (currentMode === 'standard') pauseTimer();
    statsMap.set(quiz.question, perf);
    setTimeout(nextQuestion, NEXT_DELAY);
  } else {
    feedbackText.textContent = '✗ 不正解！';
    feedbackText.className   = 'feedback-wrong';
    statsMap.set(quiz.question, perf);
    // 不正解でも一定時間後に次へ（標準モード）
    if (currentMode === 'standard') {
      pauseTimer();
      setTimeout(nextQuestion, NEXT_DELAY);
    }
  }
};

const nextQuestion = () => {
  currentQuizIndex = (currentQuizIndex + 1) % QUIZ_DATA.length;
  renderQuestion();
};

// --- タイマー（0.1秒刻み） ---
const startGlobalTimer = () => {
  if (timerId) clearInterval(timerId);
  updateTimerDisplay();
  timerId = window.setInterval(() => {
    timeLeftMs -= TICK_MS;
    updateTimerDisplay();
    if (timeLeftMs <= 0) {
      clearInterval(timerId!);
      finishGame();
    }
  }, TICK_MS);
};

const startQuestionTimer = () => {
  if (timerId) clearInterval(timerId);
  updateTimerDisplay();
  timerId = window.setInterval(() => {
    timeLeftMs -= TICK_MS;
    updateTimerDisplay();
    if (timeLeftMs <= 0) {
      clearInterval(timerId!);
      const quiz = QUIZ_DATA[currentQuizIndex];
      const perf = statsMap.get(quiz.question) || { attempts: 0, corrects: 0 };
      perf.attempts++;
      statsMap.set(quiz.question, perf);
      nextQuestion();
    }
  }, TICK_MS);
};

const pauseTimer  = () => { if (timerId) clearInterval(timerId); };
const resumeTimer = () => {
  if (currentMode === 'time-attack') startGlobalTimer();
  else startQuestionTimer();
};

const updateTimerDisplay = () => {
  const sec = Math.max(0, timeLeftMs / 1000);

  let text: string;
  if (currentMode === 'time-attack') {
    // 5分モード: mm:ss.s
    const m  = Math.floor(sec / 60);
    const s  = sec % 60;
    text = `残り時間: ${m}:${s.toFixed(1).padStart(4, '0')}`;
  } else {
    // 標準モード: ss.s
    text = `残り時間: ${sec.toFixed(1)}s`;
  }

  timerDisplay.textContent = text;

  // 残り時間に応じた色変化
  timerDisplay.classList.remove('timer-warning', 'timer-danger');
  if (currentMode === 'standard') {
    if (sec <= 1.5) timerDisplay.classList.add('timer-danger');
    else if (sec <= 3) timerDisplay.classList.add('timer-warning');
  } else {
    if (sec <= 30) timerDisplay.classList.add('timer-danger');
    else if (sec <= 60) timerDisplay.classList.add('timer-warning');
  }
};

// --- リザルト ---
const finishGame = async () => {
  pauseTimer();
  getById('quiz-screen').style.display  = 'none';
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
    const rate    = rateNum.toFixed(1);
    const rateClass =
      rateNum >= 80 ? 'rate-good' :
      rateNum >= 50 ? 'rate-mid'  : 'rate-bad';

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
function shuffle<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

init();

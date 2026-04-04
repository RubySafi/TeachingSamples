/** --- 状態管理 --- **/
const state = {
    currentLevel: 1,
    correctAnswer: '',
};
const UNIT_LIST = ['m', 'kg', 's', 'N', 'Hz', 'Pa', 'T', 'B'];
/** --- パターン定義 --- **/
const patterns = [
    {
        id: 'lv1_mul',
        level: 1,
        requiredUnits: 2,
        generate: ([u1, u2], [n1, n2]) => {
            const res = n1 * n2;
            return {
                questionHtml: `${n1} <i>${u1}</i> &times; ${n2} <i>${u2}</i> = ?`,
                choices: [
                    `${res} ${u1}·${u2}`, // 正解
                    `${res} ${u1}/${u2}`, // 誤答：割り算
                    `${res} ${u2}/${u1}`, // 誤答：逆数の割り算
                    `${res} ${u1}<sup>2</sup>·${u2}`, // 誤答：片方の累乗
                ],
            };
        },
    },
    {
        id: 'lv1_diff_div',
        level: 1,
        requiredUnits: 2,
        generate: ([u1, u2], [n1, n2]) => {
            // 割り切れるように val1 を val2 の倍数にする
            const val2 = n2;
            const val1 = n2 * getRandomInt(2, 5);
            const result = val1 / val2;
            return {
                questionHtml: `${val1} <i>${u1}</i> &divide; ${val2} <i>${u2}</i> = ?`,
                choices: [
                    `${result} ${u1}/${u2}`, // 正解
                    `${result} ${u2}/${u1}`, // 誤答：分母分子逆
                    `${result} ${u1}·${u2}`, // 誤答：掛け算
                    `${result} ${u1}/${u2}<sup>2</sup>`, // 誤答：分母の累乗
                ],
            };
        },
    },
    {
        id: 'lv1_same_mul',
        level: 1,
        requiredUnits: 1,
        generate: ([u1], [n1, n2]) => {
            const res = n1 * n2;
            return {
                questionHtml: `${n1} <i>${u1}</i> &times; ${n2} <i>${u1}</i> = ?`,
                choices: [
                    `${res} ${u1}<sup>2</sup>`, // 正解
                    `${res} ${u1}`, // 誤答：単位の重なり忘れ
                    `${res} 2${u1}`, // 誤答：2a と a^2 の混同
                    `${res} ${u1}<sup>3</sup>`, // 誤答：次数間違い
                ],
            };
        },
    }, // 【Lv2】a * b * c 型
    {
        id: 'lv2_mul_mul',
        level: 2,
        requiredUnits: 3,
        generate: ([u1, u2, u3], [n1, n2, n3]) => {
            const res = n1 * n2 * n3;
            return {
                questionHtml: `${n1} <i>${u1}</i> &times; ${n2} <i>${u2}</i> &times; ${n3} <i>${u3}</i> = ?`,
                choices: [
                    `${res} ${u1}·${u2}·${u3}`, // 正解
                    `${res} ${u1}·${u2}/${u3}`, // 誤答：最後だけ割り算
                    `${res} ${u1}·${u2}`, // 誤答：単位の数え漏れ
                    `${res} ${u1}<sup>3</sup>`, // 誤答：すべて同じ単位と混同
                ],
            };
        },
    },
    // 【Lv2】a * b / c 型
    {
        id: 'lv2_mul_div',
        level: 2,
        requiredUnits: 3,
        generate: ([u1, u2, u3], [n1, n2, n3]) => {
            // 修正：n1 を n3 の倍数にすることで確実に割り切れるようにする
            const val3 = n3;
            const val1 = n3 * getRandomInt(2, 4);
            const val2 = n2;
            const res = (val1 * val2) / val3;
            return {
                questionHtml: `${val1} <i>${u1}</i> &times; ${val2} <i>${u2}</i> &divide; ${val3} <i>${u3}</i> = ?`,
                choices: [
                    `${res} ${u1}·${u2}/${u3}`,
                    `${res} ${u1}·${u2}·${u3}`,
                    `${res} ${u3}/(${u1}·${u2})`,
                    `${res} ${u1}/${u2}·${u3}`,
                ],
            };
        },
    },
    // 【Lv2】a / b * c 型
    {
        id: 'lv2_div_mul',
        level: 2,
        requiredUnits: 3,
        generate: ([u1, u2, u3], [n1, n2, n3]) => {
            // 修正：n1 を n2 の倍数にする
            const val2 = n2;
            const val1 = n2 * getRandomInt(2, 4);
            const val3 = n3;
            const res = (val1 / val2) * val3;
            return {
                questionHtml: `${val1} <i>${u1}</i> &divide; ${val2} <i>${u2}</i> &times; ${val3} <i>${u3}</i> = ?`,
                choices: [
                    `${res} ${u1}·${u3}/${u2}`,
                    `${res} ${u1}/(${u2}·${u3})`,
                    `${res} ${u1}·${u2}·${u3}`,
                    `${res} ${u2}·${u3}/${val1}`,
                ],
            };
        },
    },
    // 【Lv2】a / b / c 型
    {
        id: 'lv2_div_div',
        level: 2,
        requiredUnits: 3,
        generate: ([u1, u2, u3], [n1, n2, n3]) => {
            // 修正：n1 を (n2 * n3) の倍数にする
            const val2 = n2;
            const val3 = n3;
            const val1 = val2 * val3 * getRandomInt(2, 3);
            const res = val1 / (val2 * val3);
            return {
                questionHtml: `${val1} <i>${u1}</i> &divide; ${val2} <i>${u2}</i> &divide; ${val3} <i>${u3}</i> = ?`,
                choices: [
                    `${res} ${u1}/(${u2}·${u3})`,
                    `${res} ${u1}/${u2}·${u3}`,
                    `${res} ${u1}·${u2}·${u3}`,
                    `${res} (${u2}·${u3})/${val1}`,
                ],
            };
        },
    },
    // 【Lv2】a * b * a 型 -> a^2 * b
    {
        id: 'lv2_mul_mul_same_1',
        level: 2,
        requiredUnits: 2,
        generate: ([u1, u2], [n1, n2, n3]) => {
            const res = n1 * n2 * n3;
            return {
                questionHtml: `${n1} <i>${u1}</i> &times; ${n2} <i>${u2}</i> &times; ${n3} <i>${u1}</i> = ?`,
                choices: [
                    `${res} ${u1}<sup>2</sup>·${u2}`, // 正解
                    `${res} ${u1}·${u2}<sup>2</sup>`, // 誤答：2乗の対象間違い
                    `${res} ${u1}·${u2}`, // 誤答：2乗忘れ
                    `${res} ${u1}<sup>3</sup>·${u2}`, // 誤答：3乗（数え間違い）
                ],
            };
        },
    },
    // 【Lv2】a * a * b 型 -> a^2 * b
    {
        id: 'lv2_mul_mul_same_2',
        level: 2,
        requiredUnits: 2,
        generate: ([u1, u2], [n1, n2, n3]) => ({
            questionHtml: `${n1} <i>${u1}</i> &times; ${n2} <i>${u1}</i> &times; ${n3} <i>${u2}</i> = ?`,
            choices: [
                `${n1 * n2 * n3} ${u1}<sup>2</sup>·${u2}`,
                `${n1 * n2 * n3} 2${u1}·${u2}`, // 2a と a^2 の混同
                `${n1 * n2 * n3} ${u1}·${u2}`,
                `${n1 * n2 * n3} ${u1}<sup>3</sup>·${u2}`, // 指数間違い
            ],
        }),
    },
    // 【Lv2】b * a * a 型 -> a^2 * b
    {
        id: 'lv2_mul_mul_same_3',
        level: 2,
        requiredUnits: 2,
        generate: ([u1, u2], [n1, n2, n3]) => ({
            questionHtml: `${n1} <i>${u2}</i> &times; ${n2} <i>${u1}</i> &times; ${n3} <i>${u1}</i> = ?`,
            choices: [
                `${n1 * n2 * n3} ${u1}<sup>2</sup>·${u2}`,
                `${n1 * n2 * n3} ${u2}·${u1}·${u1}`,
                `${n1 * n2 * n3} ${u1}·${u2}<sup>2</sup>`, // 違う方を2乗
                `${n1 * n2 * n3} (${u1}·${u2})<sup>2</sup>`,
            ],
        }),
    }, // 【Lv2】a * a * a 型 -> a^3
    {
        id: 'lv2_mul_mul_same_all',
        level: 2,
        requiredUnits: 1,
        generate: ([u1], [n1, n2, n3]) => {
            const res = n1 * n2 * n3;
            return {
                questionHtml: `${n1} <i>${u1}</i> &times; ${n2} <i>${u1}</i> &times; ${n3} <i>${u1}</i> = ?`,
                choices: [
                    `${res} ${u1}<sup>3</sup>`, // 正解
                    `${res} ${u1}<sup>2</sup>`, // 誤答：指数不足
                    `${res} 3${u1}`, // 誤答：3a と a^3 の混同
                    `${res} ${u1}<sup>4</sup>`, // 誤答：指数過多
                ],
            };
        },
    },
    // 【Lv2】a * a / b 型 -> a^2 / b
    {
        id: 'lv2_mul_div_same',
        level: 2,
        requiredUnits: 2,
        generate: ([u1, u2], [n1, n2, n3]) => {
            const res = Math.floor((n1 * n2) / n3);
            return {
                questionHtml: `${n1} <i>${u1}</i> &times; ${n2} <i>${u1}</i> &divide; ${n3} <i>${u2}</i> = ?`,
                choices: [
                    `${res} ${u1}<sup>2</sup>/${u2}`,
                    `${res} ${u1}/${u2}`,
                    `${res} ${u2}/${u1}<sup>2</sup>`,
                    `${res} 2${u1}/${u2}`,
                ],
            };
        },
    },
    // 【Lv2】a / b * a 型 -> a^2 / b
    {
        id: 'lv2_div_mul_same',
        level: 2,
        requiredUnits: 2,
        generate: ([u1, u2], [n1, n2, n3]) => {
            const res = Math.floor((n1 / n2) * n3);
            return {
                questionHtml: `${n1} <i>${u1}</i> &divide; ${n2} <i>${u2}</i> &times; ${n3} <i>${u1}</i> = ?`,
                choices: [
                    `${res} ${u1}<sup>2</sup>/${u2}`, // 正解
                    `${res} ${u1}/(${u2}·${u1})`, // 誤答：最後を分母へ
                    `${res} ${u1}/${u2}`,
                    `${res} ${u1}·${u2}·${u1}`,
                ],
            };
        },
    },
    // 【Lv2】b / a / a 型 -> b / a^2
    {
        id: 'lv2_div_div_same',
        level: 2,
        requiredUnits: 2,
        generate: ([u1, u2], [n1, n2, n3]) => {
            const res = Math.floor(n1 / (n2 * n3));
            return {
                questionHtml: `${n1} <i>${u2}</i> &divide; ${n2} <i>${u1}</i> &divide; ${n3} <i>${u1}</i> = ?`,
                choices: [
                    `${res} ${u2}/${u1}<sup>2</sup>`, // 正解
                    `${res} ${u2}·${u1}<sup>2</sup>`, // 誤答：全部掛け算
                    `${res} ${u2}/${u1}`, // 誤答：指数忘れ
                    `${res} ${u1}<sup>2</sup>/${u2}`, // 誤答：上下逆
                ],
            };
        },
    },
    /** --- Level 3 パターン群 --- **/
    // 1. 基本的な 4要素（a, b, c, d）
    {
        id: 'lv3_abcd_mul',
        level: 3,
        requiredUnits: 4,
        generate: ([u1, u2, u3, u4], [n1, n2, n3, n4]) => {
            const res = n1 * n2 * n3 * n4;
            return {
                questionHtml: `${n1} <i>${u1}</i> &times; ${n2} <i>${u2}</i> &times; ${n3} <i>${u3}</i> &times; ${n4} <i>${u4}</i> = ?`,
                choices: [
                    `${res} ${u1}·${u2}·${u3}·${u4}`, // 正解
                    `${res} ${u1}·${u2}·${u3}/${u4}`,
                    `${res} ${u1}·${u2}/(${u3}·${u4})`,
                    `${res} ${u1}<sup>4</sup>`,
                ],
            };
        },
    },
    {
        id: 'lv3_abcd_div1',
        level: 3,
        requiredUnits: 4,
        generate: ([u1, u2, u3, u4], [n1, n2, n3, n4]) => {
            const val4 = n4;
            const val1 = n4 * getRandomInt(2, 4);
            const res = (val1 * n2 * n3) / val4;
            return {
                questionHtml: `${val1} <i>${u1}</i> &times; ${n2} <i>${u2}</i> &times; ${n3} <i>${u3}</i> &divide; ${val4} <i>${u4}</i> = ?`,
                choices: [
                    `${res} ${u1}·${u2}·${u3}/${u4}`, // 正解
                    `${res} ${u1}·${u2}·${u3}·${u4}`,
                    `${res} ${u1}·${u2}/(${u3}·${u4})`,
                    `${res} ${u4}/(${u1}·${u2}·${u3})`,
                ],
            };
        },
    },
    {
        id: 'lv3_abcd_div2',
        level: 3,
        requiredUnits: 4,
        generate: ([u1, u2, u3, u4], [n1, n2, n3, n4]) => {
            const vDenominator = n3 * n4;
            const val1 = vDenominator * getRandomInt(2, 3);
            const res = (val1 * n2) / vDenominator;
            return {
                questionHtml: `${val1} <i>${u1}</i> &times; ${n2} <i>${u2}</i> &divide; ${n3} <i>${u3}</i> &divide; ${n4} <i>${u4}</i> = ?`,
                choices: [
                    `${res} ${u1}·${u2}/(${u3}·${u4})`, // 正解
                    `${res} ${u1}·${u2}·${n4}/${u3}`,
                    `${res} ${u1}·${u2}·${u3}·${u4}`,
                    `${res} (${u3}·${u4})/${u1}·${u2}`,
                ],
            };
        },
    },
    {
        id: 'lv3_abcd_div3',
        level: 3,
        requiredUnits: 4,
        generate: ([u1, u2, u3, u4], [n1, n2, n3, n4]) => {
            const vDenominator = n2 * n3 * n4;
            const val1 = vDenominator * getRandomInt(2, 3);
            const res = val1 / vDenominator;
            return {
                questionHtml: `${val1} <i>${u1}</i> &divide; ${n2} <i>${u2}</i> &divide; ${n3} <i>${u3}</i> &divide; ${n4} <i>${u4}</i> = ?`,
                choices: [
                    `${res} ${u1}/(${u2}·${u3}·${u4})`, // 正解
                    `${res} ${u1}·${u3}·${u4}/${u2}`,
                    `${res} ${u1}·${u2}·${u3}·${u4}`,
                    `${res} (${u2}·${u3}·${u4})/${u1}`,
                ],
            };
        },
    },
    // 2. a*a系（2乗を含む 4要素）
    {
        id: 'lv3_aac_mul',
        level: 3,
        requiredUnits: 3,
        generate: ([u1, u2, u3], [n1, n2, n3, n4]) => {
            const res = n1 * n2 * n3 * n4;
            return {
                questionHtml: `${n1} <i>${u1}</i> &times; ${n2} <i>${u1}</i> &times; ${n3} <i>${u2}</i> &times; ${n4} <i>${u3}</i> = ?`,
                choices: [
                    `${res} ${u1}<sup>2</sup>·${u2}·${u3}`, // 正解
                    `${res} ${u1}·${u2}·${u3}`,
                    `${res} ${u1}<sup>3</sup>·${u2}·${u3}`,
                    `${res} ${u1}<sup>2</sup>/(${u2}·${u3})`,
                ],
            };
        },
    },
    {
        id: 'lv3_aac_div1',
        level: 3,
        requiredUnits: 3,
        generate: ([u1, u2, u3], [n1, n2, n3, n4]) => {
            const val1 = n3 * getRandomInt(2, 4);
            const res = (val1 * n1 * n2) / n3;
            return {
                questionHtml: `${n1} <i>${u1}</i> &times; ${n2} <i>${u1}</i> &times; ${val1} <i>${u2}</i> &divide; ${n3} <i>${u3}</i> = ?`,
                choices: [
                    `${res} ${u1}<sup>2</sup>·${u2}/${u3}`,
                    `${res} ${u1}·${u2}/${u3}`,
                    `${res} ${u1}<sup>2</sup>·${u2}·${u3}`,
                    `${res} ${u3}/(${u1}<sup>2</sup>·${u2})`,
                ],
            };
        },
    },
    {
        id: 'lv3_aac_div2',
        level: 3,
        requiredUnits: 3,
        generate: ([u1, u2, u3], [n1, n2, n3, n4]) => {
            const vDenom = n3 * n4;
            const val1 = vDenom * getRandomInt(1, 3);
            const res = (n1 * n2 * val1) / vDenom;
            return {
                questionHtml: `${n1} <i>${u1}</i> &times; ${n2} <i>${u1}</i> &divide; ${n3} <i>${u2}</i> &divide; ${n4} <i>${u3}</i> = ?`,
                choices: [
                    `${res} ${u1}<sup>2</sup>/(${u2}·${u3})`,
                    `${res} ${u1}<sup>2</sup>·${u3}/${u2}`,
                    `${res} ${u1}·${u2}·${u3}`,
                    `${res} 2${u1}/(${u2}·${u3})`,
                ],
            };
        },
    },
    // 3. /c/c系（分母に累乗が来る形）
    {
        id: 'lv3_abcc_div',
        level: 3,
        requiredUnits: 3,
        generate: ([u1, u2, u3], [n1, n2, n3, n4]) => {
            const vDenom = n3 * n4;
            const val1 = vDenom * getRandomInt(2, 4);
            const res = (val1 * n2) / vDenom;
            return {
                questionHtml: `${val1} <i>${u1}</i> &times; ${n2} <i>${u2}</i> &divide; ${n3} <i>${u3}</i> &divide; ${n4} <i>${u3}</i> = ?`,
                choices: [
                    `${res} ${u1}·${u2}/${u3}<sup>2</sup>`, // 正解
                    `${res} ${u1}·${u2}/(2${u3})`,
                    `${res} ${u1}·${u2}·${u3}<sup>2</sup>`,
                    `${res} ${u3}<sup>2</sup>/(${u1}·${u2})`,
                ],
            };
        },
    },
    {
        id: 'lv3_aacc_div',
        level: 3,
        requiredUnits: 2,
        generate: ([u1, u2], [n1, n2, n3, n4]) => {
            const vDenom = n3 * n4;
            const val1 = vDenom * getRandomInt(2, 4);
            const res = (val1 * n2) / vDenom;
            return {
                questionHtml: `${val1} <i>${u1}</i> &times; ${n2} <i>${u1}</i> &divide; ${n3} <i>${u2}</i> &divide; ${n4} <i>${u2}</i> = ?`,
                choices: [
                    `${res} ${u1}<sup>2</sup>/${u2}<sup>2</sup>`,
                    `${res} (${u1}/${u2})`,
                    `${res} ${u1}·${u2}`,
                    `${res} ${u1}<sup>2</sup>·${u2}<sup>2</sup>`,
                ],
            };
        },
    },
    {
        id: 'lv3_accc_div',
        level: 3,
        requiredUnits: 2,
        generate: ([u1, u2], [n1, n2, n3, n4]) => {
            const vDenom = n2 * n3 * n4;
            const val1 = vDenom * getRandomInt(2, 4);
            const res = val1 / vDenom;
            return {
                questionHtml: `${val1} <i>${u1}</i> &divide; ${n2} <i>${u2}</i> &divide; ${n3} <i>${u2}</i> &divide; ${n4} <i>${u2}</i> = ?`,
                choices: [
                    `${res} ${u1}/${u2}<sup>3</sup>`,
                    `${res} ${u1}/(3${u2})`,
                    `${res} ${u1}/${u2}<sup>2</sup>`,
                    `${res} ${u1}·${u2}<sup>3</sup>`,
                ],
            };
        },
    },
    // 4. a*a*a系（3乗・4乗）
    {
        id: 'lv3_aaab_mul',
        level: 3,
        requiredUnits: 2,
        generate: ([u1, u2], [n1, n2, n3, n4]) => {
            const res = n1 * n2 * n3 * n4;
            return {
                questionHtml: `${n1} <i>${u1}</i> &times; ${n2} <i>${u1}</i> &times; ${n3} <i>${u1}</i> &times; ${n4} <i>${u2}</i> = ?`,
                choices: [
                    `${res} ${u1}<sup>3</sup>·${u2}`,
                    `${res} 3${u1}·${u2}`,
                    `${res} ${u1}<sup>2</sup>·${u2}`,
                    `${res} ${u1}<sup>4</sup>·${u2}`,
                ],
            };
        },
    },
    {
        id: 'lv3_aaab_div',
        level: 3,
        requiredUnits: 2,
        generate: ([u1, u2], [n1, n2, n3, n4]) => {
            const val1 = n4 * getRandomInt(2, 4);
            const res = (val1 * n2 * n3) / n4;
            return {
                questionHtml: `${n1} <i>${u1}</i> &times; ${n2} <i>${u1}</i> &times; ${n3} <i>${u1}</i> &divide; ${n4} <i>${u2}</i> = ?`,
                choices: [
                    `${res} ${u1}<sup>3</sup>/${u2}`,
                    `${res} ${u1}<sup>3</sup>·${u2}`,
                    `${res} ${u2}/${u1}<sup>3</sup>`,
                    `${res} 3${u1}/${u2}`,
                ],
            };
        },
    },
    {
        id: 'lv3_aaaa_mul',
        level: 3,
        requiredUnits: 1,
        generate: ([u1], [n1, n2, n3, n4]) => {
            const res = n1 * n2 * n3 * n4;
            return {
                questionHtml: `${n1} <i>${u1}</i> &times; ${n2} <i>${u1}</i> &times; ${n3} <i>${u1}</i> &times; ${n4} <i>${u1}</i> = ?`,
                choices: [
                    `${res} ${u1}<sup>4</sup>`,
                    `${res} 4${u1}`,
                    `${res} ${u1}<sup>3</sup>`,
                    `${res} ${u1}<sup>5</sup>`,
                ],
            };
        },
    },
];
/** --- ユーティリティ --- **/
const getRandomUnits = (n) => {
    const shuffled = [...UNIT_LIST].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, n);
};
const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
/** --- メイン処理 --- **/
window.addEventListener('DOMContentLoaded', () => {
    const questionDisplay = document.getElementById('sec03-question-text');
    const feedbackDisplay = document.getElementById('sec03-feedback');
    const nextButton = document.getElementById('sec03-btn-next');
    const choiceBtns = [0, 1, 2, 3].map((i) => document.getElementById(`sec03-choice-${i}`));
    const lvBtns = {
        1: document.getElementById('sec03-lv-1'),
        2: document.getElementById('sec03-lv-2'),
        3: document.getElementById('sec03-lv-3'),
    };
    const updateView = () => {
        // 1. リセット
        feedbackDisplay.textContent = '';
        choiceBtns.forEach((btn) => {
            btn.style.backgroundColor = 'white';
            btn.style.borderColor = '#ccc';
            btn.style.borderWidth = '1px';
            btn.style.display = 'none';
        });
        // --- 【追加】レベルボタンのスタイル更新 ---
        Object.keys(lvBtns).forEach((key) => {
            const lv = parseInt(key);
            const btn = lvBtns[lv];
            if (lv === state.currentLevel) {
                btn.style.backgroundColor = '#3498db';
                btn.style.color = 'white';
            }
            else {
                btn.style.backgroundColor = 'white';
                btn.style.color = '#3498db';
            }
        });
        // 2. 現在のレベルのパターン群からランダムに1つ取得
        const availablePatterns = patterns.filter((p) => p.level === state.currentLevel);
        if (availablePatterns.length === 0)
            return;
        const pattern = availablePatterns[getRandomInt(0, availablePatterns.length - 1)];
        // 3. 単位と数値を生成
        const units = getRandomUnits(pattern.requiredUnits);
        const nums = [
            getRandomInt(2, 8),
            getRandomInt(2, 4),
            getRandomInt(2, 3),
            getRandomInt(1, 2),
        ];
        // 4. 問題生成
        const problem = pattern.generate(units, nums);
        state.correctAnswer = problem.choices[0]; // ここには HTML タグが含まれる
        // 5. 表示
        questionDisplay.innerHTML = problem.questionHtml;
        const shuffled = [...problem.choices].sort(() => Math.random() - 0.5);
        shuffled.forEach((text, i) => {
            if (choiceBtns[i]) {
                if (text) {
                    choiceBtns[i].innerHTML = text;
                    choiceBtns[i].style.display = 'block';
                }
                else {
                    choiceBtns[i].style.display = 'none';
                }
            }
        });
    };
    const handleChoiceClick = (btn) => {
        choiceBtns.forEach((b) => {
            b.style.backgroundColor = 'white';
            b.style.borderWidth = '1px';
        });
        btn.style.borderWidth = '3px';
        if (btn.innerHTML === state.correctAnswer) {
            feedbackDisplay.textContent = 'Correct! ✨';
            feedbackDisplay.style.color = '#27ae60';
            btn.style.backgroundColor = '#d4edda';
            btn.style.borderColor = '#27ae60';
        }
        else {
            feedbackDisplay.textContent = 'Try again! ❌';
            feedbackDisplay.style.color = '#e74c3c';
            btn.style.backgroundColor = '#f8d7da';
            btn.style.borderColor = '#e74c3c';
        }
    };
    /** --- addEventListener で登録 --- **/
    Object.keys(lvBtns).forEach((lvKey) => {
        const lv = parseInt(lvKey);
        lvBtns[lv].addEventListener('click', () => {
            state.currentLevel = lv;
            updateView();
        });
    });
    nextButton.addEventListener('click', updateView);
    choiceBtns.forEach((btn) => {
        btn.addEventListener('click', () => handleChoiceClick(btn));
    });
    // 初回実行
    updateView();
});
export {};

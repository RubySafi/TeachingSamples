export {};

function showPreview() {
  const canvas = document.getElementById(
    'division-canvas'
  ) as HTMLCanvasElement | null;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // --- 描画設定 ---
  const gridX = 40;
  const gridY = 50;
  const offsetX = 50;
  const offsetY = 50;

  function RowToY(row: number): number {
    return offsetY + (row + 1) * gridY;
  }
  const getX = (gridCol: number) => offsetX + gridCol * gridX;
  const cenX = (col: number) => getX(col) + gridX / 2;
  const cenY = (row: number) => RowToY(row) - gridY / 2;

  // --- 1. グリッド線 ---
  const numCols = 6;
  const numRows = 9;
  ctx.strokeStyle = '#eeeeee';
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  for (let c = -1; c <= numCols; c++) {
    ctx.moveTo(getX(c), offsetY);
    ctx.lineTo(getX(c), offsetY + numRows * gridY);
  }
  for (let r = 0; r <= numRows; r++) {
    ctx.moveTo(getX(-1), offsetY + r * gridY);
    ctx.lineTo(getX(numCols), offsetY + r * gridY);
  }
  ctx.stroke();

  // --- スタイル設定 ---
  ctx.font = '30px "Courier New", monospace';
  ctx.fillStyle = '#333';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 2.0;
  ctx.strokeStyle = '#333';

  // --- 2. 各種描画関数 ---

  function putQuotientChar(
    value: number,
    place: number,
    dividendValue: number
  ) {
    const dividendLength = dividendValue.toString().length;
    const baseOffset = 1;
    const rightmostCol = baseOffset + (dividendLength - 1);
    const col = rightmostCol - place;
    const char = value.toString()[0];
    ctx!.fillText(char, cenX(col), cenY(-1));
  }

  function putQuotientText(value: number, dividendValue: number) {
    const letters = value.toString();
    const dividendLength = dividendValue.toString().length;
    const baseOffset = 1;
    const rightmostCol = baseOffset + (dividendLength - 1);
    const chars = letters.split('').reverse();
    chars.forEach((char, i) => {
      ctx!.fillText(char, cenX(rightmostCol - i), cenY(-1));
    });
  }

  function putMainText(
    value: number,
    row: number,
    place: number,
    dividendValue: number
  ) {
    const letters = value.toString();
    const dividendLength = dividendValue.toString().length;
    const baseOffset = 1;
    const rightmostCol = baseOffset + (dividendLength - 1);
    const targetRightCol = rightmostCol - place;
    const startCol = targetRightCol - (letters.length - 1);

    letters.split('').forEach((char, i) => {
      ctx!.fillText(char, cenX(startCol + i), cenY(row));
    });
  }

  function putDivisorText(value: number) {
    const letters = value.toString();
    const chars = letters.split('').reverse();
    chars.forEach((char, i) => {
      ctx!.fillText(char, cenX(0 - i), cenY(0));
    });
  }

  enum Border {
    Left,
    Top,
    Right,
    Bottom,
  }
  enum LineType {
    Line,
    Curve,
  }

  function drawRowFrame(
    row: number,
    offset: number,
    width: number,
    border: Border,
    type: LineType
  ) {
    ctx!.beginPath();
    const xStart = getX(offset);
    const xEnd = getX(offset + width);
    const yTop = RowToY(row - 1);
    const yBottom = RowToY(row);
    if (type === LineType.Line) {
      if (border === Border.Top) {
        ctx!.moveTo(xStart, yTop);
        ctx!.lineTo(xEnd, yTop);
      } else if (border === Border.Bottom) {
        ctx!.moveTo(xStart, yBottom);
        ctx!.lineTo(xEnd, yBottom);
      }
    } else if (type === LineType.Curve) {
      if (border === Border.Left) {
        ctx!.lineWidth = 2.5;
        ctx!.moveTo(xStart, yTop);
        ctx!.quadraticCurveTo(
          xStart + gridX * 0.25,
          (yTop + yBottom) / 2,
          xStart,
          yBottom
        );
      }
    }
    ctx!.stroke();
    ctx!.lineWidth = 2.0;
  }

  /**
   * 指定した行に引き算の整理線（アンダーライン）を引く
   * @param row 行番号
   * @param place 一の位の場所 (0: 被除数の一の位の真下, 1: 十の位の真下...)
   * @param digit 線の長さ（桁数分）
   * @param dividendValue 被除数（位置基準用）
   */
  function drawResultLine(
    row: number,
    place: number,
    digit: number,
    dividendValue: number
  ) {
    const dividendLength = dividendValue.toString().length;
    const baseOffset = 1;
    const rightmostCol = baseOffset + (dividendLength - 1);

    // 線の右端の列インデックス
    const targetRightCol = rightmostCol - place;
    // 線の開始位置（左側）は、右端から digit 分引いて、次のセルの境界にするため +1 調整
    const startCol = targetRightCol - digit + 1;

    const xStart = getX(startCol);
    const xEnd = getX(targetRightCol + 1);
    const yBottom = RowToY(row);

    ctx!.beginPath();
    ctx!.moveTo(xStart, yBottom);
    ctx!.lineTo(xEnd, yBottom);
    ctx!.stroke();
  }

  // --- 3. データの定義 ---
  const dividend = 1000;
  const quotient = 142;
  const divisor = 7;
  const total_sequence = [10, 30, 20];
  const quotient_sequence = [1, 4, 2];
  const division_sequence = [7, 28, 14];
  const subtraction_sequence = [3, 2, 6];

  // --- 4. 描画実行 ---

  // 問題文
  putDivisorText(divisor);
  putMainText(dividend, 0, 0, dividend);
  drawRowFrame(0, 1, 4, Border.Top, LineType.Line);
  drawRowFrame(0, 1, 1, Border.Left, LineType.Curve);

  let place, digit, row;
  // Step 1
  place = 2; //100の位の計算
  digit = total_sequence[0].toString().length;
  row = 0;
  // 1.1 商記入 (百の位)
  putQuotientChar(quotient_sequence[0], place, dividend);
  // 1.2 倍数記入 (7 を 百の位の下に)
  putMainText(division_sequence[0], row + 1, place, dividend);
  // 1.3 引き算整理線
  drawResultLine(row + 1, place, digit, dividend);
  // 1.4 差記入 (3)
  putMainText(subtraction_sequence[0], row + 2, place, dividend);

  // Step 1.5
  // 0 埋め (30)
  putMainText(total_sequence[1], 2, 1, dividend);

  // Step 2
  place = 1; //10の位の計算
  digit = total_sequence[1].toString().length;
  row = 2;
  // 2.1 商記入 (十の位)
  putQuotientChar(quotient_sequence[1], place, dividend);
  // 2.2 倍数記入 (28 を 十の位の下に)
  putMainText(division_sequence[1], row + 1, place, dividend);
  // 2.3 引き算整理線
  drawResultLine(row + 1, place, digit, dividend);
  // 2.4 差記入 (2)
  putMainText(subtraction_sequence[1], row + 2, place, dividend);

  // Step 2.5
  // 0 埋め (20)
  putMainText(total_sequence[2], 4, 0, dividend);

  // Step 3
  place = 0; //1の位の計算
  digit = total_sequence[2].toString().length;
  row = 4;
  // 3.1 商記入 (一の位)
  putQuotientChar(quotient_sequence[2], place, dividend);
  // 3.2 倍数記入 (14 を 一の位の下に)
  putMainText(division_sequence[2], row + 1, place, dividend);
  // 3.3 引き算整理線
  drawResultLine(row + 1, place, digit, dividend);
  // 3.4 差記入 (余り 6)
  putMainText(subtraction_sequence[2], row + 2, place, dividend);
}

document.addEventListener('DOMContentLoaded', showPreview);

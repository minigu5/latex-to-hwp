'use strict';

const { test } = require('node:test');
const assert = require('node:assert');
const { convert } = require('../src/converter.js');

// 골든 케이스 (CLAUDE.md / CONVERSION_RULES.md의 기준 예시)
// HWP에서 공백은 표시되지 않고 항 구분 용도이므로, 출력은 사용자 원본 골든과
// "표시상 동일"하다. 여기서는 변환기의 정규화된 출력을 스냅샷으로 고정한다.
test('골든 예시 변환', () => {
  const input =
    '$$\\lambda(t) = \\lambda_0 + A_1 \\sin\\left(\\frac{2\\pi}{24}(t - \\phi_1)\\right) + A_2 \\sin\\left(\\frac{2\\pi}{12}(t - \\phi_2)\\right)$$';
  const expected =
    'lambda ( t ) `=` lambda _{0} `+` A _{1} sin LEFT( {2 pi} over {24} ( t `-` phi _{1} ) RIGHT) `+` A _{2} sin LEFT( {2 pi} over {12} ( t `-` phi _{2} ) RIGHT)';
  assert.strictEqual(convert(input), expected);
});

test('분수: \\frac{a}{b} → {a} over {b}', () => {
  assert.strictEqual(convert('\\frac{a}{b}'), '{a} over {b}');
  assert.strictEqual(convert('\\frac{2\\pi}{24}'), '{2 pi} over {24}');
});

test('첨자: 단일/그룹, 여러 자리 숫자는 묶음', () => {
  assert.strictEqual(convert('x^2'), 'x ^{2}');
  assert.strictEqual(convert('y_{ij}'), 'y _{i j}');
  assert.strictEqual(convert('x_{12}^{34}'), 'x _{12} ^{34}');
});

test('제곱근 / n제곱근', () => {
  assert.strictEqual(convert('\\sqrt{2}'), 'sqrt {2}');
  assert.strictEqual(convert('\\sqrt[3]{x+1}'), '^{3} sqrt {x `+` 1}');
});

test('합/적분/극한', () => {
  assert.strictEqual(convert('\\sum_{i=1}^{n}'), 'sum _{i `=` 1} ^{n}');
  assert.strictEqual(convert('\\int_0^1'), 'int _{0} ^{1}');
  assert.strictEqual(convert('\\lim_{x \\to 0}'), 'lim _{x rarrow 0}');
});

test('그리스 문자는 이름 그대로 (대소문자 유지)', () => {
  assert.strictEqual(convert('\\alpha'), 'alpha');
  assert.strictEqual(convert('\\Omega'), 'Omega');
  assert.strictEqual(convert('\\varphi'), 'varphi');
});

test('연산/집합 기호 매핑', () => {
  assert.strictEqual(convert('A \\cup B'), 'A union B');
  assert.strictEqual(convert('A \\cap B'), 'A inter B');
  assert.strictEqual(convert('a \\leq b'), 'a leq b');
  assert.strictEqual(convert('\\infty'), 'inf');
});

test('이항 연산자는 좁은 공백(`)으로 감쌈', () => {
  assert.strictEqual(convert('a - b'), 'a `-` b');
  assert.strictEqual(convert('a + b = c'), 'a `+` b `=` c');
});

test('행렬 / cases 환경', () => {
  assert.strictEqual(
    convert('\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}'),
    'pmatrix{ a & b # c & d }'
  );
  assert.strictEqual(
    convert('\\begin{bmatrix} 1 & 2 \\end{bmatrix}'),
    'bmatrix{ 1 & 2 }'
  );
});

test('함수는 그대로, \\left \\right는 LEFT(/RIGHT)로', () => {
  assert.strictEqual(convert('\\sin x'), 'sin x');
  assert.strictEqual(convert('\\left( x \\right)'), 'LEFT( x RIGHT)');
  assert.strictEqual(convert('\\left[ x \\right]'), 'LEFT[ x RIGHT]');
});

test('수식 구분자($$, $, \\[ \\])는 제거', () => {
  assert.strictEqual(convert('$x+1$'), 'x `+` 1');
  assert.strictEqual(convert('$$x+1$$'), 'x `+` 1');
  assert.strictEqual(convert('\\[x+1\\]'), 'x `+` 1');
});

test('빈 입력은 빈 문자열', () => {
  assert.strictEqual(convert(''), '');
  assert.strictEqual(convert('   '), '');
});

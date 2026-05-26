# LaTeX → 한글(HWP) 수식 변환기

AI(ChatGPT, Claude 등)가 출력하는 **Markdown LaTeX 수식**을 **한컴오피스 한글(HWP) 수식 편집기 문법**으로 변환합니다. 변환 결과를 복사해 한글 수식 편집기에 붙여넣으면 그대로 렌더링됩니다.

LaTeX와 한글 수식 편집기는 문법이 서로 호환되지 않아, AI가 만든 수식을 한글에 붙여넣으면 깨집니다. 이 도구가 그 간극을 메웁니다.

## 사용법

### 웹 (권장)
`index.html`을 브라우저로 열고 입력창에 LaTeX 수식을 붙여넣으면 됩니다. 빌드나 설치가 필요 없습니다.

```
open index.html        # macOS
```

또는 GitHub Pages 등 정적 호스팅에 그대로 올릴 수 있습니다.

### 코드에서 직접
```js
const { convert } = require('./src/converter.js');
convert('$$\\frac{2\\pi}{24}(t - \\phi_1)$$');
// → "{2 pi} over {24} ( t `-` phi _{1} )"
```

브라우저에서는 `<script src="src/converter.js">` 후 `window.LatexToHwp.convert(...)`.

## 예시

| 입력 (LaTeX) | 출력 (한글 수식) |
|--------------|------------------|
| `\frac{a}{b}` | `{a} over {b}` |
| `x^2 + y_{ij}` | `x ^{2} \`+\` y _{i j}` |
| `\sqrt{2}` | `sqrt {2}` |
| `\sum_{i=1}^{n}` | `sum _{i \`=\` 1} ^{n}` |
| `\alpha \cup \beta` | `alpha union beta` |

> 한글 수식 편집기에서 **공백은 항(term) 구분 용도**이며 화면에는 나타나지 않습니다. **백틱(`` ` ``)은 1/4 크기의 좁은 간격**으로, 연산자 주위 간격을 보기 좋게 맞추는 데 쓰입니다.

## 배포

빌드가 필요 없는 정적 사이트라 Vercel 등에 그대로 올릴 수 있습니다. GitHub 연동 자동 배포 방법은 [`VERCEL_DEPLOY.md`](./VERCEL_DEPLOY.md)를 참고하세요.

## 테스트

```
npm test     # 또는: node --test
```

## 변환 규칙

전체 매핑(구조 명령·그리스 문자·연산/집합/화살표/기타 기호)과 한글 수식 고유 규칙은 [`CONVERSION_RULES.md`](./CONVERSION_RULES.md)에 정리되어 있습니다.

## 한계 / 확인 필요 항목

- `\left` / `\right`는 한글 명세 권장 방식인 `LEFT(/RIGHT)`로 변환합니다 (내용 높이에 맞춰 괄호가 커집니다).
- 일부 기호(`\nabla` 등 명세에 이미지로만 있는 항목)는 실제 한글 동작 검증이 필요합니다.
- 미확인 LaTeX 명령은 임의로 버리지 않고 이름을 보존합니다.

## 출처 / 저작권

변환 규칙은 한글과컴퓨터의 공개 문서 **「한글 문서 파일 형식 - 수식」(revision 1.2)**를 참고하여 개발했습니다. 본 제품은 한글과컴퓨터의 한글 문서 파일(.hwp) 공개 문서를 참고하여 개발하였습니다.

코드 라이선스: MIT

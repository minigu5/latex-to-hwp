# Vercel 배포 가이드

이 프로젝트를 Vercel에 올려 웹에서 누구나 접속할 수 있게 하는 방법입니다.

## 핵심 요약

- 이 앱은 **빌드가 필요 없는 순수 정적 사이트**입니다(브라우저에서 JavaScript로 변환). 서버 코드·서버리스 함수가 없습니다.
- 따라서 Vercel에서 **빌드 명령 없이 정적 서빙**만 하면 됩니다. 저장소 루트의 `vercel.json`이 이 설정을 담고 있습니다.
- GitHub 저장소(`minigu5/latex-to-hwp`)와 연동하면, **`main` 브랜치에 push할 때마다 자동으로 재배포**됩니다.
- Vercel은 HTTPS로 서빙하므로, `file://`에서 막히던 **클립보드 자동 복사도 정상 동작**합니다.

---

## 방법 A: Vercel 대시보드에서 GitHub 연동 (권장)

1. **Vercel 가입/로그인**
   - https://vercel.com 접속 → "Sign Up" 또는 "Log In"
   - **"Continue with GitHub"**로 GitHub 계정(minigu5)으로 로그인하면 연동이 가장 매끄럽습니다.

2. **프로젝트 가져오기**
   - 대시보드에서 **"Add New…" → "Project"** 클릭
   - "Import Git Repository" 목록에서 **`minigu5/latex-to-hwp`** 선택 → **Import**
   - (저장소가 안 보이면 "Adjust GitHub App Permissions"에서 이 저장소에 대한 접근 권한을 허용)

3. **설정 확인 (보통 그대로 두면 됨)**
   - **Framework Preset**: `Other` (자동 감지됨)
   - **Build Command**: 비움 (vercel.json이 빌드를 생략하도록 설정)
   - **Output Directory**: `.` (루트 — vercel.json에 명시됨)
   - **Install Command**: 비워도 됩니다(설치할 의존성 없음)
   - **Root Directory**: `./` (그대로)

4. **Deploy** 클릭
   - 잠시 후 `https://latex-to-hwp.vercel.app`(또는 유사한 주소)이 생성됩니다.

5. **자동 배포 확인**
   - 이후 `git push origin main` 하면 자동으로 Production이 재배포됩니다.
   - 다른 브랜치나 Pull Request를 올리면 별도의 **Preview 배포**가 생성됩니다(미리 확인용).

---

## 방법 B: Vercel CLI로 배포

GitHub 연동 없이 로컬에서 바로 올리고 싶을 때 사용합니다.

```bash
npm i -g vercel      # Vercel CLI 설치 (최초 1회)
vercel login         # 브라우저로 로그인 (! vercel login 형태로 이 세션에서 실행 가능)
vercel               # 프로젝트 디렉토리에서 실행 → 미리보기 배포
vercel --prod        # 프로덕션 배포
```

처음 `vercel` 실행 시 묻는 항목은 다음처럼 답하면 됩니다.
- *Set up and deploy?* → `Y`
- *Which scope?* → 본인 계정
- *Link to existing project?* → `N` (처음이면)
- *Project name* → 엔터(기본값) 또는 원하는 이름
- *In which directory is your code located?* → `./`
- 나머지(빌드/출력 설정)는 `vercel.json`이 자동 적용합니다.

---

## 배포되는 파일 / 제외되는 파일

`.vercelignore`에 따라 다음은 배포 번들에서 제외됩니다(서빙에 불필요):
- `test/`, `node_modules`, `*.pdf`, `CLAUDE.md`, `CONVERSION_RULES.md`

실제로 서빙되는 파일은 다음과 같습니다:
- `index.html` (진입점, `/`로 접속)
- `app.js`, `src/converter.js`
- `README.md` (있어도 무해)

> KaTeX(미리보기 렌더링)는 CDN에서 불러오므로 별도 배포 파일이 없습니다.

---

## 커스텀 도메인 (선택)

Vercel 프로젝트 → **Settings → Domains**에서 보유한 도메인을 연결할 수 있습니다. Vercel이 안내하는 DNS 레코드(A 레코드 또는 CNAME)를 도메인 등록 업체에 추가하면 됩니다.

---

## 문제 해결

- **빌드가 실패하거나 "No Output Directory" 오류**: 프로젝트 Settings → General에서 Framework Preset이 `Other`, Build Command 비움, Output Directory가 `.`인지 확인하세요. `vercel.json`이 이를 강제하지만, 대시보드에서 수동 오버라이드가 걸려 있으면 해제합니다.
- **자동 복사가 안 됨**: 배포 주소가 `https://`인지 확인하세요(Vercel은 기본 HTTPS). 사내망/확장프로그램이 클립보드를 막는 경우 "복사" 버튼을 사용하면 됩니다.
- **미리보기(수식 렌더링)가 비어 있음**: 네트워크에서 jsDelivr CDN(`cdn.jsdelivr.net`) 접근이 차단되지 않았는지 확인하세요.

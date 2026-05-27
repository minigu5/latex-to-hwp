# 저장소 관리 가이드 (Repository Management Guide)

이 문서는 본 프로젝트의 다중 저장소 구조와 Git 관리 규칙을 정의합니다. 향후 작업 시 이 규칙을 엄격히 준수하여 실수를 방지하십시오.

## 1. 저장소 구조

| 구성 요소 | 로컬 경로 | GitHub 저장소 URL |
|-----------|-----------|-------------------|
| **메인 프로젝트** | `/` | [minigu5/latex-to-hwp](https://github.com/minigu5/latex-to-hwp) |
| **크롬 확장 프로그램** | `/chrome-extension` | [minigu5/latex-to-hwp-extension](https://github.com/minigu5/latex-to-hwp-extension) |

## 2. 핵심 관리 규칙

### ⚠️ 크롬 확장 프로그램 폴더 (`/chrome-extension`)
- **로컬 전용 유지**: 메인 저장소(`latex-to-hwp`)의 GitHub에는 이 폴더가 포함되어서는 안 됩니다.
- **추적 금지**: `.gitignore`에 `/chrome-extension/`이 반드시 포함되어야 하며, `git add` 시 포함되지 않도록 주의하십시오.
- **별도 푸시**: 이 폴더의 변경 사항은 오직 `latex-to-hwp-extension` 저장소로만 푸시해야 합니다.

### 🔄 로직 동기화
- `src/converter.js`가 수정되면 반드시 `chrome-extension/lib/converter.js`로 복사하여 동기화하십시오.
- 동기화 후, 각각의 저장소에 별도로 커밋/푸시를 수행하십시오.

## 3. 실수 방지를 위한 Git 명령어 가이드

### 실수로 파일을 삭제했을 때 로컬만 복구하기
```bash
git checkout <commit_id> -- <path>  # 특정 파일 복구
git reset HEAD <path>              # 스테이징 해제
```

### GitHub에서만 삭제하고 로컬은 유지하기
```bash
git rm -r --cached chrome-extension/
git commit -m "chore: remove from remote only"
git push origin main
```

---
**주의**: AI 어시스턴트는 작업을 시작하기 전 항상 이 파일과 `CLAUDE.md`를 먼저 읽고 저장소 분리 규칙을 확인해야 합니다.

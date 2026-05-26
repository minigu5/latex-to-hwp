'use strict';

(function () {
  var input = document.getElementById('input');
  var output = document.getElementById('output');
  var preview = document.getElementById('preview');
  var copyBtn = document.getElementById('copyBtn');
  var clearBtn = document.getElementById('clearBtn');
  var copyHint = document.getElementById('copyHint');

  var DEFAULT_HINT = copyHint.textContent;
  var PLACEHOLDER = '<span class="placeholder">수식을 입력하면 여기에 렌더링됩니다.</span>';
  var autoCopyTimer = null;
  var hintTimer = null;

  // 입력에서 수식 구분자($$, $, \[ \], \( \))를 제거 (미리보기용)
  function stripDelimiters(s) {
    s = s.trim();
    s = s.replace(/^\$\$/, '').replace(/\$\$$/, '');
    s = s.replace(/^\$/, '').replace(/\$$/, '');
    s = s.replace(/^\\\[/, '').replace(/\\\]$/, '');
    s = s.replace(/^\\\(/, '').replace(/\\\)$/, '');
    return s.trim();
  }

  function flashHint(message) {
    clearTimeout(hintTimer);
    copyHint.textContent = message;
    copyHint.classList.add('copied');
    hintTimer = setTimeout(function () {
      copyHint.textContent = DEFAULT_HINT;
      copyHint.classList.remove('copied');
    }, 1600);
  }

  function copyText(text, onSuccess) {
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onSuccess, fallback);
    } else {
      fallback();
    }
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        if (document.execCommand('copy') && onSuccess) onSuccess();
      } catch (e) { /* 클립보드 접근 불가(예: file://) — 복사 버튼으로 직접 복사 */ }
      document.body.removeChild(ta);
    }
  }

  function renderPreview(latex) {
    var body = stripDelimiters(latex);
    if (!body) { preview.innerHTML = PLACEHOLDER; return; }
    if (typeof katex === 'undefined') {
      preview.innerHTML = '<span class="placeholder">렌더러 로딩 중…</span>';
      return;
    }
    try {
      katex.render(body, preview, { displayMode: true, throwOnError: false });
    } catch (e) {
      preview.innerHTML = '<span class="render-error">렌더 오류: ' + (e.message || e) + '</span>';
    }
  }

  function render() {
    var result = window.LatexToHwp.convert(input.value);
    output.textContent = result;
    renderPreview(input.value);

    // 변환되면 자동으로 클립보드에 복사 (입력이 멈춘 뒤)
    clearTimeout(autoCopyTimer);
    if (result) {
      autoCopyTimer = setTimeout(function () {
        copyText(result, function () { flashHint('자동 복사됨 ✓'); });
      }, 450);
    }
  }

  input.addEventListener('input', render);

  clearBtn.addEventListener('click', function () {
    input.value = '';
    render();
    input.focus();
  });

  copyBtn.addEventListener('click', function () {
    copyText(output.textContent, function () {
      var original = copyBtn.textContent;
      copyBtn.textContent = '복사됨!';
      setTimeout(function () { copyBtn.textContent = original; }, 1200);
    });
  });

  render();
})();

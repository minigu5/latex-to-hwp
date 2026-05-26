'use strict';

(function () {
  var input = document.getElementById('input');
  var output = document.getElementById('output');
  var preview = document.getElementById('preview');
  var copyBtn = document.getElementById('copyBtn');
  var clearBtn = document.getElementById('clearBtn');
  var copyHint = document.getElementById('copyHint');

  // Modal elements
  var modal = document.getElementById('warningModal');
  var modalCloseBtn = document.getElementById('modalCloseBtn');
  var modalHideCheckbox = document.getElementById('modalHideTodayCheckbox');
  var promptCopyBtn = document.getElementById('promptCopyBtn');

  var DEFAULT_HINT = copyHint.textContent;
  var PLACEHOLDER = '<span class="placeholder">수식을 입력하면 여기에 렌더링됩니다.</span>';
  var autoCopyTimer = null;
  var hintTimer = null;

  var HIDE_WARNING_KEY = 'latexToHwp_hideWarningUntil';

  function shouldShowWarning() {
    var hideUntil = localStorage.getItem(HIDE_WARNING_KEY);
    if (!hideUntil) return true;
    return Date.now() > parseInt(hideUntil, 10);
  }

  function hideWarningModal() {
    modal.classList.remove('show');
    if (modalHideCheckbox.checked) {
      // Set to hide for 24 hours
      var tomorrow = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem(HIDE_WARNING_KEY, tomorrow.toString());
    }
  }

  function showWarningModal() {
    if (!shouldShowWarning()) return;
    modalHideCheckbox.checked = false;
    modal.classList.add('show');

    // Disable confirmation button for 2 seconds
    var secondsLeft = 2;
    modalCloseBtn.disabled = true;
    var originalText = "확인했습니다";
    modalCloseBtn.textContent = originalText + " (" + secondsLeft + ")";

    var timer = setInterval(function() {
      secondsLeft--;
      if (secondsLeft > 0) {
        modalCloseBtn.textContent = originalText + " (" + secondsLeft + ")";
      } else {
        clearInterval(timer);
        modalCloseBtn.disabled = false;
        modalCloseBtn.textContent = originalText;
      }
    }, 1000);
  }

  modalCloseBtn.addEventListener('click', hideWarningModal);

  if (promptCopyBtn) {
    promptCopyBtn.addEventListener('click', function () {
      copyText("답변에서 수식을 모두 latex로 입력해줘", function () {
        var original = promptCopyBtn.textContent;
        promptCopyBtn.textContent = '복사됨!';
        setTimeout(function () { promptCopyBtn.textContent = original; }, 1200);
      });
    });
  }
  
  // Also close modal when clicking outside the content
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      hideWarningModal();
    }
  });

  // Heuristic to detect if pasted text is likely rendered math instead of LaTeX
  function isLikelyRenderedMath(text) {
    if (!text || text.trim().length === 0) return false;
    
    // Count occurrences of common LaTeX indicators
    var latexMarkers = (text.match(/[\^_\\{}]/g) || []).length;
    
    // Count occurrences of unicode math symbols that are usually macros in LaTeX
    var unicodeMathMarkers = (text.match(/[∫∑∂∞≈≠≡≤≥αβγδεζηθικλμνξπρστυφχψωΓΔΘΛΞΠΣΥΦΨΩ]/g) || []).length;
    
    // If it has very few LaTeX markers but has unicode math symbols, it's likely rendered.
    // Also, rendered text from AI often contains invisible characters like zero-width spaces (\u200B)
    var hasInvisibleChars = /\u200B/.test(text);
    
    if (hasInvisibleChars && latexMarkers === 0) return true;
    
    // If text is somewhat long, has unicode math, but almost no latex structural characters
    if (text.length > 10 && unicodeMathMarkers > 0 && latexMarkers <= 1) {
      return true;
    }
    
    return false;
  }

  var isPasting = false;
  input.addEventListener('paste', function() {
    isPasting = true;
  });

  var UNICODE_TO_HWP = {
    '∫': 'int ', '∬': 'dint ', '∭': 'tint ', '∮': 'oint ',
    '∑': 'sum ', '∏': 'prod ', '∂': 'partial ', '∞': 'inf ',
    '≈': 'approx ', '≠': '!= ', '≡': 'equiv ', '≤': '<= ', '≥': '>= ',
    'α': 'alpha ', 'β': 'beta ', 'γ': 'gamma ', 'δ': 'delta ', 'ε': 'epsilon ',
    'ζ': 'zeta ', 'η': 'eta ', 'θ': 'theta ', 'ι': 'iota ', 'κ': 'kappa ',
    'λ': 'lambda ', 'μ': 'mu ', 'ν': 'nu ', 'ξ': 'xi ', 'π': 'pi ',
    'ρ': 'rho ', 'σ': 'sigma ', 'τ': 'tau ', 'υ': 'upsilon ', 'φ': 'phi ',
    'χ': 'chi ', 'ψ': 'psi ', 'ω': 'omega ',
    'Γ': 'Gamma ', 'Δ': 'Delta ', 'Θ': 'Theta ', 'Λ': 'Lambda ', 'Ξ': 'Xi ',
    'Π': 'Pi ', 'Σ': 'Sigma ', 'Υ': 'Upsilon ', 'Φ': 'Phi ', 'Ψ': 'Psi ', 'Ω': 'Omega ',
    '→': '-> ', '←': '<- ', '↑': 'uparrow ', '↓': 'downarrow ', '↔': '<-> ',
    '−': '- ', '×': 'times ', '÷': 'div ', '±': '+- ', '√': 'sqrt ', '∝': 'propto ',
    '∈': 'in ', '∉': 'notin ', '∪': 'union ', '∩': 'inter ', '⊂': 'subset ',
    '⊃': 'supset ', '⊆': 'subseteq ', '⊇': 'supseteq '
  };

  function fallbackConvert(text) {
    var isGAS = /\u200B/.test(text);
    
    // Replace unicodes with HWP keywords
    var converted = text.split('').map(function(c) {
      return UNICODE_TO_HWP[c] || c;
    }).join('');

    if (isGAS) {
      // GAS: try to format `A \n B \n \u200b` as `{B}_{A}` to loosely group fractions/scripts
      converted = converted.replace(/([^\n]+)\n([^\n]+)\n\u200B\n?/g, function(match, p1, p2) {
        return '{' + p2.trim() + '}_{' + p1.trim() + '} ';
      });
      converted = converted.replace(/\u200B/g, ' ').replace(/\n/g, ' ');
      converted = converted.replace(/\s+/g, ' ').trim();
      return { source: "Google AI Studio", text: converted };
    } else {
      // ChatGPT
      converted = converted.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
      return { source: "ChatGPT", text: converted };
    }
  }

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
    var val = input.value;
    var isRendered = isLikelyRenderedMath(val);

    if (isRendered) {
      if (isPasting) {
        showWarningModal();
      }
      var fallback = fallbackConvert(val);
      output.textContent = fallback.text;
      output.setAttribute('data-warning', "/* " + fallback.source + " 복구 (불완전 - 위/아래 첨자 수동 수정 필요) */");
      output.classList.add('fallback-mode');
      output.style.color = "#d35400"; // Orange color to indicate warning/fallback
      renderPreview(val);
      clearTimeout(autoCopyTimer);
    } else {
      output.style.color = "";
      output.removeAttribute('data-warning');
      output.classList.remove('fallback-mode');
      var result = window.LatexToHwp.convert(val);
      output.textContent = result;
      renderPreview(val);

      // 변환되면 자동으로 클립보드에 복사 (입력이 멈춘 뒤)
      clearTimeout(autoCopyTimer);
      if (result) {
        autoCopyTimer = setTimeout(function () {
          copyText(result, function () { flashHint('자동 복사됨 ✓'); });
        }, 450);
      }
    }
    isPasting = false;
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


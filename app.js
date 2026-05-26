'use strict';

(function () {
  var input = document.getElementById('input');
  var output = document.getElementById('output');
  var copyBtn = document.getElementById('copyBtn');
  var clearBtn = document.getElementById('clearBtn');
  var examplesBox = document.getElementById('examples');

  var EXAMPLES = [
    '$$\\lambda(t) = \\lambda_0 + A_1 \\sin\\left(\\frac{2\\pi}{24}(t - \\phi_1)\\right)$$',
    '$$\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$',
    '$$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$',
    '$$\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$$',
    '$$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$$'
  ];

  function render() {
    output.textContent = window.LatexToHwp.convert(input.value);
  }

  input.addEventListener('input', render);

  clearBtn.addEventListener('click', function () {
    input.value = '';
    render();
    input.focus();
  });

  copyBtn.addEventListener('click', function () {
    var text = output.textContent;
    if (!text) return;
    var done = function () {
      var original = copyBtn.textContent;
      copyBtn.textContent = '복사됨!';
      setTimeout(function () { copyBtn.textContent = original; }, 1200);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallbackCopy);
    } else {
      fallbackCopy();
    }
    function fallbackCopy() {
      var ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { /* noop */ }
      document.body.removeChild(ta);
    }
  });

  EXAMPLES.forEach(function (ex) {
    var chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.textContent = ex.replace(/^\$\$|\$\$$/g, '');
    chip.addEventListener('click', function () {
      input.value = ex;
      render();
      input.focus();
    });
    examplesBox.appendChild(chip);
  });

  render();
})();

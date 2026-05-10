// ============================================================
// I Ching Divination App — UI Controller
// Depends on: iching-data.js, js/settings.js,
//             js/advice-engine.js, js/api-client.js
// ============================================================
(function() {
  'use strict';

  /* ────── Helpers ────── */
  var $ = function(sel) { return document.querySelector(sel); };
  var $$ = function(sel) { return document.querySelectorAll(sel); };

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ────── DOM references ────── */
  var dom = {
    phaseInput:    $('#phase-input'),
    phaseMethod:   $('#phase-method'),
    phaseAutoToss: $('#phase-auto-toss'),
    phaseManual:   $('#phase-manual-toss'),
    phaseResult:   $('#phase-result'),
    phaseHistory:  $('#phase-history'),

    questionInput:  $('#question-input'),
    charCount:      $('#char-count-num'),
    btnBegin:       $('#btn-begin'),
    btnBackToInput: $('#btn-back-to-input'),
    btnAuto:        $('#btn-auto'),
    btnManual:      $('#btn-manual'),
    btnUndoToss:    $('#btn-undo-toss'),
    btnRestart:     $('#btn-restart'),
    btnShowHistory: $('#btn-show-history'),
    btnBackHistory: $('#btn-back-from-history'),
    themeToggle:    $('#theme-toggle'),
    btnSettings:    $('#btn-settings'),

    // Result
    hexSymbol:            $('#hex-symbol'),
    hexName:              $('#hex-name'),
    hexEnglish:           $('#hex-english'),
    questionPreview:      $('#question-preview-result'),
    hexLinesDisplay:      $('#hex-lines-display'),
    upperTrigramLabel:    $('#upper-trigram-label'),
    lowerTrigramLabel:    $('#lower-trigram-label'),
    judgmentText:         $('#judgment-text'),
    imageText:            $('#image-text'),
    changingSection:      $('#changing-lines-section'),
    changingContent:      $('#changing-lines-content'),
    transformedSection:   $('#transformed-section'),
    transformedLines:     $('#transformed-lines-display'),
    transformedName:      $('#transformed-name'),
    transformedJudgment:  $('#transformed-judgment'),
    adviceContent:        $('#advice-content'),

    // AI section
    aiSection:       $('#ai-section'),
    aiHint:          $('#ai-hint'),
    btnAiSetup:      $('#btn-ai-setup'),
    btnInsight:      $('#btn-insight'),
    aiCard:          $('#ai-card'),
    aiContent:       $('#ai-content'),
    aiLoading:       $('#ai-loading'),
    aiError:         $('#ai-error'),
    aiErrorMsg:      $('#ai-error-msg'),
    btnAiRetry:      $('#btn-ai-retry'),

    // History
    historyList:  $('#history-list'),
    historyEmpty: $('#history-empty'),

    // Settings
    settingsOverlay:    $('#settings-overlay'),
    settingsApiKey:     $('#settings-api-key'),
    settingsBaseUrl:    $('#settings-base-url'),
    settingsModel:      $('#settings-model'),
    btnSaveSettings:    $('#btn-save-settings'),
    btnCloseSettings:   $('#btn-close-settings'),
    settingsTestResult: $('#settings-test-result'),

    // Misc
    questionPreviewMethod: $('#question-preview-method'),
    linesBuilding:    $('#lines-building'),
    tossStatus:       $('#toss-status-auto'),
    progressDots:     $('#progress-dots'),
    tossProgressLabel:$('#toss-progress-label')
  };

  var allPhases = [dom.phaseInput, dom.phaseMethod, dom.phaseAutoToss, dom.phaseManual, dom.phaseResult, dom.phaseHistory];

  /* ────── App state ────── */
  var state = {
    phase: 'input',
    question: '',
    method: null,
    lines: [],
    currentToss: 0,
    autoTimer: null,
    result: null
  };

  /* ═══════════════════════════════════════════
     Phase switching
     ═══════════════════════════════════════════ */
  function showPhase(phase) {
    allPhases.forEach(function(el) { el.classList.add('hidden'); });
    state.phase = phase;
    var map = {
      input:    dom.phaseInput,
      method:   dom.phaseMethod,
      'auto-toss': dom.phaseAutoToss,
      manual:   dom.phaseManual,
      result:   dom.phaseResult,
      history:  dom.phaseHistory
    };
    if (map[phase]) map[phase].classList.remove('hidden');
    if (phase === 'method') dom.questionPreviewMethod.textContent = '"' + state.question + '"';
    if (phase === 'history') renderHistory();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ═══════════════════════════════════════════
     Question input
     ═══════════════════════════════════════════ */
  function updateQuestionState() {
    var len = dom.questionInput.value.length;
    dom.charCount.textContent = len;
    dom.btnBegin.disabled = dom.questionInput.value.trim().length < 2;
  }

  dom.questionInput.addEventListener('input', updateQuestionState);
  dom.questionInput.addEventListener('compositionend', updateQuestionState);
  dom.questionInput.addEventListener('blur', updateQuestionState);

  dom.btnBegin.addEventListener('click', function() {
    state.question = dom.questionInput.value.trim();
    if (state.question.length < 2) return;
    showPhase('method');
  });

  dom.btnBackToInput.addEventListener('click', function() { showPhase('input'); });

  /* ═══════════════════════════════════════════
     Method choice
     ═══════════════════════════════════════════ */
  dom.btnAuto.addEventListener('click', function() {
    state.method = 'auto';
    state.lines = [];
    startAutoToss();
  });

  dom.btnManual.addEventListener('click', function() {
    state.method = 'manual';
    state.lines = [];
    state.currentToss = 0;
    showPhase('manual');
    renderManualToss();
  });

  /* ═══════════════════════════════════════════
     Auto toss
     ═══════════════════════════════════════════ */
  function startAutoToss() {
    showPhase('auto-toss');
    state.lines = [];
    state.currentToss = 0;
    dom.linesBuilding.innerHTML = '';
    dom.tossStatus.textContent = '正在投掷铜钱…';
    clearTimeout(state.autoTimer);
    tossNext();
  }

  function tossNext() {
    if (state.currentToss >= 6) { setTimeout(function() { showResult(); }, 500); return; }
    var coins = $$('#coins-anim .coin');
    coins.forEach(function(c) { c.classList.add('spinning'); });
    dom.tossStatus.textContent = '第 ' + (state.currentToss + 1) + ' 爻（共 6 爻）';
    state.autoTimer = setTimeout(function() {
      coins.forEach(function(c) { c.classList.remove('spinning'); });
      var toss = IChing.simulateCoinToss();
      state.lines.push(toss);
      addLineToDisplay(toss, state.currentToss);
      state.currentToss++;
      state.autoTimer = setTimeout(function() { tossNext(); }, 400);
    }, 600);
  }

  function addLineToDisplay(toss, index) {
    var container = dom.linesBuilding;
    var div = document.createElement('div');
    div.className = 'line-built';
    div.style.animationDelay = (index * 0.4) + 's';
    var bar = document.createElement('div');
    bar.className = 'line-bar ' + toss.lineType;
    var label = document.createElement('span');
    label.className = 'line-status';
    var typeNames = {
      'old-yang': '爻' + (index + 1) + ' 老阳 ⚊ → ⚋',
      'young-yang': '爻' + (index + 1) + ' 少阳 ⚊',
      'young-yin': '爻' + (index + 1) + ' 少阴 ⚋',
      'old-yin': '爻' + (index + 1) + ' 老阴 ⚋ → ⚊'
    };
    label.textContent = typeNames[toss.lineType] || '';
    div.appendChild(bar);
    div.appendChild(label);
    container.appendChild(div);
    div.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }

  /* ═══════════════════════════════════════════
     Manual toss
     ═══════════════════════════════════════════ */
  function renderManualToss() {
    var idx = state.currentToss;
    dom.tossProgressLabel.textContent = '第 ' + (idx + 1) + ' 爻（共 6 爻，从下往上）';
    var dots = $$('#progress-dots .dot');
    dots.forEach(function(dot, i) {
      dot.className = 'dot';
      if (i < state.lines.length) {
        var line = state.lines[i];
        if (line.lineType === 'old-yang' || line.lineType === 'old-yin') dot.classList.add('changing');
        else if (line.lineType === 'young-yang') dot.classList.add('filled-yang');
        else dot.classList.add('filled-yin');
      } else if (i === idx) { dot.classList.add('empty'); }
    });
    dom.btnUndoToss.style.display = state.lines.length > 0 ? '' : 'none';
  }

  $$('.toss-option').forEach(function(btn) {
    btn.addEventListener('click', function() {
      if (state.phase !== 'manual') return;
      var heads = parseInt(btn.dataset.heads);
      var toss = manualTossResult(heads);
      state.lines.push(toss);
      if (state.currentToss < 5) { state.currentToss++; renderManualToss(); }
      else { showResult(); }
    });
  });

  function manualTossResult(heads) {
    var value, lineType;
    if (heads === 3)      { value = 9; lineType = 'old-yang'; }
    else if (heads === 2) { value = 8; lineType = 'young-yin'; }
    else if (heads === 1) { value = 7; lineType = 'young-yang'; }
    else                  { value = 6; lineType = 'old-yin'; }
    return { heads: heads, value: value, lineType: lineType };
  }

  dom.btnUndoToss.addEventListener('click', function() {
    if (state.lines.length > 0) {
      state.lines.pop();
      state.currentToss = Math.max(0, state.currentToss - 1);
      renderManualToss();
    }
  });

  /* ═══════════════════════════════════════════
     Result display
     ═══════════════════════════════════════════ */
  function showResult() {
    clearTimeout(state.autoTimer);
    if (state.lines.length !== 6) return;
    var result = IChing.buildHexagram(state.lines);
    state.result = result;
    showPhase('result');
    renderResult(result);
  }

  function renderResult(result) {
    console.log('[iching] renderResult called, apiReady=' + IChing.Settings.isApiReady());
    try {
    var primary = result.primary;
    var changingIndices = result.changingIndices;
    var transformed = result.transformed;

    // Header
    dom.hexSymbol.textContent = String.fromCodePoint(0x4DBF + primary.number);
    dom.hexName.textContent = '第' + primary.number + '卦　' + primary.name + '（' + primary.pinyin + '）';
    dom.hexEnglish.textContent = primary.english;
    dom.questionPreview.textContent = '"' + state.question + '"';

    // Lines
    renderHexLines(dom.hexLinesDisplay, state.lines);

    // Trigram labels
    var upperTri = IChing.getTrigram(primary.upperTrigram);
    var lowerTri = IChing.getTrigram(primary.lowerTrigram);
    dom.upperTrigramLabel.textContent = upperTri.symbol + ' 上卦·' + upperTri.name + '（' + upperTri.nameEn + '）';
    dom.lowerTrigramLabel.textContent = lowerTri.symbol + ' 下卦·' + lowerTri.name + '（' + lowerTri.nameEn + '）';

    // Judgment & Image
    dom.judgmentText.textContent = primary.judgment;
    dom.imageText.textContent = primary.image;

    // Changing lines
    if (changingIndices.length > 0) {
      dom.changingSection.classList.remove('hidden');
      dom.changingContent.innerHTML = '';
      changingIndices.forEach(function(idx) {
        var lineData = primary.lines[idx];
        var div = document.createElement('div');
        div.className = 'changing-line-item';
        div.innerHTML = '<span class="line-label">第' + (idx + 1) + '爻（变爻）</span><br>' + lineData.text + '<br>' + lineData.meaning;
        dom.changingContent.appendChild(div);
      });
      if (transformed) {
        dom.transformedSection.classList.remove('hidden');
        var tLines = state.lines.map(function(l) {
          if (l.lineType === 'old-yang') return { heads: l.heads, value: l.value, lineType: 'young-yin' };
          if (l.lineType === 'old-yin') return { heads: l.heads, value: l.value, lineType: 'young-yang' };
          return { heads: l.heads, value: l.value, lineType: l.lineType };
        });
        renderHexLines(dom.transformedLines, tLines);
        dom.transformedName.textContent = '第' + transformed.number + '卦　' + transformed.name + '（' + transformed.pinyin + '）— ' + transformed.english;
        dom.transformedJudgment.textContent = transformed.judgment;
      } else {
        dom.transformedSection.classList.add('hidden');
      }
    } else {
      dom.changingSection.classList.add('hidden');
      dom.transformedSection.classList.add('hidden');
    }

    // AI section — set up FIRST so it always renders even if advice fails
    try {
      var apiReady = IChing.Settings.isApiReady();
      console.log('[iching] AI section setup, apiReady=' + apiReady);
      dom.aiSection.classList.remove('hidden');
      dom.aiHint.classList.add('hidden');
      dom.btnInsight.classList.add('hidden');
      dom.aiLoading.classList.add('hidden');
      dom.aiCard.classList.add('hidden');
      dom.aiError.classList.add('hidden');
      if (apiReady) {
        dom.btnInsight.classList.remove('hidden');
        console.log('[iching] insight button shown');
      } else {
        dom.aiHint.classList.remove('hidden');
        console.log('[iching] setup hint shown');
      }
    } catch (e) {
      console.error('[iching] AI section setup error: ' + e.message);
    }

    // Local advice (from advice-engine module)
    try {
      var advice = IChing.AdviceEngine.generate(state.question, primary, changingIndices, transformed);
      dom.adviceContent.textContent = advice;
    } catch (e) {
      console.error('[iching] advice error: ' + e.message);
      dom.adviceContent.textContent = primary.description;
    }

    // Save to history
    saveToHistory(result);

    } catch (e) {
      console.error('[iching] renderResult error: ' + e.message);
    }
  }

  function renderHexLines(container, lines) {
    container.innerHTML = '';
    for (var i = 5; i >= 0; i--) {
      var line = lines[i];
      var row = document.createElement('div');
      row.className = 'line-row';

      var num = document.createElement('span');
      num.className = 'line-number';
      num.textContent = '爻' + (i + 1);
      row.appendChild(num);

      var vis = document.createElement('div');
      var isYang = line.lineType === 'old-yang' || line.lineType === 'young-yang';
      var isChanging = line.lineType === 'old-yang' || line.lineType === 'old-yin';
      vis.className = 'line-visual ' + (isYang ? 'yang-line' : 'yin-line') + (isChanging ? ' changing-line' : '');
      row.appendChild(vis);

      var tag = document.createElement('span');
      tag.className = 'changing-tag';
      if (isChanging) tag.textContent = line.lineType === 'old-yang' ? '→ 阴' : '→ 阳';
      row.appendChild(tag);

      container.appendChild(row);
    }
  }

  /* ═══════════════════════════════════════════
     AI Insight — "启示" button + interpretation
     ═══════════════════════════════════════════ */
  dom.btnInsight.addEventListener('click', function() {
    startAiInterpretation();
  });

  dom.btnAiRetry.addEventListener('click', function() {
    startAiInterpretation();
  });

  dom.btnAiSetup.addEventListener('click', function() {
    openSettings();
  });

  function startAiInterpretation() {
    var result = state.result;
    if (!result) return;

    // Show loading, hide button + card + error
    dom.btnInsight.classList.add('hidden');
    dom.aiHint.classList.add('hidden');
    dom.aiLoading.classList.remove('hidden');
    dom.aiCard.classList.add('hidden');
    dom.aiContent.classList.add('hidden');
    dom.aiError.classList.add('hidden');

    try {
      var hexData = IChing.ApiClient.buildHexData(
        result.primary, result.transformed, result.changingIndices, state.lines
      );

      IChing.ApiClient.getInterpretation(state.question, hexData)
        .then(function(text) {
          dom.aiLoading.classList.add('hidden');
          dom.aiCard.classList.remove('hidden');
          dom.aiContent.classList.remove('hidden');
          dom.aiContent.textContent = text;
          // Save AI interpretation to latest history record
          updateLatestHistoryRecord({ aiText: text });
        })
        .catch(function(err) {
          console.error('[iching] API error: ' + err.message);
          dom.aiLoading.classList.add('hidden');
          dom.btnInsight.classList.remove('hidden');
          dom.aiError.classList.remove('hidden');
          dom.aiErrorMsg.textContent = IChing.ApiClient.errorMessage(err);
        });
    } catch (e) {
      console.error('[iching] Interpretation error: ' + e.message);
      dom.aiLoading.classList.add('hidden');
      dom.btnInsight.classList.remove('hidden');
      dom.aiError.classList.remove('hidden');
      dom.aiErrorMsg.textContent = '发生错误：' + e.message;
    }
  }

  /* ═══════════════════════════════════════════
     Settings overlay
     ═══════════════════════════════════════════ */
  var SETTINGS_TESTING = false;

  function openSettings() {
    try {
      if (dom.settingsApiKey) dom.settingsApiKey.value = IChing.Settings.get('apiKey') || '';
      if (dom.settingsBaseUrl) dom.settingsBaseUrl.value = IChing.Settings.get('baseUrl') || '';
      if (dom.settingsModel) dom.settingsModel.value = IChing.Settings.get('apiModel') || '';
    } catch (e) { /* ignore */ }
    dom.settingsTestResult.classList.add('hidden');
    SETTINGS_TESTING = false;
    dom.btnSaveSettings.textContent = '保存并测试';
    dom.btnSaveSettings.disabled = false;
    if (dom.settingsOverlay) dom.settingsOverlay.classList.remove('hidden');
  }

  function closeSettings() {
    dom.settingsOverlay.classList.add('hidden');
  }

  dom.btnSettings.addEventListener('click', openSettings);
  dom.btnCloseSettings.addEventListener('click', closeSettings);
  dom.settingsOverlay.addEventListener('click', function(e) {
    if (e.target === dom.settingsOverlay) closeSettings();
  });

  dom.btnSaveSettings.addEventListener('click', function() {
    if (SETTINGS_TESTING) return;

    var key = dom.settingsApiKey ? dom.settingsApiKey.value.trim() : '';
    var url = dom.settingsBaseUrl ? dom.settingsBaseUrl.value.trim() : '';
    var model = dom.settingsModel ? dom.settingsModel.value.trim() : '';

    if (!key || !url) {
      showTestResult(false, '请填写 API Key 和 Base URL');
      return;
    }

    // Save settings
    IChing.Settings.set('apiKey', key);
    IChing.Settings.set('baseUrl', url);
    IChing.Settings.set('apiModel', model);

    // Start test
    SETTINGS_TESTING = true;
    dom.btnSaveSettings.textContent = '测试中…';
    dom.btnSaveSettings.disabled = true;
    dom.settingsTestResult.classList.add('hidden');

    testApiConnection(key, url, model)
      .then(function() {
        showTestResult(true, '配置成功 — API 连接正常');
        SETTINGS_TESTING = false;
        dom.btnSaveSettings.textContent = '保存并测试';
        dom.btnSaveSettings.disabled = false;
        // Refresh result page if visible
        if (state.phase === 'result') {
          dom.aiHint.classList.add('hidden');
          dom.btnInsight.classList.remove('hidden');
          dom.aiError.classList.add('hidden');
        }
        setTimeout(closeSettings, 1200);
      })
      .catch(function(err) {
        showTestResult(false, '配置失败 — ' + IChing.ApiClient.errorMessage(err));
        SETTINGS_TESTING = false;
        dom.btnSaveSettings.textContent = '保存并测试';
        dom.btnSaveSettings.disabled = false;
      });
  });

  function showTestResult(ok, msg) {
    dom.settingsTestResult.classList.remove('hidden');
    dom.settingsTestResult.textContent = msg;
    dom.settingsTestResult.className = 'settings-test-result ' + (ok ? 'test-ok' : 'test-fail');
  }

  function testApiConnection(key, url, model) {
    var endpoint = url.replace(/\/+$/, '') + '/chat/completions';
    return fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + key
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'user', content: 'Hi' }
        ],
        max_tokens: 5,
        temperature: 0
      })
    }).then(function(res) {
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) throw new Error('INVALID_KEY');
        if (res.status === 429) throw new Error('RATE_LIMIT');
        if (res.status >= 500) throw new Error('SERVER_ERROR');
        throw new Error('HTTP_' + res.status);
      }
      return res.json();
    }).then(function(json) {
      if (!json.choices) throw new Error('BAD_RESPONSE');
    });
  }

  /* ═══════════════════════════════════════════
     History
     ═══════════════════════════════════════════ */
  var HISTORY_KEY = 'iching-history';
  var MAX_HISTORY = 100;

  function getHistory() {
    try {
      var raw = localStorage.getItem(HISTORY_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(function(r) {
        return r && typeof r.id === 'number' && typeof r.primaryNumber === 'number';
      });
    } catch (e) { return []; }
  }

  function updateLatestHistoryRecord(updates) {
    var history = getHistory();
    if (history.length === 0) return;
    Object.keys(updates).forEach(function(k) {
      history[0][k] = updates[k];
    });
    persistHistory(history);
  }

  function persistHistory(history) {
    if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
    var sizes = [100, 75, 50, 25, 10, 5, 3];
    for (var i = 0; i < sizes.length; i++) {
      var subset = history.slice(0, sizes[i]);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(subset));
        console.log('[iching] history saved: ' + subset.length + ' records');
        return;
      } catch (e) { /* quota exceeded, try smaller */ }
    }
    console.warn('[iching] history save failed at all sizes');
  }

  function saveToHistory(result) {
    var record = {
      id: Date.now(),
      question: state.question,
      method: state.method,
      timestamp: new Date().toISOString(),
      lines: state.lines.slice(),
      primaryNumber: result.primary.number,
      primaryName: result.primary.name,
      primaryPinyin: result.primary.pinyin,
      primaryEnglish: result.primary.english,
      hasChanging: result.changingIndices.length > 0,
      changingCount: result.changingIndices.length,
      changingIndices: result.changingIndices.slice(),
      transformedNumber: result.transformed ? result.transformed.number : null,
      transformedName: result.transformed ? result.transformed.name : null
    };
    var history = getHistory();
    history.unshift(record);
    persistHistory(history);
  }

  function renderHistory() {
    var history = getHistory();
    if (history.length === 0) {
      dom.historyList.innerHTML = '';
      dom.historyEmpty.classList.remove('hidden');
      return;
    }
    dom.historyEmpty.classList.add('hidden');
    dom.historyList.innerHTML = history.map(function(r, i) {
      var date = new Date(r.timestamp);
      var ds = date.getFullYear() + '-' + pad(date.getMonth()+1) + '-' + pad(date.getDate()) + ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes());
      var methodLabel = r.method === 'auto' ? '自动' : '手动';
      var changeInfo = r.hasChanging ? ' · ' + r.changingCount + '变爻' : '';
      return '<div class="history-item" data-index="' + i + '">' +
        '<div class="history-item-header">' +
          '<span class="history-item-question">' + escapeHtml(r.question) + '</span>' +
          '<span class="history-item-date">' + ds + '</span>' +
        '</div>' +
        '<div class="history-item-meta">' +
          '<span class="history-item-hex">第' + r.primaryNumber + '卦 ' + r.primaryName + '（' + r.primaryPinyin + '）</span>' +
          '<span>' + methodLabel + changeInfo + '</span>' +
        '</div>' +
      '</div>';
    }).join('');

    dom.historyList.querySelectorAll('.history-item').forEach(function(item) {
      item.addEventListener('click', function() {
        showHistoryDetail(parseInt(item.dataset.index));
      });
    });
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  function showHistoryDetail(index) {
    var history = getHistory();
    var record = history[index];
    if (!record) return;
    var primary = IChing.getHexagram(record.primaryNumber);
    var transformed = record.transformedNumber ? IChing.getHexagram(record.transformedNumber) : null;
    var date = new Date(record.timestamp);
    var ds = date.getFullYear() + '年' + (date.getMonth()+1) + '月' + date.getDate() + '日 ' + pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());

    var changingHtml = record.changingIndices.length > 0 ? record.changingIndices.map(function(idx) {
      var ld = primary.lines[idx];
      return '<div class="changing-line-item"><span class="line-label">第' + (idx+1) + '爻（变爻）</span><br>' + ld.text + '<br>' + ld.meaning + '</div>';
    }).join('') : '<p style="color:var(--text-muted)">此卦无变爻，为静卦。</p>';

    var transformedHtml = transformed ?
      '<div class="transformed-section"><h3>之卦</h3><div class="hexagram-display small"><div class="hex-lines"></div></div>' +
      '<p id="transformed-name">第' + transformed.number + '卦 ' + transformed.name + '（' + transformed.pinyin + '）— ' + transformed.english + '</p>' +
      '<p class="transformed-judgment">' + transformed.judgment + '</p></div>' : '';

    var overlay = document.createElement('div');
    overlay.className = 'history-detail-overlay';
    overlay.innerHTML =
      '<div class="history-detail-sheet">' +
        '<div class="result-header">' +
          '<div class="hexagram-symbol">' + String.fromCodePoint(0x4DBF + primary.number) + '</div>' +
          '<div class="hexagram-info"><h2>第' + primary.number + '卦 ' + primary.name + '（' + primary.pinyin + '）</h2><p>' + primary.english + '</p></div>' +
        '</div>' +
        '<div class="question-preview">"' + escapeHtml(record.question) + '"</div>' +
        '<p style="font-size:0.8rem;color:var(--text-muted);margin-top:0.5rem;">' + ds + ' · ' + (record.method === 'auto' ? '自动占卜' : '手动占卜') + '</p>' +
        '<div class="card result-card" style="margin-top:1rem;">' +
          '<div class="judgment-section"><h3>卦辞</h3><p class="judgment-text">' + primary.judgment + '</p></div>' +
          '<div class="divider"></div>' +
          '<div class="image-section"><h3>象传</h3><p class="image-text">' + primary.image + '</p></div>' +
          (record.changingIndices.length > 0 ? '<div class="divider"></div><h3>变爻</h3>' + changingHtml : '') +
          transformedHtml +
        '</div>' +
        '<div class="card advice-card" style="margin-top:1rem;"><h3 class="advice-title">卦象启示</h3><div class="advice-content">' + primary.description + '</div></div>' +
        (record.aiText ? '<div class="card ai-card" style="margin-top:1rem;"><h3 class="advice-title">深度启示</h3><div class="ai-content-text">' + escapeHtml(record.aiText) + '</div></div>' : '') +
        '<button class="btn btn-primary close-detail">关闭</button>' +
      '</div>';
    document.body.appendChild(overlay);

    var linesContainer = overlay.querySelector('.hex-lines');
    if (linesContainer && record.lines) {
      for (var i = 5; i >= 0; i--) {
        var line = record.lines[i];
        var row = document.createElement('div');
        row.className = 'line-row';
        var ns = document.createElement('span');
        ns.className = 'line-number';
        ns.textContent = '爻' + (i+1);
        row.appendChild(ns);
        var v = document.createElement('div');
        var iy = line.lineType === 'old-yang' || line.lineType === 'young-yang';
        var ic = line.lineType === 'old-yang' || line.lineType === 'old-yin';
        v.className = 'line-visual ' + (iy ? 'yang-line' : 'yin-line') + (ic ? ' changing-line' : '');
        row.appendChild(v);
        var t = document.createElement('span');
        t.className = 'changing-tag';
        if (ic) t.textContent = line.lineType === 'old-yang' ? '→ 阴' : '→ 阳';
        row.appendChild(t);
        linesContainer.appendChild(row);
      }
    }

    var closeBtn = overlay.querySelector('.close-detail');
    closeBtn.addEventListener('click', function() { overlay.remove(); });
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) overlay.remove();
    });
    overlay.querySelector('.history-detail-sheet').addEventListener('click', function(e) {
      if (!e.target.closest('.close-detail')) e.stopPropagation();
    });
  }

  /* ═══════════════════════════════════════════
     Theme
     ═══════════════════════════════════════════ */
  var THEME_KEY = 'iching-theme';

  function getTheme() {
    var saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (theme === 'dark') {
      document.body.classList.add('dark');
      dom.themeToggle.textContent = '☀️';
      if (meta) meta.content = '#1A1A1E';
    } else {
      document.body.classList.remove('dark');
      dom.themeToggle.textContent = '🌙';
      if (meta) meta.content = '#8B2500';
    }
  }

  dom.themeToggle.addEventListener('click', function() {
    var cur = document.body.classList.contains('dark') ? 'dark' : 'light';
    var next = cur === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  });

  /* ═══════════════════════════════════════════
     Navigation
     ═══════════════════════════════════════════ */
  dom.btnRestart.addEventListener('click', function() {
    state.question = '';
    state.method = null;
    state.lines = [];
    state.currentToss = 0;
    state.result = null;
    clearTimeout(state.autoTimer);
    dom.questionInput.value = '';
    dom.charCount.textContent = '0';
    dom.btnBegin.disabled = true;
    showPhase('input');
  });

  dom.btnShowHistory.addEventListener('click', function() { showPhase('history'); });
  dom.btnBackHistory.addEventListener('click', function() { showPhase('input'); });

  /* ═══════════════════════════════════════════
     Init
     ═══════════════════════════════════════════ */
  applyTheme(getTheme());
  showPhase('input');

  console.log('[iching] app init — modules check: ' +
    'iching=' + !!IChing +
    ' Settings=' + !!(IChing && IChing.Settings) +
    ' AdviceEngine=' + !!(IChing && IChing.AdviceEngine) +
    ' ApiClient=' + !!(IChing && IChing.ApiClient));
})();

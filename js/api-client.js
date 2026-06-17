// ============================================================
// I Ching — AI API Client (provider-agnostic)
// Calls any OpenAI-compatible chat/completions endpoint.
// ============================================================
(function() {
  'use strict';
  var ns = window.IChing || {};
  window.IChing = ns;

  var TIMEOUT_MS = 30000;

  /* ────── System prompt ────── */
  function buildSystemPrompt() {
    return [
      '你是一位精通易经的智者，也是一个善于倾听的朋友。用户通过占卜得到了卦象，向你寻求解读。',
      '',
      '请你像一个温暖、有智慧的朋友一样，根据卦象和用户的问题，给出个性化、有深度的解读。',
      '',
      '要求：',
      '1. 用自然的口吻，像朋友在聊天，不要模板化、不要像在写论文',
      '2. 必须紧密结合用户的具体问题来解读，每一个分析都要和用户的问题挂钩',
      '3. 既要让完全不懂易经的人也能听懂（大白话），也要自然地融入易经术语并解释它们的含义',
      '4. 解读要有清晰的结构但读起来要流畅：先回应用户的问题和你得到的卦象，然后分析卦象与问题的深层关联，如果有变爻要重点解读它们的含义，最后给出温暖而具体的建议',
      '5. 控制在400-600字之间，语言简洁有力，不要啰嗦',
      '6. 绝对不要说"这是AI生成的""作为AI"之类的话——你就是一位懂易经的朋友',
      '7. 体用生克、五行等术语可以用，但要紧接着用大白话解释',
      '8. 最重要的是：让用户感觉到你在认真听他的问题，你的解读是专门为他一个人写的'
    ].join('\n');
  }

  /* ────── User message with divination data ────── */
  function buildUserMessage(question, data) {
    var parts = [];
    parts.push('用户的问题是：' + question);
    parts.push('');
    parts.push('—— 占卜结果 ——');
    parts.push('本卦：第' + data.primaryNumber + '卦 ' + data.primaryName + '（' + data.primaryPinyin + '）');
    parts.push('英文名：' + data.primaryEnglish);
    parts.push('卦辞：' + data.primaryJudgment);
    parts.push('象传：' + data.primaryImage);
    parts.push('卦象描述：' + data.primaryDescription);
    parts.push('上卦：' + data.upperTrigramName);
    parts.push('下卦：' + data.lowerTrigramName);
    parts.push('体用关系：' + data.bodyUsageRelation + '（' + data.bodyUsageFortune + '）');
    parts.push('体用解释：' + data.bodyUsageExplanation);

    if (data.changingLines && data.changingLines.length > 0) {
      parts.push('');
      parts.push('变爻（共' + data.changingLines.length + '个）：');
      for (var i = 0; i < data.changingLines.length; i++) {
        var cl = data.changingLines[i];
        parts.push('  第' + cl.number + '爻（' + cl.position + '）：' + cl.text + ' —— ' + cl.meaning);
      }
    }

    if (data.transformedNumber) {
      parts.push('');
      parts.push('之卦（变卦）：第' + data.transformedNumber + '卦 ' + data.transformedName + '（' + data.transformedPinyin + '）');
      parts.push('之卦卦辞：' + data.transformedJudgment);
      parts.push('之卦描述：' + data.transformedDescription);
      if (data.transformedBodyUsageRelation) {
        parts.push('之卦体用关系：' + data.transformedBodyUsageRelation + '（' + data.transformedBodyUsageFortune + '）');
      }
    }

    parts.push('');
    parts.push('请根据以上信息，为用户做一个温暖、个性化、有深度的解读。记住要紧密结合用户的问题来展开。');
    return parts.join('\n');
  }

  /* ────── Call API ────── */
  function getInterpretation(question, hexData) {
    var key = ns.Settings.get('apiKey');
    var baseUrl = ns.Settings.get('baseUrl');
    var model = ns.Settings.get('apiModel');

    if (!key || !key.trim()) return Promise.reject(new Error('NO_API_KEY'));
    if (!baseUrl || !baseUrl.trim()) return Promise.reject(new Error('NO_BASE_URL'));

    var endpoint = baseUrl.replace(/\/+$/, '') + '/chat/completions';

    var controller = new AbortController();
    var timer = setTimeout(function() { controller.abort(); }, TIMEOUT_MS);

    return fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + key
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          { role: 'user', content: buildUserMessage(question, hexData) }
        ],
        temperature: 0.8,
        max_tokens: 1200
      }),
      signal: controller.signal
    })
    .then(function(res) {
      clearTimeout(timer);
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) return Promise.reject(new Error('INVALID_KEY'));
        if (res.status === 429) return Promise.reject(new Error('RATE_LIMIT'));
        if (res.status >= 500) return Promise.reject(new Error('SERVER_ERROR'));
        return Promise.reject(new Error('HTTP_' + res.status));
      }
      return res.json();
    })
    .then(function(json) {
      if (!json.choices || !json.choices[0] || !json.choices[0].message) {
        throw new Error('BAD_RESPONSE');
      }
      return json.choices[0].message.content;
    })
    .catch(function(err) {
      clearTimeout(timer);
      if (err.name === 'AbortError') throw new Error('TIMEOUT');
      throw err;
    });
  }

  /* ────── Build hex data payload ────── */
  function buildHexData(primary, transformed, changingIndices, stateLines) {
    var bu = ns.analyzeBodyUsage(primary.lowerTrigram, primary.upperTrigram);
    var upperTri = ns.getTrigram(primary.upperTrigram);
    var lowerTri = ns.getTrigram(primary.lowerTrigram);
    var upperElem = ns.getElement(primary.upperTrigram);
    var lowerElem = ns.getElement(primary.lowerTrigram);

    var data = {
      primaryNumber: primary.number,
      primaryName: primary.name,
      primaryPinyin: primary.pinyin,
      primaryEnglish: primary.english,
      primaryJudgment: primary.judgment,
      primaryImage: primary.image,
      primaryDescription: primary.description,
      upperTrigramName: upperTri.name + '（' + (upperElem ? upperElem.element : '?') + '）',
      lowerTrigramName: lowerTri.name + '（' + (lowerElem ? lowerElem.element : '?') + '）',
      bodyUsageRelation: bu.relationship,
      bodyUsageFortune: bu.fortune,
      bodyUsageExplanation: bu.explanation,
      changingLines: [],
      transformedNumber: null,
      transformedName: null,
      transformedPinyin: null,
      transformedJudgment: null,
      transformedDescription: null,
      transformedBodyUsageRelation: null,
      transformedBodyUsageFortune: null
    };

    if (changingIndices.length > 0) {
      var la = ns.analyzeLinePositions(changingIndices, primary.number);
      for (var i = 0; i < la.length; i++) {
        data.changingLines.push({
          number: la[i].lineNumber,
          position: la[i].position,
          text: la[i].lineText,
          meaning: la[i].lineMeaning
        });
      }
    }

    if (transformed) {
      data.transformedNumber = transformed.number;
      data.transformedName = transformed.name;
      data.transformedPinyin = transformed.pinyin;
      data.transformedJudgment = transformed.judgment;
      data.transformedDescription = transformed.description;
      var tbu = ns.analyzeBodyUsage(transformed.lowerTrigram, transformed.upperTrigram);
      data.transformedBodyUsageRelation = tbu.relationship;
      data.transformedBodyUsageFortune = tbu.fortune;
    }

    return data;
  }

  /* ────── Error messages ────── */
  function errorMessage(err) {
    var map = {
      'NO_API_KEY': '请先设置 API Key。\n点击右上角齿轮图标进行设置。',
      'NO_BASE_URL': '请先设置 Base URL。\n点击右上角齿轮图标进行设置。',
      'INVALID_KEY': 'API Key 无效或 Base URL 不匹配，请检查后重试。',
      'RATE_LIMIT': '请求过于频繁，请稍后再试。',
      'SERVER_ERROR': '服务端暂时不可用，请稍后再试。',
      'TIMEOUT': '请求超时，请检查 Base URL 和网络连接后重试。',
      'BAD_RESPONSE': '返回了无法解析的内容，请检查 Base URL 和模型名称是否正确。'
    };
    if (err.message && map[err.message]) return map[err.message];
    return '网络连接失败，请检查 Base URL 和网络后重试。';
  }

  /* ────── Public API ────── */
  ns.ApiClient = {
    getInterpretation: getInterpretation,
    buildHexData: buildHexData,
    errorMessage: errorMessage
  };
  console.log('[iching] api-client module loaded');
})();

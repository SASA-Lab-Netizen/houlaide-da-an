/* ============================================================
 * 统一同路人匹配体系 v3.0 (match-unified.js)
 * ------------------------------------------------------------
 * 目标：
 *  1. 数据真实化 —— 匹配候选人 / 匹配分数 / 统计数字全部来自
 *     真实知乎社区数据 (stories-data.js / hot-data.js)，
 *     不再使用随机数和写死的占位内容
 *  2. 交互升级 —— 五维灵魂画像雷达图、匹配算法可视化、配对揭晓动效
 *  3. 体系一致 —— 「同路人匹配」(demo) 与「灵魂匹配」(水彩场景页)
 *     共用同一套五维模型 + 雷达组件 + 视觉语言
 *
 * 挂载要求（顺序敏感）：
 *  demo 页:    index.html 内联脚本 → ui-enhancements.js → match-unified.js
 *  水彩场景页: index.html 内联脚本 → ui-enhancements.js → match-enhanced.js → match-unified.js
 *  两页均需先加载 stories-data.js (提供 window.__STORIES_DATA)
 * ============================================================ */
(function() {
  'use strict';

  /* ==========================================================
   * 0. 真实数据引擎
   * ========================================================== */
  var RealData = {
    stories: function() {
      try { return (window.__STORIES_DATA && window.__STORIES_DATA.stories) || []; }
      catch (e) { return []; }
    },
    hot: function() {
      try { return (window.__HOT_DATA && window.__HOT_DATA.items) || []; }
      catch (e) { return []; }
    },
    stats: function() {
      var list = this.stories();
      var votes = 0, comments = 0, authors = {};
      list.forEach(function(s) {
        votes += Number(s.voteUp) || 0;
        comments += Number(s.commentCount) || 0;
        if (s.author) authors[s.author] = 1;
      });
      return {
        stories: list.length,
        votes: votes,
        comments: comments,
        engagements: votes + comments,
        authors: Object.keys(authors).length
      };
    }
  };

  /* ==========================================================
   * 1. 五维模型 + 雷达图组件（两套匹配体系共用）
   *    行动力 / 感知力 / 勇气值 / 稳定性 / 共鸣度
   * ========================================================== */
  var DIMS = [
    { key: 'action',     label: '行动' },
    { key: 'insight',    label: '感知' },
    { key: 'courage',    label: '勇气' },
    { key: 'stability',  label: '稳定' },
    { key: 'resonance',  label: '共鸣' }
  ];

  // 同路人问卷 tag → 五维贡献（确定性映射，无随机）
  var TAG_DIMS = {
    transition:   { courage: 15, stability: -5 },
    explore:      { insight: 15 },
    growing:      { action: 15 },
    starting:     { stability: 15 },
    similar:      { resonance: 20 },
    mentor:       { insight: 10, stability: 10 },
    companion:    { resonance: 15, stability: 10 },
    diverse:      { insight: 15, resonance: 5 },
    career:       { action: 5 },
    study:        { insight: 5 },
    relationship: { resonance: 10 },
    self:         { insight: 10 },
    emotion:      { resonance: 25 },
    practical:    { stability: 20 },
    action:       { action: 20 },
    longterm:     { stability: 10, resonance: 10 }
  };

  // 真实故事类别 → 问卷 tag（真实数据接入匹配算法的桥梁）
  var CATEGORY_TAGS = {
    '裸辞':     ['career', 'transition', 'similar', 'emotion'],
    '考研':     ['study', 'similar', 'practical'],
    '创业':     ['career', 'action', 'practical'],
    '异地恋':   ['relationship', 'emotion', 'longterm'],
    '心理健康': ['self', 'emotion', 'longterm'],
    '职场转型': ['career', 'explore', 'practical'],
    '留学':     ['study', 'diverse', 'explore'],
    '自由职业': ['career', 'action', 'diverse'],
    '副业':     ['career', 'action', 'diverse'],
    '情感':     ['relationship', 'emotion', 'longterm']
  };

  // 真实故事类别 → 候选人五维画像（由其人生选择语义推导）
  var CATEGORY_DIMS = {
    '裸辞':     { action: 75, insight: 60, courage: 80, stability: 40, resonance: 70 },
    '考研':     { action: 55, insight: 70, courage: 60, stability: 75, resonance: 65 },
    '创业':     { action: 85, insight: 60, courage: 85, stability: 35, resonance: 60 },
    '异地恋':   { action: 50, insight: 65, courage: 55, stability: 80, resonance: 90 },
    '心理健康': { action: 45, insight: 75, courage: 60, stability: 50, resonance: 85 },
    '职场转型': { action: 70, insight: 70, courage: 65, stability: 55, resonance: 65 },
    '留学':     { action: 60, insight: 70, courage: 70, stability: 50, resonance: 55 },
    '自由职业': { action: 75, insight: 65, courage: 70, stability: 45, resonance: 60 }
  };
  var DEFAULT_DIMS = { action: 60, insight: 65, courage: 60, stability: 60, resonance: 70 };

  // 标题/正文关键词补充 tag（让匹配理由更具体）
  var KEYWORD_TAGS = [
    { kw: ['考公', '公务员'], tag: 'study' },
    { kw: ['自媒体', '博主', '短视频'], tag: 'career' },
    { kw: ['负债', '还债'], tag: 'practical' },
    { kw: ['焦虑', '抑郁', '内耗'], tag: 'self' },
    { kw: ['结婚', '婚礼', '领证'], tag: 'relationship' },
    { kw: ['留学', '海归'], tag: 'diverse' }
  ];

  // 灵魂类型 → 共鸣度（用于水彩页灵魂卡雷达第五维）
  var SOUL_RESONANCE = {
    breaker: 55, guardian: 90, chaser: 65, voyager: 60,
    builder: 55, thinker: 70, bridge: 95, phoenix: 85
  };

  function answersToDims(answers, quiz) {
    var dims = { action: 50, insight: 50, courage: 50, stability: 50, resonance: 50 };
    (answers || []).forEach(function(optIdx, qi) {
      if (optIdx === undefined || optIdx === null || !quiz || !quiz[qi]) return;
      var opt = quiz[qi].options[optIdx];
      if (!opt) return;
      var eff = TAG_DIMS[opt.tag];
      if (!eff) return;
      Object.keys(eff).forEach(function(k) { dims[k] += eff[k]; });
    });
    Object.keys(dims).forEach(function(k) {
      dims[k] = Math.max(15, Math.min(95, Math.round(dims[k])));
    });
    return dims;
  }

  function dimsForCategory(category, seed) {
    var base = CATEGORY_DIMS[category] || DEFAULT_DIMS;
    var out = {};
    var jitter = ((seed || 0) % 3) - 1; // -1/0/1，确定性微差
    DIMS.forEach(function(d) {
      out[d.key] = Math.max(20, Math.min(95, (base[d.key] || 60) + jitter * 3));
    });
    return out;
  }

  function dimSimilarity(a, b) {
    var diff = 0;
    DIMS.forEach(function(d) { diff += Math.abs((a[d.key] || 50) - (b[d.key] || 50)); });
    return 1 - diff / (DIMS.length * 100);
  }

  /* ==========================================================
   * 2. 真实候选池：从真实知乎故事构建
   * ========================================================== */
  function buildCandidatePool() {
    return RealData.stories().map(function(s, i) {
      var tags = (CATEGORY_TAGS[s.category] || ['career']).slice();
      var text = (s.title || '') + (s.kw || '');
      KEYWORD_TAGS.forEach(function(kt) {
        if (kt.kw.some(function(w) { return text.indexOf(w) > -1; }) && tags.indexOf(kt.tag) < 0) {
          tags.push(kt.tag);
        }
      });
      return {
        id: s.id,
        author: s.author || '知乎用户',
        avatar: s.avatar || '',
        title: s.title || '',
        snippet: (s.text || '').slice(0, 60).replace(/\n/g, ' '),
        url: s.url || '',
        category: s.category || '人生选择',
        voteUp: Number(s.voteUp) || 0,
        commentCount: Number(s.commentCount) || 0,
        kshan: s.kshan || '',
        tags: tags,
        dims: dimsForCategory(s.category, s.id || i)
      };
    });
  }

  function scoreCandidates(userTags, userDims) {
    var pool = buildCandidatePool();
    var scored = pool.map(function(c) {
      var overlapTags = c.tags.filter(function(t) { return userTags.indexOf(t) > -1; });
      var tagScore = overlapTags.length / Math.max(1, Math.min(userTags.length, c.tags.length));
      var dimSim = dimSimilarity(userDims, c.dims);
      // 55% 话题重合 + 45% 灵魂画像相似，完全确定性，可复算
      var score = Math.round(58 + 40 * (0.55 * tagScore + 0.45 * dimSim));
      score = Math.max(58, Math.min(98, score));
      // 匹配理由：优先真实数据点
      var reasons = [];
      var TAG_LABEL = {
        transition: '转型中', explore: '探索方向', growing: '正在路上', starting: '刚刚起步',
        similar: '经历相似', mentor: '走过你想走的路', companion: '可以并肩同行', diverse: '视角多元',
        career: '职业话题', study: '升学话题', relationship: '感情话题', self: '自我成长',
        emotion: '情绪共鸣', practical: '实战经验', action: '行动派', longterm: '长期主义'
      };
      overlapTags.slice(0, 2).forEach(function(t) {
        if (TAG_LABEL[t]) reasons.push('你们都关注「' + TAG_LABEL[t] + '」');
      });
      if (c.voteUp > 300) reasons.push('TA 的故事获得 ' + c.voteUp + ' 赞同');
      else reasons.push('TA 的故事来自真实知乎回答');
      return {
        cand: c,
        score: score,
        overlap: overlapTags,
        reason: reasons.slice(0, 2).join('，'),
        tagScore: tagScore,
        dimSim: dimSim
      };
    });
    scored.sort(function(a, b) { return b.score - a.score; });
    return scored;
  }

  /* ==========================================================
   * 3. 雷达图 SVG（共用组件）
   * ========================================================== */
  function radarSVG(values, opts) {
    opts = opts || {};
    var size = opts.size || 120;
    var hasLabels = opts.labels !== false;
    var padX = hasLabels ? 12 : 0;            // 左右留白，防止文字被裁
    var cx = size / 2, cy = size / 2 + (hasLabels ? 4 : 0);
    var R = size / 2 - (hasLabels ? 24 : 8);
    var n = DIMS.length;
    var pt = function(i, v, raw) {
      var ang = -Math.PI / 2 + i * 2 * Math.PI / n;
      var vv = raw ? v : Math.max(0, Math.min(100, v));
      var r = R * vv / 100;
      return [(cx + r * Math.cos(ang)), (cy + r * Math.sin(ang))];
    };
    var grid = '';
    [33, 66, 100].forEach(function(ring) {
      var pts = [];
      for (var i = 0; i < n; i++) { var p = pt(i, ring); pts.push(p[0].toFixed(1) + ',' + p[1].toFixed(1)); }
      grid += '<polygon points="' + pts.join(' ') + '" fill="none" stroke="rgba(0,0,0,.08)" stroke-width="1"/>';
    });
    var axes = '';
    for (var i = 0; i < n; i++) {
      var p = pt(i, 100);
      axes += '<line x1="' + cx + '" y1="' + cy + '" x2="' + p[0].toFixed(1) + '" y2="' + p[1].toFixed(1) + '" stroke="rgba(0,0,0,.06)" stroke-width="1"/>';
    }
    var labels = '';
    if (hasLabels) {
      DIMS.forEach(function(d, i) {
        var p = pt(i, 128);
        var anchor = 'middle';
        if (p[0] > cx + 2) anchor = 'start';
        else if (p[0] < cx - 2) anchor = 'end';
        labels += '<text x="' + p[0].toFixed(1) + '" y="' + (p[1] + 3).toFixed(1) + '" text-anchor="' + anchor + '" font-size="9" fill="' + (opts.labelColor || '#8590a6') + '">' + d.label + '</text>';
      });
    }
    var mkPoly = function(vals, color, fill, cls) {
      var pts = [];
      DIMS.forEach(function(d, i) { var p = pt(i, vals ? (vals[d.key] || 0) : 0); pts.push(p[0].toFixed(1) + ',' + p[1].toFixed(1)); });
      return '<polygon class="' + (cls || '') + '" points="' + pts.join(' ') + '" fill="' + fill + '" stroke="' + color + '" stroke-width="1.8" stroke-linejoin="round"/>';
    };
    var body = '';
    if (opts.compare) {
      body += mkPoly(opts.compare, opts.compareColor || '#FF6B35', opts.compareFill || 'rgba(255,107,53,.10)');
    }
    body += mkPoly(values, opts.color || '#0084FF', opts.fill || 'rgba(0,132,255,.18)', 'mu-radar-poly');
    var dots = '';
    DIMS.forEach(function(d, i) {
      var p = pt(i, values ? (values[d.key] || 0) : 0);
      dots += '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="2.2" fill="' + (opts.color || '#0084FF') + '"/>';
    });
    var legend = '';
    if (opts.legend) {
      legend = '<div class="mu-radar-legend">' +
        '<span><i style="background:' + (opts.color || '#0084FF') + '"></i>' + (opts.legendSelf || '你') + '</span>' +
        (opts.compare ? '<span><i style="background:' + (opts.compareColor || '#FF6B35') + '"></i>' + (opts.legendOther || 'TA') + '</span>' : '') +
        '</div>';
    }
    return '<div class="mu-radar-wrap">' +
      '<svg width="' + size + '" height="' + (size + (hasLabels ? 6 : 0)) + '" viewBox="0 0 ' + size + ' ' + (size + (hasLabels ? 6 : 0)) + '">' +
      grid + axes + body + dots + labels + '</svg>' + legend + '</div>';
  }

  function avatarHTML(url, name) {
    var initial = (name || '知').charAt(0);
    if (url) {
      return '<img class="mu-avatar" src="' + url.replace(/"/g, '') + '" alt="' + (name || '').replace(/</g, '') + '" ' +
        'onerror="this.outerHTML=\'<div class=&quot;mu-avatar mu-avatar-fb&quot;>' + initial + '</div>\'">';
    }
    return '<div class="mu-avatar mu-avatar-fb">' + initial + '</div>';
  }

  /* ==========================================================
   * 4. CSS
   * ========================================================== */
  var css = [
    '.mu-radar-wrap{text-align:center;}',
    '.mu-radar-legend{display:flex;justify-content:center;gap:14px;font-size:11px;color:#8590a6;margin-top:2px;}',
    '.mu-radar-legend i{display:inline-block;width:8px;height:8px;border-radius:2px;margin-right:4px;vertical-align:-1px;}',
    '.mu-avatar{width:40px;height:40px;border-radius:50%;object-fit:cover;border:2px solid #f0f7ff;box-shadow:0 2px 6px rgba(0,0,0,.08);flex-shrink:0;background:#f0f7ff;}',
    '.mu-avatar-fb{display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;color:#0084FF;}',
    '@keyframes muRadarIn{from{opacity:0;transform:scale(.5)}to{opacity:1;transform:scale(1)}}',
    '.mu-radar-poly{transform-origin:center;transform-box:fill-box;animation:muRadarIn .7s cubic-bezier(.22,1,.36,1) both;}',
    '@keyframes muCardIn{from{opacity:0;transform:translateY(26px) scale(.96)}to{opacity:1;transform:none}}',
    '.mu-reveal{animation:muCardIn .6s cubic-bezier(.22,1,.36,1) both;}',
    /* —— 算法可视化面板 —— */
    '.mu-algo-panel{display:flex;align-items:center;justify-content:center;gap:10px;background:#fff;border:1px solid #e8f0fa;border-radius:14px;padding:14px 10px 10px;margin:14px auto 6px;max-width:320px;box-shadow:0 2px 10px rgba(0,132,255,.06);}',
    '.mu-algo-col{flex:1;text-align:center;min-width:0;}',
    '.mu-algo-mid{flex-shrink:0;font-size:10px;color:#8590a6;line-height:1.6;padding:0 2px;}',
    '.mu-algo-mid b{color:#0084FF;font-size:12px;}',
    '.mu-algo-label{font-size:11px;color:#444;font-weight:600;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
    '.mu-algo-scan{display:inline-block;width:6px;height:6px;border-radius:50%;background:#0084FF;margin-right:4px;animation:muScan 1s ease infinite;}',
    '@keyframes muScan{0%,100%{opacity:.3}50%{opacity:1}}',
    /* —— 真实数据匹配结果卡 —— */
    '.mu-match-card{background:#fff;border-radius:14px;padding:16px;margin-bottom:14px;box-shadow:0 1px 3px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04);cursor:pointer;transition:transform .2s;position:relative;overflow:hidden;}',
    '.mu-match-card:active{transform:scale(.985);}',
    '.mu-match-card.match-highlight{border:2px solid #0084FF;box-shadow:0 4px 16px rgba(0,132,255,.12);}',
    '.mu-match-card.match-highlight::before{content:\'最匹配\';position:absolute;top:-1px;right:12px;background:linear-gradient(135deg,#0084FF,#0066CC);color:#fff;font-size:11px;font-weight:700;padding:3px 12px;border-radius:0 0 10px 10px;z-index:2;}',
    '.mu-mc-top{display:flex;align-items:center;gap:12px;margin-bottom:10px;}',
    '.mu-mc-title{font-size:16px;font-weight:600;color:#1a1a1a;line-height:1.5;margin-bottom:10px;}',
    '.mu-mc-radar{display:flex;justify-content:center;}',
    '.mu-mc-meta{font-size:12px;color:#8590a6;display:flex;gap:10px;margin-bottom:8px;flex-wrap:wrap;}',
    '.mu-mc-meta b{color:#0084FF;font-weight:600;}',
    '.mu-mc-actions{display:flex;gap:8px;margin-top:12px;}',
    '.mu-mc-btn{flex:1;padding:9px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;border:none;display:flex;align-items:center;justify-content:center;gap:4px;transition:transform .2s;}',
    '.mu-mc-btn:active{transform:scale(.95);}',
    '.mu-mc-btn.primary{background:linear-gradient(135deg,#0084FF,#0066CC);color:#fff;}',
    '.mu-mc-btn.secondary{background:#fff;color:#0084FF;border:1.5px solid #0084FF;}',
    /* —— 功能总览真实数据条 —— */
    '.mu-stats-row{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:8px;}',
    '.mu-stat{background:#fff;border:1px solid #eef2f7;border-radius:10px;padding:8px 4px;text-align:center;}',
    '.mu-stat-num{font-size:16px;font-weight:700;color:#0084FF;}',
    '.mu-stat-label{font-size:10px;color:#8590a6;margin-top:1px;}',
    '.mu-stats-src{font-size:10px;color:#b3c4d6;text-align:right;margin:-4px 2px 8px;}',
    '.mu-hot-real{background:linear-gradient(135deg,#f5faff,#eef5ff);border:1px solid #dbe9f7;border-radius:10px;padding:10px 12px;display:flex;align-items:center;gap:10px;cursor:pointer;margin-bottom:8px;}',
    '.mu-hot-real:active{background:#e8f4ff;}',
    '.mu-hot-real-icon{width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#0084FF,#0066CC);color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;}',
    '.mu-hot-real-body{flex:1;min-width:0;}',
    '.mu-hot-real-tag{font-size:10px;color:#0084FF;font-weight:600;letter-spacing:.5px;}',
    '.mu-hot-real-title{font-size:12px;font-weight:600;color:#1a1a1a;line-height:1.45;margin-top:2px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}',
    '.mu-real-badge{display:inline-flex;align-items:center;gap:3px;font-size:10px;color:#0084FF;background:#e8f4ff;padding:2px 8px;border-radius:8px;margin-left:6px;vertical-align:1px;}'
  ].join('\n');
  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ==========================================================
   * 5. Demo 页升级：同路人匹配（真实数据 + 算法可视化 + 配对动效）
   * ========================================================== */
  function isDemoPage() {
    return !!document.getElementById('matchResultList') &&
      !!document.querySelector('[data-page="matchLoading"]') &&
      typeof window.computeAndShowMatch === 'function';
  }

  function upgradeDemoMatch() {
    if (!isDemoPage()) return;

    // ---- 5.1 匹配 Loading 页：算法可视化 ----
    window.startMatchLoading = function() {
      var fill = document.getElementById('mqProgressFill');
      if (fill) fill.style.width = '100%';
      var userTags = (typeof quizAnswers !== 'undefined' && typeof QUIZ !== 'undefined')
        ? quizAnswers.map(function(a, i) { return QUIZ[i].options[a].tag; }) : [];
      var userDims = answersToDims(
        typeof quizAnswers !== 'undefined' ? quizAnswers : [],
        typeof QUIZ !== 'undefined' ? QUIZ : null
      );
      var pool = buildCandidatePool();

      // 步骤动画（沿用原步骤条）
      var steps = document.querySelectorAll('.ml-step');
      steps.forEach(function(s) { s.classList.remove('active'); });
      if (steps[0]) steps[0].classList.add('active');

      // 注入算法可视化面板
      var wrap = document.querySelector('[data-page="matchLoading"] .ml-wrap');
      if (wrap && !document.getElementById('muAlgoPanel')) {
        var panel = document.createElement('div');
        panel.className = 'mu-algo-panel mu-reveal';
        panel.id = 'muAlgoPanel';
        panel.innerHTML =
          '<div class="mu-algo-col">' + radarSVG(userDims, { size: 108, color: '#0084FF', fill: 'rgba(0,132,255,.16)' }) + '<div class="mu-algo-label">你的灵魂画像</div></div>' +
          '<div class="mu-algo-mid"><span class="mu-algo-scan"></span>扫描比对<br><b id="muAlgoIdx">0/' + pool.length + '</b></div>' +
          '<div class="mu-algo-col"><div id="muAlgoCandRadar">' + radarSVG(null, { size: 108, color: '#FF6B35', fill: 'rgba(255,107,53,.10)', legend: false }) + '</div><div class="mu-algo-label" id="muAlgoCandName">候选人…</div></div>';
        var stepsEl = document.getElementById('mlSteps');
        if (stepsEl && stepsEl.parentNode === wrap) wrap.insertBefore(panel, stepsEl);
        else wrap.appendChild(panel);
      }

      // 逐个扫描候选人雷达
      var idx = 0;
      var scanTimer = setInterval(function() {
        var idxEl = document.getElementById('muAlgoIdx');
        if (!idxEl || !document.getElementById('muAlgoPanel')) { clearInterval(scanTimer); return; }
        if (idx < pool.length) {
          var c = pool[idx];
          var radarBox = document.getElementById('muAlgoCandRadar');
          if (radarBox) radarBox.innerHTML = radarSVG(c.dims, { size: 108, color: '#FF6B35', fill: 'rgba(255,107,53,.10)' });
          var nameEl = document.getElementById('muAlgoCandName');
          if (nameEl) nameEl.textContent = (c.author || '候选人') + ' · ' + c.category;
          idxEl.textContent = (idx + 1) + '/' + pool.length;
          if (steps[idx]) {
            steps.forEach(function(ss) { ss.classList.remove('active'); });
            steps[idx].classList.add('active');
          }
          idx++;
        } else {
          clearInterval(scanTimer);
          window.computeAndShowMatch();
        }
      }, Math.max(320, Math.min(520, 2600 / Math.max(1, pool.length))));
    };

    // ---- 5.2 匹配计算：真实数据打分（无随机） ----
    window.computeAndShowMatch = function() {
      var userTags = (typeof quizAnswers !== 'undefined' && typeof QUIZ !== 'undefined')
        ? quizAnswers.map(function(a, i) { return QUIZ[i].options[a].tag; }) : [];
      var userDims = answersToDims(
        typeof quizAnswers !== 'undefined' ? quizAnswers : [],
        typeof QUIZ !== 'undefined' ? QUIZ : null
      );
      var scored = scoreCandidates(userTags, userDims).slice(0, 4);
      window.renderMatchResult(scored, userTags, userDims);
    };

    // ---- 5.3 匹配结果：雷达对比卡 + 配对揭晓动效 ----
    window.renderMatchResult = function(matches, userTags, userDims) {
      if (typeof navigate === 'function') navigate('matchResult');

      var stats = RealData.stats();
      var sub = document.getElementById('matchResultSub');
      if (sub) {
        sub.innerHTML =
          '匹配引擎已扫描 <b style="color:var(--c-primary);">' + stats.stories + ' 篇真实知乎故事</b><br>' +
          '基于话题重合度与灵魂画像相似度，为你找到 <b style="color:var(--c-primary);font-size:18px;">' + matches.length + ' 位</b> 同路人' +
          '<span class="mu-real-badge">✓ 真实数据</span>';
      }

      var list = document.getElementById('matchResultList');
      if (!list) return;

      list.innerHTML = matches.map(function(m, i) {
        var c = m.cand;
        var ringR = 20, circ = 2 * Math.PI * ringR;
        var offset = circ - (m.score / 100) * circ;
        var ringColor = m.score >= 85 ? '#52C41A' : m.score >= 70 ? '#0084FF' : '#FAAD14';
        var highlight = i === 0 ? 'match-highlight' : '';
        return '<div class="mu-match-card mu-reveal ' + highlight + '" style="animation-delay:' + (i * 0.14).toFixed(2) + 's" data-url="' + (c.url || '').replace(/"/g, '') + '">' +
          '<div class="mu-mc-top">' +
            '<div class="match-score-ring"><svg viewBox="0 0 48 48"><circle class="ring-bg" cx="24" cy="24" r="' + ringR + '"/><circle class="ring-fg" cx="24" cy="24" r="' + ringR + '" stroke="' + ringColor + '" stroke-dasharray="' + circ + '" stroke-dashoffset="' + offset + '"/></svg><div class="ring-num">' + m.score + '%</div></div>' +
            avatarHTML(c.avatar, c.author) +
            '<div style="flex:1;min-width:0;">' +
              '<div class="sc-author">' + c.author.replace(/</g, '') + '</div>' +
              '<div class="sc-meta">' + c.category + ' · 来自真实知乎回答</div>' +
            '</div>' +
          '</div>' +
          '<div class="mu-mc-title">' + (c.title || '').replace(/</g, '') + '</div>' +
          '<div class="mu-mc-meta"><span><b>' + c.voteUp.toLocaleString() + '</b> 赞同</span><span><b>' + c.commentCount.toLocaleString() + '</b> 评论</span></div>' +
          '<div class="mu-mc-radar">' + radarSVG(userDims, {
            size: 128, color: '#0084FF', fill: 'rgba(0,132,255,.16)',
            compare: c.dims, compareColor: '#FF6B35', compareFill: 'rgba(255,107,53,.10)',
            legend: true, legendSelf: '你的画像', legendOther: c.author.length > 6 ? 'TA' : c.author
          }) + '</div>' +
          '<div class="match-reason">' + (m.reason || '经历时间线相似') + '</div>' +
          '<div class="mu-mc-actions">' +
            '<button class="mu-mc-btn primary" onclick="event.stopPropagation();window.open(this.closest(\'.mu-match-card\').getAttribute(\'data-url\'),\'_blank\')">读 TA 的知乎原文 →</button>' +
            '<button class="mu-mc-btn secondary" onclick="event.stopPropagation();showToast(\'已收藏 TA 的故事\')">收藏</button>' +
          '</div>' +
        '</div>';
      }).join('');

      // 保持 campaign bridge 兼容
      var redirectBtn = document.getElementById('matchRedirectBtn');
      var shouldRedirect = false;
      try { shouldRedirect = typeof redirectAfterMatch !== 'undefined' && !!redirectAfterMatch; } catch (e) {}
      if (redirectBtn) redirectBtn.style.display = shouldRedirect ? 'block' : 'none';
    };
  }

  /* ==========================================================
   * 6. 水彩场景页升级：灵魂卡雷达化 + 真实统计
   * ========================================================== */
  function isSoulPage() {
    return !!document.getElementById('soulCard');
  }

  function realNumber(n) { return Number(n).toLocaleString('en-US'); }

  function patchSoulPage() {
    if (!isSoulPage()) return;
    var stats = RealData.stats();
    if (!stats.stories) return;

    // 6.1 灵魂卡：维度条 → 五维雷达（监听 .show 出现）
    var soulCard = document.getElementById('soulCard');
    var lastApplied = 0;
    var observer = new MutationObserver(function() {
      if (!soulCard.classList.contains('show')) return;
      var now = Date.now();
      if (now - lastApplied < 600) return;
      lastApplied = now;

      // 读取 match-enhanced 填充的 4 维值
      var dims = { action: 50, insight: 50, courage: 50, stability: 50, resonance: 60 };
      var valMap = { Action: 'action', Insight: 'insight', Courage: 'courage', Stability: 'stability' };
      Object.keys(valMap).forEach(function(id) {
        var el = document.getElementById('val' + id);
        var v = el ? parseInt(el.textContent, 10) : NaN;
        if (!isNaN(v)) dims[valMap[id]] = v;
      });
      // 第五维：由灵魂类型推导
      var typeName = (document.getElementById('scTypeName') || {}).textContent || '';
      var RESO_BY_NAME = {
        '破局者': 55, '守望者': 90, '追光者': 65, '航行者': 60,
        '筑梦者': 55, '思辨者': 70, '连接者': 95, '重生者': 85
      };
      dims.resonance = RESO_BY_NAME[typeName.trim()] || 65;

      // 隐藏四条维度条，注入雷达
      var dimsBox = document.getElementById('scDims');
      if (dimsBox && !document.getElementById('muSoulRadar')) {
        dimsBox.style.display = 'none';
        var radarBox = document.createElement('div');
        radarBox.id = 'muSoulRadar';
        radarBox.innerHTML = radarSVG(dims, {
          size: 150, color: '#fff5a7', fill: 'rgba(255,245,167,.14)',
          labelColor: 'rgba(255,255,255,.55)'
        });
        dimsBox.parentNode.insertBefore(radarBox, dimsBox);
      }

      // 匹配数真实化
      var numEl = document.getElementById('scMatchNum');
      if (numEl) {
        numEl.textContent = realNumber(stats.engagements);
        var labelEl = numEl.parentNode && numEl.parentNode.querySelector('.sc-match-label');
        if (labelEl) labelEl.textContent = '次真实赞同与评论 · 来自 ' + stats.stories + ' 篇真实故事';
      }
    });
    observer.observe(soulCard, { attributes: true, attributeFilter: ['class'], subtree: false });

    // 6.2 页脚统计：假计数 → 真实计数
    var footStats = document.querySelectorAll('.footer-stats .fs');
    if (footStats.length >= 3) {
      var real = [
        { n: stats.stories, label: '真实故事' },
        { n: stats.votes, label: '真实赞同' },
        { n: stats.comments, label: '真实评论' }
      ];
      footStats.forEach(function(fs, i) {
        if (!real[i]) return;
        var num = fs.querySelector('.n');
        var lab = fs.querySelector('.l');
        if (num) {
          num.setAttribute('data-count', real[i].n);
          num.textContent = realNumber(real[i].n);
        }
        if (lab) lab.textContent = real[i].label;
      });
    }

    // 6.3 页脚品牌文案真实化
    var brand = document.querySelector('.footer-brand p');
    if (brand) {
      brand.innerHTML = '「后来的答案」灵魂匹配局<br>你的后来，也是别人的光<br>' +
        realNumber(stats.engagements) + ' 次真实共鸣，来自知乎社区';
    }
  }

  /* ==========================================================
   * 7. Demo 页功能总览：真实数据仪表条 + 真实热榜卡
   * ========================================================== */
  function patchDashboard() {
    var dash = document.querySelector('.dashboard');
    if (!dash || document.getElementById('muStatsRow')) return;
    var stats = RealData.stats();
    if (!stats.stories) return;

    // 真实统计条
    var row = document.createElement('div');
    row.className = 'mu-stats-row mu-reveal';
    row.id = 'muStatsRow';
    row.innerHTML =
      '<div class="mu-stat"><div class="mu-stat-num">' + stats.stories + '</div><div class="mu-stat-label">真实故事</div></div>' +
      '<div class="mu-stat"><div class="mu-stat-num">' + realNumber(stats.votes) + '</div><div class="mu-stat-label">真实赞同</div></div>' +
      '<div class="mu-stat"><div class="mu-stat-num">' + realNumber(stats.comments) + '</div><div class="mu-stat-label">真实评论</div></div>';
    var src = document.createElement('div');
    src.className = 'mu-stats-src';
    src.textContent = '✓ 数据来自知乎社区真实抓取';
    var grid = dash.querySelector('.dashboard-grid');
    if (grid) {
      grid.parentNode.insertBefore(row, grid.nextSibling);
      row.parentNode.insertBefore(src, row.nextSibling);
    }

    // 真实热榜卡（插在智慧豆条之后）
    var hot = (RealData.hot()[0]) || null;
    if (hot && hot.Url) {
      var hotCard = document.createElement('div');
      hotCard.className = 'mu-hot-real mu-reveal';
      hotCard.innerHTML =
        '<div class="mu-hot-real-icon">热</div>' +
        '<div class="mu-hot-real-body">' +
          '<div class="mu-hot-real-tag">知乎热榜 · 实时</div>' +
          '<div class="mu-hot-real-title">' + String(hot.Title || '').replace(/</g, '') + '</div>' +
        '</div>' +
        '<div style="color:#8590a6;font-size:16px;flex-shrink:0;">›</div>';
      hotCard.onclick = function() { window.open(hot.Url, '_blank'); };
      var dashHot = dash.querySelector('.dash-hot');
      if (dashHot) dashHot.parentNode.insertBefore(hotCard, dashHot.nextSibling);
    }
  }

  /* ==========================================================
   * 8. 初始化
   * ========================================================== */
  function init() {
    upgradeDemoMatch();   // 同路人匹配：真实数据 + 算法可视化 + 配对动效
    patchSoulPage();      // 灵魂匹配：雷达化 + 真实统计
    patchDashboard();     // 功能总览：真实数据条 + 真实热榜
    console.log('%c 🔗 统一同路人匹配体系 v3.0 已启动（真实数据驱动）',
      'color:#0084FF;font-size:12px');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

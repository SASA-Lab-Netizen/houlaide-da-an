/* ============================================================
 * 灵魂匹配局 增强模块 v2.0
 * 6题深度问卷 + 8种灵魂类型 + 灵魂卡片 + 动画交互
 * 独立注入，不修改原始代码结构
 * ============================================================ */

(function() {
  'use strict';

  // ============================================================
  // 1. CSS 注入
  // ============================================================
  const style = document.createElement('style');
  style.textContent = `
  /* ============ 灵魂匹配局 增强样式 ============ */
  .match-modal{max-width:420px !important;max-height:90vh;overflow-y:auto;scrollbar-width:thin;scrollbar-color:rgba(255,245,167,.3) transparent}
  .match-modal::-webkit-scrollbar{width:4px}
  .match-modal::-webkit-scrollbar-thumb{background:rgba(255,245,167,.3);border-radius:2px}

  /* 问卷进度指示器 */
  .quiz-progress{display:flex;gap:6px;justify-content:center;margin-bottom:18px;padding:0 4px}
  .qp-dot{flex:1;height:4px;background:rgba(255,255,255,.1);border-radius:2px;transition:all .4s cubic-bezier(.22,1,.36,1);position:relative;overflow:hidden}
  .qp-dot.done{background:linear-gradient(90deg,#fff5a7,#ff9800)}
  .qp-dot.active{background:rgba(255,245,167,.3)}
  .qp-dot.active::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,#fff5a7,transparent);animation:qpShine 1.5s linear infinite}
  @keyframes qpShine{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}

  /* 问题容器动画 */
  .match-q{transition:all .4s cubic-bezier(.22,1,.36,1)}
  .match-q.q-enter{opacity:0;transform:translateX(30px)}
  .match-q.q-exit{opacity:0;transform:translateX(-30px)}
  .match-q.q-active{opacity:1;transform:translateX(0)}

  /* 选项增强 */
  .match-opt{position:relative;overflow:hidden;transition:all .25s cubic-bezier(.22,1,.36,1)}
  .match-opt::before{content:'';position:absolute;left:0;top:0;bottom:0;width:0;background:linear-gradient(90deg,rgba(255,245,167,.15),transparent);transition:width .3s}
  .match-opt:hover::before{width:100%}
  .match-opt .opt-icon{display:inline-block;margin-right:8px;font-size:14px;opacity:.5;transition:opacity .25s}
  .match-opt:hover .opt-icon{opacity:1}
  .match-opt.selected{background:rgba(255,245,167,.18) !important;border-color:rgba(255,245,167,.5) !important;color:rgba(255,245,167,1) !important;box-shadow:0 0 20px rgba(255,245,167,.15)}
  .match-opt.selected .opt-icon{opacity:1}

  /* 选项点击粒子 */
  .opt-particle{position:absolute;pointer-events:none;width:4px;height:4px;border-radius:50%;background:#fff5a7;animation:optParticle .6s ease-out forwards}
  @keyframes optParticle{0%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(0) translate(var(--tx),var(--ty))}}

  /* 灵魂卡片样式 */
  .soul-card{display:none}
  .soul-card.show{display:block;animation:soulReveal .8s cubic-bezier(.22,1,.36,1)}
  @keyframes soulReveal{0%{opacity:0;transform:scale(.85) translateY(20px)}100%{opacity:1;transform:scale(1) translateY(0)}}

  .sc-glow{position:absolute;top:-40%;left:50%;transform:translateX(-50%);width:200px;height:200px;border-radius:50%;filter:blur(40px);opacity:.3;animation:scGlow 3s ease-in-out infinite}
  @keyframes scGlow{0%,100%{opacity:.2;transform:translateX(-50%) scale(1)}50%{opacity:.4;transform:translateX(-50%) scale(1.2)}}

  .sc-icon-wrap{display:flex;justify-content:center;margin-bottom:12px;position:relative}
  .sc-icon-circle{width:72px;height:72px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:36px;background:linear-gradient(135deg,rgba(255,245,167,.15),rgba(255,224,101,.08));border:2px solid rgba(255,245,167,.3);box-shadow:0 4px 25px rgba(255,245,167,.2);animation:scIconFloat 3s ease-in-out infinite}
  @keyframes scIconFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}

  .sc-type-name{font-size:22px;font-weight:800;color:#fff5a7;text-align:center;margin-bottom:4px;letter-spacing:2px}
  .sc-type-tag{font-size:11px;color:rgba(255,255,255,.4);text-align:center;margin-bottom:14px;letter-spacing:1px}

  .sc-dims{display:flex;gap:8px;margin-bottom:14px}
  .sc-dim{flex:1;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:10px 8px;text-align:center}
  .sc-dim-label{font-size:10px;color:rgba(255,255,255,.5);margin-bottom:4px}
  .sc-dim-bar{height:4px;background:rgba(255,255,255,.08);border-radius:2px;overflow:hidden;margin-bottom:4px}
  .sc-dim-fill{height:100%;border-radius:2px;transition:width 1s cubic-bezier(.22,1,.36,1)}
  .sc-dim-val{font-size:11px;font-weight:700;color:#fff5a7}

  .sc-kshan{background:linear-gradient(135deg,rgba(255,245,167,.1),rgba(255,224,101,.04));border:1px solid rgba(255,245,167,.2);border-radius:12px;padding:12px 14px;margin-bottom:14px;display:flex;gap:10px;align-items:flex-start}
  .sc-kshan-avatar{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#fff5a7,#ff9800);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
  .sc-kshan-text{flex:1;font-size:12px;color:rgba(255,255,255,.8);line-height:1.6}

  .sc-match-info{background:rgba(255,255,255,.05);border-radius:10px;padding:10px 12px;margin-bottom:14px;text-align:center}
  .sc-match-num{font-size:20px;font-weight:800;color:#fff5a7}
  .sc-match-label{font-size:11px;color:rgba(255,255,255,.5);margin-top:2px}

  .sc-actions{display:flex;gap:8px}
  .sc-btn{flex:1;padding:10px;border:none;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;transition:all .25s}
  .sc-btn-primary{background:linear-gradient(135deg,#fff5a7,#ff9800);color:#1a1a2e}
  .sc-btn-primary:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(255,245,167,.3)}
  .sc-btn-secondary{background:rgba(255,255,255,.08);color:rgba(255,255,255,.7);border:1px solid rgba(255,255,255,.1)}
  .sc-btn-secondary:hover{background:rgba(255,245,167,.1);color:#fff5a7;border-color:rgba(255,245,167,.3)}

  /* 结果区域粒子 */
  .soul-particle{position:absolute;pointer-events:none;border-radius:50%;animation:soulParticle 1.5s ease-out forwards}
  @keyframes soulParticle{0%{opacity:1;transform:scale(1) translate(0,0)}100%{opacity:0;transform:scale(0) translate(var(--tx),var(--ty))}}

  /* 灵魂类型标签 */
  .soul-tag{display:inline-block;padding:2px 10px;border-radius:12px;font-size:10px;font-weight:600;letter-spacing:1px}

  /* 深度模式切换 */
  .match-mode-tabs{display:flex;gap:4px;margin-bottom:12px;background:rgba(255,255,255,.05);padding:3px;border-radius:10px}
  .mmt-btn{flex:1;padding:7px;border:none;border-radius:8px;background:transparent;color:rgba(255,255,255,.5);font-size:11px;font-weight:600;cursor:pointer;transition:all .25s}
  .mmt-btn.active{background:linear-gradient(135deg,rgba(255,245,167,.2),rgba(255,224,101,.1));color:#fff5a7}

  /* 卡片3D翻转效果 */
  .sc-flip-container{perspective:1000px}
  .sc-flip-card{position:relative;width:100%;transform-style:preserve-3d;transition:transform .8s cubic-bezier(.22,1,.36,1)}
  .sc-flip-card.flipped{transform:rotateY(180deg)}
  `;
  document.head.appendChild(style);

  // ============================================================
  // 2. 灵魂类型定义（8种）
  // ============================================================
  const SOUL_TYPES = {
    breaker: {
      name: '破局者',
      tag: 'The Breaker',
      icon: '⚡',
      color: '#ff6b6b',
      color2: '#ee5a24',
      desc: '你天生不安分，总想打破现状。别人看到的是风险，你看到的是机会。你的每一个"不"都是对平庸的拒绝。',
      kshan: '我见过太多破局者了。你们最大的敌人不是失败，是犹豫。辞了就辞了，闯了就闯了——你的后来，不会差。',
      traits: ['行动力爆表', '不怕重来', '偶尔冲动'],
      dims: { action: 85, insight: 55, courage: 90, stability: 25 }
    },
    guardian: {
      name: '守望者',
      tag: 'The Guardian',
      icon: '🛡️',
      color: '#448aff',
      color2: '#2962ff',
      desc: '你珍视每一段关系，愿意为在乎的人坚持。你相信时间会给出答案，而你的耐心，就是最大的力量。',
      kshan: '守望者最不容易被看见，但你们撑起了很多人。异地、等待、坚持——你的后来，是别人羡慕的"还在"。',
      traits: ['坚韧持久', '重情重义', '擅长等待'],
      dims: { action: 50, insight: 70, courage: 60, stability: 85 }
    },
    chaser: {
      name: '追光者',
      tag: 'The Chaser',
      icon: '🌟',
      color: '#fff5a7',
      color2: '#ffd32a',
      desc: '你永远在追一个"更好的自己"。不是为了证明什么，就是觉得前方有光。你的追求本身就是答案。',
      kshan: '追光者最让我心疼也最让我敬佩。你们总觉得自己不够好，但其实你追光的样子，已经就是光了。',
      traits: ['永远向上', '自我驱动', '偶尔焦虑'],
      dims: { action: 75, insight: 80, courage: 70, stability: 40 }
    },
    voyager: {
      name: '航行者',
      tag: 'The Voyager',
      icon: '🧭',
      color: '#64b5f6',
      color2: '#2196f3',
      desc: '你不怕走远路，因为你知道人生不是直线。你愿意绕路、愿意试错，因为每一段弯路都是风景。',
      kshan: '航行者最自由也最孤独。你的路没有模板，但正是这种"没有模板"，让你活出了别人模仿不来的后来。',
      traits: ['独立思考', '拥抱不确定', '享受过程'],
      dims: { action: 70, insight: 75, courage: 80, stability: 35 }
    },
    builder: {
      name: '筑梦者',
      tag: 'The Builder',
      icon: '🔥',
      color: '#ff9800',
      color2: '#e65100',
      desc: '你天生就是做事业的人。别人看到的是困难，你看到的是还没解决的问题。你的字典里没有"不可能"。',
      kshan: '筑梦者注定要走一条很窄的路。失败、负债、重来——但你每次跌倒爬起来的姿势，都比上一次好看。',
      traits: ['创业基因', '解决问题', '百折不挠'],
      dims: { action: 90, insight: 65, courage: 85, stability: 30 }
    },
    thinker: {
      name: '思辨者',
      tag: 'The Thinker',
      icon: '📚',
      color: '#ce93d8',
      color2: '#8e24aa',
      desc: '你总在想"为什么"。不是因为犹豫，而是因为你尊重每一个选择。你的深思熟虑，是你最温柔的勇气。',
      kshan: '思辨者最容易陷入内耗，但也最容易想通。你考研、你退学、你纠结——这些都是你在认真对待人生。',
      traits: ['深度思考', '追求本质', '偶尔内耗'],
      dims: { action: 45, insight: 90, courage: 55, stability: 60 }
    },
    bridge: {
      name: '连接者',
      tag: 'The Bridge',
      icon: '🌈',
      color: '#81c784',
      color2: '#43a047',
      desc: '你是那种"先看看别人怎么走"的人。不是从众，而是你相信每个人的后来都是一面镜子。你善于借光。',
      kshan: '连接者最聪明。你们不蛮干，先看别人的后来再做决定。来这里的847位同路人，就是为你准备的答案。',
      traits: ['善于借鉴', '规避风险', '温暖共情'],
      dims: { action: 55, insight: 85, courage: 50, stability: 75 }
    },
    phoenix: {
      name: '重生者',
      tag: 'The Phoenix',
      icon: '🦅',
      color: '#ffb74d',
      color2: '#f57c00',
      desc: '你经历过低谷，甚至跌到过谷底。但正因如此，你比谁都懂"后来"的意义。你的重生，就是最好的答案。',
      kshan: '重生者是我最敬重的。你们见过最暗的夜，所以最懂晨光。你正在经历的纠结，不过是下一次起飞前的蹲。',
      traits: ['触底反弹', '韧性极强', '珍惜当下'],
      dims: { action: 65, insight: 80, courage: 85, stability: 50 }
    }
  };

  // ============================================================
  // 3. 增强版问卷数据（6题）
  // ============================================================
  const ENHANCED_QUIZ = [
    {
      q: '此刻最让你纠结的是什么？',
      hint: '没有标准答案，跟着直觉走',
      opts: [
        { text: '想走但还没走', icon: '🏃', dims: { breaker: 3, voyager: 2, chaser: 1 } },
        { text: '在纠结要不要回头', icon: '🔄', dims: { thinker: 3, bridge: 2, guardian: 1 } },
        { text: '不知道路在哪', icon: '🌫️', dims: { voyager: 2, thinker: 2, chaser: 2 } },
        { text: '走了一半想放弃', icon: '🪨', dims: { phoenix: 3, breaker: 2, guardian: 1 } }
      ]
    },
    {
      q: '深夜睡不着时，你在想什么？',
      hint: '选最真实的那个',
      opts: [
        { text: '要不要现在就动手', icon: '💪', dims: { breaker: 3, builder: 2, chaser: 1 } },
        { text: '这条路对不对', icon: '🤔', dims: { thinker: 3, bridge: 2, voyager: 1 } },
        { text: '那个人还好吗', icon: '💭', dims: { guardian: 3, bridge: 1, thinker: 1 } },
        { text: '上次失败教训', icon: '📉', dims: { phoenix: 3, builder: 2, breaker: 1 } }
      ]
    },
    {
      q: '如果时间可以倒流，你最想？',
      hint: '这题揭示你的核心驱动',
      opts: [
        { text: '更早做那个决定', icon: '⚡', dims: { breaker: 3, chaser: 2, phoenix: 1 } },
        { text: '多看看别人的路', icon: '🔍', dims: { bridge: 3, thinker: 2, voyager: 1 } },
        { text: '对那个人再好一点', icon: '💛', dims: { guardian: 3, bridge: 2, thinker: 1 } },
        { text: '不走那条弯路', icon: '🛤️', dims: { thinker: 2, builder: 2, phoenix: 2 } }
      ]
    },
    {
      q: '你觉得"后来"两个字，更像？',
      hint: '直觉选，别想太多',
      opts: [
        { text: '一场冒险', icon: '🗺️', dims: { voyager: 3, breaker: 2, builder: 1 } },
        { text: '一面镜子', icon: '🪞', dims: { bridge: 3, thinker: 2, guardian: 1 } },
        { text: '一封情书', icon: '💌', dims: { guardian: 3, phoenix: 1, chaser: 1 } },
        { text: '一份答案', icon: '📋', dims: { thinker: 3, chaser: 2, builder: 1 } }
      ]
    },
    {
      q: '你做事的方式更接近？',
      hint: '没有好坏，只有不同',
      opts: [
        { text: '先干了再说', icon: '🔥', dims: { breaker: 3, builder: 2, voyager: 1 } },
        { text: '想清楚再动', icon: '🧊', dims: { thinker: 3, bridge: 2, guardian: 1 } },
        { text: '边走边调整', icon: '🌊', dims: { voyager: 3, phoenix: 2, chaser: 1 } },
        { text: '看看别人怎么做', icon: '👀', dims: { bridge: 3, guardian: 2, thinker: 1 } }
      ]
    },
    {
      q: '你最害怕的"后来"是？',
      hint: '最后一步了，深呼吸',
      opts: [
        { text: '原地踏步', icon: '⛔', dims: { chaser: 3, breaker: 2, builder: 1 } },
        { text: '后悔没试过', icon: '😢', dims: { breaker: 2, voyager: 2, phoenix: 2 } },
        { text: '走散了重要的人', icon: '💔', dims: { guardian: 3, bridge: 2, thinker: 1 } },
        { text: '什么都没想清楚', icon: '❓', dims: { thinker: 3, bridge: 2, chaser: 1 } }
      ]
    }
  ];

  // ============================================================
  // 4. 灵魂类型计算引擎
  // ============================================================
  const SoulEngine = {
    calculate(userDims) {
      const typeScores = {};
      Object.keys(SOUL_TYPES).forEach(type => {
        const t = SOUL_TYPES[type];
        let score = 0;
        Object.keys(userDims).forEach(dim => {
          const userVal = userDims[dim] || 0;
          const typeVal = t.dims[dim] || 0;
          score += Math.max(0, 100 - Math.abs(userVal - typeVal) * 1.5);
        });
        typeScores[type] = Math.floor(score / 4);
      });

      const sorted = Object.entries(typeScores).sort((a, b) => b[1] - a[1]);
      return {
        primary: sorted[0][0],
        primaryScore: sorted[0][1],
        secondary: sorted[1][0],
        secondaryScore: sorted[1][1],
        allScores: typeScores
      };
    },

    getUserDims(answers) {
      const dims = { action: 50, insight: 50, courage: 50, stability: 50 };
      const dimMap = {
        breaker: { action: 1, courage: 1, stability: -0.5 },
        guardian: { stability: 1, courage: 0.5, action: -0.3 },
        chaser: { action: 0.8, insight: 0.5, stability: -0.5 },
        voyager: { action: 0.6, courage: 0.8, stability: -0.5 },
        builder: { action: 1, courage: 0.8, stability: -0.3 },
        thinker: { insight: 1, stability: 0.5, action: -0.5 },
        bridge: { insight: 0.8, stability: 0.7, courage: -0.3 },
        phoenix: { courage: 1, insight: 0.7, action: 0.5 }
      };

      answers.forEach(a => {
        if (!a || !a.dims) return;
        Object.entries(a.dims).forEach(([type, weight]) => {
          const effect = dimMap[type];
          if (effect) {
            Object.entries(effect).forEach(([dim, mult]) => {
              dims[dim] += weight * mult * 10;
            });
          }
        });
      });

      Object.keys(dims).forEach(k => {
        dims[k] = Math.max(10, Math.min(95, Math.round(dims[k])));
      });
      return dims;
    },

    getMatchCount(type) {
      const counts = {
        breaker: 1247, guardian: 892, chaser: 1056, voyager: 734,
        builder: 568, thinker: 983, bridge: 1156, phoenix: 847
      };
      return counts[type] || 847;
    },

    getMatchedStories(type) {
      const storyMap = {
        breaker: [1, 2], guardian: [4], chaser: [2, 1], voyager: [1, 3],
        builder: [3], thinker: [2], bridge: [4, 1], phoenix: [3, 1]
      };
      return storyMap[type] || [1, 2, 3, 4];
    }
  };

  // ============================================================
  // 5. 替换匹配弹窗HTML
  // ============================================================
  function injectEnhancedModal() {
    const oldModal = document.getElementById('matchModal');
    if (!oldModal) return;

    const newModal = document.createElement('div');
    newModal.className = 'match-overlay-modal';
    newModal.id = 'matchModal';
    newModal.onclick = function(e) { if (e.target === this) closeMatch(); };
    newModal.innerHTML = `
      <div class="match-modal">
        <div class="sc-glow" id="soulGlow" style="background:radial-gradient(circle,rgba(255,245,167,.3),transparent)"></div>
        <button class="match-close" onclick="closeMatch()">x</button>

        <!-- 问卷区 -->
        <div class="match-quiz" id="matchQuiz">
          <h3>灵魂<span class="ac">匹配局</span></h3>
          <div class="sub" id="quizSub">回答6道题，找到和你做同样选择的人</div>

          <!-- 进度指示器 -->
          <div class="quiz-progress" id="quizProgress"></div>

          <!-- 问题容器 -->
          <div class="match-q q-active" id="questionContainer">
            <div class="q-num" id="qNum">问题 1/6</div>
            <div class="q-text" id="qText"></div>
            <div class="q-hint" id="qHint" style="font-size:11px;color:rgba(255,245,167,.4);margin-bottom:10px;font-style:italic"></div>
            <div class="match-opts" id="matchOpts"></div>
          </div>
        </div>

        <!-- 灵魂卡片结果区 -->
        <div class="soul-card" id="soulCard">
          <div class="sc-icon-wrap">
            <div class="sc-icon-circle" id="scIcon">⭐</div>
          </div>
          <div class="sc-type-name" id="scTypeName">你的灵魂类型</div>
          <div class="sc-type-tag" id="scTypeTag">Soul Type</div>
          <div style="font-size:12px;color:rgba(255,255,255,.65);line-height:1.7;text-align:center;margin-bottom:12px;padding:0 4px" id="scDesc"></div>
          <div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-bottom:14px" id="scTraits"></div>

          <div class="sc-dims" id="scDims">
            <div class="sc-dim">
              <div class="sc-dim-label">行动力</div>
              <div class="sc-dim-bar"><div class="sc-dim-fill" id="dimAction" style="background:#ff6b6b;width:0%"></div></div>
              <div class="sc-dim-val" id="valAction">--</div>
            </div>
            <div class="sc-dim">
              <div class="sc-dim-label">感知力</div>
              <div class="sc-dim-bar"><div class="sc-dim-fill" id="dimInsight" style="background:#64b5f6;width:0%"></div></div>
              <div class="sc-dim-val" id="valInsight">--</div>
            </div>
            <div class="sc-dim">
              <div class="sc-dim-label">勇气值</div>
              <div class="sc-dim-bar"><div class="sc-dim-fill" id="dimCourage" style="background:#ff9800;width:0%"></div></div>
              <div class="sc-dim-val" id="valCourage">--</div>
            </div>
            <div class="sc-dim">
              <div class="sc-dim-label">稳定性</div>
              <div class="sc-dim-bar"><div class="sc-dim-fill" id="dimStability" style="background:#81c784;width:0%"></div></div>
              <div class="sc-dim-val" id="valStability">--</div>
            </div>
          </div>

          <div class="sc-match-info">
            <div class="sc-match-num" id="scMatchNum">847</div>
            <div class="sc-match-label">位同路人正在等你</div>
          </div>

          <div class="sc-kshan">
            <div class="sc-kshan-avatar">🦊</div>
            <div class="sc-kshan-text" id="scKshanText">看山正在解读你的灵魂...</div>
          </div>

          <div class="sc-actions">
            <button class="sc-btn sc-btn-primary" id="scViewStories">看看他们的后来 →</button>
            <button class="sc-btn sc-btn-secondary" id="scRetry">再测一次</button>
          </div>
        </div>

        <!-- 旧结果区（保留兼容） -->
        <div class="match-result" id="matchResult" style="display:none">
          <div class="r-icon"><svg width="48" height="48" viewBox="0 0 48 48" fill="none"><path d="M24 4 L26 18 L40 20 L26 22 L24 36 L22 22 L8 20 L22 18 Z" fill="rgba(255,245,167,.6)"></path><circle cx="24" cy="24" r="3" fill="rgba(255,245,167,.9)"></circle></svg></div>
          <h4>已为你匹配到 <span style="color:var(--star)">847</span> 位同路人</h4>
          <p>他们做了和你一样的选择<br>他们后来的故事，就是你现在最想知道的答案</p>
          <button class="footer-btn" onclick="closeMatch();setTimeout(()=>bridgeToDemo('timeline'),250)">查看他们的后来 →</button>
        </div>
      </div>
    `;

    oldModal.parentNode.replaceChild(newModal, oldModal);
  }

  // ============================================================
  // 6. 覆写问卷逻辑
  // ============================================================
  let enhancedQStep = 0;
  let enhancedAnswers = [];
  let isTransitioning = false;

  function renderProgressDots() {
    const container = document.getElementById('quizProgress');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < ENHANCED_QUIZ.length; i++) {
      const dot = document.createElement('div');
      dot.className = 'qp-dot';
      if (i < enhancedQStep) dot.classList.add('done');
      else if (i === enhancedQStep) dot.classList.add('active');
      container.appendChild(dot);
    }
  }

  function renderEnhancedQuestion() {
    const data = ENHANCED_QUIZ[enhancedQStep];
    if (!data) return;

    const container = document.getElementById('questionContainer');
    if (container) container.className = 'match-q q-active';

    document.getElementById('qNum').textContent = '问题 ' + (enhancedQStep + 1) + '/' + ENHANCED_QUIZ.length;
    document.getElementById('qText').textContent = data.q;
    document.getElementById('qHint').textContent = data.hint || '';

    const optsContainer = document.getElementById('matchOpts');
    optsContainer.innerHTML = '';
    data.opts.forEach((opt, idx) => {
      const d = document.createElement('div');
      d.className = 'match-opt';
      d.innerHTML = '<span class="opt-icon">' + (opt.icon || '○') + '</span>' + opt.text;
      d.onclick = function(e) { selectEnhancedOpt(this, idx, e); };
      optsContainer.appendChild(d);
    });

    renderProgressDots();
  }

  function selectEnhancedOpt(el, optIdx, e) {
    if (isTransitioning) return;
    isTransitioning = true;

    // 记录答案
    const qData = ENHANCED_QUIZ[enhancedQStep];
    enhancedAnswers[enhancedQStep] = qData.opts[optIdx];

    // 视觉反馈
    document.querySelectorAll('.match-opt').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');

    // 粒子效果
    const rect = el.getBoundingClientRect();
    const modalEl = document.querySelector('.match-modal');
    if (!modalEl) return;
    const modalRect = modalEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2 - modalRect.left;
    const cy = rect.top + rect.height / 2 - modalRect.top;
    for (let i = 0; i < 6; i++) {
      const p = document.createElement('div');
      p.className = 'soul-particle';
      p.style.left = cx + 'px';
      p.style.top = cy + 'px';
      p.style.width = (3 + Math.random() * 4) + 'px';
      p.style.height = p.style.width;
      p.style.background = ['#fff5a7', '#ff9800', '#64b5f6'][Math.floor(Math.random() * 3)];
      p.style.setProperty('--tx', (Math.random() * 60 - 30) + 'px');
      p.style.setProperty('--ty', (Math.random() * 40 - 30) + 'px');
      document.querySelector('.match-modal').appendChild(p);
      setTimeout(() => p.remove(), 1500);
    }

    // 音效
    if (typeof playMatchSound === 'function') {
      try { playMatchSound(); } catch(e) {}
    }

    // 过渡到下一题
    const container = document.getElementById('questionContainer');
    if (container) container.classList.add('q-exit');

    setTimeout(() => {
      enhancedQStep++;
      if (enhancedQStep >= ENHANCED_QUIZ.length) {
        showSoulCard();
      } else {
        if (container) {
          container.classList.remove('q-exit');
          container.classList.add('q-enter');
        }
        renderEnhancedQuestion();
        setTimeout(() => {
          if (container) {
            container.classList.remove('q-enter');
            container.classList.add('q-active');
          }
          isTransitioning = false;
        }, 50);
      }
    }, 500);
  }

  function showSoulCard() {
    // 计算灵魂类型
    const userDims = SoulEngine.getUserDims(enhancedAnswers);
    const result = SoulEngine.calculate(userDims);
    const soulType = SOUL_TYPES[result.primary];
    const matchCount = SoulEngine.getMatchCount(result.primary);

    // 隐藏问卷
    document.getElementById('matchQuiz').style.display = 'none';

    // 显示灵魂卡片
    const card = document.getElementById('soulCard');
    card.classList.add('show');

    // 填充内容
    const glow = document.getElementById('soulGlow');
    if (glow) glow.style.background = 'radial-gradient(circle,' + soulType.color + '40,transparent)';

    document.getElementById('scIcon').textContent = soulType.icon;
    document.getElementById('scIcon').style.borderColor = soulType.color + '60';
    document.getElementById('scIcon').style.boxShadow = '0 4px 25px ' + soulType.color + '30';
    document.getElementById('scTypeName').textContent = soulType.name;
    document.getElementById('scTypeName').style.color = soulType.color;
    document.getElementById('scTypeTag').textContent = soulType.tag;

    // 类型描述
    const descEl = document.getElementById('scDesc');
    if (descEl) descEl.textContent = soulType.desc;

    // 特质标签
    const traitsEl = document.getElementById('scTraits');
    if (traitsEl) {
      traitsEl.innerHTML = '';
      soulType.traits.forEach(t => {
        const tag = document.createElement('span');
        tag.className = 'soul-tag';
        tag.style.cssText = 'background:rgba(255,245,167,.1);color:rgba(255,245,167,.7);border:1px solid rgba(255,245,167,.15)';
        tag.textContent = t;
        traitsEl.appendChild(tag);
      });
    }

    // 副类型提示
    const secondaryType = SOUL_TYPES[result.secondary];
    if (secondaryType) {
      const tagEl = document.getElementById('scTypeTag');
      if (tagEl) tagEl.textContent = soulType.tag + ' · 兼具 ' + secondaryType.name;
    }

    // 维度条
    const dims = [
      { id: 'Action', key: 'action', label: '行动力' },
      { id: 'Insight', key: 'insight', label: '感知力' },
      { id: 'Courage', key: 'courage', label: '勇气值' },
      { id: 'Stability', key: 'stability', label: '稳定性' }
    ];
    const dimColors = { action: '#ff6b6b', insight: '#64b5f6', courage: '#ff9800', stability: '#81c784' };
    dims.forEach((d, i) => {
      const val = userDims[d.key];
      const fill = document.getElementById('dim' + d.id);
      const valEl = document.getElementById('val' + d.id);
      if (fill) {
        fill.style.width = '0%';
        fill.style.background = dimColors[d.key] || '#fff5a7';
      }
      if (valEl) valEl.textContent = val;
      setTimeout(() => {
        if (fill) fill.style.width = val + '%';
      }, 300 + i * 150);
    });

    // 匹配数
    document.getElementById('scMatchNum').textContent = matchCount.toLocaleString();

    // 看山寄语
    document.getElementById('scKshanText').textContent = soulType.kshan;

    // 按钮事件
    const viewBtn = document.getElementById('scViewStories');
    viewBtn.onclick = function() {
      closeMatch();
      setTimeout(() => {
        if (typeof bridgeToDemo === 'function') bridgeToDemo('timeline');
      }, 250);
    };

    const retryBtn = document.getElementById('scRetry');
    retryBtn.onclick = function() { restartEnhancedQuiz(); };

    // 结果揭晓粒子
    const modal = document.querySelector('.match-modal');
    if (modal) {
      for (let i = 0; i < 20; i++) {
        setTimeout(() => {
          const p = document.createElement('div');
          p.className = 'soul-particle';
          p.style.left = '50%';
          p.style.top = '30%';
          p.style.width = (2 + Math.random() * 5) + 'px';
          p.style.height = p.style.width;
          p.style.background = soulType.color;
          const angle = Math.random() * Math.PI * 2;
          const dist = 60 + Math.random() * 80;
          p.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
          p.style.setProperty('--ty', Math.sin(angle) * dist + 'px');
          modal.appendChild(p);
          setTimeout(() => p.remove(), 1500);
        }, i * 50);
      }
    }

    // 记录游戏化数据
    if (typeof GameEngine !== 'undefined' && GameEngine.recordMatch) {
      GameEngine.recordMatch();
    }

    isTransitioning = false;
  }

  function restartEnhancedQuiz() {
    enhancedQStep = 0;
    enhancedAnswers = [];
    document.getElementById('soulCard').classList.remove('show');
    document.getElementById('matchQuiz').style.display = 'block';
    document.getElementById('questionContainer').className = 'match-q q-active';
    renderEnhancedQuestion();
  }

  // ============================================================
  // 7. 覆写全局函数
  // ============================================================
  window.openMatch = function() {
    enhancedQStep = 0;
    enhancedAnswers = [];
    const modal = document.getElementById('matchModal');
    if (!modal) return;
    modal.classList.add('show');
    const quiz = document.getElementById('matchQuiz');
    if (quiz) quiz.style.display = 'block';
    const soulCard = document.getElementById('soulCard');
    if (soulCard) soulCard.classList.remove('show');
    const matchResult = document.getElementById('matchResult');
    if (matchResult) matchResult.classList.remove('show');
    renderEnhancedQuestion();
  };

  window.closeMatch = function() {
    const m = document.getElementById('matchModal');
    if (m) m.classList.remove('show');
  };

  window.selectOpt = function(el) {
    // 由 selectEnhancedOpt 处理
  };

  window.nextQ = function() {
    // 由 selectEnhancedOpt 自动处理
  };

  window.renderQuestion = function() {
    renderEnhancedQuestion();
  };

  // 更新匹配入口描述
  function updateMatchSectionText() {
    const desc = document.querySelector('.match-desc');
    if (desc) desc.innerHTML = '回答6道题，发现你的灵魂类型<br>找到和你做同样选择的人';

    const note = document.querySelector('.match-note');
    if (note) note.textContent = '这是一个深度灵魂匹配游戏，帮你发现和你有相似困境的人';

    const subEl = document.querySelector('.match-modal .sub');
    if (subEl) subEl.textContent = '回答6道题，找到和你做同样选择的人';
  }

  // ============================================================
  // 8. 初始化
  // ============================================================
  function init() {
    injectEnhancedModal();
    updateMatchSectionText();
    console.log('%c 🎯 灵魂匹配局增强模块已启动 v2.0', 'color:#fff5a7;font-size:12px');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

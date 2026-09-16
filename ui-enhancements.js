/**
 * UI Enhancements Module
 * 升级功能总览、头像、故事流卡片、同路人匹配结果页的视觉与交互
 * 不修改原有 HTML 结构和 JS 逻辑，通过 CSS 注入 + 渲染函数包装实现增强
 */
(function() {
  'use strict';

  // ==================== CSS 注入 ====================
  const style = document.createElement('style');
  style.textContent = `
  /* ====== 功能总览仪表板增强 ====== */
  .dashboard {
    background: linear-gradient(135deg, #f8fbff 0%, #f0f7ff 100%);
    border: 1px solid #dbe9f7;
    position: relative;
    overflow: hidden;
  }
  .dashboard::before {
    content: '';
    position: absolute;
    right: -30px; top: -30px;
    width: 100px; height: 100px;
    background: radial-gradient(circle, rgba(0,132,255,.06) 0%, transparent 70%);
    pointer-events: none;
  }
  .dashboard-title {
    font-size: 16px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .dashboard-title::before {
    content: '';
    width: 4px; height: 16px;
    background: linear-gradient(180deg, #0084FF, #0066CC);
    border-radius: 2px;
  }
  .dashboard-sub {
    font-size: 11px;
    color: #6ba3d9;
    background: #e8f4ff;
    padding: 2px 8px;
    border-radius: 8px;
  }
  .dashboard-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
    margin-bottom: 10px;
  }
  .dash-item {
    position: relative;
    background: #fff;
    border: 1px solid #eef2f7;
    border-radius: 12px;
    padding: 12px 4px 10px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(.4,0,.2,1);
    overflow: hidden;
  }
  .dash-item::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(0,132,255,.08), transparent 60%);
    opacity: 0;
    transition: opacity 0.2s;
    pointer-events: none;
  }
  .dash-item:active {
    transform: scale(0.95);
    box-shadow: 0 2px 8px rgba(0,132,255,.15);
  }
  .dash-item:active::after {
    opacity: 1;
  }
  .dash-item-icon {
    width: 36px; height: 36px;
    margin: 0 auto 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    background: #f0f7ff;
    transition: all 0.2s;
  }
  .dash-item:nth-child(1) .dash-item-icon { background: #e8f4ff; color: #0084FF; }
  .dash-item:nth-child(2) .dash-item-icon { background: #e8f8f0; color: #52C41A; }
  .dash-item:nth-child(3) .dash-item-icon { background: #fff0e8; color: #FF6B35; }
  .dash-item:nth-child(4) .dash-item-icon { background: #f0e8ff; color: #7C3AED; }
  .dash-item:nth-child(3) .dash-item-icon {
    animation: matchPulse 2s ease infinite;
  }
  @keyframes matchPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(255,107,53,.3); }
    50% { box-shadow: 0 0 0 6px rgba(255,107,53,0); }
  }
  .dash-item-icon svg {
    width: 22px; height: 22px;
    stroke-width: 1.5;
  }
  .dash-item-name {
    font-size: 11px;
    color: #333;
    font-weight: 500;
  }
  .dash-item .dash-badge-num {
    position: absolute;
    top: 4px; right: 4px;
    background: #FF4757;
    color: #fff;
    font-size: 9px;
    font-weight: 700;
    min-width: 14px;
    height: 14px;
    border-radius: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 3px;
  }

  /* 智慧豆入口增强 */
  .dash-hot {
    background: linear-gradient(135deg, #fffbf5 0%, #fff5e6 100%);
    border: 1px solid #f5e6d3;
    border-radius: 12px;
    padding: 12px 14px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .dash-hot:active {
    transform: scale(0.98);
  }
  .dash-hot-icon {
    width: 36px; height: 36px;
    border-radius: 10px;
    background: linear-gradient(135deg, #FFD700, #FFA500);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 14px;
    font-weight: 700;
    box-shadow: 0 2px 8px rgba(255,165,0,.25);
  }

  /* ====== 头像增强 (个人中心) ====== */
  .profile-head {
    background: linear-gradient(135deg, #0084FF 0%, #0066CC 50%, #004E99 100%);
    padding: 28px 16px 32px;
    position: relative;
    overflow: hidden;
  }
  .profile-head::after {
    content: '';
    position: absolute;
    left: -40px; bottom: -40px;
    width: 120px; height: 120px;
    background: radial-gradient(circle, rgba(255,255,255,.06) 0%, transparent 70%);
    pointer-events: none;
  }
  .ph-avatar {
    width: 64px; height: 64px;
    border-radius: 50%;
    background: rgba(255,255,255,.15);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    flex-shrink: 0;
  }
  .ph-avatar::before {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    background: conic-gradient(from 0deg, #fff, rgba(255,255,255,.3), #fff, rgba(255,255,255,.3), #fff);
    z-index: 0;
    animation: avatarRing 4s linear infinite;
  }
  .ph-avatar img {
    position: relative;
    z-index: 1;
    border: 2px solid rgba(255,255,255,.5);
  }
  @keyframes avatarRing {
    to { transform: rotate(360deg); }
  }
  .ph-avatar .ph-status-dot {
    position: absolute;
    bottom: 2px; right: 2px;
    width: 14px; height: 14px;
    background: #52C41A;
    border: 2.5px solid #0066CC;
    border-radius: 50%;
    z-index: 2;
  }
  .ph-name {
    font-size: 20px;
    font-weight: 700;
    text-shadow: 0 1px 4px rgba(0,0,0,.15);
  }
  .ph-level {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    background: rgba(255,255,255,.2);
    backdrop-filter: blur(8px);
    padding: 4px 12px;
    border-radius: 12px;
    margin-top: 6px;
    border: 1px solid rgba(255,255,255,.15);
  }
  .ph-edit {
    padding: 8px 18px;
    border-radius: 20px;
    border: 1px solid rgba(255,255,255,.4);
    background: rgba(255,255,255,.1);
    backdrop-filter: blur(8px);
    font-size: 14px;
    color: #fff;
    cursor: pointer;
    transition: all 0.2s;
  }
  .ph-edit:active {
    background: rgba(255,255,255,.2);
  }

  /* ====== 故事流卡片增强 ====== */
  .story-card {
    background: #fff;
    border-radius: 14px;
    padding: 18px;
    box-shadow: 0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
    cursor: pointer;
    transition: all 0.2s cubic-bezier(.4,0,.2,1);
    position: relative;
    overflow: hidden;
  }
  .story-card::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 4px;
    background: var(--card-accent, #0084FF);
    border-radius: 14px 0 0 14px;
    opacity: 0.8;
  }
  .story-card:active {
    transform: scale(0.985);
    box-shadow: 0 2px 8px rgba(0,0,0,.1);
  }
  .sc-head {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
  }
  .sc-avatar {
    width: 38px; height: 38px;
    border-radius: 50%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    font-weight: 700;
    flex-shrink: 0;
    border: 2px solid #f0f7ff;
    box-shadow: 0 2px 6px rgba(0,0,0,.06);
  }
  .sc-author {
    font-size: 15px;
    font-weight: 600;
    color: #1a1a1a;
  }
  .sc-meta {
    font-size: 12px;
    color: #8590a6;
  }
  .sc-badge {
    margin-left: auto;
    background: #e8f4ff;
    color: #0084FF;
    font-size: 12px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .sc-title {
    font-size: 17px;
    font-weight: 600;
    line-height: 1.5;
    color: #1a1a1a;
    margin-bottom: 8px;
  }
  .snippet {
    font-size: 14px;
    color: #555;
    line-height: 1.7;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .sc-foot {
    display: flex;
    gap: 18px;
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid #f0f0f0;
  }
  .sc-stat {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: #8590a6;
    transition: color 0.2s;
  }
  .sc-stat:active {
    color: #0084FF;
  }
  .sc-stat svg {
    width: 16px;
    height: 16px;
  }

  /* 标签主题色变量映射 */
  .story-card[data-tag="职场转型"] { --card-accent: #0084FF; }
  .story-card[data-tag="考研"] { --card-accent: #7C3AED; }
  .story-card[data-tag="创业"] { --card-accent: #FF6B35; }
  .story-card[data-tag="裸辞"] { --card-accent: #00B8A9; }
  .story-card[data-tag="情感"] { --card-accent: #FF4D6D; }
  .story-card[data-tag="学业"] { --card-accent: #52C41A; }
  .story-card[data-tag="留学"] { --card-accent: #FFA500; }
  .story-card[data-tag="副业"] { --card-accent: #00B8A9; }
  .story-card[data-tag="心理学"] { --card-accent: #6C5CE7; }
  .story-card[data-tag="旅行"] { --card-accent: #00B894; }
  .story-card[data-tag="读书"] { --card-accent: #2D3436; }
  .story-card[data-tag="健身"] { --card-accent: #FF6348; }
  .story-card { --card-accent: #0084FF; }

  /* ====== 同路人匹配入口卡片增强 ====== */
  .match-card {
    background: linear-gradient(135deg, #0084FF 0%, #0066CC 50%, #004E99 100%);
    border-radius: 16px;
    padding: 22px 20px;
    color: #fff;
    margin-bottom: 20px;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s;
  }
  .match-card:active {
    transform: scale(0.98);
  }
  .match-card::before {
    content: '';
    position: absolute;
    right: -20px; top: -20px;
    width: 100px; height: 100px;
    opacity: 0.08;
    transform: rotate(66.34deg);
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z'/%3E%3C/svg%3E") center/contain no-repeat;
  }
  .match-card::after {
    content: '';
    position: absolute;
    right: -40px; bottom: -40px;
    width: 120px; height: 120px;
    border: 2px dashed rgba(255,255,255,.1);
    border-radius: 50%;
    pointer-events: none;
    animation: spinSlow 20s linear infinite;
  }
  @keyframes spinSlow { to { transform: rotate(360deg); } }
  .match-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    background: rgba(255,255,255,.2);
    backdrop-filter: blur(8px);
    padding: 4px 12px;
    border-radius: 12px;
    margin-bottom: 12px;
    border: 1px solid rgba(255,255,255,.15);
  }
  .match-title {
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 8px;
    text-shadow: 0 1px 4px rgba(0,0,0,.15);
  }
  .match-sub {
    font-size: 14px;
    color: rgba(255,255,255,.75);
    line-height: 1.6;
  }
  .match-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-top: 16px;
    padding: 10px 28px;
    background: #fff;
    color: #0084FF;
    border-radius: 24px;
    font-size: 15px;
    font-weight: 700;
    box-shadow: 0 4px 12px rgba(0,0,0,.15);
    transition: all 0.2s;
  }
  .match-card:active .match-btn {
    transform: scale(0.95);
  }

  /* ====== 同路人匹配结果页增强 ====== */
  .match-result-header {
    text-align: center;
    padding: 24px 20px 20px;
    background: linear-gradient(180deg, #f0f7ff 0%, transparent 100%);
  }
  .match-result-title {
    font-size: 18px;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 6px;
  }
  .match-result-sub {
    font-size: 14px;
    color: #8590a6;
    line-height: 1.6;
  }
  .match-result-sub b {
    color: #0084FF;
  }

  /* 匹配维度卡片 */
  .match-dim-card {
    background: #fff;
    border-radius: 14px;
    padding: 18px 18px 16px;
    margin-bottom: 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
  }
  .match-dim-card:active {
    transform: scale(0.985);
  }
  .match-dim-card.match-highlight {
    border: 2px solid #0084FF;
    box-shadow: 0 4px 16px rgba(0,132,255,.12);
  }
  .match-dim-card.match-highlight::before {
    content: '最匹配';
    position: absolute;
    top: -1px; right: 12px;
    background: linear-gradient(135deg, #0084FF, #0066CC);
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    padding: 3px 12px;
    border-radius: 0 0 10px 10px;
    z-index: 2;
  }

  /* 匹配头部：头像 + 分数环 */
  .match-dim-head {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 14px;
  }
  .match-score-ring {
    position: relative;
    width: 56px; height: 56px;
    flex-shrink: 0;
  }
  .match-score-ring svg {
    width: 100%; height: 100%;
    transform: rotate(-90deg);
  }
  .match-score-ring .ring-bg {
    fill: none;
    stroke: #f0f0f0;
    stroke-width: 4;
  }
  .match-score-ring .ring-fg {
    fill: none;
    stroke-width: 4;
    stroke-linecap: round;
    transition: stroke-dashoffset 0.8s ease;
  }
  .match-score-ring .ring-num {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    color: #0084FF;
  }

  /* 维度进度条 */
  .match-dim-bars {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 12px;
  }
  .match-dim-bar {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .match-dim-label {
    font-size: 12px;
    color: #8590a6;
    width: 64px;
    flex-shrink: 0;
  }
  .match-dim-track {
    flex: 1;
    height: 6px;
    background: #f5f5f5;
    border-radius: 3px;
    overflow: hidden;
    position: relative;
  }
  .match-dim-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.6s cubic-bezier(.4,0,.2,1);
  }
  .match-dim-percent {
    font-size: 12px;
    font-weight: 600;
    color: #333;
    width: 32px;
    text-align: right;
    flex-shrink: 0;
  }

  /* 匹配理由 */
  .match-reason {
    font-size: 13px;
    color: #555;
    line-height: 1.6;
    background: #f8fbff;
    border-left: 3px solid #0084FF;
    padding: 10px 14px;
    border-radius: 0 8px 8px 0;
    margin-bottom: 12px;
  }

  /* 匹配卡片操作按钮 */
  .match-dim-actions {
    display: flex;
    gap: 8px;
  }
  .match-dim-btn {
    flex: 1;
    padding: 9px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }
  .match-dim-btn:active {
    transform: scale(0.95);
  }
  .match-dim-btn.primary {
    background: linear-gradient(135deg, #0084FF, #0066CC);
    color: #fff;
    box-shadow: 0 2px 6px rgba(0,132,255,.2);
  }
  .match-dim-btn.secondary {
    background: #fff;
    color: #0084FF;
    border: 1.5px solid #0084FF;
  }

  /* 标签chip */
  .match-tag-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 12px;
  }
  .match-tag-chip {
    font-size: 11px;
    padding: 3px 8px;
    border-radius: 6px;
    background: #f0f7ff;
    color: #0084FF;
    font-weight: 500;
  }

  /* Loading 页增强 */
  .ml-orb {
    width: 80px; height: 80px;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, #4da6ff, #0084FF, #0066CC);
    box-shadow: 0 0 30px rgba(0,132,255,.4), inset 0 -4px 12px rgba(0,0,0,.2);
    animation: orbFloat 3s ease infinite;
  }
  @keyframes orbFloat {
    0%, 100% { transform: translateY(0) scale(1); }
    50% { transform: translateY(-8px) scale(1.05); }
  }
  `;
  document.head.appendChild(style);

  // ==================== 故事流卡片增强 ====================
  function enhanceStoryFeed() {
    const originalRenderFeed = window.renderFeed;
    if (!originalRenderFeed) return;

    window.renderFeed = function() {
      const filtered = currentTag === '全部' ? DB.stories : DB.stories.filter(s => s.tag === currentTag);
      if (filtered.length === 0) {
        document.getElementById('storyFeed').innerHTML = `<div style="text-align:center;padding:60px 20px;color:var(--c-muted);font-size:14px;">「${currentTag}」分类下还没有故事<br>快来分享你的「后来」吧</div>`;
        return;
      }
      document.getElementById('storyFeed').innerHTML = filtered.map(s => `
        <div class="story-card" data-tag="${s.tag}" onclick="navigate('timeline')">
          <div class="sc-head">
            <div class="sc-avatar"><img src="assets/liukanshan-${s.id % 2 === 0 ? 'white' : 'blue'}.jpg" alt="${s.author}"></div>
            <div>
              <div class="sc-author">${s.author}</div>
              <div class="sc-meta">${s.tag}</div>
            </div>
            <div class="sc-badge">${s.badge}时间线</div>
          </div>
          <div class="sc-title">${s.title}</div>
          <div class="snippet">${s.snippet}</div>
          <div class="sc-foot">
            <div class="sc-stat"><svg viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/></svg>${s.views}</div>
            <div class="sc-stat"><svg viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2"/></svg>${s.asks}</div>
            <div class="sc-stat"><svg viewBox="0 0 24 24" fill="none"><path d="M7 10v12M15 5.88L14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H7a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L14 2" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>${s.agrees}</div>
            <div class="sc-stat" style="margin-left:auto;"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>${s.updates}次更新</div>
          </div>
        </div>
      `).join('');
    };
  }

  // ==================== 同路人匹配结果页增强 ====================
  function enhanceMatchResult() {
    const originalRender = window.renderMatchResult;
    if (!originalRender) return;

    window.renderMatchResult = function(matches, userTags) {
      navigate('matchResult');

      const tagLabels = userTags.map(t => {
        const map = {transition:'转型中', explore:'探索方向', growing:'正在路上', starting:'刚刚起步', similar:'找相似的', mentor:'找指引者', companion:'找同行者', diverse:'找多元视角', career:'职业话题', study:'考研升学', relationship:'感情关系', self:'自我成长', emotion:'情绪共鸣', practical:'实用经验', action:'一起行动', longterm:'长期连接'};
        return map[t] || t;
      }).slice(0, 3);

      const sub = document.getElementById('matchResultSub');
      if (sub) {
        sub.innerHTML = `基于你的 <b style="color:var(--c-primary);">${tagLabels.join(' · ')}</b> 方向<br>为你匹配到 <b style="color:var(--c-primary);font-size:18px;">${matches.length}</b> 位同路人`;
      }

      const list = document.getElementById('matchResultList');
      if (!list) return;

      list.innerHTML = matches.map((m, i) => {
        const u = m.user;
        const avatarHTML = u.avatar && u.avatar.startsWith && u.avatar.startsWith('assets/')
          ? `<img src="${u.avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`
          : u.avatar;
        const highlight = i === 0 ? 'match-highlight' : '';

        // 维度模拟
        const dims = [
          { label: '经历相似', percent: Math.min(98, m.score + Math.floor(Math.random()*5)) },
          { label: '时间线重合', percent: Math.max(40, m.score - 10 - Math.floor(Math.random()*8)) },
          { label: '价值观共鸣', percent: Math.max(50, m.score - 5 + Math.floor(Math.random()*8)) },
          { label: '话题交集', percent: Math.max(35, m.score - 15 - Math.floor(Math.random()*10)) }
        ];
        const dimBarsHTML = dims.map(d => {
          const color = d.percent >= 80 ? '#52C41A' : d.percent >= 60 ? '#0084FF' : d.percent >= 45 ? '#FAAD14' : '#FF6B6B';
          return `<div class="match-dim-bar">
            <div class="match-dim-label">${d.label}</div>
            <div class="match-dim-track"><div class="match-dim-fill" style="width:${d.percent}%;background:${color};"></div></div>
            <div class="match-dim-percent">${d.percent}%</div>
          </div>`;
        }).join('');

        // 分数环 SVG
        const radius = 24;
        const circ = 2 * Math.PI * radius;
        const offset = circ - (m.score / 100) * circ;
        const ringColor = m.score >= 85 ? '#52C41A' : m.score >= 70 ? '#0084FF' : '#FAAD14';

        // 标签 chips: 用用户故事标签 + 匹配理由拆分
        const chipList = [];
        if (u.tag) chipList.push(u.tag);
        const reasons = (m.reason || '').split(/[,，]/).filter(r => r.trim());
        chipList.push(...reasons.slice(0, 2));
        const tagChips = (chipList.length ? chipList : ['经历相似']).slice(0, 3).map(t =>
          `<span class="match-tag-chip">${t}</span>`
        ).join('');

        return `<div class="match-dim-card ${highlight}" onclick="openUserHome('${u.id}')">
          <div class="match-dim-head">
            <div class="match-score-ring">
              <svg viewBox="0 0 56 56">
                <circle class="ring-bg" cx="28" cy="28" r="${radius}"/>
                <circle class="ring-fg" cx="28" cy="28" r="${radius}" stroke="${ringColor}" stroke-dasharray="${circ}" stroke-dashoffset="${offset}"/>
              </svg>
              <div class="ring-num">${m.score}%</div>
            </div>
            <div class="sc-avatar">${avatarHTML}</div>
            <div style="flex:1;">
              <div class="sc-author">${u.name}</div>
              <div class="sc-meta">${m.time} · ${m.story}</div>
            </div>
          </div>
          <div class="match-tag-chips">${tagChips}</div>
          <div class="match-dim-bars">${dimBarsHTML}</div>
          <div class="match-reason">${m.reason}</div>
          <div class="match-dim-actions">
            <button class="match-dim-btn primary" onclick="event.stopPropagation();openChatWith('${u.name}','${u.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4 3.5V17H6.5A2.5 2.5 0 0 1 4 14.5v-8z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
              打招呼
            </button>
            <button class="match-dim-btn secondary" onclick="event.stopPropagation();showToast('已查看主页')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/></svg>
              查看主页
            </button>
          </div>
        </div>`;
      }).join('');

      const redirectBtn = document.getElementById('matchRedirectBtn');
      let shouldRedirect = false;
      try { shouldRedirect = !!redirectAfterMatch; } catch(e) {}
      if (redirectBtn && shouldRedirect) {
        redirectBtn.style.display = 'block';
      } else if (redirectBtn) {
        redirectBtn.style.display = 'none';
      }
    };
  }

  // ==================== 个人中心头像增强 ====================
  function enhanceProfileAvatar() {
    const avatar = document.querySelector('.ph-avatar');
    if (avatar && !avatar.querySelector('.ph-status-dot')) {
      const dot = document.createElement('div');
      dot.className = 'ph-status-dot';
      avatar.appendChild(dot);
    }
  }

  // ==================== 功能总览增强 ====================
  function enhanceDashboard() {
    // 给同路人匹配项加一个小标记
    const matchItem = document.querySelectorAll('.dash-item');
    if (matchItem.length >= 3 && !matchItem[2].querySelector('.dash-badge-num')) {
      const badge = document.createElement('div');
      badge.className = 'dash-badge-num';
      badge.textContent = 'AI';
      matchItem[2].appendChild(badge);
    }
  }

  // ==================== 初始化 ====================
  function init() {
    enhanceProfileAvatar();
    enhanceDashboard();

    // 包装渲染函数
    enhanceStoryFeed();
    enhanceMatchResult();

    // 重新渲染当前页面
    if (typeof renderFeed === 'function' && document.querySelector('.page.active[data-page="discover"]')) {
      renderFeed();
    }

    // 监听页面切换，在切到个人中心时增强头像
    const originalNavigate = window.navigate;
    if (originalNavigate) {
      window.navigate = function(page) {
        originalNavigate(page);
        if (page === 'profile') {
          setTimeout(enhanceProfileAvatar, 50);
        }
      };
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

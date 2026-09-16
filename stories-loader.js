// 加载知乎真实"后来"故事并渲染到 .stories-content
(function () {
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function fmt(n) {
    return Number(n || 0).toLocaleString("en-US");
  }

  var EYE =
    '<svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="1.5"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>';
  var BUBBLE =
    '<svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="1.5"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z"/></svg>';
  var LINK =
    '<svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,245,167,.7)" stroke-width="1.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';

  function buildCard(s, i) {
    var paras = (s.text || "")
      .split("\n")
      .map(function (ln) {
        return ln.trim();
      })
      .filter(Boolean)
      .map(function (ln) {
        return "<p>" + esc(ln) + "</p>";
      })
      .join("");

    var kshanHtml = s.kshan
      ? '<div class="sf-kshan"><img src="assets/liukanshan-blue.jpg" alt="看山">' +
        '<span class="sf-kshan-txt">' + esc(s.kshan) + "</span></div>"
      : "";

    var num = String(i + 1).padStart(2, "0");
    var avatar = s.avatar
      ? '<img class="sf-avatar" src="' + esc(s.avatar) + '" alt="' + esc(s.author) + '" onerror="this.src=\'assets/liukanshan-blue.jpg\'">'
      : '<img class="sf-avatar" src="assets/liukanshan-blue.jpg" alt="看山">';
    var authorLine = '<div class="sf-author"><span class="sf-author-name">' + esc(s.author || "知乎用户") + "</span></div>";
    return (
      '<div class="story-fold" onclick="toggleFold(this)">' +
      '<div class="sf-head">' +
      '<span class="sf-num">' + num + "</span>" +
      '<span class="sf-title">' + esc(s.title) + "</span>" +
      '<div class="sf-meta"><span class="sf-tag">' + esc(s.tag) + "</span></div>" +
      '<span class="sf-arrow">▾</span>' +
      "</div>" +
      '<div class="sf-body"><div class="sf-inner">' +
      '<div class="sf-author-row">' + avatar + authorLine + "</div>" +
      kshanHtml +
      paras +
      '<div class="sf-stats">' +
      "<span>" + EYE + fmt(s.voteUp) + " 赞同</span>" +
      "<span>" + BUBBLE + fmt(s.commentCount) + " 评论</span>" +
      '<a class="sf-link" href="' + esc(s.url) + '" target="_blank" rel="noopener">' + LINK + " 知乎原文</a>" +
      "</div>" +
      '<div class="sf-ask">' +
      '<img src="assets/liukanshan-blue.jpg" alt="看山">' +
      "<span>看山问：如果是你，会怎么选？</span>" +
      '<a href="javascript:;" onclick="window.doZhihuSearchWith(\'' + esc(s.kw) + '\')">追问更多 →</a>' +
      "</div>" +
      "</div></div></div>"
    );
  }

  function render(stories) {
    var box = document.querySelector(".stories-content");
    if (!box) return;
    var old = box.querySelectorAll(".story-fold");
    old.forEach(function (el) { el.remove(); });

    var anchor = box.querySelector(".bottle-scene");
    var frag = document.createDocumentFragment();
    stories.forEach(function (s, i) {
      var tmp = document.createElement("div");
      tmp.innerHTML = buildCard(s, i);
      frag.appendChild(tmp.firstChild);
    });
    if (anchor) anchor.after(frag);
    else box.appendChild(frag);
  }

  if (window.__STORIES_DATA) {
    render((window.__STORIES_DATA && window.__STORIES_DATA.stories) || []);
  } else {
    fetch("stories.json", { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (d) { render((d && d.stories) || []); })
      .catch(function (e) { console.warn("stories load failed:", e); });
  }
})();

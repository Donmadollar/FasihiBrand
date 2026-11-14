(function () {
  if (typeof STORIES === 'undefined') return;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmt(d) {
    var dt = new Date(d);
    return isNaN(dt) ? '' : dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  function byNewest(a, b) { return new Date(b.date) - new Date(a.date); }

  var TYPE_LABEL = { story: 'Short Story', article: 'Article', poem: 'Poem' };

  function readLabel(s) {
    if (s.type === 'article') return 'Read article →';
    if (s.type === 'poem') return 'Read poem →';
    return 'Read story →';
  }

  function coverBlock(s) {
    if (s.cover) {
      return '<img class="cover" src="' + esc(s.cover) + '" alt="' + esc(s.title) + '" loading="lazy">';
    }
    var type = s.type || 'story';
    var titleText = String(s.title);
var initial = titleText.charAt(0).toUpperCase();
    return '<div class="cover-gen cover-' + esc(type) + '" aria-hidden="true">' +
      '<span class="ct-type">' + esc(TYPE_LABEL[type] || 'Story') + '</span>' +
      '<span class="ct-initial">' + esc(initial) + '</span>' +
      '<span class="ct-genre">' + esc(s.genre) + '</span></div>';
  }

  function card(s) {
    var author = s.authorPage ? '<a href="' + esc(s.authorPage) + '">' + esc(s.author) + '</a>' : esc(s.author);
    var tags = (s.topics || []).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('');
    return '<div class="card">' + coverBlock(s) +
      '<span class="genre">' + esc(s.genre) + '</span>' +
      '<h3>' + esc(s.title) + '</h3>' +
      '<p class="author">by ' + author + ' · ' + fmt(s.date) + '</p>' +
      '<p>' + esc(s.teaser) + '</p>' +
      '<div class="tags">' + tags + '</div>' +
      '<a href="' + esc(s.url) + '">' + readLabel(s) + '</a></div>';
  }

  var stats = document.getElementById('stats');
  if (stats) {
    var counts = { article: 0, story: 0, poem: 0 };
    var writers = {};
    STORIES.forEach(function (s) {
      var t = s.type || 'story';
      counts[t] = (counts[t] || 0) + 1;
      if (s.author && !/editorial/i.test(s.author)) writers[s.author] = true;
    });
    var bits = [];
    var addStat = function (n, one, many) {
      if (n > 0) bits.push('<div class="stat"><strong>' + n + '</strong><span>' + (n === 1 ? one : many) + '</span></div>');
    };
    addStat(counts.article, 'Article', 'Articles');
    addStat(counts.story, 'Short story', 'Short stories');
    addStat(counts.poem, 'Poem', 'Poems');
    addStat(Object.keys(writers).length, 'Writer', 'Writers');
    stats.innerHTML = bits.join('');
  }
  var track = document.getElementById('picks-track');
  if (track) {
    var picks = STORIES.filter(function (s) { return s.featured; }).sort(byNewest);
    if (picks.length === 0) {
      var picksBox = document.getElementById('picks');
      if (picksBox) picksBox.style.display = 'none';
    } else {
      var tickerItems = picks.map(function (s) {
        return '<a class="ticker-item" href="' + esc(s.url) + '"><span class="ticker-type">' +
          esc(TYPE_LABEL[s.type || 'story'] || 'Story') + '</span> ' + esc(s.title) +
          ' <em>by ' + esc(s.author) + '</em></a>';
      }).join('<span class="ticker-dot">✦</span>');
            var loop = '';
      for (var r = 0; r < 4; r++) { loop += tickerItems + '<span class="ticker-dot">✦</span>'; }
      track.innerHTML = '<div class="ticker-group">' + loop + '</div>' +
        '<div class="ticker-group" aria-hidden="true">' + loop + '</div>';
      Array.prototype.forEach.call(track.lastChild.querySelectorAll('a'), function (a) {
        a.setAttribute('tabindex', '-1');
      });
    }
  }
  var recent = document.getElementById('recent-list');
  if (recent) {
    recent.innerHTML = STORIES.slice().sort(byNewest).slice(0, 3).map(card).join('');
  }

  var list = document.getElementById('story-list');
  if (!list) return;

  var pageType = list.getAttribute('data-type');
  var POOL = pageType ? STORIES.filter(function (s) { return (s.type || 'story') === pageType; }) : STORIES;
  var names = { story: ['story', 'stories'], article: ['article', 'articles'], poem: ['poem', 'poems'] };
  var nm = names[pageType] || names.story;
  var one = nm[0];
  var many = nm[1];

  var search = document.getElementById('search');
  var genreBox = document.getElementById('genres');
  var sortSel = document.getElementById('sort');
  var count = document.getElementById('count');
  var activeGenre = 'All';

  var params = new URLSearchParams(window.location.search);
  if (params.get('q')) search.value = params.get('q');

  var genres = ['All'];
  POOL.forEach(function (s) { if (genres.indexOf(s.genre) === -1) genres.push(s.genre); });
  genreBox.innerHTML = genres.map(function (g) {
    return '<button type="button" class="chip' + (g === 'All' ? ' active' : '') + '" data-g="' + esc(g) + '">' + esc(g) + '</button>';
  }).join('');

  genreBox.addEventListener('click', function (e) {
    var b = e.target.closest('.chip');
    if (!b) return;
    activeGenre = b.getAttribute('data-g');
    Array.prototype.forEach.call(genreBox.children, function (c) { c.classList.toggle('active', c === b); });
    render();
  });
  search.addEventListener('input', render);
  sortSel.addEventListener('change', render);

  function render() {
    var q = search.value.trim().toLowerCase();
    var items = POOL.filter(function (s) {
      if (activeGenre !== 'All' && s.genre !== activeGenre) return false;
      if (!q) return true;
      var hay = [s.title, s.author, s.genre, (s.topics || []).join(' '), s.teaser].join(' ').toLowerCase();
      return q.split(/\s+/).every(function (w) { return hay.indexOf(w) !== -1; });
    });
    var mode = sortSel.value;
    items.sort(function (a, b) {
      if (mode === 'az') return a.title.localeCompare(b.title);
      if (mode === 'picks') return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || byNewest(a, b);
      return byNewest(a, b);
    });
    count.textContent = items.length + ' ' + (items.length === 1 ? one : many);
    if (items.length) {
      list.innerHTML = items.map(card).join('');
    } else if (POOL.length === 0) {
      list.innerHTML = '<p class="empty">New ' + many + ' are coming soon. Check back shortly.</p>';
    } else {
      list.innerHTML = '<p class="empty">Nothing matches your search. Try another word or clear the filter.</p>';
    }
  }
  render();
})();
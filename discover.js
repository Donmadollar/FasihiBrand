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

  function readLabel(s) {
    if (s.type === 'article') return 'Read article →';
    if (s.type === 'poem') return 'Read poem →';
    return 'Read story →';
  }

  function card(s) {
    var cover = s.cover ? '<img class="cover" src="' + esc(s.cover) + '" alt="' + esc(s.title) + '" loading="lazy">' : '';
    var author = s.authorPage ? '<a href="' + esc(s.authorPage) + '">' + esc(s.author) + '</a>' : esc(s.author);
    var tags = (s.topics || []).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('');
    return '<div class="card">' + cover +
      '<span class="genre">' + esc(s.genre) + '</span>' +
      '<h3>' + esc(s.title) + '</h3>' +
      '<p class="author">by ' + author + ' · ' + fmt(s.date) + '</p>' +
      '<p>' + esc(s.teaser) + '</p>' +
      '<div class="tags">' + tags + '</div>' +
      '<a href="' + esc(s.url) + '">' + readLabel(s) + '</a></div>';
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
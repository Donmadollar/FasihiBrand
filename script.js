document.addEventListener('DOMContentLoaded', function () {
  // Mobile menu
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('nav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
    });
  }

  // Reading progress bar
  var bar = document.querySelector('.progress');
  if (bar) {
    window.addEventListener('scroll', function () {
      var h = document.documentElement;
      var pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      bar.style.width = pct + '%';
    });
  }

  // Share buttons
  var share = document.querySelector('.share');
  if (share) {
    var url = encodeURIComponent(window.location.href);
    var title = encodeURIComponent(document.title);
    share.querySelector('.wa').href = 'https://wa.me/?text=' + title + '%20' + url;
    share.querySelector('.fb').href = 'https://www.facebook.com/sharer/sharer.php?u=' + url;
    share.querySelector('.tw').href = 'https://twitter.com/intent/tweet?text=' + title + '&url=' + url;
    var cp = share.querySelector('.cp');
    cp.addEventListener('click', function () {
      navigator.clipboard.writeText(window.location.href);
      cp.textContent = 'Link copied';
    });
  }
});
// Limit long copies from stories and articles, and add credit
document.addEventListener('copy', function (e) {
  var box = document.querySelector('.story');
  if (!box) return;
  var sel = window.getSelection();
  if (!sel  sel.isCollapsed  !box.contains(sel.anchorNode)) return;
  var text = sel.toString();
  var LIMIT = 100;
  var out = text.length > LIMIT ? text.slice(0, LIMIT).trim() + '…' : text;
  out += '\n\nRead the full piece at ' + window.location.href + '\n© FasihiBrand and the author. All rights reserved.';
  e.clipboardData.setData('text/plain', out);
  e.preventDefault();
});
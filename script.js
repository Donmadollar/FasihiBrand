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
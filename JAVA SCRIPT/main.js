/* The Daily Cafe - shared behaviour (Part 3). Every feature checks its element exists first. */
(function () {
  'use strict';
  document.documentElement.classList.add('js');
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var el = function (tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt; 
    return e;
  };

  /* ---------- 1. Mobile navigation ---------- */
  var toggle = $('.nav-toggle'), nav = $('.site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open);
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
  }

  /* ---------- 2. Scroll-reveal animation ---------- */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } });
  }, { threshold: 0.15 }) : null;
  $$('.reveal').forEach(function (n) { io ? io.observe(n) : n.classList.add('in'); });

  /* ---------- 3. "Open now" badge (DOM manipulation) ---------- */
  var badge = $('#open-status');
  if (badge) {
    var HOURS = { 0: null, 1: [7, 17], 2: [7, 17], 3: [7, 17], 4: [7, 17], 5: [7, 17], 6: [8, 15] };
    var now = new Date(), h = HOURS[now.getDay()], hr = now.getHours() + now.getMinutes() / 60;
    var isOpen = h && hr >= h[0] && hr < h[1];
    badge.textContent = isOpen ? 'Open now - until ' + h[1] + ':00' : 'Closed right now - see opening hours below';
    badge.classList.add(isOpen ? 'is-open-now' : 'is-closed-now');
  }

  /* ---------- 4. Dynamic menu: load, tabs, search, sort ---------- */
  var list = $('#menu-list');
  if (list) {
    var MENU = [
      { n: 'Cappuccino', c: 'Coffee', p: 38, d: 'Double espresso, steamed milk, silky foam.' },
      { n: 'Flat White', c: 'Coffee', p: 40, d: 'Locally roasted beans with velvety milk.' },
      { n: 'Latte', c: 'Coffee', p: 42, d: 'Smooth and milky - add vanilla or caramel.' },
      { n: 'Americano', c: 'Coffee', p: 32, d: 'Espresso topped with hot water.' },
      { n: 'Iced Coffee', c: 'Cold drinks', p: 45, d: 'Cold-brewed coffee over ice.' },
      { n: 'Chocolate Shake', c: 'Cold drinks', p: 52, d: 'Thick, creamy and generously chocolatey.' },
      { n: 'Fresh Fruit Smoothie', c: 'Cold drinks', p: 48, d: 'Seasonal fruit blended to order (vegan).' },
      { n: 'Toasted Cheese & Tomato', c: 'Light meals', p: 55, d: 'Toasted sandwich with a side salad (vegetarian).' },
      { n: 'Chicken Wrap', c: 'Light meals', p: 68, d: 'Grilled chicken, greens and house dressing.' },
      { n: 'Garden Salad', c: 'Light meals', p: 60, d: 'Crisp seasonal salad (vegan, gluten-free).' },
      { n: 'Butter Croissant', c: 'Bakery', p: 28, d: 'Flaky, baked fresh every morning.' },
      { n: 'Chocolate Cake Slice', c: 'Bakery', p: 45, d: 'Rich, moist chocolate layer cake.' },
      { n: 'Macaroons (box of 6)', c: 'Bakery', p: 75, d: 'Assorted flavours (gluten-free).' },
      { n: 'Waffle with Syrup', c: 'Bakery', p: 58, d: 'Warm waffle, maple syrup and cream.' }
    ];
    var cats = ['All'].concat(MENU.map(function (m) { return m.c; }).filter(function (c, i, a) { return a.indexOf(c) === i; }));
    var state = { cat: 'All', q: '', sort: 'name' };
    var tabs = $('#menu-tabs'), search = $('#menu-search'), sort = $('#menu-sort'), count = $('#menu-count');

    cats.forEach(function (c, i) {
      var b = el('button', 'tab' + (i === 0 ? ' is-active' : ''), c);
      b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', i === 0);
      b.addEventListener('click', function () {
        $$('.tab', tabs).forEach(function (t) { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
        b.classList.add('is-active'); b.setAttribute('aria-selected', 'true');
        state.cat = c; render();
      });
      tabs.appendChild(b);
    });
    search.addEventListener('input', function () { state.q = search.value.trim().toLowerCase(); render(); });
    sort.addEventListener('change', function () { state.sort = sort.value; render(); });

    function render() {
      var items = MENU.filter(function (m) {
        return (state.cat === 'All' || m.c === state.cat) &&
          (m.n + ' ' + m.d).toLowerCase().indexOf(state.q) !== -1;
      }).sort(function (a, b) {
        return state.sort === 'low' ? a.p - b.p : state.sort === 'high' ? b.p - a.p : a.n.localeCompare(b.n);
      });
      list.textContent = '';
      items.forEach(function (m) {
        var card = el('article', 'menu-item');
        var top = el('div', 'menu-item-top');
        top.appendChild(el('h3', null, m.n));
        top.appendChild(el('span', 'price', 'R' + m.p));
        card.appendChild(top);
        card.appendChild(el('p', null, m.d));
        card.appendChild(el('span', 'cat-tag', m.c));
        list.appendChild(card);
      });
      count.textContent = items.length ? items.length + ' item' + (items.length === 1 ? '' : 's') + ' shown' : 'No items match your search.';
    }
    render();
  }

  /* ---------- 5. Accordion (FAQ) ---------- */
  $$('.acc-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', !open);
      panel.hidden = open;
    });
  });

  /* ---------- 6. Gallery lightbox (modal) ---------- */
  var thumbs = $$('.gallery-item img');
  if (thumbs.length) {
    var idx = 0, lastFocus = null;
    var box = el('div', 'lightbox'); box.hidden = true;
    box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Image viewer');
    var big = el('img'), cap = el('p', 'lb-cap');
    var mk = function (cls, label, txt) { var b = el('button', 'lb-btn ' + cls, txt); b.type = 'button'; b.setAttribute('aria-label', label); return b; };
    var close = mk('lb-close', 'Close image', '\u00D7'), prev = mk('lb-prev', 'Previous image', '\u2039'), next = mk('lb-next', 'Next image', '\u203A');
    [close, prev, big, next, cap].forEach(function (n) { box.appendChild(n); });
    document.body.appendChild(box);
    var show = function (i) {
      idx = (i + thumbs.length) % thumbs.length;
      big.src = thumbs[idx].src; big.alt = thumbs[idx].alt;
      cap.textContent = thumbs[idx].alt + ' (' + (idx + 1) + ' of ' + thumbs.length + ')';
    };
    var open = function (i) { lastFocus = document.activeElement; show(i); box.hidden = false; close.focus(); };
    var shut = function () { box.hidden = true; if (lastFocus) lastFocus.focus(); };
    thumbs.forEach(function (t, i) {
      t.tabIndex = 0; t.style.cursor = 'zoom-in';
      t.addEventListener('click', function () { open(i); });
      t.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); } });
    });
    close.addEventListener('click', shut);
    prev.addEventListener('click', function () { show(idx - 1); });
    next.addEventListener('click', function () { show(idx + 1); });
    box.addEventListener('click', function (e) { if (e.target === box) shut(); });
    document.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      if (e.key === 'Escape') shut();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  /* ---------- 7. Interactive map (Leaflet + OpenStreetMap) ---------- */
  var mapEl = $('#map');
  if (mapEl) {
    if (window.L) {
      var COORDS = [-26.2041, 28.0473];
      var map = L.map(mapEl).setView(COORDS, 15);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
      L.marker(COORDS).addTo(map).bindPopup('<strong>The Daily Cafe</strong><br>Come say hello!').openPopup();
    } else {
      mapEl.textContent = 'The map could not be loaded. Please check your internet connection.';
    }
  }

  /* ---------- 8. Forms: client-side validation, error handling, AJAX ---------- */
  var RULES = {
    name: function (v) { return /^[A-Za-z\u00C0-\u00FF' .-]{2,60}$/.test(v) || 'Enter your full name (letters only, at least 2 characters).'; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || 'Enter a valid email address, e.g. name@example.com.'; },
    phone: function (v) { return !v || /^(\+27|0)\d{9}$/.test(v.replace(/[\s-]/g, '')) || 'Enter a valid South African number, e.g. 063 779 5901.'; },
    message: function (v) { return v.length >= 10 || 'Please write at least 10 characters.'; },
    guests: function (v) { return (/^\d+$/.test(v) && +v >= 10 && +v <= 200) || 'Catering is for 10 to 200 guests.'; },
    date: function (v) {
      if (!v) return 'Please choose an event date.';
      var t = new Date(); t.setHours(0, 0, 0, 0);
      return new Date(v + 'T00:00') > t || 'Please choose a future date.';
    }
  };
  function fieldError(f, msg) {
    var id = f.id + '-error', box = document.getElementById(id);
    if (!box) { box = el('p', 'field-error'); box.id = id; box.setAttribute('role', 'alert'); f.parentNode.appendChild(box); }
    box.textContent = msg || '';
    f.classList.toggle('is-invalid', !!msg);
    f.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (msg) f.setAttribute('aria-describedby', id);
  }
  function check(f) {
    var rule = RULES[f.name];
    if (!rule || f.closest('[hidden]')) return true;
    var r = rule(f.value.trim());
    fieldError(f, r === true ? '' : r);
    return r === true;
  }
  function validate(form) {
    var bad = $$('input, textarea, select', form).filter(function (f) { return !check(f); });
    if (bad.length) bad[0].focus();
    return !bad.length;
  }
  function post(data) { // AJAX: asynchronous POST. Swap the URL for your real form endpoint when you have one.
    return fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
    }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
  }
  function wire(form, onValid) {
    $$('input, textarea', form).forEach(function (f) { f.addEventListener('blur', function () { check(f); }); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(form)) return;
      var btn = $('button[type="submit"]', form), label = btn.textContent;
      btn.disabled = true; btn.textContent = 'Sending...';
      var data = {}; $$('input, textarea, select', form).forEach(function (f) { if (f.name) data[f.name] = f.value.trim(); });
      post(data).then(function () { onValid(data); })
        .catch(function () { showMsg(form, 'Sorry, we could not send that right now. Please check your connection and try again, or call us.', true); })
        .then(function () { btn.disabled = false; btn.textContent = label; });
    });
  }
  function showMsg(form, text, isError, extra) {
    var out = $('.form-success', form);
    out.textContent = ''; out.classList.toggle('is-error', !!isError);
    out.appendChild(el('p', null, text));
    if (extra) out.appendChild(extra);
    out.classList.add('is-visible'); out.focus();
  }

  /* Enquiry form: validated, then answered with a cost / availability response */
  var enq = $('#enquiry-form');
  if (enq) {
    var type = $('#enquiry-type'), cat = $('#catering-fields');
    var syncType = function () { cat.hidden = type.value !== 'catering'; };
    type.addEventListener('change', syncType); syncType();
    var CLOSED = ['2026-12-24', '2026-12-25', '2026-12-26'];
    wire(enq, function (d) {
      if (d.type !== 'catering') {
        return showMsg(enq, 'Thanks ' + d.name.split(' ')[0] + '! We have received your ' + d.type + ' enquiry and will reply to ' + d.email + ' within one business day.');
      }
      var g = +d.guests, rate = g >= 30 ? 85 : 95, total = g * rate;
      var day = new Date(d.date + 'T00:00').getDay();
      var avail = day === 0 ? 'Sorry, we are closed on Sundays - please pick another date.'
        : CLOSED.indexOf(d.date) !== -1 ? 'Sorry, we are closed on that date - please pick another.'
        : 'Good news: ' + d.date + ' is available.';
      showMsg(enq, avail + ' Estimated cost for ' + g + ' guests: R' + total.toLocaleString('en-ZA') +
        ' (R' + rate + ' per person' + (g >= 30 ? ', group discount applied' : '') + '). We will confirm by email.', avail.indexOf('Sorry') === 0);
    });
  }

  /* Contact form: validated, then compiled into an email the customer sends */
  var con = $('#contact-form');
  if (con) {
    wire(con, function (d) {
      var body = 'Name: ' + d.name + '\nEmail: ' + d.email + (d.phone ? '\nPhone: ' + d.phone : '') + '\n\n' + d.message;
      var a = el('a', 'btn-submit btn-link', 'Open in my email app');
      a.href = 'mailto:thedailycafe@gmail.com?subject=' + encodeURIComponent('[' + d.reason + '] Message from ' + d.name) + '&body=' + encodeURIComponent(body);
      showMsg(con, 'Thanks ' + d.name.split(' ')[0] + '! Your message is ready. Click below to send it from your email app.', false, a);
    });
  }
})(jQuery);
//live date and time updater
function updateDateTime(){
  const el=document.getElementById('datetime');
  if(!el)return;
  const options={
     weekday: 'long',
                year:'numeric',
                month: 'long',
                day: 'numeric',
                hour:'2-digit',
                minute:'2-digit',
                second: '2-digit'
  };
  el.textContent=new Date().toLocaleString('en-us',options);

}
updateDateTime();
setInterval(updateDateTime, 1000);

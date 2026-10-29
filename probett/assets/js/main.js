(function(){
  'use strict';

  /* ---------- NAV SCROLL STATE ---------- */
  var nav = document.getElementById('nav');
  function onScroll(){
    if(!nav) return;
    if(window.scrollY > 24){ nav.classList.add('is-scrolled'); }
    else{ nav.classList.remove('is-scrolled'); }
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  /* ---------- MOBILE MENU ---------- */
  var toggle = document.getElementById('navToggle');
  var menu   = document.getElementById('mobileMenu');

  if (toggle && menu) {
    function closeMenu(){
      toggle.classList.remove('is-open');
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded','false');
      toggle.setAttribute('aria-label','Open menu');
      menu.setAttribute('aria-hidden','true');
      document.body.classList.remove('no-scroll');
    }
    toggle.addEventListener('click', function(){
      var open = menu.classList.toggle('is-open');
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.setAttribute('aria-hidden', String(!open));
      document.body.classList.toggle('no-scroll', open);
    });
    menu.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && menu.classList.contains('is-open')){ closeMenu(); }
    });
  }

  /* ---------- REVEAL ON SCROLL ---------- */
var revealEls = document.querySelectorAll('.reveal');

// 1. Immediately reveal anything currently in the viewport.
revealEls.forEach(function(el){
  var rect = el.getBoundingClientRect();
  if (rect.top < window.innerHeight && rect.bottom > 0) {
    el.classList.add('in');
  }
});

// 2. Observe only the ones still hidden, so they animate when scrolled to.
if ('IntersectionObserver' in window) {
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(function(el){
    if (!el.classList.contains('in')) {
      io.observe(el);
    }
  });
} else {
  revealEls.forEach(function(el){ el.classList.add('in'); });
}

// 3. Failsafe: after 1.5s reveal anything in the viewport still stuck hidden.
setTimeout(function(){
  document.querySelectorAll('.reveal:not(.in)').forEach(function(el){
    var rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add('in');
    }
  });
}, 1500);

  /* ---------- COUNTDOWN ---------- */
 var target = new Date('2026-12-19T09:00:00+01:00').getTime();
  var units = {
    days:    document.querySelector('[data-unit="days"]'),
    hours:   document.querySelector('[data-unit="hours"]'),
    minutes: document.querySelector('[data-unit="minutes"]'),
    seconds: document.querySelector('[data-unit="seconds"]')
  };
  function pad(n){ return n < 10 ? '0' + n : String(n); }
  function tick(){
    var diff = target - Date.now();
    if(diff < 0){ diff = 0; }
    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff % 86400000) / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);
    if(units.days)    units.days.textContent    = pad(d);
    if(units.hours)   units.hours.textContent   = pad(h);
    if(units.minutes) units.minutes.textContent = pad(m);
    if(units.seconds) units.seconds.textContent = pad(s);
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- RSVP FORM ---------- */
  var form        = document.getElementById('rsvpForm');
  var success     = document.getElementById('formSuccess');
  var successName = document.getElementById('successName');

  if (form && success) {
    form.addEventListener('submit', async function(e){
      e.preventDefault();

      var firstName    = document.getElementById('firstName');
      var lastName     = document.getElementById('lastName');
      var email        = document.getElementById('email');
      var relationship = document.getElementById('relationship');
      var message      = document.getElementById('message');

      var valid = true;
      [firstName, lastName, email].forEach(function(input){
        input.style.borderBottomColor = '';
        if(!input.value.trim()){ valid = false; input.style.borderBottomColor = '#8f7a62'; }
      });
      if(email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())){
        valid = false;
        email.style.borderBottomColor = '#8f7a62';
      }
      if(!valid){ return; }

      var attending = form.querySelector('input[name="attending"]:checked').value;
      var name = firstName.value.trim();
      if (successName) successName.textContent = name || 'friend';

      // Write to Supabase (silently no-ops if the client isn't loaded)
      var db = window.supabaseInstance || window.supabaseClient;
      if (db && typeof db.from === 'function') {
        try {
          var { error } = await db.from('rsvp_responses').insert({
            first_name:   firstName.value.trim(),
            last_name:    lastName.value.trim(),
            email:        email.value.trim(),
            attending:    attending,
            relationship: relationship ? relationship.value : null,
            note:         message ? message.value.trim() || null : null
          });
          if (error) console.error('RSVP insert failed:', error);
        } catch (err) {
          console.error('RSVP network error:', err);
        }
      } else {
        console.warn('Supabase not available — RSVP shown locally only.');
      }

      // Show the success block
      var heading = success.querySelector('h3');
      var copy    = success.querySelector('p');
      if(attending === 'no'){
        heading.textContent = 'We will miss you, ' + (name || 'friend') + '.';
        copy.textContent = 'Thank you for letting us know — you will be in our thoughts on the day.';
      } else {
        heading.textContent = 'Thank you, ' + (name || 'friend') + '.';
        copy.textContent = 'Your reply has been noted with joy. We cannot wait to celebrate with you.';
      }

      form.style.display = 'none';
      success.classList.add('is-visible');
      success.scrollIntoView({behavior:'smooth', block:'center'});
    });
  }

  /* ---------- DARK / LIGHT THEME CONTROLLER ---------- */
  var themeToggle = document.getElementById('themeToggle');
  var currentTheme = localStorage.getItem('theme') || 'light';

  if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      var theme = document.documentElement.getAttribute('data-theme');
      if (theme === 'dark') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
      }
    });
  }

})();
/* ═══════════════════════════════════════════════════════════
   LOADER — fade out after page load
═══════════════════════════════════════════════════════════ */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  setTimeout(() => {
    loader.classList.add('hidden');
    // Trigger hero entrance after loader disappears
    setTimeout(triggerHero, 400);
  }, 1800);
});

function triggerHero() {
  const classes = ['reveal', 'reveal-d1', 'reveal-d2', 'reveal-d3', 'reveal-d4', 'reveal-d5'];
  classes.forEach(cls => {
    document.querySelectorAll('.' + cls).forEach(el => el.classList.add('active'));
  });
}

/* ═══════════════════════════════════════════════════════════
   FLOATING GOLD PARTICLES
═══════════════════════════════════════════════════════════ */
(function () {
  const canvas = document.getElementById('particles-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function Particle() { this.init(true); }

  Particle.prototype.init = function (scatter) {
    this.x    = Math.random() * W;
    this.y    = scatter ? Math.random() * H : H + 10;
    this.r    = Math.random() * 1.4 + 0.3;
    this.vx   = (Math.random() - 0.5) * 0.28;
    this.vy   = -(Math.random() * 0.45 + 0.18);
    this.base = Math.random() * 0.45 + 0.08;
    this.life = 0;
    this.max  = Math.random() * 220 + 100;
  };

  Particle.prototype.update = function () {
    this.x += this.vx + Math.sin(this.life * 0.022) * 0.28;
    this.y += this.vy;
    this.life++;
    if (this.y < -10 || this.life > this.max) this.init(false);
  };

  Particle.prototype.draw = function () {
    const t    = this.life / this.max;
    const fade = t < 0.15 ? t / 0.15 : t > 0.8 ? (1 - t) / 0.2 : 1;
    ctx.globalAlpha = this.base * fade;
    ctx.fillStyle   = '#C9A84C';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
  };

  const particles = Array.from({ length: 65 }, () => new Particle());

  (function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    ctx.globalAlpha = 1;
    requestAnimationFrame(loop);
  })();
})();

/* ═══════════════════════════════════════════════════════════
   INTERSECTION OBSERVER — scroll fade-up (all sections)
═══════════════════════════════════════════════════════════ */
(function () {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.14 });

  document.querySelectorAll('.fade-up').forEach(el => io.observe(el));
})();

/* ═══════════════════════════════════════════════════════════
   STACKED CARD DECK
═══════════════════════════════════════════════════════════ */
(function () {
  const deck    = document.getElementById('card-deck');
  if (!deck) return;

  const cards   = Array.from(deck.querySelectorAll('.deck-card'));
  const counter = document.getElementById('deck-counter');
  const btnPrev = document.querySelector('.deck-prev');
  const btnNext = document.querySelector('.deck-next');
  const total   = cards.length;
  let animating = false;
  let step      = 1;

  // order[i] = which card index is at visual position i (0 = front)
  let order = cards.map((_, i) => i);

  function applyPositions() {
    order.forEach((cardIdx, pos) => {
      cards[cardIdx].setAttribute('data-pos', Math.min(pos, total - 1));
    });
    counter.textContent = step + ' OF ' + total;
    btnPrev.disabled = step <= 1;
    btnNext.disabled = step >= total;
  }

  function next() {
    if (animating || step >= total) return;
    animating = true;

    const frontIdx = order[0];
    cards[frontIdx].classList.add('fly-left');

    setTimeout(() => {
      cards[frontIdx].classList.remove('fly-left');
      order.push(order.shift());  // rotate front → back
      step++;
      applyPositions();
      animating = false;
    }, 440);
  }

  function prev() {
    if (animating || step <= 1) return;
    animating = true;

    // Last card returns from the left
    const lastIdx = order[order.length - 1];
    cards[lastIdx].classList.add('from-left');

    // Double rAF: set position then remove from-left to trigger transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        order.unshift(order.pop());  // rotate back → front
        step--;
        applyPositions();
        cards[lastIdx].classList.remove('from-left');
        setTimeout(() => { animating = false; }, 440);
      });
    });
  }

  applyPositions();

  btnNext.addEventListener('click', next);
  btnPrev.addEventListener('click', prev);

  // Tap front card = advance
  deck.addEventListener('click', e => {
    const card = e.target.closest('.deck-card');
    if (card && card.getAttribute('data-pos') === '0') next();
  });

  // Touch swipe
  let tx0 = 0;
  deck.addEventListener('touchstart', e => { tx0 = e.touches[0].clientX; }, { passive: true });
  deck.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - tx0;
    if (Math.abs(dx) > 45) dx < 0 ? next() : prev();
  }, { passive: true });
})();

/* ═══════════════════════════════════════════════════════════
   ADD TO CALENDAR — .ics download for Apple / iCal
═══════════════════════════════════════════════════════════ */
(function () {
  const events = {
    reception: {
      summary:  'Kirankishore & Ragapriya — Reception',
      start:    '20260617T133000Z',   // 7:00 PM IST
      end:      '20260617T153000Z',   // 9:00 PM IST
      description: 'You are invited to the wedding reception of Kirankishore & Ragapriya. #kiranraga',
      location: 'Jeevan Jothi Mahal\\, Porur Road\\, Manapakkam\\, Chennai',
      filename: 'reception-kiranraga.ics',
    },
    wedding: {
      summary:  'Kirankishore & Ragapriya — Wedding',
      start:    '20260618T023000Z',   // 8:00 AM IST
      end:      '20260618T040000Z',   // 9:30 AM IST
      description: 'You are invited to the wedding of Kirankishore & Ragapriya. #kiranraga',
      location: 'Jeevan Jothi Mahal\\, Porur Road\\, Manapakkam\\, Chennai',
      filename: 'wedding-kiranraga.ics',
    },
  };

  function buildIcs(ev) {
    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//KiranRaga Wedding//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:' + ev.filename + '@kiranraga',
      'DTSTAMP:20260101T000000Z',
      'DTSTART:' + ev.start,
      'DTEND:'   + ev.end,
      'SUMMARY:' + ev.summary,
      'DESCRIPTION:' + ev.description,
      'LOCATION:' + ev.location,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
  }

  document.querySelectorAll('.cal-apple').forEach(btn => {
    btn.addEventListener('click', () => {
      const ev = events[btn.dataset.event];
      if (!ev) return;
      const blob = new Blob([buildIcs(ev)], { type: 'text/calendar;charset=utf-8' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = ev.filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    });
  });
})();

/* ═══════════════════════════════════════════════════════════
   COUNTDOWN — Reception June 17 2026 6:30 PM IST (UTC+5:30)
═══════════════════════════════════════════════════════════ */
(function () {
  const target = new Date('2026-06-17T13:00:00Z'); // 6:30 PM IST = 13:00 UTC
  const pad    = n => String(n).padStart(2, '0');
  const wrap   = document.querySelector('.countdown-wrap');

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      wrap.innerHTML = '<p class="countdown-label" style="font-size:.9rem;padding:.5rem 0">The celebration has begun! ✦</p>';
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000)  / 60000);
    const s = Math.floor((diff % 60000)    / 1000);

    document.getElementById('cd-days').textContent  = pad(d);
    document.getElementById('cd-hours').textContent = pad(h);
    document.getElementById('cd-mins').textContent  = pad(m);
    document.getElementById('cd-secs').textContent  = pad(s);
  }

  tick();
  setInterval(tick, 1000);
})();

/* ═══════════════════════════════════════════════════════════
   MUSIC TOGGLE + AUTOPLAY
═══════════════════════════════════════════════════════════ */
(function () {
  const btn   = document.getElementById('music-toggle');
  const audio = document.getElementById('bg-music');
  const icon  = document.getElementById('music-icon');
  let   on    = false;

  function startMusic() {
    audio.volume = 0.55;
    audio.play().then(() => {
      icon.textContent = '♪';
      btn.classList.add('playing');
      on = true;
    }).catch(() => {
      // Autoplay blocked — wait for first user interaction
    });
  }

  // Attempt autoplay after loader fades out
  window.addEventListener('load', () => {
    setTimeout(startMusic, 2400);
  });

  // Fallback: play on first interaction if autoplay was blocked
  function onFirstInteraction() {
    if (!on) startMusic();
    document.removeEventListener('click',      onFirstInteraction);
    document.removeEventListener('touchstart', onFirstInteraction);
    document.removeEventListener('scroll',     onFirstInteraction);
  }
  document.addEventListener('click',      onFirstInteraction, { once: true });
  document.addEventListener('touchstart', onFirstInteraction, { once: true, passive: true });
  document.addEventListener('scroll',     onFirstInteraction, { once: true, passive: true });

  // Manual toggle
  btn.addEventListener('click', () => {
    if (on) {
      audio.pause();
      icon.textContent = '♫';
      btn.classList.remove('playing');
      on = false;
    } else {
      startMusic();
    }
  });
})();


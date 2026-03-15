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
   INTERSECTION OBSERVER — scroll fade-up
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
   MUSIC TOGGLE
═══════════════════════════════════════════════════════════ */
(function () {
  const btn   = document.getElementById('music-toggle');
  const audio = document.getElementById('bg-music');
  const icon  = document.getElementById('music-icon');
  let   on    = false;

  btn.addEventListener('click', () => {
    if (on) {
      audio.pause();
      icon.textContent = '♫';
      btn.classList.remove('playing');
      on = false;
    } else {
      audio.play().then(() => {
        icon.textContent = '♪';
        btn.classList.add('playing');
        on = true;
      }).catch(() => {
        // No audio file or autoplay blocked — silent fail
      });
    }
  });
})();

/* ═══════════════════════════════════════════════════════════
   GALLERY LIGHTBOX
═══════════════════════════════════════════════════════════ */
(function () {
  const lb      = document.getElementById('lightbox');
  const lbImg   = document.getElementById('lb-img');
  const btnClose = document.getElementById('lb-close');
  const btnPrev  = document.getElementById('lb-prev');
  const btnNext  = document.getElementById('lb-next');

  const items = Array.from(document.querySelectorAll('.gallery-item'));
  let current = 0;

  function open(i) {
    const img = items[i] && items[i].querySelector('img');
    if (!img || !img.complete || img.naturalWidth === 0) return;
    current    = i;
    lbImg.src  = img.src;
    lbImg.alt  = img.alt;
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lb.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => { lbImg.src = ''; }, 350);
  }

  function nav(dir) {
    current = (current + dir + items.length) % items.length;
    const img = items[current].querySelector('img');
    lbImg.src = img ? img.src : '';
    lbImg.alt = img ? img.alt : '';
  }

  items.forEach((item, i) => item.addEventListener('click', () => open(i)));
  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click',  () => nav(-1));
  btnNext.addEventListener('click',  () => nav(1));
  lb.addEventListener('click', e => { if (e.target === lb) close(); });

  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('active')) return;
    if (e.key === 'Escape')      close();
    if (e.key === 'ArrowLeft')   nav(-1);
    if (e.key === 'ArrowRight')  nav(1);
  });

  // Hide broken images gracefully
  document.querySelectorAll('.gallery-item img').forEach(img => {
    img.addEventListener('error', function () {
      this.style.display = 'none';
    });
  });
})();

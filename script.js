(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  const isMobile = window.innerWidth < 760;

  /* ---------- split hero name into letters ---------- */
  let charIndex = 0;
  $$('[data-split]').forEach(el => {
    const text = el.textContent;
    el.textContent = '';
    el.setAttribute('aria-label', text);
    [...text].forEach(ch => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.setAttribute('aria-hidden', 'true');
      s.style.setProperty('--i', charIndex++);
      s.textContent = ch === ' ' ? '\u00A0' : ch;
      el.appendChild(s);
    });
  });

  /* ---------- preloader ---------- */
  const pre = $('#preloader');
  const bar = $('.pre-bar i');
  const count = $('.pre-count');
  let pct = 0;
  const minTime = new Promise(r => setTimeout(r, reduceMotion ? 100 : 1500));
  const pageLoaded = new Promise(r => {
    if (document.readyState === 'complete') r();
    else window.addEventListener('load', r, { once: true });
    setTimeout(r, 4500);
  });
  const tick = setInterval(() => {
    pct = Math.min(pct + Math.random() * 9 + 3, 92);
    bar.style.width = pct + '%';
    count.textContent = String(Math.floor(pct)).padStart(2, '0') + '%';
  }, 110);
  Promise.all([minTime, pageLoaded]).then(() => {
    clearInterval(tick);
    bar.style.width = '100%';
    count.textContent = '100%';
    setTimeout(() => {
      pre.classList.add('done');
      document.body.classList.remove('is-loading');
      document.body.classList.add('loaded');
      setTimeout(() => pre.remove(), 1100);
    }, 250);
  });

  /* ---------- typing effect ---------- */
  const typed = $('#typed');
  if (typed) {
    const words = ['Software Engineer', 'Flutter Developer', 'Full Stack Developer', 'DBMS Specialist', 'Problem Solver'];
    let w = 0, c = 0, del = false;
    (function type() {
      const word = words[w];
      typed.textContent = word.slice(0, del ? --c : ++c);
      let delay = del ? 40 : 85;
      if (!del && c === word.length) { delay = 1600; del = true; }
      else if (del && c === 0) { del = false; w = (w + 1) % words.length; delay = 350; }
      setTimeout(type, delay);
    })();
  }

  /* ---------- nav ---------- */
  const nav = $('header.nav');
  const links = $('.nav-links');
  const burger = $('.burger');
  burger.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
    burger.innerHTML = open ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
    document.body.style.overflow = open ? 'hidden' : '';
  });
  $$('a', links).forEach(a => a.addEventListener('click', () => {
    links.classList.remove('open');
    burger.innerHTML = '<i class="fa-solid fa-bars"></i>';
    document.body.style.overflow = '';
  }));

  const sections = $$('main section[id]');
  const navAnchors = $$('a', links);
  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => spy.observe(s));

  /* ---------- scroll progress / back to top / nav state ---------- */
  const progress = $('#scroll-progress');
  const toTop = $('.to-top');
  let scrollY = 0;
  function onScroll() {
    scrollY = window.scrollY;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%';
    nav.classList.toggle('scrolled', scrollY > 40);
    toTop.classList.toggle('show', scrollY > 700);
    updateTimeline();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- reveal + meters + counters ---------- */
  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.dec || '0', 10);
    const suffix = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = target.toFixed(dec) + suffix; return; }
    const start = performance.now(), dur = 1800;
    (function step(now) {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      el.textContent = (target * eased).toFixed(dec) + suffix;
      if (t < 1) requestAnimationFrame(step);
    })(start);
  }
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      el.classList.add('in');
      $$('.meter-bar i', el).forEach(b => b.style.width = b.dataset.w + '%');
      $$('[data-count]', el).forEach(animateCount);
      if (el.matches('[data-count]')) animateCount(el);
      revealObs.unobserve(el);
    });
  }, { threshold: 0.12 });
  $$('.reveal').forEach(el => revealObs.observe(el));

  /* ---------- timeline draw ---------- */
  const tl = $('.timeline');
  const tlLine = $('.tl-line');
  function updateTimeline() {
    if (!tl || !tlLine) return;
    const r = tl.getBoundingClientRect();
    const total = r.height - 12;
    const filled = Math.max(0, Math.min(total, window.innerHeight * 0.6 - r.top));
    tlLine.style.height = filled + 'px';
  }

  /* ---------- custom cursor ---------- */
  if (finePointer && !reduceMotion) {
    const ring = $('.cursor'), dot = $('.cursor-dot');
    let mx = 0, my = 0, rx = 0, ry = 0;
    window.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      document.body.classList.add('has-cursor');
      dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
    });
    (function loop() {
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener('mouseover', e => {
      ring.classList.toggle('hover', !!e.target.closest('a,button,.cert,.proj,input,textarea'));
    });
  }

  /* ---------- magnetic buttons + tilt cards ---------- */
  if (finePointer && !reduceMotion) {
    $$('.magnetic').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.28}px,${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
    $$('.tilt').forEach(el => {
      const max = parseFloat(el.dataset.tilt || 7);
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.setProperty('--mx', x * 100 + '%');
        el.style.setProperty('--my', y * 100 + '%');
        el.style.transition = 'transform .1s linear, opacity .4s, border-color .3s';
        el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * max}deg) rotateY(${(x - 0.5) * max * 1.3}deg) translateZ(0)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transition = 'transform .7s cubic-bezier(.22,1,.36,1), opacity .4s, border-color .3s';
        el.style.transform = '';
      });
    });
  } else {
    $$('.proj').forEach(el => el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
      el.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
    }));
  }

  /* ---------- project filters ---------- */
  const filterBtns = $$('.filters button');
  const projCards = $$('.proj');
  filterBtns.forEach(btn => btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    projCards.forEach(card => card.classList.toggle('hide', !(f === 'all' || card.dataset.cat === f)));
  }));

  /* ---------- 3D tag sphere (2D canvas) ---------- */
  (function sphere() {
    const canvas = $('#sphere');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const words = ['Flutter', 'Dart', 'Firebase', 'C++', 'SQL', 'MySQL', 'HTML5', 'CSS3', 'JavaScript', 'React', 'TypeScript',
      'Three.js', 'GSAP', 'Next.js', 'Node.js', 'IndexedDB', 'Git', 'UI/UX', 'Android Studio', 'Vite', 'OOP', 'Data Structures', 'Algorithms', 'ERP'];
    const pts = words.map((w, i) => {
      const k = i + 0.5;
      const phi = Math.acos(1 - 2 * k / words.length);
      const theta = Math.PI * (1 + Math.sqrt(5)) * k;
      return { w, x: Math.cos(theta) * Math.sin(phi), y: Math.sin(theta) * Math.sin(phi), z: Math.cos(phi) };
    });
    let W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    function resize() {
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);
    let ax = 0.0035, ay = 0.0055, dragging = false, lastX = 0, lastY = 0, visible = true;
    canvas.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; lastY = e.clientY; canvas.setPointerCapture(e.pointerId); canvas.style.cursor = 'grabbing'; });
    canvas.addEventListener('pointerup', () => { dragging = false; canvas.style.cursor = 'grab'; });
    canvas.addEventListener('pointermove', e => {
      if (dragging) {
        ay = (e.clientX - lastX) * 0.0009; ax = -(e.clientY - lastY) * 0.0009;
        lastX = e.clientX; lastY = e.clientY;
      }
    });
    new IntersectionObserver(en => { visible = en[0].isIntersecting; }, { threshold: 0.05 }).observe(canvas);
    function rotate(p) {
      const cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax);
      let x = p.x * cy + p.z * sy, z = -p.x * sy + p.z * cy;
      let y = p.y * cx - z * sx; z = p.y * sx + z * cx;
      p.x = x; p.y = y; p.z = z;
    }
    (function draw() {
      requestAnimationFrame(draw);
      if (!visible) return;
      if (!dragging) { ay += (0.0055 - ay) * 0.02; ax += (0.0035 - ax) * 0.02; }
      ctx.clearRect(0, 0, W, H);
      const R = Math.min(W, H) * 0.38;
      pts.forEach(rotate);
      [...pts].sort((a, b) => a.z - b.z).forEach(p => {
        const scale = 0.55 + (p.z + 1) * 0.45;
        const alpha = 0.25 + (p.z + 1) * 0.375;
        ctx.font = `600 ${Math.round(14 * scale + 3)}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = p.z > 0.35 ? `rgba(255,143,177,${alpha})` : `rgba(247,239,252,${alpha * 0.8})`;
        ctx.fillText(p.w, W / 2 + p.x * R * 1.15, H / 2 + p.y * R);
      });
    })();
  })();

  /* ---------- certificate modal ---------- */
  const modal = $('#cert-modal');
  const mBody = $('#cert-body');
  const mTitle = $('#cert-title');
  const mDl = $('#cert-dl');
  let lastFocus = null;
  function openCert(card) {
    const { src, type, title } = card.dataset;
    lastFocus = card;
    mTitle.textContent = title || 'Certificate';
    mDl.href = src;
    mBody.innerHTML = '';
    if (type === 'pdf') {
      const f = document.createElement('iframe'); f.src = src; f.title = title; mBody.appendChild(f);
    } else {
      const im = document.createElement('img'); im.src = src; im.alt = title; mBody.appendChild(im);
    }
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    $('.modal-close', modal).focus();
  }
  function closeCert() {
    modal.classList.remove('open');
    mBody.innerHTML = '';
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  $$('.cert.clickable').forEach(card => card.addEventListener('click', () => openCert(card)));
  $$('[data-close]', modal).forEach(el => el.addEventListener('click', closeCert));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) closeCert(); });

  /* ---------- toast + copy email ---------- */
  const toast = $('#toast');
  let toastT;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => toast.classList.remove('show'), 2300);
  }
  const copyBtn = $('#copy-email');
  if (copyBtn) copyBtn.addEventListener('click', async e => {
    e.preventDefault(); e.stopPropagation();
    const email = 'Sohailmahnoor52@gmail.com';
    try { await navigator.clipboard.writeText(email); showToast('Email copied to clipboard!'); }
    catch { window.location.href = 'mailto:' + email; }
  });

  /* ---------- contact form (EmailJS) ---------- */
  const form = $('#contact-form');
  const msgEl = $('#form-msg');
  const EMAILJS_SERVICE_ID = 'service_ibbjotb';
  const EMAILJS_TEMPLATE_ID = 'template_unsrnfg';
  const EMAILJS_PUBLIC_KEY = 'R0kjMRKtYDU6kZ9xL';
  if (window.emailjs) emailjs.init(EMAILJS_PUBLIC_KEY);
  function feedback(text, type) {
    msgEl.textContent = text;
    msgEl.className = 'form-msg ' + type;
    msgEl.style.opacity = '1';
    setTimeout(() => { msgEl.style.opacity = '0'; }, 6000);
  }
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = $('.btn-submit', form);
    const name = $('#name').value.trim(), email = $('#email').value.trim();
    const subject = $('#subject').value.trim(), message = $('#message').value.trim();
    if (!name || !email || !subject || !message) return feedback('Please fill in all details.', 'error');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return feedback('Please enter a valid email address.', 'error');
    btn.disabled = true;
    btn.innerHTML = 'Sending… <i class="fa-solid fa-spinner fa-spin"></i>';
    const reset = () => { btn.disabled = false; btn.innerHTML = 'Send Message <i class="fa-solid fa-paper-plane"></i>'; };
    if (window.emailjs) {
      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, { name, email, title: subject, message, time: new Date().toLocaleString() })
        .then(() => { feedback(`Thank you, ${name}! Your message has been sent successfully.`, 'success'); form.reset(); })
        .catch(err => {
          const detail = err && (err.text || err.message) ? ` (${err.text || err.message})` : '';
          feedback(`Something went wrong sending your message${detail}. Please email me directly.`, 'error');
        })
        .finally(reset);
    } else {
      window.location.href = `mailto:Sohailmahnoor52@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`From: ${name} (${email})\n\n${message}`)}`;
      feedback(`Opening your mail app, ${name}!`, 'success');
      form.reset(); reset();
    }
  });

  /* ---------- Three.js hero orb ---------- */
  (function orb() {
    const canvas = $('#bg-canvas');
    if (!canvas || !window.THREE) { canvas && (canvas.style.display = 'none'); return; }
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' }); }
    catch (e) { canvas.style.display = 'none'; return; }
    const pr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(pr);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.z = 8;
    const group = new THREE.Group();
    scene.add(group);

    const N = isMobile ? 2400 : 6200;
    const pos = new Float32Array(N * 3), rnd = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const k = i + 0.5, phi = Math.acos(1 - 2 * k / N), theta = Math.PI * (1 + Math.sqrt(5)) * k;
      const r = 2.25 + (Math.random() - 0.5) * 0.12;
      pos[i * 3] = Math.cos(theta) * Math.sin(phi) * r;
      pos[i * 3 + 1] = Math.sin(theta) * Math.sin(phi) * r;
      pos[i * 3 + 2] = Math.cos(phi) * r;
      rnd[i] = Math.random();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aRand', new THREE.BufferAttribute(rnd, 1));
    const mat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uPx: { value: pr } },
      vertexShader: `
        uniform float uTime; uniform float uPx; attribute float aRand;
        varying float vMix; varying float vAlpha;
        void main(){
          vec3 p = position;
          float n = sin(p.x*1.5+uTime*.8)+sin(p.y*1.8+uTime*.9)+sin(p.z*1.6+uTime*.7);
          p += normalize(p)*n*.17;
          p += normalize(p)*sin(uTime*1.3+aRand*6.2831)*.035;
          vMix = (p.y+2.7)/5.4;
          vec4 mv = modelViewMatrix*vec4(p,1.);
          gl_PointSize = (2.0+aRand*2.4)*uPx*(9./-mv.z);
          vAlpha = .45+.55*aRand;
          gl_Position = projectionMatrix*mv;
        }`,
      fragmentShader: `
        varying float vMix; varying float vAlpha;
        void main(){
          vec2 c = gl_PointCoord-.5; float d = length(c); if(d>.5) discard;
          float a = smoothstep(.5,.0,d);
          vec3 c1=vec3(1.,.56,.69), c2=vec3(.71,.61,1.), c3=vec3(.5,.84,1.);
          vec3 col = mix(c1,c2,smoothstep(0.,.5,vMix)); col = mix(col,c3,smoothstep(.5,1.,vMix));
          gl_FragColor = vec4(col,a*vAlpha);
        }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    });
    const points = new THREE.Points(geo, mat);
    group.add(points);

    const ringMat = (c, o) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o });
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(3.25, 0.012, 8, 220), ringMat(0xff8fb1, 0.6));
    ring1.rotation.x = 1.25;
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(3.75, 0.009, 8, 220), ringMat(0xb69cff, 0.45));
    ring2.rotation.set(0.5, 0.7, 0);
    group.add(ring1, ring2);

    const sats = [];
    [[0xff8fb1, 0.2], [0x7fd6ff, 0.16], [0xffd29e, 0.14]].forEach(([c, s], i) => {
      const m = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 0), new THREE.MeshBasicMaterial({ color: c, wireframe: true }));
      m.userData = { r: 3.3 + i * 0.35, sp: 0.45 + i * 0.22, ph: i * 2.1, tilt: 0.4 + i * 0.5 };
      group.add(m); sats.push(m);
    });

    let tx = 0, ty = 0, vw = 0, vh = 0, homeX = 0, scale = 1;
    function resize() {
      vw = window.innerWidth; vh = window.innerHeight;
      renderer.setSize(vw, vh, false);
      camera.aspect = vw / vh; camera.updateProjectionMatrix();
      if (vw > 900) { homeX = 3.1; scale = 1; } else { homeX = 0; scale = vw < 520 ? 0.62 : 0.8; }
    }
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', e => { tx = (e.clientX / vw - 0.5) * 2; ty = (e.clientY / vh - 0.5) * 2; });
    window.addEventListener('deviceorientation', e => { if (e.gamma != null) { tx = Math.max(-1, Math.min(1, e.gamma / 35)); ty = Math.max(-1, Math.min(1, (e.beta - 45) / 35)); } });

    const clock = new THREE.Clock();
    const speed = reduceMotion ? 0.15 : 1;
    let visible = true;
    document.addEventListener('visibilitychange', () => { visible = !document.hidden; });
    (function frame() {
      requestAnimationFrame(frame);
      if (!visible) return;
      const t = clock.getElapsedTime() * speed;
      const sy = window.scrollY;
      const heroFade = Math.max(0, 1 - sy / (vh * 0.95));
      canvas.style.opacity = (0.14 + 0.86 * heroFade).toFixed(3);
      if (sy > vh * 1.8) return;           // skip rendering when far from hero
      mat.uniforms.uTime.value = t;
      group.rotation.y += (tx * 0.6 - group.rotation.y) * 0.04 + 0.0025 * speed;
      group.rotation.x += (ty * 0.35 - group.rotation.x) * 0.04;
      const targetX = homeX - (1 - heroFade) * homeX * 0.2;
      group.position.x += (targetX - group.position.x) * 0.06;
      group.position.y = -sy * 0.0035 + Math.sin(t * 0.9) * 0.12;
      const s = scale * (1 + (1 - heroFade) * 0.15);
      group.scale.setScalar(s);
      ring1.rotation.z = t * 0.35; ring2.rotation.z = -t * 0.22; ring2.rotation.x = 0.5 + Math.sin(t * 0.4) * 0.2;
      sats.forEach(m => {
        const u = m.userData, a = t * u.sp + u.ph;
        m.position.set(Math.cos(a) * u.r, Math.sin(a * 0.8) * u.r * 0.45 * Math.sin(u.tilt), Math.sin(a) * u.r);
        m.rotation.x = t; m.rotation.y = t * 0.7;
      });
      renderer.render(scene, camera);
    })();
  })();

  onScroll();
})();

/* ============================================================
   GREGORY & LILLY — WEDDING INVITATION
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- OPEN INVITATION -> HERO TRANSITION ---------- */
  const openSection   = document.getElementById('open');
  const openBtn        = document.getElementById('openBtn');
  const openingVideo   = document.getElementById('openingVideo');
  const openPoster     = document.getElementById('openPoster');
  const heroVideo      = document.getElementById('heroVideo');
  const heroPoster     = document.getElementById('heroPoster');

  let opened = false;

  function primeHeroVideo(){
    // Load and attempt to play the hero video muted; fall back to poster silently.
    heroVideo.load();
    const playPromise = heroVideo.play();
    if (playPromise !== undefined){
      playPromise.then(() => {
        heroVideo.style.opacity = '1';
      }).catch(() => {
        // Autoplay blocked — keep poster visible, try again on first user scroll/tap.
        const retry = () => {
          heroVideo.play().then(() => { heroVideo.style.opacity = '1'; }).catch(()=>{});
          window.removeEventListener('scroll', retry);
          window.removeEventListener('touchstart', retry);
        };
        window.addEventListener('scroll', retry, { once:true, passive:true });
        window.addEventListener('touchstart', retry, { once:true, passive:true });
      });
    }
  }

  function finishOpening(){
    openSection.classList.add('opened');
    setTimeout(() => {
      openSection.style.display = 'none';
      document.body.style.overflow = 'auto';
      document.getElementById('hero').scrollIntoView({ behavior: 'auto' });
    }, 1200);
  }

  function openInvitation(){
    if (opened) return;
    opened = true;

    // Fade the overlay text/button away first, letting the opening video take over the screen.
    openSection.classList.add('revealing');

    openingVideo.style.display = 'block';
    openingVideo.muted = true;
    openingVideo.currentTime = 0;

    const playPromise = openingVideo.play();

    // Prime the hero video partway through the opening clip so it's ready the instant we arrive.
    setTimeout(primeHeroVideo, 3500);

    let settled = false;
    const proceed = () => {
      if (settled) return;
      settled = true;
      finishOpening();
    };

    openingVideo.addEventListener('ended', proceed, { once: true });
    // Safety net in case autoplay of the opening clip is blocked or metadata is slow.
    setTimeout(proceed, 8600);

    if (playPromise !== undefined){
      playPromise.catch(() => {
        // Could not play the opening clip (e.g. blocked) — proceed straight to the hero.
        setTimeout(proceed, 600);
      });
    }
  }

  // Lock scroll until opened (mobile-first single-gesture invitation)
  document.body.style.overflow = 'hidden';
  openBtn.addEventListener('click', openInvitation);
  openBtn.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') openInvitation(); });
  openBtn.setAttribute('tabindex', '0');
  openBtn.setAttribute('role', 'button');

  /* ---------- SCROLL REVEAL ---------- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-scale, .reveal-portrait');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => io.observe(el));

  /* ---------- LIVE COUNTDOWN ---------- */
  // Wedding: 07 November 2026, Marriage Talk 3:00 PM IST
  const weddingDate = new Date('2026-11-07T15:00:00+05:30').getTime();
  const cdDays  = document.getElementById('cd-days');
  const cdHours = document.getElementById('cd-hours');
  const cdMins  = document.getElementById('cd-mins');
  const cdSecs  = document.getElementById('cd-secs');
  const pad = n => String(n).padStart(2, '0');

  function updateCountdown(){
    const now = Date.now();
    let diff = weddingDate - now;
    if (diff < 0) diff = 0;
    const days  = Math.floor(diff / (1000*60*60*24));
    const hours = Math.floor((diff / (1000*60*60)) % 24);
    const mins  = Math.floor((diff / (1000*60)) % 60);
    const secs  = Math.floor((diff / 1000) % 60);
    if (cdDays)  cdDays.textContent  = pad(days);
    if (cdHours) cdHours.textContent = pad(hours);
    if (cdMins)  cdMins.textContent  = pad(mins);
    if (cdSecs)  cdSecs.textContent  = pad(secs);
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ---------- VENUE MAP LINKS ---------- */
  const receptionLink = document.getElementById('receptionMapLink');
  if (receptionLink){
    receptionLink.href = 'https://maps.app.goo.gl/xJnUCw9fipkc2CsVA?g_st=ic';
  }

  const bgMusic     = document.getElementById('bgMusic');
  const musicToggle = document.getElementById('musicToggle');
  let musicStarted = false;

  function startMusic(){
    if (musicStarted) return;
    musicStarted = true;
    bgMusic.volume = 0.55;
    bgMusic.play().then(() => {
      musicToggle.classList.add('playing');
    }).catch(() => { /* autoplay blocked — user can start via the toggle */ });
    musicToggle.classList.add('show');
  }

  musicToggle.addEventListener('click', () => {
    if (bgMusic.paused){
      bgMusic.play().then(() => musicToggle.classList.add('playing')).catch(()=>{});
    } else {
      bgMusic.pause();
      musicToggle.classList.remove('playing');
    }
  });

  // Start music the moment the guest opens the invitation (counts as a user gesture).
  openBtn.addEventListener('click', startMusic);

  /* ---------- LEAVE A MESSAGE (comments under Moments) ---------- */
  const commentForm  = document.getElementById('commentForm');
  const commentList  = document.getElementById('commentList');
  const commentEmpty = document.getElementById('commentEmpty');

  function timeAgo(iso){
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return mins + 'm ago';
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h ago';
    const days = Math.floor(hrs / 24);
    return days + 'd ago';
  }

  function loadComments(){
    let list = [];
    try { list = JSON.parse(localStorage.getItem('gs_comments') || '[]'); } catch(err){ list = []; }
    commentList.innerHTML = '';
    if (!list.length){
      commentList.appendChild(commentEmpty);
      return;
    }
    list.slice().reverse().forEach(c => {
      const item = document.createElement('div');
      item.className = 'comment-item';
      const nameEl = document.createElement('div');
      nameEl.className = 'cname';
      nameEl.textContent = c.name;
      const msgEl = document.createElement('div');
      msgEl.className = 'cmsg';
      msgEl.textContent = c.message;
      const whenEl = document.createElement('div');
      whenEl.className = 'cwhen';
      whenEl.textContent = timeAgo(c.submittedAt);
      item.appendChild(nameEl);
      item.appendChild(msgEl);
      item.appendChild(whenEl);
      commentList.appendChild(item);
    });
  }

  if (commentForm){
    commentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('commentName').value.trim();
      const message = document.getElementById('commentMessage').value.trim();
      if (!name || !message) return;

      let list = [];
      try { list = JSON.parse(localStorage.getItem('gs_comments') || '[]'); } catch(err){ list = []; }
      list.push({ name, message, submittedAt: new Date().toISOString() });
      try { localStorage.setItem('gs_comments', JSON.stringify(list)); } catch(err){ /* storage unavailable */ }

      commentForm.reset();
      loadComments();
    });
    loadComments();
  }

});

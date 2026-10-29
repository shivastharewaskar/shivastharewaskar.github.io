/**
 * Shivastha Rewaskar - Portfolio Scripts
 * Handles mobile navigation, canvas background, email copy interaction, and smooth transitions
 */

(function () {
  'use strict';

  // --- Mobile Drawer Navigation ---
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', function () {
      const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', !isExpanded);
      mobileDrawer.classList.toggle('is-open', !isExpanded);
    });

    mobileLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileDrawer.classList.remove('is-open');
      });
    });
  }

  // --- Toast Notification System ---
  const copyToast = document.getElementById('copy-toast');
  let toastTimeout;

  function showToast(message) {
    if (!copyToast) return;
    copyToast.textContent = message;
    copyToast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(function () {
      copyToast.classList.remove('show');
    }, 2800);
  }

  // --- Copy Email to Clipboard ---
  const copyEmailBtns = document.querySelectorAll('[data-copy-trigger]');
  copyEmailBtns.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const targetSelector = this.getAttribute('data-copy-target');
      const targetEl = document.querySelector(targetSelector);
      const email = targetEl ? targetEl.textContent.trim() : 'shivastharewaskar@gmail.com';

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email)
          .then(() => showToast(`Copied "${email}" to clipboard!`))
          .catch(fallbackCopy);
      } else {
        fallbackCopy();
      }

      function fallbackCopy() {
        const textarea = document.createElement('textarea');
        textarea.value = email;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
          showToast(`Copied "${email}" to clipboard!`);
        } catch (err) {
          console.error('Failed to copy', err);
        }
        document.body.removeChild(textarea);
      }
    });
  });

  // --- Placeholder Link Interceptor (Prevents dead/broken jumps) ---
  const placeholderLinks = document.querySelectorAll('[data-placeholder-notice]');
  placeholderLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      const notice = this.getAttribute('data-placeholder-notice');
      if (notice) {
        e.preventDefault();
        showToast(notice);
      }
    });
  });

  // --- Subtle Technical Canvas Particle Background ---
  const canvas = document.getElementById('bg-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height, dpr;
    let particles = [];
    const maxDistance = 140;

    function resize() {
      dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.scale(dpr, dpr);
      initParticles();
    }

    function initParticles() {
      particles = [];
      const count = Math.floor((width * height) / 22000);
      const safeCount = Math.min(Math.max(count, 25), 60);

      for (let i = 0; i < safeCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          radius: Math.random() * 1.5 + 0.8,
          alpha: Math.random() * 0.35 + 0.15,
        });
      }
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        // Move
        p1.x += p1.vx;
        p1.y += p1.vy;

        // Wrap around bounds
        if (p1.x < 0) p1.x = width;
        if (p1.x > width) p1.x = 0;
        if (p1.y < 0) p1.y = height;
        if (p1.y > height) p1.y = 0;

        // Render point
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(168, 85, 247, ${p1.alpha})`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const lineAlpha = (1 - dist / maxDistance) * 0.12;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(148, 163, 184, ${lineAlpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    resize();
    animate();
  }

  // --- Interactive Programmer Background Video System ---
  function initBgVideo() {
    const wrapper = document.getElementById('video-bg-wrapper');
    if (!wrapper) return;

    const videos = {
      sleep: document.getElementById('vid-sleep'),
      wake: document.getElementById('vid-wake'),
      code: document.getElementById('vid-code'),
      relaxEnter: document.getElementById('vid-relax-enter'),
      relaxIdle: document.getElementById('vid-relax-idle'),
      relaxExit: document.getElementById('vid-relax-exit')
    };

    if (!videos.sleep) return;

    const State = {
      SLEEPING: 'SLEEPING',
      WAKING: 'WAKING',
      CODING: 'CODING',
      RELAX_ENTER: 'RELAX_ENTER',
      RELAX_IDLE: 'RELAX_IDLE',
      RELAX_EXIT: 'RELAX_EXIT'
    };

    let currentState = State.SLEEPING;
    let hasAwoken = false;
    let currentVideo = videos.sleep;
    let transitionTimer = null;
    let idleTimer = null;
    const IDLE_DELAY_MS = 2500; // 2.5s inactivity threshold before relaxing

    function transitionTo(targetVideo, newState, onEnded, crossfadeMs) {
      if (!targetVideo) return;
      if (currentVideo === targetVideo && targetVideo.classList.contains('active')) return;

      if (transitionTimer) {
        clearTimeout(transitionTimer);
        transitionTimer = null;
      }

      const previousVideo = currentVideo;
      currentVideo = targetVideo;
      currentState = newState;

      targetVideo.currentTime = 0;
      targetVideo.onended = onEnded || null;

      const playPromise = targetVideo.play();
      if (playPromise !== undefined) {
        playPromise.then(function () {
          targetVideo.classList.add('active');
          if (previousVideo && previousVideo !== targetVideo) {
            previousVideo.classList.remove('active');
            transitionTimer = setTimeout(function () {
              previousVideo.pause();
              transitionTimer = null;
            }, crossfadeMs || 600);
          }
        }).catch(function (err) {
          console.warn('Video playback notice:', err);
        });
      }
    }

    function triggerWake() {
      if (hasAwoken || currentState !== State.SLEEPING) return;
      hasAwoken = true;
      removeWakeListeners();

      transitionTo(videos.wake, State.WAKING, function () {
        startCoding();
      }, 750);
    }

    function startCoding() {
      transitionTo(videos.code, State.CODING, null, 500);
      resetIdleTimer();
    }

    function startRelaxing() {
      if (currentState !== State.CODING) return;

      transitionTo(videos.relaxEnter, State.RELAX_ENTER, function () {
        if (currentState === State.RELAX_ENTER) {
          transitionTo(videos.relaxIdle, State.RELAX_IDLE, null, 400);
        }
      }, 500);
    }

    function resumeCoding() {
      if (currentState === State.RELAX_ENTER || currentState === State.RELAX_IDLE) {
        if (idleTimer) clearTimeout(idleTimer);

        transitionTo(videos.relaxExit, State.RELAX_EXIT, function () {
          startCoding();
        }, 400);
      } else if (currentState === State.CODING) {
        resetIdleTimer();
      }
    }

    function resetIdleTimer() {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(function () {
        startRelaxing();
      }, IDLE_DELAY_MS);
    }

    function onUserActivity() {
      if (!hasAwoken) {
        triggerWake();
        return;
      }

      if (currentState === State.CODING) {
        resetIdleTimer();
      } else if (currentState === State.RELAX_ENTER || currentState === State.RELAX_IDLE) {
        resumeCoding();
      }
    }

    const wakeEvents = ['scroll', 'wheel', 'touchstart', 'keydown'];
    function onFirstWakeEvent(e) {
      if (e.type === 'keydown') {
        const keys = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Space', 'Tab', 'Home', 'End'];
        if (!keys.includes(e.code) && !keys.includes(e.key)) return;
      }
      triggerWake();
    }

    function addWakeListeners() {
      wakeEvents.forEach(function (evt) {
        window.addEventListener(evt, onFirstWakeEvent, { passive: true, once: true });
      });
      document.addEventListener('click', onFirstWakeEvent, { once: true });
    }

    function removeWakeListeners() {
      wakeEvents.forEach(function (evt) {
        window.removeEventListener(evt, onFirstWakeEvent);
      });
      document.removeEventListener('click', onFirstWakeEvent);
    }

    let lastActivity = 0;
    function handleActivity() {
      const now = Date.now();
      if (now - lastActivity > 100) {
        lastActivity = now;
        onUserActivity();
      }
    }

    window.addEventListener('scroll', handleActivity, { passive: true });
    window.addEventListener('wheel', handleActivity, { passive: true });
    window.addEventListener('touchmove', handleActivity, { passive: true });
    document.addEventListener('click', handleActivity, { passive: true });
    document.addEventListener('keydown', function (e) {
      const keys = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Space', 'Tab'];
      if (keys.includes(e.code) || keys.includes(e.key)) {
        handleActivity();
      }
    }, { passive: true });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        if (currentVideo && !currentVideo.paused) currentVideo.pause();
      } else {
        if (currentVideo && currentVideo.paused) {
          currentVideo.play().catch(function () {});
        }
      }
    });

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      Object.values(videos).forEach(function (v) {
        if (v) v.playbackRate = 0.5;
      });
    }

    videos.sleep.play().catch(function () {});
    addWakeListeners();
  }

  initBgVideo();

  // --- Smooth Anchor Navigation ---
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerOffset = 70;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

})();

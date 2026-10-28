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

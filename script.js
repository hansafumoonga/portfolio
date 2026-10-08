/* Portfolio scripts: reveal animations, count-up numbers, navigation, back-to-top and the image viewer. */
(function () {
    'use strict';

    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Footer year
    document.querySelectorAll('.js-year').forEach(function (el) { el.textContent = new Date().getFullYear(); });

    // ---- Reveal on scroll ----
    // Cards get a small staggered delay while they appear; the delay is removed afterwards so hover effects feel instant.
    document.querySelectorAll('.row, .portfolio-grid, .work-grid').forEach(function (container) {
        container.querySelectorAll(':scope > .fade-in').forEach(function (item, index) {
            item.style.transitionDelay = (index * 0.1) + 's';
        });
    });
    var fadeEls = document.querySelectorAll('.fade-in');
    if (reduceMotion || !('IntersectionObserver' in window)) {
        fadeEls.forEach(function (el) { el.classList.add('visible'); el.style.transitionDelay = '0s'; });
    } else {
        var reveal = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var el = entry.target;
                el.classList.add('visible');
                reveal.unobserve(el);
                setTimeout(function () { el.style.transitionDelay = '0s'; }, 1200);
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        fadeEls.forEach(function (el) { reveal.observe(el); });
    }

    // ---- Count-up numbers (2+, 50+, 8, 100%) ----
    document.querySelectorAll('.stat-number[data-count]').forEach(function (el) {
        var target = parseInt(el.getAttribute('data-count'), 10), suffix = el.getAttribute('data-suffix') || '';
        if (reduceMotion || !('IntersectionObserver' in window)) return;
        el.textContent = '0' + suffix;
        var io = new IntersectionObserver(function (entries) {
            if (!entries[0].isIntersecting) return;
            io.disconnect();
            var start = performance.now(), dur = 1400;
            (function tick(now) {
                var k = Math.min(1, (now - start) / dur), eased = 1 - Math.pow(1 - k, 3);
                el.textContent = Math.round(target * eased) + suffix;
                if (k < 1) requestAnimationFrame(tick);
            })(start);
        }, { threshold: 0.5 });
        io.observe(el);
    });

    // ---- Navbar shadow, back-to-top button, active link (one light scroll handler) ----
    var navbar = document.querySelector('.navbar');
    var toTop = document.getElementById('backToTop');
    var sections = Array.prototype.slice.call(document.querySelectorAll('section[id]'));
    var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));
    var inPage = navLinks.some(function (l) { return (l.getAttribute('href') || '').charAt(0) === '#'; });
    var ticking = false;
    function onScroll() {
        ticking = false;
        var y = window.scrollY;
        if (navbar) navbar.classList.toggle('scrolled', y > 50);
        if (toTop) toTop.classList.toggle('show', y > 700);
        if (!inPage) return;
        var current = '';
        sections.forEach(function (s) { if (y >= s.offsetTop - 120) current = s.id; });
        navLinks.forEach(function (l) {
            var h = l.getAttribute('href') || '';
            if (h.charAt(0) === '#') l.classList.toggle('active', h === '#' + current);
            else if (h === 'mywork.html') l.classList.toggle('active', current === 'work');   // the Featured Work section belongs to "My Works"
        });
    }
    window.addEventListener('scroll', function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(onScroll);
        setTimeout(function () { if (ticking) onScroll(); }, 120);     // if the browser pauses frames (background tab), still keep the menu and button up to date
    }, { passive: true });
    onScroll();
    if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); });

    // ---- Smooth scrolling for in-page links (and close the phone menu afterwards) ----
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var id = anchor.getAttribute('href');
            if (!id || id === '#') return;
            var target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 76, behavior: reduceMotion ? 'auto' : 'smooth' });
            if (history.replaceState) history.replaceState(null, '', id);
            var menu = document.getElementById('navbarNav');
            if (menu && menu.classList.contains('show') && window.bootstrap) window.bootstrap.Collapse.getOrCreateInstance(menu).hide();
        });
    });
    // Links to other pages with a #section (index.html#about): also close the menu
    document.querySelectorAll('.navbar .nav-link').forEach(function (l) {
        l.addEventListener('click', function () {
            var menu = document.getElementById('navbarNav');
            if (menu && menu.classList.contains('show') && window.bootstrap) window.bootstrap.Collapse.getOrCreateInstance(menu).hide();
        });
    });

    // ---- Image viewer (lightbox) ----
    var lightbox = document.getElementById('imageLightbox');
    var lightboxImage = document.getElementById('lightboxImage');
    var counter = document.getElementById('lightboxCounter');
    var btnClose = document.getElementById('lightboxClose');
    var btnPrev = document.getElementById('lightboxPrev');
    var btnNext = document.getElementById('lightboxNext');
    var items = Array.prototype.slice.call(document.querySelectorAll('.portfolio-item, .work-item'));
    var index = 0, opener = null;
    if (!lightbox || !lightboxImage || !items.length) return;

    function show(i) {
        index = (i + items.length) % items.length;
        var item = items[index], img = item.querySelector('img');
        lightboxImage.src = item.getAttribute('data-image');
        lightboxImage.alt = img ? img.alt : '';
        if (counter) counter.textContent = (index + 1) + ' / ' + items.length;
        var next = new Image(); next.src = items[(index + 1) % items.length].getAttribute('data-image');   // warm the next picture
    }
    function open(i, from) {
        opener = from || null;
        show(i);
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (btnClose) btnClose.focus();
    }
    function close() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        lightboxImage.removeAttribute('src');
        if (opener && opener.focus) opener.focus();
    }
    items.forEach(function (item, i) {
        item.addEventListener('click', function () { open(i, item); });
        item.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i, item); } });
    });
    if (btnClose) btnClose.addEventListener('click', close);
    if (btnPrev) btnPrev.addEventListener('click', function () { show(index - 1); });
    if (btnNext) btnNext.addEventListener('click', function () { show(index + 1); });
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) close(); });
    document.addEventListener('keydown', function (e) {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') close();
        else if (e.key === 'ArrowLeft') show(index - 1);
        else if (e.key === 'ArrowRight') show(index + 1);
        else if (e.key === 'Tab') {                                   // keep keyboard focus inside the viewer
            var f = [btnClose, btnPrev, btnNext].filter(Boolean), first = f[0], last = f[f.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
    });
    // Swipe left / right on a phone
    var sx = 0, sy = 0;
    lightbox.addEventListener('touchstart', function (e) { sx = e.changedTouches[0].clientX; sy = e.changedTouches[0].clientY; }, { passive: true });
    lightbox.addEventListener('touchend', function (e) {
        var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) show(index + (dx < 0 ? 1 : -1));
    }, { passive: true });
})();

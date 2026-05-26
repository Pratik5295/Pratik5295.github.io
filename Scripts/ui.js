(function () {

    // ---- Scroll Progress Bar ----
    var progressBar = document.getElementById('scroll-progress');
    function updateProgress() {
        if (!progressBar) return;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        progressBar.style.width = (docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0) + '%';
    }

    // ---- Back to Top ----
    var backToTop = document.getElementById('back-to-top');
    function updateBackToTop() {
        if (!backToTop) return;
        backToTop.classList.toggle('visible', window.scrollY > 400);
    }
    if (backToTop) {
        backToTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    window.addEventListener('scroll', function () {
        updateProgress();
        updateBackToTop();
    }, { passive: true });
    updateProgress();
    updateBackToTop();

    // ---- Toast ----
    function showToast(message) {
        var existing = document.getElementById('toast-notification');
        if (existing) existing.remove();
        var toast = document.createElement('div');
        toast.id = 'toast-notification';
        toast.textContent = message;
        document.body.appendChild(toast);
        requestAnimationFrame(function () { toast.classList.add('visible'); });
        setTimeout(function () {
            toast.classList.remove('visible');
            setTimeout(function () { if (toast.parentNode) toast.remove(); }, 400);
        }, 2200);
    }
    window.showToast = showToast;

    // Email copy — delegated so it works on async-loaded navbar/footer
    document.body.addEventListener('click', function (e) {
        var el = e.target.closest('[data-copy-email]');
        if (!el) return;
        e.preventDefault();
        var email = el.dataset.copyEmail;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(email).then(function () {
                showToast('Email copied to clipboard!');
            }).catch(function () { window.location.href = 'mailto:' + email; });
        } else {
            window.location.href = 'mailto:' + email;
        }
    });

    // ---- Animated Stat Counters ----
    var statEls = document.querySelectorAll('[data-count]');
    if (statEls.length) {
        var statObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var el = entry.target;
                var target = parseInt(el.dataset.count, 10);
                var suffix = el.dataset.suffix || '';
                var start = performance.now();
                var dur = 1400;
                function tick(now) {
                    var p = Math.min((now - start) / dur, 1);
                    var eased = 1 - Math.pow(1 - p, 3);
                    el.textContent = Math.floor(eased * target) + suffix;
                    if (p < 1) requestAnimationFrame(tick);
                    else el.textContent = target + suffix;
                }
                requestAnimationFrame(tick);
                statObserver.unobserve(el);
            });
        }, { threshold: 0.6 });
        statEls.forEach(function (el) { statObserver.observe(el); });
    }

    // ---- Section Toggle (collapsible) ----
    document.addEventListener('click', function (e) {
        var btn = e.target.closest('.section-toggle');
        if (!btn) return;
        var targetId = btn.getAttribute('data-target');
        var body = document.getElementById(targetId);
        if (!body) return;
        var expanded = btn.getAttribute('aria-expanded') === 'true';
        body.classList.toggle('collapsed', expanded);
        btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        var label = btn.querySelector('.toggle-label');
        if (label) label.textContent = expanded ? 'Show' : 'Hide';
    });

    // ---- Project Filter ----
    var filterBar = document.getElementById('filter-bar');
    if (filterBar) {
        filterBar.addEventListener('click', function (e) {
            var btn = e.target.closest('.filter-btn');
            if (!btn) return;
            filterBar.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');
            var filter = btn.dataset.filter;
            document.querySelectorAll('#grid-container > [data-tags]').forEach(function (card) {
                var match = filter === 'all' || card.dataset.tags.indexOf(filter) !== -1;
                if (match) {
                    card.style.display = '';
                    requestAnimationFrame(function () { card.style.opacity = '1'; });
                } else {
                    card.style.opacity = '0';
                    setTimeout(function () { card.style.display = 'none'; }, 280);
                }
            });
        });
    }

})();

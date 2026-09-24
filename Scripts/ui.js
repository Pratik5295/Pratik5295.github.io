(function () {
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

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
            var destination = document.querySelector('.skip-link') || document.querySelector('main');
            if (destination) destination.focus({ preventScroll: true });
            window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
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
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-atomic', 'true');
        document.body.appendChild(toast);
        requestAnimationFrame(function () {
            toast.textContent = message;
            toast.classList.add('visible');
        });
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
            }).catch(function () { showToast('Could not copy. Please select and copy the email address.'); });
        } else {
            showToast('Could not copy. Please select and copy the email address.');
        }
    });

    // ---- Stat Counters ----
    var statEls = document.querySelectorAll('[data-count]');
    if (statEls.length) {
        statEls.forEach(function (el) {
            el.textContent = el.dataset.count + (el.dataset.suffix || '');
        });
    }

    // ---- Section Toggle (collapsible) ----
    function setSectionExpanded(btn, expanded) {
        var body = document.getElementById(btn.getAttribute('data-target'));
        if (!body) return;
        body.hidden = !expanded;
        body.classList.toggle('collapsed', !expanded);
        btn.setAttribute('aria-expanded', String(expanded));
        btn.setAttribute('aria-label', (expanded ? 'Hide ' : 'Show ') + btn.dataset.sectionName);
        var label = btn.querySelector('.toggle-label');
        if (label) label.textContent = expanded ? 'Hide' : 'Show';
    }

    document.addEventListener('click', function (e) {
        var btn = e.target.closest('.section-toggle');
        if (!btn) return;
        var expanded = btn.getAttribute('aria-expanded') === 'true';
        setSectionExpanded(btn, !expanded);
    });

    function revealLinkedSection() {
        var section = document.getElementById(window.location.hash.slice(1));
        var btn = section && section.querySelector('.section-toggle');
        if (btn) setSectionExpanded(btn, true);
    }
    window.addEventListener('hashchange', revealLinkedSection);
    // Reopening the same section link does not emit a hashchange event.
    document.addEventListener('click', function (event) {
        var link = event.target.closest('a[href]');
        if (!link) return;
        var url = new URL(link.href, window.location.href);
        if (url.origin === window.location.origin && url.pathname === window.location.pathname && url.hash === window.location.hash) revealLinkedSection();
    });
    revealLinkedSection();

    // ---- Project Filter + Search ----
    var filterBar = document.getElementById('filter-bar');
    var projectSearch = document.getElementById('project-search-input');
    var emptyState = document.getElementById('game-projects-empty');
    var resultsStatus = document.getElementById('game-projects-status');
    var announceTimer;
    function applyProjectFilters() {
        var activeBtn = filterBar ? filterBar.querySelector('.filter-btn.active') : null;
        var filter = activeBtn ? activeBtn.dataset.filter : 'all';
        var query = projectSearch ? projectSearch.value.trim().toLowerCase() : '';
        var visibleCount = 0;

        var cards = document.querySelectorAll('#grid-container > [data-tags]');
        cards.forEach(function (card) {
            var matchesFilter = filter === 'all' || card.dataset.tags.indexOf(filter) !== -1;
            var matchesQuery = !query || card.dataset.tags.indexOf(query) !== -1;
            var match = matchesFilter && matchesQuery;
            if (match) visibleCount++;
            card.hidden = !match;
        });

        if (emptyState) {
            emptyState.hidden = visibleCount !== 0;
        }
        clearTimeout(announceTimer);
        if (resultsStatus) {
            announceTimer = setTimeout(function () {
                var message = visibleCount + ' of ' + cards.length + ' game projects shown.';
                if (resultsStatus.textContent !== message) resultsStatus.textContent = message;
            }, 300);
        }
    }
    window.applyProjectFilters = applyProjectFilters;

    if (filterBar) {
        filterBar.addEventListener('click', function (e) {
            var btn = e.target.closest('.filter-btn');
            if (!btn) return;
            filterBar.querySelectorAll('.filter-btn').forEach(function (b) {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
            applyProjectFilters();
        });
    }
    if (projectSearch) {
        projectSearch.addEventListener('input', applyProjectFilters);
    }

})();

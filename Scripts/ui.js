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

    // ---- Project Filter + Search ----
    var filterBar = document.getElementById('filter-bar');
    var projectSearch = document.getElementById('project-search-input');
    var emptyState = document.getElementById('game-projects-empty');
    function applyProjectFilters() {
        var activeBtn = filterBar ? filterBar.querySelector('.filter-btn.active') : null;
        var filter = activeBtn ? activeBtn.dataset.filter : 'all';
        var query = projectSearch ? projectSearch.value.trim().toLowerCase() : '';
        var visibleCount = 0;

        document.querySelectorAll('#grid-container > [data-tags]').forEach(function (card) {
            var matchesFilter = filter === 'all' || card.dataset.tags.indexOf(filter) !== -1;
            var matchesQuery = !query || card.dataset.tags.indexOf(query) !== -1;
            var match = matchesFilter && matchesQuery;
            if (match) {
                visibleCount++;
                card.style.display = '';
                requestAnimationFrame(function () { card.style.opacity = '1'; });
            } else {
                card.style.opacity = '0';
                setTimeout(function () {
                    if (card.style.opacity === '0') card.style.display = 'none';
                }, 220);
            }
        });

        if (emptyState) {
            emptyState.hidden = visibleCount !== 0;
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

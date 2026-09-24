(function () {
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var pendingTimers = new Map();
    var observer = typeof IntersectionObserver === 'function' ? new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var el = entry.target;
            observer.unobserve(el);
            if (reducedMotion.matches) {
                reveal(el);
                return;
            }
            var delay = Number(el.dataset.delay) || 0;
            pendingTimers.set(el, setTimeout(function () { reveal(el); }, delay));
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }) : null;

    function reveal(el) {
        clearTimeout(pendingTimers.get(el));
        pendingTimers.delete(el);
        if (observer) observer.unobserve(el);
        el.classList.remove('reveal-pending');
        el.classList.add('visible');
    }

    function observeReveal(el) {
        if (reducedMotion.matches || !observer || el.classList.contains('visible') || el.contains(document.activeElement)) {
            reveal(el);
            return;
        }
        el.classList.add('reveal-pending');
        observer.observe(el);
    }

    function initReveal() {
        document.querySelectorAll('.scroll-reveal').forEach(observeReveal);
    }

    document.addEventListener('focusin', function (event) {
        var el = event.target.closest('.scroll-reveal');
        if (el) reveal(el);
    });
    reducedMotion.addEventListener('change', function () {
        if (reducedMotion.matches) document.querySelectorAll('.scroll-reveal').forEach(reveal);
    });
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initReveal);
    } else {
        initReveal();
    }
    window.observeReveal = observeReveal;
})();

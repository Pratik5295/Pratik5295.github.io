(function () {
    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var el = entry.target;
            var delay = parseInt(el.dataset.delay || '0', 10);
            setTimeout(function () { el.classList.add('visible'); }, delay);
            observer.unobserve(el);
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    function initReveal() {
        document.querySelectorAll('.scroll-reveal').forEach(function (el) {
            observer.observe(el);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initReveal);
    } else {
        initReveal();
    }

    window.observeReveal = function (el) { observer.observe(el); };
})();

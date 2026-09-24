(function () {
    const wrapper = document.getElementById('nav-wrapper');
    if (!wrapper || wrapper.dataset.initialized) return;
    wrapper.dataset.initialized = 'true';

    const toggle = document.getElementById('hamburger');
    const menu = document.getElementById('navbar-menu');
    const projectsToggle = document.getElementById('projects-toggle');
    const projectsMenu = document.getElementById('projects-menu');
    const dropdown = document.getElementById('nav-dropdown');
    const navbar = document.getElementById('navbar');
    const mobile = window.matchMedia('(max-width: 768px)');
    let menuOpen = false;

    function setProjectsOpen(open, returnFocus = false) {
        projectsToggle.setAttribute('aria-expanded', String(open));
        projectsMenu.hidden = !open;
        dropdown.classList.toggle('open', open);
        if (returnFocus) projectsToggle.focus();
    }

    function setMenuOpen(open, returnFocus = false) {
        menuOpen = mobile.matches && open;
        menu.hidden = mobile.matches && !menuOpen;
        toggle.setAttribute('aria-expanded', String(menuOpen));
        toggle.setAttribute('aria-label', menuOpen ? 'Close navigation' : 'Open navigation');
        toggle.classList.toggle('active', menuOpen);
        if (!open) setProjectsOpen(false);
        updateHeaderOffset();
        if (returnFocus) toggle.focus();
    }

    toggle.addEventListener('click', () => setMenuOpen(!menuOpen));
    projectsToggle.addEventListener('click', () => setProjectsOpen(projectsMenu.hidden));

    wrapper.addEventListener('keydown', event => {
        if (event.key !== 'Escape') return;
        if (!projectsMenu.hidden) {
            event.preventDefault();
            setProjectsOpen(false, true);
        } else if (menuOpen) {
            event.preventDefault();
            setMenuOpen(false, true);
        }
    });

    document.addEventListener('click', event => {
        if (!dropdown.contains(event.target)) setProjectsOpen(false);
        if (menuOpen && !wrapper.contains(event.target)) setMenuOpen(false);
    });

    wrapper.addEventListener('focusout', event => {
        if (!dropdown.contains(event.relatedTarget)) setProjectsOpen(false);
        if (menuOpen && !wrapper.contains(event.relatedTarget)) setMenuOpen(false);
    });

    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            // Keep focus on a visible control until the destination receives it.
            const closesFocusedLink = mobile.matches && menu.contains(document.activeElement);
            const closesFocusedProject = !mobile.matches && projectsMenu.contains(document.activeElement);
            setProjectsOpen(false, closesFocusedProject);
            setMenuOpen(false, closesFocusedLink);
        });
    });

    function updateCurrentLocation() {
        const path = window.location.pathname === '/index.html' ? '/' : window.location.pathname;
        const hash = window.location.hash;
        const homeSection = path === '/' && /^#section-(professional|recent|games|art)$/.test(hash);
        menu.querySelectorAll('a').forEach(link => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
            const href = link.getAttribute('href');
            const section = link.getAttribute('data-section');
            let current = null;
            if (href === '#contact' && hash === '#contact') current = 'location';
            else if (homeSection && href === '/' + hash) current = 'location';
            else if (href === path && !homeSection && hash !== '#contact') current = 'page';
            else if (section && path.startsWith(section) && hash !== '#contact') current = 'location';
            if (current) {
                link.classList.add('active');
                link.setAttribute('aria-current', current);
            }
        });
        projectsToggle.classList.toggle('active', homeSection || (path.startsWith('/DevProjects/') && hash !== '#contact'));
    }

    mobile.addEventListener('change', () => {
        const activeElement = document.activeElement;
        const focusWasInMenu = menu.contains(activeElement);
        const focusWasInProjects = projectsMenu.contains(activeElement);
        setMenuOpen(false);
        if (mobile.matches && focusWasInMenu) toggle.focus();
        else if (focusWasInProjects) projectsToggle.focus();
        else if (!mobile.matches && activeElement === toggle) menu.querySelector('a').focus();
    });
    window.addEventListener('hashchange', updateCurrentLocation);
    function updateHeaderOffset() {
        if (!navbar) return;
        const sticky = window.getComputedStyle(navbar).position === 'sticky';
        const offset = sticky ? navbar.getBoundingClientRect().height + 12 : 12;
        document.documentElement.style.setProperty('--header-offset', Math.ceil(offset) + 'px');
    }
    if (typeof ResizeObserver === 'function' && navbar) {
        new ResizeObserver(updateHeaderOffset).observe(navbar);
    }
    window.addEventListener('resize', updateHeaderOffset, { passive: true });
    wrapper.classList.add('nav-ready');
    setMenuOpen(false);
    updateCurrentLocation();
})();

async function fetchTemplate(templatePath) {
    var response = await fetch(cacheBust(templatePath));
    var text = await response.text();
    var template = document.createElement('div');
    template.innerHTML = text;
    return template;
}

async function fetchProjectData(projectId) {
    try {
        var response = await fetch(cacheBust('./Data/' + projectId + '.json'));
        if (!response.ok) throw new Error('Failed to load ' + projectId);
        var data = await response.json();
        data._id = projectId;
        return data;
    } catch (error) {
        console.error('Error loading project:', projectId, error);
        return null;
    }
}

function createSkeletonCard() {
    var wrapper = document.createElement('div');
    wrapper.className = 'skeleton-wrapper';
    return wrapper;
}

function trimText(text, maxLength) {
    if (!text) return '';
    var cleaned = String(text).replace(/\s+/g, ' ').trim();
    if (cleaned.length <= maxLength) return cleaned;
    return cleaned.slice(0, maxLength - 1).trim() + '…';
}

function setupHeroCarousel(projects) {
    var hero = document.getElementById('featured-carousel');
    if (!hero) return;

    var projectIds = (projects.professional || []).concat(projects.recent || []);
    if (!projectIds.length) return;

    var titleEl = document.getElementById('hero-title');
    var categoryEl = document.getElementById('hero-category');
    var copyEl = document.getElementById('hero-copy');
    var engineEl = document.getElementById('hero-engine');
    var statusEl = document.getElementById('hero-status');
    var viewMoreEl = document.getElementById('hero-view-more');
    var prevBtn = document.getElementById('hero-prev');
    var nextBtn = document.getElementById('hero-next');
    var dotsEl = document.getElementById('hero-dots');
    var announcementEl = document.getElementById('hero-announcement');

    Promise.all(projectIds.map(fetchProjectData)).then(function (loadedProjects) {
        var slides = loadedProjects.filter(Boolean);
        if (!slides.length) return;

        var currentIndex = 0;
        dotsEl.innerHTML = '';
        slides.forEach(function (slide, index) {
            var dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'hero-dot';
            dot.setAttribute('aria-label', 'Show ' + (slide.title || 'featured project ' + (index + 1)));
            dot.addEventListener('click', function () {
                showSlide(index);
            });
            dotsEl.appendChild(dot);
        });

        function showSlide(index, announce) {
            currentIndex = (index + slides.length) % slides.length;
            var slide = slides[currentIndex];
            var category = (projects.professional || []).indexOf(slide._id) !== -1 ? 'Professional Work' : 'Recent Work';
            var imageUrl = slide.screenshotUrl || slide.imageUrl || '';

            categoryEl.textContent = category;
            titleEl.textContent = slide.title || 'Featured Project';
            copyEl.textContent = trimText(slide.summary || slide.description || slide.content || '', 190);
            engineEl.textContent = slide.engine || slide.gameEngine || 'Unity';
            statusEl.textContent = slide.status || category;
            viewMoreEl.href = 'DevProjects/project.html?id=' + slide._id;
            if (imageUrl) {
                hero.style.setProperty('--hero-image', "url('" + imageUrl + "')");
            } else {
                hero.style.setProperty('--hero-image', 'none');
            }
            Array.prototype.forEach.call(dotsEl.children, function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === currentIndex);
                dot.setAttribute('aria-pressed', dotIndex === currentIndex ? 'true' : 'false');
            });
            if (announcementEl && announce !== false) {
                announcementEl.textContent = 'Project ' + (currentIndex + 1) + ' of ' + slides.length + ': ' + titleEl.textContent;
            }
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', function () {
                showSlide(currentIndex - 1);
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', function () {
                showSlide(currentIndex + 1);
            });
        }
        // Keep the selection still so visitors can read at their own pace.
        showSlide(0, false);
    });
}

function createProjectCard(template, data, staggerIndex, category) {
    var clone = template.cloneNode(true);
    var link = clone.querySelector('.project-card-link');

    link.href = 'DevProjects/project.html?id=' + data._id;
    link.setAttribute('aria-label', 'View project: ' + (data.title || 'Untitled project'));
    clone.querySelector('.projTitle').textContent = data.title || '';
    clone.querySelector('.projEngine').textContent = data.engine || data.gameEngine || '';
    clone.querySelector('.projStatus').textContent = data.status || category || '';
    clone.querySelector('.projSummary').textContent = data.summary || data.description || data.content || '';

    // Keep all project metadata searchable, including labels omitted from the card.
    var subtitle = data.subtitle || data.content || '';
    clone.dataset.tags = [
        data.title,
        data.engine,
        data.status,
        subtitle,
        data.summary,
        data.description,
        (data.tech || []).join(' ')
    ].join(' ').toLowerCase();
    clone.dataset.category = category || '';

    // Reserve image space and defer off-screen previews until they are needed.
    var img = clone.querySelector('.projImage');
    var fallback = clone.querySelector('.project-image-fallback');
    function showImageFallback() {
        img.hidden = true;
        fallback.hidden = false;
    }
    var imageUrl = data.screenshotUrl || data.imageUrl || '';
    if (imageUrl) {
        img.onerror = showImageFallback;
        img.src = imageUrl;
    } else {
        showImageFallback();
    }

    // A short focus line replaces repeated category and engine badges.
    var engine = String(data.engine || data.gameEngine || '').toLowerCase();
    var focus = String(data.subtitle || '').split('|').map(function (part) {
        return part.trim();
    }).filter(function (part) {
        return part && part.toLowerCase() !== 'professional' && part.toLowerCase() !== engine;
    }).slice(0, 2);
    clone.querySelector('.projFocus').textContent = focus.join(' · ');

    // Scroll reveal with stagger
    clone.classList.add('scroll-reveal');
    clone.dataset.delay = Math.min(staggerIndex * 80, 400);

    // Respect active filter if one is set
    var activeFilter = category === 'games' ? document.querySelector('#filter-bar .filter-btn.active') : null;
    if (activeFilter && activeFilter.dataset.filter !== 'all') {
        if (clone.dataset.tags.indexOf(activeFilter.dataset.filter) === -1) {
            clone.hidden = true;
        }
    }

    return clone;
}

async function fillGrid(containerId, projectIds, template, category) {
    var container = document.getElementById(containerId);

    // Skeleton placeholders
    var skeletons = projectIds.map(function () {
        var sk = createSkeletonCard();
        container.appendChild(sk);
        return sk;
    });

    // Load and replace one by one
    for (var i = 0; i < projectIds.length; i++) {
        var data = await fetchProjectData(projectIds[i]);
        if (data) {
            var card = createProjectCard(template, data, i, category);
            container.replaceChild(card, skeletons[i]);
            if (window.observeReveal) window.observeReveal(card);
            if (category === 'games' && window.applyProjectFilters) window.applyProjectFilters();
        } else {
            container.removeChild(skeletons[i]);
        }
    }
}

async function init() {
    var template = await fetchTemplate('Homepage-Project-Template.html');
    try {
        var response = await fetch(cacheBust('./Data/projects.json'));
        var projects = await response.json();
        setupHeroCarousel(projects);
        await fillGrid('professional-projects-grid', projects.professional || [], template, 'professional');
        await fillGrid('recent-projects-grid', projects.recent || [], template, 'recent');
        await fillGrid('grid-container', projects.games || [], template, 'games');
    } catch (error) {
        console.error('Error loading projects list:', error);
    }
}

document.addEventListener('DOMContentLoaded', init);

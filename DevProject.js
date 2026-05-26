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

function createProjectCard(template, data, staggerIndex, category) {
    var clone = template.cloneNode(true);
    var projectEl = clone.querySelector('.project-template');
    var link = clone.querySelector('.project-card-link');

    link.href = 'DevProjects/project.html?id=' + data._id;
    clone.querySelector('.projTitle').textContent = data.title || '';
    clone.querySelector('.projEngine').textContent = data.engine || data.gameEngine || '';

    // Store subtitle as tags for filtering
    var subtitle = data.subtitle || data.content || '';
    clone.dataset.tags = subtitle.toLowerCase();

    // Image with error fallback
    var imageUrl = data.imageUrl || '';
    if (imageUrl) {
        var img = new Image();
        img.onload = function () { projectEl.style.backgroundImage = "url('" + imageUrl + "')"; };
        img.onerror = function () { projectEl.classList.add('card-no-image'); };
        img.src = imageUrl;
    } else {
        projectEl.classList.add('card-no-image');
    }

    // Tag pills
    var tagsContainer = clone.querySelector('.projTags');
    subtitle.split('|').forEach(function (part) {
        var trimmed = part.trim();
        if (trimmed) {
            var span = document.createElement('span');
            span.className = 'projTag';
            span.textContent = trimmed;
            tagsContainer.appendChild(span);
        }
    });

    // Professional badge
    if (category === 'professional') {
        var badge = document.createElement('div');
        badge.className = 'pro-badge';
        badge.textContent = 'Professional';
        projectEl.appendChild(badge);
    }

    // Scroll reveal with stagger
    clone.classList.add('scroll-reveal');
    clone.dataset.delay = Math.min(staggerIndex * 80, 400);

    // Respect active filter if one is set
    var activeFilter = document.querySelector('#filter-bar .filter-btn.active');
    if (activeFilter && activeFilter.dataset.filter !== 'all') {
        if (clone.dataset.tags.indexOf(activeFilter.dataset.filter) === -1) {
            clone.style.display = 'none';
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
        await fillGrid('professional-projects-grid', projects.professional || [], template, 'professional');
        await fillGrid('recent-projects-grid', projects.recent || [], template, 'recent');
        await fillGrid('grid-container', projects.games || [], template, 'games');
    } catch (error) {
        console.error('Error loading projects list:', error);
    }
}

document.addEventListener('DOMContentLoaded', init);

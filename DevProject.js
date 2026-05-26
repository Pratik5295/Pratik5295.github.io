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

function createProjectCard(template, data, staggerIndex) {
    var clone = template.cloneNode(true);
    var projectEl = clone.querySelector('.project-template');
    var link = clone.querySelector('.project-card-link');
    var pageLink = 'DevProjects/project.html?id=' + data._id;

    link.href = pageLink;
    clone.querySelector('.projTitle').textContent = data.title || '';
    clone.querySelector('.projEngine').textContent = data.engine || data.gameEngine || '';

    // Load image with error fallback
    var imageUrl = data.imageUrl || '';
    if (imageUrl) {
        var img = new Image();
        img.onload = function () {
            projectEl.style.backgroundImage = "url('" + imageUrl + "')";
        };
        img.onerror = function () {
            projectEl.classList.add('card-no-image');
        };
        img.src = imageUrl;
    } else {
        projectEl.classList.add('card-no-image');
    }

    // Tag pills from subtitle
    var tagsContainer = clone.querySelector('.projTags');
    var subtitle = data.subtitle || data.content || '';
    subtitle.split('|').forEach(function (part) {
        var trimmed = part.trim();
        if (trimmed) {
            var span = document.createElement('span');
            span.className = 'projTag';
            span.textContent = trimmed;
            tagsContainer.appendChild(span);
        }
    });

    // Scroll reveal with staggered delay
    clone.classList.add('scroll-reveal');
    clone.dataset.delay = Math.min(staggerIndex * 80, 400);

    return clone;
}

async function fillGrid(containerId, projectIds, template) {
    var container = document.getElementById(containerId);

    // Insert skeleton placeholders first
    var skeletons = projectIds.map(function () {
        var sk = createSkeletonCard();
        container.appendChild(sk);
        return sk;
    });

    // Load real cards and replace skeletons one by one
    for (var i = 0; i < projectIds.length; i++) {
        var data = await fetchProjectData(projectIds[i]);
        if (data) {
            var card = createProjectCard(template, data, i);
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

        await fillGrid('professional-projects-grid', projects.professional || [], template);
        await fillGrid('recent-projects-grid', projects.recent || [], template);
        await fillGrid('grid-container', projects.games || [], template);
    } catch (error) {
        console.error('Error loading projects list:', error);
    }
}

document.addEventListener('DOMContentLoaded', init);

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

function createProjectCard(template, data) {
    var clone = template.cloneNode(true);
    var pageLink = 'DevProjects/project.html?id=' + data._id;
    clone.innerHTML = clone.innerHTML
        .replace('{{imageUrl}}', data.imageUrl || '')
        .replace('{{title}}', data.title || '')
        .replace('{{content}}', data.subtitle || data.content || '')
        .replace('{{gameEngine}}', data.engine || data.gameEngine || '')
        .replace('{{pageLink}}', pageLink);
    return clone;
}

async function fillGrid(containerId, projectIds, template) {
    var container = document.getElementById(containerId);
    for (var i = 0; i < projectIds.length; i++) {
        var data = await fetchProjectData(projectIds[i]);
        if (data) {
            var card = createProjectCard(template, data);
            container.appendChild(card);
        }
    }
}

async function init() {
    var template = await fetchTemplate('Homepage-Project-Template.html');

    try {
        var response = await fetch(cacheBust('./Data/projects.json'));
        var projects = await response.json();

        await fillGrid('recent-projects-grid', projects.recent, template);
        await fillGrid('grid-container', projects.games, template);
    } catch (error) {
        console.error('Error loading projects list:', error);
    }
}

document.addEventListener('DOMContentLoaded', init);

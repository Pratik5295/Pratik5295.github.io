(function () {
    var projectId = new URLSearchParams(window.location.search).get('id');
    var main = document.getElementById('project-content');

    function showSection(id) {
        document.getElementById(id).hidden = false;
    }

    function setText(id, text) {
        document.getElementById(id).textContent = text || '';
    }

    function setMeta(id, content) {
        document.getElementById(id).setAttribute('content', content || '');
    }

    function showError(message) {
        setText('project-title', 'Project unavailable');
        setText('project-summary', message);
        document.title = 'Project unavailable — Pratik Shringarpure';
        main.setAttribute('aria-busy', 'false');
    }

    async function fetchJSON(path) {
        var response = await fetch(cacheBust(path));
        if (!response.ok) throw new Error('Could not load ' + path);
        return response.json();
    }

    function addProjectAction(label, href, external, primary) {
        var link = document.createElement('a');
        link.className = 'project-action-link' + (primary ? '' : ' secondary');
        link.href = href;
        link.textContent = label;
        if (external) {
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            var hint = document.createElement('span');
            hint.className = 'sr-only';
            hint.textContent = ' (opens in a new tab)';
            link.appendChild(hint);
        }
        var actions = document.getElementById('project-actions');
        actions.insertBefore(link, document.getElementById('all-projects-link'));
    }

    function storeLabel(data) {
        if (data.storeUrl.indexOf('store.steampowered.com/') !== -1) return 'View on Steam';
        if (data.storeUrl.indexOf('play.google.com/') !== -1) return 'View on Google Play';
        return data.storeLinkText || 'View store page';
    }

    function addNeighbour(id, direction) {
        if (!id) return;
        var link = document.getElementById(direction + '-project');
        link.href = 'project.html?id=' + encodeURIComponent(id);
        link.hidden = false;
        showSection('project-nav');
        fetchJSON('../Data/' + encodeURIComponent(id) + '.json').then(function (data) {
            setText(direction + '-project-title', data.title || 'View project');
        }).catch(function () {
            // The working navigation link remains available if its title cannot load.
            setText(direction + '-project-title', 'View project');
        });
    }

    if (!projectId || !/^[a-z0-9-]+$/.test(projectId)) {
        showError('Choose a project from the portfolio to see its details.');
        return;
    }

    // Navigation data is optional: a list failure should not hide a valid project.
    Promise.all([
        fetchJSON('../Data/' + encodeURIComponent(projectId) + '.json'),
        fetchJSON('../Data/projects.json').catch(function () { return null; })
    ]).then(function (results) {
        var data = results[0];
        var projectList = results[1];
        if (!data || !data.title) throw new Error('Missing project title');

        var summary = data.summary || data.description || data.content || '';
        var engine = data.engine || data.gameEngine || '';
        document.title = data.title + ' — Pratik Shringarpure';
        setMeta('page-description', summary);
        setMeta('og-title', document.title);
        setMeta('og-description', summary);
        setText('breadcrumb-title', data.title);
        setText('project-title', data.title);
        setText('project-summary', summary);
        setText('project-engine', engine);
        setText('project-status', data.status);

        var imagePath = data.screenshotUrl || data.imageUrl;
        setMeta('og-image', new URL(imagePath ? '../' + imagePath : '../Images/ProjectData/Profile.png', window.location.href).href);
        if (imagePath) {
            var hero = document.getElementById('project-hero');
            var image = document.getElementById('project-image');
            image.alt = data.title + ' — project preview';
            image.onerror = function () {
                document.getElementById('project-media').hidden = true;
                hero.classList.remove('has-media');
            };
            showSection('project-media');
            hero.classList.add('has-media');
            image.src = '../' + imagePath;
        }

        if (data.description && data.description !== summary) {
            setText('project-description', data.description);
            showSection('description-section');
        }
        if (data.roles && data.roles.length) {
            data.roles.forEach(function (role) {
                var item = document.createElement('li');
                item.textContent = role;
                document.getElementById('roles-list').appendChild(item);
            });
            showSection('roles-section');
        }
        if (data.highlights && data.highlights.length) {
            data.highlights.forEach(function (highlight) {
                var item = document.createElement('li');
                var heading = document.createElement('h3');
                heading.textContent = highlight.name;
                var detail = document.createElement('p');
                detail.textContent = highlight.detail;
                item.appendChild(heading);
                item.appendChild(detail);
                document.getElementById('highlights-list').appendChild(item);
            });
            showSection('highlights-section');
        }
        if (data.details && data.details !== data.description && data.details !== summary) {
            setText('project-details', data.details);
            showSection('details-section');
        }

        var focus = String(data.subtitle || '').split('|').map(function (part) {
            return part.trim();
        }).filter(function (part) {
            return part && part.toLowerCase() !== 'professional' && part.toLowerCase() !== String(engine).toLowerCase();
        });
        if (focus.length) {
            setText('project-focus', focus.join(' · '));
            showSection('focus-section');
            showSection('project-sidebar');
        }
        if (data.tech && data.tech.length) {
            data.tech.forEach(function (tech) {
                var item = document.createElement('li');
                item.textContent = tech;
                document.getElementById('tech-list').appendChild(item);
            });
            showSection('tech-section');
            showSection('project-sidebar');
        }
        if (document.getElementById('project-sidebar').hidden) {
            document.getElementById('project-layout').classList.add('without-sidebar');
        }
        showSection('project-layout');

        if (data.storeUrl) addProjectAction(storeLabel(data), data.storeUrl, true, true);
        if (data.downloadUrl) addProjectAction('Get playable build', data.downloadUrl, true, !data.storeUrl);
        if (data.videoUrl) {
            var video = document.getElementById('project-video');
            video.title = data.title + ' — project video';
            video.src = data.videoUrl;
            showSection('video-section');
            addProjectAction('Watch video', '#video-section', false, false);
        }

        if (projectList) {
            var sections = { professional: 'Professional project', recent: 'Recent work', games: 'Game project' };
            Object.keys(sections).forEach(function (category) {
                if ((projectList[category] || []).indexOf(projectId) === -1) return;
                setText('project-category', sections[category]);
                var target = '/#section-' + category;
                document.getElementById('back-to-projects').href = target;
                document.getElementById('all-projects-link').href = target;
            });
            var allIds = (projectList.professional || []).concat(projectList.recent || [], projectList.games || []);
            var index = allIds.indexOf(projectId);
            if (index !== -1) {
                addNeighbour(allIds[index - 1], 'prev');
                addNeighbour(allIds[index + 1], 'next');
            }
        }
        main.setAttribute('aria-busy', 'false');
    }).catch(function (error) {
        console.error(error);
        showError('This project could not be loaded. Refresh the page to try again, or return to the portfolio.');
    });
})();

(function () {
    var params = new URLSearchParams(window.location.search);
    var projectId = params.get('id');

    if (!projectId) {
        document.getElementById('project-title').textContent = 'Project not found';
        return;
    }

    function revealSection(id) {
        var el = document.getElementById(id);
        if (!el) return;
        el.style.display = '';
        el.classList.add('scroll-reveal');
        requestAnimationFrame(function () {
            if (window.observeReveal) window.observeReveal(el);
        });
    }

    function setMeta(id, content) {
        var el = document.getElementById(id);
        if (el) el.setAttribute('content', content);
    }

    function addProjectAction(label, href, isExternal) {
        var actions = document.getElementById('project-actions');
        if (!actions || !href) return;
        var link = document.createElement('a');
        link.className = 'project-action-link';
        link.href = href;
        link.textContent = label;
        if (isExternal) {
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
        }
        actions.appendChild(link);
        actions.style.display = 'flex';
    }

    function addSnapshotItem(label, value) {
        if (!value) return;
        var list = document.getElementById('snapshot-list');
        var section = document.getElementById('snapshot-section');
        if (!list || !section) return;
        var item = document.createElement('div');
        item.className = 'snapshot-item';
        var labelEl = document.createElement('span');
        labelEl.textContent = label;
        var valueEl = document.createElement('strong');
        valueEl.textContent = value;
        item.appendChild(labelEl);
        item.appendChild(valueEl);
        list.appendChild(item);
        revealSection('snapshot-section');
    }

    // Fetch project data + master project list in parallel
    Promise.all([
        fetch(cacheBust('../Data/' + projectId + '.json')).then(function (r) {
            if (!r.ok) throw new Error('Project not found');
            return r.json();
        }),
        fetch(cacheBust('../Data/projects.json')).then(function (r) { return r.json(); })
    ])
    .then(function (results) {
        var data = results[0];
        var projectList = results[1];

        // ---- Page title ----
        document.title = data.title + ' — Pratik Shringarpure';

        // ---- OG tags ----
        setMeta('og-title', data.title + ' — Pratik Shringarpure');
        setMeta('og-description', data.description || '');
        var ogImage = data.screenshotUrl
            ? '/' + data.screenshotUrl
            : data.imageUrl ? '/' + data.imageUrl : '/Images/ProjectData/Profile.png';
        setMeta('og-image', ogImage);

        // ---- Breadcrumb ----
        document.getElementById('breadcrumb-title').textContent = data.title;

        // ---- Hero banner ----
        var hero = document.getElementById('project-hero');
        var heroImage = data.screenshotUrl
            ? '../' + data.screenshotUrl
            : data.imageUrl ? '../' + data.imageUrl : '';
        if (heroImage) {
            hero.style.backgroundImage = "url('" + heroImage + "')";
            hero.classList.add('has-image');
        }

        // ---- Core fields ----
        document.getElementById('project-title').textContent = data.title;
        document.getElementById('project-subtitle').textContent = data.subtitle || data.content || '';
        document.getElementById('project-engine').textContent = data.engine || data.gameEngine || '';
        document.getElementById('project-status').textContent = data.status || '';
        document.getElementById('project-description').textContent = data.description || '';

        addSnapshotItem('Engine', data.engine || data.gameEngine || '');
        addSnapshotItem('Status', data.status || '');
        addSnapshotItem('Focus', data.subtitle || data.content || '');
        addSnapshotItem('Tech', data.tech && data.tech.length ? data.tech.slice(0, 5).join(', ') : '');

        // ---- Video ----
        if (data.videoUrl) {
            revealSection('video-section');
            document.getElementById('project-video').src = data.videoUrl;
        }

        // ---- Highlights ----
        if (data.highlights && data.highlights.length > 0) {
            revealSection('highlights-section');
            var hl = document.getElementById('highlights-list');
            data.highlights.forEach(function (h) {
                var li = document.createElement('li');
                var strong = document.createElement('strong');
                strong.textContent = h.name + ': ';
                li.appendChild(strong);
                li.appendChild(document.createTextNode(h.detail));
                hl.appendChild(li);
            });
        }

        // ---- Roles + Tech ----
        var showTwoCol = false;
        if (data.roles && data.roles.length > 0) {
            revealSection('roles-section');
            var rl = document.getElementById('roles-list');
            data.roles.forEach(function (r) {
                var li = document.createElement('li');
                li.textContent = r;
                rl.appendChild(li);
            });
            showTwoCol = true;
        }
        if (data.tech && data.tech.length > 0) {
            revealSection('tech-section');
            var tl = document.getElementById('tech-list');
            data.tech.forEach(function (t) {
                var span = document.createElement('span');
                span.className = 'tech-tag';
                span.textContent = t;
                tl.appendChild(span);
            });
            showTwoCol = true;
        }
        if (showTwoCol) {
            var twoCol = document.querySelector('.two-column');
            if (twoCol) {
                twoCol.style.display = '';
                twoCol.classList.add('scroll-reveal');
                requestAnimationFrame(function () {
                    if (window.observeReveal) window.observeReveal(twoCol);
                });
            }
        }

        // ---- Details ----
        if (data.details) {
            revealSection('details-section');
            document.getElementById('project-details').textContent = data.details;
        }

        // ---- Download / Store ----
        if (data.downloadUrl) {
            var dl = document.getElementById('download-link');
            dl.href = data.downloadUrl;
            dl.rel = 'noopener noreferrer';
            addProjectAction('Download Build', data.downloadUrl, true);
        }
        if (data.storeUrl) {
            var sl = document.getElementById('store-link');
            sl.href = data.storeUrl;
            sl.rel = 'noopener noreferrer';
            sl.textContent = data.storeLinkText || 'View on Store';
            addProjectAction(data.storeLinkText || 'View on Store', data.storeUrl, true);
        }

        // ---- Prev / Next ----
        var allIds = (projectList.professional || [])
            .concat(projectList.recent || [])
            .concat(projectList.games || []);
        var idx = allIds.indexOf(projectId);
        var prevId = idx > 0 ? allIds[idx - 1] : null;
        var nextId = idx < allIds.length - 1 ? allIds[idx + 1] : null;

        if (prevId || nextId) {
            var nav = document.getElementById('project-nav');
            nav.style.display = '';
            nav.classList.add('scroll-reveal');
            requestAnimationFrame(function () {
                if (window.observeReveal) window.observeReveal(nav);
            });
            var prevBtn = document.getElementById('prev-project');
            var nextBtn = document.getElementById('next-project');
            if (prevId) { prevBtn.href = 'project.html?id=' + prevId; }
            else { prevBtn.style.visibility = 'hidden'; }
            if (nextId) { nextBtn.href = 'project.html?id=' + nextId; }
            else { nextBtn.style.visibility = 'hidden'; }
        }
    })
    .catch(function (err) {
        console.error(err);
        document.getElementById('project-title').textContent = 'Error loading project';
    });
})();

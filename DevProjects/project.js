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

    function revealWrapper(id) {
        var el = document.getElementById(id);
        if (!el) return;
        el.style.display = '';
        el.classList.add('scroll-reveal');
        requestAnimationFrame(function () {
            if (window.observeReveal) window.observeReveal(el);
        });
    }

    fetch(cacheBust('../Data/' + projectId + '.json'))
        .then(function (response) {
            if (!response.ok) throw new Error('Could not load project data');
            return response.json();
        })
        .then(function (data) {
            document.title = 'Project: ' + data.title;

            // Hero banner
            var hero = document.getElementById('project-hero');
            if (data.screenshotUrl) {
                hero.style.backgroundImage = "url('../" + data.screenshotUrl + "')";
                hero.classList.add('has-image');
            }

            document.getElementById('project-title').textContent = data.title;
            document.getElementById('project-subtitle').textContent = data.subtitle || data.content || '';
            document.getElementById('project-engine').textContent = data.engine || data.gameEngine || '';
            document.getElementById('project-status').textContent = data.status || '';
            document.getElementById('project-description').textContent = data.description || '';

            // Video
            if (data.videoUrl) {
                revealSection('video-section');
                document.getElementById('project-video').src = data.videoUrl;
            }

            // Highlights
            if (data.highlights && data.highlights.length > 0) {
                revealSection('highlights-section');
                var highlightsList = document.getElementById('highlights-list');
                data.highlights.forEach(function (h) {
                    var li = document.createElement('li');
                    var strong = document.createElement('strong');
                    strong.textContent = h.name + ': ';
                    li.appendChild(strong);
                    li.appendChild(document.createTextNode(h.detail));
                    highlightsList.appendChild(li);
                });
            }

            // Roles + Tech (two-column wrapper)
            var showTwoCol = false;
            if (data.roles && data.roles.length > 0) {
                revealSection('roles-section');
                var rolesList = document.getElementById('roles-list');
                data.roles.forEach(function (role) {
                    var li = document.createElement('li');
                    li.textContent = role;
                    rolesList.appendChild(li);
                });
                showTwoCol = true;
            }

            if (data.tech && data.tech.length > 0) {
                revealSection('tech-section');
                var techList = document.getElementById('tech-list');
                data.tech.forEach(function (t) {
                    var span = document.createElement('span');
                    span.className = 'tech-tag';
                    span.textContent = t;
                    techList.appendChild(span);
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

            // Details
            if (data.details) {
                revealSection('details-section');
                document.getElementById('project-details').textContent = data.details;
            }

            // Download link
            if (data.downloadUrl) {
                revealWrapper('download-section');
                document.getElementById('download-link').href = data.downloadUrl;
            }

            // Store link
            if (data.storeUrl) {
                revealWrapper('store-section');
                var storeLink = document.getElementById('store-link');
                storeLink.href = data.storeUrl;
                storeLink.textContent = data.storeLinkText || 'View on Store';
            }
        })
        .catch(function (err) {
            console.error(err);
            document.getElementById('project-title').textContent = 'Error loading project';
        });
})();

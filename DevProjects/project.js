(function() {
    var params = new URLSearchParams(window.location.search);
    var projectId = params.get('id');

    if (!projectId) {
        document.getElementById('project-title').textContent = 'Project not found';
        return;
    }

    var dataPath = '../Data/' + projectId + '.json';

    fetch(dataPath)
        .then(function(response) {
            if (!response.ok) throw new Error('Could not load project data');
            return response.json();
        })
        .then(function(data) {
            document.title = 'Project: ' + data.title;

            document.getElementById('project-title').textContent = data.title;
            document.getElementById('project-subtitle').textContent = data.subtitle || data.content || '';
            document.getElementById('project-engine').textContent = data.engine || data.gameEngine || '';
            document.getElementById('project-status').textContent = data.status || '';
            document.getElementById('project-description').textContent = data.description || '';

            // Video
            var videoUrl = data.videoUrl || '';
            if (videoUrl) {
                document.getElementById('video-section').style.display = '';
                document.getElementById('project-video').src = videoUrl;
            }

            // Highlights
            if (data.highlights && data.highlights.length > 0) {
                document.getElementById('highlights-section').style.display = '';
                var highlightsList = document.getElementById('highlights-list');
                data.highlights.forEach(function(h) {
                    var li = document.createElement('li');
                    var strong = document.createElement('strong');
                    strong.textContent = h.name + ': ';
                    li.appendChild(strong);
                    li.appendChild(document.createTextNode(h.detail));
                    highlightsList.appendChild(li);
                });
            }

            // Roles
            if (data.roles && data.roles.length > 0) {
                document.getElementById('roles-section').style.display = '';
                var rolesList = document.getElementById('roles-list');
                data.roles.forEach(function(role) {
                    var li = document.createElement('li');
                    li.textContent = role;
                    rolesList.appendChild(li);
                });
            }

            // Tech
            if (data.tech && data.tech.length > 0) {
                document.getElementById('tech-section').style.display = '';
                var techList = document.getElementById('tech-list');
                data.tech.forEach(function(t) {
                    var span = document.createElement('span');
                    span.className = 'tech-tag';
                    span.textContent = t;
                    techList.appendChild(span);
                });
            }

            // Details
            if (data.details) {
                document.getElementById('details-section').style.display = '';
                document.getElementById('project-details').textContent = data.details;
            }

            // Download link
            if (data.downloadUrl) {
                document.getElementById('download-section').style.display = '';
                document.getElementById('download-link').href = data.downloadUrl;
            }
        })
        .catch(function(err) {
            console.error(err);
            document.getElementById('project-title').textContent = 'Error loading project';
        });
})();

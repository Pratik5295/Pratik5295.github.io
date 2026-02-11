// Cache-bust: append timestamp so browsers always fetch fresh content
function cacheBust(url) {
    var sep = url.indexOf('?') === -1 ? '?' : '&';
    return url + sep + 'v=' + Date.now();
}

async function LoadPage(path, id) {
    try {
        var response = await fetch(cacheBust(path));
        var html = await response.text();
        var container = document.getElementById(id);
        container.innerHTML = html;

        // Scripts injected via innerHTML don't execute, so re-create them
        var scripts = container.querySelectorAll('script');
        scripts.forEach(function(oldScript) {
            var newScript = document.createElement('script');
            if (oldScript.src) {
                newScript.src = oldScript.src;
            } else {
                newScript.textContent = oldScript.textContent;
            }
            oldScript.parentNode.replaceChild(newScript, oldScript);
        });
    } catch (error) {
        console.error('Error fetching content:', error);
    }
}

function FetchData(filePath) {
    return fetch(cacheBust(filePath))
        .then(function(response) {
            if (!response.ok) {
                throw new Error('Failed to fetch data from ' + filePath);
            }
            return response.json();
        })
        .then(function(data) {
            return [data];
        })
        .catch(function(error) {
            console.error('Error fetching or parsing data:', error);
            return [];
        });
}

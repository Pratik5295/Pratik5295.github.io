// Revalidate cached content and share concurrent requests within this page.
var siteRequests = new Map();
function fetchSiteResource(path, format) {
    var url = new URL(path, window.location.href).href;
    var key = format + ':' + url;
    if (siteRequests.has(key)) return siteRequests.get(key);
    var controller = new AbortController();
    var timeout = setTimeout(function () { controller.abort(); }, 10000);
    var request = (async function () {
        try {
            var response = await fetch(url, { cache: 'no-cache', signal: controller.signal });
            if (!response.ok) throw new Error('Could not load ' + path + ' (' + response.status + ')');
            return await (format === 'json' ? response.json() : response.text());
        } finally {
            clearTimeout(timeout);
        }
    })().finally(function () { siteRequests.delete(key); });
    siteRequests.set(key, request);
    return request;
}
function fetchSiteJSON(path) { return fetchSiteResource(path, 'json'); }
function fetchSiteText(path) { return fetchSiteResource(path, 'text'); }

function createLoadError(message, retry) {
    var panel = document.createElement('div');
    panel.className = 'load-error';
    var description = document.createElement('p');
    description.setAttribute('role', 'status');
    description.textContent = message;
    panel.appendChild(description);
    var button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Try again';
    button.addEventListener('click', async function () {
        var restoreFocus = document.activeElement === button;
        button.disabled = true;
        button.textContent = 'Retrying…';
        try {
            var nextFocus = await retry();
            if (restoreFocus && nextFocus) nextFocus.focus({ preventScroll: true });
        } catch (error) {
            console.error(error);
        } finally {
            button.disabled = false;
            button.textContent = 'Try again';
        }
    });
    panel.appendChild(button);
    return panel;
}

async function activateFragmentScripts(container) {
    for (var oldScript of container.querySelectorAll('script')) {
        var script = document.createElement('script');
        if (oldScript.src) {
            await new Promise(function (resolve, reject) {
                var timer = setTimeout(function () {
                    script.remove();
                    reject(new Error('Script timed out: ' + oldScript.src));
                }, 10000);
                script.onload = function () { clearTimeout(timer); resolve(); };
                script.onerror = function () { clearTimeout(timer); reject(new Error('Script unavailable: ' + oldScript.src)); };
                script.async = false;
                script.src = oldScript.src;
                oldScript.replaceWith(script);
            });
        } else {
            script.textContent = oldScript.textContent;
            oldScript.replaceWith(script);
        }
    }
}

async function LoadPage(path, id) {
    var container = document.getElementById(id);
    if (!container) return false;
    container.setAttribute('aria-busy', 'true');
    try {
        var html = await fetchSiteText(path);
        var fragment = document.createElement('div');
        fragment.innerHTML = html;
        var expected = { navbar: '.nav-wrapper', 'footer-container': '.site-footer', artHomePage: '.artHomePage' }[id];
        if (expected && !fragment.querySelector(expected)) throw new Error('Unexpected content in ' + path);
        container.replaceChildren(...Array.from(fragment.childNodes));
        await activateFragmentScripts(container);
        return true;
    } catch (error) {
        console.error('Could not load page section:', error);
        var names = { navbar: 'Navigation', 'footer-container': 'Contact information', artHomePage: 'Artwork' };
        var panel = createLoadError((names[id] || 'This section') + ' could not be loaded.', async function () {
            await LoadPage(path, id);
            return container.querySelector('button, a');
        });
        if (id === 'footer-container') {
            panel.id = 'contact';
            panel.tabIndex = -1;
        }
        if (id === 'navbar' || id === 'footer-container') {
            var home = document.createElement('a');
            home.href = '/';
            home.textContent = 'Home';
            panel.appendChild(home);
            var contact = document.createElement('a');
            contact.href = 'mailto:pratikshringarpure05@gmail.com';
            contact.textContent = 'Email Pratik';
            panel.appendChild(contact);
        }
        container.replaceChildren(panel);
        return false;
    } finally {
        container.setAttribute('aria-busy', 'false');
    }
}

function setProjectImage(image, data, sizes) {
    var original = data.screenshotUrl || data.imageUrl || '';
    var variants = Array.isArray(data.imageVariants) ? data.imageVariants.filter(function (variant) {
        return variant && typeof variant.url === 'string' && Number.isFinite(variant.width) && variant.width > 0;
    }) : [];
    image.dataset.managedImage = 'true';
    image.removeAttribute('srcset');
    delete image.dataset.fallbackSrc;
    if (!original) {
        image.hidden = true;
        return;
    }
    image.hidden = false;
    image.sizes = sizes;
    if (variants.length) {
        image.dataset.fallbackSrc = new URL(original, window.location.origin + '/').href;
        image.srcset = variants.map(function (variant) { return '/' + variant.url + ' ' + variant.width + 'w'; }).join(', ');
        image.src = '/' + variants[variants.length - 1].url;
    } else {
        image.src = new URL(original, window.location.origin + '/').href;
    }
}

// Optimized image unavailable: try the original once, then show a useful placeholder.
document.addEventListener('error', function (event) {
    var image = event.target;
    if (image.tagName !== 'IMG' || image.dataset.managedImage !== 'true') return;
    var original = image.dataset.fallbackSrc;
    if (original) {
        delete image.dataset.fallbackSrc;
        image.removeAttribute('srcset');
        image.src = original;
        return;
    }
    image.hidden = true;
    var media = image.closest('.project-card-media, .project-media, .grid-item');
    var placeholder = media && media.querySelector('[data-image-placeholder]');
    if (placeholder) placeholder.hidden = false;
}, true);

function FetchData(filePath) {
    return fetchSiteJSON(filePath).then(function (data) { return [data]; }).catch(function (error) {
        console.error('Could not load data:', error);
        return [];
    });
}

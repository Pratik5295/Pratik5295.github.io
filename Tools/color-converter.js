(function () {
    const root = document.querySelector('.fux');
    if (!root) return;

    const $ = id => root.querySelector('#' + id);
    const copyButtons = [...root.querySelectorAll('[data-copy-target]')];
    const clamp01 = value => Math.max(0, Math.min(1, value));
    const round = (value, precision = 4) => Math.round(value * 10 ** precision) / 10 ** precision;
    const byteToHex = value => Math.round(Math.max(0, Math.min(255, value)))
        .toString(16).padStart(2, '0').toUpperCase();
    const alphaToHex = alpha => byteToHex(clamp01(alpha) * 255);

    function parseNumber(value, label) {
        const token = String(value).trim();
        if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?%?$/i.test(token)) {
            throw new Error(`Invalid ${label}. Use a number or percentage.`);
        }
        const percentage = token.endsWith('%');
        const number = Number(percentage ? token.slice(0, -1) : token);
        if (!Number.isFinite(number)) throw new Error(`Invalid ${label}. Use a finite number.`);
        return { number, percentage };
    }

    function channelTo255(value) {
        const { number, percentage } = parseNumber(value, 'RGB channel');
        return percentage ? clamp01(number / 100) * 255 : Math.max(0, Math.min(255, number));
    }

    function alphaTo01(value) {
        if (value === undefined) return 1;
        const { number, percentage } = parseNumber(value, 'alpha');
        if (percentage) return clamp01(number / 100);
        // Retain support for the original tool's 0–255 alpha input.
        return number > 1 ? clamp01(number / 255) : clamp01(number);
    }

    function parseColor(input) {
        const value = String(input).trim();
        if (!value) throw new Error('Enter a color.');
        if (value.startsWith('#')) {
            let hex = value.slice(1);
            if (![3, 4, 6, 8].includes(hex.length) || !/^[0-9a-f]+$/i.test(hex)) {
                throw new Error('Use #RGB, #RGBA, #RRGGBB, or #RRGGBBAA with valid hex digits.');
            }
            if (hex.length === 3 || hex.length === 4) hex = [...hex].map(ch => ch + ch).join('');
            return {
                r: parseInt(hex.slice(0, 2), 16),
                g: parseInt(hex.slice(2, 4), 16),
                b: parseInt(hex.slice(4, 6), 16),
                a: hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1
            };
        }

        const match = value.match(/^rgba?\((.*)\)$/i);
        if (!match) throw new Error('Use a hex, RGB, or RGBA color, e.g. rgba(0, 0, 0, 0.35).');
        const body = match[1].trim();
        let parts;
        if (body.includes(',')) {
            parts = body.split(',').map(part => part.trim());
        } else if (body.includes('/')) {
            const slashParts = body.split('/').map(part => part.trim());
            if (slashParts.length !== 2 || !slashParts[0] || !slashParts[1]) {
                throw new Error('Use three RGB channels followed by / and one alpha value.');
            }
            const channels = slashParts[0].split(/\s+/);
            if (channels.length !== 3) throw new Error('Enter three RGB channels before the alpha.');
            parts = [...channels, slashParts[1]];
        } else {
            parts = body.split(/\s+/);
        }
        if (parts.length < 3 || parts.length > 4 || parts.some(part => !part)) {
            throw new Error('RGB/RGBA needs three channels and an optional alpha, with no empty values.');
        }
        return {
            r: channelTo255(parts[0]), g: channelTo255(parts[1]), b: channelTo255(parts[2]),
            a: alphaTo01(parts[3])
        };
    }

    function readColor(id, label) {
        try {
            return parseColor($(id).value);
        } catch (error) {
            $(id).setAttribute('aria-invalid', 'true');
            throw new Error(`${label}: ${error.message}`);
        }
    }

    function linearFromSrgb01(value, method) {
        const x = clamp01(value);
        if (method === 'gamma22') return x ** 2.2;
        return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
    }

    function srgbFromLinear01(value, method) {
        const x = clamp01(value);
        if (method === 'gamma22') return x ** (1 / 2.2);
        return x <= 0.0031308 ? x * 12.92 : 1.055 * x ** (1 / 2.4) - 0.055;
    }

    function rgbaString(color, alpha = color.a) {
        return `rgba(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}, ${round(alpha)})`;
    }

    function hex8(color, alpha = color.a) {
        return `#${byteToHex(color.r)}${byteToHex(color.g)}${byteToHex(color.b)}${alphaToHex(alpha)}`;
    }

    function rgbBytes(r, g, b) {
        return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
    }

    function clearResult() {
        ['unityRgba', 'unityHex', 'bakedRgba'].forEach(id => { $(id).textContent = '—'; });
        ['unityRgbaNote', 'unityHexNote', 'parsedInfo'].forEach(id => { $(id).textContent = ''; });
        $('mathRows').innerHTML = '<tr><td colspan="5">Enter valid colors to see the calculation.</td></tr>';
        $('previewPanel').hidden = true;
        copyButtons.forEach(button => { button.disabled = true; });
    }

    function convert() {
        const error = $('error');
        error.hidden = true;
        error.textContent = '';
        $('copy-feedback').textContent = '';
        ['fgInput', 'bgInput'].forEach(id => { $(id).setAttribute('aria-invalid', 'false'); });

        try {
            const fg = readColor('fgInput', 'Foreground');
            const bg = readColor('bgInput', 'Background');
            if (bg.a < 1) {
                $('bgInput').setAttribute('aria-invalid', 'true');
                throw new Error('Background: use an opaque color. For layers, enter the final visible background color.');
            }
            const method = $('methodSelect').value;
            const alphaMode = $('alphaMode').value;
            const names = ['R', 'G', 'B'];
            const fgVals = [fg.r / 255, fg.g / 255, fg.b / 255];
            const bgVals = [bg.r / 255, bg.g / 255, bg.b / 255];
            const rows = [], solved = [], desiredSrgb = [], desiredLinear = [];
            const fgLinear = [], bgLinear = [], deltas = [];

            for (let i = 0; i < 3; i++) {
                const F = fgVals[i], B = bgVals[i];
                const target = F * fg.a + B * (1 - fg.a);
                const resultLinear = linearFromSrgb01(target, method);
                const fLin = linearFromSrgb01(F, method);
                const bLin = linearFromSrgb01(B, method);
                const delta = fLin - bLin;
                desiredSrgb.push(target);
                desiredLinear.push(resultLinear);
                fgLinear.push(fLin);
                bgLinear.push(bLin);
                deltas.push(delta);
                let solvedAlpha = null;
                if (Math.abs(delta) > 1e-7) {
                    solvedAlpha = (resultLinear - bLin) / delta;
                    solved.push(clamp01(solvedAlpha));
                }
                rows.push({ channel: names[i], foreground: F, background: B, target, solvedAlpha });
            }
            if (!solved.length) {
                throw new Error('Foreground and background are the same color. Choose different colors to calculate an alpha adjustment.');
            }

            let unityAlpha;
            if (alphaMode === 'average') {
                unityAlpha = solved.reduce((a, b) => a + b, 0) / solved.length;
            } else if (alphaMode === 'max') {
                unityAlpha = Math.max(...solved);
            } else {
                let numerator = 0, denominator = 0;
                for (let i = 0; i < 3; i++) {
                    const delta = deltas[i];
                    if (Math.abs(delta) <= 1e-7) continue;
                    numerator += delta * (desiredLinear[i] - bgLinear[i]);
                    denominator += delta * delta;
                }
                unityAlpha = denominator > 0 ? numerator / denominator : solved.reduce((a, b) => a + b, 0) / solved.length;
            }
            unityAlpha = clamp01(unityAlpha);
            const spread = solved.length > 1 ? Math.max(...solved) - Math.min(...solved) : 0;
            const isCloseMatch = spread <= 0.035;
            const unityFinalSrgb = fgLinear.map((channel, i) =>
                srgbFromLinear01(channel * unityAlpha + bgLinear[i] * (1 - unityAlpha), method));
            const baked = { r: desiredSrgb[0] * 255, g: desiredSrgb[1] * 255, b: desiredSrgb[2] * 255, a: 1 };

            $('unityRgba').textContent = rgbaString(fg, unityAlpha);
            $('unityHex').textContent = hex8(fg, unityAlpha);
            $('bakedRgba').textContent = rgbaString(baked);
            $('unityRgbaNote').textContent = `Original alpha ${round(fg.a)} → suggested alpha ${round(unityAlpha)}. RGB stays the same.`;
            $('unityHexNote').textContent = `Alpha hex ${alphaToHex(fg.a)} → ${alphaToHex(unityAlpha)}. Hex rounds alpha to 8 bits.`;
            $('status').className = 'status ' + (isCloseMatch ? 'good' : 'warn');
            $('status').textContent = isCloseMatch
                ? 'Channel alpha estimates agree closely. Try this value in your Unity panel.'
                : 'The channels need different alpha values. This is an approximation; compare the previews or try the opaque color for this background.';

            // All interpolated values are normalized numbers or fixed channel names.
            $('mathRows').innerHTML = rows.map(row => {
                const solvedText = row.solvedAlpha === null ? 'Not constrained' : round(clamp01(row.solvedAlpha));
                return `<tr><td>${row.channel}</td><td>${round(row.foreground)} <span class="muted">(${Math.round(row.foreground * 255)})</span></td><td>${round(row.background)} <span class="muted">(${Math.round(row.background * 255)})</span></td><td>${round(row.target)} <span class="muted">(${Math.round(row.target * 255)})</span></td><td>${solvedText}</td></tr>`;
            }).join('');
            $('parsedInfo').textContent = `Parsed foreground: ${rgbaString(fg)}. Parsed background: ${rgbaString(bg)}.`;
            const bgCss = rgbBytes(bg.r, bg.g, bg.b);
            ['figmaPreview', 'unityPreview', 'bakedPreview'].forEach(id => { $(id).style.backgroundColor = bgCss; });
            $('figmaChip').style.backgroundColor = rgbaString(fg);
            $('unityChip').style.backgroundColor = rgbBytes(...unityFinalSrgb.map(channel => channel * 255));
            $('bakedChip').style.backgroundColor = rgbBytes(baked.r, baked.g, baked.b);
            $('previewPanel').hidden = false;
            copyButtons.forEach(button => { button.disabled = false; });
        } catch (failure) {
            clearResult();
            error.hidden = false;
            error.textContent = failure.message || String(failure);
            $('status').className = 'status warn';
            $('status').textContent = 'Check the colors to generate a new result.';
        }
    }

    $('convertBtn').addEventListener('click', convert);
    $('fgInput').addEventListener('input', convert);
    $('bgInput').addEventListener('input', convert);
    $('methodSelect').addEventListener('change', convert);
    $('alphaMode').addEventListener('change', convert);
    const samples = {
        sampleBlack35: '#00000059',
        sampleDark85: 'rgba(26, 26, 26, 0.85)',
        sampleTeal40: 'rgba(0, 229, 191, 0.4)'
    };
    Object.entries(samples).forEach(([id, color]) => {
        $(id).addEventListener('click', () => {
            $('fgInput').value = color;
            $('bgInput').value = '#FFFFFF';
            convert();
        });
    });

    copyButtons.forEach(button => {
        let feedbackTimer;
        button.addEventListener('click', async () => {
            if (button.disabled) return;
            const text = $(button.getAttribute('data-copy-target')).textContent;
            try {
                await navigator.clipboard.writeText(text);
                button.textContent = 'Copied';
                $('copy-feedback').textContent = `Copied ${text}.`;
            } catch {
                button.textContent = 'Select text';
                $('copy-feedback').textContent = 'Clipboard is unavailable. Select the displayed value and copy it manually.';
            }
            clearTimeout(feedbackTimer);
            feedbackTimer = setTimeout(() => { button.textContent = 'Copy'; }, 1500);
        });
    });
    convert();
})();

(() => {
    'use strict';

    const C = window.CONFIG || {};
    const A = C.animations || {};
    const B = C.background || {};
    const S = C.server || {};
    const T = C.texts || {};

    const $ = (selector) => document.querySelector(selector);

    const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));

    const _L = (key, fallback) => T[key] ?? fallback ?? key;

    const safeUrl = (url) => (/^(https?:|fivem:)/i.test(String(url || '')) ? String(url) : '#');

    Object.keys(A).forEach((key) => document.body.classList.toggle('no-' + key, !A[key]));
    document.title = C.title || C.name || document.title;

    let statusTimer = null;
    let customBackground = false;
    let backgroundVideo = null;

    const renderMeta = () => {
        const languages = C.languages || [];
        if (!C.location && !languages.length) return '';

        const location = C.location
            ? `<span class="item"><i class="fa-solid fa-location-dot"></i>${esc(C.location)}</span>`
            : '';

        const tags = languages.length
            ? `<span class="item"><i class="fa-solid fa-language" aria-label="${esc(_L('languages', 'Languages'))}"></i>${languages.map((l) =>
                `<span class="tag" title="${esc(l.name)}">${esc(l.code)}</span>`).join('')}</span>`
            : '';

        return `<div class="meta">${location}${tags}</div>`;
    };

    const renderLogo = () => {
        const initial = esc((C.name || '?').charAt(0));
        const image = C.logo
            ? `<img src="${esc(C.logo)}" alt="" width="104" height="104" decoding="async" data-initial="${initial}" onerror="this.replaceWith(this.dataset.initial)">`
            : '';
        return `<div class="logo">${image || initial}</div>`;
    };

    const renderServer = () => {
        if (!S.name) return '';

        const icon = C.logo
            ? `<img src="${esc(C.logo)}" alt="" onerror="this.remove()">`
            : '';

        const statusPill = S.statusUrl
            ? `<span class="status" id="srv-status">${esc(_L('checking', 'Checking'))}</span>`
            : '';

        const connect = S.connectUrl
            ? `<a class="btn btn-primary" href="${esc(safeUrl(S.connectUrl))}" target="_blank" rel="noopener"><i class="fa-solid fa-play"></i>${esc(_L('connect', 'Connect'))}</a>`
            : '';

        const players = S.statusUrl
            ? `<div class="players" id="srv-players">
                <div class="players-row"><span>${esc(_L('players', 'Players'))}</span><b id="srv-count">-</b></div>
                <div class="bar"><i id="srv-fill"></i></div>
            </div>`
            : '';

        const address = S.address
            ? `<div class="address">
                <code>${esc(S.address)}</code>
                <button class="btn btn-secondary" type="button" id="srv-copy"><i class="fa-regular fa-copy"></i><span>${esc(_L('copy', 'Copy'))}</span></button>
            </div>`
            : '';

        return `
        <section class="server tilt">
            <div class="server-head">
                <div class="server-icon">${esc(S.name.charAt(0))}${icon}</div>
                <div class="server-info">
                    <div class="server-title">${esc(S.name)}${statusPill}</div>
                    ${S.description ? `<div class="server-desc">${esc(S.description)}</div>` : ''}
                </div>
                ${connect}
            </div>
            ${players}
            ${address}
        </section>`;
    };

    const render = () => {
        $('#app').innerHTML = `
        <section class="card tilt">
            <div class="top">
                <div>
                    <h1 class="name">${esc(C.name)}</h1>
                    ${C.bio ? `<p class="bio">${esc(C.bio)}</p>` : ''}
                    ${renderMeta()}
                </div>
                ${renderLogo()}
            </div>
            <div class="links">${(C.links || []).map((l, i) =>
                `<a href="${esc(safeUrl(l.url))}" target="_blank" rel="noopener" style="--i:${i}" aria-label="${esc(l.title)}"><i class="${esc(l.icon)}"></i><span class="tooltip">${esc(l.title)}</span></a>`).join('')}</div>
            <div class="foot">
                <div class="badges">${(C.badges || []).map((b) =>
                    `<div class="badge"><i class="${esc(b.icon)}"></i><div class="tooltip"><b>${esc(b.title)}</b><span>${esc(b.desc)}</span></div></div>`).join('')}</div>
            </div>
        </section>
        ${renderServer()}`;
    };

    const fetchJson = async (url) => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), Number(S.timeoutMs) || 5000);

        try {
            const response = await fetch(url, { signal: controller.signal, cache: 'no-store' });
            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            return null;
        } finally {
            clearTimeout(timer);
        }
    };

    const setStatus = (state, count, max) => {
        const pill = $('#srv-status');
        const countEl = $('#srv-count');
        const fill = $('#srv-fill');
        if (!pill || !countEl || !fill) return;

        pill.className = 'status ' + state;
        pill.textContent = state === 'online' ? _L('online', 'Online') : _L('offline', 'Offline');

        if (state !== 'online') {
            countEl.textContent = '-';
            fill.style.width = '0';
            return;
        }

        countEl.textContent = max > 0 ? `${count} / ${max}` : String(count);
        fill.style.width = max > 0 ? Math.min(100, (count / max) * 100) + '%' : '0';
    };

    const refreshStatus = async () => {
        if (document.hidden) return;

        const base = String(S.statusUrl).replace(/\/+$/, '');
        const [players, info] = await Promise.all([
            fetchJson(base + '/players.json'),
            fetchJson(base + '/info.json')
        ]);

        if (!Array.isArray(players)) return setStatus('offline');

        const max = Number(info && info.vars && info.vars.sv_maxClients) || Number(S.maxPlayers) || 0;
        setStatus('online', players.length, max);
    };

    const initStatus = () => {
        if (!S.name || !S.statusUrl) return;

        refreshStatus();

        if (Number(S.refreshMs) > 0) {
            statusTimer = setInterval(refreshStatus, Number(S.refreshMs));
        }

        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) refreshStatus();
        });
    };

    const initCopy = () => {
        const button = $('#srv-copy');
        if (!button) return;

        const label = button.querySelector('span');
        let timer = null;

        button.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(S.address);
            } catch (error) {
                return;
            }

            label.textContent = _L('copied', 'Copied');
            clearTimeout(timer);
            timer = setTimeout(() => { label.textContent = _L('copy', 'Copy'); }, Number(S.copyFeedbackMs) || 1500);
        });
    };

    const initTilt = () => {
        if (A.tilt === false) return;

        document.querySelectorAll('.tilt').forEach((el) => {
            el.addEventListener('pointermove', (e) => {
                if (e.pointerType === 'touch') return;
                const rect = el.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                el.style.transform = `perspective(900px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg)`;
            });
            el.addEventListener('pointerleave', () => { el.style.transform = ''; });
        });
    };

    const canvas = $('#bg');
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let stars = [];

    const resize = () => {
        width = canvas.width = innerWidth;
        height = canvas.height = innerHeight;
        stars = Array.from({ length: 120 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            size: 1 + Math.random() * 1.8,
            phase: Math.random() * 6,
            speed: 0.5 + Math.random() * 1.5
        }));
    };

    const drawEclipse = (ms) => {
        const x = width / 2;
        const y = height * 0.24;
        const radius = Math.min(width, height) * 0.13;
        const pulse = 1 + Math.sin(ms / 2600) * 0.05;

        const glow = ctx.createRadialGradient(x, y, radius * 0.95, x, y, radius * 3.4 * pulse);
        glow.addColorStop(0, 'rgba(255, 255, 255, 0.32)');
        glow.addColorStop(0.18, 'rgba(255, 255, 255, 0.1)');
        glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, radius * 3.4 * pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0a0a0a';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        const angle = ms / 9000 - Math.PI / 4;
        const sx = x + Math.cos(angle) * radius;
        const sy = y + Math.sin(angle) * radius;
        const spark = ctx.createRadialGradient(sx, sy, 0, sx, sy, radius * 0.5);
        spark.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        spark.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = spark;
        ctx.beginPath();
        ctx.arc(sx, sy, radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
    };

    const frame = (ms) => {
        if (document.hidden) return requestAnimationFrame(frame);

        const drawing = !customBackground || B.canvasOverlay;

        if (!drawing) {
            ctx.clearRect(0, 0, width, height);
            return requestAnimationFrame(frame);
        }

        if (customBackground) {
            ctx.clearRect(0, 0, width, height);
        } else {
            ctx.fillStyle = '#0a0a0a';
            ctx.fillRect(0, 0, width, height);
        }

        stars.forEach((star) => {
            const alpha = 0.25 + 0.75 * Math.abs(Math.sin(ms / 1000 * star.speed + star.phase));
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size / 2, 0, Math.PI * 2);
            ctx.fill();
        });

        if (!customBackground) drawEclipse(ms);

        requestAnimationFrame(frame);
    };

    const showBackground = () => {
        customBackground = true;
        $('#bgmedia').classList.add('show');
    };

    const initBackground = () => {
        if (!B.src) return;

        const holder = $('#bgmedia');
        holder.style.setProperty('--dim', B.dim ?? 0.35);

        if (/\.(mp4|webm|ogv)(\?.*)?$/i.test(B.src)) {
            const video = document.createElement('video');
            Object.assign(video, { src: B.src, autoplay: true, muted: true, loop: true, playsInline: true, preload: 'auto' });
            video.setAttribute('disablepictureinpicture', '');
            video.style.objectFit = B.fit === 'contain' ? 'contain' : 'cover';

            video.addEventListener('loadeddata', () => {
                holder.prepend(video);
                backgroundVideo = video;
                showBackground();
                video.play().catch(() => {});
            }, { once: true });

            document.addEventListener('visibilitychange', () => {
                if (!backgroundVideo) return;
                if (document.hidden) backgroundVideo.pause();
                else backgroundVideo.play().catch(() => {});
            });
            return;
        }

        const image = new Image();
        image.onload = () => {
            holder.style.backgroundImage = `url("${B.src}")`;
            holder.style.backgroundSize = B.fit || 'cover';
            showBackground();
        };
        image.src = B.src;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('beforeunload', () => clearInterval(statusTimer));

    resize();
    render();
    initTilt();
    initCopy();
    initStatus();
    initBackground();
    requestAnimationFrame(frame);
})();

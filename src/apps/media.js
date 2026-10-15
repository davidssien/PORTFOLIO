import { imageApps, picturesApp, escapeHTML as esc } from './images.js';

const videoImports = import.meta.glob('../assets/videos/*.{mp4,webm,ogv}', { eager: true, query: '?url', import: 'default' });
const audioImports = import.meta.glob('../assets/music/*.{mp3,wav,ogg,m4a,flac}', { eager: true, query: '?url', import: 'default' });
const filename = path => path.split('/').pop();
const bundledVideos = ['/media/moonfish.mp4', '/media/orbit-club.mp4'];
const bundledMusic = ['/media/bubble-waltz.wav', '/media/starlight-steps.wav'];
const tracks = [...bundledMusic, ...Object.values(audioImports)].map(src => ({ src, name: filename(src) }));

// Also handles hosts that have not yet adopted mount's returned disposer.
function lifecycle(container, dispose) {
    let disposed = false;
    const observer = new MutationObserver(() => { if (!container.isConnected) cleanup(); });
    function cleanup() {
        if (disposed) return;
        disposed = true;
        observer.disconnect();
        dispose();
    }
    observer.observe(container.ownerDocument.documentElement, { childList: true, subtree: true });
    return cleanup;
}
function stop(media) {
    media.pause();
    media.removeAttribute('src');
    media.load();
}
const panel = 'padding:20px;background:#eef0e9;color:#172b3a;height:100%;overflow:auto;box-sizing:border-box;font:14px system-ui,sans-serif';

export const videoApps = [...bundledVideos, ...Object.values(videoImports)].map((src, index) => ({
    id: `media-video-${index}`, filename: filename(src), title: filename(src),
    icon: '/icons/exe.svg', type: 'video', desktop: false, width: 680, height: 500,
    allowMultipleInstances: true,
    render: () => `<div style="${panel}"><video controls playsinline preload="metadata" src="${esc(src)}" style="width:100%;max-height:360px;background:#132441" aria-label="${esc(filename(src))}"></video><p>${esc(filename(src))}</p><p data-media-status role="status">Use the native controls to play, seek, or view fullscreen.</p></div>`,
    mount(container) {
        const video = container.querySelector('video');
        const error = () => { container.querySelector('[data-media-status]').textContent = 'This video could not be played in this browser.'; };
        video.addEventListener('error', error);
        return lifecycle(container, () => { video.removeEventListener('error', error); stop(video); });
    }
}));

export const videosApp = {
    openFilesOnClick: true,
    id: 'videos', filename: 'Videos', title: 'Videos', icon: '/icons/folder.svg',
    type: 'folder', desktop: true, width: 560, height: 370,
    render: () => `<div style="${panel}"><h2>Small moving worlds</h2><p>Original six-second silent animations. Open a clip to play.</p><div style="display:flex;gap:18px;flex-wrap:wrap">${videoApps.map(app => `<button data-open-app="${app.id}" style="padding:16px;max-width:180px;overflow-wrap:anywhere"><span aria-hidden="true" style="display:block;font-size:36px">🎬</span>${esc(app.filename)}</button>`).join('')}</div></div>`
};

export const musicApp = {
    id: 'music', filename: 'Music Player', title: 'Music Player', icon: '/icons/exe.svg',
    desktop: true, width: 540, height: 460,
    render: () => `<div style="${panel}"><h2>Little Radio ♫</h2><p>Original pocket-sized synthesizer tunes.</p><p data-now-playing aria-live="polite"></p><audio controls preload="metadata" style="width:100%"></audio><div style="display:flex;gap:12px;margin:16px 0"><button data-prev aria-label="Previous track">⏮ Previous</button><button data-next aria-label="Next track">Next ⏭</button></div><ol data-playlist></ol><label>Add local audio files <input data-import type="file" accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac" multiple></label><p data-status role="status">Local files stay on your device.</p></div>`,
    mount(container) {
        const playlist = tracks.map(track => ({ ...track }));
        const urls = new Set();
        const audio = container.querySelector('audio');
        const list = container.querySelector('[data-playlist]');
        const status = container.querySelector('[data-status]');
        let current = 0;
        let closed = false;
        function draw() {
            list.innerHTML = playlist.map((track, i) => `<li><button data-track="${i}" ${i === current ? 'aria-current="true"' : ''} style="margin:3px;padding:4px;${i === current ? 'font-weight:bold' : ''}">${esc(track.name)}</button></li>`).join('');
        }
        function select(index, play = false) {
            current = (index + playlist.length) % playlist.length;
            audio.src = playlist[current].src;
            container.querySelector('[data-now-playing]').textContent = playlist[current].name;
            draw();
            if (play) audio.play().catch(() => { if (!closed) status.textContent = 'Playback paused or unavailable. Try the native Play control.'; });
        }
        function click(event) {
            if (event.target.closest('[data-prev]')) select(current - 1, true);
            if (event.target.closest('[data-next]')) select(current + 1, true);
            const button = event.target.closest('[data-track]');
            if (button) select(Number(button.dataset.track), true);
        }
        function ended() { select(current + 1, true); }
        function error() { status.textContent = 'Unable to decode this track. Try another file or format.'; }
        const input = container.querySelector('[data-import]');
        function importFiles() {
            let added = 0;
            for (const file of input.files) {
                if (!file.type.startsWith('audio/') && !/\.(mp3|wav|ogg|m4a|flac)$/i.test(file.name)) continue;
                const src = URL.createObjectURL(file);
                urls.add(src);
                playlist.push({ src, name: file.name });
                added++;
            }
            draw();
            status.textContent = `${added} local track(s) added. Files are not uploaded or saved.`;
            input.value = '';
        }
        container.addEventListener('click', click);
        input.addEventListener('change', importFiles);
        audio.addEventListener('ended', ended);
        audio.addEventListener('error', error);
        select(0);
        return lifecycle(container, () => {
            closed = true;
            container.removeEventListener('click', click);
            input.removeEventListener('change', importFiles);
            audio.removeEventListener('ended', ended);
            audio.removeEventListener('error', error);
            stop(audio);
            urls.forEach(url => URL.revokeObjectURL(url));
        });
    }
};

export const aquariumApp = {
    id: 'aquarium', filename: 'Pocket Aquarium', title: 'Pocket Aquarium',
    icon: '/icons/exe.svg', desktop: true, width: 570, height: 400,
    render: () => `<div class="pocket-aquarium" style="${panel}"><style>
    .pocket-aquarium .tank{height:230px;position:relative;overflow:hidden;background:linear-gradient(#124863,#062638);border-radius:18px;border:5px solid #83c8ca}
    .pocket-aquarium .fish{position:absolute;left:-80px;font-size:40px;animation:pocket-swim 12s linear infinite}
    .pocket-aquarium .fish:nth-child(2){top:85px;animation-delay:-5s;animation-duration:17s}
    .pocket-aquarium .fish:nth-child(3){top:145px;animation-delay:-9s;animation-duration:14s}
    .pocket-aquarium .plants{position:absolute;bottom:0;width:100%;font-size:38px;letter-spacing:20px}
    .pocket-aquarium:has(input:checked) .fish{animation-play-state:paused}
    @keyframes pocket-swim{from{left:-80px;transform:translateY(0)}50%{transform:translateY(18px)}to{left:110%;transform:translateY(0)}}
    @media(prefers-reduced-motion:reduce){.pocket-aquarium .fish{animation:none;left:20%}.pocket-aquarium .fish:nth-child(2){left:50%}.pocket-aquarium .fish:nth-child(3){left:75%}}
    </style><h2>Pocket Aquarium</h2><div class="tank" role="img" aria-label="Three colorful fish swimming above seaweed"><span class="fish">🐠</span><span class="fish">🐟</span><span class="fish">🐡</span><div class="plants">🌿 🪸 🌱 🌿</div></div><label><input type="checkbox"> Pause swimming</label><p>No feeding required. Just a little window of calm.</p></div>`
};

// Register every entry, including the non-desktop image and clip viewers.
export const mediaApps = [picturesApp, ...imageApps, videosApp, ...videoApps, musicApp, aquariumApp];

# Media apps

Register every entry in the named `mediaApps` export from `src/apps/media.js`.
It includes Pictures, all image viewers, Videos, all clip viewers, Music Player,
and Pocket Aquarium. Do not register `imageApps` or `picturesApp` again separately.
Folders use the existing `data-open-app` event delegation. `mount(container)` returns
an idempotent disposer: call it when closing a window. A DOM-removal observer also
stops playback in older hosts that ignore that return value.

## Bundled original samples

All artwork, motion and music were procedurally authored for this project; no
third-party media was downloaded. `public/media/generate.py` is the reproducible
source. It needs Python, Pillow and imageio-ffmpeg for asset generation only;
these are **not runtime or package dependencies**.

- `moonfish.png`, `orbit-club.png`: 480 × 320 original illustrations.
- `moonfish.gif`: 40-frame, four-second looping animation.
- `moonfish.mp4`, `orbit-club.mp4`: actual six-second 480 × 320, 20fps H.264,
  yuv420p MP4 clips with fast-start metadata. Intentionally silent.
- `bubble-waltz.wav`, `starlight-steps.wav`: original twelve-second synthesized
  melodies, mono 22,050 Hz PCM audio.

## Add files

Drop images into `src/assets/pictures/` (png, gif, jpg, jpeg, webp). The existing
Vite eager URL glob is retained and merges additions with the bundled samples.
Drop videos into `src/assets/videos/` (mp4, webm, ogv), and music into
`src/assets/music/` (mp3, wav, ogg, m4a, flac). Create these folders if needed.
Globs currently discover direct children with lowercase extensions; rebuild for
production after adding files. Codec support depends on the browser, not just
the extension. H.264 MP4 and PCM WAV are recommended.

Alternatively add public files to the bundled lists in `media.js` or
`bundledImages` in `images.js`. Public files alone are not auto-discovered.
Public URLs follow the project's existing root-deployment convention.

The Music Player also accepts multiple local audio files without uploading them.
Imported tracks are per-window and temporary. Their object URLs are revoked on
close; the playlist is not persisted. Playback never autostarts on opening a
window. Native controls provide play/pause, seeking and volume; Next/Previous,
playlist selection, and automatic next-track on ending are supported.

Pocket Aquarium uses locally scoped CSS, a pause checkbox, and honors reduced
motion preferences. It needs no timer, external image or network request.

## Verification

`npm run build` passes. Both MP4s and both WAVs were fully decoded with ffmpeg
without errors. No runtime libraries were added. Browser smoke tests should
check metadata, playback, next/previous, imported filenames containing HTML
characters, and closing a playing window.

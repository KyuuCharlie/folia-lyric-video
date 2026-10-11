# Folia Lyric Studio

A Windows-first desktop lyric-video editor with local MP4 export as the primary goal.

## Goals
- Windows desktop app, ultimately distributed as a setup `.exe` and (if practical) a portable build.
- Import audio, edit timed lyrics, preview typography and animation, export MP4 locally.
- Keep the renderer separate from the UI so REST API and webhook automation can be added later.
- Reuse upstream Folia code only after reviewing its license and implementation.

## Planned stack
- UI: React + TypeScript + Vite
- Desktop shell: Tauri 2
- Rendering: dedicated module; FFmpeg integration to be validated during implementation
- Tests: Vitest and Rust tests where appropriate

## Status
The first rendering MVP is implemented: import a local audio file, edit lyric text and start times, preview playback, choose one of three visual themes, and render a 1920×1080 / 30 FPS WebM video with synchronized audio. Rendering happens locally in the desktop/web runtime; audio is not uploaded. MP4/H.264 encoding, REST API/webhooks, and verified Windows release packaging remain follow-up work. The Windows Actions build is being validated.

## Development
Prerequisites: Node.js LTS/npm, Rust stable, and Tauri's Windows build prerequisites.

```bash
npm install
npm run dev
npm run build
```

## Roadmap
1. Scaffold and validate the Windows desktop shell.
2. Review Folia's license, timeline, animation, and export implementation.
3. Build lyric editing and preview MVP.
4. Implement local MP4 rendering and progress reporting.
5. Add optional REST API/webhook automation.
6. Build and test Windows installer/portable packages.

## Licensing
Do not redistribute upstream Folia code or assets until applicable license and attribution requirements are verified.

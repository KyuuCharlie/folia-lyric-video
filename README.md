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
Initial scaffold. Actual rendering, Folia integration, and Windows packaging are not implemented yet.

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

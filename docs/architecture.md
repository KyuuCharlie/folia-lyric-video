# Architecture notes

## Product boundary

The desktop UI should not own rendering implementation details. It will submit a typed render job to a local renderer and observe progress/results. This keeps the same render contract reusable by a later HTTP API and webhook worker.

## Planned modules

- `apps/desktop` (current root UI): project editing, lyric timing, preview, export settings.
- `src-tauri`: native desktop shell, OS integration, safe filesystem access.
- `packages/render-core` (planned): normalized render-job schema, timeline math, validation, progress events.
- `services/render-worker` (planned): FFmpeg orchestration and output verification.
- `services/api` (planned, optional): REST endpoints and webhook delivery for automation.

## Render job contract (draft)

A render job should eventually include:
- project ID and schema version
- audio input reference
- timed lyric cues with start/end timestamps
- theme and animation parameters
- output size, frame rate, codec/container settings
- destination path and cancellation/progress metadata

The renderer must validate paths and durations, report actionable errors, and avoid blocking the UI thread.

## Decisions still to validate

1. Review Folia upstream source and license before reuse.
2. Determine whether Folia's preview can be reused directly or needs an adapter.
3. Choose frame generation strategy compatible with the selected animations.
4. Decide how FFmpeg binaries are bundled and how their licenses are surfaced.
5. Verify Windows installer and portable packaging on an actual Windows runner.

## Current limitation

The current UI is a visual scaffold. Audio selection and lyric text editing work in the browser shell, but playback, timeline timing, animation rendering, project persistence, and MP4 export are not implemented yet.

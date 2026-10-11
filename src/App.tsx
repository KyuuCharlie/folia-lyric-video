import { useEffect, useRef, useState } from "react";
import { AudioLines, Clapperboard, FileAudio, Layers3, Music2, Plus, Settings2, Subtitles, WandSparkles, Play, Pause, Download } from "lucide-react";

type Lyric = { id: number; time: string; text: string };
const starter: Lyric[] = [
  { id: 1, time: "00:04.20", text: "A little light across the night" },
  { id: 2, time: "00:08.10", text: "The words begin to move" },
  { id: 3, time: "00:12.60", text: "Every moment finds its place" },
  { id: 4, time: "00:17.00", text: "And every line comes through" },
];
const toSeconds = (time: string) => {
  const parts = time.trim().split(":").map(Number);
  if (parts.some((n) => !Number.isFinite(n) || n < 0)) return 0;
  return parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : parts.length === 2 ? parts[0] * 60 + parts[1] : 0;
};
const formatTime = (seconds: number) => {
  const safe = Math.max(0, seconds || 0);
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${(safe % 60).toFixed(2).padStart(5, "0")}`;
};

export default function App() {
  const [lyrics, setLyrics] = useState(starter);
  const [active, setActive] = useState(0);
  const [theme, setTheme] = useState("Soft Glow");
  const [filter, setFilter] = useState("Neon Bloom");
  const [fps, setFps] = useState(120);
  const [showSpectrum, setShowSpectrum] = useState(true);
  const [audioName, setAudioName] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [duration, setDuration] = useState(32);
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState("Ready");
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const frequencyDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const edit = (id: number, text: string) => setLyrics((all) => all.map((line) => line.id === id ? { ...line, text } : line));
  const editTime = (id: number, time: string) => setLyrics((all) => all.map((line) => line.id === id ? { ...line, time } : line));
  const orderedLyrics = [...lyrics].sort((a, b) => toSeconds(a.time) - toSeconds(b.time));
  const activeLyric = [...orderedLyrics].reverse().find((line) => toSeconds(line.time) <= currentTime && line.text.trim()) ?? orderedLyrics.find((line) => line.text.trim());
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const update = () => {
      setCurrentTime(audio.currentTime);
      const lines = [...lyrics].sort((a, b) => toSeconds(a.time) - toSeconds(b.time));
      const index = lines.reduce((found, line, i) => toSeconds(line.time) <= audio.currentTime ? i : found, 0);
      const selected = lyrics.findIndex((line) => line.id === lines[index]?.id);
      if (selected >= 0) setActive(selected);
    };
    const ended = () => setPlaying(false);
    audio.addEventListener("timeupdate", update);
    audio.addEventListener("ended", ended);
    return () => { audio.removeEventListener("timeupdate", update); audio.removeEventListener("ended", ended); };
  }, [lyrics, audioUrl]);
  useEffect(() => {
    if (!audioUrl) return;
    return () => URL.revokeObjectURL(audioUrl);
  }, [audioUrl]);
  const chooseAudio = (file?: File) => {
    if (!file) return;
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioName(file.name);
    setAudioUrl(URL.createObjectURL(file));
    setCurrentTime(0);
    setPlaying(false);
    setExportMessage("Audio loaded");
  };
  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) { setExportMessage("Import an audio file first"); return; }
    if (audio.paused) {
      try { await audio.play(); setPlaying(true); } catch { setExportMessage("Could not play this audio file"); }
    } else { audio.pause(); setPlaying(false); }
  };
  const drawFrame = (ctx: CanvasRenderingContext2D, time: number, width: number, height: number) => {
    const gradient = ctx.createRadialGradient(width * .52, height * .52, 10, width * .5, height * .5, width * .8);
    if (theme === "Minimal") {
      gradient.addColorStop(0, "#20202a"); gradient.addColorStop(1, "#08090d");
    } else if (theme === "Kinetic Type") {
      gradient.addColorStop(0, "#173a46"); gradient.addColorStop(1, "#090d18");
    } else {
      gradient.addColorStop(0, "#40315e"); gradient.addColorStop(.55, "#1a1727"); gradient.addColorStop(1, "#090a10");
    }
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, width, height);
    if (theme !== "Minimal") {
      for (let i = 0; i < 7; i++) {
        const x = width * (.12 + i * .13) + Math.sin(time * .45 + i) * 22;
        const y = height * (.18 + (i % 3) * .29) + Math.cos(time * .4 + i) * 18;
        ctx.beginPath(); ctx.arc(x, y, 45 + (i % 3) * 18, 0, Math.PI * 2);
        ctx.fillStyle = theme === "Kinetic Type" ? "rgba(95,190,205,.055)" : "rgba(184,157,255,.06)"; ctx.fill();
      }
    }
    const line = [...lyrics].sort((a, b) => toSeconds(a.time) - toSeconds(b.time)).reverse().find((item) => toSeconds(item.time) <= time && item.text.trim());
    const text = line?.text || "";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const fontSize = Math.min(68, Math.max(28, width * .047));
    ctx.font = `600 ${fontSize}px "Segoe UI", Arial, sans-serif`;
    ctx.shadowColor = theme === "Minimal" ? "transparent" : "rgba(185,165,255,.5)";
    ctx.shadowBlur = theme === "Minimal" ? 0 : 28;
    ctx.fillStyle = "#f5f1ff";
    const words = text.split(/\s+/); const rows: string[] = []; let row = "";
    for (const word of words) {
      const candidate = row ? row + " " + word : word;
      if (ctx.measureText(candidate).width > width * .82 && row) { rows.push(row); row = word; } else row = candidate;
    }
    if (row) rows.push(row);
    const lineHeight = fontSize * 1.28;
    rows.forEach((part, i) => ctx.fillText(part, width / 2, height / 2 + (i - (rows.length - 1) / 2) * lineHeight, width * .84));
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#b9a5ff"; ctx.fillRect(width * .47, height * .68, width * .06, 4);
    ctx.font = '500 16px "Segoe UI", Arial, sans-serif'; ctx.fillStyle = "rgba(225,220,245,.58)";
    ctx.fillText("LYRIC VIDEO", width / 2, height * .77);
  };
  const exportVideo = async () => {
    const audio = audioRef.current;
    const canvas = canvasRef.current;
    if (!audioUrl || !audio || !canvas) { setExportMessage("Import an audio file before exporting"); return; }
    if (!("MediaRecorder" in window) || !canvas.captureStream) { setExportMessage("Video recording is not supported by this browser"); return; }
    setExporting(true); setExportMessage("Preparing render…");
    try {
      audio.pause(); audio.currentTime = 0;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not create the video canvas");
      const width = 1920, height = 1080, targetFps = fps;
      canvas.width = width; canvas.height = height;
      drawFrame(ctx, 0, width, height);
      const videoStream = canvas.captureStream(targetFps);
      const AudioContextClass = window.AudioContext;
      const audioContext = audioContextRef.current ?? new AudioContextClass();
      audioContextRef.current = audioContext;
      if (!audioSourceRef.current) {
        audioSourceRef.current = audioContext.createMediaElementSource(audio);
        audioSourceRef.current.connect(audioContext.destination);
      }
      const audioDestination = audioContext.createMediaStreamDestination();
      audioSourceRef.current.connect(audioDestination);
      await audioContext.resume();
      const stream = new MediaStream([...videoStream.getVideoTracks(), ...audioDestination.stream.getAudioTracks()]);
      const preferred = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
      const mimeType = preferred.find((type) => MediaRecorder.isTypeSupported(type));
      if (!mimeType) throw new Error("This browser does not support WebM video export");
      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: targetFps >= 120 ? 24_000_000 : targetFps >= 60 ? 16_000_000 : 8_000_000 });
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      recorder.onerror = () => { setExporting(false); setExportMessage("Export failed during recording"); };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${audioName.replace(/\.[^.]+$/, "") || "lyric-video"}-${targetFps}fps.webm`;
        document.body.appendChild(link); link.click(); link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
        stream.getTracks().forEach((track) => track.stop());
        setExporting(false); setPlaying(false); setCurrentTime(audio.currentTime);
        setExportMessage(`Export complete · ${targetFps} FPS target · ${(blob.size / 1024 / 1024).toFixed(1)} MB WebM`);
      };
      audio.onended = () => { if (recorder.state !== "inactive") recorder.stop(); };
      recorder.start(250);
      const startAt = performance.now();
      let animation = 0;
      const render = () => {
        const time = audio.currentTime;
        drawFrame(ctx, time, width, height);
        setCurrentTime(time);
        setExportMessage(`Rendering · ${formatTime(time)} / ${formatTime(duration)}`);
        if (!audio.paused && recorder.state === "recording") animation = requestAnimationFrame(render);
      };
      await audio.play(); setPlaying(true); render();
      const stopOnError = () => { stopped = true; window.clearTimeout(animation); if (recorder.state !== "inactive") recorder.stop(); };
      audio.addEventListener("error", stopOnError, { once: true });
      // Safety stop in case the media element does not emit ended.
      const stopAfterDuration = () => {
        if (recorder.state === "inactive") return;
        if (performance.now() - startAt > (Number.isFinite(audio.duration) ? audio.duration : duration) * 1000 + 1500) {
          audio.pause(); recorder.stop(); return;
        }
        window.setTimeout(stopAfterDuration, 500);
      };
      window.setTimeout(stopAfterDuration, 500);
    } catch (error) {
      setExporting(false); setPlaying(false);
      setExportMessage(error instanceof Error ? error.message : "Export failed");
    }
  };
  return <main className="app"><header className="topbar"><div className="brand"><span className="brand-icon"><AudioLines size={20}/></span> folia <span className="light">studio</span><span className="tag">WINDOWS FIRST</span></div><div className="top-actions"><span className="local-dot"/> Local project <Settings2 size={17}/></div></header>
    <section className="heading"><div><p className="eyebrow">DESKTOP WORKSPACE</p><h1>Lyric video studio</h1><p className="sub">Shape the words. Set the rhythm. Export your video.</p></div><button className="export" onClick={exportVideo} disabled={exporting}><Clapperboard size={16}/>{exporting ? "Rendering…" : `Export ${fps} FPS`}</button></section>
    <audio ref={audioRef} src={audioUrl || undefined} onLoadedMetadata={(e) => setDuration(Number.isFinite(e.currentTarget.duration) ? e.currentTarget.duration : 32)} onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)} />
    <canvas ref={canvasRef} className="render-canvas" aria-hidden="true" />
    <section className="grid"><aside className="panel"><div className="panel-head"><span><Music2 size={15}/> PROJECT</span><span className="muted">LOCAL</span></div><div className="project"><div className="project-icon"><Music2 size={19}/></div><div><b>Untitled project</b><small>Local workspace</small></div></div><p className="label">MEDIA</p><label className="drop"><input type="file" accept="audio/*" onChange={e => chooseAudio(e.target.files?.[0])}/><FileAudio size={22}/><b>{audioName || "Import audio"}</b><small>{audioName ? "Loaded locally" : "MP3, WAV, FLAC and more"}</small><span>Browse files</span></label><p className="label">LYRICS <span>{lyrics.length} lines</span></p><div className="lyrics">{lyrics.map((line,i)=><button key={line.id} onClick={()=>{setActive(i);const audio=audioRef.current;if(audio){audio.currentTime=toSeconds(line.time);setCurrentTime(audio.currentTime)}}} className={active===i?"lyric selected":"lyric"}><small>{line.time}</small><span>{line.text || "Empty line"}</span></button>)}</div><button className="add" onClick={()=>setLyrics(all=>[...all,{id:Math.max(0,...all.map(x=>x.id))+1,time:formatTime(currentTime),text:""}])}><Plus size={14}/> Add lyric line</button></aside>
    <section className="center"><div className="panel preview"><div className="panel-head"><span><Clapperboard size={15}/> PREVIEW</span><span className="muted">16:9 · 1920 × 1080 · {fps} FPS target</span></div><div className="stage"><div className="glow glow-a"/><div className="glow glow-b"/><div className="stage-content"><small>NOW PLAYING · PREVIEW</small><h2>{activeLyric?.text || lyrics[active]?.text || "Your lyric appears here"}</h2><i/><p>LYRIC VIDEO / {theme.toUpperCase()}</p></div></div><div className="transport"><button className="transport-play" onClick={togglePlayback} aria-label={playing?"Pause":"Play"}>{playing?<Pause size={14}/>:<Play size={14}/>}</button><span>{formatTime(currentTime)}</span><input aria-label="Seek audio" type="range" min={0} max={duration || 32} step={0.05} value={Math.min(currentTime,duration||32)} onChange={e=>{const value=Number(e.target.value);if(audioRef.current)audioRef.current.currentTime=value;setCurrentTime(value)}}/><span>{formatTime(duration)}</span></div></div><div className="panel timeline"><div className="panel-head"><span><Layers3 size={15}/> TIMELINE</span><span className="muted">Synced to audio</span></div><div className="ruler"><span>00:00</span><span>{formatTime(duration*.25)}</span><span>{formatTime(duration*.5)}</span><span>{formatTime(duration*.75)}</span><span>{formatTime(duration)}</span></div><div className="track"><span><AudioLines size={12}/> AUDIO</span><div className="wave">{Array.from({length:70},(_,i)=><i key={i} style={{height:`${18+((i*17+11)%72)}%`}}/>)}</div></div><div className="track"><span><Subtitles size={12}/> TEXT</span><div className="clips">{lyrics.map((line,i)=><button key={line.id} className={active===i?"clip active":`clip clip-${i%3}`} onClick={()=>{setActive(i);if(audioRef.current)audioRef.current.currentTime=toSeconds(line.time)}}>{line.text||"Lyric"}</button>)}</div></div></div></section>
    <aside className="panel inspector"><div className="panel-head"><span><WandSparkles size={15}/> INSPECTOR</span></div><section><p className="label">ANIMATION THEME</p><div className="theme"><div className="theme-art"><i/><i/><i/></div><div><b>{theme}</b><small>Rendered typography</small></div></div><div className="options">{["Soft Glow","Kinetic Type","Minimal"].map(t=><button key={t} className={theme===t?"option chosen":"option"} onClick={()=>setTheme(t)}>{t}</button>)}</div></section><section><p className="label">LIVE VISUALS</p><label className="field">Filter preset<select value={filter} onChange={e=>setFilter(e.target.value)}><option>Neon Bloom</option><option>Chromatic</option><option>Scanlines</option><option>VHS</option><option>Clean</option></select></label><label className="spectrum-toggle"><input type="checkbox" checked={showSpectrum} onChange={e=>setShowSpectrum(e.target.checked)}/> Audio-reactive FFT spectrum</label><p className="hint">FFT analyzes bass and mid/high frequencies to drive spectrum bars and glow intensity.</p><p className="label">SELECTED LYRIC</p><label className="field">Text<textarea rows={3} value={lyrics[active]?.text??""} onChange={e=>lyrics[active]&&edit(lyrics[active].id,e.target.value)}/></label><label className="field">Start time (MM:SS.xx)<input value={lyrics[active]?.time??""} onChange={e=>lyrics[active]&&editTime(lyrics[active].id,e.target.value)} placeholder="00:04.20"/></label><p className="hint">Each lyric appears at its start time and remains until the next line. Export records the full audio duration.</p></section><section><p className="label">EXPORT SETTINGS</p><div className="setting"><span>Aspect ratio</span><b>16:9</b></div><div className="setting"><span>Resolution</span><b>1920 × 1080</b></div><div className="setting"><span>Frame rate</span><b>30 FPS</b></div><div className="setting"><span>Output</span><b>WebM · VP9/VP8</b></div><p className="hint export-status">{exportMessage}</p><button className="download-action" onClick={exportVideo} disabled={exporting||!audioUrl}><Download size={14}/>{exporting?"Rendering video…":"Render and save video"}</button></section><div className="foot"><WandSparkles size={14}/> Local rendering · no upload</div></aside></section><footer><span><i/> {exporting?"Rendering": "Ready"}</span><span>{audioName || "No audio imported"}</span><span>{exportMessage}</span></footer></main>;
}

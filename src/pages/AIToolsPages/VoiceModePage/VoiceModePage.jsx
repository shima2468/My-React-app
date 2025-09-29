import React, { useEffect, useRef, useState } from "react";
import {
  FileText,
  Mic,
  Play,
  Pause,
  Download,
  RefreshCw,
  Volume2,
  VolumeX,
  Maximize2,
  CheckCircle2,
} from "lucide-react";
import {
  IconButton,
  ToolPanel,
  LoadingOverlay,
  ToolSidebar,
} from "@/Components";

const MATERIALS = [
  { id: "psy", name: "Introduction to Psychology.pdf", size: "2.4 MB" },
  { id: "bio", name: "Biology Chapter 5 Notes.docx", size: "1.1 MB" },
];

const SUMMARY_OPTIONS = [
  { id: "brief", title: "Brief Summary", desc: "Concise overview of main points" },
  { id: "detailed", title: "Detailed Summary", desc: "Comprehensive with sections" },
  { id: "bullets", title: "Bullet Points", desc: "Key ideas as bullets" },
];

const VOICES = [
  { id: "assistant-female", title: "Assistant • Female", desc: "Warm & clear" },
  { id: "assistant-male", title: "Assistant • Male", desc: "Calm & neutral" },
  { id: "news", title: "News Anchor", desc: "Crisp & formal" },
];

export default function VoiceModePage() {
  const [material, setMaterial] = useState(MATERIALS[0]);
  const [summaryType, setSummaryType] = useState("brief");
  const [voiceId, setVoiceId] = useState("assistant-female");
  const [lang, setLang] = useState("en-US");
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [includeIntro, setIncludeIntro] = useState(true);
  const [includeOutro, setIncludeOutro] = useState(false);
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef(null);
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    function loadVoices() {
      const list = window.speechSynthesis?.getVoices?.() || [];
      setVoices(list);
    }
    loadVoices();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  function resolveVoice(voiceChoice, langCode) {
    if (!voices.length) return null;
    const byLang = voices.filter((v) => {
      const L = (v.lang || "").toLowerCase();
      const target = langCode.toLowerCase();
      return L === target || L.startsWith(target.split("-")[0]);
    });
    const known = {
      en: {
        female: ["Google UK English Female","Google US English","Samantha","Victoria","Karen","Zira","Jenny","Aria","Olivia"],
        male: ["Google UK English Male","Daniel","David","Brian","Mark","Guy","Christopher"],
        news: ["News","Announcer","Narrator","Read","Broadcast"]
      },
      ar: {
        female: ["Mariam","Hoda","Zeina","Salma","Laila","Google العربية"],
        male: ["Tarik","Omar","Google العربية"],
        news: ["News","Announcer","Narrator"]
      }
    };
    const bucket = langCode.startsWith("ar") ? known.ar : known.en;
    const tryNames = (names) => byLang.find((v) => names.some((n) => v.name.toLowerCase().includes(n.toLowerCase())));
    if (voiceChoice === "assistant-female") {
      return tryNames(bucket.female) || byLang.find((v) => /female|woman|girl/i.test(v.name)) || byLang[0] || voices[0];
    }
    if (voiceChoice === "assistant-male") {
      return tryNames(bucket.male) || byLang.find((v) => /male|man|boy|david|daniel|brian|mark|guy/i.test(v.name)) || byLang[0] || voices[0];
    }
    return tryNames(bucket.news) || byLang[0] || voices[0];
  }

  async function fetchSummary(materialId, type, lang) {
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materialId, type, lang }),
      });
      if (res.ok) {
        const { summary } = await res.json();
        return summary;
      }
    } catch (_) {}
    const isAR = String(lang).startsWith("ar");
    if (type === "bullets") {
      return isAR
        ? ["• التعريف والنطاق.","• النظريات الرئيسية وروّادها.","• التطبيقات العملية والأمثلة.","• الأخطاء الشائعة وسوء الفهم.","• خلاصة سريعة ونصائح للمذاكرة."].join("\n")
        : ["• Key definitions and scope.","• Main theories and authors.","• Practical applications and examples.","• Common pitfalls and misconceptions.","• Quick recap & study tips."].join("\n");
    }
    if (type === "detailed") {
      return isAR
        ? `المقدمة:
- نظرة عامة وأهم المصطلحات.

الأقسام:
1) الأفكار الأساسية — تعريفات، أطر، أمثلة.
2) الأدلة — دراسات، أرقام، حدود.
3) التطبيقات — استخدامات عملية ونصائح.

الخاتمة:
- أهم الخلاصات ونصائح المذاكرة.`
        : `Introduction:
- Overview and terminology.

Sections:
1) Core Ideas — definitions, frameworks, examples.
2) Evidence — studies, data points, limitations.
3) Applications — practical use cases, tips.

Conclusion:
- Takeaways & study advice.`;
    }
    return isAR
      ? "نظرة موجزة تبرز المفاهيم الأساسية والتعاريف المهمة مع أمثلة عملية يسهل تذكّرها."
      : "Concise overview highlighting core concepts, important definitions, and practical examples to remember.";
  }

  async function synthesizeTTS(text) {
    setAudioUrl(null);
    try {
      const r = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: voiceId, lang, rate, pitch }),
      });
      if (r.ok) {
        const { audioUrl } = await r.json();
        if (audioUrl) {
          setAudioUrl(audioUrl);
          return;
        }
      }
    } catch (_) {}
    if ("speechSynthesis" in window) {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = lang;
      utter.rate = rate;
      utter.pitch = pitch;
      const v = resolveVoice(voiceId, lang);
      if (v) utter.voice = v;
      utter.onend = () => setPlaying(false);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
      setPlaying(true);
    }
  }

  const runGenerate = async () => {
    if (!material) return;
    setLoading(true);
    setPlaying(false);
    const base = await fetchSummary(material.id, summaryType, lang);
    const isAR = lang.startsWith("ar");
    const intro = includeIntro ? (isAR ? `ملخص صوتي سريع للملف "${material.name}". ` : `Quick audio summary for "${material.name}". `) : "";
    const outro = includeOutro ? (isAR ? `\nكان هذا ملخصك الصوتي. بالتوفيق!` : `\nThat was your audio summary. Good luck!`) : "";
    const text = intro + base + outro;
    setTranscript(text);
    await synthesizeTTS(text);
    setLoading(false);
  };

  const playAudio = () => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play();
      setPlaying(true);
    } else if (transcript) {
      synthesizeTTS(transcript);
    }
  };
  const pauseAudio = () => {
    if (audioUrl && audioRef.current) {
      audioRef.current.pause();
    } else if ("speechSynthesis" in window) {
      window.speechSynthesis.pause();
    }
    setPlaying(false);
  };
  const resetAll = () => {
    setAudioUrl(null);
    setTranscript("");
    setPlaying(false);
  };
  const downloadAudio = () => {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `${material?.id || "summary"}.mp3`;
    a.click();
  };
  const previewVoice = () => {
    const sample = lang.startsWith("ar") ? "هذه معاينة للصوت المختار." : "This is a preview of the selected voice.";
    synthesizeTTS(sample);
  };

  const countsNote = `Voice: ${voiceId.replace("-", " ")} • ${lang} • Rate ${rate.toFixed(1)} • Pitch ${pitch.toFixed(1)}`;
  const canGenerate = !!material && !loading;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
      <div className="space-y-4">
        <ToolSidebar
          loading={loading}
          onGenerate={runGenerate}
          generateLabel="Generate Voice Summary"
          materials={MATERIALS.map((m) => ({ ...m, icon: FileText }))}
          selectedMaterialId={material.id}
          onSelectMaterial={(id) => setMaterial(MATERIALS.find((m) => m.id === id))}
          layouts={SUMMARY_OPTIONS}
          selectedLayoutId={summaryType}
          onSelectLayout={setSummaryType}
          filters={VOICES}
          selectedFilterId={voiceId}
          onSelectFilter={setVoiceId}
          countsNote={countsNote}
          showUnapplied={false}
          generateDisabled={!canGenerate}
        />
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h4 className="font-semibold text-sm text-slate-900">Voice Settings</h4>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <label className="col-span-2">
              <span className="text-slate-600">Language</span>
              <select
                className="mt-1 w-full rounded-md border border-slate-300 p-2"
                value={lang}
                onChange={(e) => {
                  setLang(e.target.value);
                  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
                }}
              >
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="ar-SA">Arabic</option>
              </select>
            </label>
            <label>
              <span className="text-slate-600">Rate: {rate.toFixed(1)}</span>
              <input
                type="range"
                min="0.6"
                max="1.8"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value))}
                className="mt-1 w-full"
              />
            </label>
            <label>
              <span className="text-slate-600">Pitch: {pitch.toFixed(1)}</span>
              <input
                type="range"
                min="0.6"
                max="1.6"
                step="0.1"
                value={pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value))}
                className="mt-1 w-full"
              />
            </label>
            <div className="col-span-2">
              <button
                onClick={previewVoice}
                className="mt-1 inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-50"
              >
                <Mic className="h-3.5 w-3.5" /> Preview voice
              </button>
            </div>
            <label className="col-span-2 flex items-center gap-2 mt-1">
              <input
                type="checkbox"
                checked={includeIntro}
                onChange={(e) => setIncludeIntro(e.target.checked)}
              />
              <span className="text-slate-700">Include short intro</span>
            </label>
            <label className="col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeOutro}
                onChange={(e) => setIncludeOutro(e.target.checked)}
              />
              <span className="text-slate-700">Include short outro</span>
            </label>
            <div className="col-span-2 mt-1 flex items-center gap-2 text-xs text-slate-500">
              <CheckCircle2 className="h-4 w-4" />
              Different voices depend on your OS/Browser. For guaranteed distinct voices, wire an external TTS API.
            </div>
          </div>
        </div>
      </div>
      <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <ToolPanel
          title="Voice Mode"
          subtitle="Auto-generate an audio summary of the selected material"
          actions={
            transcript && (
              <>
                {!playing ? (
                  <IconButton title="Play" onClick={playAudio} disabled={loading}>
                    <Play className="h-4 w-4" />
                  </IconButton>
                ) : (
                  <IconButton title="Pause" onClick={pauseAudio} disabled={loading}>
                    <Pause className="h-4 w-4" />
                  </IconButton>
                )}
                <IconButton
                  title={muted ? "Unmute" : "Mute"}
                  onClick={() => {
                    setMuted((m) => !m);
                    if (audioRef.current) audioRef.current.muted = !audioRef.current.muted;
                  }}
                >
                  {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </IconButton>
                <IconButton title="Reset" onClick={resetAll} disabled={loading}>
                  <RefreshCw className="h-4 w-4" />
                </IconButton>
                <IconButton title="Fullscreen" onClick={() => {}}>
                  <Maximize2 className="h-4 w-4" />
                </IconButton>
                <IconButton title="Download (via API)" onClick={downloadAudio} disabled={!audioUrl}>
                  <Download className="h-4 w-4" />
                </IconButton>
              </>
            )
          }
        >
          <div className="relative min-h-[380px] p-6">
            <LoadingOverlay show={loading} text="Generating audio summary…" />
            {!transcript && !loading && (
              <div className="h-[320px] grid place-items-center text-center text-slate-500">
                <div>
                  <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-lg border border-dashed border-slate-300">
                    <Mic className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium">Ready to Generate</p>
                  <p className="mt-0.5 text-xs">
                    Choose a material and summary type, then click “Generate Voice Summary”
                  </p>
                </div>
              </div>
            )}
            {transcript && !loading && (
              <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
                <div
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  dir={lang.startsWith("ar") ? "rtl" : "ltr"}
                >
                  <h5 className="text-sm font-semibold text-slate-800">Transcript</h5>
                  <pre className={`mt-2 whitespace-pre-wrap text-sm text-slate-700 ${lang.startsWith("ar") ? "text-right" : ""}`}>
                    {transcript}
                  </pre>
                </div>
                <div className="rounded-xl border border-slate-200 p-4">
                  <h5 className="text-sm font-semibold text-slate-800">Audio</h5>
                  {audioUrl ? (
                    <audio
                      ref={audioRef}
                      src={audioUrl}
                      controls
                      className="mt-2 w-full"
                      onPlay={() => setPlaying(true)}
                      onPause={() => setPlaying(false)}
                      onEnded={() => setPlaying(false)}
                      muted={muted}
                    />
                  ) : (
                    <div className="mt-2 text-xs text-slate-500">
                      Playing via Web Speech API (no downloadable file). To enable downloads, wire <code>/api/tts</code> to return an <code>audioUrl</code>.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </ToolPanel>
      </section>
    </div>
  );
}

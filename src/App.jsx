import { useState, useEffect, useRef } from "react";
import { Copy, Check, RotateCcw, Save, Clock, X, Mic, MicOff, Moon, Sun, ChevronDown, ChevronUp, Wand2 } from "lucide-react";

const defaultLabs = { wbc: "", ne: "", hgb: "", plt: "", crp: "", ph: "", pco2: "", hco3: "", na: "140", k: "3.8", glu: "", urea: "", creat: "" };
const defaultState = {
  name: "", age: "", mrn: "", room: "", dx: "", ftNsvd: "FT, NSVD, NO NICU ADMISSION",
  hxLines: ["", "", "", ""], labs: defaultLabs, extraLabs: [],
  imagingLines: [], showImaging: false, currentMeds: [], erLevel: "", plan: "",
  general: "PT LOOKS WELL , WELL HYDRATED AND PERFUSED , HD STABLE, NOT IN DISTRESS , ON RA",
  chest: "EBAE, NO ADDED SOUNDS", abd: "SOFT AND LAX NO HEPATOSPLENOMEGALY", cvs: "S1+S2+0"
};

const up = (v) => v.toUpperCase();

const LabInput = ({ k, label, placeholder, labs, setLabs, dark }) => (
  <div className="flex flex-col gap-1">
    <label className={`text-xs font-semibold uppercase tracking-wide ${dark ? "text-gray-400" : "text-gray-500"}`}>{label}</label>
    <input
      className={`w-16 border rounded px-2 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400 ${dark ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500" : "border-gray-300 bg-white"}`}
      placeholder={placeholder || ""}
      value={labs[k]}
      onChange={e => setLabs(p => ({ ...p, [k]: up(e.target.value) }))}
    />
  </div>
);

const Section = ({ title, icon, children, dark, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`rounded-xl border shadow-sm overflow-hidden ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
      <button onClick={() => setOpen(p => !p)}
        className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${dark ? "hover:bg-gray-700" : "hover:bg-gray-50"}`}>
        <span className={`font-bold text-sm uppercase tracking-wide ${dark ? "text-gray-300" : "text-gray-700"}`}>{icon} {title}</span>
        {open ? <ChevronUp className={`w-4 h-4 ${dark ? "text-gray-500" : "text-gray-400"}`} /> : <ChevronDown className={`w-4 h-4 ${dark ? "text-gray-500" : "text-gray-400"}`} />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
};

export default function App() {
  const [tab, setTab] = useState("isbar");
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem("darkMode") === "true");
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem("noteHistory") || "[]"));
  const [savedPatients, setSavedPatients] = useState(() => JSON.parse(localStorage.getItem("savedPatients") || "[]"));
  const [saveLabel, setSaveLabel] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [s, setS] = useState({ ...defaultState });
  const set = (key) => (val) => setS(p => ({ ...p, [key]: val }));
  const D = dark;

  // Smart Dictation
  const [dictating, setDictating] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [showTranscript, setShowTranscript] = useState(false);
  const [processing, setProcessing] = useState(false);
  const dictationRef = useRef(null);
  const finalRef = useRef("");

  useEffect(() => { localStorage.setItem("darkMode", dark); }, [dark]);

  const startDictation = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert("Voice input not supported. Please use Chrome.");
    if (dictationRef.current) dictationRef.current.stop();
    finalRef.current = "";
    setTranscript("");
    setShowTranscript(false);
    const r = new SR();
    r.lang = "en-US";
    r.continuous = true;
    r.interimResults = true;
    r.onresult = e => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalRef.current += e.results[i][0].transcript + " ";
        else interim = e.results[i][0].transcript;
      }
      setTranscript((finalRef.current + interim).trim());
    };
    r.onend = () => {
      setDictating(false);
      if (finalRef.current.trim()) {
        setTranscript(finalRef.current.trim());
        setShowTranscript(true);
      }
    };
    r.onerror = () => setDictating(false);
    dictationRef.current = r;
    r.start();
    setDictating(true);
  };

  const stopDictation = () => {
    dictationRef.current?.stop();
    setDictating(false);
  };

  const processTranscript = async () => {
    if (!transcript.trim()) return;
    setProcessing(true);
    try {
      const prompt = `You are a medical note assistant for a pediatrics/neonatology junior doctor.
Extract information from the following voice transcript and return ONLY a valid JSON object with these exact keys.
If a value is not mentioned, use an empty string for text fields.
Always convert all text values to UPPERCASE.

Keys to extract:
- name: patient name (e.g. "BABY OF SARA")
- age: patient age (e.g. "3 DAYS", "2 MONTHS")
- mrn: MRN number as string
- room: room number as string
- dx: diagnosis
- ftNsvd: birth info, default "FT, NSVD, NO NICU ADMISSION" if not mentioned
- hxLines: array of history points as strings, max 6 items
- erLevel: what was done at ER level, empty string if not mentioned
- plan: management plan, empty string if not mentioned
- general: general exam finding, default "PT LOOKS WELL , WELL HYDRATED AND PERFUSED , HD STABLE, NOT IN DISTRESS , ON RA" if not mentioned
- chest: chest exam, default "EBAE, NO ADDED SOUNDS" if not mentioned
- abd: abdomen exam, default "SOFT AND LAX NO HEPATOSPLENOMEGALY" if not mentioned
- cvs: CVS exam, default "S1+S2+0" if not mentioned
- currentMeds: array of medication/IVF strings, empty array if none
- imagingLines: array of imaging result strings, empty array if none
- showImaging: boolean true only if imaging results mentioned
- labs: object with keys wbc, ne, hgb, plt, crp, ph (decimal part after 7. only), pco2, hco3, na, k, glu, urea, creat — all as strings, empty string if not mentioned, na defaults to "140", k defaults to "3.8"
- extraLabs: array of {name, value} objects for any labs not in the standard list above

Transcript: "${transcript}"

Return ONLY the raw JSON object. No explanation, no markdown, no code blocks, no extra text.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });

      const data = await response.json();
      const text = data.content[0].text.trim();
      const clean = text.replace(/```json|```/g, "").trim();
      const e = JSON.parse(clean);

      setS(prev => ({
        ...prev,
        name:        e.name        || prev.name,
        age:         e.age         || prev.age,
        mrn:         e.mrn         || prev.mrn,
        room:        e.room        || prev.room,
        dx:          e.dx          || prev.dx,
        ftNsvd:      e.ftNsvd      || prev.ftNsvd,
        hxLines:     e.hxLines?.length     ? e.hxLines     : prev.hxLines,
        erLevel:     e.erLevel     || prev.erLevel,
        plan:        e.plan        || prev.plan,
        general:     e.general     || prev.general,
        chest:       e.chest       || prev.chest,
        abd:         e.abd         || prev.abd,
        cvs:         e.cvs         || prev.cvs,
        currentMeds: e.currentMeds?.length ? e.currentMeds : prev.currentMeds,
        imagingLines:e.imagingLines?.length? e.imagingLines: prev.imagingLines,
        showImaging: e.showImaging || prev.showImaging,
        extraLabs:   e.extraLabs?.length   ? e.extraLabs   : prev.extraLabs,
        labs: {
          wbc:   e.labs?.wbc   || prev.labs.wbc,
          ne:    e.labs?.ne    || prev.labs.ne,
          hgb:   e.labs?.hgb   || prev.labs.hgb,
          plt:   e.labs?.plt   || prev.labs.plt,
          crp:   e.labs?.crp   || prev.labs.crp,
          ph:    e.labs?.ph    || prev.labs.ph,
          pco2:  e.labs?.pco2  || prev.labs.pco2,
          hco3:  e.labs?.hco3  || prev.labs.hco3,
          na:    e.labs?.na    || prev.labs.na,
          k:     e.labs?.k     || prev.labs.k,
          glu:   e.labs?.glu   || prev.labs.glu,
          urea:  e.labs?.urea  || prev.labs.urea,
          creat: e.labs?.creat || prev.labs.creat,
        }
      }));

      setShowTranscript(false);
      setTranscript("");
    } catch (err) {
      alert("Could not process transcript. Please try again.");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const LabI = (props) => <LabInput {...props} labs={s.labs} setLabs={set("labs")} dark={D} />;

  const inp     = `w-full border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${D ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500" : "border-gray-300 bg-white"}`;
  const inpMono = `w-full border rounded px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400 ${D ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500" : "border-gray-300 bg-white"}`;
  const lbl     = `text-xs font-semibold uppercase tracking-wide mb-1 block ${D ? "text-gray-400" : "text-gray-500"}`;
  const dash    = `font-mono text-sm flex-shrink-0 ${D ? "text-gray-500" : "text-gray-400"}`;
  const subhead = `text-xs mb-2 font-semibold uppercase ${D ? "text-gray-500" : "text-gray-400"}`;

  const buildNote = () => {
    const { name, age, mrn, room, dx, ftNsvd, hxLines, labs, extraLabs, imagingLines, showImaging, currentMeds, erLevel, plan, general, chest, abd, cvs } = s;
    const examBlock    = `O/E :\n${general}\nCHEST : ${chest}\nABD : ${abd}\nCVS : ${cvs}`;
    const extraLabsBlock = extraLabs.filter(l => l.name || l.value).map(l => `- ${l.name}: ${l.value}`).join("\n");
    const labBlock     = `LABS:\n- CBC: WBC ${labs.wbc} | NE ${labs.ne} | HGB ${labs.hgb} | PLT ${labs.plt}\n- CRP: ${labs.crp} MG/L\n- VBG: PH 7.${labs.ph} | PCO2 ${labs.pco2} | HCO3 ${labs.hco3} |\n- U/E: NA ${labs.na} | K ${labs.k} | GLU ${labs.glu} | UREA ${labs.urea} | CREAT ${labs.creat} |${extraLabsBlock ? "\n" + extraLabsBlock : ""}`;
    const imagingBlock = showImaging && imagingLines.some(l => l.trim()) ? `* IMAGING:\n${imagingLines.filter(l => l.trim()).map(l => `- ${l}`).join("\n")}` : "";
    const medsBlock    = currentMeds.filter(m => m.trim()).length > 0 ? `* CURRENTLY ON :\n${currentMeds.filter(m => m.trim()).map(m => `- ${m}`).join("\n")}` : "";
    const hxBlock      = hxLines.map(l => `- ${l}`).join("\n");
    const erBlock      = erLevel.trim() ? `AT ER LEVEL :\n${erLevel}\n------------------------------------------------------------\n` : "";

    if (tab === "progress") {
      return `------------------------------------------------------------\nTHIS IS , ${ftNsvd.trim() ? ftNsvd : ""}\n* PRESENTED TO ER WITH HX OF :\n${hxBlock}\n------------------------------------------------------------\n${erBlock}* ${examBlock}\n\n* ${labBlock}\n\n${imagingBlock ? imagingBlock + "\n\n" : ""}${medsBlock ? medsBlock + "\n\n" : ""}* ASSESSMENT:\n${age} OLD. ADMITTED AS A CASE OF ${dx}, HD STABLE, ON RA.\n\n* PLAN:\n${plan.trim() ? plan : "SEE ORDER SHEET"}`;
    }
    return `* IDENTIFICATION:\n${name} , ${age} OLD.\nMRN#${mrn}, ROOM#${room}\n\n* SITUATION:\n${name} ${age} OLD. ADMITTED AS A CASE OF ${dx}, HD STABLE, ON RA.\n\n* BACKGROUND:\n PRESENTED TO ER WITH HX OF :\n${hxBlock}\n------------------------------------------------------------\n${erBlock}* ${examBlock}\n\n* ${labBlock}\n\n${imagingBlock ? imagingBlock + "\n" : ""}${medsBlock ? medsBlock + "\n" : ""}------------------------------------------------------------\n* ASSESSMENT:\n${name} ${age} OLD. ADMITTED AS A CASE OF ${dx}, HD STABLE, ON RA.\n\nR-RECOMMENDATION :\n${plan.trim() ? plan : "SEE ORDER SHEET"}`;
  };

  const output = buildNote();

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    const entry = { id: Date.now(), type: tab.toUpperCase(), label: s.name || s.dx || "Unnamed", note: output, time: new Date().toLocaleString() };
    const updated = [entry, ...history].slice(0, 10);
    setHistory(updated);
    localStorage.setItem("noteHistory", JSON.stringify(updated));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => { if (confirm("Reset all fields?")) setS({ ...defaultState, labs: { ...defaultLabs } }); };

  const savePatient = () => {
    if (!saveLabel.trim()) return;
    const entry = { id: Date.now(), label: saveLabel, tab, state: s };
    const updated = [entry, ...savedPatients];
    setSavedPatients(updated);
    localStorage.setItem("savedPatients", JSON.stringify(updated));
    setSaveLabel(""); setShowSaveInput(false);
  };

  const loadPatient  = (entry) => { setS(entry.state); setTab(entry.tab); setShowSaved(false); };
  const deletePatient = (id) => { const u = savedPatients.filter(p => p.id !== id); setSavedPatients(u); localStorage.setItem("savedPatients", JSON.stringify(u)); };
  const deleteHistory = (id) => { const u = history.filter(h => h.id !== id); setHistory(u); localStorage.setItem("noteHistory", JSON.stringify(u)); };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${D ? "bg-gray-900" : "bg-gray-100"}`}>

      {/* Top Nav */}
      <div className={`sticky top-0 z-50 px-4 py-3 flex items-center justify-between shadow-md ${D ? "bg-gray-800 border-b border-gray-700" : "bg-white border-b border-gray-200"}`}>
        <h1 className={`text-base font-bold ${D ? "text-white" : "text-gray-800"}`}>📋 Note Generator</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setDark(p => !p)} className={`p-2 rounded-lg ${D ? "text-yellow-400 bg-gray-700" : "text-gray-500 bg-gray-100"}`}>
            {D ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button onClick={() => { setShowSaved(p => !p); setShowHistory(false); }} className={`p-2 rounded-lg ${showSaved ? "bg-blue-600 text-white" : D ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"}`}>
            <Save className="w-4 h-4" />
          </button>
          <button onClick={() => { setShowHistory(p => !p); setShowSaved(false); }} className={`p-2 rounded-lg ${showHistory ? "bg-blue-600 text-white" : D ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"}`}>
            <Clock className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 py-4 pb-32">

        {/* History Panel */}
        {showHistory && (
          <div className={`rounded-xl border shadow-sm p-4 mb-4 ${D ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
            <div className="flex justify-between items-center mb-3">
              <h2 className={`font-bold text-sm uppercase tracking-wide ${D ? "text-gray-300" : "text-gray-700"}`}>📜 History (Last 10)</h2>
              <button onClick={() => setShowHistory(false)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            {history.length === 0 ? <p className={`text-xs italic ${D ? "text-gray-500" : "text-gray-400"}`}>No notes yet.</p> :
              <div className="space-y-2">
                {history.map(h => (
                  <div key={h.id} className={`flex items-start justify-between border rounded-lg p-3 gap-2 ${D ? "border-gray-700" : "border-gray-100"}`}>
                    <div className="min-w-0">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full mr-2 ${h.type === "ISBAR" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"}`}>{h.type}</span>
                      <span className={`text-sm font-medium ${D ? "text-gray-300" : "text-gray-700"}`}>{h.label}</span>
                      <p className={`text-xs mt-0.5 ${D ? "text-gray-500" : "text-gray-400"}`}>{h.time}</p>
                    </div>
                    <div className="flex gap-2 items-center flex-shrink-0">
                      <button onClick={() => navigator.clipboard.writeText(h.note)} className="text-xs text-blue-500 hover:underline">Copy</button>
                      <button onClick={() => deleteHistory(h.id)}><X className="w-3.5 h-3.5 text-red-400" /></button>
                    </div>
                  </div>
                ))}
              </div>
            }
          </div>
        )}

        {/* Saved Patients Panel */}
        {showSaved && (
          <div className={`rounded-xl border shadow-sm p-4 mb-4 ${D ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
            <div className="flex justify-between items-center mb-3">
              <h2 className={`font-bold text-sm uppercase tracking-wide ${D ? "text-gray-300" : "text-gray-700"}`}>💾 Saved ({savedPatients.length})</h2>
              <button onClick={() => setShowSaved(false)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            {savedPatients.length === 0 ? <p className={`text-xs italic ${D ? "text-gray-500" : "text-gray-400"}`}>No saved patients yet.</p> :
              <div className="space-y-2">
                {savedPatients.map(p => (
                  <div key={p.id} className={`flex items-center justify-between border rounded-lg p-3 ${D ? "border-gray-700" : "border-gray-100"}`}>
                    <div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full mr-2 ${p.tab === "isbar" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"}`}>{p.tab.toUpperCase()}</span>
                      <span className={`text-sm font-medium ${D ? "text-gray-300" : "text-gray-700"}`}>{p.label}</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <button onClick={() => loadPatient(p)} className="text-xs text-blue-500 font-semibold hover:underline">Load</button>
                      <button onClick={() => deletePatient(p.id)}><X className="w-3.5 h-3.5 text-red-400" /></button>
                    </div>
                  </div>
                ))}
              </div>
            }
          </div>
        )}

        {/* Note Type Tabs */}
        <div className={`flex rounded-xl p-1 mb-4 ${D ? "bg-gray-800" : "bg-white shadow-sm border border-gray-200"}`}>
          {[["isbar", "ISBAR Note"], ["progress", "Progress Note"]].map(([v, l]) => (
            <button key={v} onClick={() => setTab(v)}
              className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all ${tab === v ? "bg-blue-600 text-white shadow" : D ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}>
              {l}
            </button>
          ))}
        </div>

        {/* ===== SMART DICTATION ===== */}
        <div className={`rounded-xl border shadow-sm p-4 mb-4 ${D ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className={`font-bold text-sm uppercase tracking-wide ${D ? "text-gray-300" : "text-gray-700"}`}>🎙️ Smart Dictation</h2>
              <p className={`text-xs mt-0.5 ${D ? "text-gray-500" : "text-gray-400"}`}>Speak full patient info — AI fills all fields automatically</p>
            </div>
            <button
              onClick={dictating ? stopDictation : startDictation}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm ${dictating ? "bg-red-500 hover:bg-red-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}>
              {dictating
                ? <><MicOff className="w-4 h-4" /> Stop</>
                : <><Mic className="w-4 h-4" /> Dictate</>}
            </button>
          </div>

          {/* Live transcript */}
          {dictating && (
            <div className={`mt-3 p-3 rounded-lg border text-xs font-mono min-h-12 ${D ? "bg-gray-700 border-gray-600 text-green-400" : "bg-gray-50 border-gray-200 text-gray-600"}`}>
              <span className="text-red-400 font-bold mr-2 animate-pulse">● REC</span>
              {transcript || <span className="opacity-50">Listening...</span>}
            </div>
          )}

          {/* Transcript review */}
          {showTranscript && !dictating && (
            <div className="mt-3">
              <p className={`text-xs font-semibold mb-2 ${D ? "text-gray-400" : "text-gray-500"}`}>REVIEW TRANSCRIPT — Edit if needed, then confirm:</p>
              <textarea
                className={`w-full border rounded-lg px-3 py-2 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 ${D ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-200 text-gray-700"}`}
                rows={4}
                value={transcript}
                onChange={e => setTranscript(e.target.value)}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={processTranscript}
                  disabled={processing}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2.5 rounded-xl font-semibold text-sm transition-all">
                  {processing
                    ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Filling fields...</>
                    : <><Wand2 className="w-4 h-4" /> Confirm & Fill Fields</>}
                </button>
                <button
                  onClick={() => { setShowTranscript(false); setTranscript(""); }}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold border ${D ? "border-gray-600 text-gray-300 hover:bg-gray-700" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
                  Discard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* FORM + NOTE */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-6">
          <div className="space-y-3">

            {/* Patient Info */}
            <Section title="Patient Info" icon="🧑‍⚕️" dark={D}>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={lbl}>Name</label><input className={inp} placeholder="BABY OF SARA" value={s.name} onChange={e => set("name")(up(e.target.value))} /></div>
                <div><label className={lbl}>Age</label><input className={inp} placeholder="3 DAYS" value={s.age} onChange={e => set("age")(up(e.target.value))} /></div>
                {tab === "isbar" && <>
                  <div><label className={lbl}>MRN #</label><input className={inp} placeholder="123456" value={s.mrn} onChange={e => set("mrn")(up(e.target.value))} /></div>
                  <div><label className={lbl}>Room #</label><input className={inp} placeholder="204" value={s.room} onChange={e => set("room")(up(e.target.value))} /></div>
                </>}
              </div>
              {tab === "progress" && <div className="mt-3"><label className={lbl}>Birth Info <span className={`normal-case font-normal ${D ? "text-gray-500" : "text-gray-400"}`}>(optional)</span></label><input className={inp} placeholder="FT, NSVD, NO NICU ADMISSION" value={s.ftNsvd} onChange={e => set("ftNsvd")(up(e.target.value))} /></div>}
              <div className="mt-3"><label className={lbl}>Diagnosis (Dx)</label><input className={inp} placeholder="NEONATAL JAUNDICE" value={s.dx} onChange={e => set("dx")(up(e.target.value))} /></div>
            </Section>

            {/* History */}
            <Section title="History (HX)" icon="📝" dark={D}>
              <div className="space-y-2">
                {s.hxLines.map((line, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className={dash}>-</span>
                    <input className={inpMono} placeholder={`History point ${i + 1}`} value={line} onChange={e => { const u = [...s.hxLines]; u[i] = up(e.target.value); set("hxLines")(u); }} />
                    {s.hxLines.length > 1 && <button onClick={() => set("hxLines")(s.hxLines.filter((_, j) => j !== i))} className="text-red-400 text-xl leading-none flex-shrink-0">x</button>}
                  </div>
                ))}
                <button onClick={() => set("hxLines")([...s.hxLines, ""])} className="text-sm text-blue-500 font-semibold mt-1">+ Add line</button>
              </div>
            </Section>

            {/* ER Level — both tabs, optional */}
            <Section title="AT ER LEVEL" icon="🏥" dark={D} defaultOpen={false}>
              <p className={`text-xs italic mb-2 ${D ? "text-gray-500" : "text-gray-400"}`}>Leave empty to omit from note</p>
              <textarea className={`${inpMono} resize-none`} rows={3} placeholder="WHAT WAS DONE AT ER LEVEL..." value={s.erLevel} onChange={e => set("erLevel")(up(e.target.value))} />
            </Section>

            {/* O/E */}
            <Section title="O/E Examination" icon="🩺" dark={D}>
              <div className="space-y-3">
                {[["general", "General"], ["chest", "Chest"], ["abd", "ABD"], ["cvs", "CVS"]].map(([key, label]) => (
                  <div key={key}>
                    <label className={lbl}>{label}</label>
                    <input className={inpMono} value={s[key]} onChange={e => set(key)(up(e.target.value))} />
                  </div>
                ))}
              </div>
            </Section>

            {/* Labs */}
            <Section title="Labs" icon="🧪" dark={D}>
              <div className="space-y-4">
                <div>
                  <p className={subhead}>CBC</p>
                  <div className="flex flex-wrap gap-2"><LabI k="wbc" label="WBC" /><LabI k="ne" label="NE" /><LabI k="hgb" label="HGB" /><LabI k="plt" label="PLT" /></div>
                </div>
                <div>
                  <p className={subhead}>CRP & VBG</p>
                  <div className="flex flex-wrap gap-2"><LabI k="crp" label="CRP" /><LabI k="ph" label="pH 7." /><LabI k="pco2" label="PCO2" /><LabI k="hco3" label="HCO3" /></div>
                </div>
                <div>
                  <p className={subhead}>U/E</p>
                  <div className="flex flex-wrap gap-2"><LabI k="na" label="NA" placeholder="140" /><LabI k="k" label="K" placeholder="3.8" /><LabI k="glu" label="GLU" /><LabI k="urea" label="UREA" /><LabI k="creat" label="CREAT" /></div>
                </div>
                <div>
                  <p className={subhead}>Additional Labs</p>
                  <div className="space-y-2">
                    {s.extraLabs.map((el, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input className={inpMono} placeholder="Name" value={el.name} onChange={e => { const u = [...s.extraLabs]; u[i] = { ...u[i], name: up(e.target.value) }; set("extraLabs")(u); }} />
                        <input className={inpMono} placeholder="Value" value={el.value} onChange={e => { const u = [...s.extraLabs]; u[i] = { ...u[i], value: up(e.target.value) }; set("extraLabs")(u); }} />
                        <button onClick={() => set("extraLabs")(s.extraLabs.filter((_, j) => j !== i))} className="text-red-400 text-xl leading-none flex-shrink-0">x</button>
                      </div>
                    ))}
                    <button onClick={() => set("extraLabs")([...s.extraLabs, { name: "", value: "" }])} className="text-sm text-blue-500 font-semibold">+ Add lab</button>
                  </div>
                </div>
              </div>
            </Section>

            {/* Imaging */}
            <Section title="Imaging" icon="🩻" dark={D} defaultOpen={false}>
              <div className="flex items-center justify-between mb-3">
                <p className={`text-xs italic ${D ? "text-gray-500" : "text-gray-400"}`}>{s.showImaging ? "Add results below" : "Toggle to add imaging"}</p>
                <button onClick={() => { set("showImaging")(!s.showImaging); set("imagingLines")([]); }}
                  className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${s.showImaging ? "bg-blue-100 text-blue-700" : D ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-500"}`}>
                  {s.showImaging ? "Has Imaging" : "+ Add Imaging"}
                </button>
              </div>
              {s.showImaging && (
                <div className="space-y-2">
                  {s.imagingLines.map((line, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className={dash}>-</span>
                      <input className={inpMono} placeholder="CXR: NORMAL" value={line} onChange={e => { const u = [...s.imagingLines]; u[i] = up(e.target.value); set("imagingLines")(u); }} />
                      {s.imagingLines.length > 1 && <button onClick={() => set("imagingLines")(s.imagingLines.filter((_, j) => j !== i))} className="text-red-400 text-xl leading-none flex-shrink-0">x</button>}
                    </div>
                  ))}
                  <button onClick={() => set("imagingLines")([...s.imagingLines, ""])} className="text-sm text-blue-500 font-semibold">+ Add imaging</button>
                </div>
              )}
            </Section>

            {/* Currently On */}
            <Section title="Currently On" icon="💉" dark={D} defaultOpen={false}>
              <div className="space-y-2">
                {s.currentMeds.map((med, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className={dash}>-</span>
                    <input className={inpMono} placeholder="IV AMPICILLIN 200MG Q12H" value={med} onChange={e => { const u = [...s.currentMeds]; u[i] = up(e.target.value); set("currentMeds")(u); }} />
                    <button onClick={() => set("currentMeds")(s.currentMeds.filter((_, j) => j !== i))} className="text-red-400 text-xl leading-none flex-shrink-0">x</button>
                  </div>
                ))}
                <button onClick={() => set("currentMeds")([...s.currentMeds, ""])} className="text-sm text-blue-500 font-semibold">+ Add medication / IVF</button>
              </div>
              {s.currentMeds.length === 0 && <p className={`text-xs italic mt-2 ${D ? "text-gray-500" : "text-gray-400"}`}>Leave empty to omit from note</p>}
            </Section>

            {/* Plan */}
            <Section title={tab === "isbar" ? "Recommendation / Plan" : "Plan"} icon="💊" dark={D}>
              <p className={`text-xs italic mb-2 ${D ? "text-gray-500" : "text-gray-400"}`}>Leave empty to default to "SEE ORDER SHEET"</p>
              <textarea className={`${inpMono} resize-none`} rows={4} placeholder="SEE ORDER SHEET" value={s.plan} onChange={e => set("plan")(up(e.target.value))} />
            </Section>

          </div>

          {/* Desktop Note Preview */}
          <div className="hidden lg:flex flex-col sticky top-16 h-fit">
            <div className={`rounded-xl border shadow-sm flex flex-col ${D ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
              <div className={`flex items-center justify-between px-4 py-3 border-b flex-wrap gap-2 ${D ? "border-gray-700" : "border-gray-100"}`}>
                <h2 className={`font-bold text-sm uppercase tracking-wide ${D ? "text-gray-300" : "text-gray-700"}`}>Generated Note</h2>
                <div className="flex gap-2 flex-wrap">
                  {showSaveInput ? (
                    <div className="flex gap-1">
                      <input className={`border rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 ${D ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"}`}
                        placeholder="Label (e.g. Baby Sara)" value={saveLabel} onChange={e => setSaveLabel(e.target.value)} onKeyDown={e => e.key === "Enter" && savePatient()} autoFocus />
                      <button onClick={savePatient} className="bg-green-500 text-white text-xs px-2 py-1 rounded">Save</button>
                      <button onClick={() => setShowSaveInput(false)}><X className="w-4 h-4 text-gray-400" /></button>
                    </div>
                  ) : (
                    <button onClick={() => setShowSaveInput(true)} className="flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-1.5 rounded-lg hover:bg-green-100">
                      <Save className="w-3.5 h-3.5" /> Save
                    </button>
                  )}
                  <button onClick={reset} className="flex items-center gap-1 bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-1.5 rounded-lg hover:bg-red-100">
                    <RotateCcw className="w-3.5 h-3.5" /> Reset
                  </button>
                  <button onClick={copy} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded-lg transition-all">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
              <pre className={`p-4 text-xs font-mono whitespace-pre-wrap leading-relaxed overflow-auto rounded-b-xl max-h-[75vh] ${D ? "bg-gray-900 text-green-400" : "bg-gray-50 text-gray-800"}`}>
                {output}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 py-3 border-t shadow-lg ${D ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
        {showNote && (
          <div className={`absolute bottom-full left-0 right-0 border-t shadow-xl rounded-t-2xl overflow-hidden ${D ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}>
            <div className={`flex items-center justify-between px-4 py-3 border-b ${D ? "border-gray-700" : "border-gray-200"}`}>
              <span className={`font-bold text-sm uppercase ${D ? "text-gray-300" : "text-gray-700"}`}>Generated Note</span>
              <button onClick={() => setShowNote(false)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <pre className={`p-4 text-xs font-mono whitespace-pre-wrap leading-relaxed overflow-auto max-h-72 ${D ? "bg-gray-900 text-green-400" : "bg-gray-50 text-gray-800"}`}>
              {output}
            </pre>
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={() => setShowNote(p => !p)}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-all ${showNote ? "bg-blue-600 text-white border-blue-600" : D ? "bg-gray-700 text-gray-300 border-gray-600" : "bg-gray-100 text-gray-700 border-gray-200"}`}>
            {showNote ? "Hide Note" : "Preview"}
          </button>
          {showSaveInput ? (
            <div className="flex gap-1 flex-1">
              <input className={`flex-1 border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 ${D ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300"}`}
                placeholder="Label..." value={saveLabel} onChange={e => setSaveLabel(e.target.value)} onKeyDown={e => e.key === "Enter" && savePatient()} autoFocus />
              <button onClick={savePatient} className="bg-green-500 text-white text-xs px-3 py-2 rounded-xl font-semibold">Save</button>
              <button onClick={() => setShowSaveInput(false)} className="text-gray-400 px-1"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <button onClick={() => setShowSaveInput(true)} className={`p-3 rounded-xl border ${D ? "bg-gray-700 text-gray-300 border-gray-600" : "bg-gray-100 text-gray-600 border-gray-200"}`}>
              <Save className="w-5 h-5" />
            </button>
          )}
          <button onClick={reset} className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-500">
            <RotateCcw className="w-5 h-5" />
          </button>
          <button onClick={copy} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-sm transition-all">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

    </div>
  );
}

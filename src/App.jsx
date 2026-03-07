import { useState, useEffect, useRef } from "react";
import { Copy, Check, RotateCcw, Save, Clock, X, Mic, MicOff } from "lucide-react";

const defaultLabs = { wbc: “”, ne: “”, hgb: “”, plt: “”, crp: “”, ph: “”, pco2: “”, hco3: “”, na: “140”, k: “3.8”, glu: “”, urea: “”, creat: “” };
const defaultState = {
name: “”, age: “”, mrn: “”, room: “”, dx: “”, ftNsvd: “FT, NSVD, NO NICU ADMISSION”,
hxLines: [””, “”, “”, “”], labs: defaultLabs, extraLabs: [],
imagingLines: [], showImaging: false, currentMeds: [], erLevel: “”, plan: “”,
general: “PT LOOKS WELL , WELL HYDRATED AND PERFUSED , HD STABLE, NOT IN DISTRESS , ON RA”,
chest: “EBAE, NO ADDED SOUNDS”, abd: “SOFT AND LAX NO HEPATOSPLENOMEGALY”, cvs: “S1+S2+0”
};

const LabInput = ({ k, label, placeholder, labs, setLabs }) => (

  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
    <input
      className="w-20 border border-gray-300 rounded px-2 py-1 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
      placeholder={placeholder || ""}
      value={labs[k]}
      onChange={e => setLabs(p => ({ ...p, [k]: e.target.value }))}
    />
  </div>
);

const Field = ({ label, value, setter, placeholder, mono }) => (

  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
    <input
      className={`border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${mono ? "font-mono" : ""}`}
      placeholder={placeholder || ""}
      value={value}
      onChange={e => setter(e.target.value)}
    />
  </div>
);

export default function App() {
const [tab, setTab] = useState(“isbar”);
const [copied, setCopied] = useState(false);
const [showHistory, setShowHistory] = useState(false);
const [showSaved, setShowSaved] = useState(false);
const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem(“noteHistory”) || “[]”));
const [savedPatients, setSavedPatients] = useState(() => JSON.parse(localStorage.getItem(“savedPatients”) || “[]”));
const [saveLabel, setSaveLabel] = useState(””);
const [showSaveInput, setShowSaveInput] = useState(false);
const [listening, setListening] = useState(null);
const recognitionRef = useRef(null);

const [s, setS] = useState({ …defaultState });
const set = (key) => (val) => setS(p => ({ …p, [key]: val }));

// Voice input
const startVoice = (fieldKey) => {
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SR) return alert(“Voice input not supported on this browser. Try Chrome.”);
if (recognitionRef.current) recognitionRef.current.stop();
const r = new SR();
r.lang = “en-US”;
r.continuous = false;
r.interimResults = false;
r.onresult = e => {
const transcript = e.results[0][0].transcript.toUpperCase();
setS(p => ({ …p, [fieldKey]: (p[fieldKey] ? p[fieldKey] + “ “ : “”) + transcript }));
};
r.onend = () => setListening(null);
r.onerror = () => setListening(null);
recognitionRef.current = r;
r.start();
setListening(fieldKey);
};

const MicBtn = ({ fieldKey }) => (
<button onClick={() => listening === fieldKey ? recognitionRef.current?.stop() : startVoice(fieldKey)}
className={`p-1.5 rounded-lg transition-all ${listening === fieldKey ? "bg-red-100 text-red-500 animate-pulse" : "bg-gray-100 text-gray-400 hover:text-blue-500 hover:bg-blue-50"}`}>
{listening === fieldKey ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
</button>
);

const buildNote = (state, noteTab) => {
const { name, age, mrn, room, dx, ftNsvd, hxLines, labs, extraLabs, imagingLines, showImaging, currentMeds, erLevel, plan, general, chest, abd, cvs } = state;
const examBlock = `O/E :\n${general}\nCHEST : ${chest}\nABD : ${abd}\nCVS : ${cvs}`;
const extraLabsBlock = extraLabs.filter(l => l.name || l.value).map(l => `- ${l.name}: ${l.value}`).join(”\n”);
const labBlock = `LABS:\n- CBC: WBC ${labs.wbc} │ NE ${labs.ne} │ HGB ${labs.hgb} │ PLT ${labs.plt}\n- CRP: ${labs.crp} MG/L\n- VBG: PH 7.${labs.ph} │ PCO₂ ${labs.pco2} │ HCO₃ ${labs.hco3} │\n- U/E: NA ${labs.na} │ K ${labs.k} │ GLU ${labs.glu} │ UREA ${labs.urea} │ CREAT ${labs.creat} │${extraLabsBlock ? "\n" + extraLabsBlock : ""}`;
const imagingBlock = showImaging && imagingLines.some(l => l.trim()) ? `• IMAGING:\n${imagingLines.filter(l => l.trim()).map(l => `- ${l}`).join("\n")}` : “”;
const medsBlock = currentMeds.filter(m => m.trim()).length > 0 ? `• CURRENTLY ON :\n${currentMeds.filter(m => m.trim()).map(m => `- ${m}`).join("\n")}` : “”;
const hxBlock = hxLines.map(l => `- ${l}`).join(”\n”);

```
if (noteTab === "progress") return `------------------------------------------------------------\nTHIS IS , ${ftNsvd}.\n• PRESENTED TO ER WITH HX OF :\n${hxBlock}\n------------------------------------------------------------\n• ${examBlock}\n\n• ${labBlock}\n\n${imagingBlock ? imagingBlock + "\n\n" : ""}${medsBlock ? medsBlock + "\n\n" : ""}• ASSESSMENT:\n${age} OLD, ${ftNsvd}. ADMITTED AS A CASE OF ${dx}, HD STABLE, ON RA.\n\n• PLAN:\n${plan.trim() ? plan : "SEE ORDER SHEET"}`;

return `• IDENTIFICATION:\n${name} , ${age} OLD.\nMRN#${mrn}, ROOM#${room}\n\n• SITUATION:\n${name} ${age} OLD. ADMITTED AS A CASE OF ${dx}, HD STABLE, ON RA.\n\n• BACKGROUND:\n PRESENTED TO ER WITH HX OF :\n${hxBlock}\n------------------------------------------------------------\nAT ER LEVEL :\n${erLevel}\n------------------------------------------------------------\n• ${examBlock}\n\n• ${labBlock}\n\n${imagingBlock ? imagingBlock + "\n" : ""}${medsBlock ? medsBlock + "\n" : ""}------------------------------------------------------------\n• ASSESSMENT:\n${name} ${age} OLD. ADMITTED AS A CASE OF ${dx}, HD STABLE, ON RA.\n\nR-RECOMMENDATION :\n${plan.trim() ? plan : "SEE ORDER SHEET"}`;
```

};

const output = buildNote(s, tab);

const copy = async () => {
await navigator.clipboard.writeText(output);
// Save to history
const entry = { id: Date.now(), type: tab.toUpperCase(), label: s.name || s.dx || “Unnamed”, note: output, time: new Date().toLocaleString() };
const updated = [entry, …history].slice(0, 10);
setHistory(updated);
localStorage.setItem(“noteHistory”, JSON.stringify(updated));
setCopied(true);
setTimeout(() => setCopied(false), 2000);
};

const reset = () => { if (confirm(“Reset all fields?”)) setS({ …defaultState, labs: { …defaultLabs } }); };

const savePatient = () => {
if (!saveLabel.trim()) return;
const entry = { id: Date.now(), label: saveLabel, tab, state: s };
const updated = [entry, …savedPatients];
setSavedPatients(updated);
localStorage.setItem(“savedPatients”, JSON.stringify(updated));
setSaveLabel(””);
setShowSaveInput(false);
};

const loadPatient = (entry) => { setS(entry.state); setTab(entry.tab); setShowSaved(false); };
const deletePatient = (id) => { const u = savedPatients.filter(p => p.id !== id); setSavedPatients(u); localStorage.setItem(“savedPatients”, JSON.stringify(u)); };
const deleteHistory = (id) => { const u = history.filter(h => h.id !== id); setHistory(u); localStorage.setItem(“noteHistory”, JSON.stringify(u)); };

const LabI = (props) => <LabInput {…props} labs={s.labs} setLabs={set(“labs”)} />;

return (
<div className="min-h-screen bg-gray-100 p-4">
<div className="max-w-5xl mx-auto">
{/* Header */}
<div className="flex items-center justify-between mb-5">
<div>
<h1 className="text-2xl font-bold text-gray-800">📋 Doctor Note Generator</h1>
<p className="text-gray-500 text-sm">Fill in the fields — your note builds in real time.</p>
</div>
<div className="flex gap-2">
<button onClick={() => { setShowSaved(true); setShowHistory(false); }}
className=“flex items-center gap-1 bg-white border border-gray-300 text-gray-600 text-sm px-3 py-1.5 rounded-lg hover:bg-gray-50”>
<Save className="w-4 h-4" /> Saved ({savedPatients.length})
</button>
<button onClick={() => { setShowHistory(true); setShowSaved(false); }}
className=“flex items-center gap-1 bg-white border border-gray-300 text-gray-600 text-sm px-3 py-1.5 rounded-lg hover:bg-gray-50”>
<Clock className="w-4 h-4" /> History ({history.length})
</button>
</div>
</div>

```
    {/* History Panel */}
    {showHistory && (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-5">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">📜 Note History (Last 10)</h2>
          <button onClick={() => setShowHistory(false)}><X className="w-4 h-4 text-gray-400 hover:text-gray-600" /></button>
        </div>
        {history.length === 0 ? <p className="text-xs text-gray-400 italic">No notes copied yet. Copy a note to save it here.</p> :
          <div className="space-y-2">
            {history.map(h => (
              <div key={h.id} className="flex items-center justify-between border border-gray-100 rounded-lg p-3">
                <div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full mr-2 ${h.type === "ISBAR" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"}`}>{h.type}</span>
                  <span className="text-sm font-medium text-gray-700">{h.label}</span>
                  <p className="text-xs text-gray-400 mt-0.5">{h.time}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => navigator.clipboard.writeText(h.note)}
                    className="text-xs text-blue-600 hover:underline">Copy</button>
                  <button onClick={() => deleteHistory(h.id)}><X className="w-3.5 h-3.5 text-red-400 hover:text-red-600" /></button>
                </div>
              </div>
            ))}
          </div>
        }
      </div>
    )}

    {/* Saved Patients Panel */}
    {showSaved && (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-5">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">💾 Saved Patients</h2>
          <button onClick={() => setShowSaved(false)}><X className="w-4 h-4 text-gray-400 hover:text-gray-600" /></button>
        </div>
        {savedPatients.length === 0 ? <p className="text-xs text-gray-400 italic">No saved patients yet.</p> :
          <div className="space-y-2">
            {savedPatients.map(p => (
              <div key={p.id} className="flex items-center justify-between border border-gray-100 rounded-lg p-3">
                <div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full mr-2 ${p.tab === "isbar" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"}`}>{p.tab.toUpperCase()}</span>
                  <span className="text-sm font-medium text-gray-700">{p.label}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => loadPatient(p)} className="text-xs text-blue-600 hover:underline">Load</button>
                  <button onClick={() => deletePatient(p.id)}><X className="w-3.5 h-3.5 text-red-400 hover:text-red-600" /></button>
                </div>
              </div>
            ))}
          </div>
        }
      </div>
    )}

    {/* Tabs */}
    <div className="flex gap-2 mb-6">
      {[["isbar", "ISBAR Note"], ["progress", "Progress Note"]].map(([v, l]) => (
        <button key={v} onClick={() => setTab(v)}
          className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${tab === v ? "bg-blue-600 text-white shadow" : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"}`}>
          {l}
        </button>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-5">

        {/* Patient Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">🧑‍⚕️ Patient Info</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</label>
              <div className="flex gap-1">
                <input className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="e.g. BABY OF SARA" value={s.name} onChange={e => set("name")(e.target.value)} />
                <MicBtn fieldKey="name" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Age</label>
              <div className="flex gap-1">
                <input className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="e.g. 3 DAYS" value={s.age} onChange={e => set("age")(e.target.value)} />
                <MicBtn fieldKey="age" />
              </div>
            </div>
            {tab === "isbar" && <>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">MRN #</label>
                <input className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="e.g. 123456" value={s.mrn} onChange={e => set("mrn")(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Room #</label>
                <input className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="e.g. 204" value={s.room} onChange={e => set("room")(e.target.value)} />
              </div>
            </>}
            {tab === "progress" && (
              <div className="col-span-2">
                <Field label="Birth Info" value={s.ftNsvd} setter={set("ftNsvd")} placeholder="FT, NSVD, NO NICU ADMISSION" />
              </div>
            )}
          </div>
          <div className="mt-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Diagnosis (Dx)</label>
              <div className="flex gap-1">
                <input className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="e.g. NEONATAL JAUNDICE" value={s.dx} onChange={e => set("dx")(e.target.value)} />
                <MicBtn fieldKey="dx" />
              </div>
            </div>
          </div>
        </div>

        {/* History */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">📝 History (HX)</h2>
          <div className="space-y-2">
            {s.hxLines.map((line, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-gray-400 font-mono text-sm">-</span>
                <input
                  className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder={`History point ${i + 1}`}
                  value={line}
                  onChange={e => { const u = [...s.hxLines]; u[i] = e.target.value; set("hxLines")(u); }}
                />
                <MicBtn fieldKey={`hx_${i}`} />
                {s.hxLines.length > 1 && (
                  <button onClick={() => set("hxLines")(s.hxLines.filter((_, j) => j !== i))}
                    className="text-red-400 hover:text-red-600 text-xl leading-none">×</button>
                )}
              </div>
            ))}
            <button onClick={() => set("hxLines")([...s.hxLines, ""])}
              className="text-sm text-blue-600 hover:underline mt-1">+ Add line</button>
          </div>
        </div>

        {/* O/E */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">🩺 O/E</h2>
          <div className="space-y-3">
            {[["general", "General"], ["chest", "Chest"], ["abd", "ABD"], ["cvs", "CVS"]].map(([key, label]) => (
              <div key={key} className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
                <div className="flex gap-1">
                  <input className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400" value={s[key]} onChange={e => set(key)(e.target.value)} />
                  <MicBtn fieldKey={key} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ER Level */}
        {tab === "isbar" && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h2 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">🏥 AT ER LEVEL</h2>
            <div className="flex gap-1">
              <textarea className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" rows={3} placeholder="What was done at ER level..." value={s.erLevel} onChange={e => set("erLevel")(e.target.value)} />
              <MicBtn fieldKey="erLevel" />
            </div>
          </div>
        )}

        {/* Labs */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">🧪 Labs</h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-400 mb-2 font-semibold">CBC</p>
              <div className="flex flex-wrap gap-3">
                <LabI k="wbc" label="WBC" /><LabI k="ne" label="NE" /><LabI k="hgb" label="HGB" /><LabI k="plt" label="PLT" />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-2 font-semibold">CRP & VBG</p>
              <div className="flex flex-wrap gap-3">
                <LabI k="crp" label="CRP (mg/L)" /><LabI k="ph" label="pH 7." /><LabI k="pco2" label="PCO₂" /><LabI k="hco3" label="HCO₃" />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-2 font-semibold">U/E</p>
              <div className="flex flex-wrap gap-3">
                <LabI k="na" label="NA" placeholder="140" /><LabI k="k" label="K" placeholder="3.8" /><LabI k="glu" label="GLU" /><LabI k="urea" label="UREA" /><LabI k="creat" label="CREAT" />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-2 font-semibold">ADDITIONAL LABS</p>
              <div className="space-y-2">
                {s.extraLabs.map((el, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Lab name" value={el.name}
                      onChange={e => { const u = [...s.extraLabs]; u[i] = { ...u[i], name: e.target.value.toUpperCase() }; set("extraLabs")(u); }} />
                    <input className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Value" value={el.value}
                      onChange={e => { const u = [...s.extraLabs]; u[i] = { ...u[i], value: e.target.value }; set("extraLabs")(u); }} />
                    <button onClick={() => set("extraLabs")(s.extraLabs.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 text-xl leading-none">×</button>
                  </div>
                ))}
                <button onClick={() => set("extraLabs")([...s.extraLabs, { name: "", value: "" }])} className="text-sm text-blue-600 hover:underline">+ Add lab</button>
              </div>
            </div>
          </div>
        </div>

        {/* Imaging */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">🩻 Imaging</h2>
            <button onClick={() => { set("showImaging")(!s.showImaging); set("imagingLines")([]); }}
              className={`text-xs px-3 py-1 rounded-full font-semibold transition-all ${s.showImaging ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
              {s.showImaging ? "✓ Has Imaging" : "+ Add Imaging"}
            </button>
          </div>
          {!s.showImaging && <p className="text-xs text-gray-400 italic">Section will be removed from note if empty</p>}
          {s.showImaging && (
            <div className="space-y-2">
              {s.imagingLines.map((line, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-gray-400 font-mono text-sm">-</span>
                  <input className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="e.g. CXR: NORMAL" value={line}
                    onChange={e => { const u = [...s.imagingLines]; u[i] = e.target.value; set("imagingLines")(u); }} />
                  {s.imagingLines.length > 1 && <button onClick={() => set("imagingLines")(s.imagingLines.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 text-xl leading-none">×</button>}
                </div>
              ))}
              <button onClick={() => set("imagingLines")([...s.imagingLines, ""])} className="text-sm text-blue-600 hover:underline">+ Add imaging</button>
            </div>
          )}
        </div>

        {/* Currently On */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">💉 Currently On</h2>
          <div className="space-y-2">
            {s.currentMeds.map((med, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-gray-400 font-mono text-sm">-</span>
                <input className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="e.g. IV AMPICILLIN 200MG Q12H" value={med}
                  onChange={e => { const u = [...s.currentMeds]; u[i] = e.target.value.toUpperCase(); set("currentMeds")(u); }} />
                <MicBtn fieldKey={`med_${i}`} />
                <button onClick={() => set("currentMeds")(s.currentMeds.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 text-xl leading-none">×</button>
              </div>
            ))}
            <button onClick={() => set("currentMeds")([...s.currentMeds, ""])} className="text-sm text-blue-600 hover:underline">+ Add medication / IVF</button>
          </div>
          {s.currentMeds.length === 0 && <p className="text-xs text-gray-400 italic mt-1">Leave empty to omit from note</p>}
        </div>

        {/* Plan */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-1 text-sm uppercase tracking-wide">{tab === "isbar" ? "💊 Recommendation / Plan" : "💊 Plan"}</h2>
          <p className="text-xs text-gray-400 italic mb-2">Leave empty to default to "SEE ORDER SHEET"</p>
          <div className="flex gap-1">
            <textarea className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" rows={4} placeholder="SEE ORDER SHEET" value={s.plan} onChange={e => set("plan")(e.target.value)} />
            <MicBtn fieldKey="plan" />
          </div>
        </div>
      </div>

      {/* RIGHT: Output */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col sticky top-4 h-fit">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-wrap gap-2">
          <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Generated Note</h2>
          <div className="flex gap-2 flex-wrap">
            {/* Save Patient */}
            {showSaveInput ? (
              <div className="flex gap-1">
                <input className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Label (e.g. Baby Sara)" value={saveLabel} onChange={e => setSaveLabel(e.target.value)} onKeyDown={e => e.key === "Enter" && savePatient()} autoFocus />
                <button onClick={savePatient} className="bg-green-500 text-white text-xs px-2 py-1 rounded">Save</button>
                <button onClick={() => setShowSaveInput(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <button onClick={() => setShowSaveInput(true)} className="flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-1.5 rounded-lg hover:bg-green-100">
                <Save className="w-3.5 h-3.5" /> Save Patient
              </button>
            )}
            {/* Reset */}
            <button onClick={reset} className="flex items-center gap-1 bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-1.5 rounded-lg hover:bg-red-100">
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
            {/* Copy */}
            <button onClick={copy} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded-lg transition-all">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
        <pre className="flex-1 p-4 text-xs font-mono text-gray-800 whitespace-pre-wrap leading-relaxed overflow-auto bg-gray-50 rounded-b-xl max-h-[80vh]">
          {output}
        </pre>
      </div>
    </div>
  </div>
</div>
```

);
}

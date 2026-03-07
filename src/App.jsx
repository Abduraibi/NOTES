import { useState, useCallback } from "react";
import { Copy, Check, RotateCcw, Save, Clock, X, Moon, Sun, ChevronDown, ChevronUp } from "lucide-react";

const defaultLabs = { wbc: "", ne: "", hgb: "", plt: "", crp: "", ph: "", pco2: "", hco3: "", na: "140", k: "3.8", glu: "", urea: "", creat: "" };
const defaultState = {
  name: "", age: "", mrn: "", room: "", dx: "", ftNsvd: "FT, NSVD, NO NICU ADMISSION",
  hxLines: ["", "", "", ""], labs: { ...defaultLabs }, extraLabs: [],
  imagingLines: [], showImaging: false, currentMeds: [], erLevel: "", plan: "",
  general: "PT LOOKS WELL , WELL HYDRATED AND PERFUSED , HD STABLE, NOT IN DISTRESS , ON RA",
  chest: "EBAE, NO ADDED SOUNDS", abd: "SOFT AND LAX NO HEPATOSPLENOMEGALY", cvs: "S1+S2+0"
};

const up = v => v.toUpperCase();

const LabInput = ({ k, label, placeholder, labs, onChange, dark }) => (
  <div className="flex flex-col gap-1">
    <label className={`text-xs font-semibold uppercase tracking-wide ${dark ? "text-gray-400" : "text-gray-500"}`}>{label}</label>
    <input
      className={`w-16 border rounded px-2 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400 ${dark ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500" : "border-gray-300 bg-white"}`}
      placeholder={placeholder || ""}
      value={labs[k]}
      onChange={e => onChange(k, up(e.target.value))}
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
  const [dark, setDark] = useState(false);
  const [history, setHistory] = useState([]);
  const [savedPatients, setSavedPatients] = useState([]);
  const [saveLabel, setSaveLabel] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [s, setS] = useState({ ...defaultState, labs: { ...defaultLabs } });
  const D = dark;

  const setField = useCallback((key, val) => {
    setS(p => ({ ...p, [key]: val }));
  }, []);

  const setLab = useCallback((key, val) => {
    setS(p => ({ ...p, labs: { ...p.labs, [key]: val } }));
  }, []);

  const buildNote = () => {
    const { name, age, mrn, room, dx, ftNsvd, hxLines, labs, extraLabs, imagingLines, showImaging, currentMeds, erLevel, plan, general, chest, abd, cvs } = s;
    const examBlock      = `O/E :\n${general}\nCHEST : ${chest}\nABD : ${abd}\nCVS : ${cvs}`;
    const extraLabsBlock = extraLabs.filter(l => l.name || l.value).map(l => `- ${l.name}: ${l.value}`).join("\n");
    const labBlock       = `LABS:\n- CBC: WBC ${labs.wbc} | NE ${labs.ne} | HGB ${labs.hgb} | PLT ${labs.plt}\n- CRP: ${labs.crp} MG/L\n- VBG: PH 7.${labs.ph} | PCO2 ${labs.pco2} | HCO3 ${labs.hco3} |\n- U/E: NA ${labs.na} | K ${labs.k} | GLU ${labs.glu} | UREA ${labs.urea} | CREAT ${labs.creat} |${extraLabsBlock ? "\n" + extraLabsBlock : ""}`;
    const imagingBlock   = showImaging && imagingLines.some(l => l.trim()) ? `* IMAGING:\n${imagingLines.filter(l => l.trim()).map(l => `- ${l}`).join("\n")}` : "";
    const medsBlock      = currentMeds.filter(m => m.trim()).length > 0 ? `* CURRENTLY ON :\n${currentMeds.filter(m => m.trim()).map(m => `- ${m}`).join("\n")}` : "";
    const hxBlock        = hxLines.map(l => `- ${l}`).join("\n");
    const erBlock        = erLevel.trim() ? `AT ER LEVEL :\n${erLevel}\n------------------------------------------------------------\n` : "";

    if (tab === "progress") {
      return [
        `------------------------------------------------------------`,
        `THIS IS ${name ? name + " ," : ","} ${age ? age + " OLD ," : ""} ${ftNsvd.trim() ? ftNsvd : ""}`,
        `* PRESENTED TO ER WITH HX OF :`,
        hxBlock,
        `------------------------------------------------------------`,
        erBlock || null,
        `* ${examBlock}`,
        ``,
        `* ${labBlock}`,
        ``,
        imagingBlock ? imagingBlock + "\n" : null,
        medsBlock ? medsBlock + "\n" : null,
        `* ASSESSMENT:`,
        `${age} OLD${name ? ", " + name + "." : "."} ADMITTED AS A CASE OF ${dx}, HD STABLE, ON RA.`,
        ``,
        `* PLAN:`,
        plan.trim() ? plan : "SEE ORDER SHEET",
      ].filter(l => l !== null).join("\n");
    }

    return [
      `* IDENTIFICATION:`,
      `${name} , ${age} OLD.`,
      `MRN#${mrn}, ROOM#${room}`,
      ``,
      `* SITUATION:`,
      `${name} ${age} OLD. ADMITTED AS A CASE OF ${dx}, HD STABLE, ON RA.`,
      ``,
      `* BACKGROUND:`,
      ` PRESENTED TO ER WITH HX OF :`,
      hxBlock,
      `------------------------------------------------------------`,
      erBlock || null,
      `* ${examBlock}`,
      ``,
      `* ${labBlock}`,
      ``,
      imagingBlock ? imagingBlock + "\n" : null,
      medsBlock ? medsBlock + "\n" : null,
      `------------------------------------------------------------`,
      `* ASSESSMENT:`,
      `${name} ${age} OLD. ADMITTED AS A CASE OF ${dx}, HD STABLE, ON RA.`,
      ``,
      `R-RECOMMENDATION :`,
      plan.trim() ? plan : "SEE ORDER SHEET",
    ].filter(l => l !== null).join("\n");
  };

  const output = buildNote();

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    const entry = { id: Date.now(), type: tab.toUpperCase(), label: s.name || s.dx || "Unnamed", note: output, time: new Date().toLocaleString() };
    setHistory(p => [entry, ...p].slice(0, 10));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => { if (confirm("Reset all fields?")) setS({ ...defaultState, labs: { ...defaultLabs } }); };

  const savePatient = () => {
    if (!saveLabel.trim()) return;
    const entry = { id: Date.now(), label: saveLabel, tab, state: s };
    setSavedPatients(p => [entry, ...p]);
    setSaveLabel(""); setShowSaveInput(false);
  };

  const loadPatient   = (entry) => { setS(entry.state); setTab(entry.tab); setShowSaved(false); };
  const deletePatient = (id)    => setSavedPatients(p => p.filter(x => x.id !== id));
  const deleteHistory = (id)    => setHistory(p => p.filter(x => x.id !== id));

  const inp     = `w-full border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${D ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500" : "border-gray-300 bg-white"}`;
  const inpMono = `w-full border rounded px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400 ${D ? "bg-gray-700 border-gray-600 text-white placeholder-gray-500" : "border-gray-300 bg-white"}`;
  const lbl     = `text-xs font-semibold uppercase tracking-wide mb-1 block ${D ? "text-gray-400" : "text-gray-500"}`;
  const dash    = `font-mono text-sm flex-shrink-0 ${D ? "text-gray-500" : "text-gray-400"}`;
  const subhead = `text-xs mb-2 font-semibold uppercase ${D ? "text-gray-500" : "text-gray-400"}`;

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

        {/* Tabs */}
        <div className={`flex rounded-xl p-1 mb-4 ${D ? "bg-gray-800" : "bg-white shadow-sm border border-gray-200"}`}>
          {[["isbar", "ISBAR Note"], ["progress", "Progress Note"]].map(([v, l]) => (
            <button key={v} onClick={() => setTab(v)}
              className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all ${tab === v ? "bg-blue-600 text-white shadow" : D ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}>
              {l}
            </button>
          ))}
        </div>

        <div className="lg:grid lg:grid-cols-2 lg:gap-6">
          <div className="space-y-3">

            {/* Patient Info */}
            <Section title="Patient Info" icon="🧑‍⚕️" dark={D}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Name</label>
                  <input className={inp} placeholder="BABY OF SARA" value={s.name}
                    onChange={e => setField("name", up(e.target.value))} />
                </div>
                <div>
                  <label className={lbl}>Age</label>
                  <input className={inp} placeholder="3 DAYS" value={s.age}
                    onChange={e => setField("age", up(e.target.value))} />
                </div>
                {tab === "isbar" && <>
                  <div>
                    <label className={lbl}>MRN #</label>
                    <input className={inp} placeholder="123456" value={s.mrn}
                      onChange={e => setField("mrn", up(e.target.value))} />
                  </div>
                  <div>
                    <label className={lbl}>Room #</label>
                    <input className={inp} placeholder="204" value={s.room}
                      onChange={e => setField("room", up(e.target.value))} />
                  </div>
                </>}
              </div>
              {tab === "progress" && (
                <div className="mt-3">
                  <label className={lbl}>Birth Info <span className={`normal-case font-normal ${D ? "text-gray-500" : "text-gray-400"}`}>(optional)</span></label>
                  <input className={inp} placeholder="FT, NSVD, NO NICU ADMISSION" value={s.ftNsvd}
                    onChange={e => setField("ftNsvd", up(e.target.value))} />
                </div>
              )}
              <div className="mt-3">
                <label className={lbl}>Diagnosis (Dx)</label>
                <input className={inp} placeholder="NEONATAL JAUNDICE" value={s.dx}
                  onChange={e => setField("dx", up(e.target.value))} />
              </div>
            </Section>

            {/* History */}
            <Section title="History (HX)" icon="📝" dark={D}>
              <div className="space-y-2">
                {s.hxLines.map((line, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className={dash}>-</span>
                    <input className={inpMono} placeholder={`History point ${i + 1}`} value={line}
                      onChange={e => { const u = [...s.hxLines]; u[i] = up(e.target.value); setField("hxLines", u); }} />
                    {s.hxLines.length > 1 && <button onClick={() => setField("hxLines", s.hxLines.filter((_, j) => j !== i))} className="text-red-400 text-xl leading-none flex-shrink-0">×</button>}
                  </div>
                ))}
                <button onClick={() => setField("hxLines", [...s.hxLines, ""])} className="text-sm text-blue-500 font-semibold mt-1">+ Add line</button>
              </div>
            </Section>

            {/* ER Level */}
            <Section title="AT ER LEVEL" icon="🏥" dark={D} defaultOpen={false}>
              <p className={`text-xs italic mb-2 ${D ? "text-gray-500" : "text-gray-400"}`}>Leave empty to omit from note</p>
              <textarea className={`${inpMono} resize-none`} rows={3} placeholder="WHAT WAS DONE AT ER LEVEL..."
                value={s.erLevel} onChange={e => setField("erLevel", up(e.target.value))} />
            </Section>

            {/* O/E */}
            <Section title="O/E Examination" icon="🩺" dark={D}>
              <div className="space-y-3">
                {[["general", "General"], ["chest", "Chest"], ["abd", "ABD"], ["cvs", "CVS"]].map(([key, label]) => (
                  <div key={key}>
                    <label className={lbl}>{label}</label>
                    <input className={inpMono} value={s[key]}
                      onChange={e => setField(key, up(e.target.value))} />
                  </div>
                ))}
              </div>
            </Section>

            {/* Labs */}
            <Section title="Labs" icon="🧪" dark={D}>
              <div className="space-y-4">
                <div>
                  <p className={subhead}>CBC</p>
                  <div className="flex flex-wrap gap-2">
                    {["wbc","ne","hgb","plt"].map(k => <LabInput key={k} k={k} label={k.toUpperCase()} labs={s.labs} onChange={setLab} dark={D} />)}
                  </div>
                </div>
                <div>
                  <p className={subhead}>CRP & VBG</p>
                  <div className="flex flex-wrap gap-2">
                    <LabInput k="crp" label="CRP" labs={s.labs} onChange={setLab} dark={D} />
                    <LabInput k="ph" label="pH 7." labs={s.labs} onChange={setLab} dark={D} />
                    <LabInput k="pco2" label="PCO2" labs={s.labs} onChange={setLab} dark={D} />
                    <LabInput k="hco3" label="HCO3" labs={s.labs} onChange={setLab} dark={D} />
                  </div>
                </div>
                <div>
                  <p className={subhead}>U/E</p>
                  <div className="flex flex-wrap gap-2">
                    <LabInput k="na" label="NA" placeholder="140" labs={s.labs} onChange={setLab} dark={D} />
                    <LabInput k="k" label="K" placeholder="3.8" labs={s.labs} onChange={setLab} dark={D} />
                    <LabInput k="glu" label="GLU" labs={s.labs} onChange={setLab} dark={D} />
                    <LabInput k="urea" label="UREA" labs={s.labs} onChange={setLab} dark={D} />
                    <LabInput k="creat" label="CREAT" labs={s.labs} onChange={setLab} dark={D} />
                  </div>
                </div>
                <div>
                  <p className={subhead}>Additional Labs</p>
                  <div className="space-y-2">
                    {s.extraLabs.map((el, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input className={inpMono} placeholder="Name" value={el.name}
                          onChange={e => { const u = [...s.extraLabs]; u[i] = { ...u[i], name: up(e.target.value) }; setField("extraLabs", u); }} />
                        <input className={inpMono} placeholder="Value" value={el.value}
                          onChange={e => { const u = [...s.extraLabs]; u[i] = { ...u[i], value: up(e.target.value) }; setField("extraLabs", u); }} />
                        <button onClick={() => setField("extraLabs", s.extraLabs.filter((_, j) => j !== i))} className="text-red-400 text-xl leading-none flex-shrink-0">×</button>
                      </div>
                    ))}
                    <button onClick={() => setField("extraLabs", [...s.extraLabs, { name: "", value: "" }])} className="text-sm text-blue-500 font-semibold">+ Add lab</button>
                  </div>
                </div>
              </div>
            </Section>

            {/* Imaging */}
            <Section title="Imaging" icon="🩻" dark={D} defaultOpen={false}>
              <div className="flex items-center justify-between mb-3">
                <p className={`text-xs italic ${D ? "text-gray-500" : "text-gray-400"}`}>{s.showImaging ? "Add results below" : "Toggle to add imaging"}</p>
                <button onClick={() => { setField("showImaging", !s.showImaging); setField("imagingLines", []); }}
                  className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${s.showImaging ? "bg-blue-100 text-blue-700" : D ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-500"}`}>
                  {s.showImaging ? "Has Imaging ✓" : "+ Add Imaging"}
                </button>
              </div>
              {s.showImaging && (
                <div className="space-y-2">
                  {s.imagingLines.map((line, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className={dash}>-</span>
                      <input className={inpMono} placeholder="CXR: NORMAL" value={line}
                        onChange={e => { const u = [...s.imagingLines]; u[i] = up(e.target.value); setField("imagingLines", u); }} />
                      {s.imagingLines.length > 1 && <button onClick={() => setField("imagingLines", s.imagingLines.filter((_, j) => j !== i))} className="text-red-400 text-xl leading-none flex-shrink-0">×</button>}
                    </div>
                  ))}
                  <button onClick={() => setField("imagingLines", [...s.imagingLines, ""])} className="text-sm text-blue-500 font-semibold">+ Add imaging</button>
                </div>
              )}
            </Section>

            {/* Currently On */}
            <Section title="Currently On" icon="💉" dark={D} defaultOpen={false}>
              <div className="space-y-2">
                {s.currentMeds.map((med, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className={dash}>-</span>
                    <input className={inpMono} placeholder="IV AMPICILLIN 200MG Q12H" value={med}
                      onChange={e => { const u = [...s.currentMeds]; u[i] = up(e.target.value); setField("currentMeds", u); }} />
                    <button onClick={() => setField("currentMeds", s.currentMeds.filter((_, j) => j !== i))} className="text-red-400 text-xl leading-none flex-shrink-0">×</button>
                  </div>
                ))}
                <button onClick={() => setField("currentMeds", [...s.currentMeds, ""])} className="text-sm text-blue-500 font-semibold">+ Add medication / IVF</button>
              </div>
              {s.currentMeds.length === 0 && <p className={`text-xs italic mt-2 ${D ? "text-gray-500" : "text-gray-400"}`}>Leave empty to omit from note</p>}
            </Section>

            {/* Plan */}
            <Section title={tab === "isbar" ? "Recommendation / Plan" : "Plan"} icon="💊" dark={D}>
              <p className={`text-xs italic mb-2 ${D ? "text-gray-500" : "text-gray-400"}`}>Leave empty to default to "SEE ORDER SHEET"</p>
              <textarea className={`${inpMono} resize-none`} rows={4} placeholder="SEE ORDER SHEET"
                value={s.plan} onChange={e => setField("plan", up(e.target.value))} />
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

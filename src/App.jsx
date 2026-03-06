import { useState } from "react";
import { Copy, Check } from "lucide-react";

const defaultLabs = { wbc: "", ne: "", hgb: "", plt: "", crp: "", ph: "", pco2: "", hco3: "", na: "140", k: "3.8", glu: "", urea: "", creat: "" };

export default function App() {
  const [tab, setTab] = useState("isbar");
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [mrn, setMrn] = useState("");
  const [room, setRoom] = useState("");
  const [dx, setDx] = useState("");
  const [hxLines, setHxLines] = useState(["", "", "", ""]);
  const [labs, setLabs] = useState(defaultLabs);
  const [extraLabs, setExtraLabs] = useState([]);
  const [imagingLines, setImagingLines] = useState([]);
  const [showImaging, setShowImaging] = useState(false);
  const [currentMeds, setCurrentMeds] = useState([]);
  const [erLevel, setErLevel] = useState("");
  const [plan, setPlan] = useState("");
  const [ftNsvd, setFtNsvd] = useState("FT, NSVD, NO NICU ADMISSION");
  const [general, setGeneral] = useState("PT LOOKS WELL , WELL HYDRATED AND PERFUSED , HD STABLE, NOT IN DISTRESS , ON RA");
  const [chest, setChest] = useState("EBAE, NO ADDED SOUNDS");
  const [abd, setAbd] = useState("SOFT AND LAX NO HEPATOSPLENOMEGALY");
  const [cvs, setCvs] = useState("S1+S2+0");

  const examBlock = `O/E :
${general}
CHEST : ${chest}
ABD : ${abd}
CVS : ${cvs}`;

  const extraLabsBlock = extraLabs.filter(l => l.name || l.value).map(l => `- ${l.name}: ${l.value}`).join("\n");

  const labBlock = `LABS:
- CBC: WBC ${labs.wbc} │ NE ${labs.ne} │ HGB ${labs.hgb} │ PLT ${labs.plt}
- CRP: ${labs.crp} MG/L
- VBG: PH 7.${labs.ph} │ PCO₂ ${labs.pco2} │ HCO₃ ${labs.hco3} │
- U/E: NA ${labs.na} │ K ${labs.k} │ GLU ${labs.glu} │ UREA ${labs.urea} │ CREAT ${labs.creat} │${extraLabsBlock ? "\n" + extraLabsBlock : ""}`;

  const imagingBlock = showImaging && imagingLines.some(l => l.trim())
    ? `• IMAGING:\n${imagingLines.filter(l => l.trim()).map(l => `- ${l}`).join("\n")}`
    : "";

  const medsBlock = currentMeds.filter(m => m.trim()).length > 0
    ? `• CURRENTLY ON :\n${currentMeds.filter(m => m.trim()).map(m => `- ${m}`).join("\n")}`
    : "";

  const hxBlock = hxLines.map(l => `- ${l}`).join("\n");

  const progressNote = `------------------------------------------------------------
THIS IS , ${ftNsvd}.
• PRESENTED TO ER WITH HX OF :
${hxBlock}
------------------------------------------------------------
• ${examBlock}

• ${labBlock}

${imagingBlock ? imagingBlock + "\n\n" : ""}${medsBlock ? medsBlock + "\n\n" : ""}• ASSESSMENT:
${age} OLD, ${ftNsvd}. ADMITTED AS A CASE OF ${dx}, HD STABLE, ON RA.

• PLAN:
${plan.trim() ? plan : "SEE ORDER SHEET"}`;

  const isbarNote = `• IDENTIFICATION:
${name} , ${age} OLD.
MRN#${mrn}, ROOM#${room}

• SITUATION:
${name} ${age} OLD. ADMITTED AS A CASE OF ${dx}, HD STABLE, ON RA.

• BACKGROUND:
 PRESENTED TO ER WITH HX OF :
${hxBlock}
------------------------------------------------------------
AT ER LEVEL :
${erLevel}
------------------------------------------------------------
• ${examBlock}

• ${labBlock}

${imagingBlock ? imagingBlock + "\n" : ""}${medsBlock ? medsBlock + "\n" : ""}------------------------------------------------------------
• ASSESSMENT:
${name} ${age} OLD. ADMITTED AS A CASE OF ${dx}, HD STABLE, ON RA.

R-RECOMMENDATION :
${plan.trim() ? plan : "SEE ORDER SHEET"}`;

  const output = tab === "isbar" ? isbarNote : progressNote;

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateExtraLab = (i, field, val) => {
    const updated = [...extraLabs];
    updated[i] = { ...updated[i], [field]: field === "name" ? val.toUpperCase() : val };
    setExtraLabs(updated);
  };

  const LabInput = ({ k, label, placeholder }) => (
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

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">📋 Doctor Note Generator</h1>
        <p className="text-gray-500 text-sm mb-5">Fill in the fields — your note builds in real time.</p>

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
                <Field label="Name" value={name} setter={setName} placeholder="e.g. BABY OF SARA" />
                <Field label="Age" value={age} setter={setAge} placeholder="e.g. 3 DAYS" />
                {tab === "isbar" && <Field label="MRN #" value={mrn} setter={setMrn} placeholder="e.g. 123456" />}
                {tab === "isbar" && <Field label="Room #" value={room} setter={setRoom} placeholder="e.g. 204" />}
                {tab === "progress" && (
                  <div className="col-span-2">
                    <Field label="Birth Info" value={ftNsvd} setter={setFtNsvd} placeholder="FT, NSVD, NO NICU ADMISSION" />
                  </div>
                )}
              </div>
              <div className="mt-3">
                <Field label="Diagnosis (Dx)" value={dx} setter={setDx} placeholder="e.g. NEONATAL JAUNDICE" />
              </div>
            </div>

            {/* History */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <h2 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">📝 History (HX)</h2>
              <div className="space-y-2">
                {hxLines.map((line, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-gray-400 font-mono text-sm">-</span>
                    <input
                      className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder={`History point ${i + 1}`}
                      value={line}
                      onChange={e => { const u = [...hxLines]; u[i] = e.target.value; setHxLines(u); }}
                    />
                    {hxLines.length > 1 && (
                      <button onClick={() => setHxLines(hxLines.filter((_, j) => j !== i))}
                        className="text-red-400 hover:text-red-600 text-xl leading-none">×</button>
                    )}
                  </div>
                ))}
                <button onClick={() => setHxLines([...hxLines, ""])}
                  className="text-sm text-blue-600 hover:underline mt-1">+ Add line</button>
              </div>
            </div>

            {/* O/E */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <h2 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">🩺 O/E</h2>
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">General</label>
                  <input className="border border-gray-300 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400" value={general} onChange={e => setGeneral(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Chest</label>
                  <input className="border border-gray-300 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400" value={chest} onChange={e => setChest(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">ABD</label>
                  <input className="border border-gray-300 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400" value={abd} onChange={e => setAbd(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">CVS</label>
                  <input className="border border-gray-300 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400" value={cvs} onChange={e => setCvs(e.target.value)} />
                </div>
              </div>
            </div>

            {/* ER Level - ISBAR only */}
            {tab === "isbar" && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <h2 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">🏥 AT ER LEVEL</h2>
                <textarea
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  rows={3}
                  placeholder="What was done at ER level..."
                  value={erLevel}
                  onChange={e => setErLevel(e.target.value)}
                />
              </div>
            )}

            {/* Labs */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <h2 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">🧪 Labs</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-400 mb-2 font-semibold">CBC</p>
                  <div className="flex flex-wrap gap-3">
                    <LabInput k="wbc" label="WBC" />
                    <LabInput k="ne" label="NE" />
                    <LabInput k="hgb" label="HGB" />
                    <LabInput k="plt" label="PLT" />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-2 font-semibold">CRP & VBG</p>
                  <div className="flex flex-wrap gap-3">
                    <LabInput k="crp" label="CRP (mg/L)" />
                    <LabInput k="ph" label="pH 7." />
                    <LabInput k="pco2" label="PCO₂" />
                    <LabInput k="hco3" label="HCO₃" />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-2 font-semibold">U/E</p>
                  <div className="flex flex-wrap gap-3">
                    <LabInput k="na" label="NA" placeholder="140" />
                    <LabInput k="k" label="K" placeholder="3.8" />
                    <LabInput k="glu" label="GLU" />
                    <LabInput k="urea" label="UREA" />
                    <LabInput k="creat" label="CREAT" />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-2 font-semibold">ADDITIONAL LABS</p>
                  <div className="space-y-2">
                    {extraLabs.map((el, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input
                          className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
                          placeholder="Lab name (e.g. LFT)"
                          value={el.name}
                          onChange={e => updateExtraLab(i, "name", e.target.value)}
                        />
                        <input
                          className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
                          placeholder="Value / result"
                          value={el.value}
                          onChange={e => updateExtraLab(i, "value", e.target.value)}
                        />
                        <button onClick={() => setExtraLabs(extraLabs.filter((_, j) => j !== i))}
                          className="text-red-400 hover:text-red-600 text-xl leading-none">×</button>
                      </div>
                    ))}
                    <button onClick={() => setExtraLabs([...extraLabs, { name: "", value: "" }])}
                      className="text-sm text-blue-600 hover:underline">+ Add lab</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Imaging */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">🩻 Imaging</h2>
                <button
                  onClick={() => { setShowImaging(p => !p); setImagingLines([]); }}
                  className={`text-xs px-3 py-1 rounded-full font-semibold transition-all ${showImaging ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                  {showImaging ? "✓ Has Imaging" : "+ Add Imaging"}
                </button>
              </div>
              {!showImaging && <p className="text-xs text-gray-400 italic">Section will be removed from note if empty</p>}
              {showImaging && (
                <div className="space-y-2">
                  {imagingLines.map((line, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-gray-400 font-mono text-sm">-</span>
                      <input
                        className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="e.g. CXR: NORMAL"
                        value={line}
                        onChange={e => { const u = [...imagingLines]; u[i] = e.target.value; setImagingLines(u); }}
                      />
                      {imagingLines.length > 1 && (
                        <button onClick={() => setImagingLines(imagingLines.filter((_, j) => j !== i))}
                          className="text-red-400 hover:text-red-600 text-xl leading-none">×</button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => setImagingLines([...imagingLines, ""])}
                    className="text-sm text-blue-600 hover:underline">+ Add imaging</button>
                </div>
              )}
            </div>

            {/* Currently On */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <h2 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">💉 Currently On</h2>
              <div className="space-y-2">
                {currentMeds.map((med, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-gray-400 font-mono text-sm">-</span>
                    <input
                      className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="e.g. IV AMPICILLIN 200MG Q12H"
                      value={med}
                      onChange={e => { const u = [...currentMeds]; u[i] = e.target.value.toUpperCase(); setCurrentMeds(u); }}
                    />
                    <button onClick={() => setCurrentMeds(currentMeds.filter((_, j) => j !== i))}
                      className="text-red-400 hover:text-red-600 text-xl leading-none">×</button>
                  </div>
                ))}
                <button onClick={() => setCurrentMeds([...currentMeds, ""])}
                  className="text-sm text-blue-600 hover:underline">+ Add medication / IVF</button>
              </div>
              {currentMeds.length === 0 && <p className="text-xs text-gray-400 italic mt-1">Leave empty to omit this section from the note</p>}
            </div>

            {/* Plan */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <h2 className="font-bold text-gray-700 mb-1 text-sm uppercase tracking-wide">
                {tab === "isbar" ? "💊 Recommendation / Plan" : "💊 Plan"}
              </h2>
              <p className="text-xs text-gray-400 italic mb-2">Leave empty to default to "SEE ORDER SHEET"</p>
              <textarea
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                rows={4}
                placeholder="SEE ORDER SHEET"
                value={plan}
                onChange={e => setPlan(e.target.value)}
              />
            </div>
          </div>

          {/* RIGHT: Output */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Generated Note</h2>
              <button onClick={copy}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded-lg transition-all">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre className="flex-1 p-4 text-xs font-mono text-gray-800 whitespace-pre-wrap leading-relaxed overflow-auto bg-gray-50 rounded-b-xl">
              {output}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

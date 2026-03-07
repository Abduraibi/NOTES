import { useState, useEffect, useRef, useCallback } from "react";
import { Copy, Check, RotateCcw, Save, Clock, X, Mic, MicOff, Moon, Sun, Wand2 } from "lucide-react";

const defaultLabs = { wbc: "", ne: "", hgb: "", plt: "", crp: "", ph: "", pco2: "", hco3: "", na: "140", k: "3.8", glu: "", urea: "", creat: "" };
const defaultState = {
  name: "", age: "", mrn: "", room: "", dx: "", ftNsvd: "FT, NSVD, NO NICU ADMISSION",
  hxLines: ["", "", "", ""], labs: { ...defaultLabs }, extraLabs: [],
  imagingLines: [], showImaging: false, currentMeds: [], erLevel: "", plan: "",
  general: "PT LOOKS WELL , WELL HYDRATED AND PERFUSED , HD STABLE, NOT IN DISTRESS , ON RA",
  chest: "EBAE, NO ADDED SOUNDS", abd: "SOFT AND LAX NO HEPATOSPLENOMEGALY", cvs: "S1+S2+0"
};

const up = v => v.toUpperCase();

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
  const [s, setS] = useState({ ...defaultState, labs: { ...defaultLabs } });
  const D = dark;

  const [dictating, setDictating] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [showTranscript, setShowTranscript] = useState(false);
  const [processing, setProcessing] = useState(false);
  const dictationRef = useRef(null);
  const finalRef = useRef("");

  useEffect(() => { localStorage.setItem("darkMode", dark); }, [dark]);

  const setField = useCallback((key, val) => setS(p => ({ ...p, [key]: val })), []);
  const setLab = useCallback((key, val) => setS(p => ({ ...p, labs: { ...p.labs, [key]: val } })), []);

  const startDictation = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert("Voice input not supported. Please use Chrome.");
    if (dictationRef.current) dictationRef.current.stop();
    finalRef.current = "";
    setTranscript(""); setShowTranscript(false);
    const r = new SR();
    r.lang = "en-US"; r.continuous = true; r.interimResults = true;
    r.onresult = e => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalRef.current += e.results[i][0].transcript + " ";
        else interim = e.results[i][0].transcript;
      }
      setTranscript((finalRef.current + interim).trim());
    };
    r.onend = () => { setDictating(false); if (finalRef.current.trim()) { setTranscript(finalRef.current.trim()); setShowTranscript(true); } };
    r.onerror = () => setDictating(false);
    dictationRef.current = r; r.start(); setDictating(true);
  };

  const stopDictation = () => { dictationRef.current?.stop(); setDictating(false); };

  const processTranscript = async () => {
    if (!transcript.trim()) return;
    set

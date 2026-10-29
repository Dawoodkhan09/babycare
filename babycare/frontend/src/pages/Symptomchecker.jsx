import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowRight, FaCheck, FaStethoscope, FaShieldAlt, FaInfoCircle, FaRobot,
  FaUserMd, FaRedo, FaExclamationTriangle, FaPaperPlane,
} from "react-icons/fa";
import { GiBabyBottle, GiMedicines } from "react-icons/gi";
import { HiOutlineShieldCheck } from "react-icons/hi";
import { diagnose } from "../api/ai";
import flow from "../data/chatbot_flow.json";

const MINT = "#2a9d5c";
const MINT_LIGHT = "#e8f8ef";
const MINT_DARK = "#1a6e3f";
const TEXT_DARK = "#0a1f15";
const TEXT_BODY = "#3d5a48";
const TEXT_MUTED = "#5a7a6a";
const BORDER = "#e0ede6";
const URDU_FONT = "'Noto Nastaliq Urdu','Jameel Noori Nastaleeq',serif";

// ═══════════════ CHAT FLOW ENGINE ═══════════════
const NODES = flow.nodes;
const CARD_KEYS = flow.card_keys;
// q_duration ke baad main complaint ke hisaab se follow-up (flow._branch_note)
const BRANCH = { fever: "f1", cold_cough: "c1", teething_pain: "t1", diarrhea: "d1", sleep_issues: "s1" };
const QUESTION_TYPES = ["single_select", "multi_select", "freetext"];
const TYPING_MS = 550;

const LANGUAGES = [
  { id: "en",    label: "English" },
  { id: "roman", label: "Roman Urdu" },
  { id: "ur",    label: "اردو" },
];

const UI = {
  en: {
    title: "BabyCare Assistant", sub: "Answer a few questions — just like at the doctor's",
    online: "AI model · online", question: "Question", done: "Done",
    next: "Next", send: "Send", skip: "Skip", orType: "Or type your answer…", typeHere: "Type here…",
    restart: "Restart", likely: "Most likely condition", confidence: "confidence",
    homeo: "Homeopathic", organic: "Organic / Home care", advice: "When to see a doctor",
    emergency: "Possible emergency", book: "Book a Doctor", findDoctor: "Find a Doctor",
    safety: "Safety warning", disclaimer: "Disclaimer", tryAgain: "Try again", skipped: "(skipped)",
    error: "The System Check is not available right now. Please try again in a moment.",
  },
  roman: {
    title: "BabyCare Assistant", sub: "Kuch sawaalon ke jawab dein — bilkul doctor ki tarah",
    online: "AI model · online", question: "Sawaal", done: "Mukammal",
    next: "Aage", send: "Bhejein", skip: "Chhor dein", orType: "Ya apna jawab likhein…", typeHere: "Yahan likhein…",
    restart: "Dobara shuru karein", likely: "Sab se mumkina condition", confidence: "yaqeen",
    homeo: "Homeopathic", organic: "Organic / Gharelu ilaaj", advice: "Doctor ko kab dikhayein",
    emergency: "Mumkina emergency", book: "Doctor Book Karein", findDoctor: "Doctor Dhoondein",
    safety: "Hifazati warning", disclaimer: "Zaroori note", tryAgain: "Dobara koshish", skipped: "(chhor diya)",
    error: "System Check abhi available nahi. Barah-e-karam thori der baad koshish karein.",
  },
  ur: {
    title: "بے بی کیئر اسسٹنٹ", sub: "چند سوالوں کے جواب دیں — بالکل ڈاکٹر کی طرح",
    online: "اے آئی ماڈل · آن لائن", question: "سوال", done: "مکمل",
    next: "آگے", send: "بھیجیں", skip: "چھوڑ دیں", orType: "یا اپنا جواب لکھیں…", typeHere: "یہاں لکھیں…",
    restart: "دوبارہ شروع کریں", likely: "سب سے ممکنہ کیفیت", confidence: "یقین",
    homeo: "ہومیوپیتھک", organic: "قدرتی / گھریلو علاج", advice: "ڈاکٹر کو کب دکھائیں",
    emergency: "ممکنہ ایمرجنسی", book: "ڈاکٹر بک کریں", findDoctor: "ڈاکٹر تلاش کریں",
    safety: "حفاظتی وارننگ", disclaimer: "ضروری نوٹ", tryAgain: "دوبارہ کوشش", skipped: "(چھوڑ دیا)",
    error: "سسٹم چیک ابھی دستیاب نہیں۔ براہِ کرم تھوڑی دیر بعد کوشش کریں۔",
  },
};

const emptyCollected = () => ({
  cards: {}, main_complaint: null, age_label: null, duration_label: null, notes: [], emergency: false,
});

// Option ka "set" jama object mein lagao: card keys = symptom, emergency = OR, baqi assign
function applySet(col, set) {
  const next = { ...col, cards: { ...col.cards } };
  Object.entries(set || {}).forEach(([key, value]) => {
    if (CARD_KEYS.includes(key)) {
      if (value) next.cards[key] = 1;
    } else if (key === "emergency") {
      next.emergency = next.emergency || Boolean(value);
    } else {
      next[key] = value;
    }
  });
  return next;
}

function applyText(col, key, text) {
  if (!text) return col;
  if (key === "notes") return { ...col, notes: [...col.notes, text] };
  return { ...col, [key]: text };
}

function resolveNext(nodeId, col) {
  if (nodeId === "q_duration") return BRANCH[col.main_complaint] || NODES.q_duration.next;
  return NODES[nodeId]?.next;
}

// Is jawab-raaste par kul kitne sawaal hain (progress ke liye)
function questionPath(col) {
  const ids = [];
  const seen = new Set();
  let id = flow.start;
  while (id && NODES[id] && !seen.has(id)) {
    seen.add(id);
    if (QUESTION_TYPES.includes(NODES[id].type)) ids.push(id);
    id = resolveNext(id, col);
  }
  return ids;
}

const buildPayload = (col, language) => ({
  symptoms:       CARD_KEYS.filter((k) => col.cards[k]),
  age:            col.age_label,
  duration:       col.duration_label,
  additional:     col.notes.join(". "),
  language,
  emergency_hint: col.emergency,
});

// ═══════════════ STYLES ═══════════════
const hoverStyles = `
  .chat-chip { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
  .chat-chip:hover:not(.active) {
    background: #fafffe !important;
    border-color: #2a9d5c !important;
    color: #1a6e3f !important;
    transform: translateY(-1px);
  }

  .sym-btn-primary { transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
  .sym-btn-primary:hover:not(:disabled) {
    background: #0f4f2e !important;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(26,110,63,0.4) !important;
  }
  .sym-btn-outline { transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
  .sym-btn-outline:hover {
    background: #e8f8ef !important;
    border-color: #1a6e3f !important;
  }
  .lang-pill { transition: all 0.2s ease; }
  .lang-pill:hover:not(.active) { border-color: #2a9d5c !important; color: #1a6e3f !important; }

  .sym-input { transition: all 0.2s ease; }
  .sym-input:focus {
    border-color: #2a9d5c !important;
    background: #fff !important;
    box-shadow: 0 0 0 4px rgba(42,157,92,0.1);
  }

  @keyframes dotBounce {
    0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
    40%           { transform: scale(1);   opacity: 1;   }
  }
  .dot1 { animation: dotBounce 1.4s infinite ease-in-out 0s; }
  .dot2 { animation: dotBounce 1.4s infinite ease-in-out 0.16s; }
  .dot3 { animation: dotBounce 1.4s infinite ease-in-out 0.32s; }

  @keyframes bubbleIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .chat-bubble { animation: bubbleIn 0.3s ease-out; }

  /* ═══ MOBILE ═══ */
  @media (max-width: 768px) {
    .sym-container  { padding: 24px 12px 90px !important; }
    .chat-card      { border-radius: 14px !important; }
    .chat-body      { padding: 16px 12px !important; height: 62vh !important; }
    .chat-topbar    { padding: 12px 14px !important; }
    .chat-composer  { padding: 12px !important; }
    .chat-bubble-max { max-width: 88% !important; }
    .ai-btn-row     { flex-direction: column !important; }
    .ai-btn-row > * { width: 100% !important; justify-content: center !important; }
  }
`;

export default function SymptomChecker() {
  const navigate = useNavigate();

  const [lang, setLang]           = useState("en");
  const [log, setLog]             = useState([]);    // {key, kind: "bot" | "user", nodeId, optionIds?, text?}
  const [current, setCurrent]     = useState(null);  // jawab ka intezar karta node
  const [typing, setTyping]       = useState(false);
  const [collected, setCollected] = useState(emptyCollected);
  const [picked, setPicked]       = useState([]);    // multi_select
  const [draft, setDraft]         = useState("");
  const [result, setResult]       = useState(null);  // {status: "loading" | "done" | "error", data?, error?, col}

  const runRef    = useRef(0);   // Restart par purane timers/requests ignore
  const timersRef = useRef([]);
  const keyRef    = useRef(0);
  const langRef   = useRef(lang);
  const bodyRef   = useRef(null);

  const t = UI[lang];
  const isUr = lang === "ur";
  const langStyle = isUr ? { direction: "rtl", textAlign: "right", fontFamily: URDU_FONT, lineHeight: 2.1 } : {};

  const push = (entry) => setLog((prev) => [...prev, { key: ++keyRef.current, ...entry }]);

  const fetchResult = async (col, language) => {
    const run = runRef.current;
    setResult({ status: "loading", col });
    try {
      const data = await diagnose(buildPayload(col, language));
      if (run === runRef.current) setResult({ status: "done", data, col });
    } catch (err) {
      if (run === runRef.current) {
        setResult({ status: "error", error: err.response?.data?.error || null, col });
      }
    }
  };

  // Bot "typing…" → bubble → (message: aage | submit: API | sawaal: jawab ka intezar)
  const showNode = (nodeId, col) => {
    const run = runRef.current;
    setCurrent(null);
    setTyping(true);
    const timer = setTimeout(() => {
      if (run !== runRef.current) return;
      const node = NODES[nodeId];
      setTyping(false);
      push({ kind: "bot", nodeId });
      if (node.type === "message") showNode(node.next, col);
      else if (node.type === "submit") fetchResult(col, langRef.current);
      else setCurrent(nodeId);
    }, TYPING_MS);
    timersRef.current.push(timer);
  };

  const startChat = () => {
    runRef.current += 1;
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    const col = emptyCollected();
    setLog([]);
    setCollected(col);
    setPicked([]);
    setDraft("");
    setResult(null);
    showNode(flow.start, col);
  };

  useEffect(() => {
    startChat();
    return () => {
      runRef.current += 1;
      timersRef.current.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Naya bubble aaye to chat neeche scroll ho
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [log, typing, result, current]);

  const changeLanguage = (id) => {
    setLang(id);
    langRef.current = id;
    // Result aa chuka ho to nayi language mein dobara mangwao
    if (result && result.status !== "loading") fetchResult(result.col, id);
  };

  // ── Jawab handlers ──
  const answer = (col, entry) => {
    const nodeId = current;
    push({ kind: "user", nodeId, ...entry });
    setCollected(col);
    setPicked([]);
    setDraft("");
    showNode(resolveNext(nodeId, col), col);
  };

  const chooseOption = (opt) => answer(applySet(collected, opt.set), { optionIds: [opt.id] });

  const togglePick = (opt) => {
    setPicked((prev) => {
      if (prev.includes(opt.id)) return prev.filter((id) => id !== opt.id);
      if (opt.exclusive) return [opt.id];
      const options = NODES[current].options;
      return [...prev.filter((id) => !options.find((o) => o.id === id)?.exclusive), opt.id];
    });
  };

  const submitPicked = () => {
    if (!picked.length) return;
    const node = NODES[current];
    const col = node.options
      .filter((o) => picked.includes(o.id))
      .reduce((acc, o) => applySet(acc, o.set), collected);
    answer(col, { optionIds: picked });
  };

  const submitText = (skip = false) => {
    const node = NODES[current];
    const text = skip ? "" : draft.trim();
    if (!text && !(skip && node.optional)) return;
    let col = applyText(collected, node.set_to || "notes", text);
    if (text && node.freetext_set) col = applySet(col, node.freetext_set);
    answer(col, { text, skipped: !text });
  };

  // ── Progress ("Sawaal 3/8") ──
  const path = questionPath(collected);
  const answered = log.filter((e) => e.kind === "user").length;
  const finished = !current && !typing && answered > 0 && result !== null;
  const qNumber = Math.min(answered + (current ? 1 : 0), path.length);

  const userText = (entry) => {
    if (entry.optionIds) {
      const options = NODES[entry.nodeId].options;
      return entry.optionIds
        .map((id) => options.find((o) => o.id === id)?.label[lang])
        .filter(Boolean)
        .join(isUr ? "، " : ", ");
    }
    return entry.skipped ? t.skipped : entry.text;
  };

  const currentNode = current ? NODES[current] : null;

  return (
    <div style={s.root}>
      <style>{hoverStyles}</style>

      <div style={s.container} className="sym-container">

        {/* ═══ HEADER ═══ */}
        <div style={s.header}>
          <div style={s.badge}>
            <FaStethoscope size={11} color={MINT_DARK} />
            <span>AI-Powered Symptom Assessment</span>
          </div>
          <h1 style={{ ...s.title, ...(isUr ? { fontFamily: URDU_FONT, lineHeight: 1.8 } : {}) }}>{t.title}</h1>
          <p style={{ ...s.sub, ...(isUr ? { fontFamily: URDU_FONT, lineHeight: 2 } : {}) }}>{t.sub}</p>
        </div>

        {/* ═══ CHAT CARD ═══ */}
        <div style={s.chatCard} className="chat-card">

          {/* Top bar: avatar + progress + language + restart */}
          <div style={s.topBar} className="chat-topbar">
            <div style={s.botId}>
              <div style={s.avatarLg}><FaRobot size={18} color="#fff" /></div>
              <div>
                <div style={s.botName}>BabyCare AI</div>
                <div style={s.botStatus}><span style={s.onlineDot} />{t.online}</div>
              </div>
            </div>
            <div style={s.topRight}>
              <span style={{ ...s.progressTag, ...(isUr ? { fontFamily: URDU_FONT } : {}) }}>
                {finished
                  ? <><FaCheck size={9} /> {t.done}</>
                  : `${t.question} ${Math.max(qNumber, 1)}/${path.length}`}
              </span>
              <button style={s.restartBtn} className="sym-btn-outline" onClick={startChat} title={t.restart}>
                <FaRedo size={11} />
                <span style={isUr ? { fontFamily: URDU_FONT } : {}}>{t.restart}</span>
              </button>
            </div>
          </div>
          <div style={s.langRow}>
            {LANGUAGES.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => changeLanguage(id)}
                className={`lang-pill ${lang === id ? "active" : ""}`}
                style={{
                  ...s.langPill,
                  ...(lang === id ? s.langPillActive : {}),
                  ...(id === "ur" ? { fontFamily: URDU_FONT } : {}),
                }}
              >
                {lang === id && <FaCheck size={9} />}
                {label}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div style={s.body} className="chat-body" ref={bodyRef}>
            {log.map((entry) =>
              entry.kind === "bot" ? (
                <div key={entry.key} style={s.botRow} className="chat-bubble">
                  <div style={s.avatar}><FaRobot size={12} color="#fff" /></div>
                  <div style={{ ...s.botBubble, ...langStyle }} className="chat-bubble-max">
                    {NODES[entry.nodeId].text[lang]}
                  </div>
                </div>
              ) : (
                <div key={entry.key} style={s.userRow} className="chat-bubble">
                  <div
                    style={{ ...s.userBubble, ...langStyle, ...(entry.skipped ? { opacity: 0.75, fontStyle: "italic" } : {}) }}
                    className="chat-bubble-max"
                  >
                    {userText(entry)}
                  </div>
                </div>
              )
            )}

            {(typing || result?.status === "loading") && (
              <div style={s.botRow} className="chat-bubble">
                <div style={s.avatar}><FaRobot size={12} color="#fff" /></div>
                <div style={{ ...s.botBubble, ...s.typingBubble }}>
                  <div style={s.dot} className="dot1" />
                  <div style={s.dot} className="dot2" />
                  <div style={s.dot} className="dot3" />
                </div>
              </div>
            )}

            {/* ── Result (aakhri bot bubble) ── */}
            {result?.status === "error" && (
              <div style={s.botRow} className="chat-bubble">
                <div style={s.avatar}><FaRobot size={12} color="#fff" /></div>
                <div style={{ ...s.botBubble, ...s.errorBubble, ...langStyle }} className="chat-bubble-max">
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <FaExclamationTriangle size={14} color="#dc2626" style={{ flexShrink: 0, marginTop: 4 }} />
                    <span>{result.error || t.error}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                    <button style={s.smallPrimary} className="sym-btn-primary"
                      onClick={() => fetchResult(result.col, lang)}>
                      <FaRedo size={10} /> {t.tryAgain}
                    </button>
                    <button style={s.smallOutline} className="sym-btn-outline" onClick={startChat}>
                      {t.restart}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {result?.status === "done" && (() => {
              const data = result.data;
              const emergency = result.col.emergency || data.emergency;
              return (
                <div style={s.botRow} className="chat-bubble">
                  <div style={s.avatar}><FaRobot size={12} color="#fff" /></div>
                  <div style={s.resultWrap} className="chat-bubble-max">
                    {emergency ? (
                      <div style={{ ...s.emergencyCard, ...langStyle }}>
                        <div style={s.emergencyTitle}>
                          <FaExclamationTriangle size={20} color="#fff" />
                          <span>{t.emergency}</span>
                        </div>
                        <p style={s.emergencyMsg}>{flow.emergency_message[lang]}</p>
                        {data.emergency_reasons?.length > 0 && (
                          <ul style={s.emergencyList}>
                            {data.emergency_reasons.map((r) => <li key={r}>{r}</li>)}
                          </ul>
                        )}
                        <button style={s.emergencyBtn} onClick={() => navigate("/DoctorBooking")}>
                          <FaUserMd size={14} />
                          {t.book}
                          <FaArrowRight size={12} style={isUr ? { transform: "scaleX(-1)" } : {}} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div style={{ ...s.resultCard, ...langStyle }}>
                          <div style={s.resultHeader}>
                            <FaStethoscope size={13} color={MINT_DARK} />
                            <span>{t.likely}</span>
                          </div>
                          <div style={s.diseaseRow}>
                            <span style={s.diseaseName}>{data.condition}</span>
                            <span style={s.confBadge}>{data.confidence}% {t.confidence}</span>
                          </div>
                          <div style={s.confTrack}>
                            <div style={{
                              ...s.confFill,
                              width: `${Math.min(data.confidence, 100)}%`,
                              ...(data.low_confidence ? { background: "#F59E0B" } : {}),
                            }} />
                          </div>
                          {data.confidence_note && <p style={s.confNote}>{data.confidence_note}</p>}
                        </div>

                        {/* Teething: homeopathic tablets ki jagah FDA warning */}
                        {data.homeopathic_warning ? (
                          <div style={{ ...s.fdaWarning, ...langStyle }}>
                            <FaExclamationTriangle size={15} color="#b91c1c" style={{ flexShrink: 0, marginTop: 3 }} />
                            <div><strong>{t.safety}:</strong> {data.homeopathic_warning}</div>
                          </div>
                        ) : data.treatment && (
                          <div style={{ ...s.treatCard, ...langStyle }}>
                            <div style={s.treatTitle}>
                              <GiMedicines size={15} color="#7c3aed" />
                              <span>{t.homeo}</span>
                            </div>
                            <p style={s.treatText}>{data.treatment.homeopathic}</p>
                          </div>
                        )}
                        {data.treatment && (
                          <div style={{ ...s.treatCard, ...langStyle }}>
                            <div style={s.treatTitle}>
                              <GiBabyBottle size={15} color={MINT_DARK} />
                              <span>{t.organic}</span>
                            </div>
                            <p style={s.treatText}>{data.treatment.organic}</p>
                          </div>
                        )}
                        {data.advice && (
                          <div style={{ ...s.adviceBox, ...langStyle }}>
                            <FaInfoCircle size={13} color={MINT_DARK} style={{ flexShrink: 0, marginTop: 4 }} />
                            <div><strong>{t.advice}:</strong> {data.advice}</div>
                          </div>
                        )}
                      </>
                    )}

                    <div style={{ ...s.disclaimer, ...langStyle }}>
                      <HiOutlineShieldCheck size={15} color="#92400e" style={{ flexShrink: 0, marginTop: 3 }} />
                      <div><strong>{t.disclaimer}:</strong> {flow.disclaimer[lang]}</div>
                    </div>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }} className="ai-btn-row">
                      {!emergency && (
                        <button style={{ ...s.smallPrimary, flex: 1 }} className="sym-btn-primary"
                          onClick={() => navigate("/DoctorBooking")}>
                          <FaUserMd size={12} /> {t.findDoctor}
                        </button>
                      )}
                      <button style={{ ...s.smallOutline, flex: emergency ? 1 : "none" }} className="sym-btn-outline"
                        onClick={startChat}>
                        <FaRedo size={10} /> {t.restart}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* ── Composer: current sawaal ke hisaab se ── */}
          {currentNode && (
            <div style={s.composer} className="chat-composer">
              {(currentNode.type === "single_select" || currentNode.type === "multi_select") && (
                <div style={{ ...s.chipRow, ...(isUr ? { direction: "rtl" } : {}) }}>
                  {currentNode.options.map((opt) => {
                    const multi = currentNode.type === "multi_select";
                    const active = multi && picked.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        onClick={() => (multi ? togglePick(opt) : chooseOption(opt))}
                        className={`chat-chip ${active ? "active" : ""}`}
                        style={{
                          ...s.chip,
                          ...(active ? s.chipActive : {}),
                          ...(isUr ? { fontFamily: URDU_FONT, lineHeight: 1.9 } : {}),
                        }}
                      >
                        {active && <FaCheck size={10} />}
                        {opt.label[lang]}
                      </button>
                    );
                  })}
                  {currentNode.type === "multi_select" && (
                    <button
                      style={{ ...s.smallPrimary, opacity: picked.length ? 1 : 0.5 }}
                      className="sym-btn-primary"
                      disabled={!picked.length}
                      onClick={submitPicked}
                    >
                      <span style={isUr ? { fontFamily: URDU_FONT } : {}}>{t.next}</span>
                      <FaArrowRight size={11} style={isUr ? { transform: "scaleX(-1)" } : {}} />
                    </button>
                  )}
                </div>
              )}

              {(currentNode.type === "freetext" || currentNode.allow_freetext) && (
                <div style={{ ...s.inputRow, ...(currentNode.type !== "freetext" ? { marginTop: 10 } : {}) }}>
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        submitText();
                      }
                    }}
                    placeholder={currentNode.type === "freetext" ? t.typeHere : t.orType}
                    rows={currentNode.type === "freetext" ? 2 : 1}
                    style={{ ...s.textarea, ...langStyle }}
                    className="sym-input"
                    dir={isUr ? "rtl" : "auto"}
                  />
                  <button
                    style={{ ...s.sendBtn, opacity: draft.trim() ? 1 : 0.5 }}
                    className="sym-btn-primary"
                    disabled={!draft.trim()}
                    onClick={() => submitText()}
                    aria-label={t.send}
                  >
                    <FaPaperPlane size={14} style={isUr ? { transform: "scaleX(-1)" } : {}} />
                  </button>
                  {currentNode.optional && (
                    <button style={s.smallOutline} className="sym-btn-outline" onClick={() => submitText(true)}>
                      <span style={isUr ? { fontFamily: URDU_FONT } : {}}>{t.skip}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Trust Indicators */}
        <div style={s.trustFooter}>
          <div style={s.trustItem}>
            <FaShieldAlt size={11} color={MINT_DARK} />
            <span>SSL Encrypted</span>
          </div>
          <div style={s.trustDivider} />
          <div style={s.trustItem}>
            <HiOutlineShieldCheck size={11} color={MINT_DARK} />
            <span>Medical Data Protected</span>
          </div>
          <div style={s.trustDivider} />
          <div style={s.trustItem}>
            <FaStethoscope size={11} color={MINT_DARK} />
            <span>Reviewed by Doctors</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// STYLES
// ══════════════════════════════════════════════════════════
const s = {
  root: {
    minHeight: "100vh",
    background: "#fafffe",
    fontFamily: "'Inter','Nunito','Segoe UI',sans-serif",
    color: TEXT_DARK,
  },
  container: { maxWidth: 820, margin: "0 auto", padding: "48px 24px 64px" },

  // Header
  header: { textAlign: "center", marginBottom: 28 },
  badge: {
    display: "inline-flex", alignItems: "center", gap: 7,
    background: "#fff", color: MINT_DARK,
    border: `1.5px solid ${MINT}`,
    padding: "6px 13px", borderRadius: 30,
    fontSize: 12, fontWeight: 700, marginBottom: 16,
    boxShadow: "0 2px 8px rgba(42,157,92,0.08)",
  },
  title: {
    fontSize: "clamp(22px, 3.5vw, 34px)", fontWeight: 800,
    color: TEXT_DARK, letterSpacing: "-0.8px",
    margin: "0 0 12px", lineHeight: 1.2,
  },
  sub: { fontSize: 15, color: TEXT_BODY, maxWidth: 520, margin: "0 auto", lineHeight: 1.6 },

  // Chat card
  chatCard: {
    background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 20,
    boxShadow: "0 8px 28px rgba(15,32,24,0.06)", overflow: "hidden",
  },
  topBar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    gap: 12, flexWrap: "wrap", padding: "14px 20px",
    borderBottom: `1px solid ${BORDER}`, background: MINT_LIGHT,
  },
  botId:     { display: "flex", alignItems: "center", gap: 10 },
  avatarLg: {
    width: 38, height: 38, borderRadius: "50%", background: MINT_DARK,
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 2px 8px rgba(26,110,63,0.3)",
  },
  botName:   { fontSize: 14.5, fontWeight: 800, color: TEXT_DARK },
  botStatus: { fontSize: 11.5, color: TEXT_MUTED, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 },
  onlineDot: { width: 7, height: 7, borderRadius: "50%", background: MINT, display: "inline-block" },
  topRight:  { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  progressTag: {
    background: "#fff", color: MINT_DARK, border: `1px solid ${MINT}`,
    borderRadius: 20, padding: "5px 12px", fontSize: 12, fontWeight: 800,
    display: "inline-flex", alignItems: "center", gap: 5,
  },
  restartBtn: {
    background: "#fff", color: MINT_DARK, border: `1.5px solid ${MINT}`,
    borderRadius: 20, padding: "5px 12px", fontWeight: 700, fontSize: 12,
    cursor: "pointer", fontFamily: "inherit",
    display: "inline-flex", alignItems: "center", gap: 6,
  },
  langRow: {
    display: "flex", gap: 6, flexWrap: "wrap", padding: "10px 20px",
    borderBottom: `1px solid ${BORDER}`,
  },
  langPill: {
    background: "#fff", border: `1.5px solid ${BORDER}`, borderRadius: 20,
    padding: "5px 12px", fontSize: 12.5, fontWeight: 700,
    cursor: "pointer", fontFamily: "inherit", color: TEXT_BODY,
    display: "inline-flex", alignItems: "center", gap: 5,
  },
  langPillActive: { background: MINT_LIGHT, border: `1.5px solid ${MINT_DARK}`, color: MINT_DARK },

  // Messages
  body: {
    height: "56vh", minHeight: 360, overflowY: "auto",
    padding: "20px 20px", background: "#fafffe",
    display: "flex", flexDirection: "column", gap: 12,
  },
  botRow:  { display: "flex", alignItems: "flex-end", gap: 8 },
  userRow: { display: "flex", justifyContent: "flex-end" },
  avatar: {
    width: 28, height: 28, borderRadius: "50%", background: MINT_DARK, flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  botBubble: {
    background: "#fff", border: `1px solid ${BORDER}`,
    borderRadius: "16px 16px 16px 4px", padding: "10px 14px",
    fontSize: 14, color: TEXT_DARK, lineHeight: 1.6, maxWidth: "75%",
    boxShadow: "0 2px 6px rgba(15,32,24,0.04)", whiteSpace: "pre-wrap",
  },
  userBubble: {
    background: MINT_DARK, color: "#fff",
    borderRadius: "16px 16px 4px 16px", padding: "10px 14px",
    fontSize: 14, lineHeight: 1.6, maxWidth: "75%", fontWeight: 600,
    boxShadow: "0 2px 8px rgba(26,110,63,0.25)", whiteSpace: "pre-wrap",
  },
  typingBubble: { display: "flex", gap: 6, alignItems: "center", padding: "14px 16px" },
  dot: { width: 8, height: 8, borderRadius: "50%", background: MINT_DARK },
  errorBubble: { background: "#FEF2F2", border: "1.5px solid #FCA5A5", color: "#7f1d1d" },

  // Composer
  composer: { borderTop: `1px solid ${BORDER}`, padding: "14px 20px", background: "#fff" },
  chipRow:  { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" },
  chip: {
    background: "#fff", border: `1.5px solid ${BORDER}`, borderRadius: 20,
    padding: "8px 14px", fontSize: 13, fontWeight: 700,
    cursor: "pointer", fontFamily: "inherit", color: TEXT_BODY,
    display: "inline-flex", alignItems: "center", gap: 6,
  },
  chipActive: { background: MINT_LIGHT, border: `1.5px solid ${MINT_DARK}`, color: MINT_DARK },
  inputRow: { display: "flex", gap: 8, alignItems: "flex-end" },
  textarea: {
    flex: 1, border: `1.5px solid ${BORDER}`, borderRadius: 12,
    padding: "10px 12px", fontSize: 14, fontFamily: "inherit",
    color: TEXT_DARK, resize: "none", outline: "none",
    background: "#fafffe", boxSizing: "border-box", lineHeight: 1.6,
  },
  sendBtn: {
    background: MINT_DARK, color: "#fff", border: "none", borderRadius: 12,
    width: 44, height: 44, cursor: "pointer", flexShrink: 0,
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 4px 14px rgba(26,110,63,0.3)",
  },
  smallPrimary: {
    background: MINT_DARK, color: "#fff", border: "none", borderRadius: 11,
    padding: "10px 18px", fontWeight: 700, fontSize: 13.5,
    cursor: "pointer", fontFamily: "inherit",
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
    boxShadow: "0 4px 14px rgba(26,110,63,0.3)",
  },
  smallOutline: {
    background: "#fff", color: MINT_DARK, border: `1.5px solid ${MINT}`,
    borderRadius: 11, padding: "9px 16px", fontWeight: 700, fontSize: 13.5,
    cursor: "pointer", fontFamily: "inherit",
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
  },

  // Result bubble
  resultWrap: { maxWidth: "85%", flex: 1, display: "flex", flexDirection: "column", gap: 10 },
  resultCard: {
    background: "#fff", border: `2px solid ${MINT_DARK}`, borderRadius: 16,
    padding: "16px 18px", boxShadow: "0 4px 16px rgba(26,110,63,0.1)",
  },
  resultHeader: {
    display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 800,
    color: MINT_DARK, marginBottom: 10,
  },
  diseaseRow: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    gap: 10, flexWrap: "wrap", marginBottom: 10,
  },
  diseaseName: { fontSize: 20, fontWeight: 800, color: TEXT_DARK, letterSpacing: "-0.3px" },
  confBadge: {
    background: MINT_LIGHT, color: MINT_DARK, borderRadius: 20,
    padding: "5px 12px", fontSize: 12.5, fontWeight: 800, whiteSpace: "nowrap",
  },
  confTrack: { height: 8, background: BORDER, borderRadius: 8, overflow: "hidden" },
  confFill:  { height: "100%", background: MINT, borderRadius: 8, transition: "width 0.6s ease" },
  confNote:  { fontSize: 12.5, color: "#92400e", fontWeight: 600, lineHeight: 1.6, margin: "8px 0 0" },
  emergencyCard: {
    background: "#dc2626", color: "#fff", borderRadius: 16,
    padding: "18px 20px", boxShadow: "0 8px 24px rgba(220,38,38,0.35)",
  },
  emergencyTitle: {
    display: "flex", alignItems: "center", gap: 10,
    fontSize: 18, fontWeight: 900, marginBottom: 8,
  },
  emergencyMsg:  { fontSize: 14, fontWeight: 600, lineHeight: 1.6, margin: "0 0 10px" },
  emergencyList: { margin: "0 0 14px", paddingInlineStart: 20, fontSize: 13, lineHeight: 1.7 },
  emergencyBtn: {
    background: "#fff", color: "#b91c1c", border: "none", borderRadius: 11,
    padding: "12px 22px", fontWeight: 800, fontSize: 14.5,
    cursor: "pointer", fontFamily: "inherit",
    display: "inline-flex", alignItems: "center", gap: 8,
  },
  fdaWarning: {
    background: "#FEF2F2", border: "1.5px solid #FCA5A5", borderLeft: "4px solid #dc2626",
    borderRadius: 12, padding: "12px 14px",
    display: "flex", gap: 10, alignItems: "flex-start",
    fontSize: 13.5, color: "#7f1d1d", lineHeight: 1.7,
  },
  treatCard: {
    background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "14px 16px",
  },
  treatTitle: {
    display: "flex", alignItems: "center", gap: 8,
    fontSize: 14, fontWeight: 800, color: TEXT_DARK, marginBottom: 6,
  },
  treatText: { fontSize: 13.5, color: TEXT_BODY, lineHeight: 1.7, margin: 0 },
  adviceBox: {
    background: MINT_LIGHT, border: `1px solid ${MINT}40`, borderRadius: 12,
    padding: "12px 14px",
    display: "flex", gap: 10, alignItems: "flex-start",
    fontSize: 13.5, color: TEXT_DARK, lineHeight: 1.7,
  },
  disclaimer: {
    background: "#FEF3C7", border: "1px solid #F59E0B30", borderLeft: "3px solid #F59E0B",
    borderRadius: 10, padding: "10px 12px", fontSize: 12.5,
    color: "#78350f", fontWeight: 500, lineHeight: 1.6,
    display: "flex", alignItems: "flex-start", gap: 10,
  },

  // Trust footer
  trustFooter: {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: 18, marginTop: 32, paddingTop: 24,
    borderTop: `1px solid ${BORDER}`, flexWrap: "wrap",
  },
  trustItem:    { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: TEXT_MUTED, fontWeight: 700 },
  trustDivider: { width: 1, height: 12, background: BORDER },
};

import { useState, useCallback } from "react";

const COLORS = {
  purple: { bg: "#1a1730", border: "#7F77DD", text: "#a89ff7", bright: "#7F77DD" },
  teal:   { bg: "#0f1e1a", border: "#1D9E75", text: "#4ecba0", bright: "#1D9E75" },
  blue:   { bg: "#0f1826", border: "#378ADD", text: "#6baee8", bright: "#378ADD" },
  amber:  { bg: "#1e1708", border: "#EF9F27", text: "#f0b84a", bright: "#EF9F27" },
  pink:   { bg: "#1e0f18", border: "#D4537E", text: "#e07aaa", bright: "#D4537E" },
  green:  { bg: "#0e1a0c", border: "#639922", text: "#85c93a", bright: "#639922" },
  gray:   { bg: "#161616", border: "#555", text: "#888", bright: "#888" },
};

const PHASES = [
  {
    id: 0, label: "Phase 1", color: "teal", pill: "Complete",
    title: "Planning & Architecture",
    sub: "Vision, tech stack, folder structure, system design.",
    tasks: [
      "Define core features: Intent Mode, Decision Memory, Visualizer, Monaco",
      "Design system architecture and data flow for all 4 features",
      "Choose MERN + Gemini API — document why each tool was picked",
      "Plan folder structure: client/ (Vite+React) and server/ (Express)",
      "Create implementation roadmap and learning guide",
    ],
    learn: {
      week: "Week 1",
      goal: "Understand the full system before writing a single line",
      concepts: ["System design thinking", "MERN architecture overview", "API vs SSE vs WebSocket trade-offs"],
      resources: ["Draw the 4 data flow diagrams on paper first", "Read Gemini streaming docs", "Understand why SSE beats WebSockets for one-way AI output"],
    }
  },
  {
    id: 1, label: "Phase 2", color: "purple", pill: "You are here",
    title: "Project Setup & Scaffold",
    sub: "Init both apps, wire dev environment, verify connection.",
    tasks: [
      "npm create vite@latest cognite-client --template react",
      "npm init in server/, install express mongoose dotenv cors nodemon",
      "Create .env: GEMINI_API_KEY, MONGO_URI, JWT_SECRET, PORT=5000",
      "Configure Vite proxy → Express :5000 (zero CORS issues in dev)",
      "Connect MongoDB Atlas in config/db.js using Mongoose",
      "Create base Mongoose models: User, Project, File, Decision",
      "Milestone: client renders, /api/health returns 200, DB connects ✓",
    ],
    learn: {
      week: "Week 2",
      goal: "Get both apps talking — don't build features until this milestone is solid",
      concepts: ["Vite proxy config", "Mongoose connect() pattern", "dotenv security (never commit .env)", "nodemon for auto-restart"],
      resources: ["Run require('dotenv').config() as the very first line of server.js", "MongoDB Atlas free tier — Shared cluster is enough", "Vite proxy docs: server.proxy in vite.config.js"],
    }
  },
  {
    id: 2, label: "Phase 3", color: "blue", pill: "Editor",
    title: "Monaco Editor Integration",
    sub: "Embed VS Code engine with tabs, themes, language detection.",
    tasks: [
      "npm install @monaco-editor/react in client/",
      "Render <Editor /> and capture instance in useRef via onMount callback",
      "Build languageDetect.js — map file extension to Monaco language ID",
      "Build TabBar.jsx with active tab state and unsaved dot indicator",
      "defineTheme() for a custom dark IDE aesthetic matching Cognite-AI",
      "Set up EditorContext: editorRef, activeFile, openFiles, decisions",
    ],
    learn: {
      week: "Week 3",
      goal: "Master the editor ref pattern — everything else in Phases 4 and 5 depends on it",
      concepts: ["useRef vs useState — editor is mutable, not state", "onMount callback to capture editor instance", "Monaco's editor model vs editor view", "EditorContext as the shared state hub"],
      resources: ["Monaco API docs: editor.IStandaloneCodeEditor", "The editorRef.current.getModel() gives you the file content", "EditorContext must expose editorRef (not editorRef.current) so updates propagate"],
    }
  },
  {
    id: 3, label: "Phase 4", color: "amber", pill: "AI Core",
    title: "AI Intent Mode — Ghost Writer",
    sub: "Floating command bar + Gemini SSE streaming into Monaco.",
    tasks: [
      "Build CommandBar.jsx — Cmd+K trigger, centered overlay, blur backdrop",
      "Write buildPrompt() in gemini.service.js with system role + code context",
      "POST /api/intent: set SSE headers, call generateContentStream()",
      "Loop: for await (chunk of result.stream) res.write('data: ...\\n\\n')",
      "Browser EventSource reads chunks, calls executeEdits() per token",
      "Send [DONE] sentinel and call es.close() to end stream cleanly",
      "Handle cancel (Escape key), network error, and empty response states",
    ],
    learn: {
      week: "Week 4",
      goal: "SSE streaming is the hardest concept — prototype Gemini in a standalone Node script before adding Express",
      concepts: ["SSE protocol: Content-Type: text/event-stream", "The double \\n\\n after each data: line is mandatory", "EventSource vs fetch for streaming", "Monaco executeEdits() for programmatic text insertion", "The [DONE] sentinel pattern for stream termination"],
      resources: ["Test: curl -N http://localhost:5000/api/intent to see raw SSE", "Gemini: model.generateContentStream() returns an async iterable", "Never use res.json() on an SSE endpoint — it closes the stream immediately"],
    }
  },
  {
    id: 4, label: "Phase 5", color: "pink", pill: "Memory",
    title: "Decision Memory — The Brain",
    sub: "Store AI rationale per line, render brain icons in Monaco margin.",
    tasks: [
      "After stream ends: 2nd Gemini call requesting JSON {lineNumber: reason}",
      "POST /api/decisions — save rationale records scoped to userId + fileId",
      "GET /api/decisions/:fileId — load on file open via useEffect([fileId])",
      "Monaco deltaDecorations to add brain icon CSS class per modified line",
      "Build RationalePopover.jsx positioned with getScrolledVisiblePosition()",
      "useLayoutEffect (not useEffect) to position popover after DOM paint",
      "Index Decision schema on {fileId: 1, userId: 1} for fast lookups",
    ],
    learn: {
      week: "Week 5",
      goal: "Learn the difference between useEffect and useLayoutEffect — popover positioning depends on it",
      concepts: ["Monaco glyph margin: glyphMarginClassName option in decorations", "useLayoutEffect runs synchronously after DOM updates", "Mongoose compound indexes for query performance", "Structured Gemini prompts: 'Return ONLY valid JSON, no markdown'"],
      resources: ["deltaDecorations takes an array of {range, options} objects", "getScrolledVisiblePosition returns {top, left} pixel coords for a line number", "Store the decoration IDs returned by deltaDecorations so you can remove them later"],
    }
  },
  {
    id: 5, label: "Phase 6", color: "pink", pill: "Visualizer",
    title: "Codebase Visualizer — The Map",
    sub: "AST scan all files, build import graph, render with React Flow.",
    tasks: [
      "npm install @babel/parser @babel/traverse in server/",
      "scanner.service.js: traverse AST for ImportDeclaration nodes per file",
      "Build graph.service.js: convert {from, to} pairs to {nodes[], edges[]}",
      "GET /api/visualize — walk project dir with fs.readdirSync, return graph JSON",
      "npm install reactflow in client/",
      "Render <ReactFlow nodes={} edges={} /> with auto layout",
      "Custom FileNode component + onNodeClick → open file in Monaco via EditorContext",
    ],
    learn: {
      week: "Week 6",
      goal: "Never use regex for import parsing — one multi-line import breaks it. Always use Babel AST",
      concepts: ["Babel AST: ImportDeclaration node gives source.value (the import path)", "@babel/traverse visitor pattern", "React Flow: nodes need {id, position, data}, edges need {id, source, target}", "nodeTypes map: register custom components before passing to ReactFlow"],
      resources: ["@babel/parser plugins: ['jsx', 'typescript'] to handle all file types", "React Flow: useNodesState and useEdgesState for managed state", "Color nodes by file type: component=purple, util=teal, model=amber, route=green"],
    }
  },
  {
    id: 6, label: "Phase 7", color: "green", pill: "Auth",
    title: "Auth + Security",
    sub: "JWT auth, user-scoped data, Gemini rate limiting.",
    tasks: [
      "POST /api/auth/register — hash password with bcrypt.hash(pw, 12)",
      "POST /api/auth/login — bcrypt.compare() then jwt.sign() with 7d expiry",
      "auth.middleware.js — verify JWT from Authorization header, attach req.user.id",
      "Scope ALL Decision + File queries: .find({ userId: req.user.id })",
      "express-rate-limit on /api/intent: 10 requests / 60s per IP",
      "useAuth hook in client: stores JWT in memory (not localStorage)",
      "Protected route wrapper in React Router v6 using <Navigate />",
    ],
    learn: {
      week: "Week 7",
      goal: "Understand the middleware chain — auth.middleware.js either calls next() or short-circuits with 401",
      concepts: ["bcrypt salt rounds: 10–12 is the sweet spot (more = slower)", "JWT payload: only put userId and role — never put passwords", "Express middleware order: cors → json → auth → routes", "Rate limiting: windowMs + max options", "React: store JWT in state not localStorage (XSS safer)"],
      resources: ["Middleware pattern: (req, res, next) => { verify → attach → next() }", "JWT expiry: use '7d' string shorthand in jwt.sign()", "Test protected routes with Postman: add Authorization: Bearer <token> header"],
    }
  },
  {
    id: 7, label: "Phase 8", color: "gray", pill: "Deploy",
    title: "Polish + Deploy",
    sub: "Error boundaries, loading states, ship to production.",
    tasks: [
      "React error boundaries around editor, visualizer, and command bar",
      "Loading skeleton components for file open, decisions load, graph load",
      "Empty states for new users: no files, no decisions, no graph yet",
      "Audit all env vars — nothing hardcoded, production vars set in dashboard",
      "Deploy server to Render: set env vars, verify /api/health returns 200",
      "Deploy client to Vercel: set VITE_API_URL to the live Render URL",
      "Full end-to-end test on a real device before calling it done",
    ],
    learn: {
      week: "Week 8",
      goal: "Ship Monday. Spend the rest of the week observing real usage and fixing rough edges",
      concepts: ["Error boundaries: class component with componentDidCatch + getDerivedStateFromError", "Skeleton screens beat spinners — they reduce perceived loading time", "Render free tier: server sleeps after 15 min inactivity (add /api/health ping)"],
      resources: ["Vercel: set VITE_API_URL in Project Settings → Environment Variables", "Render: add all .env keys in Environment tab before first deploy", "Write README first — it forces you to explain the setup clearly"],
    }
  },
];

const FLOWS = [
  {
    id: 0, label: "Ghost Writer (SSE)", color: "#7F77DD",
    desc: "Command Bar POSTs {intent, code, language} → /api/intent sets SSE headers → calls Gemini's generateContentStream() → each token chunk is written as data: {...}\\n\\n → browser EventSource fires onmessage per chunk → injected into Monaco via executeEdits() in real-time.",
    steps: [
      { from: "Command Bar", to: "/api/intent", label: "POST {intent, code}", color: "#7F77DD" },
      { from: "/api/intent", to: "Gemini API", label: "generateContentStream()", color: "#7F77DD" },
      { from: "Gemini API", to: "/api/intent", label: "token chunks", color: "#7F77DD", dashed: true },
      { from: "/api/intent", to: "Monaco Editor", label: "SSE data: events", color: "#7F77DD", dashed: true },
    ]
  },
  {
    id: 1, label: "Decision Memory", color: "#1D9E75",
    desc: "After stream ends → 2nd Gemini call returns {lineNumber: reason} JSON → POSTed to /api/decisions → saved in MongoDB scoped to userId+fileId. On file open → GET /api/decisions/:fileId → Monaco glyph margin decoration per line → brain icon appears.",
    steps: [
      { from: "Monaco Editor", to: "/api/decisions", label: "POST rationale JSON", color: "#1D9E75" },
      { from: "/api/decisions", to: "MongoDB Atlas", label: "save Decision doc", color: "#1D9E75" },
      { from: "MongoDB Atlas", to: "/api/decisions", label: "decisions array", color: "#1D9E75", dashed: true },
      { from: "/api/decisions", to: "Glyph Margin", label: "deltaDecorations()", color: "#1D9E75", dashed: true },
    ]
  },
  {
    id: 2, label: "Codebase Visualizer", color: "#EF9F27",
    desc: "React Flow triggers GET /api/visualize → Express walks project dir with fs.readdirSync() → each file parsed with @babel/traverse to extract ImportDeclaration nodes → builds {nodes[], edges[]} → returned as JSON → React Flow renders interactive dependency map.",
    steps: [
      { from: "React Flow", to: "/api/visualize", label: "GET request", color: "#EF9F27" },
      { from: "/api/visualize", to: "Node fs + Babel", label: "scan project dir", color: "#EF9F27" },
      { from: "Node fs + Babel", to: "/api/visualize", label: "{nodes[], edges[]}", color: "#EF9F27", dashed: true },
      { from: "/api/visualize", to: "React Flow", label: "render graph", color: "#EF9F27", dashed: true },
    ]
  },
  {
    id: 3, label: "Auth Flow", color: "#888780",
    desc: "Login form POSTs credentials → bcrypt.compare() verifies hash → jwt.sign() issues token → stored in React state → every request sends Authorization: Bearer <token> → auth.middleware.js calls jwt.verify() → attaches req.user.id → all queries scoped to that user.",
    steps: [
      { from: "Login Form", to: "/api/auth/login", label: "POST credentials", color: "#888" },
      { from: "/api/auth/login", to: "MongoDB Atlas", label: "bcrypt.compare()", color: "#888" },
      { from: "MongoDB Atlas", to: "/api/auth/login", label: "user found", color: "#888", dashed: true },
      { from: "/api/auth/login", to: "React State", label: "JWT returned", color: "#888", dashed: true },
    ]
  },
];

export default function App() {
  const [tab, setTab] = useState("arch");
  const [activeFlow, setActiveFlow] = useState(0);
  const [checked, setChecked] = useState({});
  const [openPhases, setOpenPhases] = useState({ 0: true, 1: true });
  const [learnPhase, setLearnPhase] = useState(0);

  const toggle = useCallback((pi, ti) => {
    const k = `${pi}-${ti}`;
    setChecked(c => ({ ...c, [k]: !c[k] }));
  }, []);

  const togglePhase = (pi) => setOpenPhases(o => ({ ...o, [pi]: !o[pi] }));

  const totalTasks = PHASES.reduce((a, p) => a + p.tasks.length, 0);
  const doneTasks = Object.values(checked).filter(Boolean).length;
  const pct = Math.round((doneTasks / totalTasks) * 100);

  const currentPhase = PHASES.find(p =>
    p.tasks.some((_, ti) => !checked[`${p.id}-${ti}`])
  ) || PHASES[PHASES.length - 1];

  const flow = FLOWS[activeFlow];

  const tabs = [
    { id: "arch", label: "Architecture" },
    { id: "roadmap", label: "Roadmap" },
    { id: "learn", label: "Learning Guide" },
  ];

  return (
    <div style={{ background: "#0d0d0f", minHeight: "100vh", fontFamily: "'JetBrains Mono', 'Fira Code', monospace", color: "#ccc", padding: "0" }}>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #1e1e2e", padding: "20px 24px 0", background: "#0d0d0f" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#7F77DD" }} />
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2, color: "#7F77DD", textTransform: "uppercase" }}>Cognite-AI</span>
          <span style={{ fontSize: 11, color: "#444", marginLeft: 4 }}>// dev guide</span>
        </div>
        <div style={{ display: "flex", gap: 0 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "8px 20px", border: "none", background: "transparent", cursor: "pointer",
              fontSize: 12, fontFamily: "inherit", fontWeight: 500, letterSpacing: 1,
              color: tab === t.id ? "#7F77DD" : "#555",
              borderBottom: tab === t.id ? "2px solid #7F77DD" : "2px solid transparent",
              transition: "all .15s"
            }}>{t.label.toUpperCase()}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: 24 }}>

        {/* ══════════ ARCHITECTURE TAB ══════════ */}
        {tab === "arch" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, color: "#555", marginBottom: 12, letterSpacing: 1 }}>// SELECT A DATA FLOW TO TRACE</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {FLOWS.map((f, i) => (
                  <button key={i} onClick={() => setActiveFlow(i)} style={{
                    padding: "6px 14px", border: `1.5px solid ${i === activeFlow ? f.color : "#333"}`,
                    borderRadius: 4, background: i === activeFlow ? f.color + "22" : "transparent",
                    color: i === activeFlow ? f.color : "#555",
                    fontSize: 11, fontFamily: "inherit", fontWeight: 600, letterSpacing: 0.5,
                    cursor: "pointer", transition: "all .15s"
                  }}>{f.label}</button>
                ))}
              </div>
            </div>

            {/* Architecture swimlanes */}
            <div style={{ background: "#111", border: "1px solid #1e1e2e", borderRadius: 8, padding: 20, marginBottom: 16, overflowX: "auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0, minWidth: 560 }}>
                {[
                  { label: "CLIENT (React)", color: "#7F77DD", boxes: [
                    { name: "Command Bar", sub: "Intent input · SSE consumer", flow: 0 },
                    { name: "Monaco Editor", sub: "Glyph margin · brain icons", flow: 1 },
                    { name: "React Flow", sub: "Node graph canvas", flow: 2 },
                    { name: "Auth + Context", sub: "JWT · protected routes", flow: 3 },
                  ]},
                  { label: "SERVER (Express)", color: "#888", boxes: [
                    { name: "/api/intent", sub: "SSE headers · Gemini pipe", flow: 0 },
                    { name: "/api/decisions", sub: "Save · load rationale", flow: 1 },
                    { name: "/api/visualize", sub: "AST scan · graph builder", flow: 2 },
                    { name: "/api/auth", sub: "bcrypt · JWT sign", flow: 3 },
                  ]},
                  { label: "EXTERNAL", color: "#1D9E75", boxes: [
                    { name: "Gemini API", sub: "generateContentStream()", flow: 0 },
                    { name: "MongoDB Atlas", sub: "Users · Files · Decisions", flow: 1 },
                    { name: "Node fs + Babel", sub: "Import/export AST", flow: 2 },
                    { name: "MongoDB Atlas", sub: "bcrypt verify + store", flow: 3 },
                  ]},
                ].map((col, ci) => (
                  <div key={ci} style={{ padding: "0 8px" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: col.color, letterSpacing: 1.5, marginBottom: 12, borderBottom: `1px solid ${col.color}44`, paddingBottom: 6 }}>
                      {col.label}
                    </div>
                    {col.boxes.map((box, bi) => {
                      const isActive = box.flow === activeFlow;
                      const fc = FLOWS[box.flow].color;
                      return (
                        <div key={bi} onClick={() => setActiveFlow(box.flow)} style={{
                          padding: "8px 10px", marginBottom: 8, borderRadius: 6, cursor: "pointer",
                          border: `1px solid ${isActive ? fc : "#222"}`,
                          background: isActive ? fc + "18" : "#0d0d0f",
                          opacity: isActive ? 1 : 0.35,
                          transition: "all .2s"
                        }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: isActive ? fc : "#666", marginBottom: 2 }}>{box.name}</div>
                          <div style={{ fontSize: 10, color: "#444" }}>{box.sub}</div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Flow arrows */}
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #1e1e2e" }}>
                <div style={{ fontSize: 10, color: "#444", letterSpacing: 1, marginBottom: 10 }}>// DATA FLOW: {flow.label.toUpperCase()}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                  {flow.steps.map((step, i) => (
                    <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ padding: "3px 8px", borderRadius: 3, border: `1px solid ${step.color}`, color: step.color, fontSize: 10, fontWeight: 600 }}>{step.from}</span>
                      <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                        <span style={{ fontSize: 9, color: step.color + "99" }}>{step.label}</span>
                        <span style={{ color: step.color, fontSize: 14, borderBottom: step.dashed ? `1px dashed ${step.color}` : "none" }}>→</span>
                      </span>
                      {i === flow.steps.length - 1 && (
                        <span style={{ padding: "3px 8px", borderRadius: 3, border: `1px solid ${step.color}`, color: step.color, fontSize: 10, fontWeight: 600 }}>{step.to}</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={{ background: "#111", border: `1px solid ${flow.color}44`, borderLeft: `3px solid ${flow.color}`, borderRadius: 6, padding: "12px 16px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: flow.color, letterSpacing: 1, marginBottom: 6 }}>// HOW IT WORKS</div>
              <p style={{ fontSize: 12, color: "#aaa", lineHeight: 1.8, margin: 0 }}>{flow.desc}</p>
            </div>

            {/* Legend */}
            <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
              {[{ label: "→ solid = request/call", color: "#555" }, { label: "→ dashed = response/stream back", color: "#555" }].map((l, i) => (
                <span key={i} style={{ fontSize: 10, color: "#444", letterSpacing: 0.5 }}>{l.label}</span>
              ))}
            </div>
          </div>
        )}

        {/* ══════════ ROADMAP TAB ══════════ */}
        {tab === "roadmap" && (
          <div>
            {/* Overall progress */}
            <div style={{ background: "#111", border: "1px solid #1e1e2e", borderRadius: 8, padding: 16, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: "#555", letterSpacing: 1 }}>// OVERALL PROGRESS</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#7F77DD" }}>{pct}%</span>
              </div>
              <div style={{ height: 4, background: "#1e1e2e", borderRadius: 2, overflow: "hidden", marginBottom: 10 }}>
                <div style={{ height: "100%", width: `${pct}%`, background: "#7F77DD", borderRadius: 2, transition: "width .5s" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "#444" }}>{doneTasks}/{totalTasks} tasks complete</span>
                <span style={{ fontSize: 10, padding: "2px 8px", background: COLORS[currentPhase.color].bg, border: `1px solid ${COLORS[currentPhase.color].border}`, borderRadius: 10, color: COLORS[currentPhase.color].text }}>
                  ▶ {currentPhase.label}
                </span>
              </div>
            </div>

            {/* Phases */}
            {PHASES.map((phase, pi) => {
              const c = COLORS[phase.color];
              const phaseDone = phase.tasks.filter((_, ti) => checked[`${pi}-${ti}`]).length;
              const phasePct = Math.round((phaseDone / phase.tasks.length) * 100);
              const isOpen = openPhases[pi];

              return (
                <div key={pi} style={{ display: "grid", gridTemplateColumns: "32px 1fr", gap: "0 12px", marginBottom: 4 }}>
                  {/* Timeline */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%", border: `2px solid ${c.border}`,
                      background: phaseDone === phase.tasks.length ? c.border : c.bg,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 700, color: phaseDone === phase.tasks.length ? "#0d0d0f" : c.text,
                      flexShrink: 0
                    }}>
                      {phaseDone === phase.tasks.length ? "✓" : pi + 1}
                    </div>
                    {pi < PHASES.length - 1 && (
                      <div style={{ width: 1, flex: 1, minHeight: 12, background: phaseDone === phase.tasks.length ? c.border + "60" : "#222" }} />
                    )}
                  </div>

                  {/* Card */}
                  <div style={{ marginBottom: 10 }}>
                    <div style={{
                      background: "#111", border: `1px solid #1e1e2e`,
                      borderLeft: `3px solid ${c.border}`, borderRadius: 8, overflow: "hidden"
                    }}>
                      <div onClick={() => togglePhase(pi)} style={{ padding: "12px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 10, color: c.text, fontWeight: 700, letterSpacing: 1 }}>{phase.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#ddd", flex: 1 }}>{phase.title}</span>
                        <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 10, background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>{phase.pill}</span>
                        <span style={{ fontSize: 10, color: "#444", transform: isOpen ? "rotate(90deg)" : "none", transition: "transform .2s", display: "inline-block" }}>▶</span>
                      </div>

                      {/* Mini progress bar */}
                      <div style={{ height: 2, background: "#1e1e2e" }}>
                        <div style={{ height: "100%", width: `${phasePct}%`, background: c.border, transition: "width .35s" }} />
                      </div>

                      {isOpen && (
                        <div style={{ padding: "10px 14px 14px" }}>
                          <p style={{ fontSize: 11, color: "#555", marginBottom: 10 }}>{phase.sub}</p>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {phase.tasks.map((task, ti) => {
                              const k = `${pi}-${ti}`;
                              const done = !!checked[k];
                              return (
                                <div key={ti} onClick={() => toggle(pi, ti)} style={{
                                  display: "flex", alignItems: "flex-start", gap: 8,
                                  padding: "5px 6px", borderRadius: 5, cursor: "pointer",
                                  background: done ? c.bg : "transparent",
                                  transition: "background .15s"
                                }}>
                                  <div style={{
                                    width: 15, height: 15, borderRadius: 3, flexShrink: 0, marginTop: 1,
                                    border: `1.5px solid ${done ? c.border : "#333"}`,
                                    background: done ? c.border : "transparent",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 9, color: "#0d0d0f", fontWeight: 700,
                                    transition: "all .15s"
                                  }}>{done ? "✓" : ""}</div>
                                  <span style={{
                                    fontSize: 11, lineHeight: 1.6,
                                    color: done ? "#444" : "#aaa",
                                    textDecoration: done ? "line-through" : "none",
                                    transition: "all .15s"
                                  }}>{task}</span>
                                </div>
                              );
                            })}
                          </div>
                          <div style={{ marginTop: 10, fontSize: 10, color: "#444" }}>
                            {phaseDone}/{phase.tasks.length} tasks — {phasePct}%
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══════════ LEARNING GUIDE TAB ══════════ */}
        {tab === "learn" && (
          <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 20 }}>
            {/* Phase selector */}
            <div>
              <div style={{ fontSize: 10, color: "#444", letterSpacing: 1, marginBottom: 10 }}>// SELECT PHASE</div>
              {PHASES.map((p, i) => {
                const c = COLORS[p.color];
                const active = learnPhase === i;
                return (
                  <div key={i} onClick={() => setLearnPhase(i)} style={{
                    padding: "8px 12px", borderRadius: 6, cursor: "pointer", marginBottom: 4,
                    border: `1px solid ${active ? c.border : "#1e1e2e"}`,
                    background: active ? c.bg : "transparent",
                    transition: "all .15s"
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: active ? c.text : "#444", letterSpacing: 0.5 }}>{p.label} · {p.learn.week}</div>
                    <div style={{ fontSize: 11, color: active ? "#ccc" : "#555", marginTop: 2 }}>{p.title}</div>
                  </div>
                );
              })}
            </div>

            {/* Learn content */}
            {(() => {
              const p = PHASES[learnPhase];
              const c = COLORS[p.color];
              return (
                <div>
                  <div style={{ background: "#111", border: `1px solid ${c.border}44`, borderLeft: `3px solid ${c.border}`, borderRadius: 8, padding: "16px 20px", marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: c.text, letterSpacing: 1 }}>{p.label.toUpperCase()} · {p.learn.week.toUpperCase()}</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "#eee", marginTop: 4 }}>{p.title}</div>
                      </div>
                      <div style={{ padding: "3px 10px", background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10, fontSize: 10, color: c.text, fontWeight: 600 }}>{p.pill}</div>
                    </div>
                    <div style={{ fontSize: 11, color: "#555", fontStyle: "italic", lineHeight: 1.6, borderTop: "1px solid #1e1e2e", paddingTop: 10, marginTop: 6 }}>
                      🎯 <span style={{ color: "#aaa" }}><strong>Week goal:</strong> {p.learn.goal}</span>
                    </div>
                  </div>

                  {/* Concepts */}
                  <div style={{ background: "#111", border: "1px solid #1e1e2e", borderRadius: 8, padding: "14px 18px", marginBottom: 12 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#7F77DD", letterSpacing: 1, marginBottom: 12 }}>// CONCEPTS TO MASTER</div>
                    {p.learn.concepts.map((concept, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                        <span style={{ color: c.text, fontSize: 12, flexShrink: 0, marginTop: 1 }}>◆</span>
                        <span style={{ fontSize: 12, color: "#ccc", lineHeight: 1.6 }}>{concept}</span>
                      </div>
                    ))}
                  </div>

                  {/* Practical notes */}
                  <div style={{ background: "#111", border: "1px solid #1e1e2e", borderRadius: 8, padding: "14px 18px", marginBottom: 12 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#1D9E75", letterSpacing: 1, marginBottom: 12 }}>// PRACTICAL NOTES</div>
                    {p.learn.resources.map((r, i) => (
                      <div key={i} style={{
                        background: "#0d0d0f", border: "1px solid #1e1e2e", borderRadius: 5,
                        padding: "8px 12px", marginBottom: 8, fontFamily: "'JetBrains Mono', monospace"
                      }}>
                        <span style={{ color: "#555", fontSize: 11 }}>$ </span>
                        <span style={{ fontSize: 11, color: "#aaa", lineHeight: 1.7 }}>{r}</span>
                      </div>
                    ))}
                  </div>

                  {/* Tasks checklist */}
                  <div style={{ background: "#111", border: "1px solid #1e1e2e", borderRadius: 8, padding: "14px 18px" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#EF9F27", letterSpacing: 1, marginBottom: 12 }}>// TASKS FOR THIS PHASE</div>
                    {p.tasks.map((task, ti) => {
                      const k = `${learnPhase}-${ti}`;
                      const done = !!checked[k];
                      return (
                        <div key={ti} onClick={() => toggle(learnPhase, ti)} style={{
                          display: "flex", gap: 8, alignItems: "flex-start",
                          padding: "5px 6px", borderRadius: 5, cursor: "pointer", marginBottom: 4,
                          background: done ? c.bg : "transparent", transition: "background .15s"
                        }}>
                          <div style={{
                            width: 14, height: 14, borderRadius: 3, flexShrink: 0, marginTop: 2,
                            border: `1.5px solid ${done ? c.border : "#333"}`,
                            background: done ? c.border : "transparent",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 9, color: "#0d0d0f", fontWeight: 700, transition: "all .15s"
                          }}>{done ? "✓" : ""}</div>
                          <span style={{ fontSize: 11, color: done ? "#444" : "#aaa", textDecoration: done ? "line-through" : "none", lineHeight: 1.6 }}>{task}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Nav buttons */}
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
                    <button onClick={() => setLearnPhase(i => Math.max(0, i - 1))} disabled={learnPhase === 0} style={{
                      padding: "6px 14px", background: "transparent", border: "1px solid #333",
                      borderRadius: 5, color: learnPhase === 0 ? "#333" : "#aaa",
                      fontSize: 11, fontFamily: "inherit", cursor: learnPhase === 0 ? "default" : "pointer"
                    }}>← Previous</button>
                    <button onClick={() => setLearnPhase(i => Math.min(PHASES.length - 1, i + 1))} disabled={learnPhase === PHASES.length - 1} style={{
                      padding: "6px 14px", background: "transparent", border: `1px solid ${c.border}`,
                      borderRadius: 5, color: c.text, fontSize: 11, fontFamily: "inherit",
                      cursor: learnPhase === PHASES.length - 1 ? "default" : "pointer"
                    }}>Next →</button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

      </div>
    </div>
  );
}
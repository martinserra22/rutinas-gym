import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./lib/supabase";
import { ALL_BLOCKS, PRE, WEEKS } from "./data/rutina";

/* ============ ESTILOS ============ */

const C = {
  bg: "#0F1216", card: "#191E26", card2: "#20262F", line: "#2A3140",
  text: "#EDEAE1", dim: "#8B94A5", hi: "#5CD8F7", hiDark: "#0B2830",
  ink: "#A9BAFF", ok: "#72E3A6", warn: "#F2C46B", err: "#F27E7E",
};

const S = {
  app: {
    minHeight: "100vh", background: C.bg, color: C.text,
    fontFamily: "'Inter', system-ui, sans-serif", fontSize: 15,
    maxWidth: 520, margin: "0 auto",
    paddingTop: "env(safe-area-inset-top)",
    paddingBottom: "calc(40px + env(safe-area-inset-bottom))",
  },
  display: { fontFamily: "'Archivo Black', sans-serif", letterSpacing: "0.5px" },
  hand: { fontFamily: "'Caveat', cursive", color: C.ink },
  hiTag: {
    display: "inline-block", background: C.hi, color: "#08222B",
    padding: "2px 10px", transform: "skewX(-8deg)",
    fontFamily: "'Archivo Black', sans-serif", fontSize: 13, letterSpacing: 1,
  },
  card: {
    background: C.card, border: `1px solid ${C.line}`, borderRadius: 14,
    padding: 14, marginBottom: 10,
  },
  btn: {
    background: C.card2, color: C.text, border: `1px solid ${C.line}`,
    borderRadius: 10, padding: "10px 14px", fontSize: 14, fontWeight: 600,
    cursor: "pointer",
  },
  input: {
    width: "100%", background: C.bg, border: `1px solid ${C.line}`,
    borderRadius: 10, color: C.text, padding: "12px", fontSize: 15,
  },
};

/* ============ LOGIN ============ */

function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const enter = async (mode) => {
    if (!email || !pass) { setMsg("Completá email y contraseña."); return; }
    setBusy(true); setMsg("");
    const fn = mode === "up"
      ? supabase.auth.signUp({ email, password: pass })
      : supabase.auth.signInWithPassword({ email, password: pass });
    const { error } = await fn;
    if (error) setMsg(error.message);
    else if (mode === "up") setMsg("Cuenta creada. Si Supabase pide confirmación, revisá tu correo.");
    setBusy(false);
  };

  return (
    <div style={{ ...S.app, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 340 }}>
        <span style={S.hiTag}>PROGRAMA W2</span>
        <h1 style={{ ...S.display, fontSize: 26, margin: "10px 0 4px" }}>RUTINAS GYM</h1>
        <p style={{ color: C.dim, fontSize: 13, marginBottom: 20 }}>
          Iniciá sesión para ver tu rutina y registrar tus series.
        </p>
        <input style={{ ...S.input, marginBottom: 8 }} type="email" placeholder="Email"
          value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        <input style={{ ...S.input, marginBottom: 12 }} type="password" placeholder="Contraseña"
          value={pass} onChange={(e) => setPass(e.target.value)} autoComplete="current-password" />
        <button disabled={busy} onClick={() => enter("in")}
          style={{ ...S.btn, width: "100%", background: C.hi, color: "#08222B", fontWeight: 800, marginBottom: 8 }}>
          {busy ? "Un momento…" : "Entrar"}
        </button>
        <button disabled={busy} onClick={() => enter("up")} style={{ ...S.btn, width: "100%" }}>
          Crear cuenta
        </button>
        {msg && <p style={{ color: C.warn, fontSize: 13, marginTop: 12 }}>{msg}</p>}
      </div>
    </div>
  );
}

/* ============ DATOS ============ */

function useDB(user) {
  const [db, setDb] = useState(null);
  const [saved, setSaved] = useState(true);
  const timers = useRef(new Map());

  // Carga inicial: estado + planilla + registros
  useEffect(() => {
    if (!user) return;
    (async () => {
      const [est, plan, regs] = await Promise.all([
        supabase.from("estado").select("semana_actual").maybeSingle(),
        supabase.from("planilla").select("dia, semana, ejercicio, valor"),
        supabase.from("registros_serie").select("dia, semana, ejercicio, orden, kg, reps, hecho, updated_at"),
      ]);

      const grid = {};
      for (const row of plan.data ?? []) {
        grid[row.dia] ??= {}; grid[row.dia][row.ejercicio] ??= {};
        grid[row.dia][row.ejercicio][row.semana - 1] = row.valor ?? "";
      }

      const sessions = {};
      let last = null;
      for (const r of regs.data ?? []) {
        const key = `${r.dia}|${r.semana}`;
        sessions[key] ??= {}; sessions[key][r.ejercicio] ??= [];
        sessions[key][r.ejercicio][r.orden] = { kg: r.kg ?? "", reps: r.reps ?? "", hecho: r.hecho };
        if (r.hecho && (!last || r.updated_at > last.fecha)) {
          last = { dia: r.dia, semana: r.semana, fecha: r.updated_at };
        }
      }

      setDb({ week: est.data?.semana_actual ?? 1, grid, sessions, last });
    })();
  }, [user]);

  // Escritura debounced por clave lógica (una serie, una celda, el estado)
  const queue = useCallback((key, fn) => {
    setSaved(false);
    const t = timers.current;
    if (t.has(key)) clearTimeout(t.get(key));
    t.set(key, setTimeout(async () => {
      t.delete(key);
      try { await fn(); } catch (e) { console.error("Error guardando", key, e); }
      if (t.size === 0) setSaved(true);
    }, 600));
  }, []);

  const setWeek = (week) => {
    setDb((d) => ({ ...d, week }));
    queue("estado", () =>
      supabase.from("estado").upsert(
        { user_id: user.id, semana_actual: week },
        { onConflict: "user_id" }
      ));
  };

  const setCell = (dia, ejercicio, semanaIdx, valor) => {
    setDb((d) => {
      const grid = structuredClone(d.grid);
      grid[dia] ??= {}; grid[dia][ejercicio] ??= {};
      grid[dia][ejercicio][semanaIdx] = valor;
      return { ...d, grid };
    });
    queue(`cell|${dia}|${ejercicio}|${semanaIdx}`, () =>
      supabase.from("planilla").upsert(
        { user_id: user.id, dia, ejercicio, semana: semanaIdx + 1, valor },
        { onConflict: "user_id,dia,semana,ejercicio" }
      ));
  };

  const setSerie = (dia, semana, ejercicio, orden, set) => {
    setDb((d) => {
      const sessions = structuredClone(d.sessions);
      const key = `${dia}|${semana}`;
      sessions[key] ??= {}; sessions[key][ejercicio] ??= [];
      sessions[key][ejercicio][orden] = set;
      const last = set.hecho
        ? { dia, semana, fecha: new Date().toISOString() }
        : d.last;
      return { ...d, sessions, last };
    });
    queue(`serie|${dia}|${semana}|${ejercicio}|${orden}`, () =>
      supabase.from("registros_serie").upsert(
        { user_id: user.id, dia, semana, ejercicio, orden, kg: set.kg, reps: set.reps, hecho: set.hecho },
        { onConflict: "user_id,dia,semana,ejercicio,orden" }
      ));
  };

  return { db, saved, setWeek, setCell, setSerie };
}

const gridVal = (db, dayId, exIdx, w) => {
  const ov = db.grid?.[dayId]?.[exIdx]?.[w];
  if (ov !== undefined) return ov;
  return PRE[dayId]?.[exIdx]?.[w] ?? "";
};

const fmtFecha = (iso) => {
  const f = new Date(iso);
  return f.toLocaleDateString("es-UY", { weekday: "long", day: "numeric", month: "numeric" });
};

const dayName = (id) => {
  const b = ALL_BLOCKS.find((d) => d.id === id);
  return b?.num ? `Día ${b.num}` : (b?.title ?? id);
};

/* ============ HOME ============ */

function Header({ db, setWeek, saved }) {
  return (
    <div style={{ padding: "18px 16px 8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <span style={S.hiTag}>PROGRAMA W2</span>
          <h1 style={{ ...S.display, fontSize: 26, margin: "8px 0 2px" }}>MARTÍN SERRA</h1>
          <div style={{ color: C.dim, fontSize: 12 }}>Inicio 13/1/26 · 8 semanas</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: C.dim, fontSize: 11, marginBottom: 4 }}>SEMANA ACTUAL</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
            <button aria-label="Semana anterior" style={{ ...S.btn, padding: "6px 12px" }}
              onClick={() => setWeek(Math.max(1, db.week - 1))}>−</button>
            <span style={{ ...S.display, fontSize: 24, color: C.hi, minWidth: 26, textAlign: "center" }}>{db.week}</span>
            <button aria-label="Semana siguiente" style={{ ...S.btn, padding: "6px 12px" }}
              onClick={() => setWeek(Math.min(WEEKS, db.week + 1))}>+</button>
          </div>
        </div>
      </div>
      <div style={{ fontSize: 11, color: saved ? C.ok : C.warn, marginTop: 6 }}>
        {saved ? "✓ Sincronizado" : "Guardando…"}
      </div>
    </div>
  );
}

function Home({ db, setWeek, saved, openDay }) {
  const sessionCount = (dayId) => {
    const s = db.sessions?.[`${dayId}|${db.week}`];
    if (!s) return 0;
    return Object.values(s).flat().filter((x) => x && x.hecho).length;
  };
  return (
    <div style={S.app}>
      <Header db={db} setWeek={setWeek} saved={saved} />
      <div style={{ padding: "4px 16px" }}>
        {db.last && (
          <div style={{ ...S.card, background: C.hiDark, borderColor: C.hi + "44", display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: 22 }}>🏋️</span>
            <div>
              <div style={{ fontSize: 11, color: C.hi, fontWeight: 800, letterSpacing: 1 }}>ÚLTIMO ENTRENAMIENTO</div>
              <div style={{ fontWeight: 800, marginTop: 2 }}>
                {dayName(db.last.dia)} · Semana {db.last.semana}
              </div>
              <div style={{ color: C.dim, fontSize: 12.5, textTransform: "capitalize" }}>{fmtFecha(db.last.fecha)}</div>
            </div>
          </div>
        )}
        {ALL_BLOCKS.map((day) => (
          <button key={day.id} onClick={() => openDay(day.id)}
            style={{ ...S.card, width: "100%", textAlign: "left", cursor: "pointer", color: C.text, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              ...S.display, fontSize: day.num ? 22 : 16, color: C.hi, width: 52, height: 52,
              background: C.hiDark, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              {day.num ? `D${day.num}` : "ABS"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 16 }}>{day.title || `Día ${day.num}`}</div>
              <div style={{ color: C.dim, fontSize: 12.5, marginTop: 2 }}>{day.focus}</div>
              <div style={{ color: C.dim, fontSize: 11.5, marginTop: 3 }}>
                {day.ex.length} ejercicios
                {sessionCount(day.id) > 0 && (
                  <span style={{ color: C.ok }}> · {sessionCount(day.id)} series hechas esta semana</span>
                )}
              </div>
            </div>
            <div style={{ color: C.dim, fontSize: 20 }}>›</div>
          </button>
        ))}
        <button onClick={() => supabase.auth.signOut()}
          style={{ ...S.btn, width: "100%", marginTop: 10, color: C.dim, fontSize: 13 }}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

/* ============ MODO ENTRENAMIENTO ============ */

function SetRow({ set, idx, onChange }) {
  const done = set.hecho;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
      <span style={{ color: C.dim, fontSize: 12, width: 18 }}>{idx + 1}</span>
      <input inputMode="decimal" placeholder="peso" value={set.kg} aria-label={`Peso serie ${idx + 1}`}
        onChange={(e) => onChange({ ...set, kg: e.target.value })}
        style={{ flex: 1, background: C.bg, border: `1px solid ${C.line}`, borderRadius: 9, color: C.text, padding: "10px", fontSize: 15, minWidth: 0 }} />
      <span style={{ color: C.dim, fontSize: 13 }}>×</span>
      <input inputMode="numeric" placeholder="reps" value={set.reps} aria-label={`Repeticiones serie ${idx + 1}`}
        onChange={(e) => onChange({ ...set, reps: e.target.value })}
        style={{ width: 74, background: C.bg, border: `1px solid ${C.line}`, borderRadius: 9, color: C.text, padding: "10px", fontSize: 15 }} />
      <button onClick={() => onChange({ ...set, hecho: !done })}
        aria-label={done ? "Marcar serie como pendiente" : "Marcar serie como hecha"}
        style={{
          width: 46, height: 42, borderRadius: 10, border: `1px solid ${done ? C.ok : C.line}`,
          background: done ? "#12301F" : C.card2, color: done ? C.ok : C.dim,
          fontSize: 18, cursor: "pointer", flexShrink: 0,
        }}>✓</button>
    </div>
  );
}

function TrainExercise({ day, ex, exIdx, db, setSerie, setCell }) {
  const [showInfo, setShowInfo] = useState(false);
  const week = db.week;
  const key = `${day.id}|${week}`;
  const stored = db.sessions?.[key]?.[exIdx] ?? [];
  const sets = Array.from({ length: ex.s }, (_, i) =>
    stored[i] ?? { kg: "", reps: "", hecho: false });

  const prevWeekVal = week > 1 ? gridVal(db, day.id, exIdx, week - 2) : "";
  const doneCount = sets.filter((s) => s.hecho).length;
  const canSave = sets.some((s) => s.hecho && s.kg.trim());

  const saveToGrid = () => {
    const used = [...new Set(sets.filter((s) => s.hecho && s.kg.trim()).map((s) => s.kg.trim()))];
    if (!used.length) return;
    const val = used.join("/") + (/kg|p/i.test(used.join("")) ? "" : "kg");
    setCell(day.id, exIdx, week - 1, val);
  };

  return (
    <div style={{ ...S.card, borderColor: doneCount === ex.s ? C.ok + "55" : C.line }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>{ex.n}</div>
          <div style={{ color: C.hi, fontSize: 12.5, fontWeight: 600, marginTop: 2 }}>
            {ex.s} × {ex.r}
            {prevWeekVal && (
              <span style={{ ...S.hand, fontSize: 17, marginLeft: 10 }}>sem. {week - 1}: {prevWeekVal}</span>
            )}
          </div>
        </div>
        <button onClick={() => setShowInfo(!showInfo)} aria-expanded={showInfo}
          style={{ ...S.btn, padding: "5px 10px", fontSize: 12, flexShrink: 0 }}>
          {showInfo ? "cerrar" : "¿cómo va?"}
        </button>
      </div>
      {showInfo && (
        <p style={{ color: C.dim, fontSize: 13, lineHeight: 1.55, margin: "10px 0 4px", borderLeft: `2px solid ${C.hi}`, paddingLeft: 10 }}>
          {ex.d}
        </p>
      )}
      <div style={{ marginTop: 12 }}>
        {sets.map((set, i) => (
          <SetRow key={i} set={set} idx={i}
            onChange={(ns) => setSerie(day.id, week, exIdx, i, ns)} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
        <span style={{ fontSize: 12, color: doneCount === ex.s ? C.ok : C.dim }}>
          {doneCount}/{ex.s} series
        </span>
        {day.id !== "abs" && (
          <button onClick={saveToGrid} disabled={!canSave}
            style={{ ...S.btn, fontSize: 12.5, padding: "8px 12px", opacity: canSave ? 1 : 0.4, borderColor: C.hi + "66", color: C.hi }}>
            Anotar en planilla · Sem {week}
          </button>
        )}
      </div>
    </div>
  );
}

/* ============ PLANILLA ============ */

function GridExercise({ day, ex, exIdx, db, setCell }) {
  return (
    <div style={{ ...S.card, padding: 12 }}>
      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 2 }}>{ex.n}</div>
      <div style={{ color: C.hi, fontSize: 12, fontWeight: 600, marginBottom: 10 }}>{ex.s} × {ex.r}</div>
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
        {Array.from({ length: WEEKS }, (_, w) => {
          const isNow = w + 1 === db.week;
          return (
            <div key={w} style={{ flexShrink: 0, width: 72 }}>
              <div style={{ fontSize: 10, textAlign: "center", marginBottom: 3, fontWeight: 700, color: isNow ? C.hi : C.dim, letterSpacing: 0.5 }}>
                S{w + 1}
              </div>
              <input value={gridVal(db, day.id, exIdx, w)} placeholder="—"
                aria-label={`${ex.n}, semana ${w + 1}`}
                onChange={(e) => setCell(day.id, exIdx, w, e.target.value)}
                style={{
                  ...S.hand, width: "100%", textAlign: "center", fontSize: 19,
                  background: isNow ? C.hiDark : C.bg,
                  border: `1px solid ${isNow ? C.hi + "77" : C.line}`,
                  borderRadius: 8, padding: "7px 4px", color: C.ink,
                }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============ VISTA DE DÍA ============ */

function DayView({ dayId, db, saved, setSerie, setCell, goHome }) {
  const day = ALL_BLOCKS.find((d) => d.id === dayId);
  const [tab, setTab] = useState("train");
  const hasGrid = dayId !== "abs";

  return (
    <div style={S.app}>
      <div style={{ padding: "16px 16px 8px" }}>
        <button onClick={goHome} style={{ ...S.btn, marginBottom: 14, fontSize: 13 }}>‹ Rutina</button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <span style={S.hiTag}>{day.num ? `DÍA ${day.num}` : "ABDOMINALES"}</span>
            <div style={{ color: C.dim, fontSize: 13, marginTop: 8 }}>{day.focus}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: C.dim, fontSize: 10 }}>SEMANA</div>
            <div style={{ ...S.display, fontSize: 22, color: C.hi }}>{db.week}</div>
          </div>
        </div>
        <div style={{ fontSize: 11, color: saved ? C.ok : C.warn, marginTop: 6 }}>
          {saved ? "✓ Sincronizado" : "Guardando…"}
        </div>
      </div>

      {hasGrid && (
        <div style={{ display: "flex", gap: 8, padding: "6px 16px 12px" }}>
          {[["train", "Entrenar"], ["grid", "Planilla"]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{
                ...S.btn, flex: 1,
                background: tab === id ? C.hi : C.card2,
                color: tab === id ? "#08222B" : C.text,
                borderColor: tab === id ? C.hi : C.line, fontWeight: 800,
              }}>{label}</button>
          ))}
        </div>
      )}

      <div style={{ padding: "0 16px" }}>
        {tab === "train" || !hasGrid
          ? day.ex.map((ex, i) => (
              <TrainExercise key={i} day={day} ex={ex} exIdx={i} db={db} setSerie={setSerie} setCell={setCell} />
            ))
          : day.ex.map((ex, i) => (
              <GridExercise key={i} day={day} ex={ex} exIdx={i} db={db} setCell={setCell} />
            ))}
      </div>
    </div>
  );
}

/* ============ APP ============ */

export default function App() {
  const [user, setUser] = useState(undefined); // undefined = cargando
  const [dayId, setDayId] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const { db, saved, setWeek, setCell, setSerie } = useDB(user);

  if (user === undefined || (user && !db)) {
    return (
      <div style={{ ...S.app, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <span style={{ ...S.display, color: C.dim }}>Cargando rutina…</span>
      </div>
    );
  }

  if (!user) return <Login />;

  return dayId
    ? <DayView dayId={dayId} db={db} saved={saved} setSerie={setSerie} setCell={setCell} goHome={() => setDayId(null)} />
    : <Home db={db} setWeek={setWeek} saved={saved} openDay={setDayId} />;
}

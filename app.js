/* OSIMO Home Strength: vanilla JS PWA. Data in localStorage, backup as JSON. */
"use strict";
const KEY = "osimo-home-programme-v1"; // same key and format as the Page tracker, so backups move between them
const $ = (s, el) => (el || document).querySelector(s);
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const pad = (n) => (n < 10 ? "0" + n : "" + n);
const iso = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
const parseISO = (s) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ""); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const nice = (d) => DAYS[d.getDay()].slice(0, 3) + " " + d.getDate() + " " + MONTHS[d.getMonth()];
const dayDiff = (a, b) => Math.round((new Date(a.getFullYear(), a.getMonth(), a.getDate()) - new Date(b.getFullYear(), b.getMonth(), b.getDate())) / 86400000);
const weekOf = (d) => Math.floor(dayDiff(d, START) / 7) + 1; // 1..12 inside the programme
const phaseFor = (w) => (w <= 4 ? 0 : w <= 8 ? 1 : 2);
const restSecs = (s) => { const n = parseInt(s, 10) || 60; return /min/.test(s) ? n * 60 : n; };
const setCount = (s) => parseInt(s, 10) || 3;
const repTarget = (s) => { const m = /×\s*(\d+)/.exec(s); return m ? +m[1] : 10; };
const ytThumb = (id) => "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg";
const ytWatch = (id) => "https://www.youtube.com/watch?v=" + id;
const ytEmbed = (id, auto) => "https://www.youtube-nocookie.com/embed/" + id + "?rel=0&playsinline=1&modestbranding=1" + (auto ? "&autoplay=1" : "");
const ENCOURAGE = ["Every rep counts. Nice work.", "Consistency beats intensity. You showed up.", "Strong back, happy knees. Keep going.", "That's another brick in the wall.", "Future you says thanks.", "Small steps, big change.", "You're building something here."];

// ---------- store ----------
const defaults = () => ({ logs: [], days: {}, settings: { theme: "light", sound: true, vibrate: true, voice: false, bodyKg: "", reminders: { workoutOn: true, workoutTime: "18:00", stretchOn: true, stretchTime: "21:00", suppsOn: true, suppsTime: "08:30" } }, fired: {} });
let canSave = true;
function load() {
  try { const raw = localStorage.getItem(KEY); if (!raw) return defaults(); const p = JSON.parse(raw); const d = defaults(); return { logs: p.logs || [], days: p.days || {}, settings: Object.assign(d.settings, p.settings || {}, { reminders: Object.assign(d.settings.reminders, (p.settings && p.settings.reminders) || {}) }), fired: p.fired || {} }; }
  catch (e) { canSave = false; return defaults(); }
}
let S = load();
if (!localStorage.getItem(KEY)) { const t0 = iso(new Date()); const hm0 = pad(new Date().getHours()) + ":" + pad(new Date().getMinutes()); for (const k of ["workout", "stretch", "supps"]) if (hm0 >= S.settings.reminders[k + "Time"]) S.fired[k] = t0; }
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { canSave = false; }
  syncSW();
}
const dayEntry = (d) => S.days[d] || (S.days[d] = {});

// ---------- feedback: sound, vibration, voice, notifications ----------
let actx = null;
function unlockAudio() { try { if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === "suspended") actx.resume(); } catch (e) {} }
function beep(freq = 880, ms = 160, when = 0, vol = 0.25) {
  if (!S.settings.sound) return;
  try { unlockAudio(); const t = actx.currentTime + when; const o = actx.createOscillator(); const g = actx.createGain(); o.type = "sine"; o.frequency.value = freq; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000); o.connect(g).connect(actx.destination); o.start(t); o.stop(t + ms / 1000 + 0.02); } catch (e) {}
}
const chime = () => { beep(784, 140, 0); beep(988, 140, 0.16); beep(1319, 260, 0.32); };
function buzz(p) { if (S.settings.vibrate && navigator.vibrate) { try { navigator.vibrate(p); } catch (e) {} } }
function say(t) { if (!S.settings.voice || !window.speechSynthesis) return; try { const u = new SpeechSynthesisUtterance(t); u.lang = "en-GB"; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) {} }
function toast(t, ms = 2600) { const el = $("#toast"); el.textContent = t; el.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => (el.hidden = true), ms); }
async function ping(title, body, tag) {
  // Visible page: sound + vibration + toast. Hidden page: system notification through the service worker.
  chime(); buzz([250, 120, 250, 120, 400]); toast(title + ": " + body, 4000);
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  if (document.visibilityState === "visible" && tag !== "test") return;
  try { const reg = await navigator.serviceWorker.ready; reg.showNotification(title, { body, tag: "hs-" + (tag || "ping"), icon: "icons/icon-192.png", badge: "icons/maskable-192.png", vibrate: [200, 100, 200], renotify: true }); }
  catch (e) { try { new Notification(title, { body, icon: "icons/icon-192.png" }); } catch (e2) {} }
}

// ---------- service worker + reminders ----------
let swReg = null;
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js", { scope: "./" }).then(async (reg) => {
      swReg = reg; syncSW();
      try { if ("periodicSync" in reg) { const st = await navigator.permissions.query({ name: "periodic-background-sync" }); if (st.state === "granted") await reg.periodicSync.register("hs-reminders", { minInterval: 60 * 60 * 1000 }); } } catch (e) {}
    }).catch(() => {});
  });
}
function syncSW() {
  try {
    const t = iso(new Date()); const de = S.days[t] || {};
    const state = { reminders: S.settings.reminders, fired: S.fired, doneToday: { [t]: { workout: !!de.workout, stretch: !!de.stretch, supps: !!(de.creatine || de.vitd) } } };
    if (navigator.serviceWorker && navigator.serviceWorker.controller) navigator.serviceWorker.controller.postMessage({ type: "state", state });
  } catch (e) {}
}
function checkReminders() {
  const now = new Date(); const t = iso(now); const hm = pad(now.getHours()) + ":" + pad(now.getMinutes()); const r = S.settings.reminders; const de = S.days[t] || {};
  const inProg = t >= iso(START) && t <= "2027-01-31"; const dow = now.getDay();
  const due = [
    ["workout", r.workoutOn && inProg && [1, 3, 5].includes(dow) && !de.workout, r.workoutTime, "Workout day", "Today's strength session is ready. Tap Start."],
    ["stretch", r.stretchOn && !de.stretch, r.stretchTime, "10-minute stretch", "Hips, hamstrings, lower back and knees."],
    ["supps", r.suppsOn && !(de.creatine || de.vitd), r.suppsTime, "Supplements", "Creatine and vitamin D, if you're taking them."],
  ];
  for (const [k, on, time, title, body] of due) {
    if (on && time && hm >= time && S.fired[k] !== t) { S.fired[k] = t; save(); ping(title, body, k); }
  }
}
setInterval(checkReminders, 30000);
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") { checkReminders(); renderToday(); } });

// ---------- today logic ----------
function planFor(date) {
  const w = weekOf(date); const dp = DAY_PLAN[date.getDay()];
  if (w < 1) return { pre: true, days: -dayDiff(date, START), w, dp };
  if (w > 12) return { post: true, w, dp };
  return { w, ph: phaseFor(w), dp, light: w === 4 || w === 8 };
}
function streak() {
  let n = 0; let d = new Date();
  const active = (x) => { const e = S.days[iso(x)]; return !!(e && (e.workout || e.stretch || e.walk)) || S.logs.some((l) => l.date === iso(x)); };
  if (!active(d)) d = addDays(d, -1); // today not done yet does not break the streak
  while (active(d) && n < 400) { n++; d = addDays(d, -1); }
  return n;
}
const sessionDates = () => Array.from(new Set(S.logs.map((l) => l.date)));
function lastFor(ex) { const ls = S.logs.filter((l) => l.ex === ex).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.id - a.id)); return ls[0] || null; }

// ---------- rendering helpers ----------
function exThumb(e) { return e && e.img ? `<img src="img/${e.img}.webp" alt="" loading="lazy">` : `<div class="thumbph">${esc((e ? e.name : "?").slice(0, 1))}</div>`; }
function vidCard(v) { return `<button class="vid" data-video="${esc(v.id)}" data-title="${esc(v.title)}"><img src="${ytThumb(v.id)}" alt="" loading="lazy" onerror="this.style.display='none'"><span class="play"><span>▶</span></span><span class="cap">${esc(v.title)} · ${esc(v.site || "YouTube")}</span></button>`; }
function table(cols, rows) { return `<div class="tablewrap"><table><thead><tr>${cols.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`; }
function checkBtn(key, label, sub, done) { return `<button class="check ${done ? "done" : ""}" data-check="${key}"><span class="box">${done ? "✓" : ""}</span><span>${esc(label)}${sub ? `<small>${esc(sub)}</small>` : ""}</span></button>`; }
const safetyCallout = () => `<div class="callout"><b>Stop if anything causes sharp pain.</b> ${esc(SAFETY)}</div>`;

// ---------- TODAY ----------
let chosenDay = null; // override: {ph, day}
function renderToday() {
  const now = new Date(); const t = iso(now); const p = planFor(now); const de = S.days[t] || {}; const st = streak();
  $("#hdrWeek").textContent = p.pre ? "Starts Mon 9 Nov" : p.post ? "Programme complete" : "Week " + p.w + " · " + ["Foundation", "Build", "Strength"][p.ph] + (p.light ? " · lighter week" : "");
  $("#hdrTitle").textContent = DAYS[now.getDay()] + " " + now.getDate() + " " + MONTHS[now.getMonth()];
  let hero = "";
  const ph = p.pre ? 0 : p.post ? 2 : p.ph;
  let strengthDay = p.dp.type === "strength" ? p.dp.day : null;
  if (chosenDay) strengthDay = chosenDay.day;
  const usePh = chosenDay ? chosenDay.ph : ph;
  if (p.pre) hero += `<div class="card"><span class="pill">${p.days} day${p.days === 1 ? "" : "s"} to go</span><h2 style="margin-top:10px">Your programme starts Monday 9 November</h2><p>Get set up now: allow reminders, pick your times and try a light practice session so the moves feel familiar before day one.</p></div>`;
  if (p.post) hero += `<div class="card"><span class="pill ok">12 weeks done</span><h2 style="margin-top:10px">You finished the programme</h2><p>Repeat the Strength phase sessions and keep adding small amounts of weight while back and knees stay at 3 or under.</p></div>`;
  if (strengthDay !== null) {
    const d = PHASES[usePh].days[strengthDay]; const done = de.workout;
    hero += `<div class="card accent"><div class="muted">${done ? "Done today ✓" : chosenDay ? "Chosen session" : p.pre ? "Practice session" : "Today's session"}</div><h2 style="margin:4px 0 2px;font-size:26px">${esc(d.name.replace(/ \(.*\)/, ""))} · ${["Foundation", "Build", "Strength"][usePh]}</h2><p>${d.items.length} exercises · about 40 to 50 min with warm-up and cool-down${p.light && !chosenDay ? " · lighter week: one set fewer" : ""}</p><button class="big" id="startBtn">${done ? "Do it again" : "▶  Start today's workout"}</button></div>`;
    hero += `<div class="card"><h3>What's in it</h3>${d.items.map((it) => { const e = EXMAP[it.ex]; const last = lastFor(it.ex); return `<div class="ex">${exThumb(e)}<div class="t"><b>${esc(e ? e.name : it.ex)}</b><span class="muted">${esc(it.sets)} · rest ${esc(it.rest)}${last ? " · last " + (last.kg || "BW") + (last.kg ? " kg" : "") : ""}</span></div></div>`; }).join("")}</div>`;
  } else {
    const isWalk = p.dp.type === "walk";
    hero += `<div class="card accent"><div class="muted">${isWalk ? "Walk day" : "Rest day"}</div><h2 style="margin:4px 0 6px;font-size:26px">${esc(p.dp.text)}</h2><p>Plus your 10-minute stretch. Steps target: ${STEPS_TARGET[ph].toLocaleString("en-GB")}.</p><button class="big" id="mobBtn">▶  Start 10-minute stretch</button></div>`;
  }
  const pick = `<details><summary>Do a different session</summary><p class="muted">Missed a day? Do it now. Sessions can shift; two in a busy week still counts.</p><div class="seg">${PHASES.map((P, pi) => P.days.map((D, di) => `<button class="chip ${chosenDay && chosenDay.ph === pi && chosenDay.day === di ? "on" : ""}" data-pick="${pi}-${di}">${["Foundation", "Build", "Strength"][pi]} ${D.name.slice(0, 5)}</button>`).join("")).join("")}${chosenDay ? `<button class="chip" data-pick="clear">Back to today's plan</button>` : ""}</div></details>`;
  const steps = de.steps || "";
  const checklist = `<div class="card"><div class="row between"><h3 style="margin:0">Today's checklist</h3><span class="pill ${st ? "ok" : ""}">🔥 ${st}-day streak</span></div><p class="muted" style="margin-top:4px">${st ? ENCOURAGE[st % ENCOURAGE.length] : "Tick one thing today to start a streak."}</p><div class="list">
    ${strengthDay !== null ? checkBtn("workout", "Strength session", "Ticks itself when you finish a guided session", !!de.workout) : ""}
    ${checkBtn("stretch", "10-minute stretch", "", !!de.stretch)}
    ${checkBtn("walk", p.dp.type === "walk" ? p.dp.text : "Walk", "", !!de.walk)}
    ${checkBtn("creatine", "Creatine", "3 to 5 g", !!de.creatine)}
    ${checkBtn("vitd", "Vitamin D", "10 micrograms, Oct to Mar", !!de.vitd)}
    ${checkBtn("protein", "Protein target met", S.settings.bodyKg ? Math.round(S.settings.bodyKg * 1.6) + " g today" : "Set your weight in Plan › Supplements", !!de.protein)}
    ${checkBtn("omega", "Omega-3 or oily fish", "Optional", !!de.omega)}
  </div><label class="f" style="margin-top:12px">Steps today (target ${STEPS_TARGET[ph].toLocaleString("en-GB")})<input inputmode="numeric" type="number" id="stepsIn" value="${esc(steps)}" placeholder="e.g. 8000"></label></div>`;
  const notif = ("Notification" in window) && Notification.permission !== "granted" ? `<div class="card"><h3>Let the app ping you</h3><p>Reminders for workout days, your stretch and supplements, plus rest-timer alerts.</p><button class="btn primary full" id="notifBtn">Allow notifications</button></div>` : "";
  $("#v-today").innerHTML = hero + notif + checklist + pick + safetyCallout();
  const sb = $("#startBtn"); if (sb) sb.onclick = () => startSession(usePh, strengthDay, p.light && !chosenDay);
  const mb = $("#mobBtn"); if (mb) mb.onclick = startMobility;
  const nb = $("#notifBtn"); if (nb) nb.onclick = askNotif;
  $("#stepsIn").onchange = (e) => { dayEntry(t).steps = e.target.value; save(); };
}
async function askNotif() {
  unlockAudio();
  if (!("Notification" in window)) { toast("This browser does not support notifications."); return; }
  const r = await Notification.requestPermission();
  if (r === "granted") { ping("Notifications are on", "You'll get workout, stretch and supplement reminders.", "test"); try { const reg = await navigator.serviceWorker.ready; if ("periodicSync" in reg) await reg.periodicSync.register("hs-reminders", { minInterval: 3600000 }); } catch (e) {} }
  else toast("Notifications were not allowed. You can change this in your browser's site settings.");
  renderAll();
}

// ---------- guided session ----------
let SES = null; let timerInt = null; let wakeLock = null;
async function keepAwake() { try { if ("wakeLock" in navigator) wakeLock = await navigator.wakeLock.request("screen"); } catch (e) {} }
function startSession(ph, day, light) {
  unlockAudio(); beep(660, 80);
  const d = PHASES[ph].days[day];
  SES = { ph, day, name: d.name.replace(/ \(.*\)/, ""), step: -1, items: d.items.map((it) => { const last = lastFor(it.ex); const n = Math.max(1, setCount(it.sets) - (light ? 1 : 0)); return { ...it, n, done: [], kg: last ? +last.kg || 0 : 0, reps: last ? +last.reps || repTarget(it.sets) : repTarget(it.sets), back: last ? +last.back || 0 : 0, knee: last ? +last.knee || 0 : 0 }; }), rest: null, started: Date.now(), warm: [], cool: [] };
  document.body.classList.add("in-session"); $("#session").hidden = false; collapseMini(); keepAwake(); renderSession();
}
function endSession(save_) {
  clearInterval(timerInt); timerInt = null;
  if (save_) { const t = iso(new Date()); dayEntry(t).workout = SES.name; save(); }
  SES = null; $("#session").hidden = true; document.body.classList.remove("in-session");
  try { wakeLock && wakeLock.release(); } catch (e) {}
  renderAll();
}
function logItem(it) {
  const t = iso(new Date());
  S.logs.push({ id: Date.now() + Math.floor(Math.random() * 1000), date: t, ex: it.ex, kg: it.kg ? String(it.kg) : "", sets: String(it.done.length), reps: String(it.reps), back: String(it.back), knee: String(it.knee), notes: "Guided session" });
  save();
}
function startRest(secs, label) {
  clearInterval(timerInt);
  SES.rest = { total: secs, end: Date.now() + secs * 1000, label, warned: {} };
  timerInt = setInterval(tickRest, 250); tickRest();
}
function tickRest() {
  if (!SES || !SES.rest) return;
  const left = Math.max(0, Math.ceil((SES.rest.end - Date.now()) / 1000));
  const c = $("#clock"); if (c) c.textContent = Math.floor(left / 60) + ":" + pad(left % 60);
  const r = $("#ringfill"); if (r) r.style.width = (100 * left) / SES.rest.total + "%";
  if (left <= 3 && left > 0 && !SES.rest.warned[left]) { SES.rest.warned[left] = 1; beep(660, 90); buzz(60); }
  if (left === 0) {
    clearInterval(timerInt); timerInt = null; const lbl = SES.rest.label; SES.rest = null;
    beep(1046, 400); buzz([300, 100, 300]); say("Rest over. " + lbl);
    if (document.visibilityState !== "visible") ping("Rest over", lbl, "rest");
    renderSession();
  }
}
function renderSession() {
  if (!SES) return;
  const el = $("#session"); el.classList.toggle("music-on", !$("#mini").hidden);
  const total = SES.items.length + 2; const pos = SES.step + 1;
  let body = `<div class="row between"><button class="iconbtn" id="sesClose">✕ End</button><b>${esc(SES.name)}</b><span class="muted">${Math.min(pos + 1, total)}/${total}</span></div><div class="progressbar"><div style="width:${(100 * (pos + 1)) / total}%"></div></div>`;
  if (SES.rest) {
    body += `<div class="card timer"><div class="muted">Rest</div><div class="clock" id="clock"></div><div class="ring"><div id="ringfill"></div></div><div class="muted" style="margin-bottom:12px">Up next: ${esc(SES.rest.label)}</div><div class="grid2"><button class="btn" id="plus15">+15 s</button><button class="btn primary" id="skipRest">Skip rest</button></div></div>`;
  }
  if (SES.step === -1) {
    body += `<div class="card"><span class="pill">Warm-up · 6 min</span><h2 style="margin-top:8px">Warm up first</h2><p>Tick each as you go. Easy pace, no pain.</p><div class="list">${WARMUP.map((w, i) => checkBtn("w" + i, w[0], w[1], SES.warm.includes(i))).join("")}</div></div><div class="stickybar"><button class="big" id="nextStep">Start exercises →</button></div>`;
  } else if (SES.step >= SES.items.length) {
    body += `<div class="card"><span class="pill">Cool-down · 5 min</span><h2 style="margin-top:8px">Cool down</h2><p>Gentle stretches, slow breathing.</p><div class="list">${COOLDOWN.map((w, i) => checkBtn("c" + i, w[0], w[1], SES.cool.includes(i))).join("")}</div></div><div class="stickybar"><button class="big" id="finish">✓ Finish session</button></div>`;
  } else {
    const it = SES.items[SES.step]; const e = EXMAP[it.ex] || { name: it.ex, cues: [], videos: [] };
    const nextIdx = it.done.length;
    body += `<div class="card"><div class="row between"><span class="pill">Exercise ${SES.step + 1} of ${SES.items.length}</span><span class="muted">Rest ${esc(it.rest)}</span></div><h2 style="margin:10px 0 2px;font-size:26px">${esc(e.name)}</h2><p><b>${it.n} sets</b> · ${esc(it.sets.replace(/^\d+\s*×\s*/, ""))}${it.note ? " · " + esc(it.note) : ""}</p>${e.img ? `<img class="illus" src="img/${e.img}.webp" alt="">` : ""}
      <ul>${e.cues.map((c) => `<li>${esc(c)}</li>`).join("")}</ul><p class="muted"><b>Easier:</b> ${esc(e.easier)}</p>${e.flag ? `<p class="muted"><b>Note:</b> ${esc(e.flag)}</p>` : ""}${e.videos && e.videos[0] ? `<button class="btn full" data-video="${esc(e.videos[0].id)}" data-title="${esc(e.videos[0].title)}">▶ Watch demo</button>` : ""}</div>
      <div class="card"><h3>Weight and reps</h3><p class="muted">${lastFor(it.ex) ? "Pre-filled from last time. Adjust if needed." : "First time: pick a weight you could lift 3 or 4 more times."}</p>
      <div class="grid2"><div class="stepper"><button data-adj="kg:-1">−</button><div class="val">${it.kg || "BW"}<small>kg</small></div><button data-adj="kg:1">+</button></div><div class="stepper"><button data-adj="reps:-1">−</button><div class="val">${it.reps}<small>reps</small></div><button data-adj="reps:1">+</button></div></div>
      <h3 style="margin-top:16px">Tap each set when done</h3><div class="sets">${Array.from({ length: it.n }, (_, i) => `<button class="setbtn ${it.done.includes(i) ? "done" : i === nextIdx ? "next" : ""}" data-set="${i}"><b>${it.done.includes(i) ? "✓" : i + 1}</b>Set ${i + 1}</button>`).join("")}</div>
      <h3 style="margin-top:16px">Back right now (0 to 10)</h3><div class="scores">${score("back", it.back)}</div>
      <h3 style="margin-top:12px">Knees right now (0 to 10)</h3><div class="scores">${score("knee", it.knee)}</div>
      ${Math.max(it.back, it.knee) >= 6 ? `<div class="callout" style="margin-top:12px"><b>That's a red score.</b> Stop this move today and use the easier option next time. If it lingers, see your GP or a physio.</div>` : Math.max(it.back, it.knee) >= 4 ? `<p class="muted" style="margin-top:10px">Amber: keep the same weight or switch to the easier option.</p>` : ""}
      </div><div class="grid2 stickybar"><button class="btn" id="prevStep">← Back</button><button class="btn primary" id="nextStep">${it.done.length >= it.n ? "Next →" : "Skip →"}</button></div>`;
  }
  el.innerHTML = `<div class="inner">${body}</div>`;
  if (SES.rest) tickRest();
  const on = (id, f) => { const b = $("#" + id, el); if (b) b.onclick = f; };
  on("sesClose", () => { if (confirm("End this session? Sets you've finished are already saved.")) endSession(false); });
  on("plus15", () => { SES.rest.end += 15000; SES.rest.total += 15; tickRest(); });
  on("skipRest", () => { clearInterval(timerInt); SES.rest = null; renderSession(); });
  on("nextStep", () => advance());
  on("prevStep", () => { SES.step = Math.max(-1, SES.step - 1); renderSession(); });
  on("finish", () => { const mins = Math.round((Date.now() - SES.started) / 60000); chime(); buzz([100, 60, 100, 60, 300]); say("Session complete. Brilliant work."); const name = SES.name; endSession(true); showDone(name, mins); });
}
function score(kind, v) { return Array.from({ length: 11 }, (_, i) => `<button class="${i >= 6 ? "b" : i >= 4 ? "w" : ""} ${i === v ? "on" : ""}" data-score="${kind}:${i}">${i}</button>`).join(""); }
function advance() {
  if (SES.step >= 0 && SES.step < SES.items.length) { const it = SES.items[SES.step]; if (it.done.length && !it.logged) { logItem(it); it.logged = true; } }
  SES.step++; window.scrollTo(0, 0); $("#session").scrollTop = 0; renderSession();
}
function showDone(name, mins) {
  const st = streak();
  const m = $("#modal"); m.hidden = false;
  m.innerHTML = `<div class="box" style="text-align:center;padding:28px 20px"><div style="font-size:54px">🎉</div><h2>${esc(name)} done</h2><p>${mins} minutes · ${st}-day streak</p><p>${esc(ENCOURAGE[(st + mins) % ENCOURAGE.length])}</p><p class="muted">Rate how your back and knees feel tomorrow morning in the Log tab; that's the real test.</p><button class="big" id="closeModal">Nice</button></div>`;
  $("#closeModal").onclick = closeModal;
}
$("#session").addEventListener("click", (ev) => {
  const b = ev.target.closest("button"); if (!b || !SES) return;
  if (b.dataset.set !== undefined) {
    const it = SES.items[SES.step]; const i = +b.dataset.set;
    if (it.done.includes(i)) { it.done = it.done.filter((x) => x !== i); renderSession(); return; }
    it.done.push(i); beep(880, 90); buzz(40);
    if (it.done.length >= it.n) {
      logItem(it); it.logged = true;
      const nxt = SES.items[SES.step + 1]; const label = nxt ? (EXMAP[nxt.ex] || {}).name || nxt.ex : "Cool-down";
      SES.step++; toast("Logged ✓ " + it.done.length + " sets"); startRest(nxt ? restSecs(it.rest) : 20, label); renderSession(); window.scrollTo(0, 0); $("#session").scrollTop = 0;
    } else { startRest(restSecs(it.rest), "Set " + (it.done.length + 1) + " of " + it.n); renderSession(); $("#session").scrollTop = 0; }
  } else if (b.dataset.adj) {
    const [k, d] = b.dataset.adj.split(":"); const it = SES.items[SES.step];
    if (k === "kg") it.kg = Math.max(0, Math.round((it.kg + (+d) * (it.kg >= 20 ? 2 : 1)) * 10) / 10); else it.reps = Math.max(1, it.reps + +d);
    renderSession();
  } else if (b.dataset.score) {
    const [k, v] = b.dataset.score.split(":"); SES.items[SES.step][k] = +v; renderSession();
  } else if (b.dataset.check) {
    const k = b.dataset.check; const arr = k[0] === "w" ? SES.warm : SES.cool; const i = +k.slice(1);
    const at = arr.indexOf(i); if (at >= 0) arr.splice(at, 1); else { arr.push(i); beep(990, 60); buzz(30); }
    renderSession();
  }
});

// ---------- guided mobility ----------
let MOBS = null;
function startMobility() {
  unlockAudio(); MOBS = { i: 0, end: Date.now() + MOB_SECS[0] * 1000, paused: false, left: MOB_SECS[0] };
  document.body.classList.add("in-session"); $("#session").hidden = false; collapseMini(); keepAwake(); renderMob();
  clearInterval(timerInt); timerInt = setInterval(tickMob, 250);
}
function tickMob() {
  if (!MOBS || MOBS.paused) return;
  const left = Math.max(0, Math.ceil((MOBS.end - Date.now()) / 1000)); MOBS.left = left;
  const c = $("#clock"); if (c) c.textContent = Math.floor(left / 60) + ":" + pad(left % 60);
  const r = $("#ringfill"); if (r) r.style.width = (100 * left) / MOB_SECS[MOBS.i] + "%";
  if (left === Math.floor(MOB_SECS[MOBS.i] / 2) && /each side/.test(MOB[MOBS.i].move) && MOBS.sw !== MOBS.i) { MOBS.sw = MOBS.i; beep(740, 150); buzz(120); say("Switch sides"); toast("Switch sides"); }
  if (left === 0) {
    if (MOBS.i >= MOB.length - 1) { clearInterval(timerInt); timerInt = null; chime(); buzz([100, 60, 300]); say("Stretch complete"); dayEntry(iso(new Date())).stretch = true; save(); MOBS = null; $("#session").hidden = true; document.body.classList.remove("in-session"); renderAll(); toast("Stretch done ✓ Nice work."); return; }
    MOBS.i++; MOBS.end = Date.now() + MOB_SECS[MOBS.i] * 1000; beep(988, 200); buzz([150, 80, 150]); say(MOB[MOBS.i].move); renderMob();
  }
}
function renderMob() {
  const m = MOB[MOBS.i]; const el = $("#session");
  el.innerHTML = `<div class="inner"><div class="row between"><button class="iconbtn" id="mobClose">✕ End</button><b>10-minute stretch</b><span class="muted">${MOBS.i + 1}/${MOB.length}</span></div><div class="progressbar"><div style="width:${(100 * (MOBS.i + 1)) / MOB.length}%"></div></div>
  <div class="card timer"><div class="muted">${esc(m.aim)}</div><h2 style="margin:6px 0 10px;font-size:26px">${esc(m.move)}</h2><div class="clock" id="clock"></div><div class="ring"><div id="ringfill"></div></div><p class="muted">Stretch to mild tension, breathe slowly, never force it.${/each side/.test(m.move) ? " A beep tells you when to switch sides." : ""}</p><div class="grid2"><button class="btn" id="mobPause">${MOBS.paused ? "Resume" : "Pause"}</button><button class="btn primary" id="mobNext">Next →</button></div></div>
  ${vidCard({ id: m.id, title: m.move, site: m.site })}${MOB[MOBS.i + 1] ? `<p class="muted">Up next: ${esc(MOB[MOBS.i + 1].move)}</p>` : ""}</div>`;
  tickMob();
  $("#mobClose").onclick = () => { clearInterval(timerInt); MOBS = null; $("#session").hidden = true; document.body.classList.remove("in-session"); renderAll(); };
  $("#mobPause").onclick = () => { if (MOBS.paused) { MOBS.end = Date.now() + MOBS.left * 1000; MOBS.paused = false; } else MOBS.paused = true; renderMob(); };
  $("#mobNext").onclick = () => { MOBS.end = Date.now(); MOBS.paused = false; tickMob(); };
}

// ---------- PLAN ----------
let planPhase = 0;
function renderPlan() {
  const kg = parseFloat(S.settings.bodyKg) || 0; const pd = Math.round(kg * 1.6);
  $("#v-plan").innerHTML = `
  <div class="card"><h2>Start here</h2><p>Welcome back from Turkey, OSIMO. This plan is built to get you strong again without upsetting your lower back or knees: start easier than you think you need to, be consistent, and add weight only when a move feels solid.</p></div>
  ${safetyCallout()}
  <details open><summary>Back and knee traffic light</summary>${table(["Score", "What it means", "What to do"], PAIN.map((r) => r.map(esc)))}</details>
  <details><summary>The 12 weeks</summary>${table(["Phase", "Weeks", "Dates", "Effort", "Focus"], PHASE_TABLE.map((r) => r.map(esc)))}<h3 style="margin-top:14px">How to progress</h3><ol>${PROGRESSION.map((p) => `<li><b>${esc(p[0])}.</b> ${esc(p[1])}</li>`).join("")}</ol></details>
  <details><summary>Your week</summary>${table(["Day", "Plan", "Walk and steps"], WEEK_TABLE.map((r) => r.map(esc)))}<p style="margin-top:10px">Steps target: 7,000 a day in weeks 1 to 4, 8,000 in weeks 5 to 8, 9,000 or more in weeks 9 to 12. Missed a day? Just move the sessions along.</p></details>
  <details open><summary>Sessions</summary><div class="seg" style="margin-bottom:10px">${PHASES.map((P, i) => `<button class="chip ${i === planPhase ? "on" : ""}" data-phase="${i}">${esc(P.label.split(",")[0])}</button>`).join("")}</div>
    ${PHASES[planPhase].days.map((d, di) => `<h3 style="margin-top:12px">${esc(d.name)}</h3>${d.items.map((it) => { const e = EXMAP[it.ex]; return `<div class="ex" data-open="${esc(it.ex)}">${exThumb(e)}<div class="t"><b>${esc(e ? e.name : it.ex)}</b><span class="muted">${esc(it.sets)} · rest ${esc(it.rest)}${it.note ? " · " + esc(it.note) : ""}</span></div></div>`; }).join("")}<button class="btn full" data-startday="${planPhase}-${di}" style="margin-top:6px">▶ Start this session</button>`).join("")}</details>
  <details><summary>Warm-up and cool-down</summary><h3>Warm-up, 6 minutes</h3><ol>${WARMUP.map((w) => `<li><b>${esc(w[0])}</b>: ${esc(w[1])}</li>`).join("")}</ol><h3>Cool-down, 5 minutes</h3><ol>${COOLDOWN.map((w) => `<li><b>${esc(w[0])}</b>: ${esc(w[1])}</li>`).join("")}</ol></details>
  <details><summary>Daily 10-minute mobility</summary><button class="btn primary full" id="planMob">▶ Start guided stretch</button>${MOB.map((m, i) => `<div class="ex"><div class="thumbph">${i + 1}</div><div class="t"><b>${esc(m.move)}</b><span class="muted">${esc(m.time)} · ${esc(m.aim)}</span></div><button class="chip" data-video="${esc(m.id)}" data-title="${esc(m.move)}">▶ Demo</button></div>`).join("")}</details>
  <details><summary>Equipment swaps</summary>${SUBS.map((s) => `<p><b>${esc(s[0])}.</b> ${esc(s[1])}</p>`).join("")}</details>
  <details><summary>Moves to avoid for now</summary><h3>Green light</h3><ul>${AVOID_OK.map((x) => `<li>${esc(x)}</li>`).join("")}</ul><h3>Hold off or flag</h3><ul>${AVOID_NO.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></details>
  <details><summary>Supplements and protein</summary><div class="callout"><b>General information, not medical advice.</b> If you take any medication or have a health condition, check with your GP or pharmacist before starting a supplement.</div>${table(["What", "Typical amount", "Why", "Check"], SUPPS.map((r) => r.map(esc)))}
    <h3 style="margin-top:14px">Your protein target</h3><label class="f">Body weight (kg)<input type="number" inputmode="decimal" id="bodyKg" value="${esc(S.settings.bodyKg)}" placeholder="e.g. 85"></label>
    ${pd ? `<div class="grid3" style="margin-top:10px"><div class="stat"><b>${pd} g</b><span>per day (1.6 g/kg)</span></div><div class="stat"><b>${Math.round(pd / 4)} g</b><span>per meal, 4 meals</span></div><div class="stat"><b>${Math.round(pd / 3)} g</b><span>per meal, 3 meals</span></div></div>` : ""}
    <p class="muted" style="margin-top:10px">Rough guide: 3 eggs about 18 g, 150 g chicken breast about 45 g, a can of tuna about 25 g, 200 g Greek yoghurt about 20 g, a scoop of whey about 24 g.</p></details>
  <details><summary>Sources</summary>${SOURCES.map((s) => `<p><a href="${s[2]}" target="_blank" rel="noopener">${esc(s[0])}</a> <span class="muted">· ${esc(s[1])}</span></p>`).join("")}</details>`;
  $("#planMob").onclick = startMobility;
  $("#bodyKg").onchange = (e) => { S.settings.bodyKg = e.target.value; save(); renderPlan(); renderToday(); };
}

// ---------- LIBRARY ----------
let libFilter = "";
function renderLibrary() {
  const q = libFilter.toLowerCase();
  const list = EX.filter((e) => !q || e.name.toLowerCase().includes(q));
  $("#v-library").innerHTML = `<input type="search" id="libSearch" placeholder="Search 24 moves" value="${esc(libFilter)}">` + list.map((e) => `<details id="ex-${e.id}"><summary><span class="row" style="gap:12px">${exThumb(e)}<span>${esc(e.name)}</span></span></summary>
    ${e.img ? `<img class="illus" src="img/${e.img}.webp" alt="">` : ""}<h3 style="margin-top:10px">Form cues</h3><ul>${e.cues.map((c) => `<li>${esc(c)}</li>`).join("")}</ul><p><b>Easier option:</b> ${esc(e.easier)}</p>${e.flag ? `<p><b>Note:</b> ${esc(e.flag)}</p>` : ""}
    <div class="list">${e.videos.map((v) => vidCard(v) + `<a class="muted" href="${ytWatch(v.id)}" target="_blank" rel="noopener">Open on YouTube</a>`).join("")}</div></details>`).join("");
  const s = $("#libSearch"); s.oninput = (ev) => { libFilter = ev.target.value; renderLibrary(); const n = $("#libSearch"); n.focus(); n.setSelectionRange(libFilter.length, libFilter.length); };
}

// ---------- LOG ----------
let logForm = null;
function renderLog() {
  const t = iso(new Date());
  if (!logForm) logForm = { date: t, ex: EX[0].id };
  const last = lastFor(logForm.ex);
  const sorted = S.logs.slice().sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.id - a.id));
  $("#v-log").innerHTML = `<div class="card"><h2>Quick log</h2><p class="muted">Guided sessions log themselves. Use this for anything extra or to fix an entry.</p>
    <div class="row"><label class="f">Date<input type="date" id="lDate" value="${esc(logForm.date)}"></label><label class="f">Exercise<select id="lEx">${EX.map((e) => `<option value="${e.id}" ${e.id === logForm.ex ? "selected" : ""}>${esc(e.name)}</option>`).join("")}</select></label></div>
    <div class="row" style="margin-top:10px"><label class="f">kg<input type="number" inputmode="decimal" id="lKg" value="${esc(last ? last.kg : "")}" placeholder="BW"></label><label class="f">Sets<input type="number" inputmode="numeric" id="lSets" value="${esc(last ? last.sets : 3)}"></label><label class="f">Reps<input type="number" inputmode="numeric" id="lReps" value="${esc(last ? last.reps : 10)}"></label></div>
    <div class="row" style="margin-top:10px"><label class="f">Back 0 to 10<select id="lBack">${Array.from({ length: 11 }, (_, i) => `<option ${last && +last.back === i ? "selected" : ""}>${i}</option>`).join("")}</select></label><label class="f">Knees 0 to 10<select id="lKnee">${Array.from({ length: 11 }, (_, i) => `<option ${last && +last.knee === i ? "selected" : ""}>${i}</option>`).join("")}</select></label></div>
    <label class="f" style="margin-top:10px">Notes<input id="lNotes" placeholder="How it felt"></label>
    ${last ? `<p class="muted" style="margin-top:8px">Last time (${esc(last.date)}): ${esc(last.kg || "BW")}${last.kg ? " kg" : ""} · ${esc(last.sets)} × ${esc(last.reps)}</p>` : ""}
    <button class="btn primary full" id="lAdd" style="margin-top:10px">Add to log</button></div>
    <div class="card"><h3>Morning-after check</h3><p class="muted">How do back and knees feel today, the morning after training?</p><div class="row"><label class="f">Back<select id="mBack">${Array.from({ length: 11 }, (_, i) => `<option ${S.days[t] && +S.days[t].mBack === i ? "selected" : ""}>${i}</option>`).join("")}</select></label><label class="f">Knees<select id="mKnee">${Array.from({ length: 11 }, (_, i) => `<option ${S.days[t] && +S.days[t].mKnee === i ? "selected" : ""}>${i}</option>`).join("")}</select></label></div><button class="btn full" id="mSave" style="margin-top:10px">Save today's check</button></div>
    <div class="card"><h3>History</h3>${sorted.length ? sorted.slice(0, 80).map((l) => `<div class="ex"><div class="t"><b>${esc((EXMAP[l.ex] || {}).name || l.ex)}</b><span class="muted">${esc(l.date)} · ${esc(l.kg || "BW")}${l.kg ? " kg" : ""} · ${esc(l.sets)} × ${esc(l.reps)} · back ${esc(l.back)} · knees ${esc(l.knee)}${l.notes ? " · " + esc(l.notes) : ""}</span></div><button class="chip" data-del="${l.id}">Remove</button></div>`).join("") : `<p class="muted">Nothing logged yet. Your first guided session will fill this in.</p>`}</div>`;
  $("#lEx").onchange = (e) => { logForm.ex = e.target.value; logForm.date = $("#lDate").value; renderLog(); };
  $("#lDate").onchange = (e) => (logForm.date = e.target.value);
  $("#lAdd").onclick = () => { const d = $("#lDate").value || t; S.logs.push({ id: Date.now(), date: d, ex: $("#lEx").value, kg: $("#lKg").value, sets: $("#lSets").value, reps: $("#lReps").value, back: $("#lBack").value, knee: $("#lKnee").value, notes: $("#lNotes").value }); save(); beep(880, 80); toast("Added ✓"); renderAll(); };
  $("#mSave").onclick = () => { const e = dayEntry(t); e.mBack = $("#mBack").value; e.mKnee = $("#mKnee").value; save(); toast(Math.max(+e.mBack, +e.mKnee) >= 6 ? "Red score: use easier options and see a GP or physio if it lingers." : "Saved ✓"); };
}

// ---------- PROGRESS ----------
function renderProgress() {
  const now = new Date(); const cw = Math.min(12, Math.max(1, weekOf(now)));
  const weeks = Array.from({ length: 12 }, (_, i) => i + 1);
  const inWeek = (dstr, w) => { const d = parseISO(dstr); return d && weekOf(d) === w; };
  const sess = weeks.map((w) => new Set(S.logs.filter((l) => inWeek(l.date, w)).map((l) => l.date)).size);
  const avgOf = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
  const back = weeks.map((w) => avgOf(S.logs.filter((l) => inWeek(l.date, w) && l.back !== "").map((l) => +l.back)));
  const knee = weeks.map((w) => avgOf(S.logs.filter((l) => inWeek(l.date, w) && l.knee !== "").map((l) => +l.knee)));
  const total = sessionDates().length;
  const wk = cw; const wkDates = Array.from({ length: 7 }, (_, i) => iso(addDays(START, (wk - 1) * 7 + i)));
  const cnt = (k) => wkDates.filter((d) => S.days[d] && S.days[d][k]).length;
  const best = {}; S.logs.forEach((l) => { const k = parseFloat(l.kg) || 0; if (!best[l.ex] || k > best[l.ex].kg) best[l.ex] = { kg: k, first: best[l.ex] ? best[l.ex].first : k }; });
  const firsts = {}; S.logs.slice().sort((a, b) => (a.date < b.date ? -1 : 1)).forEach((l) => { if (!(l.ex in firsts)) firsts[l.ex] = parseFloat(l.kg) || 0; });
  const bars = (vals, max, colour) => `<div class="bars">${vals.map((v, i) => `<div><i class="${v ? "" : "dim"}" style="height:${Math.max(3, (100 * v) / max)}%;${colour ? "background:" + colour : ""}"></i>W${i + 1}</div>`).join("")}</div>`;
  const pairBars = `<div class="bars">${weeks.map((w, i) => `<div><span style="display:flex;gap:2px;width:100%;height:100%;align-items:flex-end"><i style="height:${Math.max(3, back[i] * 10)}%;background:var(--accent)"></i><i style="height:${Math.max(3, knee[i] * 10)}%;background:var(--ink2)"></i></span>W${w}</div>`).join("")}</div>`;
  const maxPain = Math.max(back[wk - 1], knee[wk - 1]);
  $("#v-progress").innerHTML = `<div class="grid2"><div class="stat"><b>🔥 ${streak()}</b><span>day streak</span></div><div class="stat"><b>${sess[cw - 1] || 0}/3</b><span>sessions this week</span></div><div class="stat"><b>${total}</b><span>sessions in total</span></div><div class="stat"><b>${Math.round((100 * Math.min(total, 36)) / 36)}%</b><span>of 36 programme sessions</span></div></div>
  <div class="card"><h3>Sessions per week</h3>${bars(sess, 3)}</div>
  <div class="card"><h3>Average back and knee score per week</h3><div class="legend"><span><i style="background:var(--accent)"></i>Back</span><span><i style="background:var(--ink2)"></i>Knees</span><span>Lower is better, 0 to 10</span></div>${pairBars}</div>
  <div class="card"><h3>Week ${wk} at a glance</h3><p class="muted">${nice(parseISO(wkDates[0]))} to ${nice(parseISO(wkDates[6]))}</p><div class="grid3"><div class="stat"><b>${cnt("stretch")}/7</b><span>stretch days</span></div><div class="stat"><b>${cnt("walk")}/7</b><span>walk days</span></div><div class="stat"><b>${cnt("creatine")}/7</b><span>creatine days</span></div></div>
  ${maxPain >= 6 ? `<div class="callout" style="margin-top:10px"><b>Back or knees averaged 6 or more this week.</b> Use the easier options next week and see your GP or a physio if it does not settle.</div>` : ""}
  ${table(["Day", "Workout", "Stretch", "Walk", "Creatine", "Vit D", "Steps"], wkDates.map((d) => { const x = S.days[d] || {}; const yn = (b) => (b ? "✓" : "–"); return [nice(parseISO(d)), x.workout ? esc(x.workout) : "–", yn(x.stretch), yn(x.walk), yn(x.creatine), yn(x.vitd), x.steps ? Number(x.steps).toLocaleString("en-GB") : "–"]; }))}</div>
  <div class="card"><h3>Strength gains</h3>${Object.keys(best).length ? table(["Exercise", "First", "Best", "Change"], Object.keys(best).map((k) => [esc((EXMAP[k] || {}).name || k), (firsts[k] || "BW") + (firsts[k] ? " kg" : ""), (best[k].kg || "BW") + (best[k].kg ? " kg" : ""), best[k].kg - (firsts[k] || 0) > 0 ? `<span class="pill ok">+${Math.round((best[k].kg - firsts[k]) * 10) / 10} kg</span>` : "–"])) : `<p class="muted">Your heaviest lifts will show here after your first sessions.</p>`}</div>`;
}

// ---------- MUSIC ----------
function renderMusic() {
  $("#v-music").innerHTML = `<div class="card"><h2>Workout music</h2><p>Tap a mix to play it in the mini player. It stays docked at the bottom and keeps playing while you switch tabs and during a guided session. Hide the video to save battery.</p></div>
  <div class="card"><h3>YouTube mixes</h3><div class="list">${MUSIC_YT.map((m) => `<div class="ex"><img src="${ytThumb(m.id)}" alt="" style="object-fit:cover" loading="lazy"><div class="t"><b>${esc(m.title)}</b><span class="muted">${esc(m.by)}</span></div><button class="chip" data-play="${m.id}" data-title="${esc(m.title)}">▶ Play</button></div>`).join("")}</div></div>
  <div class="card"><h3>Spotify playlists</h3><p class="muted">Previews play here; log in to Spotify in this browser, or open in the app, for full tracks.</p><div class="list">${MUSIC_SP.map((p) => `<iframe class="sp" loading="lazy" title="${esc(p.title)}" src="https://open.spotify.com/embed/playlist/${p.id}?utm_source=generator" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe><a class="muted" href="https://open.spotify.com/playlist/${p.id}" target="_blank" rel="noopener">Open ${esc(p.title)} in Spotify</a>`).join("")}</div></div>`;
}
function collapseMini() { const m = $("#mini"); if (m.hidden || m.classList.contains("collapsed")) return; m.classList.add("collapsed"); document.body.classList.add("mini-collapsed"); $("#miniToggle").textContent = "Show video"; }
function playMini(id, title) {
  $("#miniFrame").innerHTML = `<iframe src="${ytEmbed(id, true)}" title="${esc(title)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
  $("#miniTitle").textContent = "♪ " + title; $("#mini").hidden = false; document.body.classList.add("has-mini");
}
$("#miniStop").onclick = () => { $("#miniFrame").innerHTML = ""; $("#mini").hidden = true; document.body.classList.remove("has-mini", "mini-collapsed"); };
$("#miniToggle").onclick = () => { const c = $("#mini").classList.toggle("collapsed"); document.body.classList.toggle("mini-collapsed", c); $("#miniToggle").textContent = c ? "Show video" : "Hide video"; };

// ---------- SETTINGS ----------
function renderSettings() {
  const r = S.settings.reminders; const perm = "Notification" in window ? Notification.permission : "unsupported";
  const tog = (k, label, on) => checkBtn("set:" + k, label, "", on);
  $("#v-settings").innerHTML = `<div class="card"><h2>Reminders</h2><p class="muted">Notifications: <b>${esc(perm)}</b></p>${perm !== "granted" && perm !== "unsupported" ? `<button class="btn primary full" id="sNotif">Allow notifications</button>` : `<button class="btn full" id="sTest">Send a test ping</button>`}
    <div class="list" style="margin-top:12px">${tog("workoutOn", "Workout days (Mon, Wed, Fri)", r.workoutOn)}<label class="f">Time<input type="time" data-time="workoutTime" value="${r.workoutTime}"></label>${tog("stretchOn", "Daily 10-minute stretch", r.stretchOn)}<label class="f">Time<input type="time" data-time="stretchTime" value="${r.stretchTime}"></label>${tog("suppsOn", "Supplements", r.suppsOn)}<label class="f">Time<input type="time" data-time="suppsTime" value="${r.suppsTime}"></label></div>
    <p class="muted" style="margin-top:12px">Reminders fire reliably while the app is open or in the background on your phone's recent apps. Fully closed, Android Chrome can only check now and then (installed app, periodic sync), and iPhone needs the app added to the Home Screen; neither guarantees an exact time without a push server. For a can't-miss alarm, also set a phone alarm.</p></div>
  <div class="card"><h2>Session feedback</h2><div class="list">${tog("sound", "Beeps (rest timer, sets)", S.settings.sound)}${tog("vibrate", "Vibration", S.settings.vibrate)}${tog("voice", "Spoken cues (\"Rest over\")", S.settings.voice)}${tog("theme", "Dark-room high contrast", S.settings.theme === "dark")}</div></div>
  <div class="card"><h2>Backup</h2><p class="muted">${canSave ? "Saved on this device in this browser." : "This browser is blocking storage; export a backup before closing."} Backups use the same format as the programme Page, so they move both ways.</p><div class="grid2"><button class="btn" id="bDown">Download backup</button><button class="btn" id="bCopy">Copy backup text</button></div><textarea id="bText" placeholder="Paste a backup here" style="margin-top:10px"></textarea><div class="grid2" style="margin-top:10px"><button class="btn primary" id="bLoad">Load pasted backup</button><label class="btn" style="display:grid;place-items:center">Load file<input type="file" id="bFile" accept="application/json,.json,.txt" hidden></label></div></div>
  <div class="card"><button class="btn full" id="sBack">← Back to Today</button></div>`;
  const on = (id, f) => { const b = $("#" + id); if (b) b.onclick = f; };
  on("sNotif", askNotif); on("sTest", () => ping("Test ping", "Notifications are working.", "test")); on("sBack", () => show("today"));
  $("#v-settings").querySelectorAll("[data-time]").forEach((i) => (i.onchange = (e) => { r[e.target.dataset.time] = e.target.value; delete S.fired[e.target.dataset.time.replace("Time", "").replace("supps", "supps")]; save(); toast("Reminder time saved"); }));
  const data = () => JSON.stringify({ logs: S.logs, days: S.days, settings: S.settings });
  on("bDown", () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([data()], { type: "application/json" })); a.download = "home-strength-backup-" + iso(new Date()) + ".json"; a.click(); });
  on("bCopy", async () => { try { await navigator.clipboard.writeText(data()); toast("Backup copied"); } catch (e) { $("#bText").value = data(); toast("Copy the text in the box"); } });
  const importText = (txt) => { try { const p = JSON.parse(txt); if (!p || !Array.isArray(p.logs)) throw 0; S.logs = p.logs; S.days = p.days || {}; if (p.settings) S.settings = Object.assign(S.settings, p.settings); save(); applyTheme(); renderAll(); toast("Backup loaded: " + p.logs.length + " log entries"); } catch (e) { toast("That isn't a valid backup."); } };
  on("bLoad", () => importText($("#bText").value));
  $("#bFile").onchange = (e) => { const f = e.target.files[0]; if (f) f.text().then(importText); };
}

// ---------- global events ----------
document.addEventListener("click", (ev) => {
  const b = ev.target.closest("[data-video],[data-play],[data-check],[data-pick],[data-phase],[data-startday],[data-open],[data-del],#closeModal");
  if (!b) return;
  if (b.dataset.video) { openVideo(b.dataset.video, b.dataset.title); return; }
  if (b.dataset.play) { playMini(b.dataset.play, b.dataset.title); return; }
  if (b.closest("#session")) return; // session handles its own checks
  if (b.dataset.check) {
    const k = b.dataset.check;
    if (k.startsWith("set:")) { const s = k.slice(4); if (s === "theme") { S.settings.theme = S.settings.theme === "dark" ? "light" : "dark"; applyTheme(); } else if (s in S.settings.reminders) S.settings.reminders[s] = !S.settings.reminders[s]; else S.settings[s] = !S.settings[s]; save(); renderSettings(); return; }
    const e = dayEntry(iso(new Date())); e[k] = e[k] ? (k === "workout" ? "" : false) : (k === "workout" ? "Marked done" : true); if (e[k]) { beep(990, 70); buzz(35); } save(); renderToday(); return;
  }
  if (b.dataset.pick) { if (b.dataset.pick === "clear") chosenDay = null; else { const [ph, day] = b.dataset.pick.split("-").map(Number); chosenDay = { ph, day }; } renderToday(); window.scrollTo(0, 0); return; }
  if (b.dataset.phase) { planPhase = +b.dataset.phase; renderPlan(); return; }
  if (b.dataset.startday) { const [ph, day] = b.dataset.startday.split("-").map(Number); startSession(ph, day, false); return; }
  if (b.dataset.open) { show("library"); const d = $("#ex-" + b.dataset.open); if (d) { d.open = true; d.scrollIntoView({ behavior: "smooth" }); } return; }
  if (b.dataset.del) { if (confirm("Remove this entry?")) { S.logs = S.logs.filter((l) => String(l.id) !== b.dataset.del); save(); renderAll(); } return; }
});
function openVideo(id, title) {
  const m = $("#modal"); m.hidden = false;
  m.innerHTML = `<div class="box"><div class="row between" style="margin-bottom:10px"><b>${esc(title || "Demo")}</b><button class="iconbtn" id="closeModal">✕ Close</button></div><iframe class="yt" src="${ytEmbed(id, true)}" title="${esc(title)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe><p class="muted" style="margin-top:8px">Not playing? <a href="${ytWatch(id)}" target="_blank" rel="noopener">Open on YouTube</a></p></div>`;
  $("#closeModal").onclick = closeModal;
}
function closeModal() { const m = $("#modal"); m.innerHTML = ""; m.hidden = true; }
$("#modal").addEventListener("click", (e) => { if (e.target.id === "modal") closeModal(); });

function show(tab) {
  document.querySelectorAll(".view").forEach((v) => (v.hidden = v.id !== "v-" + tab));
  document.querySelectorAll("#tabs button").forEach((b) => b.classList.toggle("on", b.dataset.tab === tab));
  if (tab === "settings") renderSettings();
  if (tab === "progress") renderProgress();
  if (tab === "log") renderLog();
  window.scrollTo(0, 0); location.hash = tab;
}
$("#tabs").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) { unlockAudio(); show(b.dataset.tab); } });
$("#btnSettings").onclick = () => show("settings");
function applyTheme() { document.documentElement.dataset.theme = S.settings.theme === "dark" ? "dark" : "light"; const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = S.settings.theme === "dark" ? "#0B0C0E" : "#FF5A1F"; }
function renderAll() { renderToday(); renderPlan(); renderLibrary(); renderLog(); renderProgress(); }
applyTheme(); renderAll(); renderMusic();
const h = (location.hash || "").slice(1); if (["plan", "library", "log", "progress", "music", "settings"].includes(h)) show(h);
setTimeout(checkReminders, 1500);

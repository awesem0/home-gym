/* OSIMO Home Strength service worker: offline cache + reminder checks */
const VERSION = "v1";
const CACHE = "home-strength-" + VERSION;
const ASSETS = ["./", "index.html", "styles.css", "app.js", "data.js", "manifest.json",
  "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-192.png", "icons/maskable-512.png", "icons/apple-touch-icon.png",
  "img/bridge.webp", "img/thrust.webp", "img/rdl.webp", "img/squat.webp", "img/lunge.webp", "img/press.webp",
  "img/row.webp", "img/birddog.webp", "img/deadbug.webp", "img/carry.webp"];
const STATE = "home-strength-state";

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith("home-strength-") && k !== CACHE && k !== STATE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // YouTube, Spotify, thumbnails: network only
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put("index.html", copy)); return r; }).catch(() => caches.match("index.html")));
    return;
  }
  // Stale-while-revalidate: instant from cache, refreshed in the background so updates arrive on the next open.
  e.respondWith(caches.open(CACHE).then((c) => c.match(req, { ignoreSearch: true }).then((hit) => {
    const net = fetch(req).then((r) => { if (r.ok) c.put(req, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  })));
});

async function readState() {
  const c = await caches.open(STATE); const r = await c.match("state.json");
  return r ? r.json() : null;
}
async function writeState(s) {
  const c = await caches.open(STATE);
  await c.put("state.json", new Response(JSON.stringify(s), { headers: { "Content-Type": "application/json" } }));
}
const pad = (n) => (n < 10 ? "0" + n : "" + n);
const iso = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());

// Same rules as the page: workout pings Mon/Wed/Fri from 9 Nov 2026, stretch and supplements daily.
async function checkReminders() {
  const s = await readState();
  if (!s || !s.reminders) return;
  const now = new Date(); const today = iso(now); const hm = pad(now.getHours()) + ":" + pad(now.getMinutes());
  const fired = s.fired || {}; let changed = false;
  const dow = now.getDay(); const started = today >= "2026-11-09" && today <= "2027-01-31";
  const list = [
    { key: "workout", on: s.reminders.workoutOn && started && [1, 3, 5].includes(dow) && !(s.doneToday && s.doneToday[today] && s.doneToday[today].workout), time: s.reminders.workoutTime, title: "Workout day", body: "Today's strength session is ready. Tap to start." },
    { key: "stretch", on: s.reminders.stretchOn && !(s.doneToday && s.doneToday[today] && s.doneToday[today].stretch), time: s.reminders.stretchTime, title: "10-minute stretch", body: "Hips, hamstrings, lower back and knees. Ten minutes." },
    { key: "supps", on: s.reminders.suppsOn && !(s.doneToday && s.doneToday[today] && s.doneToday[today].supps), time: s.reminders.suppsTime, title: "Supplements", body: "Creatine and vitamin D, if you're taking them." },
  ];
  for (const r of list) {
    if (r.on && r.time && hm >= r.time && fired[r.key] !== today) {
      await self.registration.showNotification(r.title, { body: r.body, icon: "icons/icon-192.png", badge: "icons/maskable-192.png", tag: "hs-" + r.key, vibrate: [200, 100, 200], data: { url: "./" } });
      fired[r.key] = today; changed = true;
    }
  }
  if (changed) { s.fired = fired; await writeState(s); }
}

self.addEventListener("message", (e) => {
  const m = e.data || {};
  if (m.type === "state") e.waitUntil(writeState(m.state));
  if (m.type === "check") e.waitUntil(checkReminders());
});
self.addEventListener("periodicsync", (e) => { if (e.tag === "hs-reminders") e.waitUntil(checkReminders()); });
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
    for (const c of list) { if ("focus" in c) return c.focus(); }
    return self.clients.openWindow("./");
  }));
});

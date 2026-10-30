# OSIMO Home Strength (PWA)

12-week back- and knee-friendly home strength programme, 9 Nov 2026 to 31 Jan 2027.
Plain HTML/CSS/JS, no build step, all paths relative, so it works at any subpath
such as https://awesem0.github.io/<repo>/.

## Deploy to GitHub Pages
1. Create a repo (e.g. `home-strength`) and push the contents of this folder to the root of `main`.
2. Repo Settings > Pages > Build and deployment > Deploy from a branch > `main` / `(root)`.
3. Open https://awesem0.github.io/home-strength/ on your phone, then
   Android Chrome: menu > Install app / Add to Home screen; iPhone Safari: Share > Add to Home Screen.
4. Open the app, tap Allow notifications, set reminder times in Settings.

After changing files, bump `VERSION` in `sw.js` so phones pick up the new cache.

## Files
- index.html, styles.css, app.js: the app
- data.js: programme, exercises, mobility, music, sources
- sw.js: offline cache and reminder checks (periodic sync where supported)
- manifest.json: start_url and scope are "./"
- icons/: 192 and 512 PNGs, separate maskable versions, Apple touch icon
- img/: exercise illustrations

Data is stored in this browser (localStorage key `osimo-home-programme-v1`, same format as the programme Page).
Use Settings > Backup to export or import.

# Editing the website

All the words are in `public/index.html`. Each section starts with a comment you can search for:

| Search for | Section |
|---|---|
| `===== HERO =====` | Headline, intro paragraph, buttons |
| `===== STATS BAND =====` | The four numbers on the navy band |
| `===== HOW IT WORKS =====` | Three steps and the animated invoice demo |
| `===== WHY US =====` | Capture apps vs. WorkUnit Labs |
| `===== WHAT "ACCEPTED" MEANS =====` | The six check cards |
| `===== PRICING =====` | Plans and prices |
| `===== DATA & SECURITY =====` | Data practices (keep every line true) |
| `===== FAQ =====` | Questions and answers |
| `===== PILOT SIGN-UP =====` | Form text and fields |

Change the text between the tags (for example `<h3>Pilot</h3>` → `<h3>Starter</h3>`), keeping the tags themselves.

- **Colors and fonts:** the top of `public/styles.css` (`--navy`, `--blue`, and so on).
- **The 3D model:** `public/hero3d.js`. Letter colors are in the `specs` list (`color: 0x0c2a55` etc.); motion speeds are in `render()`. Add `?debug3d` to the address to enable test captures.
- **Images:** `public/assets/`. Keep file names the same, or update them in `index.html`.

## Preview on your Mac

```bash
cd ~/Downloads/workunit-labs/website && ../tools/node_modules/.bin/wrangler pages dev public --kv LEADS --port 8793
```

Then open http://127.0.0.1:8793. Press Ctrl+C to stop. Sign-ups here go to a local test store, not the real one.

## Publish changes

```bash
cd ~/Downloads/workunit-labs/website && ../tools/node_modules/.bin/wrangler pages deploy --branch main
```

The site updates within a minute. Every deployment is kept in Cloudflare (Workers & Pages → workunit-site → Deployments), so you can roll back with one click.

## Where sign-ups go

The form posts to `functions/api/pilot.js`, which saves each request in the Cloudflare KV store `workunit-leads`. You read them in the secure portal under *Pilot requests*.

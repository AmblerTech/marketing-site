/* Ambler "What's coming" roadmap, embedded on useambler.io/roadmap.
   Built by product/roadmap/build_roadmap.py. Do not edit the copy on the roadmap branch by hand.
   Squarespace code block (hourly stamp: jsDelivr tells browsers to cache for 7 days, the edge is purged on every update):
   <div id="ambler-roadmap"></div><script>(function(){var s=document.createElement('script');s.src='https://cdn.jsdelivr.net/gh/AmblerTech/marketing-site@roadmap/roadmap.js?h='+Math.floor(Date.now()/36e5);document.body.appendChild(s);})();</script>
   Renders inside a shadow root, so the site's CSS and this page's CSS never touch each other. */
(function () {
  const D = {"updated": "2026-11-12", "items": [{"id": "label-takeover", "title": "Complete a release on your artist's behalf", "summary": "If your label handles the paperwork for an artist, you can take a release all the way to delivery yourself. The artist doesn't have to log in first. Every step you take on their behalf is signed and dated, so everyone can see who confirmed what.", "changes": ["Choose \"I'll complete it myself\" for an artist", "Add a short reason, such as \"approved by text message\"", "The artist is kept informed and can still flag anything that's wrong"], "stage": "now", "col": "2026-11", "when": "Expected November 2026", "design": "2026-10-05_label-full-take-over-mockups.html"}, {"id": "oneseven-fixes", "title": "What you fill in for an artist is kept, and shown to them", "summary": "Details your label enters on an artist's behalf stay with the release all the way to delivery, and the artist sees them filled in, ready to check.", "changes": ["Society member numbers you enter when you create an artist are kept on every route", "Credit a producer by their artist name or their legal name, track by track", "The artist sees what you filled in, marked \"filled in by your label, please check\""], "stage": "now", "col": "2026-12", "when": "Expected December 2026", "design": null}, {"id": "distributor-genres", "title": "Genres that match your distributor", "summary": "Pick from genres your distributor actually accepts, including the detailed electronic genres DJs and download stores use, so the upload file never needs a genre fixed by hand.", "changes": ["Detailed electronic genres such as Afro House, Organic House, Melodic House and Hard Techno", "Each genre is matched to your distributor's own list, so what you pick is what gets delivered", "Later: the list shows only the genres your distributor offers"], "stage": "next", "col": "2026-11", "when": "Expected November 2026", "design": null}, {"id": "orchard-complete", "title": "Everything your distributor asks for, filled in", "summary": "The Orchard upload file Ambler prepares will have every column filled in, so you don't have to add anything by hand before you upload.", "changes": ["Track version (radio edit, extended mix and so on)", "Lyrics and lyrics language, shared with the artist", "Preview start time, focus track and your own project number", "A short checklist of what's left to do after uploading"], "stage": "next", "col": "2026-12", "when": "Expected December 2026", "design": "2026-11-05_ms1-orchard-file-complete-mockups.html"}, {"id": "release-plan", "title": "See every release in one plan", "summary": "All of your label's releases in one place: a list to work from, and a calendar by month, week or quarter that shows what goes out when.", "changes": ["A release list across every project", "Month, week, quarter and list views, with a target week when the day isn't set yet", "\"Upload by\" dates per distributor, so nothing is late", "A group view showing every sublabel's releases together"], "stage": "next", "col": "2026-12", "when": "Expected December 2026", "design": "2026-11-06_ms2a-release-plan-mockups.html"}, {"id": "distributor-handoff", "title": "Your distributor collects finished releases directly", "summary": "When a release is confirmed in Ambler, a connected distributor can pick it up directly. You don't type it in a second time.", "changes": ["Starting with one distributor, then more", "Works next to the upload files you already download today"], "stage": "planned", "col": "later", "when": "Date to be confirmed", "design": null}, {"id": "release-owners", "title": "Everyone at your label owns their part", "summary": "Give each release a deal owner, a PM and a delivery owner. Ambler lets the next person know when it's their turn, so hand-overs stop living in email.", "changes": ["Owners per release, with \"Assigned to you\" for each person", "A&R can prepare a registration and hand it to the PM", "Keep the deal terms and contract on the project, open the contract right there and note the publishing rights it covers", "Simple folders for campaign files", "Optionally, limit a team member to editing their own artists"], "stage": "planned", "col": "2026-12", "when": "Expected December 2026", "design": "2026-11-09_ms2b-release-owners-mockups.html"}, {"id": "assistant", "title": "Start a registration from a document", "summary": "Drop in a label copy or paste an artist's email, and Ambler prepares a draft registration. Every value shows where it came from, and nothing is sent until you say so.", "changes": ["From a label copy, split sheet or email", "Bring in your back catalogue", "Always a draft for you to check"], "stage": "planned", "col": "later", "when": "Early 2027", "design": null}, {"id": "artist-profile", "title": "Artist profile and press kit", "summary": "Keep an artist's bio, socials, press photos and videos in one place and reuse them on every release, without asking for them again each time.", "changes": ["One profile per artist name", "Press photos and video alongside it", "Export what you need for a pitch"], "stage": "planned", "col": "later", "when": "Early 2027", "design": null}, {"id": "pm-route", "title": "Exploring with you: tracking the work after delivery", "summary": "We're asking labels whether they'd like to track promotion work and get writing help for pitches inside Ambler. Tell us if this would help you.", "changes": ["Only built if labels say they'd use it every week"], "stage": "exploring", "col": "later", "when": "Being explored", "design": null}], "columns": [{"key": "2026-11", "label": "November 2026"}, {"key": "2026-12", "label": "December 2026"}, {"key": "later", "label": "Early 2027 and later"}]};
  const BASE = new URL('.', document.currentScript ? document.currentScript.src : location.href).href;
  const CSS = `
/* Layout idea: a calm month-by-month strip a label can read in a minute; each card opens the "what changes for you" and the planned screens. Ambler brand tokens. */
:host{
  --bg:#f7f7f8; --surface:#ffffff; --ink:#181d27; --ink2:#414651; --muted:#717680; --line:#e9eaeb; --line2:#d5d7da;
  --brand:#ff6b35; --brand50:#fff3ed; --brandline:#ffd6c2; --purple:#6938ef; --purple50:#f4f3ff;
  --grad:linear-gradient(90deg,#fff6b7 0%,#fb7c8c 60%,#d46879 100%);
  --font:inherit;
  color-scheme:light;
}


*{box-sizing:border-box}
:host{display:block;color:var(--ink);font:15px/1.55 var(--font);text-align:left}
h1,h2,h3{text-wrap:balance;margin:0}
.rm{max-width:1180px;margin:0 auto;padding:0 0 48px}
.hero{padding:40px 0 8px;display:flex;flex-direction:column;gap:10px}
.brandline{height:6px;width:96px;border-radius:999px;background:var(--grad)}
.hero h1{font-size:32px;letter-spacing:-.015em}
.hero p{color:var(--ink2);max-width:62ch;margin:0}
.hero small{color:var(--muted)}
.keys{display:flex;gap:16px;flex-wrap:wrap;margin:22px 0 14px;font-size:13px;color:var(--ink2)}
.chip{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:2px 10px;font-size:12px;font-weight:600;border:1px solid var(--line2);background:var(--surface);color:var(--ink2);white-space:nowrap}
.chip::before{content:"";width:8px;height:8px;border-radius:50%;background:var(--c)}
.chip.now{--c:var(--brand);background:var(--brand50);border-color:var(--brandline);color:var(--ink)}
.chip.next{--c:var(--purple)}
.chip.planned{--c:var(--line2)}
.chip.exploring{--c:transparent;border-style:dashed}
.chip.exploring::before{border:1.5px dashed var(--muted)}
.strip{display:grid;grid-template-columns:repeat(var(--cols),minmax(220px,1fr));gap:14px;overflow-x:auto;padding-bottom:6px}
.col{display:flex;flex-direction:column;gap:12px;min-width:0}
.col h2{font-size:13px;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);font-weight:700;padding:6px 2px;border-bottom:2px solid var(--line2)}
.col.cur h2{color:var(--ink);border-bottom-color:var(--brand)}
.card{all:unset;box-sizing:border-box;cursor:pointer;display:flex;flex-direction:column;gap:8px;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:14px 16px;transition:border-color .15s, box-shadow .15s}
.card:hover{border-color:var(--line2);box-shadow:0 6px 16px rgba(16,24,40,.07)}
.card:focus-visible{outline:2px solid var(--brand);outline-offset:2px}
.card .chip{align-self:flex-start}
.card .h3{font-weight:700;font-size:16px;line-height:1.3}
.card .p{margin:0;color:var(--ink2);font-size:14px}
.card .more{font-size:13px;font-weight:600;color:var(--purple)}
.card.now{border-color:var(--brandline)}
.span-note{grid-column:1/-1;font-size:13px;color:var(--muted)}
.foot{margin-top:36px;padding:16px 18px;border-radius:14px;background:var(--surface);border:1px solid var(--line);color:var(--ink2);font-size:14px;max-width:80ch}
@media (max-width:700px){ .strip{grid-template-columns:1fr} .hero h1{font-size:26px} }
/* dialog */
.scrim{position:fixed;inset:0;background:rgba(16,24,40,.45);display:none;z-index:20;align-items:flex-start;justify-content:center;padding:40px 16px;overflow-y:auto}
.scrim.open{display:flex}
.dlg{background:var(--surface);border-radius:16px;max-width:640px;width:100%;padding:22px 24px;display:flex;flex-direction:column;gap:14px}
.dlg .top{display:flex;gap:10px;align-items:flex-start}
.dlg h2{font-size:22px;line-height:1.25}
.x{all:unset;cursor:pointer;margin-left:auto;font-size:22px;line-height:1;padding:2px 8px;border-radius:8px;color:var(--muted)}
.x:hover{background:var(--bg)} .x:focus-visible{outline:2px solid var(--brand)}
.dlg ul{margin:0;padding-left:20px;color:var(--ink2)} .dlg li{margin:4px 0}
.btn{all:unset;cursor:pointer;display:inline-flex;gap:6px;align-items:center;background:var(--brand);color:#fff;border-radius:10px;padding:8px 14px;font-weight:600;font-size:14px}
.btn:hover{filter:brightness(.95)} .btn:focus-visible{outline:2px solid var(--ink);outline-offset:2px}
.muted{color:var(--muted);font-size:13px}
.viewer{position:fixed;inset:0;z-index:30;background:rgba(16,24,40,.6);display:none;padding:20px}
.viewer.open{display:flex;flex-direction:column}
.viewer .bar{display:flex;gap:10px;align-items:center;background:var(--surface);border-radius:12px 12px 0 0;padding:10px 14px}
.viewer iframe{flex:1;border:0;background:#fff;border-radius:0 0 12px 12px;width:100%}
.viewer button{all:unset;cursor:pointer;margin-left:auto;border:1px solid var(--line2);border-radius:8px;padding:5px 12px;font-weight:600;font-size:13px}
@media (prefers-reduced-motion:reduce){.card{transition:none}}

*{box-sizing:border-box} button{font:inherit} .dlg h2{margin-top:8px} .sum{margin:0;color:var(--ink2)} .lbl{font-size:14px}
.scrim{z-index:99990}.viewer{z-index:99991} .hero h1{font-family:inherit;text-transform:none;margin:0}`;
  const host = document.getElementById('ambler-roadmap') || (() => { const d = document.createElement('div'); d.id = 'ambler-roadmap'; (document.currentScript?.parentNode || document.body).appendChild(d); return d; })();
  const root = host.attachShadow({ mode: 'open' });
  // Dialog + screen viewer live in their own host on <body>: Squarespace sections create stacking contexts
  // that would otherwise trap a fixed overlay under the site header.
  const ohost = document.createElement('div'); ohost.id = 'ambler-roadmap-overlay'; document.body.appendChild(ohost);
  const oroot = ohost.attachShadow({ mode: 'open' });
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = s => root.querySelector(s) || oroot.querySelector(s);
  const LABEL = { now: 'Building now', next: 'Up next', planned: 'Planned', exploring: 'Exploring with you' };
  const upd = new Date(D.updated + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const curKey = new Date().toISOString().slice(0, 7);
  root.innerHTML = `<style>${CSS}</style>
  <div class="rm">
    <div class="hero">
      <div class="brandline" aria-hidden="true"></div>
      <h1>What's coming to Ambler</h1>
      <p>What we're building next and roughly when, written for the labels who use Ambler. Click any card to see what changes for you and, where it's ready, a sketch of the screens.</p>
      <small>Updated ${esc(upd)}. The order may change as we learn from you.</small>
    </div>
    <div class="keys"><span class="chip now">Building now</span><span class="chip next">Up next</span><span class="chip planned">Planned</span><span class="chip exploring">Exploring with you</span></div>
    <div class="strip" style="--cols:${D.columns.length}">
      ${D.columns.map(c => `<div class="col ${c.key === curKey ? 'cur' : ''}"><h2>${esc(c.label)}</h2>
        ${D.items.filter(i => i.col === c.key).map(i => `<button class="card ${i.stage === 'now' ? 'now' : ''}" data-id="${esc(i.id)}">
          <span class="chip ${i.stage}">${LABEL[i.stage]}</span><span class="h3">${esc(i.title)}</span><span class="p">${esc(i.summary)}</span>
          <span class="more">${i.design ? 'See what changes and the planned screens' : 'See what changes'} →</span></button>`).join('')}</div>`).join('')}
    </div>
    <div class="foot"><b>Something missing, or something you'd move up?</b> Tell us. This plan is shaped by the labels using Ambler, and we update this page as things ship.</div>
  </div>`;
  oroot.innerHTML = `<style>${CSS} :host{all:initial;font-family:${getComputedStyle(host).fontFamily.replace(/`/g, '')}}</style>
  <div class="scrim" id="scrim" role="dialog" aria-modal="true" aria-labelledby="dTitle"><div class="dlg" id="dlg"></div></div>
  <div class="viewer" id="viewer" role="dialog" aria-label="Planned screens"><div class="bar"><b id="vTitle"></b><button id="vClose">Close</button></div><iframe id="vFrame" title="Planned screens" sandbox="allow-same-origin"></iframe></div>`;

  let lastFocus = null;
  function open(id) {
    const i = D.items.find(x => x.id === id); if (!i) return;
    lastFocus = root.activeElement;
    $('#dlg').innerHTML = `<div class="top"><div><span class="chip ${i.stage}">${LABEL[i.stage]}</span> <span class="muted">${esc(i.when)}</span><h2 id="dTitle">${esc(i.title)}</h2></div><button class="x" aria-label="Close">×</button></div>
      <p class="sum">${esc(i.summary)}</p>
      ${i.changes.length ? `<div><b class="lbl">What changes for you</b><ul>${i.changes.map(p => `<li>${esc(p)}</li>`).join('')}</ul></div>` : ''}
      ${i.design ? `<div><button class="btn" id="seeDesign">See the planned screens</button><div class="muted" style="margin-top:6px">Early sketches with example data. The finished screens may look different.</div></div>` : `<div class="muted">Screens for this aren't drawn yet.</div>`}`;
    $('#scrim').classList.add('open'); $('#dlg .x').focus();
    $('#dlg .x').onclick = close;
    const b = $('#seeDesign');
    if (b) b.onclick = async () => {
      $('#vTitle').textContent = i.title; $('#viewer').classList.add('open');
      const f = $('#vFrame'); f.srcdoc = '<p style="font:14px sans-serif;padding:20px">Loading…</p>';
      try { const r = await fetch(BASE + 'designs/' + i.design + '?h=' + Math.floor(Date.now() / 36e5)); f.srcdoc = await r.text(); }
      catch (e) { f.srcdoc = '<p style="font:14px sans-serif;padding:20px">The screens could not be loaded. Please try again.</p>'; }
    };
  }
  function close() { $('#scrim').classList.remove('open'); lastFocus?.focus?.(); }
  $('#vClose').onclick = () => { $('#viewer').classList.remove('open'); $('#vFrame').srcdoc = ''; };
  $('#scrim').addEventListener('click', e => { if (e.target.id === 'scrim') close(); });
  document.addEventListener('keydown', e => { if (e.key !== 'Escape') return; if ($('#viewer').classList.contains('open')) $('#vClose').click(); else if ($('#scrim').classList.contains('open')) close(); });
  root.addEventListener('click', e => { const c = e.target.closest('.card'); if (c) open(c.dataset.id); });
})();

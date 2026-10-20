// Builds the MCP App report view into one self-contained HTML file:
//   modules/mcp/ui/report.ts  →  modules/mcp/ui/report.html  (committed)
// Run after editing the view:  npm run build:mcp-ui
// The test suite fails if report.html is older than its source.
import { build } from "esbuild";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

const dir = new URL("../modules/mcp/ui/", import.meta.url);
const source = readFileSync(new URL("report.ts", dir), "utf8");

const bundle = await build({
    entryPoints: [new URL("report.ts", dir).pathname],
    bundle: true,
    format: "iife",
    minify: true,
    target: "es2020",
    write: false,
    legalComments: "none",
});

const css = `
:root{--bg:#fff;--fg:#131417;--muted:#717680;--line:#e4e4ea;--card:#f5f5f7;--pos:#16a34a;--neg:#e11d48;color-scheme:light}
:root[data-theme=dark]{--bg:#131417;--fg:#fff;--muted:#b1b3b8;--line:#373a41;--card:#1f1f1f;--pos:#4ade80;--neg:#fb7185;color-scheme:dark}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]){--bg:#131417;--fg:#fff;--muted:#b1b3b8;--line:#373a41;--card:#1f1f1f;--pos:#4ade80;--neg:#fb7185;color-scheme:dark}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif}
main{padding:16px;max-width:760px;margin:0 auto}h1{font-size:18px;margin:0}h2{font-size:14px;margin:18px 0 8px}
.muted,#subtitle,#rules,#assumptions,#disclaimer,.axis{color:var(--muted)}#subtitle{font-size:12px;margin-top:2px}#rules{font-size:13px;margin:8px 0 0}
.kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:14px}@media (max-width:520px){.kpis{grid-template-columns:repeat(2,minmax(0,1fr))}}
.kpi{background:var(--card);border-radius:10px;padding:8px 10px}.kpi-label{font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted)}.kpi-value{font-size:17px;font-weight:700;font-variant-numeric:tabular-nums}
.pos{color:var(--pos)}.neg{color:var(--neg)}
.tabs{display:flex;gap:4px;margin:16px 0 6px}.tab,.btn{font:inherit;font-size:12px;font-weight:600;border:1px solid var(--line);background:transparent;color:var(--fg);border-radius:8px;padding:4px 10px;cursor:pointer}
.tab[aria-selected=true]{background:var(--fg);color:var(--bg)}.btn:disabled{opacity:.4;cursor:default}
#chart svg{width:100%;height:200px;display:block}.line-pos{fill:none;stroke:var(--pos);stroke-width:2}.line-neg{fill:none;stroke:var(--neg);stroke-width:2}
.area-pos{fill:var(--pos);opacity:.12}.area-neg{fill:var(--neg);opacity:.15}.baseline{stroke:var(--muted);stroke-dasharray:4 4;stroke-width:1}
.axis{display:flex;justify-content:space-between;font-size:11px;margin-top:2px}
.heat{border-collapse:separate;border-spacing:2px;font-size:11px;font-variant-numeric:tabular-nums}.heat th{font-weight:600;color:var(--muted);padding:0 4px}
.heat td{min-width:34px;text-align:center;padding:3px 2px;border-radius:4px}.heat td.up{background:color-mix(in srgb,var(--pos) calc(var(--a)*100%),transparent)}.heat td.down{background:color-mix(in srgb,var(--neg) calc(var(--a)*100%),transparent)}.heat td.flat{background:var(--card);color:var(--muted)}
.scroll{overflow-x:auto}table.trades{width:100%;border-collapse:collapse;font-size:12px}.trades th,.trades td{text-align:left;padding:5px 6px;border-top:1px solid var(--line);white-space:nowrap}.trades th{color:var(--muted);font-weight:600;border-top:0}.num{text-align:right!important;font-variant-numeric:tabular-nums}
.pager{display:flex;align-items:center;gap:8px;margin-top:8px;font-size:12px}#warnings{margin:10px 0 0;padding-left:18px;font-size:12px}#assumptions,#disclaimer{font-size:12px;margin:10px 0 0}
.top{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Backtest report</title>
<!-- built by scripts/build-mcp-ui.ts from report.ts; source sha256 ${createHash("sha256").update(source).digest("hex")} -->
<style>${css.trim()}</style>
</head>
<body>
<main>
  <div class="top">
    <div><h1 id="title">Loading backtest…</h1><div id="subtitle"></div></div>
    <button id="open" class="btn" hidden>Open full report</button>
  </div>
  <p id="rules"></p>
  <div id="kpis" class="kpis"></div>
  <div class="tabs" role="tablist"><button class="tab" data-kind="equity" aria-selected="true">Equity</button><button class="tab" data-kind="drawdown" aria-selected="false">Drawdown</button></div>
  <div id="chart"></div>
  <h2>Monthly returns (%)</h2>
  <div id="monthly" class="scroll"></div>
  <h2>Trades</h2>
  <div class="scroll"><table class="trades"><thead><tr><th>Side</th><th>Entry</th><th>Exit</th><th>Reason</th><th class="num">Net P&amp;L</th></tr></thead><tbody id="trades"></tbody></table></div>
  <div class="pager"><button id="prev" class="btn" disabled>Previous</button><button id="next" class="btn" disabled>Next</button><span id="page" class="muted"></span></div>
  <ul id="warnings"></ul>
  <p id="assumptions"></p>
  <p id="disclaimer"></p>
</main>
<script>${bundle.outputFiles[0].text.replace(/<\/script/gi, "<\\/script")}</script>
</body>
</html>
`;

writeFileSync(new URL("report.html", dir), html);
console.log(`report.html written (${(html.length / 1024).toFixed(1)} KB)`);

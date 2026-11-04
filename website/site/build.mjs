// Zero-dependency static build: src/pages/*.html + src/layout.html + site.config.json -> dist/
// Run: node build.mjs
import { readFileSync, writeFileSync, mkdirSync, readdirSync, cpSync, rmSync } from "node:fs";
import { join } from "node:path";

const root = new URL(".", import.meta.url).pathname;
const cfg = JSON.parse(readFileSync(join(root, "site.config.json"), "utf8"));
const layout = readFileSync(join(root, "src/layout.html"), "utf8");
const dist = join(root, "dist");

// Derived values usable in pages as {{key}}
const vars = {
  ...cfg,
  year: String(new Date().getFullYear()),
  whatsappLink: cfg.whatsapp
    ? `https://wa.me/${cfg.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Hi, I came from Business Leaks. I'd like a free leak check.")}`
    : "",
  emailLink: `mailto:${cfg.email}`,
};

// <!--if:key-->...<!--/if:key--> keeps the block when vars[key] is truthy;
// <!--if:!key-->...<!--/if:!key--> keeps it when falsy.
const conditionals = (html, page = {}) =>
  html.replace(/<!--if:(!?)(\w+)-->([\s\S]*?)<!--\/if:\1\2-->/g, (_, not, key, body) =>
    Boolean(page[key] ?? vars[key]) !== Boolean(not) ? body : ""
  );

const fill = (html, extra) =>
  html.replace(/\{\{(\w+)\}\}/g, (m, key) => {
    const v = extra[key] ?? vars[key];
    return v === undefined ? m : String(v);
  });

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
cpSync(join(root, "public"), dist, { recursive: true });

const pagesDir = join(root, "src/pages");
for (const file of readdirSync(pagesDir).filter((f) => f.endsWith(".html"))) {
  const raw = readFileSync(join(pagesDir, file), "utf8");
  const m = raw.match(/^---\n([\s\S]*?)\n---\n/);
  const meta = Object.fromEntries(
    (m ? m[1] : "").split("\n").filter(Boolean).map((l) => {
      const i = l.indexOf(":");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
  );
  const body = m ? raw.slice(m[0].length) : raw;
  const slug = file.replace(/\.html$/, "");
  const path = slug === "index" ? "/" : slug === "404" ? "/404" : `/${slug}/`;
  const page = { ...meta, content: body, path, canonical: cfg.domain + (slug === "404" ? "/" : path) };
  for (const n of ["home", "fixes", "proof", "about"]) page[`nav_${n}`] = meta.nav === n ? ' aria-current="page"' : "";
  page.dock = meta.dock !== "no";

  let html = conditionals(layout.replace("{{content}}", body), page);
  html = fill(fill(html, page), page); // twice so page text can use {{vars}}

  const out = slug === "index" || slug === "404" ? join(dist, `${slug}.html`) : join(dist, slug, "index.html");
  mkdirSync(join(out, ".."), { recursive: true });
  writeFileSync(out, html);
  const left = html.match(/\{\{\w+\}\}/g);
  if (left) console.warn(`  ! ${file}: unfilled ${[...new Set(left)].join(", ")}`);
  console.log(`built ${path}`);
}

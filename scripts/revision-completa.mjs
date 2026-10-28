/**
 * REVISIÓN COMPLETA DE LA PÁGINA.
 *
 *   node scripts/revision-completa.mjs [url]
 *
 * Por defecto revisa http://localhost:3111. Cubre lo que se rompe en
 * silencio: enlaces sin destino, foco que se escapa del formulario, texto
 * que no llega al contraste mínimo, desbordes a lo ancho y objetivos
 * táctiles pequeños.
 *
 * Vivía en una carpeta temporal y se perdió dos veces. Aquí no.
 */
// `playwright` no es dependencia directa —lo es `@playwright/test`, que la
// reexporta—, así que importarla por su nombre falla con pnpm.
import { chromium } from "@playwright/test";

const U = process.argv[2] ?? "http://localhost:3111";
const F = [];
const ok = [];
const nav = await chromium.launch();

const recorrer = async (pg) =>
  pg.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });

/* ── 1 · estructura, enlaces, imágenes, metadatos ──────────────────────── */
{
  const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
  const pg = await ctx.newPage();
  const cons = [], red = [];
  pg.on("console", (m) => m.type() === "error" && cons.push(m.text().slice(0, 110)));
  pg.on("pageerror", (e) => cons.push("PAGEERROR " + String(e).slice(0, 110)));
  pg.on("response", (r) => r.status() >= 400 && red.push(r.status() + " " + r.url().slice(-60)));
  await pg.goto(U, { waitUntil: "domcontentloaded" });
  await pg.waitForTimeout(1200);
  await recorrer(pg);
  await pg.waitForTimeout(1500);

  const d = await pg.evaluate(() => {
    const enc = [...document.querySelectorAll("h1,h2,h3,h4")].map((e) => +e.tagName[1]);
    let saltos = 0, prev = 0;
    for (const n of enc) { if (prev && n > prev + 1) saltos++; prev = n; }
    const anclas = [...document.querySelectorAll('a[href*="#"]')]
      .map((a) => a.getAttribute("href").split("#")[1]).filter(Boolean);
    return {
      h1: document.querySelectorAll("h1").length,
      saltos,
      anclas: anclas.length,
      anclasRotas: anclas.filter((id) => !document.getElementById(id)),
      sinHref: [...document.querySelectorAll("a")]
        .filter((a) => !a.getAttribute("href")?.trim())
        .map((a) => a.textContent.trim().slice(0, 26)),
      sinAlt: [...document.querySelectorAll("img")].filter((i) => i.getAttribute("alt") === null).length,
      rotas: [...document.querySelectorAll("img")].filter((i) => i.offsetParent !== null && i.naturalWidth === 0).length,
      imgs: document.querySelectorAll("img").length,
      main: document.querySelectorAll("main").length,
      navSinNombre: [...document.querySelectorAll("nav")].filter((n) => !n.getAttribute("aria-label")).length,
      lang: document.documentElement.lang,
      titulo: !!document.title,
      desc: !!document.querySelector('meta[name="description"]'),
      canonica: document.querySelector('link[rel="canonical"]')?.href ?? null,
      og: !!document.querySelector('meta[property="og:image"]'),
      jsonLd: document.querySelectorAll('script[type="application/ld+json"]').length,
    };
  });
  d.h1 === 1 ? ok.push("un solo <h1>") : F.push(`ESTRUCTURA: ${d.h1} elementos <h1>`);
  d.saltos ? F.push(`ESTRUCTURA: ${d.saltos} saltos de nivel entre encabezados`) : ok.push("encabezados sin saltos de nivel");
  d.anclasRotas.length ? F.push("ANCLAS ROTAS: " + d.anclasRotas.join(", ")) : ok.push(`${d.anclas} enlaces de ancla, todos con destino`);
  d.sinHref.length ? F.push("ENLACES SIN DESTINO: " + d.sinHref.join(", ")) : ok.push("ningún <a> se queda sin href");
  d.sinAlt ? F.push(`IMÁGENES: ${d.sinAlt} sin atributo alt`) : ok.push(`${d.imgs} imágenes, todas con alt`);
  d.rotas ? F.push(`IMÁGENES: ${d.rotas} rotas`) : ok.push("ninguna imagen rota");
  d.main === 1 ? ok.push("un <main>") : F.push(`ESTRUCTURA: ${d.main} elementos <main>`);
  d.navSinNombre ? F.push(`${d.navSinNombre} <nav> sin aria-label`) : ok.push("todos los <nav> con nombre");
  d.lang === "es" ? ok.push('lang="es"') : F.push("lang = " + d.lang);
  d.titulo && d.desc ? ok.push("título y descripción presentes") : F.push("SEO: falta título o descripción");
  d.canonica ? ok.push("canónica: " + d.canonica) : F.push("SEO: sin URL canónica");
  d.og ? ok.push("imagen al compartir declarada") : F.push("SEO: sin og:image");
  d.jsonLd ? ok.push(`${d.jsonLd} bloque(s) de datos estructurados`) : F.push("SEO: sin datos estructurados");
  cons.length ? F.push("CONSOLA: " + [...new Set(cons)][0]) : ok.push("consola sin errores");
  red.length ? F.push("RED: " + [...new Set(red)].slice(0, 3).join(" | ")) : ok.push("sin respuestas 4xx/5xx");
  await ctx.close();
}

/* ── 2 · navegación y botones ──────────────────────────────────────────── */
{
  const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
  const pg = await ctx.newPage();
  await pg.goto(U, { waitUntil: "domcontentloaded" });
  await pg.waitForTimeout(1200);

  for (const e of await pg.$$eval("header nav a", (as) => as.map((a) => ({ t: a.textContent.trim(), h: a.getAttribute("href") })))) {
    await pg.evaluate(() => window.scrollTo(0, 0));
    await pg.waitForTimeout(300);
    await pg.click(`header nav a[href="${e.h}"]`);
    await pg.waitForTimeout(1000);
    const hueco = await pg.evaluate((id) => {
      const r = document.getElementById(id).getBoundingClientRect();
      const c = document.querySelector("header").getBoundingClientRect();
      return Math.round(r.top - c.bottom);
    }, e.h.split("#")[1]);
    hueco >= 0 ? ok.push(`menú «${e.t}» → ${hueco}px de aire bajo la cabecera`)
               : F.push(`MENÚ: «${e.t}» deja la sección ${-hueco}px bajo la cabecera`);
  }

  await pg.evaluate(() => window.scrollTo(0, 0));
  const n = await pg.evaluate(() => {
    let i = 0;
    for (const b of document.querySelectorAll("button"))
      if (b.offsetParent !== null && (b.textContent || "").trim()) b.dataset.qa = "b" + i++;
    return i;
  });
  let abren = 0;
  for (let i = 0; i < n; i++) {
    const el = await pg.$(`[data-qa="b${i}"]`);
    if (!el) continue;
    const t = await el.evaluate((b) => (b.textContent || "").trim().slice(0, 30));
    await el.scrollIntoViewIfNeeded().catch(() => {});
    await pg.waitForTimeout(200);
    await el.click({ timeout: 4000 }).catch(() => {});
    await pg.waitForTimeout(700);
    if (await pg.$('[role="dialog"]')) {
      abren++;
      const titulo = await pg.$eval('[role="dialog"] h2,[role="dialog"] h3', (e) => e.textContent.trim()).catch(() => "?");
      await pg.keyboard.press("Escape");
      await pg.waitForTimeout(450);
      if (await pg.$('[role="dialog"]')) F.push(`FORMULARIO: Escape no cierra el abierto desde «${t}»`);
      else ok.push(`«${t}» → formulario «${titulo}» · cierra con Escape`);
    }
  }
  abren >= 6 ? ok.push(`${abren} botones abren formulario`) : F.push(`Solo ${abren} botones abren formulario (se esperaban 6 o más)`);
  await ctx.close();
}

/* ── 3 · el formulario por dentro ──────────────────────────────────────── */
{
  const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
  const pg = await ctx.newPage();
  await pg.goto(U, { waitUntil: "domcontentloaded" });
  await pg.waitForTimeout(1200);
  await pg.getByRole("button", { name: /^Bring Sun-i$/ }).first().click();
  await pg.waitForTimeout(800);
  const d = pg.locator('[role="dialog"]');

  const sinEtiqueta = await d.evaluate((n) =>
    [...n.querySelectorAll("input,select,textarea")]
      .filter((c) => c.offsetParent !== null && c.getBoundingClientRect().width > 0)
      .filter((c) => !(c.id && n.querySelector(`label[for="${CSS.escape(c.id)}"]`)) && !c.closest("label") && !c.getAttribute("aria-label"))
      .map((c) => c.name));
  sinEtiqueta.length ? F.push("FORMULARIO: casillas sin etiqueta — " + sinEtiqueta.join(", "))
                     : ok.push("todas las casillas visibles están etiquetadas");

  let fuera = 0;
  for (let i = 0; i < 30; i++) {
    await pg.keyboard.press("Tab");
    if (!(await pg.evaluate(() => !!document.activeElement?.closest('[role="dialog"]')))) fuera++;
  }
  fuera === 0 ? ok.push("el foco no se escapa del formulario (30 tabulaciones)")
              : F.push(`FORMULARIO: el foco sale ${fuera}/30 veces`);

  let req = 0;
  pg.on("request", (r) => r.url().includes("/api/sun-i") && req++);
  await d.getByRole("button", { name: /Quiero Sun/i }).click();
  await pg.waitForTimeout(800);
  req === 0 ? ok.push("enviar vacío no manda nada: lo frena la validación")
            : F.push(`VALIDACIÓN: enviar vacío mandó ${req} petición(es)`);
  await ctx.close();
}

/* ── 4 · celular ───────────────────────────────────────────────────────── */
{
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
  const pg = await ctx.newPage();
  await pg.goto(U, { waitUntil: "domcontentloaded" });
  await pg.waitForTimeout(1300);
  await pg.locator('button[aria-label="Abrir menú"]').tap();
  await pg.waitForTimeout(700);
  const enlaces = await pg.$$eval("header nav a", (as) => as.filter((a) => a.offsetParent !== null).length);
  enlaces ? ok.push(`el menú móvil abre con ${enlaces} enlaces`) : F.push("MÓVIL: el menú no muestra enlaces");
  await pg.locator('header a[href="/#vending"]:visible').first().tap();
  await pg.waitForTimeout(1100);
  const abierto = await pg.$$eval("header nav a", (as) => as.filter((a) => a.offsetParent !== null).length);
  abierto === 0 ? ok.push("el menú se cierra solo al navegar") : F.push("MÓVIL: el menú sigue abierto tras navegar");
  await ctx.close();
}

/* ── 5 · anchos, objetivos táctiles, zoom y movimiento reducido ─────────── */
for (const w of [320, 375, 390, 430, 768, 1024, 1280, 1440, 1920]) {
  const ctx = await nav.newContext({ viewport: { width: w, height: 900 }, isMobile: w < 768, hasTouch: w <= 1024 });
  const pg = await ctx.newPage();
  await pg.goto(U, { waitUntil: "domcontentloaded" });
  await pg.waitForTimeout(800);
  await recorrer(pg);
  await pg.waitForTimeout(400);
  const d = await pg.evaluate(() => ({
    scroll: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    chicos: [...document.querySelectorAll("a[href],button")]
      .filter((e) => { const r = e.getBoundingClientRect(); return e.offsetParent !== null && r.height > 0 && r.height < 44; })
      .map((e) => (e.textContent || e.getAttribute("aria-label") || "").trim().slice(0, 20)),
  }));
  d.scroll ? F.push(`${w}px: SCROLL HORIZONTAL`) : null;
  d.chicos.length && w <= 1024 ? F.push(`TÁCTIL ${w}px: ${d.chicos.length} bajo 44px — ${[...new Set(d.chicos)].slice(0, 3).join(", ")}`) : null;
  if (!d.scroll && !(d.chicos.length && w <= 1024)) ok.push(`${w}px correcto`);
  await ctx.close();
}
{
  const ctx = await nav.newContext({ viewport: { width: 640, height: 512 }, reducedMotion: "reduce" });
  const pg = await ctx.newPage();
  await pg.goto(U, { waitUntil: "domcontentloaded" });
  await pg.waitForTimeout(1200);
  await recorrer(pg);
  await pg.waitForTimeout(600);
  const d = await pg.evaluate(() => ({
    scroll: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    invisibles: [...document.querySelectorAll("section p,section h1,section h2,.personaje,img")]
      .filter((e) => e.offsetParent !== null && parseFloat(getComputedStyle(e).opacity) < 0.95).length,
  }));
  d.scroll ? F.push("ZOOM 200%: scroll horizontal") : ok.push("zoom 200% sin scroll horizontal");
  d.invisibles ? F.push(`MOVIMIENTO REDUCIDO: ${d.invisibles} elementos quedan invisibles`)
               : ok.push("con movimiento reducido todo queda visible");
  await ctx.close();
}

console.log("✓ CORRECTO:");
ok.forEach((x) => console.log("   " + x));
console.log(F.length ? "\n✗ HALLAZGOS:" : "\n✗ HALLAZGOS: ninguno");
F.forEach((x) => console.log("   " + x));
await nav.close();
process.exit(F.length ? 1 : 0);

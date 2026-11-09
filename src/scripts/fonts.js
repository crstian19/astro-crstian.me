// Defers the web fonts on a first visit. Runs inline right after the <Font>
// styles: it removes their @font-face rules that download a file (the
// size-adjusted local fallbacks stay), so the first paint doesn't wait on
// ~120 KB of fonts on a slow connection, and adds them back with the FontFace
// API once the page has loaded. After that the fonts are in the HTTP cache and
// later visits keep the rules as they are.
(() => {
  try {
    if (localStorage.getItem("fonts") === "1") return;
  } catch {
    return;
  }
  const faces = [];
  for (const sheet of document.styleSheets) {
    let rules;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    for (let i = rules.length - 1; i >= 0; i--) {
      const rule = rules[i];
      if (!(rule instanceof CSSFontFaceRule)) continue;
      const src = rule.style.getPropertyValue("src");
      if (!src.includes("url(")) continue;
      const s = rule.style;
      faces.push(
        new FontFace(s.getPropertyValue("font-family").replace(/["']/g, ""), src, {
          weight: s.getPropertyValue("font-weight") || "normal",
          style: s.getPropertyValue("font-style") || "normal",
          display: "swap",
        }),
      );
      sheet.deleteRule(i);
    }
  }
  if (!faces.length) return;
  const load = () =>
    Promise.all(
      faces.map((face) => {
        document.fonts.add(face);
        return face.load();
      }),
    ).then(() => {
      try {
        localStorage.setItem("fonts", "1");
      } catch {}
    });
  const later = () => ("requestIdleCallback" in window ? requestIdleCallback(load, { timeout: 1500 }) : setTimeout(load, 200));
  if (document.readyState === "complete") later();
  else addEventListener("load", later, { once: true });
})();

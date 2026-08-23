(function () {
  "use strict";

  var script =
    document.currentScript ||
    (function () {
      var all = document.getElementsByTagName("script");
      for (var i = all.length - 1; i >= 0; i--) {
        if (all[i].src && all[i].src.indexOf("widget.js") !== -1) return all[i];
      }
      return null;
    })();
  if (!script) return;

  var base = new URL(script.src).origin;

  function attr(name, fallback) {
    var v = script.getAttribute(name);
    return v == null || v === "" ? fallback : v;
  }

  var author = attr("data-author", "");
  var message = attr(
    "data-message",
    "Written by a human. AI is used only to refine ideas — never to generate."
  );
  // 9 styles: stamp · wax · passport · postmark · ribbon · certificate ·
  //           typewriter · banner · compact
  var style = attr("data-style", "stamp").toLowerCase();
  if (style === "badge") style = "stamp";
  var theme = attr("data-theme", "light").toLowerCase();
  var link = attr("data-link", base + "/browse");
  var region = attr("data-region", "");
  var category = attr("data-category", "");
  var sizeAttr = parseInt(attr("data-size", ""), 10);

  // NAC "Ink & Seal" palette — seal green ink pressed onto paper (light) or
  // slate (dark). Overridable per-site via data-ink.
  var dark = theme === "dark";
  var ink = attr("data-ink", dark ? "#3db476" : "#157a45");
  var c = {
    bg: dark ? "#101017" : "#fdfcf9",
    fg: dark ? "#f1f1f4" : "#191922",
    sub: dark ? "#a5a5b2" : "#76768a",
    border: dark ? "#3c3c4e" : "#e9e4d5",
    red: dark ? "#ff7a7a" : "#d92d2d",
    redBg: dark ? "rgba(217,45,45,.14)" : "rgba(217,45,45,.07)",
  };
  var FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
  var SERIF = "Georgia,'Times New Roman',serif";
  var MONO = "'IBM Plex Mono',ui-monospace,'SF Mono',Menlo,monospace";

  var uid = (window.__nac_seq = (window.__nac_seq || 0) + 1);
  var year = new Date().getFullYear();

  function el(tag, css, html) {
    var e = document.createElement(tag);
    if (css) e.style.cssText = css;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // --- Security-print geometry helpers (guilloché + rosette) ---
  function wavyRing(cx, cy, R, amp, waves, phase) {
    var d = "";
    for (var a = 0; a <= 360; a += 3) {
      var rad = (a * Math.PI) / 180;
      var r = R + amp * Math.sin(waves * rad + phase);
      var x = cx + r * Math.cos(rad);
      var y = cy + r * Math.sin(rad);
      d += (a === 0 ? "M" : "L") + x.toFixed(2) + " " + y.toFixed(2);
    }
    return d + "Z";
  }
  function rosette(cx, cy, R, r, dd, turns) {
    var d = "";
    for (var t = 0; t <= 360 * turns; t += 4) {
      var rad = (t * Math.PI) / 180;
      var x = cx + (R - r) * Math.cos(rad) + dd * Math.cos(((R - r) / r) * rad);
      var y = cy + (R - r) * Math.sin(rad) + dd * Math.sin(((R - r) / r) * rad);
      d += (t === 0 ? "M" : "L") + x.toFixed(1) + " " + y.toFixed(1);
    }
    return d;
  }
  /** Scalloped blob outline (wax seal edge). */
  function scallop(cx, cy, R, lobes, depth) {
    var d = "";
    for (var a = 0; a <= 360; a += 2) {
      var rad = (a * Math.PI) / 180;
      var r = R + depth * Math.sin(lobes * rad);
      var x = cx + r * Math.cos(rad);
      var y = cy + r * Math.sin(rad);
      d += (a === 0 ? "M" : "L") + x.toFixed(1) + " " + y.toFixed(1);
    }
    return d + "Z";
  }
  /** Tiny stable hash → zero-padded serial for the certificate style. */
  function serial(s) {
    var h = 5381;
    for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
    return ("000000" + (h % 1000000)).slice(-6);
  }

  // Repeated microtext — reads as a solid hairline until you zoom in (like currency).
  var MICRO = "· NO AI CONTENT · VERIFIED HUMAN WRITING ";
  function microString() {
    var s = "";
    while (s.length < 120) s += MICRO;
    return esc(s);
  }

  var pen =
    '<g fill="none" stroke="INK" stroke-linejoin="round" stroke-linecap="round">' +
    '<path stroke-width="3" d="M100 54 C106 54 111 66 111 78 L100 92 L89 78 C89 66 94 54 100 54 Z"/>' +
    '<path stroke-width="2.4" d="M100 70 L100 89"/></g>' +
    '<circle cx="100" cy="68" r="2.5" fill="INK"/>';

  /* ---------------- 1 · Notary stamp (the signature seal) ---------------- */
  function stampSVG(px) {
    var topId = "nac-t-" + uid,
      botId = "nac-b-" + uid,
      micId = "nac-m-" + uid;
    var bottomText = author ? "BY " + author.toUpperCase() : "GENUINELY HUMAN";
    var R = 76;
    var mR = 55;
    return (
      '<svg width="' + px + '" height="' + px + '" viewBox="0 0 200 200" ' +
      'xmlns="http://www.w3.org/2000/svg" role="img" ' +
      'aria-label="No AI Content — human-written, verified">' +
      "<defs>" +
      '<path id="' + topId + '" fill="none" d="M 24 100 A ' + R + " " + R + ' 0 0 1 176 100"/>' +
      '<path id="' + botId + '" fill="none" d="M 30 138 A ' + R + " " + R + ' 0 0 0 170 138"/>' +
      '<path id="' + micId + '" fill="none" d="M ' + (100 - mR) + " 100 A " + mR + " " + mR +
      " 0 1 1 " + (100 + mR) + " 100 A " + mR + " " + mR + " 0 1 1 " + (100 - mR) + ' 100"/>' +
      "</defs>" +
      '<g transform="rotate(-7 100 100)">' +
      '<g class="nac-guil" fill="none" stroke="' + ink + '" stroke-width="0.6" opacity="0.55">' +
      '<path pathLength="100" d="' + wavyRing(100, 100, 90, 2.6, 26, 0) + '"/>' +
      '<path pathLength="100" d="' + wavyRing(100, 100, 90, 2.6, 26, 0.6) + '"/>' +
      '<path pathLength="100" d="' + wavyRing(100, 100, 84, 1.8, 32, 0.3) + '"/>' +
      "</g>" +
      '<path class="nac-rose" d="' + rosette(100, 100, 46, 6, 12, 7) + '" fill="none" stroke="' + ink +
      '" stroke-width="0.4" opacity="0.18"/>' +
      '<g fill="none" stroke="' + ink + '">' +
      '<circle class="nac-ring" pathLength="100" cx="100" cy="100" r="94" stroke-width="3.2"/>' +
      '<circle class="nac-ring" pathLength="100" cx="100" cy="100" r="80" stroke-width="1.2"/>' +
      '<circle class="nac-ring" pathLength="100" cx="100" cy="100" r="49" stroke-width="1.2"/>' +
      "</g>" +
      '<g fill="' + ink + '">' +
      '<rect x="6.5" y="96.5" width="7" height="7" transform="rotate(45 10 100)"/>' +
      '<rect x="186.5" y="96.5" width="7" height="7" transform="rotate(45 190 100)"/>' +
      "</g>" +
      '<g fill="' + ink + '" font-family="' + SERIF + '" font-weight="600">' +
      '<text font-size="15" letter-spacing="3">' +
      '<textPath href="#' + topId + '" startOffset="50%" text-anchor="middle">NO AI CONTENT</textPath></text>' +
      '<text font-size="12.5" letter-spacing="2.5">' +
      '<textPath href="#' + botId + '" startOffset="50%" text-anchor="middle">' + esc(bottomText) + "</textPath></text>" +
      "</g>" +
      '<g class="nac-micro"><text fill="' + ink + '" font-family="' + FONT + '" font-size="3.1" letter-spacing="0.3" opacity="0.9">' +
      '<textPath href="#' + micId + '" startOffset="0">' + microString() + "</textPath></text></g>" +
      pen.replace(/INK/g, ink) +
      '<g fill="' + ink + '" font-family="' + SERIF + '" text-anchor="middle">' +
      '<text x="100" y="105" font-size="7.5" font-weight="700" letter-spacing="4" opacity="0.9">N A C</text>' +
      '<text x="100" y="123" font-size="17" font-weight="700" letter-spacing="1">HUMAN</text>' +
      '<text x="100" y="139" font-size="17" font-weight="700" letter-spacing="1">WRITTEN</text>' +
      '<text x="100" y="152" font-size="7.5" letter-spacing="1.5" opacity="0.85">EST. ' + year + "</text>" +
      "</g></g></svg>"
    );
  }

  /* ---------------- 2 · Wax seal — pressed, solid, molten edge ------------ */
  function waxSVG(px) {
    return (
      '<svg width="' + px + '" height="' + px + '" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" ' +
      'role="img" aria-label="No AI Content — sealed by a human">' +
      '<g transform="rotate(-5 100 100)">' +
      '<path d="' + scallop(100, 100, 86, 11, 7) + '" fill="' + ink + '" opacity="0.94"/>' +
      '<path d="' + scallop(100, 100, 74, 11, 4) + '" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="1.4"/>' +
      '<circle cx="100" cy="100" r="56" fill="none" stroke="rgba(255,255,255,.75)" stroke-width="1.6" stroke-dasharray="4 3"/>' +
      pen.replace(/INK/g, "#fff").replace(/stroke-width="3"/, 'stroke-width="4"') +
      '<g fill="#fff" font-family="' + SERIF + '" text-anchor="middle">' +
      '<text x="100" y="112" font-size="13" font-weight="700" letter-spacing="4">N A C</text>' +
      '<text x="100" y="130" font-size="9.5" font-weight="600" letter-spacing="1.6">HUMAN WRITTEN</text>' +
      '<text x="100" y="146" font-size="7" letter-spacing="1.2" opacity="0.8">' + year + "</text>" +
      "</g></g></svg>"
    );
  }

  /* ---------------- 3 · Passport visa stamp --------------------------------- */
  function passportSVG(w) {
    var h = Math.round(w * 0.62);
    var by = author ? esc(author.toUpperCase()) : "A HUMAN BEING";
    return (
      '<svg width="' + w + '" height="' + h + '" viewBox="0 0 240 148" xmlns="http://www.w3.org/2000/svg" ' +
      'role="img" aria-label="No AI Content — entry granted, human writing">' +
      '<g transform="rotate(-6 120 74)" fill="none" stroke="' + ink + '">' +
      '<rect x="8" y="10" width="224" height="128" rx="10" stroke-width="3"/>' +
      '<rect x="16" y="18" width="208" height="112" rx="6" stroke-width="1" stroke-dasharray="5 4"/>' +
      "</g>" +
      '<g transform="rotate(-6 120 74)" fill="' + ink + '" text-anchor="middle">' +
      '<text x="120" y="42" font-family="' + MONO + '" font-size="10" letter-spacing="3" font-weight="600">✦ OPEN WEB · ADMITTED ✦</text>' +
      '<text x="120" y="72" font-family="' + SERIF + '" font-size="21" font-weight="700" letter-spacing="2">NO AI CONTENT</text>' +
      '<text x="120" y="94" font-family="' + MONO + '" font-size="9.5" letter-spacing="2">WRITTEN BY ' + by + "</text>" +
      '<text x="120" y="118" font-family="' + MONO + '" font-size="9" letter-spacing="2" opacity="0.8">DATE OF ENTRY · ' + year + "</text>" +
      "</g></svg>"
    );
  }

  /* ---------------- 4 · Postmark — cancelled: machine-made ----------------- */
  function postmarkSVG(w) {
    var h = Math.round(w * 0.52);
    var arcId = "nac-pm-" + uid;
    return (
      '<svg width="' + w + '" height="' + h + '" viewBox="0 0 250 130" xmlns="http://www.w3.org/2000/svg" ' +
      'role="img" aria-label="No AI Content — hand-delivered writing">' +
      "<defs>" +
      '<path id="' + arcId + '" fill="none" d="M 22 65 A 43 43 0 0 1 108 65"/>' +
      "</defs>" +
      '<g fill="none" stroke="' + ink + '">' +
      '<circle cx="65" cy="65" r="52" stroke-width="2.6"/>' +
      '<circle cx="65" cy="65" r="44" stroke-width="1"/>' +
      // cancellation waves
      '<path stroke-width="2.2" d="M120 40 C150 34 180 46 240 40" opacity="0.85"/>' +
      '<path stroke-width="2.2" d="M122 60 C152 54 182 66 242 60" opacity="0.85"/>' +
      '<path stroke-width="2.2" d="M122 80 C152 74 182 86 242 80" opacity="0.85"/>' +
      '<path stroke-width="2.2" d="M120 100 C150 94 180 106 240 100" opacity="0.85"/>' +
      "</g>" +
      '<g fill="' + ink + '" text-anchor="middle">' +
      '<text font-family="' + MONO + '" font-size="9" letter-spacing="1.6" font-weight="600">' +
      '<textPath href="#' + arcId + '" startOffset="50%" text-anchor="middle">HUMAN MAIL</textPath></text>' +
      '<text x="65" y="62" font-family="' + SERIF + '" font-size="15" font-weight="700" letter-spacing="1">N A C</text>' +
      '<text x="65" y="78" font-family="' + MONO + '" font-size="8" letter-spacing="1">' + year + "</text>" +
      '<text x="65" y="97" font-family="' + MONO + '" font-size="7.5" letter-spacing="1.4" opacity="0.85">NO AI CONTENT</text>' +
      "</g></svg>"
    );
  }

  /* ---------------- 5 · Prize ribbon — 100% human -------------------------- */
  function ribbonSVG(px) {
    var h = Math.round(px * 1.28);
    return (
      '<svg width="' + px + '" height="' + h + '" viewBox="0 0 160 205" xmlns="http://www.w3.org/2000/svg" ' +
      'role="img" aria-label="No AI Content — 100 percent human">' +
      '<g fill="' + ink + '">' +
      '<path d="M55 128 L44 198 L80 176 L116 198 L105 128 Z" opacity="0.55"/>' +
      "</g>" +
      '<path d="' + scallop(80, 78, 66, 12, 6) + '" fill="' + ink + '"/>' +
      '<circle cx="80" cy="78" r="48" fill="none" stroke="rgba(255,255,255,.8)" stroke-width="1.6"/>' +
      '<g fill="#fff" text-anchor="middle" font-family="' + SERIF + '">' +
      '<text x="80" y="70" font-size="21" font-weight="700">100%</text>' +
      '<text x="80" y="90" font-size="13" font-weight="600" letter-spacing="2">HUMAN</text>' +
      '<text x="80" y="104" font-size="7" letter-spacing="1.6" opacity="0.85">NO AI CONTENT</text>' +
      "</g></svg>"
    );
  }

  /* ---------------- 6 · Certificate — serial-numbered ---------------------- */
  function certSVG(w) {
    var h = Math.round(w * 0.46);
    var by = author ? esc(author.toUpperCase()) : "A HUMAN AUTHOR";
    return (
      '<svg width="' + w + '" height="' + h + '" viewBox="0 0 280 128" xmlns="http://www.w3.org/2000/svg" ' +
      'role="img" aria-label="No AI Content — certificate of human writing">' +
      '<g fill="none" stroke="' + ink + '">' +
      '<rect x="6" y="6" width="268" height="116" rx="6" stroke-width="2.4"/>' +
      '<rect x="13" y="13" width="254" height="102" rx="3" stroke-width="0.8"/>' +
      "</g>" +
      // corner rosettes
      '<path d="' + rosette(32, 100, 15, 3, 5, 4) + '" fill="none" stroke="' + ink + '" stroke-width="0.5" opacity="0.6"/>' +
      '<g fill="' + ink + '">' +
      '<text x="140" y="36" text-anchor="middle" font-family="' + MONO + '" font-size="8.5" letter-spacing="3.4" font-weight="600">CERTIFICATE OF AUTHORSHIP</text>' +
      '<text x="140" y="62" text-anchor="middle" font-family="' + SERIF + '" font-size="19" font-weight="700" letter-spacing="1.5">HUMAN WRITTEN</text>' +
      '<text x="140" y="82" text-anchor="middle" font-family="' + MONO + '" font-size="8.5" letter-spacing="1.6">ISSUED TO · ' + by + "</text>" +
      '<text x="253" y="108" text-anchor="end" font-family="' + MONO + '" font-size="8" letter-spacing="1.4" opacity="0.75">Nº ' +
      serial((author || "") + location.hostname) + " · " + year + "</text>" +
      '<text x="56" y="108" text-anchor="middle" font-family="' + MONO + '" font-size="7.5" letter-spacing="1" opacity="0.75">NAC</text>' +
      "</g></svg>"
    );
  }

  /* ---------------- Render ---------------- */
  // One-time style injection. The motion language: everything behaves like a
  // real rubber stamp — presses in from above once, settles fast. The
  // explainer is a modal storyboard (built per-widget, styles shared).
  if (!document.getElementById("nac-anim")) {
    var st = document.createElement("style");
    st.id = "nac-anim";
    st.textContent =
      "@keyframes nacStampIn{0%{opacity:0;transform:scale(1.18) rotate(-4deg)}" +
      "62%{opacity:1;transform:scale(.985) rotate(.5deg)}100%{opacity:1;transform:none}}" +
      ".nac-in{animation:nacStampIn .5s cubic-bezier(.22,1,.36,1) both}" +
      "@keyframes nacDraw{from{stroke-dashoffset:100}to{stroke-dashoffset:0}}" +
      "@keyframes nacBlink{0%,55%{opacity:1}56%,100%{opacity:0}}" +
      ".nac-play .nac-ring{stroke-dasharray:100;animation:nacDraw 1.1s cubic-bezier(.4,0,.2,1) both}" +
      ".nac-play .nac-guil path{stroke-dasharray:100;animation:nacDraw 1.6s cubic-bezier(.4,0,.2,1) both}" +
      // The CTA — a quiet pill.
      ".nac-cta{cursor:pointer;display:inline-flex;align-items:center;gap:5px;border:1px solid CTA_BORDER;" +
      "background:transparent;border-radius:999px;padding:4px 12px;transition:border-color .2s ease,color .2s ease,background .2s ease}" +
      ".nac-cta:hover{border-color:CTA_INK;color:CTA_INK;background:CTA_WASH}" +
      "@media (prefers-reduced-motion:reduce){.nac-in,.nac-play *{animation-duration:.01s!important;animation-delay:0s!important}}";
    st.textContent = st.textContent
      .replace(/CTA_BORDER/g, c.border)
      .replace(/CTA_INK/g, ink)
      .replace(/CTA_WASH/g, dark ? "rgba(255,255,255,.05)" : "rgba(8,8,12,.03)");
    document.head.appendChild(st);
  }

  var container = el(
    "span",
    "display:inline-flex;flex-direction:column;align-items:center;gap:8px;font-family:" +
      FONT +
      ";line-height:normal;"
  );
  container.className = "nac-in";

  var visual = document.createElement("a");
  visual.href = link;
  visual.target = "_blank";
  visual.rel = "noopener noreferrer";
  visual.setAttribute("aria-label", "No AI Content — verified human writing");
  visual.style.cssText =
    "text-decoration:none;color:" + c.fg + ";box-sizing:border-box;line-height:0;display:inline-block;";
  var msgFull = author ? message + " — " + author : message;
  var px = sizeAttr > 0 ? sizeAttr : 156;

  if (style === "compact") {
    visual.style.cssText +=
      "display:inline-flex;align-items:center;gap:8px;background:" + c.bg + ";border:1px solid " +
      c.border + ";border-radius:999px;padding:5px 13px 5px 7px;box-shadow:0 1px 2px rgba(0,0,0,.05);line-height:normal;";
    visual.appendChild(el("span", "display:inline-flex;flex:0 0 auto", stampSVG(24)));
    visual.appendChild(el("span", "font-size:12.5px;font-weight:700;white-space:nowrap;", "Human-Written"));
  } else if (style === "banner") {
    visual.style.cssText +=
      "display:inline-flex;align-items:center;gap:14px;background:" + c.bg + ";border:1px solid " +
      c.border + ";border-radius:14px;padding:12px 20px 12px 14px;max-width:400px;box-shadow:0 2px 10px rgba(2,6,23,.07);line-height:normal;";
    visual.appendChild(el("span", "display:inline-flex;flex:0 0 auto", stampSVG(60)));
    var col = el("span", "display:flex;flex-direction:column;gap:3px;min-width:0");
    col.appendChild(el("strong", "font-size:14px;font-weight:800;", "Human-Written &amp; Verified"));
    col.appendChild(el("span", "font-size:11.5px;color:" + c.sub + ";line-height:1.35", esc(msgFull)));
    visual.appendChild(col);
  } else if (style === "typewriter") {
    visual.style.cssText +=
      "display:inline-flex;align-items:baseline;gap:2px;font-family:" + MONO +
      ";font-size:13.5px;font-weight:600;letter-spacing:.4px;color:" + c.fg + ";line-height:normal;";
    visual.appendChild(
      el("span", "", "&mdash;&nbsp;typed by " + (author ? esc(author) : "a human") + ", no AI&nbsp;&mdash;")
    );
    visual.appendChild(
      el("span",
        "display:inline-block;width:8px;height:15px;background:" + ink +
        ";animation:nacBlink 1.1s steps(1) infinite;align-self:center;", "")
    );
  } else if (style === "wax") {
    visual.appendChild(el("span", "display:inline-block", waxSVG(px)));
  } else if (style === "passport") {
    visual.appendChild(el("span", "display:inline-block", passportSVG(Math.round(px * 1.45))));
  } else if (style === "postmark") {
    visual.appendChild(el("span", "display:inline-block", postmarkSVG(Math.round(px * 1.5))));
  } else if (style === "ribbon") {
    visual.appendChild(el("span", "display:inline-block", ribbonSVG(Math.round(px * 0.85))));
  } else if (style === "certificate" || style === "cert") {
    visual.appendChild(el("span", "display:inline-block", certSVG(Math.round(px * 1.65))));
  } else {
    visual.appendChild(el("span", "display:inline-block", stampSVG(px)));
  }
  container.appendChild(visual);

  /* ---------------- "What is this?" ----------------
     The explainer lives on the NAC site now, as one 16:9 scene player, so the
     embed no longer ships a second copy of the same story.

     The button asks the host page first: it fires a cancelable `nac:explain`
     event, and if something handles it (nac.imswarnil.com does, opening the
     player in place) the widget stands down. Everywhere else — a real blog
     with the badge in its sidebar — it opens the story on the NAC site. */

  function explain() {
    var ev;
    try {
      ev = new CustomEvent("nac:explain", { bubbles: true, cancelable: true });
    } catch (err) {
      // IE-era fallback; harmless if it never runs.
      ev = document.createEvent("CustomEvent");
      ev.initCustomEvent("nac:explain", true, true, null);
    }
    var handled = !window.dispatchEvent(ev); // false === someone called preventDefault
    if (!handled) window.open(base + "/?story=1", "_blank", "noopener");
  }

  if (style !== "compact") {
    var cta = document.createElement("button");
    cta.type = "button";
    cta.className = "nac-cta";
    cta.textContent = "ⓘ What is this?";
    cta.setAttribute("aria-haspopup", "dialog");
    cta.style.cssText =
      "color:" + c.sub + ";font-family:" + FONT + ";font-size:11px;font-weight:600;letter-spacing:.2px;";
    cta.addEventListener("click", function (e) {
      e.preventDefault();
      explain();
    });
    container.appendChild(cta);
  }

  script.parentNode.insertBefore(container, script.nextSibling);

  /* ---------------- Tracking ping (domain-only, no PII) ----------------

     Never ping when the badge is being served by the same origin as the page
     it's on. That means it's a preview on the NAC site itself, not an embed on
     somebody's blog — and the NAC homepage renders TEN badges (nine style
     samples plus the builder preview), so every single visit was logging ten
     hits against our own domain and putting NAC on its own roll of members.
     The same guard covers preview deployments, which were showing up as
     members too. */
  try {
    if (location.origin !== base) {
      var payload = JSON.stringify({
        domain: location.hostname,
        author: author || null,
        message: message || null,
        region: region || null,
        category: category || null,
      });
      if (navigator.sendBeacon) navigator.sendBeacon(base + "/api/track", payload);
      else
        fetch(base + "/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
          mode: "no-cors",
        });
    }
  } catch (e) {}
})();

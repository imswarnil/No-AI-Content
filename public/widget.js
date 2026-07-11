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
  var style = attr("data-style", "stamp").toLowerCase(); // stamp | banner | compact
  if (style === "badge") style = "stamp";
  var theme = attr("data-theme", "light").toLowerCase();
  var link = attr("data-link", base + "/directory");
  var region = attr("data-region", "");
  var category = attr("data-category", "");
  var sizeAttr = parseInt(attr("data-size", ""), 10);

  var dark = theme === "dark";
  var ink = attr("data-ink", dark ? "#4ade80" : "#15803d");
  var c = {
    bg: dark ? "#0f172a" : "#ffffff",
    fg: dark ? "#f8fafc" : "#0f172a",
    sub: dark ? "#94a3b8" : "#64748b",
    border: dark ? "#1e293b" : "#e5e7eb",
  };
  var FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
  var SERIF = "Georgia,'Times New Roman',serif";

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

  // Repeated microtext — reads as a solid hairline until you zoom in (like currency).
  var MICRO = "· NO AI CONTENT · VERIFIED HUMAN WRITING ";
  function microString() {
    var s = "";
    while (s.length < 120) s += MICRO;
    return esc(s);
  }

  function stampSVG(px) {
    var topId = "nac-t-" + uid,
      botId = "nac-b-" + uid,
      micId = "nac-m-" + uid;
    var bottomText = author ? "BY " + author.toUpperCase() : "GENUINELY HUMAN";
    var R = 76;
    var mR = 55; // microtext radius
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
      // guilloché band (fine interfering wavy rings)
      '<g class="nac-guil" fill="none" stroke="' + ink + '" stroke-width="0.6" opacity="0.55">' +
      '<path pathLength="100" d="' + wavyRing(100, 100, 90, 2.6, 26, 0) + '"/>' +
      '<path pathLength="100" d="' + wavyRing(100, 100, 90, 2.6, 26, 0.6) + '"/>' +
      '<path pathLength="100" d="' + wavyRing(100, 100, 84, 1.8, 32, 0.3) + '"/>' +
      "</g>" +
      // faint rosette behind the center
      '<path class="nac-rose" d="' + rosette(100, 100, 46, 6, 12, 7) + '" fill="none" stroke="' + ink +
      '" stroke-width="0.4" opacity="0.18"/>' +
      // solid rings
      '<g fill="none" stroke="' + ink + '">' +
      '<circle class="nac-ring" pathLength="100" cx="100" cy="100" r="94" stroke-width="3.2"/>' +
      '<circle class="nac-ring" pathLength="100" cx="100" cy="100" r="80" stroke-width="1.2"/>' +
      '<circle class="nac-ring" pathLength="100" cx="100" cy="100" r="49" stroke-width="1.2"/>' +
      "</g>" +
      // side ornaments
      '<g fill="' + ink + '">' +
      '<rect x="6.5" y="96.5" width="7" height="7" transform="rotate(45 10 100)"/>' +
      '<rect x="186.5" y="96.5" width="7" height="7" transform="rotate(45 190 100)"/>' +
      "</g>" +
      // curved macro text
      '<g fill="' + ink + '" font-family="' + SERIF + '" font-weight="600">' +
      '<text font-size="15" letter-spacing="3">' +
      '<textPath href="#' + topId + '" startOffset="50%" text-anchor="middle">NO AI CONTENT</textPath></text>' +
      '<text font-size="12.5" letter-spacing="2.5">' +
      '<textPath href="#' + botId + '" startOffset="50%" text-anchor="middle">' + esc(bottomText) + "</textPath></text>" +
      "</g>" +
      // microprint ring
      '<g class="nac-micro"><text fill="' + ink + '" font-family="' + FONT + '" font-size="3.1" letter-spacing="0.3" opacity="0.9">' +
      '<textPath href="#' + micId + '" startOffset="0">' + microString() + "</textPath></text></g>" +
      // pen-nib emblem
      '<g fill="none" stroke="' + ink + '" stroke-linejoin="round" stroke-linecap="round">' +
      '<path stroke-width="3" d="M100 54 C106 54 111 66 111 78 L100 92 L89 78 C89 66 94 54 100 54 Z"/>' +
      '<path stroke-width="2.4" d="M100 70 L100 89"/></g>' +
      '<circle cx="100" cy="68" r="2.5" fill="' + ink + '"/>' +
      // center wordmark (with NAC monogram)
      '<g fill="' + ink + '" font-family="' + SERIF + '" text-anchor="middle">' +
      '<text x="100" y="105" font-size="7.5" font-weight="700" letter-spacing="4" opacity="0.9">N A C</text>' +
      '<text x="100" y="123" font-size="17" font-weight="700" letter-spacing="1">HUMAN</text>' +
      '<text x="100" y="139" font-size="17" font-weight="700" letter-spacing="1">WRITTEN</text>' +
      '<text x="100" y="152" font-size="7.5" letter-spacing="1.5" opacity="0.85">EST. ' + year + "</text>" +
      "</g></g></svg>"
    );
  }

  /* ---------------- Render ---------------- */
  // Inject the one-time entrance keyframes (stamped-onto-the-page feel).
  if (!document.getElementById("nac-anim")) {
    var st = document.createElement("style");
    st.id = "nac-anim";
    st.textContent =
      "@keyframes nacStampIn{0%{opacity:0;transform:scale(.7) rotate(-16deg)}" +
      "55%{opacity:1;transform:scale(1.06) rotate(2deg)}" +
      "75%{transform:scale(.98) rotate(-1deg)}100%{opacity:1;transform:none}}" +
      // --- "What is this?" in-widget show: rings redraw, rosette & microprint spin, stamp thumps ---
      "@keyframes nacDraw{from{stroke-dashoffset:100}to{stroke-dashoffset:0}}" +
      "@keyframes nacSpin{to{transform:rotate(360deg)}}" +
      "@keyframes nacSpinR{to{transform:rotate(-360deg)}}" +
      "@keyframes nacThump{0%{transform:none}35%{transform:scale(1.14) rotate(4deg)}" +
      "60%{transform:scale(.94) rotate(-3deg)}80%{transform:scale(1.03) rotate(1deg)}100%{transform:none}}" +
      "@keyframes nacBlink{50%{opacity:0}}" +
      ".nac-play{animation:nacThump .9s cubic-bezier(.2,.9,.3,1.2) both}" +
      ".nac-play .nac-ring{stroke-dasharray:100;animation:nacDraw 1.4s ease-out both}" +
      ".nac-play .nac-guil path{stroke-dasharray:100;animation:nacDraw 2s ease-out both}" +
      ".nac-open .nac-rose{animation:nacSpin 16s linear infinite;transform-box:fill-box;transform-origin:center}" +
      ".nac-open .nac-micro{animation:nacSpinR 40s linear infinite;transform-box:fill-box;transform-origin:center}" +
      ".nac-panel{display:block;overflow:hidden;max-height:0;opacity:0;transform:translateY(-6px);" +
      "transition:max-height .55s cubic-bezier(.2,.8,.2,1),opacity .4s ease,transform .45s ease}" +
      ".nac-panel.nac-open-p{max-height:380px;opacity:1;transform:none}" +
      ".nac-cursor{display:inline-block;width:2px;height:1.05em;vertical-align:-2px;margin-left:1px;animation:nacBlink 1s steps(1) infinite}" +
      ".nac-chip{position:relative;display:inline-flex;align-items:center;border:2px dashed #ef4444;color:#ef4444;" +
      "border-radius:9px;padding:6px 13px;font-weight:800;letter-spacing:1px;font-size:11.5px;opacity:0;transform:scale(.9);transition:all .4s ease}" +
      ".nac-chip.nac-show{opacity:1;transform:none}" +
      ".nac-chip svg{position:absolute;inset:-6px;width:calc(100% + 12px);height:calc(100% + 12px);overflow:visible}" +
      ".nac-chip .nac-x{stroke:#ef4444;stroke-width:3.5;stroke-linecap:round;stroke-dasharray:200;stroke-dashoffset:200;transition:stroke-dashoffset .5s ease .35s}" +
      ".nac-chip.nac-show .nac-x{stroke-dashoffset:0}" +
      ".nac-links{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:12px;opacity:0;transition:opacity .4s ease}" +
      ".nac-links.nac-show{opacity:1}" +
      "@media (prefers-reduced-motion:reduce){.nac-in,.nac-play,.nac-play *,.nac-open .nac-rose,.nac-open .nac-micro{animation:none!important}}";
    document.head.appendChild(st);
  }
  var container = el(
    "span",
    "display:inline-flex;flex-direction:column;align-items:center;gap:7px;font-family:" +
      FONT +
      ";line-height:normal;animation:nacStampIn .8s cubic-bezier(.2,.9,.25,1.15) both;"
  );
  container.className = "nac-in";

  var visual = document.createElement("a");
  visual.href = link;
  visual.target = "_blank";
  visual.rel = "noopener noreferrer";
  visual.setAttribute("aria-label", "No AI Content — verified human writing");
  visual.style.cssText = "text-decoration:none;color:" + c.fg + ";box-sizing:border-box;line-height:0;display:inline-block;";
  var msgFull = author ? message + " — " + author : message;

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
  } else {
    visual.appendChild(el("span", "display:inline-block", stampSVG(sizeAttr > 0 ? sizeAttr : 156)));
  }
  container.appendChild(visual);

  /* ---------------- "What is this?" — answers INSIDE the widget ----------------
     Clicking the CTA replays the stamp (rings redraw stroke-by-stroke, the seal
     thumps like a real stamp, the rosette + microprint slowly counter-rotate)
     and slides an explainer card open right under the badge. No modal. */
  var isOpen = false;
  var typed = false;
  var cta = null;
  var panel = null;
  var tw = null;
  var aiChip = null;
  var links = null;

  if (style !== "compact") {
    cta = document.createElement("button");
    cta.type = "button";
    cta.textContent = "ⓘ What is this?";
    cta.setAttribute("aria-expanded", "false");
    cta.style.cssText =
      "cursor:pointer;border:none;background:transparent;color:" + c.sub +
      ";font-family:" + FONT + ";font-size:11px;font-weight:600;letter-spacing:.2px;padding:2px 6px;text-decoration:underline;text-underline-offset:2px;";
    cta.addEventListener("click", function (e) {
      e.preventDefault();
      toggle();
    });
    container.appendChild(cta);

    var panelW = style === "banner" ? 400 : Math.max(sizeAttr > 0 ? sizeAttr : 156, 230);
    panel = el("span", "width:" + panelW + "px;max-width:88vw;");
    panel.className = "nac-panel";
    var card = el(
      "span",
      "display:block;background:" + c.bg + ";color:" + c.fg + ";border:1px solid " + c.border +
      ";border-radius:14px;padding:14px 15px 15px;text-align:center;box-shadow:0 6px 22px rgba(2,6,23,.12);margin-top:2px;"
    );
    tw = el("span", "display:block;min-height:60px;font-size:12.5px;line-height:1.55;text-align:left;");
    aiChip = el("span", "margin-top:10px;", 'AI-GENERATED<svg viewBox="0 0 120 44" preserveAspectRatio="none" aria-hidden="true"><line class="nac-x" x1="6" y1="6" x2="114" y2="38"/></svg>');
    aiChip.className = "nac-chip";
    links = el("span");
    links.className = "nac-links";
    var linkCss =
      "text-decoration:none;border-radius:8px;padding:7px 12px;font-size:11.5px;font-weight:700;font-family:" + FONT + ";";
    var a1 = el("a", linkCss + "background:" + ink + ";color:#fff;", "The humans →");
    a1.href = base + "/directory";
    a1.target = "_blank";
    a1.rel = "noopener noreferrer";
    var a2 = el("a", linkCss + "color:" + c.sub + ";border:1px solid " + c.border + ";", "The rules");
    a2.href = base + "/eligibility";
    a2.target = "_blank";
    a2.rel = "noopener noreferrer";
    links.appendChild(a1);
    links.appendChild(a2);
    card.appendChild(tw);
    card.appendChild(aiChip);
    card.appendChild(links);
    panel.appendChild(card);
    container.appendChild(panel);
  }

  function toggle() {
    isOpen = !isOpen;
    cta.setAttribute("aria-expanded", String(isOpen));
    cta.textContent = isOpen ? "✕ Close" : "ⓘ What is this?";
    container.classList.toggle("nac-open", isOpen);
    panel.classList.toggle("nac-open-p", isOpen);
    if (!isOpen) return;

    // Replay the stamp: rings redraw + seal thump (restart by reflow).
    visual.classList.remove("nac-play");
    void visual.offsetWidth;
    visual.classList.add("nac-play");

    if (typed) {
      aiChip.classList.add("nac-show");
      links.classList.add("nac-show");
      return;
    }
    typed = true;

    // Typewriter the manifesto into the card.
    var full =
      "Some blogs are still written by a person.\n" +
      "AI can sharpen a sentence — it shouldn't <b>replace the writer.</b>\n" +
      "This stamp means a human is still behind the words.";
    var i = 0;
    function type() {
      if (i > full.length) {
        aiChip.classList.add("nac-show");
        setTimeout(function () { links.classList.add("nac-show"); }, 600);
        return;
      }
      var partial = full.slice(0, i);
      var opens = (partial.match(/<b>/g) || []).length;
      var closes = (partial.match(/<\/b>/g) || []).length;
      tw.innerHTML =
        partial.replace(/\n/g, "<br>").replace(/<b>/g, '<b style="color:' + ink + '">') +
        (opens > closes ? "</b>" : "") +
        '<span class="nac-cursor" style="background:' + ink + '"></span>';
      if (full.substr(i, 3) === "<b>") i += 3;
      else if (full.substr(i, 4) === "</b>") i += 4;
      else i += 1;
      setTimeout(type, full.substr(i, 1) === "\n" ? 240 : 22);
    }
    setTimeout(type, 450);
  }

  script.parentNode.insertBefore(container, script.nextSibling);

  /* ---------------- Tracking ping (domain-only, no PII) ---------------- */
  try {
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
  } catch (e) {}
})();

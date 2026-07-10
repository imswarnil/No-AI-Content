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
      '<g fill="none" stroke="' + ink + '" stroke-width="0.6" opacity="0.55">' +
      '<path d="' + wavyRing(100, 100, 90, 2.6, 26, 0) + '"/>' +
      '<path d="' + wavyRing(100, 100, 90, 2.6, 26, 0.6) + '"/>' +
      '<path d="' + wavyRing(100, 100, 84, 1.8, 32, 0.3) + '"/>' +
      "</g>" +
      // faint rosette behind the center
      '<path d="' + rosette(100, 100, 46, 6, 12, 7) + '" fill="none" stroke="' + ink +
      '" stroke-width="0.4" opacity="0.18"/>' +
      // solid rings
      '<g fill="none" stroke="' + ink + '">' +
      '<circle cx="100" cy="100" r="94" stroke-width="3.2"/>' +
      '<circle cx="100" cy="100" r="80" stroke-width="1.2"/>' +
      '<circle cx="100" cy="100" r="49" stroke-width="1.2"/>' +
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
      '<text fill="' + ink + '" font-family="' + FONT + '" font-size="3.1" letter-spacing="0.3" opacity="0.9">' +
      '<textPath href="#' + micId + '" startOffset="0">' + microString() + "</textPath></text>" +
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
      "@media (prefers-reduced-motion:reduce){.nac-in{animation:none!important}}";
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

  // "What is this?" CTA (skip on the tiny compact pill)
  if (style !== "compact") {
    var cta = document.createElement("button");
    cta.type = "button";
    cta.textContent = "ⓘ What is this?";
    cta.style.cssText =
      "cursor:pointer;border:none;background:transparent;color:" + c.sub +
      ";font-family:" + FONT + ";font-size:11px;font-weight:600;letter-spacing:.2px;padding:2px 6px;text-decoration:underline;text-underline-offset:2px;";
    cta.addEventListener("click", function (e) {
      e.preventDefault();
      openOverlay();
    });
    container.appendChild(cta);
  }

  script.parentNode.insertBefore(container, script.nextSibling);

  /* ---------------- "What is this?" animated overlay (Shadow DOM) ---------------- */
  function openOverlay() {
    var host = document.createElement("div");
    host.style.cssText = "all:initial;position:fixed;inset:0;z-index:2147483647;";
    document.body.appendChild(host);
    var root = host.attachShadow ? host.attachShadow({ mode: "open" }) : host;

    root.innerHTML =
      "<style>" +
      "*{box-sizing:border-box;margin:0;font-family:" + FONT + ";}" +
      ".back{position:fixed;inset:0;background:rgba(2,6,23,.72);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;transition:opacity .3s ease;}" +
      ".back.in{opacity:1;}" +
      ".panel{background:" + c.bg + ";color:" + c.fg + ";border:1px solid " + c.border +
      ";border-radius:20px;max-width:440px;width:100%;padding:30px 28px;text-align:center;box-shadow:0 24px 70px rgba(0,0,0,.5);transform:translateY(14px) scale(.96);opacity:0;transition:transform .35s cubic-bezier(.2,.8,.2,1),opacity .35s ease;}" +
      ".back.in .panel{transform:none;opacity:1;}" +
      ".seal{display:inline-block;animation:pop .6s cubic-bezier(.2,1.4,.4,1) both;}" +
      "@keyframes pop{from{transform:scale(.4) rotate(-25deg);opacity:0}to{transform:none;opacity:1}}" +
      ".tw{min-height:66px;font-size:15px;line-height:1.5;color:" + c.fg + ";margin:18px 4px 6px;}" +
      ".tw b{color:" + ink + ";}" +
      ".cursor{display:inline-block;width:2px;height:1.05em;background:" + ink + ";vertical-align:-2px;margin-left:1px;animation:bl 1s steps(1) infinite;}" +
      "@keyframes bl{50%{opacity:0}}" +
      ".ai{margin:14px auto 4px;position:relative;display:inline-flex;align-items:center;gap:8px;border:2px dashed #ef4444;color:#ef4444;border-radius:10px;padding:8px 16px;font-weight:800;letter-spacing:1px;font-size:13px;opacity:0;transform:scale(.9);transition:all .4s ease;}" +
      ".ai.show{opacity:1;transform:none;}" +
      ".ai svg{position:absolute;inset:-6px;width:calc(100% + 12px);height:calc(100% + 12px);overflow:visible;}" +
      ".ai .x{stroke:#ef4444;stroke-width:4;stroke-linecap:round;stroke-dasharray:200;stroke-dashoffset:200;transition:stroke-dashoffset .5s ease .35s;}" +
      ".ai.show .x{stroke-dashoffset:0;}" +
      ".btns{margin-top:22px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;opacity:0;transition:opacity .4s ease;}" +
      ".btns.show{opacity:1;}" +
      ".b{cursor:pointer;border:none;border-radius:10px;padding:11px 18px;font-size:14px;font-weight:700;text-decoration:none;}" +
      ".b.p{background:" + ink + ";color:#fff;}" +
      ".b.s{background:transparent;color:" + c.sub + ";border:1px solid " + c.border + ";}" +
      "</style>" +
      '<div class="back"><div class="panel">' +
      '<span class="seal">' + stampSVG(120) + "</span>" +
      '<div class="tw"></div>' +
      '<div class="ai">AI-GENERATED<svg viewBox="0 0 120 44" preserveAspectRatio="none"><line class="x" x1="6" y1="6" x2="114" y2="38"/></svg></div>' +
      '<div class="btns">' +
      '<a class="b p" href="' + base + '/directory">See humans who write by hand →</a>' +
      '<a class="b s" href="' + base + '/eligibility">The rules</a>' +
      '<button class="b s nac-close">Close</button>' +
      "</div></div></div>";

    var back = root.querySelector(".back");
    var tw = root.querySelector(".tw");
    var ai = root.querySelector(".ai");
    var btns = root.querySelector(".btns");

    function close() {
      back.classList.remove("in");
      setTimeout(function () { host.remove(); }, 300);
    }
    root.querySelector(".nac-close").addEventListener("click", close);
    back.addEventListener("click", function (e) { if (e.target === back) close(); });

    setTimeout(function () { back.classList.add("in"); }, 20);

    // Typewriter the manifesto
    var lines = [
      "Some blogs are still written by a person.\n",
      "AI can sharpen a sentence — it shouldn't ",
      "<b>replace the writer.</b>\n",
      "This stamp means a human is still behind the words.",
    ];
    var full = lines.join("");
    var i = 0;
    function type() {
      if (i > full.length) {
        ai.classList.add("show");
        setTimeout(function () { btns.classList.add("show"); }, 700);
        return;
      }
      // render partial while keeping <b> tags intact
      var partial = full.slice(0, i);
      var opens = (partial.match(/<b>/g) || []).length;
      var closes = (partial.match(/<\/b>/g) || []).length;
      tw.innerHTML = partial.replace(/\n/g, "<br>") + (opens > closes ? "</b>" : "") + '<span class="cursor"></span>';
      // skip over tag characters quickly
      if (full.substr(i, 3) === "<b>") i += 3;
      else if (full.substr(i, 4) === "</b>") i += 4;
      else i += 1;
      setTimeout(type, full.substr(i, 1) === "\n" ? 260 : 26);
    }
    setTimeout(type, 650);
  }

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

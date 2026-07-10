(function () {
  "use strict";

  // Find the <script> tag that loaded this file so we can read its data-* config
  // and derive the API base URL (works no matter what domain embeds it).
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

  var author = script.getAttribute("data-author") || "";
  var message =
    script.getAttribute("data-message") ||
    "This content is written by a human. No AI-generated content.";
  var theme = (script.getAttribute("data-theme") || "light").toLowerCase();
  var link = script.getAttribute("data-link") || base;

  var isDark = theme === "dark";
  var bg = isDark ? "#111827" : "#ffffff";
  var fg = isDark ? "#f9fafb" : "#111827";
  var sub = isDark ? "#9ca3af" : "#6b7280";
  var border = isDark ? "#374151" : "#e5e7eb";
  var accent = "#16a34a";

  // --- Build the badge ---
  var wrap = document.createElement("a");
  wrap.href = link;
  wrap.target = "_blank";
  wrap.rel = "noopener noreferrer";
  wrap.setAttribute("aria-label", "No AI Content badge");
  wrap.style.cssText = [
    "display:inline-flex",
    "align-items:center",
    "gap:10px",
    "text-decoration:none",
    "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif",
    "background:" + bg,
    "color:" + fg,
    "border:1px solid " + border,
    "border-radius:10px",
    "padding:10px 14px",
    "max-width:340px",
    "box-shadow:0 1px 2px rgba(0,0,0,0.06)",
    "line-height:1.35",
  ].join(";");

  // Human / no-robot mark
  var icon = document.createElement("span");
  icon.style.cssText =
    "flex:0 0 auto;width:28px;height:28px;border-radius:7px;display:inline-flex;align-items:center;justify-content:center;background:" +
    accent +
    ";color:#fff;font-size:16px;font-weight:700;";
  icon.textContent = "✓"; // check mark
  icon.setAttribute("aria-hidden", "true");

  var text = document.createElement("span");
  text.style.cssText = "display:flex;flex-direction:column;min-width:0;";

  var title = document.createElement("strong");
  title.textContent = "No AI Content";
  title.style.cssText = "font-size:13px;font-weight:700;letter-spacing:.2px;";

  var msg = document.createElement("span");
  msg.textContent = author ? message + " — " + author : message;
  msg.style.cssText = "font-size:11px;color:" + sub + ";";

  text.appendChild(title);
  text.appendChild(msg);
  wrap.appendChild(icon);
  wrap.appendChild(text);

  // Insert the badge right where the script tag is.
  script.parentNode.insertBefore(wrap, script.nextSibling);

  // --- Fire the tracking ping (domain-only, no PII) ---
  try {
    var payload = JSON.stringify({
      domain: location.hostname,
      author: author || null,
      message: message || null,
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(base + "/api/track", payload);
    } else {
      fetch(base + "/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
        mode: "no-cors",
      });
    }
  } catch (e) {
    /* tracking failures never break the host page */
  }
})();

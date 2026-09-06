"use client";

import { useEffect, useRef } from "react";
import type { Style } from "@/lib/badge";

/** Renders the real widget.js into an isolated node for preview. */
export default function WidgetPreview({
  origin,
  style,
  theme,
  author,
  message,
}: {
  origin: string;
  style: Style;
  theme: string;
  author: string;
  message: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = ref.current;
    if (!host || !origin) return;
    host.innerHTML = "";
    const s = document.createElement("script");
    s.src = `${origin}/widget.js`;
    if (author) s.setAttribute("data-author", author);
    s.setAttribute("data-message", message);
    s.setAttribute("data-style", style);
    s.setAttribute("data-theme", theme);
    host.appendChild(s);
  }, [origin, style, theme, author, message]);
  return <div ref={ref} className="widget-host" />;
}

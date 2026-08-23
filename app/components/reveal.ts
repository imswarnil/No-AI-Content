"use client";

import { useEffect } from "react";

/**
 * Reveal-on-scroll for `.reveal` elements — adds `.in` as each comes into view.
 *
 * Two mechanisms, because IntersectionObserver alone is not enough here.
 *
 * IO only calls back when an element's intersection ratio *crosses a
 * threshold*. Once observation has started, an element that goes from ratio 0
 * (below the fold) to ratio 0 (above the fold) in a single jump never crosses
 * anything — no callback fires, and it stays at `opacity: 0` for good. An
 * anchor link, a fast flick, or find-in-page all do exactly that. Measured on
 * an earlier build of this page: land at the bottom and eleven of twelve
 * sections above stayed invisible.
 *
 *   1. IO handles the ordinary case efficiently, and its one guaranteed
 *      initial observation per target is what catches a page loaded *already*
 *      scrolled down. Those arrive as `isIntersecting: false`, hence the
 *      explicit "already above the viewport" test.
 *   2. A position sweep — at mount, and rAF-coalesced on scroll/resize —
 *      catches anything skipped over, and works if IO is unavailable.
 *
 * A hidden tab has rAF and IO delivery paused, so `visibilitychange` re-checks
 * on wake rather than waiting for the reader to scroll again. The whole thing
 * tears itself down once the last element is revealed.
 */

/** Elements reveal once their top passes this fraction of the viewport. */
const REVEAL_LINE = 0.92;

export function useRevealOnScroll(selector = ".reveal") {
  useEffect(() => {
    const pending = new Set(document.querySelectorAll<HTMLElement>(selector));
    if (pending.size === 0) return;

    let frame = 0;
    let io: IntersectionObserver | null = null;

    const stop = () => {
      io?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("visibilitychange", onScroll);
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    const reveal = (el: Element) => {
      el.classList.add("in");
      pending.delete(el as HTMLElement);
      io?.unobserve(el);
      if (pending.size === 0) stop();
    };

    const sweep = () => {
      frame = 0;
      for (const el of Array.from(pending)) {
        if (el.getBoundingClientRect().top < window.innerHeight * REVEAL_LINE) reveal(el);
      }
    };

    function onScroll() {
      if (!frame) frame = requestAnimationFrame(sweep);
    }

    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting || e.boundingClientRect.top < 0) reveal(e.target);
          }
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
      );
      for (const el of Array.from(pending)) io.observe(el);
    }

    sweep();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onScroll);
    return stop;
  }, [selector]);
}

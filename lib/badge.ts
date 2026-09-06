export type Style =
  | "stamp"
  | "wax"
  | "passport"
  | "postmark"
  | "ribbon"
  | "certificate"
  | "typewriter"
  | "banner"
  | "compact";

export const PRESETS = [
  "Written by a human. AI is used only to refine ideas — never to generate.",
  "100% human-written. No AI-generated text.",
  "The words are mine. AI helps me edit, not write.",
  "Human-first writing. AI assists — the human decides.",
];

export const STYLES: { key: Style; name: string; blurb: string }[] = [
  { key: "stamp", name: "Notary stamp", blurb: "The signature seal — for sidebars" },
  { key: "wax", name: "Wax seal", blurb: "Pressed in molten ink" },
  { key: "passport", name: "Passport visa", blurb: "Admitted to the open web" },
  { key: "postmark", name: "Postmark", blurb: "Hand-delivered writing" },
  { key: "ribbon", name: "Prize ribbon", blurb: "100% human, award-style" },
  { key: "certificate", name: "Certificate", blurb: "Serial-numbered declaration" },
  { key: "typewriter", name: "Typewriter byline", blurb: "A quiet mono signature" },
  { key: "banner", name: "Banner", blurb: "Best for footers / about pages" },
  { key: "compact", name: "Compact pill", blurb: "Best for inline / bylines" },
];

export function escapeAttr(s: string) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

/**
 * Pictograms for the four attributes CureRays publishes about its therapy.
 *
 * Drawn entirely from straight segments — no arcs, no circles, mitred joins and
 * square caps — so they belong to the same angular language as the rest of the
 * public site. They inherit `currentColor` and are sized in one place.
 *
 * Each mark is literal rather than decorative, and each has to survive being
 * read at 17px. That rules out anything with interior detail: an abstract mark
 * that needs its label to be understood is no better than the bullet it
 * replaced, so these lean on conventions a visitor already knows — a struck
 * needle, a struck jolt, sutures, a falling level.
 */

const ATTRIBUTE_PATHS: Record<string, React.ReactNode> = {
  // An eye drawn as a lens, dashed: present, but not seen. No incision to look at.
  Invisible: (
    <>
      <path d="M2 12 12 5l10 7-10 7z" strokeDasharray="3 2.4" />
      <path d="M12 9.5 14.5 12 12 14.5 9.5 12z" />
    </>
  ),
  // A jolt, struck out. Sessions are non-invasive and anaesthesia-free.
  Painless: (
    <>
      <path d="M13.5 2.5 7 13h4l-1.5 8.5L17 11h-4z" />
      <path d="M3.5 3.5 20.5 20.5" />
    </>
  ),
  // A clean surface under a sparkle. Sutures struck out was the honest
  // metaphor, but three ticks plus a slash collapse into a scribble at 17px.
  'Scar-Free': (
    <>
      <path d="M12 2.5 13.6 8.4 19.5 10l-5.9 1.6L12 17.5l-1.6-5.9L4.5 10l5.9-1.6z" />
      <path d="M4 20.5h16" />
    </>
  ),
  // Two edges closing on each other: swelling brought down.
  'Anti-Inflammatory': (
    <>
      <path d="M3.5 5 12 9.5 20.5 5" />
      <path d="M3.5 19 12 14.5l8.5 4.5" />
    </>
  )
};

export function AttributeIcon({ name }: { name: string }) {
  const paths = ATTRIBUTE_PATHS[name];
  if (!paths) return null;
  return (
    <svg
      className="site-attribute-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
    >
      {paths}
    </svg>
  );
}

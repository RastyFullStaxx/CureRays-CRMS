# Full-Viewport CureRays Landing Polish

## Goal

Make the CureRays landing read as a complete, full-screen composition at desktop and large-desktop sizes while preserving the existing responsive mobile flow, fixed daylight palette, demo authentication, and clinical trust.

## Approved Direction

Use a wide editorial canvas rather than scaling every control. The atmospheric hero should span the browser width, while copy and the sign-in card remain bounded and readable. The layout must remove the apparent left crop in the supplied 1903 x 886 screenshot and gain proportionate vertical headroom on taller screens.

## Layout Contract

- The landing background and hero atmosphere are viewport-wide.
- The shared landing frame grows fluidly up to 1920px. At widths near 1920px it uses the available browser canvas with responsive safe gutters instead of remaining inside the current 1440px frame.
- The hero artwork may bleed into the outer gutter but cannot create horizontal scrolling or obscure interactive content.
- Desktop hero height follows the available viewport height after the 72px header, with a ceiling that prevents excessive empty space on 4K displays.
- The headline/course column and sign-in card use explicit bounded widths and `space-between` composition on wide screens. The sign-in card must not stretch with the viewport.
- The About CureRays image may grow on large screens, while prose line lengths remain constrained.
- Existing stacked tablet and mobile layouts remain intact.

## Typography

Use Space Grotesk at 600 and 700 for landing-only marketing headings and the CureRays wordmark. Keep Inter for navigation, body copy, workflow labels, inputs, buttons, security copy, and all authenticated application UI.

This is a narrow landing-page exception to the current Inter-only rule. It uses `next/font/google`, introduces no package dependency, and must be recorded in the typography guide and guardrail.

## Responsive Targets

The finished page must be visually checked at:

- 390 x 844
- 768 x 1024
- 1280 x 800
- 1440 x 900
- 1903 x 886, matching the supplied screenshot
- 1920 x 1080
- 2560 x 1440
- 3440 x 1440
- 3840 x 2160

At every target there must be no horizontal overflow, clipped copy, clipped form controls, or artwork edge that reads as an accidental container crop. At desktop sizes the first viewport should contain the complete header and hero composition; the next section may begin below the fold.

## Implementation Boundaries

- Prefer CSS and existing components; add no layout JavaScript or dependency.
- Keep the fixed landing palette unchanged.
- Do not change authentication behavior or form validation.
- Update the responsive `sizes` hint for the editorial image if its rendered large-screen width changes.
- Add the smallest guardrail assertions needed for the wide frame, safe artwork treatment, and landing display font.

## Verification

- Run the targeted landing guardrail first.
- Run `npm run verify` after implementation.
- Use the browser viewport matrix above, including the exact supplied viewport.
- Confirm keyboard focus, reduced motion, the password visibility control, and successful demo sign-in still work.


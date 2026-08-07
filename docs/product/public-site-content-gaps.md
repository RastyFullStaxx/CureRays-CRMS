# Public Site — What The Clinic Still Owes

This is the handover list for [the public site](../architecture/public-site.md). Everything here needs a person at CureRays, not an engineer. The site is built and gated so that nothing on this list can reach a visitor until it is answered — unanswered questions render nowhere, draft pages stay out of navigation and the sitemap, and no answer has been guessed.

Three kinds of gap: **answers**, **assets**, and **sign-off**.

---

## 1. Answers — patient questions

An audit checked nineteen questions a patient commonly has before booking. **The site answered two.** The rest are facts about the practice that only the practice can state.

They live in [`lib/site-patient-information.ts`](../../lib/site-patient-information.ts). To publish one, replace `pending: true` with the answer text and a `source` naming where it was confirmed.

### What treatment is like
- How long does a single session take?
- How many sessions will I need?
- Can I drive myself home afterwards?
- What side effects should I expect?
- Can I work during my course of treatment?

### Cost and insurance — *the highest-value gap on this list*
- Do you accept Medicare?
- Which insurance plans do you accept?
- What does treatment cost without insurance?
- Will you check my coverage before I start?
- Do you offer payment plans?

### Whether this is for you
- Do I need a referral from my doctor?
- Who is not a candidate for this therapy?
- Can I have this if I have had radiation before?

### Your first visit
- What are your opening hours?
- What should I bring to my first appointment?
- How long is the first appointment?
- Is there parking on site?
- Can someone come with me?

**Publishing gate.** `/patient-information` is `noindex`, absent from the navigation, and absent from the sitemap while any section is empty. It goes live automatically once every section can answer at least one question — remove `draft: true` from the route in [`lib/site-routes.ts`](../../lib/site-routes.ts) at that point.

---

## 2. Assets — nothing on the site shows the practice

The site currently contains no photograph of the clinic, the team, or a treatment room. For a medical practice that is the largest single trust gap.

- Dr. Clayton B. Hess portrait
- The care team
- A treatment room
- The building and its entrance, ideally showing parking
- An OG image at 1200×630
- A favicon set

> ### ⚠ Patient clinical photographs cannot be used here
>
> The CRMS tracks clinical photographs — a *Clinical Photos / Skin evidence* counter, dermoscopy and required-photograph checklists. **None of it may appear on the public site.** A clinical photograph of a patient is PHI, and marketing use of PHI requires written authorization from the individual under HIPAA §164.508. This holds even for images that appear de-identified, and it sits against this repository's standing rule that PHI never reaches a client bundle.
>
> Usable instead: licensed stock clinical imagery, or patient photographs accompanied by a signed release.

---

## 3. Sign-off — claims already on the site

### Authored copy that is not sourced from CureRays

`lib/site-content.ts` holds only published clinic material. But some connective copy was **written for the site** and sits inline in the page files. Most is procedural and uncontroversial ("Call the clinic and a member of the care team will talk it through with you"). Two make substantive claims about the patient experience and need approval or replacement:

| Where | Copy | Why it needs review |
|---|---|---|
| Homepage, attributes section heading | "Treatment You Can Return To Work After" | A claim about returning to work. Not in the published attributes. |
| Homepage, attributes section lead | "…without an incision, without sedation, and without a recovery you have to plan your life around" | *Without an incision* and *anesthesia-free* are published. *Without a recovery you have to plan your life around* is authored. |

### Illustrations that make relative statements

Two generated visuals illustrate clinical content. Neither invents a claim, but both make a relative visual statement and need a clinical owner to confirm the illustration is faithful:

- **The treatments figure** — each formation illustrates that modality's own published description (deposit at the surface, below the surface, across a series). Detail in [public-site.md](../architecture/public-site.md#the-treatments-figure).
- **The condition map** — which body region each condition affects. Most entries come from the condition's own name; **Ledderhose** and **Peyronie's** rest on clinical knowledge instead. Conditions whose names do not state a site are marked *"occurs at several sites"* rather than assigned one — do not assign them without clinical input.

---

## Priority

1. **Cost and insurance.** The most common reason a patient does not call, and it is entirely absent.
2. **Assets.** A clinic with no visible people or premises reads as unfinished.
3. **What treatment is like.** Session length, side effects, driving home.
4. **Sign-off** on the two authored claims and the two illustrations.

Items 1 and 3 are worth more to the practice than any further design work.

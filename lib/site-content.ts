/**
 * Copy for the public clinic site.
 *
 * Every claim here comes from CureRays' own published material. Do not add
 * outcomes, efficacy, safety, regulatory, or compliance claims that the clinic
 * has not published itself — the clinic is the authority on its own content.
 *
 * Route definitions live in `lib/site-routes.ts`, which middleware imports;
 * this module is for pages only.
 */

export type Treatment = {
  readonly slug: string;
  readonly abbreviation: string;
  readonly name: string;
  readonly summary: string;
  readonly appliesTo: readonly string[];
};

export type ServiceGroup = {
  readonly name: string;
  readonly services: readonly string[];
};

export type Award = {
  readonly name: string;
  readonly detail: string;
};

export const CLINIC = {
  name: 'CureRays® Radiation Medicine',
  shortName: 'CureRays',
  tagline: 'Keep Cancer Away®',
  motto: 'Screen. Treat. Survive. Repeat.™',
  belief: 'We believe x-rays can cure cancer and more.',
  purpose: 'We exist to expand access to innovative non-invasive x-ray therapy to all.',
  promise: 'We promise to help keep cancer away.'
} as const;

export const CONTACT = {
  street: '300 Sierra College Drive Suite 150',
  city: 'Grass Valley',
  state: 'CA',
  postalCode: '95945-5723',
  tollFreeLabel: '(844) CURERAYS',
  tollFreeDigits: '(844) 287-3729',
  tollFreeHref: 'tel:+18442873729',
  localLabel: '(530) 802-6400',
  localHref: 'tel:+15308026400',
  faxLabel: '(530) 267-6733',
  email: 'contact@curerays.com',
  emailHref: 'mailto:contact@curerays.com',
  mapHref:
    'https://www.google.com/maps/search/?api=1&query=300+Sierra+College+Drive+Suite+150+Grass+Valley+CA+95945'
} as const;

export const SOCIAL = [
  { name: 'X', href: 'https://x.com/CureRays' },
  { name: 'Facebook', href: 'https://www.facebook.com/CureRays' },
  { name: 'Instagram', href: 'https://www.instagram.com/curerays' },
  { name: 'YouTube', href: 'https://www.youtube.com/channel/UCTVuqHJHDbWLWKfqvpI9g_Q' },
  { name: 'Yelp', href: 'https://www.yelp.com/biz/curerays-grass-valley' }
] as const;

/** Attributes CureRays publishes about its x-ray therapy. */
export const TREATMENT_ATTRIBUTES = [
  { name: 'Invisible', detail: 'Therapy is delivered without an incision.' },
  { name: 'Painless', detail: 'Sessions are non-invasive and anesthesia-free.' },
  { name: 'Scar-Free', detail: 'Treatment leaves no surgical scar behind.' },
  { name: 'Anti-Inflammatory', detail: 'Low doses target inflammation directly.' }
] as const;

/** Figures published by CureRays. Kept together so they are easy to update. */
export const PRACTICE_FACTS = [
  { value: '1,500+', label: 'Patients Served', detail: '300+ annually' },
  { value: '8+', label: 'Providers On Staff', detail: 'Across the care team' },
  { value: '30+', label: 'Years Combined', detail: 'Clinical experience' },
  { value: '5-Star', label: 'Patient Satisfaction', detail: 'Published rating' }
] as const;

export const TREATMENTS: readonly Treatment[] = [
  {
    slug: 'srt-skin-cancer',
    abbreviation: 'SRT',
    name: 'Superficial Radiation Therapy',
    summary:
      'Low-energy x-rays treat skin cancer at the surface, reaching the lesion without an incision and without sedation.',
    appliesTo: ['Skin cancer']
  },
  {
    slug: 'ldrt-arthritis',
    abbreviation: 'LDRT',
    name: 'Low-Dose Radiation Therapy',
    summary:
      'Very low radiation doses target the inflammation behind joint pain, delivered over a short series of brief sessions.',
    appliesTo: ['Hand arthritis', 'Osteoarthritis']
  },
  {
    slug: 'srt-keloids',
    abbreviation: 'SRT',
    name: 'Superficial Radiation Therapy for Keloids',
    summary:
      'Radiation follows keloid removal to address the overgrowth response that causes scars to return.',
    appliesTo: ['Keloids']
  },
  {
    slug: 'deep-srt',
    abbreviation: 'DEEP-SRT™',
    name: 'DEEP-SRT™',
    summary:
      "CureRays' approach for benign conditions that sit below the skin surface, including Dupuytren's contracture.",
    appliesTo: ["Dupuytren's contracture", 'Benign conditions']
  },
  {
    slug: 'ebrt',
    abbreviation: 'EBRT',
    name: 'External Beam Radiation Therapy',
    summary:
      'Radiation is directed at a tumour from outside the body, shaped to the treatment area.',
    appliesTo: ['Cancer']
  },
  {
    slug: 'imrt',
    abbreviation: 'IMRT',
    name: 'Intensity-Modulated Radiation Therapy',
    summary:
      'Beam intensity is varied across the treatment field so the dose conforms closely to the target shape.',
    appliesTo: ['Cancer']
  },
  {
    slug: 'sbrt',
    abbreviation: 'SBRT',
    name: 'Stereotactic-Body Radiation Therapy',
    summary:
      'A small number of precisely targeted, higher-dose sessions treat well-defined targets.',
    appliesTo: ['Cancer']
  },
  {
    slug: 'igrt',
    abbreviation: 'IGRT',
    name: 'Image-Guided Radiation Therapy',
    summary:
      'Imaging taken at the time of treatment confirms position before the dose is delivered.',
    appliesTo: ['Cancer']
  },
  {
    slug: 'investigational-ldrt',
    abbreviation: 'Investigational',
    name: 'Low-Dose Radiation Therapy for Certain Infections',
    summary:
      'An investigational use of low-dose radiation therapy, offered in a research context.',
    appliesTo: ['Select infections']
  }
] as const;

export const CONDITIONS: readonly string[] = [
  'Skin cancer',
  'Ossification',
  'Hand arthritis',
  'Fasciitis',
  'Contracture',
  "Peyronie's disease",
  'Keloids',
  'Gynecomastia',
  'Ledderhose disease',
  "Graves' eye disease",
  'Select infections',
  'Desmoid fibromatosis'
] as const;

export const SPECIALTY_AREAS: readonly string[] = [
  'Oncology',
  'Dermatology',
  'Rheumatology',
  'Immunology',
  'Cardiology',
  'Neurology'
] as const;

export const SERVICE_GROUPS: readonly ServiceGroup[] = [
  {
    name: 'Screening & Survivorship',
    services: [
      'Comprehensive cancer screenings',
      'Personalized cancer survivorship',
      'SkinIO: AI- and dermatologist-based body photos'
    ]
  },
  {
    name: 'Skin Procedures',
    services: [
      'Ultrasound-guided skin cancer biopsy',
      'Cryotherapy of pre-cancerous skin lesions'
    ]
  },
  {
    name: 'Medical Management',
    services: [
      'Medical management of osteoarthritis',
      'Medical orthopedics for fibrosis and mobility',
      'Thyroid dysfunction management',
      'Cancer-induced vascular injury management'
    ]
  },
  {
    name: 'Research',
    services: ['Clinical trials and investigative research']
  }
] as const;

export const FOUNDER = {
  name: 'Dr. Clayton B. Hess, MD MPH',
  role: 'Founder',
  credential: 'Board-certified radiation oncologist',
  experience: '15+ years of experience'
} as const;

export const AWARDS: readonly Award[] = [
  {
    name: 'Excellence In Action',
    detail: 'Sierra Nevada Memorial Hospital — innovative practice of the year'
  },
  {
    name: 'Best of ASTRO Research Designation',
    detail: 'Phase III trial for COVID-19 pneumonia treatment'
  },
  {
    name: 'National Cancer Institute K12 Training Grant',
    detail: 'Massachusetts General Hospital'
  },
  {
    name: 'ARRO/ASTRO Global Health Scholarship',
    detail: 'Cervical cancer work in Brazil'
  }
] as const;

/** Programs CureRays names publicly. No pages exist for these yet. */
export const PROGRAMS: readonly string[] = [
  'Keep Cancer Away',
  'Keep Arthritis Away',
  'CureRays Institute',
  'Clinical Outcomes',
  'Join CureRays'
] as const;

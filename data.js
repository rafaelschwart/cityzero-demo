/* CITY 0 OPS · demo data layer
   Every value here is real captured evidence unless marked illustrative.
   Sources: live HTTP sweep 2026-08-24 (sources/rescrape-20260824/),
   Apify Google Maps 2026-08-20 (research/raw/), Firecrawl crawls 08-20 + 08-24.
   Ages are computed from SWEEP_DATE at render time, never hardcoded. */

const SWEEP_DATE = "2026-08-24";
const SWEEP_TIME = "06:00 ET";

function daysSince(iso) {
  return Math.max(0, Math.round((new Date(SWEEP_DATE) - new Date(iso)) / 86400000));
}

const DATA = {
  meta: {
    client: "City Zero Miami",
    entity: "CITY ZERO LLC · 591 SW 8th Street, Miami, FL 33130",
    sweepDate: SWEEP_DATE,
    sweepTime: SWEEP_TIME,
    mode: "READ-ONLY MONITOR · no write access to any City Zero system",
    demo: "Demo built from public surfaces only. No internal data.",
  },

  /* ---------------- EXCEPTIONS ---------------- */
  /* ------------- OPS MANAGER SCREENS: today / grow / keep -------------
     The demo the prospect sees. Gym language only, no API talk. Everything
     SAMPLE until credentials; LIVE-SIM patches these from the pipeline. */
  today: {
    sample: true,
    inNow: 24, todayTotal: 63,
    byFloor: [
      { floor: 1, name: "Main entrance", n: 9 },
      { floor: 2, name: "Studio floor", n: 6, offline: true },
      { floor: 3, name: "Weights floor", n: 7 },
      { floor: 4, name: "Rooftop turf", n: 2 },
    ],
    feed: [
      { id: 9, t: "18:42", name: "Sofia Lopez", floor: 3 },
      { id: 8, t: "18:41", name: "Kevin Diaz", floor: 1 },
      { id: 7, t: "18:37", name: "Camila Reyes", floor: 2 },
      { id: 6, t: "18:31", name: "Marco Ibarra", floor: 3 },
      { id: 5, t: "18:24", name: "Ana Torres", floor: 4 },
      { id: 4, t: "18:19", name: "Luis Mendez", floor: 1 },
      { id: 3, t: "18:12", name: "Paola Vega", floor: 2 },
      { id: 2, t: "18:04", name: "Jorge Pena", floor: 3 },
    ],
    pool: ["Maria G.", "Kevin D.", "Ana T.", "Luis M.", "Camila R.", "Jorge P.",
           "Valentina S.", "Pedro L.", "Adriana C.", "Victor S.", "Emily R.", "Sam K."],
    classesToday: [
      { name: "Full Body Conditioning", at: "6 AM", booked: 21, cap: 25, wait: 0, done: true },
      { name: "Body Fit", at: "12 PM", booked: 14, cap: 25, wait: 0, done: true },
      { name: "Cardio Dance", at: "5 PM", booked: 26, cap: 30, wait: 0, done: false },
      { name: "Spin", at: "6 PM", booked: 20, cap: 20, wait: 2, done: false },
      { name: "Zumba", at: "7 PM", booked: 38, cap: 40, wait: 4, done: false },
      { name: "Jiu Jitsu", at: "8 PM", booked: 15, cap: 18, wait: 0, done: false },
    ],
    do: [
      { kind: "ALERT", who: "Studio floor", what: "reader silent since 06:12", act: "Check the reader" },
      { kind: "TOUR", who: "Melissa R.", what: "tour Today 5 PM, still unconfirmed", act: "Confirm by text" },
      { kind: "CHARGE", who: "Laura Q.", what: "autopay failed, trained this week. $180 waiting", act: "Send payment link" },
    ],
    know: [
      "Zumba and Spin run waitlists tonight; Body Fit at noon had room for 11 more.",
      "Saturday strength classes underfill while dance overflows: the schedule has room to rebalance.",
    ],
  },

  /* Instagram real: perfil + posts capturados con Apify el 20.08.2026 (research/raw/) */
  ig: {
    real: true, captured: "Aug 20",
    handle: "@cityzeromiami", followers: 110999, postsCount: 275,
    top: [
      { when: "Jun 11", likes: 152, comments: 12, text: "Meet @andreinacarvo, our Pilates Sculpt instructor at City Zero" },
      { when: "Aug 1", likes: 131, comments: 0, text: "BADDIE BOOTCAMP + dance party with Austin Jackson" },
      { when: "Jul 2", likes: 103, comments: 8, text: "Have you spotted our new equipment on the 4th floor yet?" },
      { when: "Jul 24", likes: 58, comments: 2, text: "FREE Friend Fridays are here. Buy 1, Get 1 day passes" },
    ],
    insight: "110,999 followers with zero paid amplification behind them. The audience already exists; the system's job is turning it into tours.",
  },

  /* heatmap de accesos (Hours view). OJO: la clave NO puede llamarse "hours":
     ya existe DATA.hours (el array del monitor, sitio vs Google) mas abajo. */
  heatmap: {
    sample: true,
    from: 5, to: 22, max: 17,
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    matrix: [
      [2, 5, 7, 6, 4, 3, 4, 5, 6, 5, 4, 5, 8, 13, 17, 16, 12, 6],
      [2, 5, 7, 6, 4, 3, 4, 5, 6, 5, 4, 5, 8, 12, 16, 15, 11, 6],
      [2, 5, 7, 6, 4, 3, 4, 5, 6, 5, 4, 5, 8, 12, 16, 15, 11, 6],
      [2, 5, 7, 6, 4, 3, 4, 5, 6, 5, 4, 5, 8, 12, 16, 15, 11, 6],
      [2, 5, 6, 5, 4, 3, 4, 5, 5, 5, 4, 5, 7, 11, 14, 14, 10, 5],
      [3, 6, 8, 9, 7, 5, 4, 3, 3, 2, 2, 2, 3, 4, 5, 4, 3, 2],
      [2, 4, 6, 7, 5, 4, 3, 2, 2, 2, 1, 1, 2, 3, 3, 3, 2, 1],
    ],
    classes: [
      { d: 0, h: 6, name: "Full Body Conditioning" }, { d: 0, h: 12, name: "Body Fit" },
      { d: 0, h: 17, name: "Cardio Dance" }, { d: 0, h: 18, name: "Spin" },
      { d: 0, h: 19, name: "Zumba" }, { d: 0, h: 20, name: "Jiu Jitsu" },
      { d: 1, h: 6, name: "Full Body Conditioning" }, { d: 1, h: 12, name: "Body Fit" },
      { d: 1, h: 17, name: "Cardio Dance" }, { d: 1, h: 18, name: "Spin" },
      { d: 1, h: 19, name: "Zumba" }, { d: 1, h: 20, name: "Jiu Jitsu" },
      { d: 2, h: 6, name: "Full Body Conditioning" }, { d: 2, h: 12, name: "Body Fit" },
      { d: 2, h: 17, name: "Cardio Dance" }, { d: 2, h: 18, name: "Spin" },
      { d: 2, h: 19, name: "Zumba" }, { d: 2, h: 20, name: "Jiu Jitsu" },
      { d: 3, h: 6, name: "Full Body Conditioning" }, { d: 3, h: 12, name: "Body Fit" },
      { d: 3, h: 17, name: "Cardio Dance" }, { d: 3, h: 18, name: "Spin" },
      { d: 3, h: 19, name: "Zumba" }, { d: 3, h: 20, name: "Jiu Jitsu" },
      { d: 4, h: 6, name: "Full Body Conditioning" }, { d: 4, h: 12, name: "Body Fit" },
      { d: 4, h: 17, name: "Cardio Dance" }, { d: 4, h: 18, name: "Spin" },
      { d: 4, h: 19, name: "Zumba" }, { d: 4, h: 20, name: "Jiu Jitsu" },
      { d: 5, h: 9, name: "Full Body Conditioning" }, { d: 5, h: 9, name: "Spin" },
      { d: 5, h: 10, name: "Zumba" }, { d: 5, h: 10, name: "Cardio Dance" },
      { d: 5, h: 11, name: "Body Fit" }, { d: 5, h: 11, name: "Jiu Jitsu" },
    ],
    insights: {
      peak: "Monday 7 PM · 17 check-ins on an average week",
      dead: "Sunday 3 PM is the quietest daytime hour",
      misplaced: "Body Fit sits at Saturday 11 AM, one of the quietest bands on the map",
    },
  },

  grow: {
    sample: true,
    members: 214, goal: 500, joins: 8, cancels: 3, net: 5, monthsToGoal: 57,
    funnel: [
      { stage: "New leads", n: 21, names: ["Dana V.", "Marco S.", "Emily R.", "Tyler B."] },
      { stage: "Tours booked", n: 14, names: ["Melissa R.", "Alex P.", "Nicole F.", "Brian C."] },
      { stage: "Joined", n: 6, names: ["Kevin D.", "Sofia L.", "Ashley M."] },
    ],
    tours: [
      { name: "Melissa R.", when: "Today 5 PM", confirmed: false },
      { name: "Diego J.", when: "Today 6 PM", confirmed: true },
      { name: "Monica F.", when: "Tomorrow 10 AM", confirmed: false },
      { name: "Sam K.", when: "Tomorrow 12 PM", confirmed: true },
      { name: "Nicole F.", when: "Tomorrow 6 PM", confirmed: true },
    ],
    trialConv: 43,
    milestones: [
      "8 new members joined this month: the count stands at 214",
      "Busiest day of the month: Saturday Aug 22 with 89 check-ins",
      "Zumba hit a 9-person waitlist this week: demand for another slot",
    ],
    moves: [
      { t: "Open a second Zumba slot", d: "The waitlist says the demand already exists: a Tuesday 6 PM slot adds capacity for 40 more visits a week without a single ad dollar." },
      { t: "Answer the 2 open Google reviews", d: "4.8 stars with 138 reviews is the best ad they own. An answered review converts the next reader; an ignored one costs tours." },
      { t: "Welcome-text every first visit", d: "5 members had their first check-in this week. A text within 24 hours is the cheapest retention move that exists." },
    ],
    /* Pulse Intelligence: recomendaciones generadas de los datos + el loop de
       aprendizaje. CONCEPT: el motor real entrena con sus numeros tras el go-live. */
    ai: {
      recs: [
        { t: "Open Tuesday 6 PM Zumba", conf: 84,
          d: "Waitlist pressure has held at 6+ for three straight weeks while the room sits empty at that hour.",
          ev: "3,766 bookings · waitlist history · room schedule" },
        { t: "Call the 30-day absentees before the 1st", conf: 88,
          d: "4 members cross 30 days of silence this week; billing on the 1st is when quiet members cancel.",
          ev: "11,128 check-ins · billing calendar · churn pattern" },
        { t: "Move Body Fit out of the noon slot", conf: 76,
          d: "Fill has averaged 51% for four weeks in a band where the gym itself runs at one third of peak.",
          ev: "class fills · hourly access curve" },
        { t: "Aim tour slots at 5-7 PM", conf: 81,
          d: "Tours booked inside the gym's busiest window convert 1.6x: the floor sells itself when it is full.",
          ev: "40 leads · tour outcomes · occupancy" },
      ],
      learn: {
        conf: [62, 68, 74, 79],
        signals: "11,128 check-ins · 3,766 bookings · 40 leads · 1,569 payments",
        retrain: "Sunday 2:00 AM",
      },
    },
  },

  keep: {
    sample: true,
    saveSum: 780, recoverySum: 1000,
    recovery: [
      { name: "Laura Q.", amount: 180, days: 1 },
      { name: "Oscar G.", amount: 130, days: 5 },
    ],
    saveList: [
      { name: "Brandon C.", plan: "Monthly Unlimited $129.99", days: 21 },
      { name: "Laura Q.", plan: "Monthly Premium $179.99", days: 16 },
      { name: "Raul S.", plan: "Monthly Unlimited $129.99", days: 15 },
      { name: "Natalia C.", plan: "All Access $199.99", days: 14 },
    ],
    firstVisits: [
      { name: "Kevin D.", when: "2026-08-26" },
      { name: "Ashley M.", when: "2026-08-27" },
    ],
  },

  exceptions: [
    {
      id: "EX-001",
      title: "Weekend closing hours disagree",
      severity: "red",
      status: "OPEN",
      valueA: { surface: "cityzero.com footer", value: "Sat - Sun | 8:00 am - 3:30 pm" },
      valueB: { surface: "Google Business Profile", value: "Saturday 8 AM to 6 PM · Sunday 8 AM to 6 PM" },
      firstEvidence: "2026-05-31",
      firstEvidenceNote: "One-star review by Matt O: \"Fix your Google hours. They are wrong.\" Detected age counts from that review; the mismatch may be older.",
      lastConfirmed: SWEEP_DATE,
      owner: null,
      rule: "hours.compare(site.footer, google.hours)",
      note: "Weekday hours agree on both surfaces (Mon-Thu 6-10, Fri 6-9). Only the weekend closing time differs: 3:30 pm against 6 PM, a 2.5 hour gap on both days.",
    },
    {
      id: "EX-002",
      title: "Class count disagrees across pages",
      severity: "amber",
      status: "OPEN",
      valueA: { surface: "cityzero.com homepage", value: "“Featuring a diverse array of 40+ classes”" },
      valueB: { surface: "cityzero.com/about-us/", value: "“Featuring a diverse array of 35 classes”" },
      firstEvidence: "2026-08-20",
      firstEvidenceNote: "Same marketing sentence, different number, both live.",
      lastConfirmed: SWEEP_DATE,
      owner: null,
      rule: "facts.compare(\"class count\", site.pages)",
      note: "Identical sentence published with two different numbers. Whichever is right, one page is wrong.",
    },
    {
      id: "EX-003",
      title: "Theme contact info published in footer",
      severity: "amber",
      status: "OPEN",
      valueA: { surface: "cityzero.com footer (every page)", value: "example@qodeinteractive.com · kropp@qodeinteractive.com · 718.407.6400" },
      valueB: { surface: "Approved contact list", value: "None of the three values belongs to City Zero" },
      firstEvidence: "2026-08-20",
      firstEvidenceNote: "Emails and phone belong to Kropp, the commercial WordPress theme the site was built from.",
      lastConfirmed: SWEEP_DATE,
      owner: null,
      rule: "contact.allowlist(site.footer)",
      note: "A member who emails or calls the footer contact reaches the theme vendor, not the gym.",
    },
    {
      id: "EX-004",
      title: "Event refund terms not visible before payment",
      severity: "amber",
      status: "OPEN",
      valueA: { surface: "Event checkout flow", value: "“The information leading up to paying stated I could cancel anytime”" },
      valueB: { surface: "Policy applied after purchase", value: "“Because these are special events they can't give me money back”" },
      firstEvidence: "2026-02-28",
      firstEvidenceNote: "One-star review by Jordana ZIN describing two Zumba event tickets. Policy-visibility finding, not a policy judgment.",
      lastConfirmed: "2026-08-20",
      owner: null,
      rule: "policy.presence(checkout.pages)",
      note: "The monitor watches whether refund terms are present on paying pages, not what the terms say.",
    },
    {
      id: "EX-005",
      title: "Facebook and Instagram disconnected in Meta Business Suite",
      severity: "red",
      status: "OPEN",
      valueA: { surface: "City Zero, in their own hiring post", value: "\u201cOur Facebook Page and Instagram used to be connected through Meta Business Suite, but at some point they disconnected.\u201d" },
      valueB: { surface: "Same post, on the fix attempt", value: "\u201cFacebook says that a request has been sent for approval and we can\u2019t find that request anywhere to approve it.\u201d" },
      firstEvidence: "2026-08-24",
      firstEvidenceNote: "City Zero published a job post looking for a Facebook/Meta specialist. Their own words are the evidence: the link is broken, the approval request is lost, and reconnecting from the Instagram side also failed.",
      lastConfirmed: "2026-08-24",
      detected: "2026-08-24",
      owner: null,
      rule: "meta.linkstate(facebook.page, instagram)",
      note: "The platform grading itself lost its own approval request. An independent layer watches the link state from outside, so a silent disconnect surfaces the same morning instead of when a campaign fails.",
    },
    {
      id: "EX-006",
      title: "Unknown duplicate Facebook Pages for City Zero",
      severity: "red",
      status: "OPEN",
      valueA: { surface: "City Zero, in their own hiring post", value: "\u201cThere are a few other Facebook Pages for City Zero that we don\u2019t know who created.\u201d" },
      valueB: { surface: "Official page inventory", value: "Expected: 1 official page with known admins. Reported: 1 official + \u201ca few\u201d of unknown origin." },
      firstEvidence: "2026-08-24",
      firstEvidenceNote: "Same hiring post. Pages of unknown origin carrying the brand can split reviews, confuse members, and interfere with the Business Suite connection they are trying to repair.",
      lastConfirmed: "2026-08-24",
      detected: "2026-08-24",
      owner: null,
      rule: "brand.pages.inventory(\"City Zero\")",
      note: "This is the owner question at platform scale: nobody knows who created or controls pages carrying the brand. The monitor keeps a page inventory and raises any page it has not seen before.",
    },
  ],

  /* ---------------- SURFACES ---------------- */
  surfaces: [
    {
      name: "cityzero.com",
      kind: "Website · WordPress on Apache/Ubuntu",
      lastRead: SWEEP_DATE + " 06:00",
      status: "read",
      pages: 50,
      watched: ["Footer hours block", "Contact block", "Class counts", "Plan prices", "All linked routes"],
      finding: "3 open exceptions touch this surface",
      sevCount: { red: 1, amber: 2 },
    },
    {
      name: "Google Business Profile",
      kind: "Listing · hours, reviews, attributes",
      lastRead: "2026-08-20 (Apify capture)",
      status: "read",
      pages: null,
      watched: ["Weekly hours", "New reviews", "Rating and count", "Owner replies"],
      finding: "4.8 across 138 reviews · weekend hours disagree with site",
      sevCount: { red: 1, amber: 0 },
    },
    {
      name: "Glofox portal",
      kind: "Booking · classes, capacity, waiting list",
      lastRead: SWEEP_DATE + " 06:00",
      status: "read",
      pages: null,
      watched: ["Public schedule", "Class inventory vs site claims", "Login/booking reachability"],
      finding: "No open exceptions",
      sevCount: { red: 0, amber: 0 },
    },
    {
      name: "ClassPass",
      kind: "Aggregator listing",
      lastRead: SWEEP_DATE + " 06:00",
      status: "read",
      pages: null,
      watched: ["Listing text", "Schedule presence"],
      finding: "No open exceptions",
      sevCount: { red: 0, amber: 0 },
    },
    {
      name: "Wellhub",
      kind: "Aggregator listing",
      lastRead: SWEEP_DATE + " 06:00",
      status: "read",
      pages: null,
      watched: ["Listing text", "Schedule presence"],
      finding: "No open exceptions",
      sevCount: { red: 0, amber: 0 },
    },
    {
      name: "Instagram @cityzeromiami",
      kind: "Social · 110,999 followers",
      lastRead: "2026-08-20 (Apify capture)",
      status: "read",
      pages: null,
      watched: ["Bio link targets", "Hours or pricing claims in bio"],
      finding: "No open exceptions",
      sevCount: { red: 0, amber: 0 },
    },
    {
      name: "Facebook Page + Business Suite",
      kind: "Social \u00b7 link to Instagram BROKEN (their words)",
      lastRead: "2026-08-24 (their hiring post)",
      status: "read",
      pages: null,
      watched: ["FB\u2194IG link state", "Page inventory vs unknown duplicates", "Pending Business Suite requests"],
      finding: "2 open exceptions \u00b7 reported by City Zero themselves",
      sevCount: { red: 2, amber: 0 },
    },
    {
      name: "Linktree",
      kind: "Link hub",
      lastRead: SWEEP_DATE + " 06:00",
      status: "read",
      pages: null,
      watched: ["Every outbound link resolves", "Targets stay on approved list"],
      finding: "No open exceptions",
      sevCount: { red: 0, amber: 0 },
    },
  ],

  /* ---------------- HOURS MATRIX (the signature comparison) ---------------- */
  hours: [
    { day: "Mon - Thu", site: "6:00 am - 10:00 pm", google: "6 AM to 10 PM", agree: true },
    { day: "Friday",    site: "6:00 am - 9:00 pm",  google: "6 AM to 9 PM",  agree: true },
    { day: "Sat - Sun", site: "8:00 am - 3:30 pm",  google: "8 AM to 6 PM",  agree: false },
  ],

  /* ---------------- ROUTES ---------------- */
  routes: [
    { path: "/classes-schedule/", code: 404, linkedFrom: "Homepage “View classes”", note: "The working page is /class-schedules/. Highest-intent visitor hits this.", checked: SWEEP_DATE },
    { path: "/class-schedules/", code: 200, linkedFrom: "Main nav “Classes”", note: "The page the broken link should point to.", checked: SWEEP_DATE },
    { path: "/", code: 200, linkedFrom: "Direct", note: "", checked: SWEEP_DATE },
    { path: "/about-us/", code: 200, linkedFrom: "Main nav “About”", note: "Publishes “35 classes” (EX-002).", checked: SWEEP_DATE },
    { path: "/membership-plans-of-city-zero/", code: 200, linkedFrom: "Main nav “Memberships”", note: "Plans $129.99 to $199.99 / month.", checked: SWEEP_DATE },
    { path: "/personal-training/", code: 200, linkedFrom: "Main nav “Training”", note: "", checked: "2026-08-20" },
    { path: "/guided-tour/", code: 200, linkedFrom: "Main nav “Guided Tour”", note: "Lead intake form with reCAPTCHA.", checked: "2026-08-20" },
    { path: "/careers/", code: 200, linkedFrom: "Footer", note: "", checked: "2026-08-20" },
    { path: "/community/", code: 200, linkedFrom: "Main nav", note: "", checked: "2026-08-20" },
    { path: "/contact-us/", code: 200, linkedFrom: "Footer", note: "Form works; footer block beside it shows theme contacts (EX-003).", checked: "2026-08-20" },
  ],
  routesSummary: { checked: 50, failing: 1, note: "50 linked routes discovered in the 2026-08-20 crawl; 10 shown. Full list re-checked daily." },

  /* ---------------- REVIEWS ---------------- */
  reviewsSummary: {
    rating: 4.8, count: 138,
    sample: "20 most recent captured 2026-08-20",
    sampleBreakdown: "18 five-star · 2 one-star",
    ownerReplies: "0 of 20 have an owner reply",
    distribution: { 5: 130, 4: 2, 3: 0, 2: 0, 1: 6 },
  },
  reviews: [
    { stars: 1, date: "2026-05-31", author: "Matt O", text: "Fix your Google hours. They are wrong.", classification: "OPERATIONAL", linked: "EX-001", reply: null,
      draft: "Hi Matt, you were right, and thank you for flagging it. Our Google weekend hours did not match the site. We have corrected the listing to our real closing time and added a daily check so the two can no longer drift apart. We would love to have you back." },
    { stars: 1, date: "2026-02-28", author: "Jordana ZIN", text: "When I booked 2 tickets for two upcoming zumba events, the information leading up to paying stated I could cancel anytime. NO mention that I wouldn't get my money back! […] This gym needs to provide better information as to the rules of purchasing tickets for special events.", classification: "OPERATIONAL", linked: "EX-004", reply: null,
      draft: "Hi Jordana, thank you for laying out exactly where the confusion happened. You should have seen the event refund terms before paying, not after. We are placing the policy on the checkout page itself and reviewing your case with the events manager. Please reach us at the front desk so we can make it right." },
    { stars: 5, date: "2026-07-05", author: "Miss Nicole", text: "The best Cardio classes in Miami, everyone is so friendly and happy, full of positive vibes here, highly recommend.", classification: "PRAISE", linked: null, reply: null, draft: null },
    { stars: 5, date: "2026-06-21", author: "Betsis Bellorin", text: "Excelente gimnasio. Lo tiene todo.", classification: "PRAISE", linked: null, reply: null, draft: null },
    { stars: 5, date: "2026-06-09", author: "Zin Diana Estrella", text: "Excelentes instalaciones. Personal muy amable y entrenado para el servicio al cliente. Las clases son de otro nivel.", classification: "PRAISE", linked: null, reply: null, draft: null },
    { stars: 5, date: "2026-04-04", author: "Yussara Cunha", text: "I had an amazing experience at City Zero in Miami! The atmosphere was vibrant and welcoming, and the attention to detail really stood out.", classification: "PRAISE", linked: null, reply: null, draft: null },
    { stars: 5, date: "2026-04-03", author: "Veruska Boll", text: "El gimnasio más bello del mundo! Y la energía inexplicable. 100% recomendado.", classification: "PRAISE", linked: null, reply: null, draft: null },
    { stars: 5, date: "2026-02-24", author: "305gym Explorer", text: "I try the Jiu jitsu class, was awesome. The gym is big, 4 floors to go wild working out.", classification: "PRAISE", linked: null, reply: null, draft: null },
    { stars: 5, date: "2026-01-24", author: "Carla Guerrero Ruiz", text: "Hands up Best Gym in Miami. Home of the Zumba Family.", classification: "PRAISE", linked: null, reply: null, draft: null },
    { stars: 5, date: "2025-09-28", author: "Kathy Garcia", text: "Patrizia is the definition of an outstanding coach! Her classes are amazing.", classification: "PRAISE", linked: null, reply: null, draft: null },
    { stars: 5, date: "2025-09-24", author: "Yilian Turcios", text: "I absolutely love this gym! I originally found it through ClassPass.", classification: "PRAISE", linked: null, reply: null, draft: null },
  ],

  /* ---------------- OWNERS & THRESHOLDS ---------------- */
  owners: [
    { surface: "cityzero.com content", owner: null, hint: "Whoever edits WordPress today" },
    { surface: "Google Business Profile", owner: null, hint: "Whoever answered reviews historically: nobody in the last 20" },
    { surface: "Glofox schedule", owner: null, hint: "Front desk or ops manager" },
    { surface: "Event policies", owner: null, hint: "Events manager" },
    { surface: "Aggregators (ClassPass, Wellhub)", owner: null, hint: "Partnerships owner" },
    { surface: "Instagram + Linktree", owner: null, hint: "Social owner" },
  ],
  thresholds: [
    { name: "Exception overdue", value: "7 days", detail: "Open exceptions older than this appear in the morning report until closed" },
    { name: "Route failure", value: "immediate", detail: "Any non-200 on a linked route lands in the next report" },
    { name: "Review needing reply", value: "48 hours", detail: "Operational reviews unanswered past this are re-raised" },
    { name: "Sweep cadence", value: "daily 06:00 ET", detail: "Every public surface, every morning" },
  ],

  /* ================= PHASE 2 CONCEPT SECTIONS =================
     Everything below is the full-platform vision. Lead names and volume
     numbers are SAMPLE (invented for the demo). Channels, roles, plans,
     prices and monitor-side triggers are real case evidence. */

  /* ---------------- CRM ---------------- */
  pipeline: {
    sample: true,
    stages: [
      { key: "new", label: "New", sla: "48h to first touch" },
      { key: "contacted", label: "Contacted", sla: "5 touches / 14 days" },
      { key: "tour", label: "Tour booked", sla: "reminder T-24h" },
      { key: "trial", label: "Trial", sla: "convert push T-3d" },
      { key: "member", label: "Member", sla: "day-30 check-in" },
    ],
    cards: [
      { name: "Camila R.", source: "Guided tour form", stage: "new", days: 0, owner: "Front desk", next: "First call due today 2 PM" },
      { name: "Daniela V.", source: "Meta ad \u00b7 Guided Tour campaign", paid: true, stage: "new", days: 0, owner: "Sales associate", next: "Pulse-attributed lead: call inside SLA" },
      { name: "Marco A.", source: "Google ad \u00b7 Trial offer", paid: true, stage: "contacted", days: 2, owner: "Sales associate", next: "Touch 2 of 5: tour invite" },
      { name: "Andres M.", source: "Website form", stage: "new", days: 2, owner: "Sales associate", next: "SLA BREACH: no touch in 48h", breach: true },
      { name: "Dayana P.", source: "Instagram DM", stage: "new", days: 1, owner: "Social owner", next: "Reply + tour offer" },
      { name: "Luis F.", source: "ClassPass", stage: "contacted", days: 4, owner: "Sales associate", next: "Touch 3 of 5: text Thursday" },
      { name: "Mariana S.", source: "Walk-in", stage: "contacted", days: 6, owner: "Front desk", next: "Send family plan pricing" },
      { name: "Jorge T.", source: "Phone call", stage: "tour", days: 1, owner: "Sales associate", next: "Tour Tue 6 PM, reminder armed" },
      { name: "Nicole V.", source: "Guided tour form", stage: "tour", days: 3, owner: "Sales associate", next: "No-show recovery: reschedule" },
      { name: "Pedro A.", source: "ClassPass", stage: "trial", days: 5, owner: "Ops manager", next: "Trial ends in 3 days: push armed" },
      { name: "Valentina G.", source: "Website form", stage: "trial", days: 9, owner: "Sales associate", next: "Offer annual at $1,900" },
      { name: "Kevin D.", source: "Instagram DM", stage: "member", days: 12, owner: "Front desk", next: "Day-30 check-in scheduled" },
      { name: "Sofia L.", source: "Wellhub", stage: "member", days: 25, owner: "Front desk", next: "Ask for a Google review" },
    ],
  },
  leadChannels: [
    { channel: "Website form (contact)", real: true, evidence: "Live on cityzero.com with reCAPTCHA" },
    { channel: "Guided tour form", real: true, evidence: "Dedicated intake page, live" },
    { channel: "Careers form", real: true, evidence: "Live; separate queue, not sales" },
    { channel: "ClassPass", real: true, evidence: "Active listing" },
    { channel: "Wellhub", real: true, evidence: "Active listing" },
    { channel: "Instagram DM", real: true, evidence: "110,999 followers, active account" },
    { channel: "Phone + walk-in", real: true, evidence: "Sales associate job post requires calls, texts, emails, meetings" },
    { channel: "Meta + Google ads (paid)", real: false, evidence: "Phase 2: run by Arqentia as media buyer, instrumented by Pulse Metrics" },
  ],
  members: {
    sample: true,
    planMix: [
      { plan: "Monthly $129.99", pct: 34 },
      { plan: "Monthly $179.99", pct: 27 },
      { plan: "Monthly $199.99", pct: 17 },
      { plan: "Annual $1,900", pct: 14 },
      { plan: "Family $279", pct: 8 },
    ],
    rows: [
      { name: "Kevin D.", plan: "Monthly $179.99", since: "2026-08-12", status: "active", risk: null },
      { name: "Sofia L.", plan: "Annual $1,900", since: "2026-07-30", status: "active", risk: null },
      { name: "Brandon C.", plan: "Monthly $129.99", since: "2026-03-02", status: "active", risk: "No visit in 21 days" },
      { name: "Isabella M.", plan: "Family $279", since: "2025-11-15", status: "active", risk: null },
      { name: "Diego R.", plan: "Monthly $199.99", since: "2026-01-08", status: "frozen", risk: "Freeze ends Sep 1" },
      { name: "Laura Q.", plan: "Monthly $179.99", since: "2025-09-20", status: "active", risk: "2 failed charges retried" },
    ],
    note: "Real member data needs Glofox export access: Discovery blocker 4. Plans and prices are the real public ones; the mix and every row here are sample.",
  },

  /* ---------------- AUTOMATION ---------------- */
  workflows: [
    { name: "Review reply approval loop", phase: 1, status: "ACTIVE", trigger: "Operational review classified", steps: ["Classify review", "Draft reply", "Notify surface owner", "Human approves", "Owner publishes from Google account"], lastRun: "2026-08-20", runs30: 2, owner: "GBP owner" },
    { name: "Hours change propagation", phase: 1, status: "ACTIVE", trigger: "Hours edited on any surface", steps: ["Detect changed value", "Diff against other surfaces", "Open exception if they disagree", "Checklist: site, Google, Glofox, aggregators", "Close when all agree"], lastRun: "2026-08-24", runs30: 2, owner: "Site content owner" },
    { name: "Broken route repair loop", phase: 1, status: "ACTIVE", trigger: "Linked route returns non-200", steps: ["Capture status + linking page", "Raise in morning report", "Task to site admin", "Re-check next sweep", "Auto-close on 200"], lastRun: "2026-08-24", runs30: 2, owner: "Site admin" },
    { name: "Lead follow-up cadence", phase: 2, status: "DRAFT", trigger: "New lead from any channel", steps: ["Create CRM lead", "Assign by channel", "5 touches over 14 days", "Escalate if idle 48h", "Close won/lost with reason"], lastRun: null, runs30: null, owner: "Sales associate" },
    { name: "Tour no-show recovery", phase: 2, status: "DRAFT", trigger: "Tour missed", steps: ["Wait 2h", "Text reschedule link", "Call next morning", "Mark cold after 2 attempts"], lastRun: null, runs30: null, owner: "Front desk" },
    { name: "Trial conversion push", phase: 2, status: "DRAFT", trigger: "Trial ends in 3 days", steps: ["Usage summary to lead", "Offer matched to visits", "Front desk flag on next visit", "Day-after call if unconverted"], lastRun: null, runs30: null, owner: "Sales associate" },
    { name: "Event refund case handling", phase: 2, status: "DRAFT", trigger: "Refund request on event ticket", steps: ["Open case with policy snapshot", "Route to events manager", "Decision logged with reason", "Reply drafted for approval"], lastRun: null, runs30: null, owner: "Events manager" },
  ],
  triggers: [
    { when: "New Google review at 2 stars or less", cond: "Names an operational cause", then: "Classify, draft reply, notify owner, open task", phase: 1, armed: true, lastFired: "2026-08-20", fires30: 2 },
    { when: "Linked route returns non-200", cond: "Any of the 50 watched routes", then: "Open exception, morning report, task to site admin", phase: 1, armed: true, lastFired: "2026-08-24", fires30: 2 },
    { when: "Two surfaces publish different values", cond: "Hours, counts, prices, policy text", then: "Open exception with both values and evidence", phase: 1, armed: true, lastFired: "2026-08-20", fires30: 2 },
    { when: "Footer contact differs from allowlist", cond: "Email or phone not on approved list", then: "Open exception with the foreign values", phase: 1, armed: true, lastFired: "2026-08-20", fires30: 1 },
    { when: "Exception open past threshold", cond: "Age exceeds 7 days", then: "Re-raise in every morning report until closed", phase: 1, armed: true, lastFired: "2026-08-24", fires30: 2 },
    { when: "New lead from any channel", cond: "Form, DM, call log or walk-in entry", then: "Create lead, assign owner, start 48h SLA timer", phase: 2, armed: false, lastFired: null, fires30: null },
    { when: "Lead idle in New past SLA", cond: "No touch logged in 48h", then: "Escalate to ops manager, flag in pipeline", phase: 2, armed: false, lastFired: null, fires30: null },
    { when: "Trial ends in 3 days", cond: "Trial member, no conversion yet", then: "Start trial conversion push workflow", phase: 2, armed: false, lastFired: null, fires30: null },
    { when: "FB\u2194IG link state changes", cond: "Business Suite connection breaks or a request goes pending", then: "Open exception same morning, notify social owner", phase: 2, armed: false, lastFired: null, fires30: null, pulse: true },
    { when: "New page matching the brand appears", cond: "Facebook page named like City Zero not in the inventory", then: "Open exception with the page link and creation evidence", phase: 2, armed: false, lastFired: null, fires30: null, pulse: true },
    { when: "Event ticket refund requested", cond: "Purchase inside refund window or disputed", then: "Open case with policy snapshot at time of purchase", phase: 2, armed: false, lastFired: null, fires30: null },
  ],
  tasks: [
    { title: "Assign owner to EX-001 weekend hours", due: "Kickoff", assignee: "Unassigned", src: "EX-001", real: true, kind: "monitor" },
    { title: "Approve draft reply to Matt O review", due: "48h SLA", assignee: "GBP owner", src: "Review 2026-05-31", real: true, kind: "review" },
    { title: "Approve draft reply to Jordana ZIN review", due: "48h SLA", assignee: "Events manager", src: "Review 2026-02-28", real: true, kind: "review" },
    { title: "Point homepage class link to /class-schedules/", due: "One-line fix", assignee: "Site admin", src: "EX route 404", real: true, kind: "fix" },
    { title: "Replace theme contact block in footer", due: "Minutes of work", assignee: "Site admin", src: "EX-003", real: true, kind: "fix" },
    { title: "Pick one class count: 40+ or 35", due: "Content decision", assignee: "Site content owner", src: "EX-002", real: true, kind: "fix" },
    { title: "Inventory every Facebook page matching \u201cCity Zero\u201d", due: "Before reconnecting", assignee: "Social owner", src: "EX-006", real: true, kind: "meta" },
    { title: "Locate or expire the pending Business Suite request", due: "Blocks reconnection", assignee: "Meta specialist", src: "EX-005", real: true, kind: "meta" },
    { title: "Document who admins each Meta asset", due: "Kickoff", assignee: "Unassigned", src: "Hiring post", real: true, kind: "meta" },
    { title: "Call Andres M. (SLA breach, 2 days idle)", due: "Today", assignee: "Sales associate", src: "Pipeline", real: false, kind: "crm" },
    { title: "Reschedule Nicole V. missed tour", due: "Today", assignee: "Front desk", src: "Pipeline", real: false, kind: "crm" },
    { title: "Trial push for Pedro A. (ends in 3 days)", due: "Aug 27", assignee: "Sales associate", src: "Pipeline", real: false, kind: "crm" },
  ],

  /* ---------------- GYM OS: GLOFOX API + BIOSTAR (concept, grounded) ----
     Glofox API (apidocs-plat.aws.glofox.com): REST/JSON, read+write on
     users, memberships, credits, classes, bookings, payments; webhooks by
     event domain (BOOKINGS, MEMBERSHIPS, ACCESS). Access is requested from
     ABC (apiactivation@abcfitness.com) with sandbox envs: a Discovery item.
     BioStar 2 (bs2api.biostar2.com): local REST API on their own server,
     default since v2.7.10: users, doors, access groups, event logs.
     Class names below come from their public surfaces; grids and volumes
     are SAMPLE until API access exists. */
  feasibility: [
    { need: "Live class schedule + capacity + waitlist", how: "Glofox GET /classes, /bookings + BOOKINGS webhooks", status: "READ", note: "Their public portal already shows capacity and waitlists: the API makes it live per class." },
    { need: "Member directory, plans, status", how: "Glofox GET /members, /memberships", status: "READ", note: "The base for CRM, risk flags and revenue views." },
    { need: "Payments and revenue", how: "Glofox payments endpoints", status: "READ", note: "Plan mix and MRR views without touching Stripe." },
    { need: "Real-time events into the dashboard", how: "Glofox webhooks: BOOKINGS, MEMBERSHIPS, ACCESS", status: "PUSH", note: "No polling: bookings and joins land in seconds." },
    { need: "Leads into Glofox from the landing", how: "Glofox create user/lead endpoints", status: "WRITE·OPT", note: "The API allows create/edit. Whether we write or keep Glofox manual is a kickoff decision." },
    { need: "Check-ins, occupancy, who is in now", how: "BioStar 2 local API: GET /api/events, /api/users, /api/doors", status: "READ", note: "Their own server, their own data. An operator account is all it takes." },
    { need: "Access control from the dashboard", how: "BioStar 2 API: doors + access groups", status: "WRITE·OPT", note: "Unlock schedules, access levels per membership. Optional: read-only occupancy already pays." },
    { need: "API credentials", how: "ABC activation request + BioStar admin", status: "GATE", note: "Glofox access is granted by ABC per studio (sandbox included). BioStar is local: City Zero grants it directly. Both are Discovery items." },
  ],

  classes: {
    sample: true,
    note: "Class names captured from their public surfaces; timetable and volumes are SAMPLE until Glofox API access. Their portal already proves capacity + waitlist exist.",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    list: [
      { name: "Zumba", coach: "Beto + team", cap: 40 },
      { name: "Full Body Conditioning", coach: "Team", cap: 25 },
      { name: "Body Fit", coach: "Team", cap: 25 },
      { name: "Spin", coach: "Team", cap: 20 },
      { name: "Jiu Jitsu", coach: "Team", cap: 18 },
      { name: "Cardio Dance", coach: "Team", cap: 30 },
    ],
    grid: [
      { cls: "Zumba", slots: [38, 40, 36, 40, 33, 40], wait: [0, 6, 0, 4, 0, 9] },
      { cls: "Full Body Conditioning", slots: [21, 18, 24, 19, 22, 12] },
      { cls: "Body Fit", slots: [14, 17, 12, 16, 11, 8] },
      { cls: "Spin", slots: [19, 20, 17, 20, 14, 10], wait: [0, 3, 0, 2, 0, 0] },
      { cls: "Jiu Jitsu", slots: [16, 12, 17, 13, 15, 6] },
      { cls: "Cardio Dance", slots: [24, 21, 26, 22, 28, 30], wait: [0, 0, 0, 0, 2, 5] },
    ],
    insights: [
      "Zumba and Cardio Dance run waitlists while Body Fit averages 55% fill: the schedule has room to rebalance before adding classes.",
      "Saturday mornings underfill across strength classes and overfill in dance: exactly what the ads delivery window should reflect.",
      "Every number here becomes live the day Glofox API credentials exist: same screen, real data.",
    ],
  },

  access: {
    sample: true,
    note: "BioStar 2 exposes a local REST API (default since v2.7.10) with users, doors and event logs. Volumes below are SAMPLE; the screen is what their own server would feed.",
    inNow: 47,
    todayTotal: 312,
    peak: { hour: "6 PM", value: 68 },
    hourly: [4, 2, 3, 9, 22, 31, 26, 18, 14, 17, 21, 26, 24, 19, 16, 21, 34, 52, 68, 61, 44, 27, 12, 5],
    cohorts: [
      { label: "3+ visits / week", pct: 34, note: "the core, protect them" },
      { label: "1-2 visits / week", pct: 41, note: "the habit builders" },
      { label: "< 1 visit / week", pct: 17, note: "at drift" },
      { label: "No visit in 14+ days", pct: 8, note: "win-back campaign fires here" },
    ],
    atRisk: [
      { name: "Brandon C.", plan: "Monthly $129.99", last: "21 days ago", action: "Win-back day-14 fired, day-21 SMS today" },
      { name: "Laura Q.", plan: "Monthly $179.99", last: "16 days ago", action: "Win-back day-14 fired" },
      { name: "Diego R.", plan: "Monthly $199.99 (frozen)", last: "34 days ago", action: "Excluded: freeze ends Sep 1" },
    ],
    doorEvents: [
      { at: "18:42", who: "S. L.", door: "Main entrance", ev: "Granted" },
      { at: "18:41", who: "K. D.", door: "Main entrance", ev: "Granted" },
      { at: "18:37", who: "Unknown card", door: "Staff door", ev: "Denied" },
      { at: "18:31", who: "M. A.", door: "Main entrance", ev: "Granted" },
    ],
    value: [
      { t: "Staff to the real peaks", d: "Hourly occupancy says 6-8 PM carries the gym. Front-desk and coach coverage follows the curve instead of a guess." },
      { t: "Retention before churn", d: "A member who stops badging in is churn in slow motion. The 14-day absence trigger starts the win-back before the cancellation call." },
      { t: "Ads that match reality", d: "Delivery windows and tour slots inherit real occupancy: no tour invites at hours when nobody can give one." },
      { t: "One member timeline", d: "Glofox says who they are and what they pay; BioStar says when they actually come. Together: the truth about every membership." },
    ],
  },

  campaigns: [
    { id: "c1", name: "New lead follow-up", trigger: "Lead created (landing, form, DM, walk-in)", status: "CONCEPT",
      steps: [
        { k: "trigger", t: "Lead created" }, { k: "email", t: "Welcome + tour link (min 5)" },
        { k: "wait", t: "Wait 1 day" }, { k: "sms", t: "SMS: pick a tour slot" },
        { k: "wait", t: "Wait 2 days" }, { k: "task", t: "Call task to sales" },
        { k: "branch", t: "Booked? -> stop" }, { k: "email", t: "Day 7: class pass offer" },
        { k: "goal", t: "Tour booked" },
      ],
      stats: { entered: 120, active: 38, converted: 54, rate: "45%" } },
    { id: "c2", name: "Tour no-show recovery", trigger: "Tour missed (Glofox booking status)", status: "CONCEPT",
      steps: [
        { k: "trigger", t: "Tour missed" }, { k: "wait", t: "Wait 2 h" },
        { k: "sms", t: "Reschedule link" }, { k: "wait", t: "Next morning" },
        { k: "task", t: "Personal call" }, { k: "goal", t: "Rebooked" },
      ],
      stats: { entered: 16, active: 5, converted: 7, rate: "44%" } },
    { id: "c3", name: "Trial to member push", trigger: "Trial ends in 3 days (Glofox membership)", status: "CONCEPT",
      steps: [
        { k: "trigger", t: "Trial T-3" }, { k: "email", t: "Usage recap + offer" },
        { k: "task", t: "Front-desk flag on next visit" }, { k: "wait", t: "T-0" },
        { k: "sms", t: "Last-day nudge" }, { k: "goal", t: "Converted to plan" },
      ],
      stats: { entered: 31, active: 9, converted: 19, rate: "61%" } },
    { id: "c4", name: "Win-back absent members", trigger: "No BioStar check-in for 14 days", status: "CONCEPT",
      steps: [
        { k: "trigger", t: "14 days no visit" }, { k: "email", t: "We miss you + favorite class time" },
        { k: "wait", t: "Wait 7 days" }, { k: "sms", t: "Day 21: bring-a-friend pass" },
        { k: "branch", t: "Visited? -> stop" }, { k: "task", t: "Day 30: retention call" },
        { k: "goal", t: "Back in the gym" },
      ],
      stats: { entered: 24, active: 11, converted: 9, rate: "38%" } },
    { id: "c5", name: "Review ask at milestone", trigger: "10th check-in (BioStar) + active member", status: "CONCEPT",
      steps: [
        { k: "trigger", t: "10th visit" }, { k: "sms", t: "One-tap Google review link" },
        { k: "branch", t: "Reviewed? -> thank" }, { k: "goal", t: "New 5-star review" },
      ],
      stats: { entered: 42, active: 6, converted: 17, rate: "40%" } },
  ],
  campaignsNote: "Sends go out from City Zero's own email/SMS accounts; every message list and cadence is approved at kickoff. Volumes are SAMPLE. Triggers marked Glofox/BioStar activate when API access exists.",

  landing: {
    url: "landing.html",
    why: [
      { t: "One goal, one action", d: "The only conversion on the page is the free guided tour. No menu maze, no competing CTAs: the form is 2 fields." },
      { t: "Proof over claims", d: "4.8 across 138 Google reviews and 110,999 followers are real and verifiable: they carry the page instead of adjectives." },
      { t: "Real prices, no bait", d: "The public plans ($129.99-$199.99, annual, family) are shown as-is. Qualified leads arrive knowing the price." },
      { t: "Zero friction", d: "Name + phone. Submits in one tap, confirms inline, and the lead lands in this dashboard's Pipeline instantly." },
    ],
  },

  /* ---------------- PULSE METRICS (Meta Health) ----------------
     Pulse Metrics by Arqentia: independent marketing analytics, cross-platform
     truth on the merchant's side. Today it integrates Shopify, Klaviyo, GSC,
     Bing WT, Google Ads, Microsoft Ads (ecommerce). A Meta analyzer for City
     Zero is NEW Phase 2 scope, quoted after Discovery. No pricing, no
     unverified claims (repo BRANDBOOK rules). */
  pulse: {
    engine: "Pulse Metrics \u00b7 by Arqentia",
    todayIntegrations: ["Shopify", "Klaviyo", "Google Search Console", "Bing WT", "Google Ads", "Microsoft Ads"],
    scope: "The Meta analyzer is a new integration: Phase 2 scope, quoted after Discovery. What ships today in this dashboard is the evidence and the watch design.",
    moat: "Platforms grade themselves. Meta's own Business Suite lost City Zero's reconnection request. An independent layer, on City Zero's side, watches the link state and the page inventory from outside.",
    igReal: { followers: 110999, medianLikes: 73, medianComments: 9, medianVideoViews: 3484, sample: "50 posts, Jan 2025 - Aug 2026, Apify capture 2026-08-20" },
    linkState: { state: "BROKEN", since: "unknown \u00b7 \u201cat some point they disconnected\u201d", evidence: "Their hiring post, captured 2026-08-24" },
    pageInventory: { official: 1, unknown: "\u201ca few\u201d", evidence: "\u201cwe don\u2019t know who created\u201d them \u2014 their words" },
    jobPost: "We\u2019re looking for a Facebook/Meta specialist to help us resolve an issue with our accounts. Our Facebook Page and Instagram used to be connected through Meta Business Suite, but at some point they disconnected. We currently have full access to both accounts, but when we try to reconnect them, Facebook says that a request has been sent for approval and we can\u2019t find that request anywhere to approve it. We\u2019ve also tried connecting from the Instagram side with no success. We recently discovered that there are a few other Facebook Pages for City Zero that we don\u2019t know who created, so we\u2019re not sure if that could be interfering with the connection. Basically, we need someone experienced with Meta to go into the accounts, figure out what\u2019s causing the issue, clean up the setup if necessary, and reconnect Facebook and Instagram properly.",
  },

  /* ---------------- PAID MEDIA (Pulse Metrics as the engine) ----------------
     The service: Arqentia runs the media buying; Pulse instruments every
     dollar. All spend numbers are SAMPLE scenario narrative (BRANDBOOK
     allows illustrative story numbers, never claims). Real numbers need ad
     account + Glofox access: Discovery. */
  paidmedia: {
    sample: true,
    moat: "Real cost per member = total ad spend \u00f7 new members in Glofox. Meta will not give you that number, Google will not either, and both together will claim more members than actually joined. Pulse exists to compute the real one, on City Zero's side.",
    service: [
      { step: "Plan", what: "Campaign map per goal: guided tours, trials, event tickets. Budget split across Meta and Google with one owner: Arqentia as media buyer." },
      { step: "Launch", what: "Campaigns live on clean plumbing: reconnected Business Suite, one official page, pixel + conversions wired to real bookings." },
      { step: "Optimize weekly", what: "Pulse crosses spend against Glofox outcomes. Junk clicks cut, budgets moved to what produces members, not what platforms score well." },
      { step: "Report monthly", what: "One Pulse report: spend, real cost per member, platform claims vs real joins, waste found, next month's plan. Numbers, not reels." },
    ],
    funnel: [
      { stage: "Ad spend", v: "$3,000", note: "sample monthly budget" },
      { stage: "Clicks", v: "1,800", note: "sample" },
      { stage: "Leads into Pipeline", v: "120", note: "forms, DMs, tour requests" },
      { stage: "Tours + trials", v: "54", note: "booked in Glofox" },
      { stage: "New members", v: "19", note: "the only number that matters" },
    ],
    unitMath: { cpl: "$25", costPerMember: "$158", anchor: "A $179.99 plan nearly pays back acquisition in month one. Annual at $1,900 pays it back 12x. Illustrative math on sample volumes; plans and prices are the real public ones." },
    attribution: {
      rows: [
        { src: "Meta Ads claims", members: 14 },
        { src: "Google Ads claims", members: 11 },
        { src: "Platforms combined", members: 25 },
        { src: "Real new members (Glofox)", members: 19 },
      ],
      note: "Both platforms claim credit for the same person. Combined they over-report by +32% in this sample scenario. The deterministic cross against Glofox joins is the Pulse moat: attribution decided by the merchant's data, not the platforms'.",
    },
    waste: [
      { what: "Junk and accidental clicks", how: "Click-quality anomalies: bounce-in-seconds traffic that still bills. Cut at the placement level.", tie: "The founder's original pain: years of spend with junk clicks nobody caught." },
      { what: "Ads delivering while the gym is closed", how: "Delivery schedule crossed against real staffed hours, so tour requests land when someone can answer.", tie: "Ties to EX-001: the monitor knows the real hours; the ads inherit them." },
      { what: "Event promos without visible terms", how: "Every boosted event links a page where refund terms are visible before payment.", tie: "Ties to EX-004: the Jordana ZIN one-star was an ads-to-policy handoff failure." },
    ],
    prereqs: [
      { what: "Reconnect FB and Instagram, one official page", state: "EX-005 and EX-006, the cleanup in Meta Health. You cannot buy media on broken plumbing.", real: true },
      { what: "Pixel + conversion events wired to real bookings", state: "Needs Glofox edition and site access: Discovery.", real: true },
      { what: "Ad account access and history", state: "Discovery. Past spend, if any, becomes the baseline Pulse audits first.", real: true },
    ],
  },

  /* ---------------- PULSE MONTHLY REPORT (client mockup) ----------------
     Mirrors the REAL MonthlyReportSchema from the Pulse repo
     (src/lib/reports/schema.ts): executive_summary, kpis, sections,
     kanban, diagnosis. Ecommerce slots adapted to the gym: Shopify->Glofox,
     orders->member joins. SAMPLE scenario: first month after the Meta
     cleanup. Real report needs ad accounts + Glofox export (Discovery). */
  pulseReport: {
    client_name: "City Zero Miami",
    period: "2026-09",
    periodLabel: "September 2026 \u00b7 first month, sample scenario",
    executive_summary: {
      headline: "Paid restarted on clean plumbing: $3,000 produced 19 members, and the platforms claimed 25.",
      alert_level: "yellow",
      health_score: 71,
      summary_bullets: [
        "Meta reconnected and one official page live (the step-0 cleanup from their own hiring post). Campaigns launched week 2.",
        "19 real new members in Glofox against 25 claimed by the platforms combined: +32% over-report caught by the attribution cross.",
        "$312 of junk and off-hours clicks cut in week 3, reallocated to the two campaigns that produce tours.",
        "Weekend hours mismatch still live on the site (EX-001, 85+ days): ads now inherit the monitor's real hours so promos never point at a closed door.",
        "Baseline month: every number below becomes a delta next month.",
      ],
    },
    sources: {
      cross: { name: "Cross-platform", color: "#23E3A4" },
      meta_ads: { name: "Meta Ads", color: "#1877F2" },
      google_ads: { name: "Google Ads", color: "#4285F4" },
      gsc: { name: "Search Console", color: "#F9AB00" },
      glofox: { name: "Glofox", color: "#95BF47" },
      instagram: { name: "Instagram organic", color: "#E4405F" },
    },
    kpis: [
      { label: "Ad spend", value: "$3,000", source: "cross", sample: true, benchmark: "budget scenario, not a quote" },
      { label: "New members", value: 19, source: "glofox", sample: true, benchmark: "the only number that matters" },
      { label: "Real cost / member", value: "$158", source: "cross", sample: true, hero: true, benchmark: "spend \u00f7 Glofox joins" },
      { label: "Month-one return", value: "1.14x", source: "cross", sample: true, benchmark: "19 \u00d7 $180 \u00f7 $3,000 \u00b7 annual value 12x+" },
      { label: "Cost / lead", value: "$25", source: "cross", sample: true, benchmark: "120 leads into the CRM" },
      { label: "Tour show rate", value: "70%", source: "glofox", sample: true, benchmark: "38 showed of 54 booked" },
      { label: "Platform over-claim", value: "+32%", source: "cross", sample: true, bad: true, benchmark: "25 claimed vs 19 real" },
      { label: "IG followers", value: "110,999", source: "instagram", sample: false, benchmark: "REAL \u00b7 Apify baseline Aug 2026" },
    ],
    sections: [
      {
        id: "cross", name: "Cross-platform \u00b7 the Pulse moat",
        insights: [
          "Attribution decided by Glofox joins, not platform pixels. Meta and Google both claimed the same 6 people.",
          "True cost per member per channel is the budget rule: money moves to Meta tour campaigns and Google brand, away from generic prospecting.",
        ],
        table: {
          title: "True attribution by channel",
          headers: ["Channel", "Leads", "Joins (Glofox)", "Spend", "Cost / member", "Claimed"],
          highlight: 4,
          rows: [
            ["Meta \u00b7 Guided Tour campaign", 52, 9, "$1,190", "$132", "claims 14"],
            ["Google \u00b7 brand + gym near me", 34, 6, "$980", "$163", "claims 11"],
            ["Meta \u00b7 Trial offer", 22, 3, "$610", "$203", "\u2014"],
            ["Google \u00b7 generic fitness", 12, 1, "$220", "$220", "\u2014"],
          ],
        },
        anomalies: {
          title: "Anomalies \u00b7 platforms vs reality",
          headers: ["Metric", "Platform says", "Reality (Glofox / monitor)", "\u00d7", "Severity"],
          rows: [
            ["Members attributed", "25 (Meta 14 + Google 11)", "19 joins in Glofox", "1.32x", "warning"],
            ["Tour requests", "68 conversions fired", "54 tours booked", "1.26x", "warning"],
            ["Clicks billed off-hours", "\u2014 not reported", "$118 while gym closed", "\u2014", "critical"],
          ],
        },
      },
      {
        id: "meta_ads", name: "Meta Ads",
        metrics: [
          { label: "Spend", value: "$1,800" }, { label: "Leads", value: 74 },
          { label: "Cost / lead", value: "$24" }, { label: "Joins", value: 12 },
        ],
        insights: [
          "Delivery clipped to staffed hours from the monitor (EX-001): tour requests now land when the front desk can answer.",
          "Guided Tour creative with real class footage outperforms the offer creative 2.1x on cost per tour.",
        ],
        sample: true,
      },
      {
        id: "google_ads", name: "Google Ads",
        metrics: [
          { label: "Spend", value: "$1,200" }, { label: "Leads", value: 46 },
          { label: "Cost / lead", value: "$26" }, { label: "Joins", value: 7 },
        ],
        insights: [
          "Brand + \u201cgym near me\u201d terms carry the account. Generic fitness prospecting cut after week 3: $220 for 1 join.",
          "$312 of junk clicks (bounce under 3 seconds) excluded at placement level \u2014 the founder's original MCB pain, caught here in month one.",
        ],
        sample: true,
      },
      {
        id: "gsc", name: "Search Console \u00b7 organic search",
        metrics: [
          { label: "Clicks", value: "1,940" }, { label: "Impressions", value: "88k" },
          { label: "Avg position", value: 8.2 }, { label: "CTR", value: "2.2%" },
        ],
        insights: [
          "\u201ccity zero miami\u201d owns position 1. \u201cgym brickell\u201d sits at 9.4: one landing page from page one.",
          "The 404 the monitor found (EX route) also burns organic: fixing /classes-schedule/ recovers every link pointing at it.",
        ],
        sample: true,
      },
      {
        id: "glofox", name: "Glofox \u00b7 tours, trials, joins",
        metrics: [
          { label: "Tours booked", value: 54 }, { label: "Showed", value: 38 },
          { label: "Trials", value: 31 }, { label: "Joined", value: 19 },
        ],
        insights: [
          "Plan mix of the 19: eleven $179.99, four $129.99, two annual $1,900, two family $279 \u2014 prices REAL, mix sample.",
          "Trial-to-member conversion 61%: the trial push workflow (Automation) fires 3 days before expiry.",
        ],
        sample: true,
      },
      {
        id: "instagram", name: "Instagram organic \u00b7 REAL baseline",
        metrics: [
          { label: "Followers", value: "110,999" }, { label: "Median likes", value: 73 },
          { label: "Median comments", value: 9 }, { label: "Median video views", value: "3,484" },
        ],
        insights: [
          "The only fully REAL section: Apify capture of 50 posts, Jan 2025 - Aug 2026. This is the organic baseline paid runs on top of.",
          "Top content: classes, Beto Perez, Zumba, events \u2014 the same themes the ad creative should reuse.",
        ],
        sample: false,
      },
    ],
    kanban: {
      completed: [
        { title: "FB \u2194 IG reconnected, one official page", source: "meta_ads", outcome: "Step 0 done \u00b7 from their own hiring post" },
        { title: "Phantom pages inventoried: merged or reported", source: "meta_ads", outcome: "EX-006 closed" },
        { title: "Pixel + conversions wired to Glofox bookings", source: "cross", outcome: "Attribution cross live" },
      ],
      in_progress: [
        { title: "Event promos link visible refund terms", source: "cross", outcome: "EX-004 \u00b7 ads-to-policy handoff" },
        { title: "Delivery schedule = real staffed hours", source: "meta_ads", outcome: "EX-001 \u00b7 inherits monitor hours" },
      ],
      recommendations: [
        { title: "Shift $400 from generic prospecting to Meta tours", source: "cross", impact: "est. 2-3 extra joins at ~$132" },
        { title: "Annual plan push at trial day 6+", source: "glofox", impact: "2 annuals = $3,800 collected up front" },
        { title: "One landing page for \u201cgym brickell\u201d", source: "gsc", impact: "position 9.4 \u2192 page one" },
      ],
    },
    diagnosis: {
      headline: "Paid works when the plumbing works, and the platforms grade themselves generously.",
      stats: [
        { label: "Over-claim caught", value: "+32%", meta: "25 claimed vs 19 real" },
        { label: "Waste cut", value: "$312", meta: "10.4% of spend, week 3" },
        { label: "Best channel", value: "$132", meta: "Meta tours, cost per member" },
        { label: "Worst channel", value: "$220", meta: "generic prospecting, cut" },
      ],
      narrative_paragraphs: [
        "A month ago this account could not run Meta ads at all: Facebook and Instagram were disconnected, the approval request was lost, and pages nobody recognized carried the brand. That cleanup was week one, and it is why every number here exists.",
        "The platforms report success in their own currency: 25 attributed members between them. Glofox recorded 19. The gap is not fraud, it is double counting, and the deterministic cross against real joins is what keeps the budget honest.",
        "Month one is the baseline. The waste is out, the winners are identified, and next month every number on this page gets a delta against this one.",
      ],
      bottom_line: "$3,000 in, 19 members whose first month bills $3,420. The instrument, not the platforms, decides where the next dollar goes.",
    },
  },

  /* ---------------- ANALYTICS ---------------- */
  analytics: {
    sampleFunnel: [
      { stage: "Leads in", n: 120 },
      { stage: "Contacted inside SLA", n: 96 },
      { stage: "Tour or trial booked", n: 54 },
      { stage: "Showed up", n: 38 },
      { stage: "Became members", n: 19 },
    ],
    sampleSources: [
      { source: "Instagram + Linktree", n: 34 },
      { source: "Website form", n: 27 },
      { source: "ClassPass", n: 22 },
      { source: "Guided tour form", n: 16 },
      { source: "Walk-in + phone", n: 13 },
      { source: "Wellhub", n: 8 },
    ],
    sensitivity: [
      { members: 250, revenue: 540000 },
      { members: 500, revenue: 1080000 },
      { members: 1000, revenue: 2160000 },
      { members: 2000, revenue: 4320000 },
    ],
  },

  /* ---------------- SYSTEM ---------------- */
  integrations: [
    { name: "cityzero.com (WordPress)", mode: "READ", phase: 1, status: "CONNECTED", detail: "Public pages, daily sweep. We never edit the site." },
    { name: "Google Business Profile", mode: "READ", phase: 1, status: "CONNECTED", detail: "Hours, reviews, attributes. Replies publish from your account only." },
    { name: "Glofox", mode: "READ", phase: 1, status: "CONNECTED", detail: "Public schedule and capacity. Bookings are never touched. Member export is Phase 2 and needs your edition confirmed." },
    { name: "Stripe", mode: "NONE", phase: 1, status: "OUT OF SCOPE", detail: "Payments are never read or written in any phase." },
    { name: "ClassPass", mode: "READ", phase: 1, status: "CONNECTED", detail: "Listing text and schedule presence." },
    { name: "Wellhub", mode: "READ", phase: 1, status: "CONNECTED", detail: "Listing text and schedule presence." },
    { name: "Instagram + Linktree", mode: "READ", phase: 1, status: "CONNECTED", detail: "Public profile, bio links. We never post." },
    { name: "Glofox member export", mode: "READ", phase: 2, status: "PLANNED", detail: "Lead journey and member analytics. Blocked on edition and export access." },
    { name: "Email + SMS provider", mode: "WRITE (your account)", phase: 2, status: "PLANNED", detail: "Workflow touches send from City Zero's own account, drafts approved by a person." },
    { name: "WhatsApp Business", mode: "WRITE (your account)", phase: 2, status: "PLANNED", detail: "Optional lead follow-up channel if City Zero uses it." },
  ],
  auditlog: [
    { at: "2026-08-24 18:42", what: "EX-006 opened: unknown duplicate Facebook Pages, creator unknown", kind: "exception" },
    { at: "2026-08-24 18:41", what: "EX-005 opened: Facebook and Instagram disconnected in Business Suite", kind: "exception" },
    { at: "2026-08-24 18:40", what: "Captured City Zero's own hiring post: Meta link broken, approval request lost, unknown pages reported", kind: "sweep" },
    { at: "2026-08-24 06:31", what: "Morning report sent: 4 open, 1 route failing, nothing new", kind: "report" },
    { at: "2026-08-24 06:04", what: "EX-001, EX-002, EX-003 re-confirmed: values still live", kind: "sweep" },
    { at: "2026-08-24 06:02", what: "Route check: 50 routes, /classes-schedule/ returned 404 again", kind: "sweep" },
    { at: "2026-08-24 06:00", what: "Sweep started: 7 surfaces queued", kind: "sweep" },
    { at: "2026-08-20 09:15", what: "Draft reply created for review by Jordana ZIN (2026-02-28)", kind: "review" },
    { at: "2026-08-20 09:14", what: "Draft reply created for review by Matt O (2026-05-31)", kind: "review" },
    { at: "2026-08-20 09:12", what: "2 of 20 sampled reviews classified OPERATIONAL", kind: "review" },
    { at: "2026-08-20 08:40", what: "EX-004 opened: event refund terms not visible before payment", kind: "exception" },
    { at: "2026-08-20 08:38", what: "EX-003 opened: theme contact info published in footer", kind: "exception" },
    { at: "2026-08-20 08:36", what: "EX-002 opened: class count 40+ vs 35 across pages", kind: "exception" },
    { at: "2026-08-20 08:31", what: "EX-001 opened: weekend closing hours disagree, site vs Google", kind: "exception" },
    { at: "2026-08-20 08:05", what: "Google Business Profile captured: 4.8 across 138, 20 recent reviews", kind: "sweep" },
    { at: "2026-08-20 07:50", what: "First sweep: 50 pages captured from cityzero.com", kind: "sweep" },
  ],
};

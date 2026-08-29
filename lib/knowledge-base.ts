import type { Category } from "@/lib/triage/schema"

export interface KbResource {
  id: string
  title: string
  link: string
  category: Category
  // Regulated or otherwise human-only topics: the assistant may share the link but must route to a person.
  alwaysEscalate?: boolean
  guidance: string
}

// Guidance is the exact knowledge-base text from the pdf, verbatim, so grounding stays faithful to the source.
export const KNOWLEDGE_BASE: KbResource[] = [
  {
    id: "student-visa",
    title: "Student visa and CAS, official guidance",
    link: "https://www.gov.uk/student-visa",
    category: "visa",
    alwaysEscalate: true,
    guidance:
      "The official Student visa guidance on GOV.UK covers eligibility, what a Confirmation of Acceptance for Studies (CAS) is, how to apply or extend, the financial and English language requirements, dependants, and what the visa allows, such as work limits during study. It is the authoritative source for the rules themselves. Immigration is a regulated area. Under UK law, only qualified and registered advisers may advise a person on their individual immigration position or on what they should do about it. For that reason, anything that turns on a student's specific circumstances, for example a refused or withdrawn CAS, a visa close to expiry, a change of course or sponsor, a refusal, or what will happen to their status, must go to a qualified adviser or staff member rather than being answered automatically. The assistant may point a student to the official guidance and tell them where to get help, but it should not interpret the rules for their situation. This makes the visa resource a test of restraint: recognise an immigration question, share the official link if it helps, and route the person to a human.",
  },
  {
    id: "hardship-fund",
    title: "University Hardship Fund, short-term financial help",
    link: "/resources/hardship-fund",
    category: "financial",
    guidance:
      "The Hardship Fund provides discretionary, one-off grants to students facing unexpected or short-term financial difficulty. Typical situations include a delayed maintenance loan, bursary or scholarship instalment, an unexpected essential cost, a sudden drop in income, or a temporary shortfall that means a student cannot cover rent, food, or utilities. It is meant as a safety net for emergencies and gaps, not as a regular income or a substitute for student finance. Most enrolled students can apply, including international students. Awards are normally grants rather than loans, and the amount depends on the assessed level of need. Applications are made online and ask for a short explanation of the situation and basic evidence, such as bank statements or a letter about a delayed payment. Standard decisions usually take five to ten working days, and there is a faster route for genuine emergencies where someone is at immediate risk of being unable to afford essentials. Where the difficulty is urgent, for example rent is due within days, it is reasonable to point the student to the emergency route and, if the situation looks serious, to make sure a staff member is aware rather than leaving it to the form alone.",
  },
  {
    id: "deposit-guide",
    title: "Tenancy deposits, getting your deposit back",
    link: "/resources/deposit-guide",
    category: "housing",
    guidance:
      "In England and Wales, a landlord or letting agent who takes a deposit on an assured shorthold tenancy must protect it in a government-approved tenancy deposit scheme, and must tell the tenant which scheme holds it within 30 days. At the end of the tenancy the deposit should be returned in full unless the landlord has a legitimate reason to make deductions, usually unpaid rent, unpaid bills, or damage beyond fair wear and tear. Normal wear from everyday living is not a valid reason for a deduction. If a landlord proposes deductions the tenant disagrees with, the first step is to ask for an itemised breakdown and any evidence, and to try to resolve it in writing. If that does not work, every approved scheme offers a free, independent dispute resolution service. Tenants should keep their tenancy agreement, inventories, photographs, and correspondence, because the outcome usually turns on the quality of that evidence. This is general information, not legal advice about a specific dispute; where a case is complex (the deposit was never protected, large sums, or possible court action), the student should be encouraged to get proper advice from the students' union advice service or a specialist housing adviser.",
  },
  {
    id: "library",
    title: "Academic resources, past papers and reading lists",
    link: "/resources/library",
    category: "academic",
    guidance:
      "Past exam papers, module reading lists, and core study materials are available through the university library portal. Students sign in with their university account to reach module pages, which usually link the current reading list, lecture materials, and an archive of past papers. Reading lists are organised by module code, so having the module or course details to hand makes them easier to find. Not every module has a full set of past papers, so an absence is normal rather than a fault; where something is missing, the usual route is to contact the module leader or the academic liaison librarian. This is a routine, self-service request and a good example of something the assistant should resolve on its own by pointing the student to the portal and explaining how to find what they need.",
  },
  {
    id: "extenuating-circumstances",
    title: "Extenuating circumstances and assessment mitigation",
    link: "/resources/extenuating-circumstances",
    category: "academic",
    guidance:
      "If illness, bereavement, or another serious and unforeseen event affects a student's ability to complete an assessment or meet a deadline, they can usually apply for extenuating (or mitigating) circumstances. Typical outcomes include a short extension, deferral of an assessment to the next sitting, or having the circumstances taken into account by an exam board. Applications are normally made online before or shortly after the affected assessment, and usually ask for a brief statement and supporting evidence such as a medical note. Deadlines and acceptable evidence vary by department, so where a case is time-critical it is reasonable to point the student to the process quickly and, if they are distressed or the timing is tight, to make sure a staff member is aware. This is general process information, not a guarantee of any particular outcome.",
  },
  {
    id: "it-help",
    title: "IT and account support",
    link: "/resources/it-help",
    category: "other",
    guidance:
      "Help with university accounts and systems — signing in, email, the virtual learning environment, Wi-Fi, software, and password resets — is provided by the IT service desk. Most common problems, such as a forgotten password, being locked out, or setting up multi-factor authentication on a new phone, can be resolved through the self-service portal or by contacting the service desk directly. This is a routine, self-service request and a good example of something the assistant should resolve on its own by pointing the student to the right place and explaining the steps.",
  },
  {
    id: "disability-support",
    title: "Disability and additional learning support",
    link: "/resources/disability-support",
    category: "health",
    guidance:
      "Students with a disability, long-term health condition, mental-health condition, or specific learning difficulty (such as dyslexia) can get tailored support, including reasonable adjustments for teaching and assessment, specialist mentoring, assistive technology, and help applying for the Disabled Students' Allowance where eligible. Support usually starts with registering with the disability or inclusion service and a short needs assessment. This is non-urgent, routine signposting in most cases; the assistant can explain how to register and what support exists. Where a student describes being in crisis or unsafe, the wellbeing and emergency routes take priority.",
  },
  {
    id: "fees",
    title: "Fees, tuition and payment plans",
    link: "/resources/fees",
    category: "financial",
    guidance:
      "Questions about tuition fees, paying in instalments, or what happens if a payment is late are handled by the finance or fees office. Many institutions offer instalment plans and can discuss options where a student is struggling to pay on time; acting early is usually better than missing a deadline. The assistant can explain that payment plans typically exist and point the student to the fees office to arrange one. It should not quote specific fee amounts, confirm a student's individual balance, or promise a particular arrangement — those depend on the student's record and are for the fees office to confirm.",
  },
  {
    id: "careers",
    title: "Careers, part-time work and right to work",
    link: "/resources/careers",
    category: "other",
    guidance:
      "The careers service helps with CVs, applications, interviews, internships, and finding part-time work alongside study, usually via appointments, drop-ins, and an online jobs board. For international students, how many hours they may work, and when, is set by their visa conditions — the assistant may point them to the careers service for job-seeking help and to the official student-visa guidance for the rules, but it must not advise an individual international student on their specific work rights, which depend on their immigration status and are for a qualified adviser.",
  },
  {
    id: "wellbeing",
    title: "Wellbeing and Counselling service, non-urgent",
    link: "/resources/wellbeing",
    category: "health",
    guidance:
      "The Wellbeing and Counselling service supports students with non-urgent mental health and wellbeing concerns such as stress, low mood, anxiety, homesickness, difficulty adjusting, sleep problems, or struggling to cope with academic pressure. Support usually includes short-term one-to-one counselling, group sessions and workshops, and self-help resources, normally accessed by self-referral through an online form and a short initial assessment. It is the right destination for a student who is finding things hard and wants to talk to someone, including where low mood or stress is connected to another problem such as money or housing. It is not an emergency service. If someone describes being in crisis, feeling unsafe, having thoughts of harming themselves, or being unable to keep themselves safe, the routine wellbeing route is not enough on its own: they should be directed to urgent support (the Samaritans line, or 999 if there is immediate danger), and the case must reach a real person straight away rather than being handled automatically.",
  },
  {
    id: "report-and-support",
    title: "Reporting harassment, bullying or sexual misconduct",
    link: "/resources/report-and-support",
    category: "health",
    alwaysEscalate: true,
    guidance:
      "Students who have experienced harassment, bullying, hate, or sexual misconduct can report it and get support, usually through a dedicated report-and-support service that offers both anonymous reporting and the option to speak to a trained adviser. Because these disclosures are sensitive and may indicate someone is at risk, the assistant should respond with care, share the report-and-support route, and route the case to a person rather than trying to handle it automatically. Where there is any sign of immediate danger, the emergency rules apply.",
  },
]

export const URGENT_SUPPORT = {
  samaritans:
    "the Samaritans, free and confidential, available 24/7 on 116 123",
  emergency: "999 for immediate danger to life or safety",
}

export function getResourceById(id: string): KbResource | null {
  return KNOWLEDGE_BASE.find((resource) => resource.id === id) ?? null
}

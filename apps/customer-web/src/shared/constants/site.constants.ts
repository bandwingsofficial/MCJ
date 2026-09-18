export const MCJ_CONTACT = {
  phone: "+91 888 000 7484",
  phoneSecondary: "+91 966 337 0950",
  email: "support@mcjinstitute.com",
  addressLines: [
    "#258/1, 1st Floor, Near 31E Bus Stop Rd",
    "2nd Block, Thyagaraja Nagar",
    "Bengaluru, Karnataka 560028",
  ],
  hours: "Mon – Sat: 9:00 AM – 7:00 PM",
} as const;

export const MCJ_SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/",
  linkedin: "https://www.linkedin.com/",
  youtube: "https://www.youtube.com/",
  facebook: "https://www.facebook.com/",
} as const;

export const MCJ_NAV_ITEMS = [
  { name: "Home", href: "/" },
  { name: "Courses", href: "/courses" },
  { name: "Our Branches", href: "/branches" },
  { name: "Job Applications", href: "/jobs" },
  { name: "About Us", href: "/about" },
  { name: "Contact", href: "/contact" },
] as const;

export const MCJ_FOOTER_QUICK_LINKS = [
  { name: "Home", href: "/" },
  { name: "Courses", href: "/courses" },
  { name: "Our Branches", href: "/branches" },
  { name: "Placements", href: "/success-stories" },
  { name: "About Us", href: "/about" },
  { name: "Contact", href: "/contact" },
  { name: "FAQ", href: "/faq" },
] as const;

export const MCJ_FEATURE_STRIP_ITEMS = [
  "Industry Relevant Curriculum",
  "Real-world Projects",
  "Flexible Batch Timings",
  "Certification",
  "Lifetime Learning Support",
] as const;

export const MCJ_BRANCH_FEATURE_ITEMS = [
  "Expert Faculty",
  "Hands-on Training",
  "Real-world Projects",
  "Doubt Support",
  "Placement Assistance",
  "Modern Classroom",
] as const;

export const MCJ_WHY_FEATURES = [
  {
    title: "Experienced & Friendly Faculty",
    description:
      "Learn from qualified mentors who combine industry experience with approachable teaching.",
  },
  {
    title: "Real-time Practical Training",
    description:
      "Hands-on sessions, live examples, and real accounting workflows—not theory alone.",
  },
  {
    title: "Small Batch Sizes",
    description:
      "Limited seats per batch so every learner gets attention and doubt resolution.",
  },
  {
    title: "Flexible Timings",
    description:
      "Weekday and weekend batches designed for students and working professionals.",
  },
  {
    title: "Placement Support",
    description:
      "Interview preparation, resume guidance, and hiring partner connections.",
  },
  {
    title: "Certification & Career Guidance",
    description:
      "Industry-relevant certification plus career counselling from expert mentors.",
  },
] as const;

export const MCJ_BRANCH_FACILITIES = [
  {
    name: "Modern Classrooms",
    image: "/why/Image-Expert-Mentors.jpg",
  },
  {
    name: "Computer Lab",
    image: "/why/image-Curriculam.jpeg",
  },
  {
    name: "Student Lounge",
    image: "/why/Image-Limited Batch.jpg",
  },
  {
    name: "Library & Resources",
    image: "/why/image-weeklyguidance.jpeg",
  },
] as const;

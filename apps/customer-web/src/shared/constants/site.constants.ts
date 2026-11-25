export const MCJ_CONTACT = {
  phone: "+91 888 000 7484",
  phoneSecondary: "+91 966 337 0950",
  email: "mcjtrainingacademy@gmail.com",
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
  { name: "Financial News", href: "/finance-news" },
  { name: "Our Branches", href: "/branches" },
  { name: "Jobs", href: "/jobs" },
  { name: "About Us", href: "/about" },
  { name: "Contact", href: "/contact" },
] as const;

export const MCJ_FOOTER_QUICK_LINKS = [
  { name: "Home", href: "/" },
  { name: "Courses", href: "/courses" },
  { name: "Financial News", href: "/finance-news" },
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
    title: "Practical, Hands-on Accounting Training",
    description:
      "Develop accounting skills through practical exercises, real-world examples, and hands-on accounting activities.",
  },
  {
    title: "Classroom and Online Learning Options",
    description:
      "Choose between classroom training and live online classes based on your convenience.",
  },
  {
    title: "Pre-recorded Video Learning",
    description:
      "Access pre-recorded lessons to learn at your own pace and revisit important topics whenever needed.",
  },
  {
    title: "Simulation Software Practice",
    description:
      "Practise accounting activities using simulation software to understand real working environments.",
  },
  {
    title: "Printed and Online Study Materials",
    description:
      "Get access to printed and digital study materials to support your learning and revision.",
  },
  {
    title: "Placement Assistance",
    description:
      "Get career guidance, interview preparation, and placement assistance to support your job search.",
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

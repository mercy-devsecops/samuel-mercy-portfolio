/**
 * SAMUEL MERCY OLUWATOBI — PRIVATE ADMIN & SHARED PORTFOLIO CONFIGURATION
 * 
 * Stores non-secret client configuration for:
 * 1. Firebase (Auth & Firestore)
 * 2. Cloudinary (Direct unsigned upload preset & cloud name)
 * 3. Default portfolio baseline data
 * 
 * SECURITY NOTE:
 * Cloudinary API secrets and Firebase Admin private keys are NEVER placed here.
 * Only public client keys (Firebase Client API Key, Cloud Name, and Unsigned Upload Preset) are used.
 */

window.PORTFOLIO_CONFIG = {
  // Firebase Web App Configuration
  firebase: {
    apiKey: "AIzaSyAPiBXKTAdlAQPF5iU6K6Fp60Z4jYKsB70",
    authDomain: "samuel-mercy-portfolio.firebaseapp.com",
    projectId: "samuel-mercy-portfolio",
    storageBucket: "samuel-mercy-portfolio.firebasestorage.app",
    messagingSenderId: "746378388832",
    appId: "1:746378388832:web:d2f8fbdd32c1277179aa05"
  },

  // Cloudinary Direct Unsigned Upload Configuration
  cloudinary: {
    cloudName: "ragfrtua",
    uploadPreset: "portfolio_uploads"
  },

  // Permanent Standard Project Categories
  projectCategories: [
    'Web Development',
    'DevOps & Cloud',
    'Cybersecurity',
    'IT Automation with Python',
    'AI Automation'
  ],

  // Storage Mode: 'hybrid' (tries Firebase first, mirrors to LocalStorage for zero-lag editing & offline readiness)
  storageMode: "hybrid",

  // Approved Master Baseline for Samuel Mercy Oluwatobi (No fake content)
  baseline: {
    home: {
      fullName: "SAMUEL MERCY OLUWATOBI",
      nameTiers: ["SAMUEL", "MERCY", "OLUWATOBI"],
      monogram: "SMO",
      digitalPortfolioSubtitle: "DIGITAL PORTFOLIO",
      disciplines: ["BUILD", "AUTOMATE", "SECURE", "DEPLOY"],
      quoteLines: [
        "Code is my craft.",
        "Automation is my weapon.",
        "Security is my priority."
      ],
      heroImage: "",
      ctaText: "CLICK TO OPEN BOOK",
      status: "published"
    },
    sections: [
      { id: "home", title: "HOME", chapter: "COVER", isCover: true, order: 0, status: "published" },
      { id: "about", title: "ABOUT ME", chapter: "CHAPTER I", isCover: false, order: 1, status: "published" },
      { id: "skills", title: "SKILLS", chapter: "CHAPTER II", isCover: false, order: 2, status: "published" },
      { id: "projects", title: "PROJECTS", chapter: "CHAPTER III", isCover: false, order: 3, status: "published" },
      { id: "certificates", title: "CERTIFICATES", chapter: "CHAPTER IV", isCover: false, order: 4, status: "published" },
      { id: "education", title: "EDUCATION", chapter: "CHAPTER V", isCover: false, order: 5, status: "published" },
      { id: "journey", title: "JOURNEY", chapter: "CHAPTER VI", isCover: false, order: 6, status: "published" },
      { id: "contact", title: "CONTACT", chapter: "CHAPTER VII", isCover: false, order: 7, status: "published" }
    ],
    pages: {
      about: [
        {
          id: "about-page-1",
          sectionId: "about",
          title: "OVERVIEW",
          subtitle: "IDENTITY & PURPOSE",
          order: 1,
          status: "published",
          heading: "OVERVIEW",
          bodyText: "",
          supportingInfo: "",
          mediaUrl: ""
        }
      ],
      skills: [],
      projects: [],
      certificates: [],
      education: [],
      journey: [],
      contact: [
        {
          id: "contact-page-1",
          sectionId: "contact",
          title: "DIRECT TRANSMISSION",
          subtitle: "COMMUNICATION CHANNELS",
          order: 1,
          status: "published",
          email: "contact@samuelmercy.com",
          linkedIn: "https://linkedin.com",
          github: "https://github.com",
          additionalNotes: ""
        }
      ]
    },
    items: {
      skills: [],
      projects: [],
      certificates: [],
      education: [],
      journey: []
    }
  }
};

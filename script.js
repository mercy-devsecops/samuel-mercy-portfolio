/**
 * SAMUEL MERCY OLUWATOBI — LUXURY INTERACTIVE DIGITAL BOOK PORTFOLIO
 * Unified Architecture:
 * - Desktop/Tablet: Physical Two-Page Spread Engine with 3D Page Turn
 * - Mobile: Large Single-Page Ring-Bound Jotter Engine
 * - Dynamic Data Layer: Integrated with Shared Portfolio Service & Private Admin
 * 
 * CORE PRINCIPLE: SECTION ≠ PAGE
 * BOOK -> SECTIONS -> PAGES[]
 */

document.addEventListener('DOMContentLoaded', async () => {

  // ==========================================================================
  // 1. Dynamic Section Compilation & Portfolio Data Sync
  // ==========================================================================

  function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  // Five Major Technical Disciplines — Luxury Palette Accent Themes
  const SKILL_CATEGORY_THEMES = {
    'cybersecurity': {
      key: 'cybersecurity',
      canonicalName: 'Cybersecurity',
      displayName: 'CYBERSECURITY',
      accentColor: '#103964',
      badgeBg: 'rgba(16, 57, 100, 0.08)',
      badgeBorder: 'rgba(16, 57, 100, 0.32)',
      ruleGradient: 'linear-gradient(90deg, rgba(16, 57, 100, 0.55) 0%, rgba(16, 57, 100, 0.12) 80%, transparent 100%)',
      iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`
    },
    'it-automation-with-python': {
      key: 'it-automation-with-python',
      canonicalName: 'IT Automation with Python',
      displayName: 'IT AUTOMATION WITH PYTHON',
      accentColor: '#0a525d',
      badgeBg: 'rgba(10, 82, 93, 0.08)',
      badgeBorder: 'rgba(10, 82, 93, 0.32)',
      ruleGradient: 'linear-gradient(90deg, rgba(10, 82, 93, 0.55) 0%, rgba(10, 82, 93, 0.12) 80%, transparent 100%)',
      iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`
    },
    'devops': {
      key: 'devops',
      canonicalName: 'DevOps',
      displayName: 'DEVOPS',
      accentColor: '#3c1860',
      badgeBg: 'rgba(60, 24, 96, 0.08)',
      badgeBorder: 'rgba(60, 24, 96, 0.32)',
      ruleGradient: 'linear-gradient(90deg, rgba(60, 24, 96, 0.55) 0%, rgba(60, 24, 96, 0.12) 80%, transparent 100%)',
      iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>`
    },
    'ai-automation': {
      key: 'ai-automation',
      canonicalName: 'AI Automation',
      displayName: 'AI AUTOMATION',
      accentColor: '#281c61',
      badgeBg: 'rgba(40, 28, 97, 0.08)',
      badgeBorder: 'rgba(40, 28, 97, 0.32)',
      ruleGradient: 'linear-gradient(90deg, rgba(40, 28, 97, 0.55) 0%, rgba(40, 28, 97, 0.12) 80%, transparent 100%)',
      iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>`
    },
    'web-development': {
      key: 'web-development',
      canonicalName: 'Web Development',
      displayName: 'WEB DEVELOPMENT',
      accentColor: '#4a0f1b',
      badgeBg: 'rgba(74, 15, 27, 0.08)',
      badgeBorder: 'rgba(74, 15, 27, 0.32)',
      ruleGradient: 'linear-gradient(90deg, rgba(74, 15, 27, 0.55) 0%, rgba(74, 15, 27, 0.12) 80%, transparent 100%)',
      iconSvg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`
    }
  };

  function getSkillTheme(catName) {
    const raw = String(catName || '').trim();
    const norm = raw.toLowerCase();
    if (norm.includes('cyber') || norm.includes('security')) {
      return SKILL_CATEGORY_THEMES['cybersecurity'];
    }
    if (norm.includes('python') || (norm.includes('automation') && norm.includes('it'))) {
      return SKILL_CATEGORY_THEMES['it-automation-with-python'];
    }
    if (norm.includes('devops') || norm.includes('cloud') || norm.includes('infra')) {
      return SKILL_CATEGORY_THEMES['devops'];
    }
    if (norm.includes('ai') || norm.includes('intelligence') || norm.includes('neural')) {
      return SKILL_CATEGORY_THEMES['ai-automation'];
    }
    if (norm.includes('web') || norm.includes('frontend') || norm.includes('backend') || norm.includes('full-stack')) {
      return SKILL_CATEGORY_THEMES['web-development'];
    }
    return {
      key: 'custom',
      canonicalName: raw || 'Specialized Discipline',
      displayName: (raw || 'SPECIALIZED DISCIPLINE').toUpperCase(),
      accentColor: '#783d09',
      badgeBg: 'rgba(120, 61, 9, 0.08)',
      badgeBorder: 'rgba(120, 61, 9, 0.32)',
      ruleGradient: 'linear-gradient(90deg, rgba(120, 61, 9, 0.55) 0%, rgba(120, 61, 9, 0.12) 80%, transparent 100%)',
      iconSvg: `<span style="font-size:12px; line-height:1;">✦</span>`
    };
  }

  function groupSkillsIntoCategories(skillsList) {
    const canonicalOrder = [
      'Cybersecurity',
      'IT Automation with Python',
      'DevOps',
      'AI Automation',
      'Web Development'
    ];

    const groupsMap = new Map();

    skillsList.forEach(skill => {
      const cat = (skill.category || 'General').trim();
      const theme = getSkillTheme(cat);
      const groupKey = theme.key;

      if (!groupsMap.has(groupKey)) {
        groupsMap.set(groupKey, {
          category: cat,
          theme: theme,
          displayName: cat.toUpperCase(),
          skills: []
        });
      }
      groupsMap.get(groupKey).skills.push(skill);
    });

    groupsMap.forEach(grp => {
      grp.skills.sort((a, b) => (a.order || 0) - (b.order || 0));
    });

    const orderedGroups = [];
    canonicalOrder.forEach(canCat => {
      const themeKey = getSkillTheme(canCat).key;
      if (groupsMap.has(themeKey)) {
        orderedGroups.push(groupsMap.get(themeKey));
        groupsMap.delete(themeKey);
      }
    });

    groupsMap.forEach(grp => {
      orderedGroups.push(grp);
    });

    return orderedGroups;
  }

  function compileDynamicSections(portfolioData) {
    const sections = [];
    const rawSections = (portfolioData && portfolioData.sections) || [];
    const pagesMap = (portfolioData && portfolioData.pages) || {};
    const itemsMap = (portfolioData && portfolioData.items) || {};

    rawSections.forEach(sec => {
      if (sec.isCover) {
        sections.push({
          id: "home",
          title: "HOME",
          chapter: "COVER",
          isCover: true,
          pages: [{ id: "home-cover", title: "COVER", isCoverPage: true }]
        });
        return;
      }

      let sectionPages = [];

      if (sec.id === 'about') {
        const aboutList = pagesMap.about || [];
        if (aboutList.length > 0) {
          sectionPages = aboutList.map((p, idx) => ({
            id: p.id,
            sectionId: 'about',
            title: p.title || 'Overview',
            subtitle: p.subtitle || 'IDENTITY & PURPOSE',
            heading: p.heading || '',
            bodyText: p.bodyText || '',
            supportingInfo: p.supportingInfo || '',
            mediaUrl: p.mediaUrl || '',
            pageNum: idx + 1,
            isAboutEditorial: (idx === 0)
          }));
        } else {
          sectionPages = [];
        }
      } else if (sec.id === 'skills') {
        const rawSkills = itemsMap.skills || [];
        const isPreview = window.location.search.includes('preview=draft') &&
                          window.portfolioService && window.portfolioService.isAuthenticated();
        const publishedSkills = rawSkills.filter(s => isPreview || (s.status || 'published') === 'published');

        if (publishedSkills.length === 0) {
          sectionPages = [];
        } else {
          const categorizedGroups = groupSkillsIntoCategories(publishedSkills);

          if (categorizedGroups.length === 1) {
            const singleGroup = categorizedGroups[0];
            if (singleGroup.skills.length > 3) {
              const half = Math.ceil(singleGroup.skills.length / 2);
              sectionPages.push({
                id: 'skills-page-1',
                sectionId: 'skills',
                title: 'Technical Arsenal',
                subtitle: `${singleGroup.displayName} • PART I`,
                pageNum: 1,
                groups: [{
                  category: singleGroup.category,
                  theme: singleGroup.theme,
                  displayName: singleGroup.displayName,
                  skills: singleGroup.skills.slice(0, half)
                }],
                items: singleGroup.skills.slice(0, half),
                type: 'skills'
              });
              sectionPages.push({
                id: 'skills-page-2',
                sectionId: 'skills',
                title: 'Technical Arsenal',
                subtitle: `${singleGroup.displayName} • PART II`,
                pageNum: 2,
                groups: [{
                  category: singleGroup.category,
                  theme: singleGroup.theme,
                  displayName: singleGroup.displayName,
                  skills: singleGroup.skills.slice(half)
                }],
                items: singleGroup.skills.slice(half),
                type: 'skills'
              });
            } else {
              sectionPages.push({
                id: 'skills-page-1',
                sectionId: 'skills',
                title: 'Technical Arsenal',
                subtitle: singleGroup.displayName,
                pageNum: 1,
                groups: [singleGroup],
                items: singleGroup.skills,
                type: 'skills'
              });
              sectionPages.push({
                id: 'skills-page-2',
                sectionId: 'skills',
                title: 'Systems Architecture',
                subtitle: 'PROFICIENCIES & PROTOCOLS',
                pageNum: 2,
                groups: [],
                items: [],
                isSealPlate: true,
                type: 'skills'
              });
            }
          } else {
            // Split category groups across pages (creating a balanced 2-page spread for desktop)
            const mid = Math.ceil(categorizedGroups.length / 2);
            const page1Groups = categorizedGroups.slice(0, mid);
            const page2Groups = categorizedGroups.slice(mid);

            sectionPages.push({
              id: 'skills-page-1',
              sectionId: 'skills',
              title: 'Technical Arsenal',
              subtitle: 'DISCIPLINARY ARCHIVES • PART I',
              pageNum: 1,
              groups: page1Groups,
              items: page1Groups.flatMap(g => g.skills),
              type: 'skills'
            });

            sectionPages.push({
              id: 'skills-page-2',
              sectionId: 'skills',
              title: 'Technical Arsenal',
              subtitle: 'DISCIPLINARY ARCHIVES • PART II',
              pageNum: 2,
              groups: page2Groups,
              items: page2Groups.flatMap(g => g.skills),
              type: 'skills'
            });
          }
        }
      } else if (sec.id === 'projects') {
        const PROJECT_CATEGORIES = (window.PORTFOLIO_CONFIG && window.PORTFOLIO_CONFIG.projectCategories) || [
          'Web Development',
          'DevOps & Cloud',
          'Cybersecurity',
          'IT Automation with Python',
          'AI Automation'
        ];

        const rawProjects = itemsMap.projects || [];
        const isPreview = window.location.search.includes('preview=draft') &&
                          window.portfolioService && window.portfolioService.isAuthenticated();
        const publishedProjects = rawProjects.filter(p => isPreview || p.status === 'published');
        window.__allPublishedProjects = publishedProjects;

        // Normalize categories on each project
        publishedProjects.forEach(p => {
          if (!p.category || !PROJECT_CATEGORIES.includes(p.category)) {
            const catLower = (p.category || '').toLowerCase();
            if (catLower.includes('cyber')) p.category = 'Cybersecurity';
            else if (catLower.includes('devops')) p.category = 'DevOps & Cloud';
            else if (catLower.includes('python')) p.category = 'IT Automation with Python';
            else if (catLower.includes('ai')) p.category = 'AI Automation';
            else p.category = 'Web Development';
          }
        });

        // Group by category, sorting by order within each category
        const projectsByCategory = {};
        PROJECT_CATEGORIES.forEach(cat => {
          projectsByCategory[cat] = publishedProjects
            .filter(p => p.category === cat)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
        });

        // Active categories: ONLY categories that contain at least 1 published project
        const activeCategories = PROJECT_CATEGORIES.filter(cat => projectsByCategory[cat].length > 0);

        if (publishedProjects.length > 0) {
          // 1. Projects Portal & Category Directory Page
          sectionPages.push({
            id: 'projects-portal',
            sectionId: 'projects',
            title: 'Projects Directory',
            subtitle: 'ARCHITECTURAL ARCHIVES',
            pageNum: 1,
            type: 'projects-portal',
            activeCategories,
            projectsByCategory,
            allPublishedProjects: publishedProjects
          });

          // 2. Individual Project Pages — Strictly grouped by category, never mixed!
          let pageCounter = 2;
          activeCategories.forEach(cat => {
            const catProjects = projectsByCategory[cat];
            catProjects.forEach((proj, pIdx) => {
              sectionPages.push({
                id: `proj-page-${proj.id || `${cat.toLowerCase().replace(/\s+/g, '-')}-${pIdx + 1}`}`,
                sectionId: 'projects',
                title: proj.title || 'Architectural Case Study',
                subtitle: `${cat.toUpperCase()} • ${proj.projectType ? proj.projectType.toUpperCase() : 'CASE STUDY'}`,
                pageNum: pageCounter++,
                type: 'projects',
                items: [proj],
                category: cat,
                categoryProjectIndex: pIdx + 1,
                totalCategoryProjects: catProjects.length,
                activeCategories
              });
            });
          });
        } else {
          sectionPages = [];
        }
      } else if (sec.id === 'certificates') {
        const certList = itemsMap.certificates || [];
        if (certList.length > 0) {
          const chunkSize = 1;
          for (let i = 0; i < certList.length; i += chunkSize) {
            const chunk = certList.slice(i, i + chunkSize);
            sectionPages.push({
              id: `cert-page-${Math.floor(i / chunkSize) + 1}`,
              sectionId: 'certificates',
              title: chunk[0].title || 'Professional Credential',
              subtitle: chunk[0].issuer ? `${chunk[0].issuer.toUpperCase()} • VERIFICATION` : 'VERIFIED CREDENTIAL',
              pageNum: Math.floor(i / chunkSize) + 1,
              items: chunk,
              type: 'certificates'
            });
          }
        } else {
          sectionPages = [];
        }
      } else if (sec.id === 'education') {
        const eduList = itemsMap.education || [];
        if (eduList.length > 0) {
          const chunkSize = 1;
          for (let i = 0; i < eduList.length; i += chunkSize) {
            const chunk = eduList.slice(i, i + chunkSize);
            sectionPages.push({
              id: `edu-page-${Math.floor(i / chunkSize) + 1}`,
              sectionId: 'education',
              title: chunk[0].institution || 'Academic Foundation',
              subtitle: chunk[0].degree ? chunk[0].degree.toUpperCase() : 'COMPUTING & ENGINEERING',
              pageNum: Math.floor(i / chunkSize) + 1,
              items: chunk,
              type: 'education'
            });
          }
        } else {
          sectionPages = [];
        }
      } else if (sec.id === 'journey') {
        const journeyList = (itemsMap.journey || []).filter(j => (j.status || 'published') === 'published');
        if (journeyList.length > 0) {
          // Each milestone gets its own spread: left = full timeline, right = milestone detail
          journeyList.forEach((item, i) => {
            // Left page: full timeline (all milestones, activeIndex = i)
            sectionPages.push({
              id: `journey-timeline-${i + 1}`,
              sectionId: 'journey',
              title: 'My Journey',
              subtitle: 'EVOLUTION & MILESTONES',
              pageNum: i * 2 + 1,
              allItems: journeyList,
              activeIndex: i,
              type: 'journey-timeline'
            });
            // Right page: milestone detail
            sectionPages.push({
              id: `journey-detail-${i + 1}`,
              sectionId: 'journey',
              title: item.title || 'Milestone',
              subtitle: (item.milestoneType || 'MILESTONE').toUpperCase(),
              pageNum: i * 2 + 2,
              item: item,
              milestoneIndex: i,
              totalMilestones: journeyList.length,
              type: 'journey-detail'
            });
          });
        } else {
          // No published journey items: do not generate empty or phantom journey pages
          sectionPages = [];
        }
      } else if (sec.id === 'contact') {
        const contactPages = pagesMap.contact || [];
        const cData = contactPages[0] || {};
        // Always produce two pages: left (channels) + right (form) = one spread
        sectionPages = [
          {
            id: 'contact-left',
            sectionId: 'contact',
            title: "Let's Connect",
            subtitle: 'COMMUNICATION CHANNELS',
            pageNum: 1,
            contact: cData,
            contactSide: 'left',
            chapterNum: sec.chapter || 'VII',
            type: 'contact'
          },
          {
            id: 'contact-right',
            sectionId: 'contact',
            title: 'Send a Message',
            subtitle: 'DIRECT TRANSMISSION',
            pageNum: 2,
            contact: cData,
            contactSide: 'right',
            type: 'contact'
          }
        ];
      }

      // Only include sections that contain actual pages
      if (sectionPages.length > 0) {
        sections.push({
          id: sec.id,
          title: sec.title,
          chapter: sec.chapter,
          isCover: false,
          pages: sectionPages
        });
      }
    });

    return sections;
  }

  function updateCoverElements(homeData) {
    if (!homeData) return;

    // 1. Full Name Tiers
    const fullName = homeData.fullName || 'SAMUEL MERCY OLUWATOBI';
    const tiers = homeData.nameTiers || fullName.split(' ');
    const tSamuel = document.querySelector('.name-tier.tier-samuel');
    const tMercy = document.querySelector('.name-tier.tier-mercy');
    const tOluwatobi = document.querySelector('.name-tier.tier-oluwatobi');
    if (tSamuel && tiers[0]) tSamuel.textContent = tiers[0];
    if (tMercy && tiers[1]) tMercy.textContent = tiers[1];
    if (tOluwatobi && tiers[2]) tOluwatobi.textContent = tiers[2];

    // Spine lettering
    const spineTitle = document.querySelector('.spine-title-rotated');
    if (spineTitle) spineTitle.textContent = fullName;

    // 2. Monogram
    const monogram = homeData.monogram || 'SMO';
    const badge = document.querySelector('.smo-badge-text');
    if (badge) badge.textContent = monogram;
    const spineSmo = document.querySelector('.spine-smo-cell');
    if (spineSmo) spineSmo.textContent = monogram;

    // 3. Subtitle
    const sub = document.querySelector('.sub-title-text');
    if (sub) sub.textContent = homeData.digitalPortfolioSubtitle || 'DIGITAL PORTFOLIO';

    // 4. Disciplines Tagline
    const taglineStrip = document.querySelector('.cover-tagline-strip');
    if (taglineStrip && homeData.disciplines && homeData.disciplines.length) {
      taglineStrip.innerHTML = homeData.disciplines.map((d, i) => `<span>${escapeHTML(d)}</span>${i < homeData.disciplines.length - 1 ? '<span class="tagline-dot">•</span>' : ''}`).join('');
    }

    // 5. Philosophical Quote
    const quoteBox = document.querySelector('.cover-philosophical-quote');
    if (quoteBox && homeData.quoteLines && homeData.quoteLines.length) {
      quoteBox.innerHTML = homeData.quoteLines.map(q => `<p class="quote-row">&ldquo;${escapeHTML(q.replace(/^[“"]|[”"]$/g, ''))}&rdquo;</p>`).join('');
    }

    // 6. Action prompt cue
    const cue = document.querySelector('.cue-pill');
    if (cue && homeData.ctaText) cue.textContent = homeData.ctaText;
  }

  // Desktop/Tablet Spread Compiler
  function compileSpreads(sections) {
    const spreads = [];
    const sectionLookup = {};

    sections.forEach(section => {
      if (section.isCover) {
        const spreadIndex = spreads.length;
        section.startSpreadIndex = spreadIndex;
        sectionLookup[section.id] = spreadIndex;

        spreads.push({
          spreadIndex: spreadIndex,
          isCover: true,
          sectionId: section.id,
          sectionTitle: section.title,
          chapter: "COVER"
        });
        return;
      }

      const secStartSpread = spreads.length;
      section.startSpreadIndex = secStartSpread;
      sectionLookup[section.id] = secStartSpread;

      const pages = section.pages || [];
      for (let i = 0; i < pages.length; i += 2) {
        const spreadIndex = spreads.length;
        const left = pages[i];
        const right = (i + 1 < pages.length) ? pages[i + 1] : {
          id: `${section.id}-blank`,
          title: "NOTES",
          subtitle: "EDITORIAL SEAL",
          pageNum: i + 2,
          isBlank: true
        };

        spreads.push({
          spreadIndex: spreadIndex,
          isCover: false,
          sectionId: section.id,
          sectionTitle: section.title,
          chapter: section.chapter,
          partNumber: Math.floor(i / 2) + 1,
          totalParts: Math.ceil(pages.length / 2),
          leftPage: left,
          rightPage: right
        });
      }
    });

    return { spreads, sectionLookup };
  }

  // Mobile Single-Page Compiler
  function compileMobilePages(sections) {
    const flatPages = [];
    const mobileSectionMap = {};

    sections.forEach(section => {
      mobileSectionMap[section.id] = flatPages.length;

      (section.pages || []).forEach((pg, pIdx) => {
        flatPages.push({
          flatIndex: flatPages.length,
          sectionId: section.id,
          sectionTitle: section.title,
          chapter: section.chapter,
          isCover: !!section.isCover,
          pageIndexInSection: pIdx,
          totalSectionPages: section.pages.length,
          pageData: pg
        });
      });
    });

    return { flatPages, mobileSectionMap };
  }

  // Load Initial Portfolio Data
  // isPreviewMode: only allow draft preview for authenticated Admin users.
  // Unauthenticated visitors always see published content only, even if they
  // manually add ?preview=draft to the URL.
  const _previewRequested = window.location.search.includes('preview=draft');
  const _isAdmin = window.portfolioService && window.portfolioService.isAuthenticated();
  const isPreviewMode = _previewRequested && _isAdmin;

  // Helper to compile synchronous local snapshot for instant zero-latency book setup
  function getSynchronousPortfolioData(includeDrafts) {
    // 1. If we have a verified fresh public cache from a previous session, validate and use it for zero-flicker load
    if (!includeDrafts && typeof localStorage !== 'undefined') {
      try {
        const cached = localStorage.getItem('portfolio_public_cache_v2');
        if (cached) {
          const parsed = JSON.parse(cached);
          const payload = (parsed && parsed.data) ? parsed.data : parsed;
          if (payload && payload.home && Array.isArray(payload.sections) && payload.items) {
            const hasCollections = ['skills', 'projects', 'certificates', 'education', 'journey'].every(
              k => Array.isArray(payload.items[k])
            );
            if (hasCollections) {
              return payload;
            }
          }
        }
      } catch (e) {}
    }

    const raw = (window.portfolioService && window.portfolioService.localData) ||
      (window.PORTFOLIO_CONFIG ? window.PORTFOLIO_CONFIG.baseline : null) || {};

    const sections = (raw.sections || []).filter(s => includeDrafts || s.status === 'published');
    const pages = {};
    for (const sec of sections) {
      const pList = (raw.pages && raw.pages[sec.id]) || [];
      pages[sec.id] = pList.filter(p => includeDrafts || p.status === 'published');
    }
    const items = {};
    const rawItems = raw.items || {};
    for (const key of ['skills', 'projects', 'certificates', 'education', 'journey']) {
      items[key] = (rawItems[key] || []).filter(it => includeDrafts || it.status === 'published');
    }

    return {
      home: raw.home || {},
      sections,
      pages,
      items
    };
  }

  // ==========================================================================
  // 2. State Model
  // ==========================================================================
  let currentSpreadIndex = 0; // 0 = Closed Cover
  let currentMobileIndex = 0; // 0 = Closed Cover
  let isTransitioning = false;
  const FLIP_ANIMATION_MS = 520;

  function applyPortfolioData(data) {
    if (!data) return;
    currentPortfolioData = data;
    SECTIONS = compileDynamicSections(data);
    const sRes = compileSpreads(SECTIONS);
    BOOK_SPREADS = sRes.spreads;
    DESKTOP_SECTION_MAP = sRes.sectionLookup;
    const mRes = compileMobilePages(SECTIONS);
    MOBILE_PAGES = mRes.flatPages;
    MOBILE_SECTION_MAP = mRes.mobileSectionMap;
    if (data.home) updateCoverElements(data.home);

    // Sync navigation sidebar buttons with available sections (hides empty/deleted sections like journey)
    const activeSectionIds = new Set(SECTIONS.map(s => s.id));
    activeSectionIds.add('home');
    const allNavButtons = document.querySelectorAll('.nav-item-btn');
    if (allNavButtons && allNavButtons.forEach) {
      allNavButtons.forEach(btn => {
        const secId = btn.dataset ? btn.dataset.sectionId : null;
        const li = btn.closest ? btn.closest('.nav-li') : null;
        if (li && secId) {
          li.style.display = activeSectionIds.has(secId) ? '' : 'none';
        }
      });
    }

    // Safeguard index boundaries if number of pages changed
    if (BOOK_SPREADS.length > 0 && currentSpreadIndex >= BOOK_SPREADS.length) {
      currentSpreadIndex = Math.max(0, BOOK_SPREADS.length - 1);
    }
    if (MOBILE_PAGES.length > 0 && currentMobileIndex >= MOBILE_PAGES.length) {
      currentMobileIndex = Math.max(0, MOBILE_PAGES.length - 1);
    }
  }

  function safeRenderAfterUpdate() {
    if (isTransitioning) {
      setTimeout(() => renderCurrentState(), FLIP_ANIMATION_MS + 60);
    } else {
      renderCurrentState();
    }
  }

  // 1. Immediately initialize with synchronous local data (0ms delay)
  // This allows the DOM structure, state model, and all click/arrow handlers to attach instantly.
  let currentPortfolioData = getSynchronousPortfolioData(isPreviewMode);
  let SECTIONS = [];
  let BOOK_SPREADS = [];
  let DESKTOP_SECTION_MAP = {};
  let MOBILE_PAGES = [];
  let MOBILE_SECTION_MAP = {};
  applyPortfolioData(currentPortfolioData);

  // 2. Load cloud Firestore data asynchronously with loading indicator & retry on failure
  function loadCloudPortfolio() {
    if (!window.portfolioService) return;

    const flipperPill = document.getElementById('pageFlipperPill');
    const flipperMsg = document.getElementById('flipperStatusMsg');

    if (flipperPill && flipperMsg) {
      flipperPill.style.display = 'flex';
      flipperMsg.innerHTML = '<span class="flipper-sync-text">Synchronizing portfolio&hellip;</span>';
    }

    window.portfolioService.getPublicPortfolioData(isPreviewMode).then(data => {
      if (!data) return;
      applyPortfolioData(data);
      safeRenderAfterUpdate();
      // If still on closed cover, hide the sync pill
      if (currentSpreadIndex === 0 && currentMobileIndex === 0) {
        const pill = document.getElementById('pageFlipperPill');
        if (pill) pill.style.display = 'none';
      }
    }).catch(err => {
      console.warn('Portfolio sync warning:', err);
      const pill = document.getElementById('pageFlipperPill');
      const msg = document.getElementById('flipperStatusMsg');
      if (pill && msg) {
        pill.style.display = 'flex';
        msg.innerHTML = '<span style="color:#f28b82;">Connection issue</span> <button id="btnRetrySync" style="background:transparent; border:1px solid #d4af37; color:#d4af37; border-radius:3px; padding:1px 6px; margin-left:6px; cursor:pointer; font-size:11px;">Retry</button>';
        const btnRetry = document.getElementById('btnRetrySync');
        if (btnRetry) {
          btnRetry.addEventListener('click', (e) => {
            e.stopPropagation();
            loadCloudPortfolio();
          });
        }
      }
    });
  }

  loadCloudPortfolio();

  // Listen for real-time data changes from Admin
  if (window.portfolioService) {
    window.portfolioService.on('data:changed', (newData) => {
      const pending = window.portfolioService.getPublicPortfolioData(isPreviewMode);
      if (pending instanceof Promise) {
        pending.then(data => {
          applyPortfolioData(data);
          safeRenderAfterUpdate();
        });
      }
    });
  }

  function isMobileViewport() {
    return window.innerWidth <= 768;
  }

  // DOM Elements
  const bookVolumeAssembly = document.getElementById('bookVolumeAssembly');
  const closedBookStructure = document.getElementById('closedBookStructure');
  const openBookSpread = document.getElementById('openBookSpread');
  const bookCoverFace = document.getElementById('bookCoverFace');

  // Desktop Slots
  const leftChapterTag = document.getElementById('leftChapterTag');
  const leftSectionTitle = document.getElementById('leftSectionTitle');
  const leftPageNum = document.getElementById('leftPageNum');
  const leftContentBody = document.getElementById('leftContentBody');
  const leftFolioTag = document.getElementById('leftFolioTag');
  const rightChapterTag = document.getElementById('rightChapterTag');
  const rightSectionTitle = document.getElementById('rightSectionTitle');
  const rightPageNum = document.getElementById('rightPageNum');
  const rightContentBody = document.getElementById('rightContentBody');
  const rightFolioTag = document.getElementById('rightFolioTag');
  const zoneLeftClick = document.getElementById('zoneLeftClick');
  const zoneRightClick = document.getElementById('zoneRightClick');
  const flippingLeaf = document.getElementById('flippingLeaf');

  // Mobile Jotter Slots
  const mobileChapterTag = document.getElementById('mobileChapterTag');
  const mobileSectionTitle = document.getElementById('mobileSectionTitle');
  const mobilePageNum = document.getElementById('mobilePageNum');
  const mobileHeadline = document.getElementById('mobileHeadline');
  const mobileCaption = document.getElementById('mobileCaption');
  const mobileTurnTab = document.getElementById('mobileTurnTab');
  const mobileZonePrev = document.getElementById('mobileZonePrev');
  const mobileZoneNext = document.getElementById('mobileZoneNext');
  const mobileFlippingLeaf = document.getElementById('mobileFlippingLeaf');
  const mobileContentCanvas = document.getElementById('mobileContentCanvas');

  // Navigation & Controls
  const navSidebar = document.getElementById('navSidebar');
  const drawerBackdrop = document.getElementById('drawerBackdrop');
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const navButtons = document.querySelectorAll('.nav-item-btn');
  const arrowPrev = document.getElementById('arrowPrev');
  const arrowNext = document.getElementById('arrowNext');
  const pageFlipperPill = document.getElementById('pageFlipperPill');
  const flipperStatusMsg = document.getElementById('flipperStatusMsg');

  // ==========================================================================
  // 3. Dynamic Page Body Renderer
  // ==========================================================================

  function renderEditorialSealHTML(isMobile = false) {
    return `
      <div class="editorial-seal-plate">
        <svg class="seal-embossed-shield" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <circle cx="12" cy="10" r="2.5"/>
          <path d="M12 13.5v3"/>
        </svg>
        <div class="seal-legend">SAMUEL MERCY OLUWATOBI</div>
        <div class="seal-rule" aria-hidden="true"></div>
        <div class="seal-quote">&ldquo;Code is my craft. Automation is my weapon. Security is my priority.&rdquo;</div>
      </div>
    `;
  }

  function renderAboutEditorialPageHTML(pageData, isMobile = false) {
    if (!pageData) return '';

    const subtitle = pageData.subtitle ? escapeHTML(pageData.subtitle.trim()) : '';
    const heading = (pageData.heading || pageData.title) ? escapeHTML((pageData.heading || pageData.title).trim()) : '';
    const bodyText = pageData.bodyText ? pageData.bodyText.trim() : '';
    const supportingInfo = pageData.supportingInfo ? pageData.supportingInfo.trim() : '';
    const mediaUrl = pageData.mediaUrl ? escapeHTML(pageData.mediaUrl.trim()) : '';

    const hasAnyContent = !!(subtitle || heading || bodyText || supportingInfo || mediaUrl);
    if (!hasAnyContent) {
      return `
        <div class="about-editorial-story">
          <header class="about-story-header">
            <span class="about-story-kicker">CHAPTER I &bull; PROLOGUE</span>
            <h2 class="about-story-heading">Samuel Mercy Oluwatobi</h2>
            <div class="about-story-divider" aria-hidden="true">
              <span class="story-flourish-bar"></span>
              <span class="story-flourish-gem">✦</span>
              <span class="story-flourish-bar"></span>
            </div>
          </header>
          <div class="editorial-seal-plate" style="margin-top: 18px;">
            <svg class="seal-embossed-shield" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M12 8v4"/>
              <path d="M12 16h.01"/>
            </svg>
            <div class="seal-legend">IDENTITY &amp; PURPOSE</div>
            <div class="seal-rule" aria-hidden="true"></div>
            <div class="seal-quote">&ldquo;The chronicle of craft, engineering rigor, and digital architecture begins here.&rdquo;</div>
          </div>
        </div>
      `;
    }

    // Split bodyText into paragraphs
    let bodyParagraphsHTML = '';
    if (bodyText) {
      const paragraphs = bodyText.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
      if (paragraphs.length === 0 && bodyText) {
        paragraphs.push(bodyText);
      }
      bodyParagraphsHTML = paragraphs.map((p, idx) => {
        const isFirst = (idx === 0);
        const pClass = isFirst ? 'about-story-lead' : '';
        const formatted = escapeHTML(p).replace(/\n/g, '<br>');
        return `<p class="${pClass}">${formatted}</p>`;
      }).join('');
    }

    // Gilded tipped-in portrait casing
    let portraitHTML = '';
    if (mediaUrl) {
      const noBodyClass = !bodyText ? ' no-body-portrait' : '';
      portraitHTML = `
        <figure class="about-portrait-vignette${noBodyClass}">
          <div class="portrait-gilded-casing">
            <img src="${mediaUrl}" alt="Samuel Mercy Oluwatobi Portrait" class="about-portrait-img" loading="lazy" />
            <div class="portrait-specular-sheen" aria-hidden="true"></div>
          </div>
        </figure>
      `;
    }

    // Supporting Highlight callout plaque
    let supportingHTML = '';
    if (supportingInfo) {
      supportingHTML = `
        <aside class="about-story-highlight">
          <span class="highlight-ornament" aria-hidden="true">❖</span>
          <div class="highlight-text-content">${escapeHTML(supportingInfo).replace(/\n/g, '<br>')}</div>
        </aside>
      `;
    }

    return `
      <div class="about-editorial-story">
        <header class="about-story-header">
          ${subtitle ? `<span class="about-story-kicker">${subtitle}</span>` : ''}
          ${heading ? `<h2 class="about-story-heading">${heading}</h2>` : ''}
          <div class="about-story-divider" aria-hidden="true">
            <span class="story-flourish-bar"></span>
            <span class="story-flourish-gem">✦</span>
            <span class="story-flourish-bar"></span>
          </div>
        </header>

        <div class="about-story-narrative-container">
          ${portraitHTML}
          ${bodyParagraphsHTML ? `<div class="about-story-text-flow">${bodyParagraphsHTML}</div>` : ''}
          ${supportingHTML}
        </div>

        <div class="about-story-tail" aria-hidden="true">❖ &nbsp; ❖ &nbsp; ❖</div>
      </div>
    `;
  }

  function normalizeUrl(url) {
    if (!url || typeof url !== 'string') return '';
    const trimmed = url.trim();
    if (!trimmed) return '';
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
      return trimmed;
    }
    return 'https://' + trimmed;
  }

  function renderSkillsPageHTML(pageData, isMobile = false) {
    if (!pageData || pageData.isEmpty || pageData.isSealPlate || (!pageData.groups && (!pageData.items || pageData.items.length === 0))) {
      return `
        <div class="skills-editorial-flow skills-seal-wrapper">
          <div class="editorial-seal-plate" style="margin: auto 0;">
            <svg class="seal-embossed-shield" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polygon points="12 2 2 7 12 12 22 7 12 2"/>
              <polyline points="2 17 12 22 22 17"/>
              <polyline points="2 12 12 17 22 12"/>
            </svg>
            <div class="seal-legend">TECHNICAL ARSENAL</div>
            <div class="seal-rule" aria-hidden="true"></div>
            <div class="seal-quote">&ldquo;Specialized disciplines across cloud architecture, security operations, and autonomous systems.&rdquo;</div>
          </div>
        </div>
      `;
    }

    const groups = (pageData.groups && pageData.groups.length > 0)
      ? pageData.groups
      : groupSkillsIntoCategories(pageData.items || []);

    return `
      <div class="skills-editorial-flow" id="skillsEditorialFlow-${pageData.pageNum || 1}">
        ${groups.map(grp => {
          const theme = grp.theme || getSkillTheme(grp.category);
          const skills = grp.skills || [];

          return `
            <section class="skill-category-group skill-theme-${escapeHTML(theme.key)}" data-category="${escapeHTML(grp.category)}">
              <!-- Category Header with Distinct Accent -->
              <header class="skill-category-group-header">
                <div class="skill-category-header-title">
                  <span class="skill-category-icon-box" style="color: ${theme.accentColor};" aria-hidden="true">
                    ${theme.iconSvg}
                  </span>
                  <span class="skill-category-title-text" style="color: ${theme.accentColor};">
                    ${escapeHTML((grp.category || 'Specialized Discipline').toUpperCase())}
                  </span>
                  <span class="skill-category-count-badge" style="color: ${theme.accentColor}; background: ${theme.badgeBg}; border-color: ${theme.badgeBorder};">
                    ${skills.length} ${skills.length === 1 ? 'DISCIPLINE' : 'DISCIPLINES'}
                  </span>
                </div>
                <div class="skill-category-accent-rule" style="background: ${theme.ruleGradient};" aria-hidden="true"></div>
              </header>

              <!-- Category Skill Entries -->
              <div class="skill-category-entries-list">
                ${skills.map((s, sIdx) => {
                  const sName = s.name || s.title || 'Technical Discipline';
                  const rawLevel = (s.level !== undefined && s.level !== null) ? s.level : s.proficiency;
                  const sLevel = rawLevel ? String(rawLevel).trim() : '';
                  const sDesc = (s.description || s.context || s.desc || '').trim();
                  const sTools = Array.isArray(s.tools)
                    ? s.tools
                    : (typeof s.tools === 'string' && s.tools.trim()
                        ? s.tools.split(/[,•|]/).map(t => ({ name: t.trim(), imageUrl: '' })).filter(t => t.name)
                        : []);

                  return `
                    <article class="skill-entry-card" id="skillEntry-${escapeHTML(s.id || `s-${sIdx}`)}" data-skill-id="${escapeHTML(s.id || '')}">
                      <!-- Headline & Proficiency / Focus Row -->
                      <div class="skill-entry-headline-row">
                        <div class="skill-name-wrap">
                          <span class="skill-meta-caption">SKILL NAME</span>
                          <div class="skill-name-title-row">
                            <span class="skill-entry-gem" style="color: ${theme.accentColor};" aria-hidden="true">✦</span>
                            <h3 class="skill-name-headline">${escapeHTML(sName)}</h3>
                          </div>
                        </div>
                        ${sLevel ? `
                          <div class="skill-proficiency-container">
                            <span class="skill-meta-caption">PROFICIENCY / FOCUS</span>
                            <span class="skill-proficiency-badge-value" style="color: ${theme.accentColor}; background: ${theme.badgeBg}; border-color: ${theme.badgeBorder};">
                              ${escapeHTML(sLevel)}
                            </span>
                          </div>
                        ` : ''}
                      </div>

                      <!-- Context / Details (Gracefully omitted if empty) -->
                      ${sDesc ? `
                        <div class="skill-context-container">
                          <span class="skill-meta-caption">CONTEXT &amp; APPLICATION</span>
                          <div class="skill-context-prose">${escapeHTML(sDesc).replace(/\n\n+/g, '</p><p style="margin-top:6px;">').replace(/\n/g, '<br>')}</div>
                        </div>
                      ` : ''}

                      <!-- Tools & Technologies (Rendered if tools present) -->
                      ${sTools.length > 0 ? `
                        <div class="skill-tools-container">
                          <span class="skill-meta-caption">TOOLS &amp; TECHNOLOGIES</span>
                          <div class="skill-tools-cluster">
                            ${sTools.map(t => {
                              const tName = typeof t === 'string' ? t.trim() : (t.name || '').trim();
                              const tImg = typeof t === 'object' ? (t.imageUrl || '').trim() : '';
                              if (!tName) return '';
                              return `
                                <span class="skill-tool-badge" style="border-color: ${theme.badgeBorder};">
                                  ${tImg ? `<img src="${escapeHTML(tImg)}" alt="${escapeHTML(tName)}" class="skill-tool-icon" loading="lazy" />` : ''}
                                  <span class="skill-tool-name">${escapeHTML(tName)}</span>
                                </span>
                              `;
                            }).filter(Boolean).join('')}
                          </div>
                        </div>
                      ` : ''}

                      ${sIdx < skills.length - 1 ? `<hr class="editorial-skill-divider" />` : ''}
                    </article>
                  `;
                }).join('')}
              </div>
            </section>
          `;
        }).join('')}
      </div>
    `;
  }

  const CATEGORY_META = {
    'Web Development': {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
      tagline: 'Modern Web Applications, High-Performance Frontends & Scalable Backends'
    },
    'DevOps & Cloud': {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>`,
      tagline: 'Cloud Infrastructure, CI/CD Automated Pipelines & Container Orchestration'
    },
    'Cybersecurity': {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
      tagline: 'Threat Assessment, Security Hardening, Identity Management & Compliance'
    },
    'IT Automation with Python': {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
      tagline: 'System Administration Scripts, ETL Workflows & Automated Tooling'
    },
    'AI Automation': {
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>`,
      tagline: 'Intelligent Agents, Autonomous Systems & Cognitive Process Automation'
    }
  };

  function renderProjectsPortalHTML(pageData, isMobile = false) {
    const activeCategories = pageData.activeCategories || [];
    const projectsByCategory = pageData.projectsByCategory || {};
    const allProjects = pageData.allPublishedProjects || [];

    return `
      <div class="projects-portal-container" id="projectsPortalContainer">
        <header class="portal-header">
          <span class="portal-kicker">CURATED REPOSITORIES &amp; ARCHITECTURES</span>
          <h2 class="portal-headline">Engineering Archives</h2>
          <div class="project-flourish-divider" aria-hidden="true" style="margin: 3px auto 6px auto; max-width: 180px;">
            <span class="story-flourish-bar"></span>
            <span class="story-flourish-gem">✦</span>
            <span class="story-flourish-bar"></span>
          </div>
          <div class="portal-subtext">Explore projects by discipline, technology, or architecture.</div>
        </header>

        <!-- Polished Search & Filter Suite -->
        <div class="project-search-container">
          <div class="project-search-input-wrap">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              class="project-search-input" 
              id="portalSearchInput" 
              placeholder="Search projects, technologies, or architectures..." 
              autocomplete="off"
              spellcheck="false"
            />
            <button type="button" class="project-search-clear" id="portalSearchClear" style="display: none;" title="Clear search">&times;</button>
          </div>

          <!-- Filter Chips Row -->
          <div class="project-filter-chips-row" id="portalFilterChipsRow">
            <button type="button" class="project-filter-chip active" data-filter-category="ALL">
              ALL (${allProjects.length})
            </button>
            ${activeCategories.map(cat => {
              const count = (projectsByCategory[cat] || []).length;
              return `
                <button type="button" class="project-filter-chip" data-filter-category="${escapeHTML(cat)}">
                  ${escapeHTML(cat)} (${count})
                </button>
              `;
            }).join('')}
          </div>

          <!-- Live Search Results Container (Populated dynamically on input) -->
          <div class="project-search-results" id="portalSearchResults" style="display: none;"></div>
        </div>

        <!-- Category Plaques Shelf (Only active published categories shown!) -->
        <div class="portal-categories-shelf" id="portalCategoriesShelf">
          ${activeCategories.map(cat => {
            const catProjects = projectsByCategory[cat] || [];
            const meta = CATEGORY_META[cat] || {
              icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/></svg>`,
              tagline: 'Engineering case studies and production deployments'
            };
            const previewTitles = catProjects.slice(0, 3).map(p => escapeHTML(p.title || 'Project')).join(' • ');

            return `
              <div class="category-plaque-card" data-category-target="${escapeHTML(cat)}" role="button" tabindex="0">
                <div class="plaque-details">
                  <div class="plaque-title-row">
                    <span class="plaque-icon-box" style="display: inline-flex; width: 16px; height: 16px; color: #783d09;">
                      ${meta.icon}
                    </span>
                    <span class="plaque-title">${escapeHTML(cat)}</span>
                    <span class="plaque-count-badge">${catProjects.length} ${catProjects.length === 1 ? 'CASE STUDY' : 'CASE STUDIES'}</span>
                  </div>
                  <div class="plaque-desc">${escapeHTML(meta.tagline)}</div>
                  ${previewTitles ? `<div class="plaque-previews" style="font-family: var(--font-serif-body); font-size: 11.5px; color: #785304; font-style: italic; margin-top: 2px;">Featuring: ${previewTitles}${catProjects.length > 3 ? '...' : ''}</div>` : ''}
                </div>
                <div class="btn-plaque-explore">
                  EXPLORE &rarr;
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function renderProjectsPageHTML(pageData, isMobile = false) {
    if (!pageData || !pageData.items || pageData.items.length === 0) {
      return `
        <div class="project-case-study">
          <div class="editorial-seal-plate" style="margin: auto 0;">
            <svg class="seal-embossed-shield" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            <div class="seal-legend">SYSTEMS ARCHITECTURE</div>
            <div class="seal-rule" aria-hidden="true"></div>
            <div class="seal-quote">&ldquo;Engineered systems, automated delivery pipelines, and hardened cloud deployments.&rdquo;</div>
          </div>
        </div>
      `;
    }

    const p = pageData.items[0];
    const pTitle = p.title || p.name || 'Featured Project';
    const pCategory = pageData.category || p.category || 'Web Development';
    const pType = (p.projectType && typeof p.projectType === 'string') ? p.projectType.trim() : (p.projectType || '');
    const catIdx = pageData.categoryProjectIndex || 1;
    const catTotal = pageData.totalCategoryProjects || 1;

    const live = normalizeUrl(p.liveUrl || p.liveSiteUrl || p.url);
    const github = normalizeUrl(p.githubUrl || p.repoUrl);
    const demo = normalizeUrl(p.videoUrl || p.demoUrl);
    const hasActions = !!(live || github || demo);

    // Technologies Badges (Prominent, polished styling)
    let techBadgesHTML = '';
    const rawTech = p.technologies || p.techStack || p.tech;
    if (rawTech) {
      const techList = Array.isArray(rawTech) 
        ? rawTech 
        : String(rawTech).split(/[,•|]/).map(t => t.trim()).filter(Boolean);
      techBadgesHTML = techList.map(t => `<span class="tech-tag-badge">${escapeHTML(t)}</span>`).join('');
    }

    // Skills Demonstrated Badges
    let skillsBadgesHTML = '';
    if (p.skillsDemonstrated) {
      const skillsList = Array.isArray(p.skillsDemonstrated)
        ? p.skillsDemonstrated
        : String(p.skillsDemonstrated).split(/[,•|]/).map(s => s.trim()).filter(Boolean);
      skillsBadgesHTML = skillsList.map(s => `<span class="tech-tag-badge" style="background: rgba(43, 8, 15, 0.08); border-color: rgba(140, 95, 35, 0.5);">${escapeHTML(s)}</span>`).join('');
    }

    // Adaptive Image Presentation
    let imageHTML = '';
    const imgUrl = p.imageUrl || p.mediaUrl;
    if (imgUrl) {
      const isVertical = p.imageOrientation === 'vertical' || (imgUrl.includes('portrait') || imgUrl.includes('vert'));
      if (isVertical) {
        imageHTML = `
          <div class="project-image-vertical-wrapper cert-clickable-img" data-img-url="${escapeHTML(imgUrl)}" data-caption="${escapeHTML(pTitle)} Architecture" role="button" tabindex="0" title="Click to enlarge architecture diagram">
            <div class="portrait-gilded-casing">
              <img src="${escapeHTML(imgUrl)}" alt="${escapeHTML(pTitle)} Architecture Diagram" class="project-img-portrait" loading="lazy" />
              <div class="cert-zoom-cue" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke-width="2.2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                <span>ENLARGE ARCHITECTURE</span>
              </div>
            </div>
          </div>
        `;
      } else {
        imageHTML = `
          <div class="project-image-horizontal-wrapper cert-clickable-img" data-img-url="${escapeHTML(imgUrl)}" data-caption="${escapeHTML(pTitle)} Architecture" role="button" tabindex="0" title="Click to enlarge architecture diagram">
            <div class="project-image-frame">
              <img src="${escapeHTML(imgUrl)}" alt="${escapeHTML(pTitle)} Architecture Diagram" class="project-img-wide" loading="lazy" />
              <div class="cert-zoom-cue" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke-width="2.2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                <span>ENLARGE ARCHITECTURE</span>
              </div>
            </div>
          </div>
        `;
      }
    }

    // Structured Overview
    const overviewText = p.description || p.shortDesc || p.summary || '';
    
    // Key Engineering Highlights (Bulleted)
    const keyFeaturesRaw = p.keyFeatures || '';
    let keyFeaturesList = [];
    if (Array.isArray(keyFeaturesRaw)) {
      keyFeaturesList = keyFeaturesRaw;
    } else if (typeof keyFeaturesRaw === 'string' && keyFeaturesRaw.trim()) {
      keyFeaturesList = keyFeaturesRaw
        .split(/\n|•|\r/)
        .map(f => f.trim().replace(/^[-*•]\s*/, ''))
        .filter(Boolean);
    }

    // Architecture & Specs
    const archSummary = p.architectureSummary || '';
    const specsContent = p.specifications || p.detailedDesc || '';

    return `
      <article class="project-case-study" id="projectCaseStudy-${escapeHTML(p.id || 'curr')}">
        <!-- Top Meta Navigation Row: Category Pill -->
        <div class="project-top-meta-row">
          <span class="project-category-pill">
            ${escapeHTML(pCategory)} &bull; ${catIdx} OF ${catTotal}
          </span>
        </div>

        <!-- Case Header: Distinctly Labeled Project Title & Project Type -->
        <header class="project-case-header">
          <div class="project-title-group">
            <span class="project-header-label">PROJECT TITLE</span>
            <h2 class="project-title-headline">${escapeHTML(pTitle)}</h2>
          </div>

          ${pType ? `
            <div class="project-type-group">
              <span class="project-header-label">PROJECT TYPE</span>
              <div class="project-type-value">${escapeHTML(pType)}</div>
            </div>
          ` : ''}

          <div class="project-flourish-divider" aria-hidden="true">
            <span class="story-flourish-bar"></span>
            <span class="story-flourish-gem">✦</span>
            <span class="story-flourish-bar"></span>
          </div>
        </header>

        <!-- Technologies / Tools Badges -->
        ${(techBadgesHTML || skillsBadgesHTML) ? `
          <div class="project-section-block">
            <span class="project-field-label">TECHNOLOGIES &amp; PROFICIENCIES</span>
            <hr class="editorial-section-rule" />
            <div class="project-tech-cluster">
              ${techBadgesHTML}
              ${skillsBadgesHTML}
            </div>
          </div>
        ` : ''}

        <!-- Adaptive Image (Horizontal Wide or Floated Portrait) -->
        ${imageHTML}

        <!-- Narrative Container: Overview, Key Features, Architecture, Specs -->
        <div class="project-narrative-container">
          ${overviewText ? `
            <div class="project-section-block">
              <span class="project-field-label">PROJECT OVERVIEW</span>
              <hr class="editorial-section-rule" />
              <div class="project-overview-content">${escapeHTML(overviewText).replace(/\n\n/g, '</p><p style="margin-top:6px;">').replace(/\n/g, '<br>')}</div>
            </div>
          ` : ''}

          ${keyFeaturesList.length > 0 ? `
            <div class="project-section-block">
              <span class="project-field-label">KEY ENGINEERING HIGHLIGHTS</span>
              <hr class="editorial-section-rule" />
              <ul class="project-features-list">
                ${keyFeaturesList.map(feat => `
                  <li class="project-feature-item">
                    <span class="feature-bullet-gem">✦</span>
                    <span>${escapeHTML(feat)}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
          ` : ''}

          ${archSummary ? `
            <div class="project-section-block">
              <span class="project-field-label">TECHNICAL APPROACH &amp; INFRASTRUCTURE</span>
              <hr class="editorial-section-rule" />
              <div class="project-arch-content">${escapeHTML(archSummary).replace(/\n\n/g, '</p><p style="margin-top:6px;">').replace(/\n/g, '<br>')}</div>
            </div>
          ` : ''}

          ${specsContent ? `
            <div class="project-section-block">
              <span class="project-field-label">DETAILED SPECIFICATIONS</span>
              <hr class="editorial-section-rule" />
              <div class="project-specs-callout">
                <div class="specs-editorial-content">${escapeHTML(specsContent).replace(/\n/g, '<br>')}</div>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Action Buttons Row -->
        ${hasActions ? `
          <div class="project-section-block project-actions-section">
            <span class="project-field-label">PROJECT LINKS &amp; DEMOS</span>
            <hr class="editorial-section-rule" />
            <div class="project-actions-row">
              ${live ? `
                <a href="${escapeHTML(live)}" target="_blank" rel="noopener noreferrer" class="btn-book-action">
                  <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  VIEW LIVE SITE
                </a>
              ` : ''}
              ${github ? `
                <a href="${escapeHTML(github)}" target="_blank" rel="noopener noreferrer" class="btn-book-action">
                  <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                  VIEW GITHUB
                </a>
              ` : ''}
              ${demo ? `
                <a href="${escapeHTML(demo)}" target="_blank" rel="noopener noreferrer" class="btn-book-action">
                  <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  WATCH DEMO
                </a>
              ` : ''}
            </div>
          </div>
        ` : ''}
      </article>
    `;
  }

  async function navigateToCategorySpread(categoryName) {
    if (isTransitioning) return;
    if (isMobileViewport()) {
      const targetIdx = MOBILE_PAGES.findIndex(mp => mp.pageData && mp.pageData.type === 'projects' && mp.pageData.category === categoryName);
      if (targetIdx !== -1) {
        if (currentMobileIndex === 0) await openBook();
        renderMobilePage(targetIdx);
      }
    } else {
      const targetIdx = BOOK_SPREADS.findIndex(sp => 
        (sp.leftPage && sp.leftPage.type === 'projects' && sp.leftPage.category === categoryName) ||
        (sp.rightPage && sp.rightPage.type === 'projects' && sp.rightPage.category === categoryName)
      );
      if (targetIdx !== -1) {
        if (currentSpreadIndex === 0) await openBook();
        renderDesktopSpread(targetIdx);
      }
    }
  }

  async function navigateToProjectSpread(projectId) {
    if (isTransitioning) return;
    if (isMobileViewport()) {
      const targetIdx = MOBILE_PAGES.findIndex(mp => 
        mp.pageData && mp.pageData.type === 'projects' && mp.pageData.items && mp.pageData.items[0] && mp.pageData.items[0].id === projectId
      );
      if (targetIdx !== -1) {
        if (currentMobileIndex === 0) await openBook();
        renderMobilePage(targetIdx);
      }
    } else {
      const targetIdx = BOOK_SPREADS.findIndex(sp => 
        (sp.leftPage && sp.leftPage.type === 'projects' && sp.leftPage.items && sp.leftPage.items[0] && sp.leftPage.items[0].id === projectId) ||
        (sp.rightPage && sp.rightPage.type === 'projects' && sp.rightPage.items && sp.rightPage.items[0] && sp.rightPage.items[0].id === projectId)
      );
      if (targetIdx !== -1) {
        if (currentSpreadIndex === 0) await openBook();
        renderDesktopSpread(targetIdx);
      }
    }
  }

  async function navigateToProjectsPortal() {
    await navigateToSection('projects');
  }

  // ==========================================================================
  // JOURNEY — Render functions
  // ==========================================================================

  function renderJourneyTimelineHTML(pageData, isMobile = false) {
    // Empty state
    if (pageData.isEmpty || !pageData.allItems || pageData.allItems.length === 0) {
      return `
        <div class="journey-timeline-flow">
          <div class="editorial-seal-plate" style="margin: auto 0;">
            <svg class="seal-embossed-shield" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <div class="seal-legend">JOURNEY ARCHIVE</div>
            <div class="seal-rule" aria-hidden="true"></div>
            <div class="seal-quote">&ldquo;Every milestone is a chapter in the story of who you are becoming.&rdquo;</div>
          </div>
        </div>
      `;
    }

    const allItems = pageData.allItems;
    const activeIdx = pageData.activeIndex || 0;

    const milestoneTypeIconMap = {
      'Education': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
      'Learning': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
      'Award': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>`,
      'Project Milestone': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
      'Professional Experience': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
      'Team Experience': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
      'Future Goal': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>`
    };
    const defaultIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;

    const statusColorMap = { 'Completed': '#6a4c11', 'In Progress': '#3b5e2a', 'Upcoming': '#1a3a5c' };

    const itemsHTML = allItems.map((item, i) => {
      const isActive = i === activeIdx;
      const typeIcon = milestoneTypeIconMap[item.milestoneType] || defaultIcon;
      const period = item.period || '';
      const mType = item.milestoneType || 'Milestone';
      const status = item.milestoneStatus || item.status || '';
      const isLast = i === allItems.length - 1;
      const statusColor = statusColorMap[status] || '#6a4c11';

      return `
        <div class="journey-timeline-entry${isActive ? ' jt-active' : ''}" data-idx="${i}">
          <div class="jt-node-column">
            <div class="jt-node-dot${isActive ? ' jt-node-active' : ''}">
              <div class="jt-node-icon">${typeIcon}</div>
            </div>
            ${!isLast ? '<div class="jt-connector-line"></div>' : ''}
          </div>
          <div class="jt-entry-content">
            <div class="jt-meta-row">
              <span class="jt-type-label">${escapeHTML(mType.toUpperCase())}</span>
              ${period ? `<span class="jt-period-tag">${escapeHTML(period)}</span>` : ''}
              ${status ? `<span class="jt-status-badge" style="background: ${statusColor}20; color: ${statusColor}; border-color: ${statusColor}40;">${escapeHTML(status)}</span>` : ''}
            </div>
            <div class="jt-entry-title">${escapeHTML(item.title || 'Milestone')}</div>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="journey-timeline-flow${isMobile ? ' journey-timeline-mobile' : ''}">
        <div class="journey-timeline-header">
          <div class="journey-tl-chapter-label">CHAPTER VI</div>
          <h2 class="journey-tl-section-title">MY JOURNEY</h2>
          <div class="journey-tl-rule-wrap" aria-hidden="true">
            <span class="story-flourish-bar"></span>
            <span class="story-flourish-gem">✦</span>
            <span class="story-flourish-bar"></span>
          </div>
          <p class="journey-tl-descriptor">A chronological record of growth, learning, and achievement</p>
        </div>
        <div class="journey-timeline-list">
          ${itemsHTML}
        </div>
      </div>
    `;
  }

  function renderJourneyDetailHTML(pageData, isMobile = false) {
    if (!pageData.item) {
      return renderEditorialSealHTML(isMobile);
    }

    const j = pageData.item;
    const title = j.title || 'Milestone';
    const period = j.period || '';
    const mType = j.milestoneType || 'Milestone';
    const story = j.story || j.description || '';
    const achievement = j.achievement || j.achievements || '';
    const learned = j.learned || '';
    const nextSteps = j.nextSteps || '';
    const imageUrl = j.imageUrl || j.mediaUrl || '';
    const relatedLink = j.relatedLink || j.link || j.linkUrl || '';
    const relatedLinkLabel = j.relatedLinkLabel || 'RELATED LINK';
    const milestoneStatus = j.milestoneStatus || '';
    const idx = pageData.milestoneIndex || 0;
    const total = pageData.totalMilestones || 1;

    const statusColorMap = { 'Completed': '#6a4c11', 'In Progress': '#3b5e2a', 'Upcoming': '#1a3a5c' };
    const statusColor = statusColorMap[milestoneStatus] || '#6a4c11';

    const normalizedLink = relatedLink && !relatedLink.startsWith('http') ? 'https://' + relatedLink : relatedLink;

    return `
      <article class="journey-detail-flow${isMobile ? ' journey-detail-mobile' : ''}">
        <!-- Header: milestone counter + type badge -->
        <div class="journey-detail-top-row">
          <span class="journey-detail-counter">MILESTONE ${idx + 1} OF ${total}</span>
          <span class="journey-detail-type-pill">${escapeHTML(mType.toUpperCase())}</span>
          ${milestoneStatus ? `<span class="journey-detail-status-pill" style="background: ${statusColor}18; color: ${statusColor}; border-color: ${statusColor}38;">${escapeHTML(milestoneStatus)}</span>` : ''}
        </div>

        <!-- Milestone title + period -->
        <div class="journey-detail-title-block">
          <div class="journey-detail-heading-label">MILESTONE</div>
          <div class="journey-detail-heading-rule" aria-hidden="true"></div>
          <h2 class="journey-detail-title">${escapeHTML(title)}</h2>
          ${period ? `<div class="journey-detail-period">◆ ${escapeHTML(period)}</div>` : ''}
        </div>

        <!-- Optional image -->
        ${imageUrl ? `
          <div class="journey-detail-image-wrap">
            <img src="${escapeHTML(imageUrl)}" alt="${escapeHTML(title)}" class="journey-detail-image" loading="lazy" />
          </div>
        ` : ''}

        <!-- The Story -->
        ${story ? `
          <div class="journey-detail-section">
            <div class="journey-detail-section-label">THE STORY</div>
            <div class="journey-detail-section-rule" aria-hidden="true"></div>
            <div class="journey-detail-body-text">${escapeHTML(story).replace(/\n\n+/g, '</p><p class="journey-body-para">').replace(/\n/g, '<br>')}</div>
          </div>
        ` : ''}

        <!-- Key Achievement -->
        ${achievement ? `
          <div class="journey-detail-section">
            <div class="journey-detail-section-label">KEY ACHIEVEMENT</div>
            <div class="journey-detail-section-rule" aria-hidden="true"></div>
            <div class="journey-detail-callout-box">
              <div class="journey-callout-gem" aria-hidden="true">✦</div>
              <div class="journey-callout-text">${escapeHTML(achievement).replace(/\n/g, '<br>')}</div>
            </div>
          </div>
        ` : ''}

        <!-- What I Learned -->
        ${learned ? `
          <div class="journey-detail-section">
            <div class="journey-detail-section-label">WHAT I LEARNED</div>
            <div class="journey-detail-section-rule" aria-hidden="true"></div>
            <div class="journey-detail-body-text">${escapeHTML(learned).replace(/\n/g, '<br>')}</div>
          </div>
        ` : ''}

        <!-- Next Steps -->
        ${nextSteps ? `
          <div class="journey-detail-section">
            <div class="journey-detail-section-label">NEXT STEPS</div>
            <div class="journey-detail-section-rule" aria-hidden="true"></div>
            <div class="journey-detail-body-text">${escapeHTML(nextSteps).replace(/\n/g, '<br>')}</div>
          </div>
        ` : ''}

        <!-- Related Link -->
        ${relatedLink ? `
          <div class="journey-detail-link-row">
            <a href="${escapeHTML(normalizedLink)}" target="_blank" rel="noopener noreferrer" class="btn-book-action journey-link-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              ${escapeHTML(relatedLinkLabel)}
            </a>
          </div>
        ` : ''}
      </article>
    `;
  }

  function renderCertificatesPageHTML(pageData, isMobile = false) {
    if (!pageData || !pageData.items || pageData.items.length === 0) {
      return `
        <div class="certificate-showcase">
          <div class="editorial-seal-plate" style="margin: auto 0;">
            <svg class="seal-embossed-shield" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <polyline points="9 12 11 14 15 10"/>
            </svg>
            <div class="seal-legend">CREDENTIAL ARCHIVE</div>
            <div class="seal-rule" aria-hidden="true"></div>
            <div class="seal-quote">&ldquo;Validated proficiencies in cloud security, automated infrastructure, and system engineering.&rdquo;</div>
          </div>
        </div>
      `;
    }

    const c = pageData.items[0];
    const cTitle = c.title || c.name || 'Professional Certificate';
    const credUrl = normalizeUrl(c.credentialUrl || c.verifyUrl || c.linkUrl);
    const cImgUrl = c.imageUrl || c.mediaUrl;
    const cIssuer = c.issuer || c.organization || c.issuingAuthority || '';
    const cDate = c.date || c.issueDate || c.period || '';
    const cDesc = c.description || c.desc || c.context || '';

    let badgeImgHTML = '';
    if (cImgUrl) {
      badgeImgHTML = `
        <div class="cert-badge-wrapper cert-clickable-img" data-img-url="${escapeHTML(cImgUrl)}" data-caption="${escapeHTML(cTitle)}" role="button" tabindex="0" title="Click to inspect credential in high resolution" aria-label="Inspect ${escapeHTML(cTitle)} Certificate">
          <div class="cert-badge-frame">
            <img src="${escapeHTML(cImgUrl)}" alt="${escapeHTML(cTitle)} Credential" class="cert-badge-img" loading="lazy" />
            <div class="cert-zoom-cue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
              ENLARGE
            </div>
          </div>
        </div>
      `;
    } else {
      badgeImgHTML = `
        <div class="cert-text-crest-frame">
          <svg class="cert-heraldic-crest" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <polyline points="9 12 11 14 15 10"/>
          </svg>
          <span class="cert-crest-label">OFFICIAL ACCREDITATION SEAL</span>
        </div>
      `;
    }

    return `
      <article class="certificate-showcase">
        <header class="cert-case-header">
          <span class="cert-kicker">CERTIFICATE ACCREDITATION</span>
          <h2 class="cert-title-headline">${escapeHTML(cTitle)}</h2>
          <div class="project-flourish-divider" aria-hidden="true">
            <span class="story-flourish-bar"></span>
            <span class="story-flourish-gem">✦</span>
            <span class="story-flourish-bar"></span>
          </div>
        </header>

        ${badgeImgHTML}

        <div class="cert-details-cluster">
          ${cIssuer ? `
            <div class="cert-field-row">
              <span class="cert-field-label">ISSUING ORGANIZATION</span>
              <span class="cert-field-value">${escapeHTML(cIssuer)}</span>
            </div>
          ` : ''}

          ${cDate ? `
            <div class="cert-field-row">
              <span class="cert-field-label">ISSUE DATE / VALIDITY</span>
              <span class="cert-field-date">${escapeHTML(cDate)}</span>
            </div>
          ` : ''}

          ${cDesc ? `
            <div class="cert-field-row" style="margin-top: 4px;">
              <span class="cert-field-label">DESCRIPTION / SKILLS VALIDATED</span>
              <div class="cert-desc-box"><p>${escapeHTML(cDesc).replace(/\n\n+/g, '</p><p style="margin-top: 8px;">').replace(/\n/g, '<br>')}</p></div>
            </div>
          ` : ''}
        </div>

        ${credUrl ? `
          <div class="cert-action-wrap">
            <span class="cert-field-label">CREDENTIAL VERIFICATION</span>
            <a href="${escapeHTML(credUrl)}" target="_blank" rel="noopener noreferrer" class="btn-book-action">
              <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
              VERIFY CREDENTIAL
            </a>
          </div>
        ` : ''}
      </article>
    `;
  }

  function renderEducationPageHTML(pageData, isMobile = false) {
    if (!pageData || !pageData.items || pageData.items.length === 0) {
      return `
        <div class="education-showcase">
          <div class="editorial-seal-plate" style="margin: auto 0;">
            <svg class="seal-embossed-shield" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            <div class="seal-legend">ACADEMIC FOUNDATION</div>
            <div class="seal-rule" aria-hidden="true"></div>
            <div class="seal-quote">&ldquo;Theoretical rigor, algorithmic foundations, and computer science scholarship.&rdquo;</div>
          </div>
        </div>
      `;
    }

    const e = pageData.items[0];
    const eduUrl = normalizeUrl(e.credentialUrl || e.linkUrl || e.url);
    const instName = e.institution || e.university || e.school || 'University Foundation';
    const degTitle = e.degree || e.degreeTitle || e.title || 'Academic Degree';
    const eduPeriod = e.period || e.years || e.duration || '';
    const eduDesc = e.highlights || e.description || e.desc || '';
    const eduThesis = e.thesis || '';
    const eduGpa = e.gpa || '';

    return `
      <article class="education-showcase">
        <header class="edu-case-header">
          <div class="edu-institution-label">INSTITUTION / UNIVERSITY</div>
          <h2 class="edu-institution-name">${escapeHTML(instName)}</h2>
          <div class="project-flourish-divider" aria-hidden="true">
            <span class="story-flourish-bar"></span>
            <span class="story-flourish-gem">✦</span>
            <span class="story-flourish-bar"></span>
          </div>
        </header>

        <h3 class="edu-degree-headline">${escapeHTML(degTitle)}</h3>

        ${eduPeriod ? `<div class="edu-period-tag">◆ ACADEMIC PERIOD: ${escapeHTML(eduPeriod)}</div>` : ''}

        ${eduGpa ? `
          <div style="font-family: var(--font-sans-ui); font-size: 13px; font-weight: 700; color: #845417; margin-bottom: 6px;">
            ACADEMIC HONOURS: <span style="color: var(--parchment-ink);">${escapeHTML(eduGpa)}</span>
          </div>
        ` : ''}

        ${eduDesc ? `
          <div class="edu-highlights-card">
            <div class="specs-editorial-label">ACADEMIC HIGHLIGHTS &amp; FOCUS</div>
            <div>${escapeHTML(eduDesc).replace(/\n/g, '<br>')}</div>
          </div>
        ` : ''}

        ${eduThesis ? `
          <div class="edu-highlights-card" style="margin-top: 8px;">
            <div class="specs-editorial-label">ENGINEERING THESIS</div>
            <div style="font-style: italic;">&ldquo;${escapeHTML(eduThesis)}&rdquo;</div>
          </div>
        ` : ''}

        ${eduUrl ? `
          <div class="edu-action-wrap">
            <a href="${escapeHTML(eduUrl)}" target="_blank" rel="noopener noreferrer" class="btn-book-action">
              <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              INSTITUTIONAL RECORD
            </a>
          </div>
        ` : ''}
      </article>
    `;
  }

  // ==========================================================================
  // CONTACT — Luxury Two-Page Render (Left: channels, Right: send message)
  // ==========================================================================

  function renderContactPageHTML(pageData, isMobile = false) {
    const c = pageData.contact || {};
    const sub = pageData.contactSide || 'left';

    if (sub === 'right') {
      // ── RIGHT PAGE: SEND A MESSAGE ──────────────────────────────────────────
      const email = c.email || '';
      const formId = 'contactMessageForm';

      return `
        <div class="contact-page-flow contact-right-flow${isMobile ? ' contact-mobile' : ''}">
          <div class="contact-section-block">
            <div class="contact-section-label">SEND A MESSAGE</div>
            <div class="contact-section-rule" aria-hidden="true"></div>
            <p class="contact-intro-text" style="margin-bottom:14px;">Fill in the form below and submit to open your email client with a pre-composed message — no data is collected or stored.</p>
          </div>

          <form class="contact-form" id="${formId}" autocomplete="off">
            <div class="contact-form-group">
              <label class="contact-form-label" for="cfName">YOUR NAME</label>
              <input type="text" id="cfName" name="name" class="contact-form-input" placeholder="Full name" required>
            </div>
            <div class="contact-form-group">
              <label class="contact-form-label" for="cfEmail">YOUR EMAIL</label>
              <input type="email" id="cfEmail" name="email" class="contact-form-input" placeholder="your@email.com" required>
            </div>
            <div class="contact-form-group">
              <label class="contact-form-label" for="cfSubject">SUBJECT</label>
              <input type="text" id="cfSubject" name="subject" class="contact-form-input" placeholder="e.g. Collaboration Opportunity">
            </div>
            <div class="contact-form-group">
              <label class="contact-form-label" for="cfMsg">MESSAGE</label>
              <textarea id="cfMsg" name="message" class="contact-form-textarea" rows="5" placeholder="Write your message here..." required></textarea>
            </div>
            <div class="contact-form-actions">
              <button type="submit" class="btn-book-action contact-send-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                SEND MESSAGE
              </button>
            </div>
          </form>

          <div class="contact-closing-note">
            <span class="story-flourish-gem" aria-hidden="true">✦</span>
            <span>Looking forward to hearing from you.</span>
          </div>
        </div>
      `;
    }

    // ── LEFT PAGE: LET'S CONNECT + EMAIL + NETWORKS ─────────────────────────
    const email = c.email || '';
    const linkedIn = c.linkedIn || '';
    const github = c.github || '';
    const intro = c.introText || c.additionalNotes || '';
    const chapterNum = pageData.chapterNum || 'VII';

    const linkedInIcon = `<svg class="contact-network-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>`;
    const githubIcon = `<svg class="contact-network-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>`;
    const emailIcon = `<svg class="contact-network-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`;

    const normalizeUrl = (u) => u && !u.startsWith('http') ? 'https://' + u : u;

    return `
      <div class="contact-page-flow contact-left-flow${isMobile ? ' contact-mobile' : ''}">

        <!-- Chapter label -->
        <div class="contact-chapter-label">CHAPTER ${escapeHTML(chapterNum)}</div>

        <!-- LET'S CONNECT heading -->
        <div class="contact-section-block contact-top-heading-block">
          <h2 class="contact-main-heading">LET'S CONNECT</h2>
          <div class="contact-section-rule contact-main-rule" aria-hidden="true"></div>
          ${intro ? `<p class="contact-intro-text">${escapeHTML(intro).replace(/\n/g, '<br>')}</p>` : `<p class="contact-intro-text">Whether you have an opportunity, a project, a question, or just want to talk engineering and cybersecurity — I'm open to the conversation.</p>`}
        </div>

        <!-- EMAIL -->
        ${email ? `
          <div class="contact-section-block">
            <div class="contact-section-label">EMAIL</div>
            <div class="contact-section-rule" aria-hidden="true"></div>
            <div class="contact-email-row">
              ${emailIcon}
              <a href="mailto:${escapeHTML(email)}" class="contact-email-link">${escapeHTML(email)}</a>
              <button class="contact-copy-btn" data-copy="${escapeHTML(email)}" title="Copy email address" aria-label="Copy email address">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </button>
            </div>
          </div>
        ` : ''}

        <!-- PROFESSIONAL NETWORKS -->
        ${(linkedIn || github) ? `
          <div class="contact-section-block">
            <div class="contact-section-label">PROFESSIONAL NETWORKS</div>
            <div class="contact-section-rule" aria-hidden="true"></div>
            <div class="contact-networks-list">
              ${linkedIn ? `
                <a href="${escapeHTML(normalizeUrl(linkedIn))}" target="_blank" rel="noopener noreferrer" class="contact-network-link">
                  ${linkedInIcon}
                  <span class="contact-network-name">LinkedIn</span>
                  <svg class="contact-network-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </a>
              ` : ''}
              ${github ? `
                <a href="${escapeHTML(normalizeUrl(github))}" target="_blank" rel="noopener noreferrer" class="contact-network-link">
                  ${githubIcon}
                  <span class="contact-network-name">GitHub</span>
                  <svg class="contact-network-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </a>
              ` : ''}
            </div>
          </div>
        ` : ''}

        <!-- Decorative closing flourish -->
        <div class="contact-flourish" aria-hidden="true">
          <span class="story-flourish-bar"></span>
          <span class="story-flourish-gem">✦</span>
          <span class="story-flourish-bar"></span>
        </div>
      </div>
    `;
  }

  function renderPageBodyHTML(pageData, isMobile = false) {
    if (!pageData) return '';


    // Editorial Seal on blank spread page
    if (pageData.isBlank) {
      return renderEditorialSealHTML(isMobile);
    }

    // ABOUT ME — PAGE 1 & 2: Timeless literary book aesthetics
    if (pageData.isAboutEditorial || (pageData.sectionId === 'about' && (pageData.pageNum === 1 || pageData.order === 1))) {
      return renderAboutEditorialPageHTML(pageData, isMobile);
    }

    // SKILLS — Curated Technical Capabilities with 5 Distinct Category Accents
    if (pageData.type === 'skills') {
      return renderSkillsPageHTML(pageData, isMobile);
    }

    // PROJECTS PORTAL — Category Directory & Search Suite
    if (pageData.type === 'projects-portal') {
      return renderProjectsPortalHTML(pageData, isMobile);
    }

    // PROJECTS — Architectural Case Studies & Adaptive Media
    if (pageData.type === 'projects') {
      return renderProjectsPageHTML(pageData, isMobile);
    }

    // CERTIFICATES — Professional Credentials & Interactive Lightbox
    if (pageData.type === 'certificates') {
      return renderCertificatesPageHTML(pageData, isMobile);
    }

    // EDUCATION — Academic Foundation & Scholarship
    if (pageData.type === 'education') {
      return renderEducationPageHTML(pageData, isMobile);
    }

    // JOURNEY — Chronological Timeline (Left Page)
    if (pageData.type === 'journey-timeline') {
      return renderJourneyTimelineHTML(pageData, isMobile);
    }

    // JOURNEY — Milestone Detail Story (Right Page)
    if (pageData.type === 'journey-detail') {
      return renderJourneyDetailHTML(pageData, isMobile);
    }

    // 1. Explicit Content Page with Body Text (Other sections)
    if (pageData.bodyText) {
      return `
        <div class="${isMobile ? 'jotter-arch-card' : 'arch-card-frame'}" style="text-align: left; align-items: stretch; max-width: 100%;">
          ${pageData.heading ? `<h3 style="font-family: var(--font-serif-master); font-size: ${isMobile ? '15px' : '19px'}; letter-spacing: 0.12em; color: #120402; font-weight: 800; margin-bottom: 6px;">${escapeHTML(pageData.heading)}</h3>` : ''}
          <div style="font-family: var(--font-serif-body); font-size: ${isMobile ? '15px' : '18px'}; line-height: 1.7; color: #120402; margin-bottom: 8px; font-weight: 550;">
            ${escapeHTML(pageData.bodyText).replace(/\n\n/g, '</p><p style="margin-top: 6px;">').replace(/\n/g, '<br>')}
          </div>
          ${pageData.supportingInfo ? `
            <div style="font-family: var(--font-sans-ui); font-size: 13px; color: #785304; padding-top: 6px; border-top: 1px dashed rgba(140, 95, 35, 0.3);">
              ${escapeHTML(pageData.supportingInfo).replace(/\n/g, '<br>')}
            </div>
          ` : ''}
          ${pageData.mediaUrl ? `
            <div style="margin-top: 8px; text-align: center;">
              <img src="${escapeHTML(pageData.mediaUrl)}" alt="" style="max-width: 100%; max-height: 100px; object-fit: contain; border-radius: 3px; border: 1px solid rgba(140, 95, 35, 0.3);">
            </div>
          ` : ''}
        </div>
      `;
    }

    // 6. Legacy journey fallback (no-op now handled above)

    // 7. Contact Page — LEFT (LET'S CONNECT) and RIGHT (SEND A MESSAGE)
    if (pageData.type === 'contact') {
      return renderContactPageHTML(pageData, isMobile);
    }


    // 8. Default Clean Architectural Placeholder (Zero fake content)
    return `
      <div class="${isMobile ? 'jotter-arch-card' : 'arch-card-frame'}">
        <div class="${isMobile ? 'jotter-arch-icon-wrap' : 'arch-card-icon'}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4M12 8h.01"/>
          </svg>
        </div>
        <h3 class="${isMobile ? 'jotter-arch-headline' : 'arch-card-title'}">${escapeHTML((pageData.title || 'ARCHITECTURAL SPACE').toUpperCase())}</h3>
        <p class="${isMobile ? 'jotter-arch-caption' : 'arch-card-sub'}">${escapeHTML(pageData.subtitle || 'FEATURED ARCHITECTURE')}</p>
        <div class="${isMobile ? 'jotter-arch-lines' : 'arch-slot-cluster'}" aria-hidden="true">
          <div class="${isMobile ? 'arch-line line-1' : 'arch-slot-pill'}"></div>
          <div class="${isMobile ? 'arch-line line-2' : 'arch-slot-pill'}"></div>
          <div class="${isMobile ? 'arch-line line-3' : 'arch-slot-pill short'}"></div>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // 4. Render Logic
  // ==========================================================================

  function updateActiveNav(sectionId) {
    navButtons.forEach(btn => {
      if (btn.dataset.sectionId === sectionId) {
        btn.classList.add('active');
        btn.setAttribute('aria-current', 'page');
      } else {
        btn.classList.remove('active');
        btn.removeAttribute('aria-current');
      }
    });
  }

  function isEditorialPage(pageData, sectionId) {
    if (!pageData) return false;
    if (pageData.isAboutEditorial) return true;
    const editorialSections = ['about', 'skills', 'projects', 'certificates', 'education', 'journey'];
    return editorialSections.includes(sectionId) || ['skills', 'projects', 'projects-portal', 'certificates', 'education', 'journey-timeline', 'journey-detail'].includes(pageData.type);
  }

  function renderDesktopSpread(spreadIndex) {
    const spread = BOOK_SPREADS[spreadIndex];
    if (!spread) return;

    currentSpreadIndex = spreadIndex;
    updateActiveNav(spread.sectionId);

    if (spread.isCover) {
      bookVolumeAssembly.classList.remove('state-open');
      bookVolumeAssembly.classList.add('state-closed');
      closedBookStructure.style.display = 'flex';
      openBookSpread.style.display = 'none';

      if (pageFlipperPill) pageFlipperPill.style.display = 'none';
      arrowPrev.style.opacity = '0.35';
      arrowPrev.title = 'Previous Page';
      arrowNext.style.opacity = '1';
      arrowNext.title = 'Open Book';
    } else {
      bookVolumeAssembly.classList.remove('state-closed');
      bookVolumeAssembly.classList.add('state-open');
      closedBookStructure.style.display = 'none';
      openBookSpread.style.display = 'flex';

      // Left Page
      leftChapterTag.textContent = spread.chapter;
      leftSectionTitle.textContent = spread.sectionTitle;
      leftPageNum.textContent = `PAGE ${spread.leftPage.pageNum || 1}`;
      leftFolioTag.textContent = `${spread.sectionTitle} • PART ${spread.partNumber || 1}`;
      if (leftContentBody) {
        const isEditorialLeft = isEditorialPage(spread.leftPage, spread.sectionId);
        if (isEditorialLeft) {
          leftContentBody.classList.add('has-editorial-flow');
        } else {
          leftContentBody.classList.remove('has-editorial-flow');
        }
        leftContentBody.innerHTML = renderPageBodyHTML(spread.leftPage, false);
      }

      // Right Page
      rightChapterTag.textContent = spread.chapter;
      rightSectionTitle.textContent = spread.sectionTitle;
      rightPageNum.textContent = `PAGE ${spread.rightPage.pageNum || 2}`;
      rightFolioTag.textContent = `SAMUEL MERCY OLUWATOBI`;
      if (rightContentBody) {
        const isEditorialRight = isEditorialPage(spread.rightPage, spread.sectionId);
        if (isEditorialRight) {
          rightContentBody.classList.add('has-editorial-flow');
        } else {
          rightContentBody.classList.remove('has-editorial-flow');
        }
        rightContentBody.innerHTML = renderPageBodyHTML(spread.rightPage, false);
      }

      if (pageFlipperPill) {
        pageFlipperPill.style.display = 'flex';
        flipperStatusMsg.textContent = `${spread.chapter} • ${spread.sectionTitle} (SPREAD ${spread.spreadIndex} OF ${BOOK_SPREADS.length - 1})`;
      }

      arrowPrev.style.opacity = '1';
      arrowPrev.title = 'Turn Page Backward';
      arrowNext.style.opacity = '1';
      arrowNext.title = (currentSpreadIndex === BOOK_SPREADS.length - 1) ? 'Close Book (Return to Cover)' : 'Turn Page Forward';
    }
  }

  function renderMobilePage(pageIndex) {
    const pageItem = MOBILE_PAGES[pageIndex];
    if (!pageItem) return;

    currentMobileIndex = pageIndex;
    updateActiveNav(pageItem.sectionId);

    if (pageItem.isCover) {
      bookVolumeAssembly.classList.remove('state-open');
      bookVolumeAssembly.classList.add('state-closed');
      closedBookStructure.style.display = 'flex';
      openBookSpread.style.display = 'none';

      if (pageFlipperPill) pageFlipperPill.style.display = 'none';
      arrowPrev.style.opacity = '0.35';
      arrowPrev.title = 'Previous Page';
      arrowNext.style.opacity = '1';
      arrowNext.title = 'Open Book';
    } else {
      bookVolumeAssembly.classList.remove('state-closed');
      bookVolumeAssembly.classList.add('state-open');
      closedBookStructure.style.display = 'none';
      openBookSpread.style.display = 'flex';

      // Header
      mobileChapterTag.textContent = pageItem.chapter;
      mobileSectionTitle.textContent = pageItem.sectionTitle;

      // Content Card
      if (mobileContentCanvas) {
        const isEditorialMobile = isEditorialPage(pageItem.pageData, pageItem.sectionId);
        if (isEditorialMobile) {
          mobileContentCanvas.classList.add('has-editorial-flow');
        } else {
          mobileContentCanvas.classList.remove('has-editorial-flow');
        }
        mobileContentCanvas.innerHTML = renderPageBodyHTML(pageItem.pageData, true);
        mobileContentCanvas.scrollTop = 0;
      }

      // Footer
      const pNum = pageItem.pageIndexInSection + 1;
      const tNum = pageItem.totalSectionPages;
      mobilePageNum.textContent = `◆ PAGE ${pNum} OF ${tNum} ◆`;

      // Status Pill
      if (pageFlipperPill) {
        pageFlipperPill.style.display = 'flex';
        flipperStatusMsg.textContent = `${pageItem.chapter} • ${pageItem.sectionTitle} (PAGE ${pNum} OF ${tNum})`;
      }

      arrowPrev.style.opacity = (currentMobileIndex === 0) ? '0.35' : '1';
      arrowPrev.title = 'Turn Page Backward';
      arrowNext.style.opacity = '1';
      const isLastMobilePage = (currentMobileIndex === MOBILE_PAGES.length - 1);
      arrowNext.title = isLastMobilePage ? 'Close Book (Return to Cover)' : 'Turn Page Forward';
      if (mobileTurnTab) {
        mobileTurnTab.title = isLastMobilePage ? 'Close Book (Return to Cover)' : 'Turn to Next Page';
      }
    }
  }

  function renderCurrentState() {
    if (isMobileViewport()) {
      renderMobilePage(currentMobileIndex);
    } else {
      renderDesktopSpread(currentSpreadIndex);
    }
  }

  // ==========================================================================
  // 5. Interaction Engine (Physical Page Turns & Transitions)
  // ==========================================================================

  async function openBook() {
    if (isTransitioning) return;
    isTransitioning = true;

    bookVolumeAssembly.classList.remove('state-closed');
    bookVolumeAssembly.classList.add('state-open');

    await new Promise(r => setTimeout(r, 260));
    currentSpreadIndex = 1;
    currentMobileIndex = 1;
    renderCurrentState();
    await new Promise(r => setTimeout(r, 260));

    isTransitioning = false;
  }

  async function closeBook() {
    if (isTransitioning) return;
    isTransitioning = true;

    bookVolumeAssembly.classList.remove('state-open');
    bookVolumeAssembly.classList.add('state-closed');

    await new Promise(r => setTimeout(r, 260));
    currentSpreadIndex = 0;
    currentMobileIndex = 0;
    renderCurrentState();
    await new Promise(r => setTimeout(r, 260));

    isTransitioning = false;
  }

  async function flipForward() {
    if (isTransitioning) return;
    if (certLightboxModal && certLightboxModal.style.display === 'flex') return;

    if (isMobileViewport()) {
      if (currentMobileIndex === 0) {
        await openBook();
        return;
      }
      if (currentMobileIndex >= MOBILE_PAGES.length - 1) {
        // Last page of CONTACT: physically close book back to HOME cover
        await closeBook();
        return;
      }

      isTransitioning = true;
      const nextIdx = currentMobileIndex + 1;

      if (mobileFlippingLeaf) {
        mobileFlippingLeaf.className = 'mobile-flipping-leaf flip-forward';
        mobileFlippingLeaf.style.display = 'block';
      }

      await new Promise(r => setTimeout(r, FLIP_ANIMATION_MS * 0.55));
      renderMobilePage(nextIdx);

      await new Promise(r => setTimeout(r, FLIP_ANIMATION_MS * 0.45));
      if (mobileFlippingLeaf) {
        mobileFlippingLeaf.style.display = 'none';
        mobileFlippingLeaf.className = 'mobile-flipping-leaf';
      }
      isTransitioning = false;
    } else {
      // Desktop Spread
      if (currentSpreadIndex === 0) {
        await openBook();
        return;
      }
      if (currentSpreadIndex >= BOOK_SPREADS.length - 1) {
        // Last spread of CONTACT: physically close book back to HOME cover
        await closeBook();
        return;
      }

      isTransitioning = true;
      const nextIdx = currentSpreadIndex + 1;

      if (flippingLeaf) {
        flippingLeaf.className = 'flipping-3d-leaf flip-forward';
        flippingLeaf.style.display = 'block';
      }

      await new Promise(r => setTimeout(r, FLIP_ANIMATION_MS * 0.52));
      renderDesktopSpread(nextIdx);

      await new Promise(r => setTimeout(r, FLIP_ANIMATION_MS * 0.48));
      if (flippingLeaf) {
        flippingLeaf.style.display = 'none';
        flippingLeaf.className = 'flipping-3d-leaf';
      }
      isTransitioning = false;
    }
  }

  async function flipBackward() {
    if (isTransitioning) return;
    if (certLightboxModal && certLightboxModal.style.display === 'flex') return;

    if (isMobileViewport()) {
      if (currentMobileIndex === 1) {
        await closeBook();
        return;
      }
      if (currentMobileIndex <= 0) return;

      isTransitioning = true;
      const prevIdx = currentMobileIndex - 1;

      if (mobileFlippingLeaf) {
        mobileFlippingLeaf.className = 'mobile-flipping-leaf flip-backward';
        mobileFlippingLeaf.style.display = 'block';
      }

      await new Promise(r => setTimeout(r, FLIP_ANIMATION_MS * 0.55));
      renderMobilePage(prevIdx);

      await new Promise(r => setTimeout(r, FLIP_ANIMATION_MS * 0.45));
      if (mobileFlippingLeaf) {
        mobileFlippingLeaf.style.display = 'none';
        mobileFlippingLeaf.className = 'mobile-flipping-leaf';
      }
      isTransitioning = false;
    } else {
      // Desktop Spread
      if (currentSpreadIndex === 1) {
        await closeBook();
        return;
      }
      if (currentSpreadIndex <= 0) return;

      isTransitioning = true;
      const prevIdx = currentSpreadIndex - 1;

      if (flippingLeaf) {
        flippingLeaf.className = 'flipping-3d-leaf flip-backward';
        flippingLeaf.style.display = 'block';
      }

      await new Promise(r => setTimeout(r, FLIP_ANIMATION_MS * 0.52));
      renderDesktopSpread(prevIdx);

      await new Promise(r => setTimeout(r, FLIP_ANIMATION_MS * 0.48));
      if (flippingLeaf) {
        flippingLeaf.style.display = 'none';
        flippingLeaf.className = 'flipping-3d-leaf';
      }
      isTransitioning = false;
    }
  }

  async function navigateToSection(sectionId) {
    if (isTransitioning) return;

    if (isMobileViewport()) {
      const targetPage = MOBILE_SECTION_MAP[sectionId];
      if (targetPage === undefined || targetPage === currentMobileIndex) return;

      if (targetPage === 0) {
        await closeBook();
        return;
      }

      if (currentMobileIndex === 0) {
        isTransitioning = true;
        bookVolumeAssembly.classList.remove('state-closed');
        bookVolumeAssembly.classList.add('state-open');
        await new Promise(r => setTimeout(r, 260));
        renderMobilePage(targetPage);
        await new Promise(r => setTimeout(r, 260));
        isTransitioning = false;
        return;
      }

      isTransitioning = true;
      const isForward = targetPage > currentMobileIndex;

      if (mobileFlippingLeaf) {
        mobileFlippingLeaf.className = `mobile-flipping-leaf ${isForward ? 'flip-forward' : 'flip-backward'}`;
        mobileFlippingLeaf.style.display = 'block';
      }

      await new Promise(r => setTimeout(r, FLIP_ANIMATION_MS * 0.55));
      renderMobilePage(targetPage);

      await new Promise(r => setTimeout(r, FLIP_ANIMATION_MS * 0.45));
      if (mobileFlippingLeaf) {
        mobileFlippingLeaf.style.display = 'none';
        mobileFlippingLeaf.className = 'mobile-flipping-leaf';
      }
      isTransitioning = false;
    } else {
      const targetSpread = DESKTOP_SECTION_MAP[sectionId];
      if (targetSpread === undefined || targetSpread === currentSpreadIndex) return;

      if (targetSpread === 0) {
        await closeBook();
        return;
      }

      if (currentSpreadIndex === 0) {
        isTransitioning = true;
        bookVolumeAssembly.classList.remove('state-closed');
        bookVolumeAssembly.classList.add('state-open');
        await new Promise(r => setTimeout(r, 260));
        renderDesktopSpread(targetSpread);
        await new Promise(r => setTimeout(r, 260));
        isTransitioning = false;
        return;
      }

      isTransitioning = true;
      const isForward = targetSpread > currentSpreadIndex;

      if (flippingLeaf) {
        flippingLeaf.className = `flipping-3d-leaf ${isForward ? 'flip-forward' : 'flip-backward'}`;
        flippingLeaf.style.display = 'block';
      }

      await new Promise(r => setTimeout(r, FLIP_ANIMATION_MS * 0.52));
      renderDesktopSpread(targetSpread);

      await new Promise(r => setTimeout(r, FLIP_ANIMATION_MS * 0.48));
      if (flippingLeaf) {
        flippingLeaf.style.display = 'none';
        flippingLeaf.className = 'flipping-3d-leaf';
      }
      isTransitioning = false;
    }
  }

  // ==========================================================================
  // 6. User Interactions & Event Handlers
  // ==========================================================================

  // Open book on closed cover click
  bookCoverFace.addEventListener('click', () => {
    openBook();
  });

  // Dedicated Navigation Arrows — ONLY dedicated arrows flip the book
  arrowPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    flipBackward();
  });

  arrowNext.addEventListener('click', (e) => {
    e.stopPropagation();
    flipForward();
  });

  // Mobile Leather Turn Tab (Right Edge Bookmark)
  if (mobileTurnTab) {
    mobileTurnTab.addEventListener('click', (e) => {
      e.stopPropagation();
      flipForward();
    });
  }

  // Navigation Sidebar Buttons
  navButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const secId = btn.dataset.sectionId;
      navigateToSection(secId);
      closeMobileDrawer();
    });
  });

  function openMobileDrawer() {
    navSidebar.classList.add('drawer-open');
    drawerBackdrop.classList.add('active');
    mobileMenuToggle.setAttribute('aria-expanded', 'true');
  }

  function closeMobileDrawer() {
    navSidebar.classList.remove('drawer-open');
    drawerBackdrop.classList.remove('active');
    mobileMenuToggle.setAttribute('aria-expanded', 'false');
  }

  mobileMenuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (navSidebar.classList.contains('drawer-open')) closeMobileDrawer();
    else openMobileDrawer();
  });

  drawerBackdrop.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMobileDrawer();
  });


  // Keyboard Navigation Guard
  document.addEventListener('keydown', (e) => {
    if (certLightboxModal && certLightboxModal.style.display === 'flex') {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeCertLightbox();
      }
      return; // Never navigate spreads while lightbox is active
    }
    if (e.key === 'ArrowRight') flipForward();
    else if (e.key === 'ArrowLeft') flipBackward();
    else if (e.key === 'Escape') closeMobileDrawer();
  });

  // Touch Swipe Handling (Content Areas & Lightbox are explicitly protected)
  let touchStartX = 0;
  let touchStartY = 0;

  document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    if (certLightboxModal && certLightboxModal.style.display === 'flex') return;
    if (e.target.closest('#certLightboxModal, a, button, input, textarea, select, .cert-clickable-img, .parchment-content-body, .jotter-content-canvas')) return;
    const touchEndX = e.changedTouches[0].screenX;
    const touchEndY = e.changedTouches[0].screenY;
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    if (Math.abs(diffX) > 60 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) flipForward();
      else flipBackward();
    }
  }, { passive: true });

  window.addEventListener('resize', () => {
    renderCurrentState();
    if (certLightboxModal && certLightboxModal.style.display === 'flex') {
      fitCertLightboxImg();
    }
  });

  // Expose Book Engine Globally for Diagnostics & URL deep links
  window.bookEngine = {
    renderDesktopSpread,
    renderMobilePage,
    openBook,
    closeBook,
    flipForward,
    flipBackward,
    navigateToSection,
    navigateToCategorySpread,
    navigateToProjectSpread,
    navigateToProjectsPortal,
    get currentSpread() { return currentSpreadIndex; },
    get currentMobilePage() { return currentMobileIndex; },
    get isBookOpen() { return (isMobileViewport() ? currentMobileIndex : currentSpreadIndex) > 0; },
    get BOOK_SPREADS() { return BOOK_SPREADS; },
    get MOBILE_PAGES() { return MOBILE_PAGES; },
    get SECTIONS() { return SECTIONS; }
  };

  // Certificate Lightbox Overlay Handler
  const certLightboxModal = document.getElementById('certLightboxModal');
  const certLightboxImg = document.getElementById('certLightboxImg');
  const certLightboxCaption = document.getElementById('certLightboxCaption');
  const certLightboxClose = document.getElementById('certLightboxClose');
  const certLightboxBackdrop = document.getElementById('certLightboxBackdrop');

  function fitCertLightboxImg() {
    if (!certLightboxImg || !certLightboxImg.naturalWidth) return;
    const nw = certLightboxImg.naturalWidth;
    const nh = certLightboxImg.naturalHeight;
    const isMobile = window.innerWidth < 600;
    const maxW = window.innerWidth * (isMobile ? 0.94 : 0.92);
    const maxH = window.innerHeight * (isMobile ? 0.80 : 0.85);

    const ar = nw / nh;
    const containerRatio = maxW / maxH;

    let targetW, targetH;
    if (ar >= containerRatio) {
      targetW = maxW;
      targetH = maxW / ar;
    } else {
      targetH = maxH;
      targetW = maxH * ar;
    }

    certLightboxImg.style.width = `${Math.round(targetW)}px`;
    certLightboxImg.style.height = `${Math.round(targetH)}px`;
  }

  function openCertLightbox(url, caption) {
    if (!certLightboxModal || !url) return;
    if (certLightboxImg) {
      certLightboxImg.style.width = 'auto';
      certLightboxImg.style.height = 'auto';
      certLightboxImg.onload = fitCertLightboxImg;
      certLightboxImg.src = url;
      if (certLightboxImg.complete && certLightboxImg.naturalWidth) {
        fitCertLightboxImg();
      }
    }
    if (certLightboxCaption) certLightboxCaption.textContent = caption || '';
    certLightboxModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    if (certLightboxClose) certLightboxClose.focus();
  }

  function closeCertLightbox() {
    if (certLightboxModal) {
      certLightboxModal.style.display = 'none';
      if (certLightboxImg) {
        certLightboxImg.src = '';
        certLightboxImg.style.width = '';
        certLightboxImg.style.height = '';
      }
      document.body.style.overflow = '';
    }
  }

  if (certLightboxClose) {
    certLightboxClose.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      closeCertLightbox();
    });
  }
  if (certLightboxBackdrop) {
    certLightboxBackdrop.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      closeCertLightbox();
    });
  }

  // Live Search Input Handler for Projects Portal
  document.addEventListener('input', (e) => {
    if (e.target && e.target.id === 'portalSearchInput') {
      const input = e.target;
      const query = input.value.trim().toLowerCase();
      const portalContainer = input.closest('.projects-portal-container');
      if (!portalContainer) return;

      const clearBtn = portalContainer.querySelector('#portalSearchClear');
      const resultsContainer = portalContainer.querySelector('#portalSearchResults');
      const plaquesShelf = portalContainer.querySelector('#portalCategoriesShelf');

      if (clearBtn) clearBtn.style.display = query ? 'block' : 'none';

      if (!query) {
        if (resultsContainer) {
          resultsContainer.style.display = 'none';
          resultsContainer.innerHTML = '';
        }
        if (plaquesShelf) plaquesShelf.style.display = 'flex';
        return;
      }

      // Search across all published projects
      const allProjects = window.__allPublishedProjects || [];
      const matches = allProjects.filter(p => {
        const titleMatch = (p.title || '').toLowerCase().includes(query);
        const catMatch = (p.category || '').toLowerCase().includes(query);
        const typeMatch = (p.projectType || '').toLowerCase().includes(query);
        const techMatch = (Array.isArray(p.technologies) ? p.technologies.join(' ') : String(p.technologies || '')).toLowerCase().includes(query);
        const skillsMatch = (Array.isArray(p.skillsDemonstrated) ? p.skillsDemonstrated.join(' ') : String(p.skillsDemonstrated || '')).toLowerCase().includes(query);
        const descMatch = (p.description || p.shortDesc || '').toLowerCase().includes(query);
        const archMatch = (p.architectureSummary || '').toLowerCase().includes(query);
        const specsMatch = (p.specifications || p.detailedDesc || '').toLowerCase().includes(query);

        return titleMatch || catMatch || typeMatch || techMatch || skillsMatch || descMatch || archMatch || specsMatch;
      });

      if (resultsContainer) {
        resultsContainer.style.display = 'block';
        if (matches.length === 0) {
          resultsContainer.innerHTML = `
            <div style="padding: 12px; text-align: center; font-family: var(--font-serif-body); font-size: 13px; color: #783d09; font-style: italic;">
              No projects matched &ldquo;${escapeHTML(query)}&rdquo;. Try searching another technology or category.
            </div>
          `;
        } else {
          resultsContainer.innerHTML = matches.map(m => `
            <div class="search-result-item" data-project-id="${escapeHTML(m.id || '')}" role="button" tabindex="0">
              <div class="search-result-info">
                <span class="search-result-cat">${escapeHTML(m.category || 'Web Development')}</span>
                <span class="search-result-title">${escapeHTML(m.title || 'Project Case Study')}</span>
                ${m.technologies ? `<span style="font-family: var(--font-sans-ui); font-size: 11px; color: #543725;">${escapeHTML(Array.isArray(m.technologies) ? m.technologies.slice(0, 3).join(', ') : m.technologies)}</span>` : ''}
              </div>
              <span class="search-result-arrow">VIEW CASE STUDY &rarr;</span>
            </div>
          `).join('');
        }
      }
    }
  });

  // Global Click Handling: Projects Portal, Case Studies, Lightbox Trigger & Interactive Element Isolation
  document.addEventListener('click', (e) => {
    // 1. Certificate / Project Image Lightbox Trigger
    const trigger = e.target.closest('.cert-clickable-img');
    if (trigger) {
      e.stopPropagation();
      e.preventDefault();
      openCertLightbox(trigger.dataset.imgUrl, trigger.dataset.caption);
      return;
    }

    // 2. Category Plaque Card Click -> Jump to that Category's First Case Study
    const plaque = e.target.closest('.category-plaque-card');
    if (plaque) {
      e.stopPropagation();
      e.preventDefault();
      const cat = plaque.dataset.categoryTarget;
      if (cat) navigateToCategorySpread(cat);
      return;
    }

    // 3. Project Portal Back Button -> Return to Directory Portal
    const backBtn = e.target.closest('.btn-portal-back');
    if (backBtn) {
      e.stopPropagation();
      e.preventDefault();
      navigateToProjectsPortal();
      return;
    }

    // 4. Project Search Result Item Click -> Jump directly to that Project
    const searchItem = e.target.closest('.search-result-item');
    if (searchItem) {
      e.stopPropagation();
      e.preventDefault();
      const projId = searchItem.dataset.projectId;
      if (projId) navigateToProjectSpread(projId);
      return;
    }

    // 5. Search Clear Button Click
    const clearBtn = e.target.closest('#portalSearchClear');
    if (clearBtn) {
      e.stopPropagation();
      e.preventDefault();
      const portal = clearBtn.closest('.projects-portal-container');
      if (portal) {
        const input = portal.querySelector('#portalSearchInput');
        if (input) {
          input.value = '';
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.focus();
        }
      }
      return;
    }

    // 6. Project Filter Chip Click -> Filter Category Plaques
    const chip = e.target.closest('.project-filter-chip');
    if (chip) {
      e.stopPropagation();
      e.preventDefault();
      const filterCat = chip.dataset.filterCategory;
      const portal = chip.closest('.projects-portal-container');
      if (portal) {
        portal.querySelectorAll('.project-filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        const plaques = portal.querySelectorAll('.category-plaque-card');
        plaques.forEach(p => {
          if (filterCat === 'ALL' || p.dataset.categoryTarget === filterCat) {
            p.style.display = 'flex';
          } else {
            p.style.display = 'none';
          }
        });
      }
      return;
    }

    // 7. Interactive elements (links, action buttons, inputs, form controls, skills & projects & journey & contact containers)
    const interactive = e.target.closest('a, button:not(#arrowPrev):not(#arrowNext):not(#mobileTurnTab), .btn-book-action, .tech-tag-badge, .cert-lightbox-content, input, textarea, select, .projects-portal-container, .project-case-study, .category-plaque-card, .btn-portal-back, .project-filter-chip, .search-result-item, .skills-editorial-flow, .skill-entry-card, .skill-category-group, .journey-timeline-flow, .journey-detail-flow, .journey-timeline-entry, .journey-detail-section, .journey-link-btn, .contact-page-flow, .contact-form, .contact-network-link, .contact-copy-btn, .contact-email-link');
    if (interactive) {
      e.stopPropagation();
    }

    // 8. Contact copy-email button
    const copyBtn = e.target.closest('.contact-copy-btn');
    if (copyBtn) {
      e.preventDefault();
      const textToCopy = copyBtn.dataset.copy || '';
      if (navigator.clipboard && textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          const origInner = copyBtn.innerHTML;
          copyBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
          copyBtn.style.color = '#3b7a3b';
          setTimeout(() => { copyBtn.innerHTML = origInner; copyBtn.style.color = ''; }, 1800);
        }).catch(() => {});
      }
      return;
    }
  });

  // Contact form submit — compose mailto
  document.addEventListener('submit', (e) => {
    const form = e.target.closest('#contactMessageForm');
    if (!form) return;
    e.preventDefault();
    const name    = (form.querySelector('#cfName')?.value || '').trim();
    const from    = (form.querySelector('#cfEmail')?.value || '').trim();
    const subject = (form.querySelector('#cfSubject')?.value || 'Portfolio Enquiry').trim();
    const msg     = (form.querySelector('#cfMsg')?.value || '').trim();
    const body    = `From: ${name} <${from}>\n\n${msg}`;
    const mailto  = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;

    // Brief visual confirmation
    const btn = form.querySelector('.contact-send-btn');
    if (btn) {
      const origText = btn.innerHTML;
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> MESSAGE COMPOSED`;
      setTimeout(() => { btn.innerHTML = origText; }, 2500);
    }
  });


  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (certLightboxModal && certLightboxModal.style.display !== 'none') {
        e.preventDefault();
        e.stopPropagation();
        closeCertLightbox();
        return;
      }
    }
    if (e.key === 'Enter' || e.key === ' ') {
      const active = document.activeElement;
      if (active && active.classList.contains('cert-clickable-img')) {
        e.preventDefault();
        e.stopPropagation();
        openCertLightbox(active.dataset.imgUrl, active.dataset.caption);
      }
    }
  });

  // Check URL query param or hash for initial spread
  const urlParams = new URLSearchParams(window.location.search);
  const spreadParam = urlParams.get('spread');
  const hashSection = window.location.hash.replace('#', '').toLowerCase();

  if (spreadParam !== null && !isNaN(parseInt(spreadParam, 10))) {
    const idx = parseInt(spreadParam, 10);
    currentSpreadIndex = idx;
    currentMobileIndex = idx;
    renderCurrentState();
  } else if (hashSection) {
    if (isMobileViewport() && MOBILE_SECTION_MAP[hashSection] !== undefined) {
      currentMobileIndex = MOBILE_SECTION_MAP[hashSection];
    } else if (DESKTOP_SECTION_MAP[hashSection] !== undefined) {
      currentSpreadIndex = DESKTOP_SECTION_MAP[hashSection];
    }
    renderCurrentState();
  } else {
    renderCurrentState();
  }

});

/**
 * SAMUEL MERCY OLUWATOBI — PRIVATE ADMIN SYSTEM CONTROLLER
 * 
 * Clean, modular controller for the personal portfolio Content Management System:
 * - Authentication & Protected Route Guarding
 * - Section-by-Section Dynamic Form Routing
 * - SECTION -> PAGES[] Dynamic Page Architecture (Add, Edit, Reorder, Publish)
 * - Cloudinary Image/Video Direct Upload Integration (Zero exposed secrets)
 * - Real-time Save Status Indicators & Unsaved Changes Protection
 */

(function() {
  'use strict';

  // DOM Elements
  const authViewport = document.getElementById('authViewport');
  const adminWorkspace = document.getElementById('adminWorkspace');
  const adminLoginForm = document.getElementById('adminLoginForm');
  const authErrorAlert = document.getElementById('authErrorAlert');
  const loginSubmitBtn = document.getElementById('loginSubmitBtn');
  const adminLogoutBtn = document.getElementById('adminLogoutBtn');
  const currentUserEmail = document.getElementById('currentUserEmail');
  const adminSidebar = document.getElementById('adminSidebar');
  const adminSidebarToggle = document.getElementById('adminSidebarToggle');
  const adminMainStage = document.getElementById('adminMainStage');
  const globalSaveStatus = document.getElementById('globalSaveStatus');
  const globalSaveStatusText = document.getElementById('globalSaveStatusText');
  const toastShelf = document.getElementById('toastShelf');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalDialog = document.getElementById('modalDialog');
  const navTabs = document.querySelectorAll('.nav-tab');

  // Application State
  let activeSection = 'home';
  let isDirty = false;
  let cachedData = null;

  // ==========================================================================
  // 1. Notifications & Save Status Helpers
  // ==========================================================================

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast-item ${type}`;
    toast.innerHTML = `<span>${escapeHTML(message)}</span>`;
    toastShelf.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 3800);
  }

  function setSaveStatus(state, message = '') {
    globalSaveStatus.className = `save-status-pill ${state}`;
    if (state === 'saved') {
      isDirty = false;
      globalSaveStatusText.textContent = message || 'All Changes Saved';
    } else if (state === 'dirty') {
      isDirty = true;
      globalSaveStatusText.textContent = message || 'Unsaved Changes';
    } else if (state === 'saving') {
      globalSaveStatusText.textContent = message || 'Saving to Cloud...';
    } else if (state === 'error') {
      globalSaveStatusText.textContent = message || 'Save Error';
    }
  }

  window.addEventListener('beforeunload', (e) => {
    if (isDirty) {
      e.preventDefault();
      e.returnValue = 'You have unsaved changes in the Admin. Are you sure you want to leave?';
      return e.returnValue;
    }
  });

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

  function openModal(html) {
    modalDialog.innerHTML = html;
    modalBackdrop.style.display = 'flex';
  }

  function closeModal() {
    modalBackdrop.style.display = 'none';
    modalDialog.innerHTML = '';
  }

  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeModal();
  });

  // ==========================================================================
  // 2. Authentication Gate & Session Handling
  // ==========================================================================

  function updateAuthUI(user) {
    if (user) {
      authViewport.style.display = 'none';
      adminWorkspace.style.display = 'flex';
      currentUserEmail.textContent = user.email || 'admin@samuelmercy.com';
      refreshBadges();
      renderSection(activeSection);
    } else {
      adminWorkspace.style.display = 'none';
      authViewport.style.display = 'flex';
      authErrorAlert.style.display = 'none';
    }
  }

  // Bind Auth Listener
  window.portfolioService.on('auth:stateChanged', updateAuthUI);

  // Initial Auth Check
  updateAuthUI(window.portfolioService.getCurrentUser());

  // Login Form Submission
  adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    authErrorAlert.style.display = 'none';
    loginSubmitBtn.disabled = true;
    loginSubmitBtn.querySelector('.btn-text').style.display = 'none';
    loginSubmitBtn.querySelector('.btn-spinner').style.display = 'inline-block';

    try {
      await window.portfolioService.login(email, password);
      showToast('Authenticated successfully.', 'success');
    } catch (err) {
      authErrorAlert.textContent = err.message || 'Authentication failed.';
      authErrorAlert.style.display = 'block';
    } finally {
      loginSubmitBtn.disabled = false;
      loginSubmitBtn.querySelector('.btn-text').style.display = 'inline-block';
      loginSubmitBtn.querySelector('.btn-spinner').style.display = 'none';
    }
  });

  // Logout Action
  adminLogoutBtn.addEventListener('click', async () => {
    if (isDirty) {
      if (!confirm('You have unsaved changes. Discard and sign out?')) return;
    }
    await window.portfolioService.logout();
    showToast('Signed out of Admin.', 'info');
  });

  // Mobile Sidebar Toggle
  adminSidebarToggle.addEventListener('click', () => {
    adminSidebar.classList.toggle('drawer-open');
  });

  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && !adminSidebar.contains(e.target) && !adminSidebarToggle.contains(e.target)) {
      adminSidebar.classList.remove('drawer-open');
    }
  });

  // Navigation Tab Switching
  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      if (isDirty) {
        if (!confirm('You have unsaved changes. Discard them and switch sections?')) return;
        setSaveStatus('saved');
      }
      navTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeSection = tab.dataset.section;
      if (window.innerWidth <= 768) adminSidebar.classList.remove('drawer-open');
      renderSection(activeSection);
    });
  });

  // Refresh counts on sidebar tabs
  async function refreshBadges() {
    try {
      const aboutPages = await window.portfolioService.getPages('about', true);
      const skills = await window.portfolioService.getItems('skills', true);
      const projects = await window.portfolioService.getItems('projects', true);
      const certs = await window.portfolioService.getItems('certificates', true);
      const edu = await window.portfolioService.getItems('education', true);
      const journey = await window.portfolioService.getItems('journey', true);

      document.getElementById('badgeAboutPages').textContent = `${aboutPages.length} Page${aboutPages.length === 1 ? '' : 's'}`;
      document.getElementById('badgeSkillsCount').textContent = `${skills.length} Skill${skills.length === 1 ? '' : 's'}`;
      document.getElementById('badgeProjectsCount').textContent = `${projects.length} Project${projects.length === 1 ? '' : 's'}`;
      document.getElementById('badgeCertsCount').textContent = `${certs.length} Cert${certs.length === 1 ? '' : 's'}`;
      document.getElementById('badgeEduCount').textContent = `${edu.length} Record${edu.length === 1 ? '' : 's'}`;
      document.getElementById('badgeJourneyCount').textContent = `${journey.length} Entr${journey.length === 1 ? 'y' : 'ies'}`;
    } catch (e) {
      console.warn('Failed to refresh badges:', e);
    }
  }

  // ==========================================================================
  // 3. Section Render Router
  // ==========================================================================

  async function renderSection(sectionId) {
    adminMainStage.innerHTML = `<div style="text-align:center; padding: 40px; color: var(--admin-text-muted);">Loading ${escapeHTML(sectionId.toUpperCase())}...</div>`;

    switch (sectionId) {
      case 'home':
        await renderHomeSection();
        break;
      case 'about':
        await renderAboutSection();
        break;
      case 'skills':
        await renderSkillsSection();
        break;
      case 'projects':
        await renderProjectsSection();
        break;
      case 'certificates':
        await renderCertificatesSection();
        break;
      case 'education':
        await renderEducationSection();
        break;
      case 'journey':
        await renderJourneySection();
        break;
      case 'contact':
        await renderContactSection();
        break;
      case 'cloud-config':
        renderCloudConfigSection();
        break;
      default:
        adminMainStage.innerHTML = `<div class="empty-state-box"><h3>Section not found</h3></div>`;
    }
  }

  // ==========================================================================
  // 4. SECTION 1: HOME (Hero & Cover Manager)
  // ==========================================================================

  async function renderHomeSection() {
    const home = await window.portfolioService.getHomeData();

    adminMainStage.innerHTML = `
      <div class="stage-header">
        <div class="stage-title-wrap">
          <h2>
            <span>HOME • Digital Portfolio Cover</span>
            <span class="badge-status ${home.status || 'published'}">${(home.status || 'published').toUpperCase()}</span>
          </h2>
          <p>Controls the hero typography, monogram, tagline, quote, and professional image on the public closed cover.</p>
        </div>
        <div class="stage-actions">
          <div class="publish-toggle ${home.status === 'published' ? 'is-published' : 'is-draft'}" id="homePublishToggle">
            <span class="publish-toggle-option opt-draft">DRAFT</span>
            <span class="publish-toggle-option opt-published">PUBLISHED</span>
          </div>
          <button class="btn btn-gold btn-sm" id="btnSaveHome">Save Changes</button>
        </div>
      </div>

      <div class="grid-2-col">
        <!-- Identity Form -->
        <div class="admin-card">
          <div class="card-header">
            <div class="card-title">Cover Identity &amp; Title</div>
          </div>
          
          <div class="form-group">
            <label class="form-label" for="homeFullName">Full Name</label>
            <input type="text" id="homeFullName" class="form-control" value="${escapeHTML(home.fullName || 'SAMUEL MERCY OLUWATOBI')}">
            <div class="form-hint">Displayed in embossed gold across the closed book cover.</div>
          </div>

          <div class="form-group">
            <label class="form-label" for="homeMonogram">Monogram / Brand Crest</label>
            <input type="text" id="homeMonogram" class="form-control" value="${escapeHTML(home.monogram || 'SMO')}">
            <div class="form-hint">Top monogram emblem text (e.g. SMO).</div>
          </div>

          <div class="form-group">
            <label class="form-label" for="homeSubtitle">Cover Subtitle</label>
            <input type="text" id="homeSubtitle" class="form-control" value="${escapeHTML(home.digitalPortfolioSubtitle || 'DIGITAL PORTFOLIO')}">
          </div>

          <div class="form-group">
            <label class="form-label" for="homeDisciplines">Disciplines Tagline Strip</label>
            <input type="text" id="homeDisciplines" class="form-control" value="${escapeHTML((home.disciplines || ['BUILD', 'AUTOMATE', 'SECURE', 'DEPLOY']).join(' • '))}">
            <div class="form-hint">Separated with bullets or commas (BUILD • AUTOMATE • SECURE • DEPLOY).</div>
          </div>
        </div>

        <!-- Media & Quote Form -->
        <div class="admin-card">
          <div class="card-header">
            <div class="card-title">Cover Philosophy &amp; Media</div>
          </div>

          <div class="form-group">
            <label class="form-label">Philosophical Shield Quote</label>
            <textarea id="homeQuote" class="form-control" rows="4">${escapeHTML((home.quoteLines || ['Code is my craft.', 'Automation is my weapon.', 'Security is my priority.']).join('\n'))}</textarea>
            <div class="form-hint">One quote line per row, displayed beneath the vector shield emblem.</div>
          </div>

          <div class="form-group">
            <label class="form-label">Professional Hero Image <span class="optional-tag">(Cloudinary Upload)</span></label>
            <div id="homeHeroImageDropzone" class="media-uploader-widget">
              <!-- Rendered dynamically -->
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="homeCtaText">Action Prompt Text</label>
            <input type="text" id="homeCtaText" class="form-control" value="${escapeHTML(home.ctaText || 'CLICK TO OPEN BOOK')}">
          </div>
        </div>
      </div>
    `;

    // Render Hero Image Uploader
    renderMediaUploader({
      containerId: 'homeHeroImageDropzone',
      currentUrl: home.heroImage,
      folder: 'portfolio/hero',
      onUrlChange: (newUrl) => {
        home.heroImage = newUrl;
        setSaveStatus('dirty');
      }
    });

    // Publish state toggle
    const toggle = document.getElementById('homePublishToggle');
    toggle.addEventListener('click', () => {
      const isPub = toggle.classList.contains('is-published');
      home.status = isPub ? 'draft' : 'published';
      toggle.className = `publish-toggle ${home.status === 'published' ? 'is-published' : 'is-draft'}`;
      setSaveStatus('dirty');
    });

    // Form change listeners
    ['homeFullName', 'homeMonogram', 'homeSubtitle', 'homeDisciplines', 'homeQuote', 'homeCtaText'].forEach(id => {
      document.getElementById(id).addEventListener('input', () => setSaveStatus('dirty'));
    });

    // Save Action
    document.getElementById('btnSaveHome').addEventListener('click', async () => {
      setSaveStatus('saving');
      const disciplinesRaw = document.getElementById('homeDisciplines').value;
      const quoteRaw = document.getElementById('homeQuote').value;

      home.fullName = document.getElementById('homeFullName').value.trim();
      home.monogram = document.getElementById('homeMonogram').value.trim();
      home.digitalPortfolioSubtitle = document.getElementById('homeSubtitle').value.trim();
      home.disciplines = disciplinesRaw.split(/[•,]/).map(s => s.trim()).filter(Boolean);
      home.quoteLines = quoteRaw.split('\n').map(s => s.trim()).filter(Boolean);
      home.ctaText = document.getElementById('homeCtaText').value.trim();

      try {
        await window.portfolioService.saveHomeData(home);
        setSaveStatus('saved', 'Cover Changes Saved');
        showToast('HOME cover updated successfully.', 'success');
      } catch (err) {
        setSaveStatus('error');
        showToast('Failed to save HOME cover: ' + err.message, 'error');
      }
    });
  }

  // ==========================================================================
  // 5. SECTION 2: ABOUT ME (SECTION -> PAGES[] Multi-page Architecture)
  // ==========================================================================

  async function renderAboutSection() {
    const pages = await window.portfolioService.getPages('about', true);

    adminMainStage.innerHTML = `
      <div class="stage-header">
        <div class="stage-title-wrap">
          <h2>ABOUT ME • Dynamic Content Pages</h2>
          <p>Manage logical pages for Chapter I. The public digital book dynamically maps these into desktop spreads and mobile jotter pages.</p>
        </div>
        <div class="stage-actions">
          <button class="btn btn-gold btn-sm" id="btnAddAboutPage">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Add New Page</span>
          </button>
        </div>
      </div>

      <div id="aboutPagesContainer">
        <!-- Rendered dynamically -->
      </div>
    `;

    const container = document.getElementById('aboutPagesContainer');

    if (pages.length === 0) {
      container.innerHTML = `
        <div class="empty-state-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-state-icon">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
          <div class="empty-state-title">No About Me Pages Created Yet</div>
          <p class="empty-state-caption">Add your first logical content page to introduce your identity, purpose, and engineering philosophy.</p>
          <button class="btn btn-gold btn-sm" id="btnEmptyAddAboutPage">+ Create Page 1</button>
        </div>
      `;
      document.getElementById('btnEmptyAddAboutPage').addEventListener('click', () => openPageEditorModal('about', null));
    } else {
      let html = '<div class="admin-card"><div class="card-header"><div class="card-title">Pages Sequence</div></div>';
      pages.forEach((page, idx) => {
        html += `
          <div class="page-item-card" data-page-id="${page.id}" style="display:flex; align-items:center; justify-content:space-between; padding:14px; background:var(--admin-bg-base); border:1px solid var(--admin-border-subtle); border-radius:6px; margin-bottom:10px;">
            <div style="display:flex; align-items:center; gap:16px;">
              <div class="order-btn-group">
                <button class="order-btn btn-move-up" data-id="${page.id}" data-idx="${idx}" ${idx === 0 ? 'disabled' : ''} title="Move Up">▲</button>
                <button class="order-btn btn-move-down" data-id="${page.id}" data-idx="${idx}" ${idx === pages.length - 1 ? 'disabled' : ''} title="Move Down">▼</button>
              </div>
              <div>
                <div style="font-weight:700; font-size:14px; color:#fff; display:flex; align-items:center; gap:10px;">
                  <span>Page ${idx + 1}: ${escapeHTML(page.title || 'Untitled Page')}</span>
                  <span class="badge-status ${page.status || 'draft'}">${(page.status || 'draft').toUpperCase()}</span>
                </div>
                <div style="font-size:12px; color:var(--admin-text-muted); margin-top:2px;">
                  ${escapeHTML(page.subtitle || 'No subtitle')} • ${escapeHTML((page.bodyText || '').substring(0, 70))}${page.bodyText && page.bodyText.length > 70 ? '...' : ''}
                </div>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <button class="btn btn-secondary btn-sm btn-edit-page" data-id="${page.id}">Edit Content</button>
              <button class="btn btn-outline-danger btn-sm btn-delete-page" data-id="${page.id}">Delete</button>
            </div>
          </div>
        `;
      });
      html += '</div>';
      container.innerHTML = html;

      // Event bindings for pages list
      container.querySelectorAll('.btn-edit-page').forEach(btn => {
        btn.addEventListener('click', () => {
          const p = pages.find(item => item.id === btn.dataset.id);
          if (p) openPageEditorModal('about', p);
        });
      });

      container.querySelectorAll('.btn-delete-page').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (confirm('Are you sure you want to delete this page?')) {
            await window.portfolioService.deletePage('about', btn.dataset.id);
            showToast('Page deleted.', 'info');
            refreshBadges();
            renderAboutSection();
          }
        });
      });

      container.querySelectorAll('.btn-move-up').forEach(btn => {
        btn.addEventListener('click', async () => {
          const idx = parseInt(btn.dataset.idx, 10);
          if (idx > 0) {
            const reordered = pages.slice();
            const temp = reordered[idx];
            reordered[idx] = reordered[idx - 1];
            reordered[idx - 1] = temp;
            await window.portfolioService.reorderPages('about', reordered.map(p => p.id));
            renderAboutSection();
          }
        });
      });

      container.querySelectorAll('.btn-move-down').forEach(btn => {
        btn.addEventListener('click', async () => {
          const idx = parseInt(btn.dataset.idx, 10);
          if (idx < pages.length - 1) {
            const reordered = pages.slice();
            const temp = reordered[idx];
            reordered[idx] = reordered[idx + 1];
            reordered[idx + 1] = temp;
            await window.portfolioService.reorderPages('about', reordered.map(p => p.id));
            renderAboutSection();
          }
        });
      });
    }

    document.getElementById('btnAddAboutPage').addEventListener('click', () => openPageEditorModal('about', null));
  }

  // Generic Modal Page Editor (Used by About, Projects, etc.)
  function openPageEditorModal(sectionId, existingPage = null) {
    const isNew = !existingPage;
    const page = existingPage ? Object.assign({}, existingPage) : {
      sectionId,
      title: '',
      subtitle: '',
      heading: '',
      bodyText: '',
      supportingInfo: '',
      mediaUrl: '',
      status: 'published'
    };

    modalDialog.innerHTML = `
      <div class="modal-header">
        <h3 class="modal-title">${isNew ? 'Create New Logical Page' : 'Edit Logical Page'}</h3>
        <button class="modal-close-btn" id="btnModalClose">&times;</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label" for="pageTitle">Page Title (Header Folio)</label>
          <input type="text" id="pageTitle" class="form-control" value="${escapeHTML(page.title || '')}" placeholder="e.g. OVERVIEW or IDENTITY & PURPOSE" required>
        </div>

        <div class="form-group">
          <label class="form-label" for="pageSubtitle">Page Subtitle</label>
          <input type="text" id="pageSubtitle" class="form-control" value="${escapeHTML(page.subtitle || '')}" placeholder="e.g. SYSTEMS ARCHITECTURE">
        </div>

        <div class="form-group">
          <label class="form-label" for="pageHeading">Main Content Heading</label>
          <input type="text" id="pageHeading" class="form-control" value="${escapeHTML(page.heading || '')}" placeholder="e.g. Core Engineering Focus">
        </div>

        <div class="form-group">
          <label class="form-label" for="pageBodyText">Body Text Content</label>
          <textarea id="pageBodyText" class="form-control" rows="5" placeholder="Enter clean descriptive content...">${escapeHTML(page.bodyText || '')}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label" for="pageSupporting">Supporting Information / Highlights</label>
          <textarea id="pageSupporting" class="form-control" rows="3" placeholder="Bullet points or key takeaways...">${escapeHTML(page.supportingInfo || '')}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Optional Page Image <span class="optional-tag">(Cloudinary Upload)</span></label>
          <div id="modalPageMediaDropzone" class="media-uploader-widget"></div>
        </div>

        <div class="form-group" style="display:flex; align-items:center; justify-content:space-between; margin-top:20px; padding-top:14px; border-top:1px solid rgba(255,255,255,0.08);">
          <label class="form-label" style="margin-bottom:0;">Publication State</label>
          <div class="publish-toggle ${page.status === 'published' ? 'is-published' : 'is-draft'}" id="modalPagePublishToggle">
            <span class="publish-toggle-option opt-draft">DRAFT</span>
            <span class="publish-toggle-option opt-published">PUBLISHED</span>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary btn-sm" id="btnModalCancel">Cancel</button>
        <button class="btn btn-gold btn-sm" id="btnModalSavePage">${isNew ? 'Create Page' : 'Save Page'}</button>
      </div>
    `;

    modalBackdrop.style.display = 'flex';
    document.getElementById('btnModalClose').addEventListener('click', closeModal);
    document.getElementById('btnModalCancel').addEventListener('click', closeModal);

    renderMediaUploader({
      containerId: 'modalPageMediaDropzone',
      currentUrl: page.mediaUrl,
      folder: `portfolio/${sectionId}`,
      onUrlChange: (newUrl) => { page.mediaUrl = newUrl; }
    });

    const toggle = document.getElementById('modalPagePublishToggle');
    toggle.addEventListener('click', () => {
      const isPub = toggle.classList.contains('is-published');
      page.status = isPub ? 'draft' : 'published';
      toggle.className = `publish-toggle ${page.status === 'published' ? 'is-published' : 'is-draft'}`;
    });

    document.getElementById('btnModalSavePage').addEventListener('click', async () => {
      const title = document.getElementById('pageTitle').value.trim();
      if (!title) {
        alert('Page title is required.');
        return;
      }

      page.title = title;
      page.subtitle = document.getElementById('pageSubtitle').value.trim();
      page.heading = document.getElementById('pageHeading').value.trim();
      page.bodyText = document.getElementById('pageBodyText').value.trim();
      page.supportingInfo = document.getElementById('pageSupporting').value.trim();

      try {
        await window.portfolioService.savePage(page);
        closeModal();
        showToast('Page saved successfully.', 'success');
        refreshBadges();
        if (sectionId === 'about') renderAboutSection();
        else renderSection(sectionId);
      } catch (err) {
        alert('Error saving page: ' + err.message);
      }
    });
  }

  // ==========================================================================
  // 6. SECTION 3: SKILLS (Categorized Skills — Strictly No Forced Images)
  // ==========================================================================

  async function renderSkillsSection() {
    const skills = await window.portfolioService.getItems('skills', true);
    const standardCategories = ['Cybersecurity', 'IT Automation with Python', 'DevOps', 'AI Automation', 'Web Development'];

    adminMainStage.innerHTML = `
      <div class="stage-header">
        <div class="stage-title-wrap">
          <h2>SKILLS • Technical Capabilities</h2>
          <p>Organize skills by technical category. Image upload is intentionally disabled for skills.</p>
        </div>
        <div class="stage-actions">
          <button class="btn btn-gold btn-sm" id="btnAddSkill">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Add New Skill</span>
          </button>
        </div>
      </div>

      <div id="skillsContainer">
        <!-- Rendered dynamically -->
      </div>
    `;

    const container = document.getElementById('skillsContainer');

    if (skills.length === 0) {
      container.innerHTML = `
        <div class="empty-state-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-state-icon">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
          <div class="empty-state-title">No Skills Added Yet</div>
          <p class="empty-state-caption">Add your technical disciplines and competencies across Cybersecurity, Cloud, Automation, and Engineering.</p>
          <button class="btn btn-gold btn-sm" id="btnEmptyAddSkill">+ Add First Skill</button>
        </div>
      `;
      document.getElementById('btnEmptyAddSkill').addEventListener('click', () => openSkillEditorModal(null, standardCategories));
    } else {
      // Group by category
      const grouped = {};
      skills.forEach(s => {
        const cat = s.category || 'General';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(s);
      });

      let html = '';
      for (const [cat, list] of Object.entries(grouped)) {
        html += `
          <div class="admin-card" style="margin-bottom:18px;">
            <div class="card-header">
              <div class="card-title">${escapeHTML(cat)} (${list.length})</div>
            </div>
            <div class="grid-3-col">
              ${list.map(skill => `
                <div style="background:var(--admin-bg-base); border:1px solid var(--admin-border-subtle); border-radius:6px; padding:12px; display:flex; flex-direction:column; justify-content:space-between; gap:10px;">
                  <div>
                    <div style="display:flex; align-items:center; justify-content:space-between;">
                      <span style="font-weight:700; color:#fff; font-size:13.5px;">${escapeHTML(skill.name)}</span>
                      <span class="badge-status ${skill.status || 'published'}">${(skill.status || 'published').toUpperCase()}</span>
                    </div>
                    ${skill.level ? `<div style="font-size:11px; color:var(--admin-gold); margin-top:2px;">${escapeHTML(skill.level)}</div>` : ''}
                    ${skill.description ? `<div style="font-size:12px; color:var(--admin-text-muted); margin-top:4px;">${escapeHTML(skill.description)}</div>` : ''}
                  </div>
                  <div style="display:flex; align-items:center; justify-content:flex-end; gap:6px; padding-top:8px; border-top:1px solid rgba(255,255,255,0.06);">
                    <button class="btn btn-secondary btn-sm btn-edit-skill" data-id="${skill.id}">Edit</button>
                    <button class="btn btn-outline-danger btn-sm btn-delete-skill" data-id="${skill.id}">Delete</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }
      container.innerHTML = html;

      container.querySelectorAll('.btn-edit-skill').forEach(btn => {
        btn.addEventListener('click', () => {
          const s = skills.find(item => item.id === btn.dataset.id);
          if (s) openSkillEditorModal(s, standardCategories);
        });
      });

      container.querySelectorAll('.btn-delete-skill').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (confirm('Delete this skill?')) {
            await window.portfolioService.deleteItem('skills', btn.dataset.id);
            showToast('Skill deleted.', 'info');
            refreshBadges();
            renderSkillsSection();
          }
        });
      });
    }

    document.getElementById('btnAddSkill').addEventListener('click', () => openSkillEditorModal(null, standardCategories));
  }

  function openSkillEditorModal(existingSkill = null, categories = ['Cybersecurity', 'IT Automation with Python', 'DevOps', 'AI Automation', 'Web Development']) {
    const isNew = !existingSkill;
    const skill = existingSkill ? Object.assign({}, existingSkill) : {
      name: '',
      category: categories[0] || 'Cybersecurity',
      level: 'Proficient',
      description: '',
      tools: [],
      status: 'published'
    };

    let toolsList = [];
    if (Array.isArray(skill.tools)) {
      toolsList = skill.tools.map(t => typeof t === 'string' ? { name: t, imageUrl: '' } : { name: t.name || '', imageUrl: t.imageUrl || '' });
    } else if (typeof skill.tools === 'string' && skill.tools.trim()) {
      toolsList = skill.tools.split(/[,•|]/).map(t => ({ name: t.trim(), imageUrl: '' })).filter(t => t.name);
    }

    modalDialog.innerHTML = `
      <div class="modal-header">
        <h3 class="modal-title">${isNew ? 'Add Technical Skill' : 'Edit Technical Skill'}</h3>
        <button class="modal-close-btn" id="btnModalClose">&times;</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label" for="skillName">Skill Name</label>
          <input type="text" id="skillName" class="form-control" value="${escapeHTML(skill.name)}" placeholder="e.g. Network Penetration Testing or Terraform" required>
        </div>

        <div class="form-group">
          <label class="form-label" for="skillCategory">Category</label>
          <input type="text" id="skillCategory" class="form-control" list="categoryOptions" value="${escapeHTML(skill.category)}" placeholder="Select or type category">
          <datalist id="categoryOptions">
            ${categories.map(c => `<option value="${escapeHTML(c)}"></option>`).join('')}
          </datalist>
        </div>

        <div class="form-group">
          <label class="form-label" for="skillLevel">Proficiency / Focus</label>
          <input type="text" id="skillLevel" class="form-control" value="${escapeHTML(skill.level || '')}" placeholder="e.g. Advanced, Production, Core Discipline">
        </div>

        <div class="form-group">
          <label class="form-label" for="skillDesc">Context / Details <span class="optional-tag">(Optional)</span></label>
          <textarea id="skillDesc" class="form-control" rows="3" placeholder="Brief technical context...">${escapeHTML(skill.description || '')}</textarea>
        </div>

        <div class="form-group" style="margin-top:16px;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
            <label class="form-label" style="margin-bottom:0;">Tools / Technologies <span class="optional-tag">(Optional)</span></label>
            <button type="button" class="btn btn-gold btn-sm" id="btnAddSkillTool" style="padding:3px 10px; font-size:11.5px;">+ Add Tool</button>
          </div>
          <div class="form-hint" style="margin-bottom:8px;">Add tools and technologies used in this skill. Logos are optional and standardized automatically on the public page.</div>
          <div id="skillToolsContainer" style="display:flex; flex-direction:column; gap:8px;"></div>
        </div>

        <div class="form-group" style="display:flex; align-items:center; justify-content:space-between; margin-top:20px; padding-top:14px; border-top:1px solid rgba(255,255,255,0.08);">
          <label class="form-label" style="margin-bottom:0;">Publication State</label>
          <div class="publish-toggle ${skill.status === 'published' ? 'is-published' : 'is-draft'}" id="modalSkillPublishToggle">
            <span class="publish-toggle-option opt-draft">DRAFT</span>
            <span class="publish-toggle-option opt-published">PUBLISHED</span>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary btn-sm" id="btnModalCancel">Cancel</button>
        <button class="btn btn-gold btn-sm" id="btnModalSaveSkill">${isNew ? 'Add Skill' : 'Save Skill'}</button>
      </div>
    `;

    modalBackdrop.style.display = 'flex';
    document.getElementById('btnModalClose').addEventListener('click', closeModal);
    document.getElementById('btnModalCancel').addEventListener('click', closeModal);

    const toggle = document.getElementById('modalSkillPublishToggle');
    toggle.addEventListener('click', () => {
      const isPub = toggle.classList.contains('is-published');
      skill.status = isPub ? 'draft' : 'published';
      toggle.className = `publish-toggle ${skill.status === 'published' ? 'is-published' : 'is-draft'}`;
    });

    // Tools Manager Logic
    const toolsContainer = document.getElementById('skillToolsContainer');

    function renderToolsUI() {
      if (toolsList.length === 0) {
        toolsContainer.innerHTML = `
          <div style="padding:10px; text-align:center; font-size:12px; color:var(--admin-text-muted); background:rgba(255,255,255,0.02); border:1px dashed rgba(255,255,255,0.1); border-radius:4px;">
            No tools added yet. Click &ldquo;+ Add Tool&rdquo; to add tools or technologies.
          </div>
        `;
        return;
      }

      toolsContainer.innerHTML = toolsList.map((tool, idx) => `
        <div class="skill-tool-editor-row" data-tool-idx="${idx}" style="display:flex; align-items:center; gap:8px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:5px; padding:7px 10px;">
          <div class="tool-preview-avatar" style="width:28px; height:28px; border-radius:3px; background:#000; border:1px solid rgba(212,175,55,0.3); display:flex; align-items:center; justify-content:center; flex-shrink:0; overflow:hidden;">
            ${tool.imageUrl ? `<img src="${escapeHTML(tool.imageUrl)}" alt="" style="width:100%; height:100%; object-fit:contain;" />` : `<span style="font-size:10px; color:#888;">✦</span>`}
          </div>
          <input type="text" class="form-control tool-name-field" value="${escapeHTML(tool.name || '')}" placeholder="Tool / Tech name (e.g. Wireshark)" style="flex:1.2; min-width:130px; font-size:12px; padding:5px 8px;" />
          <input type="text" class="form-control tool-img-field" value="${escapeHTML(tool.imageUrl || '')}" placeholder="Optional Logo URL" style="flex:1; min-width:120px; font-size:11.5px; padding:5px 8px;" />
          <label class="btn btn-secondary btn-sm" style="margin:0; padding:4px 8px; font-size:11px; cursor:pointer;" title="Upload Logo File">
            <span>Upload</span>
            <input type="file" accept="image/*" class="tool-file-uploader" style="display:none;" />
          </label>
          <button type="button" class="btn btn-outline-danger btn-sm btn-remove-tool" style="padding:4px 8px; font-size:13px; line-height:1;" title="Remove this tool">&times;</button>
        </div>
      `).join('');

      // Event bindings for each row
      toolsContainer.querySelectorAll('.skill-tool-editor-row').forEach(row => {
        const idx = parseInt(row.dataset.toolIdx, 10);
        const nameInput = row.querySelector('.tool-name-field');
        const imgInput = row.querySelector('.tool-img-field');
        const fileInput = row.querySelector('.tool-file-uploader');
        const removeBtn = row.querySelector('.btn-remove-tool');

        nameInput.addEventListener('input', () => {
          toolsList[idx].name = nameInput.value;
        });

        imgInput.addEventListener('input', () => {
          toolsList[idx].imageUrl = imgInput.value.trim();
          const avatar = row.querySelector('.tool-preview-avatar');
          if (avatar) {
            avatar.innerHTML = toolsList[idx].imageUrl ? `<img src="${escapeHTML(toolsList[idx].imageUrl)}" alt="" style="width:100%; height:100%; object-fit:contain;" />` : `<span style="font-size:10px; color:#888;">✦</span>`;
          }
        });

        fileInput.addEventListener('change', (e) => {
          const file = e.target.files && e.target.files[0];
          if (!file) return;
          if (file.size > 5 * 1024 * 1024) {
            alert('Image must be under 5MB.');
            return;
          }
          const reader = new FileReader();
          reader.onload = (loadEvt) => {
            toolsList[idx].imageUrl = loadEvt.target.result;
            renderToolsUI();
          };
          reader.readAsDataURL(file);
        });

        removeBtn.addEventListener('click', () => {
          toolsList.splice(idx, 1);
          renderToolsUI();
        });
      });
    }

    renderToolsUI();

    document.getElementById('btnAddSkillTool').addEventListener('click', () => {
      toolsList.push({ name: '', imageUrl: '' });
      renderToolsUI();
      const rows = toolsContainer.querySelectorAll('.tool-name-field');
      if (rows.length > 0) rows[rows.length - 1].focus();
    });

    document.getElementById('btnModalSaveSkill').addEventListener('click', async () => {
      const name = document.getElementById('skillName').value.trim();
      if (!name) {
        alert('Skill name is required.');
        return;
      }

      skill.name = name;
      skill.category = document.getElementById('skillCategory').value.trim() || 'General';
      skill.level = document.getElementById('skillLevel').value.trim();
      skill.description = document.getElementById('skillDesc').value.trim();

      // Collect current tools values from UI
      const rows = toolsContainer.querySelectorAll('.skill-tool-editor-row');
      const finalTools = [];
      rows.forEach(r => {
        const tName = (r.querySelector('.tool-name-field')?.value || '').trim();
        const tImg = (r.querySelector('.tool-img-field')?.value || '').trim();
        if (tName) {
          finalTools.push({ name: tName, imageUrl: tImg });
        }
      });
      skill.tools = finalTools;

      try {
        await window.portfolioService.saveItem('skills', skill);
        closeModal();
        showToast('Skill saved successfully.', 'success');
        refreshBadges();
        renderSkillsSection();
      } catch (err) {
        alert('Error saving skill: ' + err.message);
      }
    });
  }

  // ==========================================================================
  // 7. SECTION 4: PROJECTS (Permanent 5 Categories & Case-Study Architecture)
  // ==========================================================================

  const PROJECT_CATEGORIES = (window.PORTFOLIO_CONFIG && window.PORTFOLIO_CONFIG.projectCategories) || [
    'Web Development',
    'DevOps & Cloud',
    'Cybersecurity',
    'IT Automation with Python',
    'AI Automation'
  ];

  let activeAdminProjectCategory = 'all';

  async function renderProjectsSection() {
    const allProjects = await window.portfolioService.getItems('projects', true);

    // Normalize categories on legacy projects if needed
    allProjects.forEach(p => {
      if (!p.category || !PROJECT_CATEGORIES.includes(p.category)) {
        if (p.category && p.category.toLowerCase().includes('cyber')) p.category = 'Cybersecurity';
        else if (p.category && p.category.toLowerCase().includes('devops')) p.category = 'DevOps & Cloud';
        else if (p.category && p.category.toLowerCase().includes('python')) p.category = 'IT Automation with Python';
        else if (p.category && p.category.toLowerCase().includes('ai')) p.category = 'AI Automation';
        else p.category = 'Web Development';
      }
    });

    // Compute category counts
    const categoryCounts = {};
    PROJECT_CATEGORIES.forEach(cat => {
      categoryCounts[cat] = allProjects.filter(p => p.category === cat).length;
    });

    const filteredProjects = activeAdminProjectCategory === 'all' ? 
      allProjects : 
      allProjects.filter(p => p.category === activeAdminProjectCategory);

    // Sort by order
    filteredProjects.sort((a, b) => (a.order || 0) - (b.order || 0));

    adminMainStage.innerHTML = `
      <div class="stage-header">
        <div class="stage-title-wrap">
          <h2>PROJECTS • Systems &amp; Case Studies</h2>
          <p>Strictly organized across 5 permanent categories. Only categories with published projects appear publicly.</p>
        </div>
        <div class="stage-actions">
          <button class="btn btn-gold btn-sm" id="btnAddProject">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Add New Project</span>
          </button>
        </div>
      </div>

      <!-- Category Filter Tabs -->
      <div class="category-tab-strip" id="projectCategoryTabs">
        <button class="category-tab-btn ${activeAdminProjectCategory === 'all' ? 'active' : ''}" data-cat="all">
          <span>ALL CATEGORIES</span>
          <span class="category-tab-count">${allProjects.length}</span>
        </button>
        ${PROJECT_CATEGORIES.map(cat => `
          <button class="category-tab-btn ${activeAdminProjectCategory === cat ? 'active' : ''}" data-cat="${escapeHTML(cat)}">
            <span>${escapeHTML(cat.toUpperCase())}</span>
            <span class="category-tab-count">${categoryCounts[cat] || 0}</span>
          </button>
        `).join('')}
      </div>

      <div id="projectsContainer">
        <!-- Rendered dynamically -->
      </div>
    `;

    // Category Tab Switching
    document.querySelectorAll('#projectCategoryTabs .category-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeAdminProjectCategory = btn.dataset.cat;
        renderProjectsSection();
      });
    });

    const container = document.getElementById('projectsContainer');

    if (filteredProjects.length === 0) {
      const catLabel = activeAdminProjectCategory === 'all' ? 'portfolio' : activeAdminProjectCategory;
      container.innerHTML = `
        <div class="empty-state-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-state-icon">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
          <div class="empty-state-title">No Projects in ${escapeHTML(catLabel)}</div>
          <p class="empty-state-caption">Add your first project to this category. Once published, this category will automatically become visible on the public digital book.</p>
          <button class="btn btn-gold btn-sm" id="btnEmptyAddProject">+ Create ${escapeHTML(catLabel)} Project</button>
        </div>
      `;
      document.getElementById('btnEmptyAddProject').addEventListener('click', () => {
        openProjectEditorModal(null, activeAdminProjectCategory === 'all' ? PROJECT_CATEGORIES[0] : activeAdminProjectCategory);
      });
    } else {
      let html = '<div class="admin-card">';
      html += `
        <div class="card-header">
          <div class="card-title">
            <span>${escapeHTML(activeAdminProjectCategory === 'all' ? 'All Portfolio Projects' : activeAdminProjectCategory)}</span>
            <span class="category-badge-chip">${filteredProjects.length} PROJECT${filteredProjects.length === 1 ? '' : 'S'}</span>
          </div>
          <div class="card-subtitle">Reorder projects within category using ▲/▼ buttons</div>
        </div>
      `;

      filteredProjects.forEach((proj, idx) => {
        const techStr = proj.technologies || (Array.isArray(proj.techStack) ? proj.techStack.join(', ') : '');
        html += `
          <div class="project-item-card" style="display:flex; align-items:center; justify-content:space-between; padding:14px; background:var(--admin-bg-base); border:1px solid var(--admin-border-subtle); border-radius:6px; margin-bottom:12px; gap:16px;">
            <div style="display:flex; align-items:center; gap:14px; flex:1; overflow:hidden;">
              <div class="order-btn-group">
                <button class="order-btn btn-move-up" data-id="${proj.id}" data-idx="${idx}" ${idx === 0 ? 'disabled' : ''} title="Move Up">▲</button>
                <button class="order-btn btn-move-down" data-id="${proj.id}" data-idx="${idx}" ${idx === filteredProjects.length - 1 ? 'disabled' : ''} title="Move Down">▼</button>
              </div>
              ${proj.imageUrl ? `
                <img src="${escapeHTML(proj.imageUrl)}" alt="" style="width:52px; height:52px; object-fit:cover; border-radius:4px; border:1px solid rgba(255,255,255,0.12); flex-shrink:0;">
              ` : `
                <div style="width:52px; height:52px; background:rgba(212,175,55,0.06); border:1px solid rgba(212,175,55,0.25); border-radius:4px; display:flex; align-items:center; justify-content:center; color:var(--admin-gold); font-size:18px; flex-shrink:0;">✦</div>
              `}
              <div style="overflow:hidden;">
                <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                  <span style="font-weight:700; font-size:14.5px; color:#fff;">${escapeHTML(proj.title)}</span>
                  <span class="category-badge-chip">${escapeHTML(proj.category || 'Web Development')}</span>
                  <span class="badge-status ${proj.status || 'draft'}">${(proj.status || 'draft').toUpperCase()}</span>
                </div>
                ${proj.projectType ? `
                  <div style="font-size:11.5px; color:var(--admin-gold-light); font-weight:600; margin-top:3px; letter-spacing:0.04em;">
                    ${escapeHTML(proj.projectType)}
                  </div>
                ` : ''}
                <div style="font-size:12px; color:var(--admin-text-muted); margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                  ${escapeHTML(techStr ? `Tech: ${techStr}` : (proj.architectureSummary || proj.shortDesc || proj.description || 'No description'))}
                </div>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:8px; flex-shrink:0;">
              <button class="btn btn-secondary btn-sm btn-edit-proj" data-id="${proj.id}">Edit</button>
              <button class="btn btn-outline-danger btn-sm btn-delete-proj" data-id="${proj.id}">Delete</button>
            </div>
          </div>
        `;
      });
      html += '</div>';
      container.innerHTML = html;

      container.querySelectorAll('.btn-edit-proj').forEach(btn => {
        btn.addEventListener('click', () => {
          const p = allProjects.find(item => item.id === btn.dataset.id);
          if (p) openProjectEditorModal(p);
        });
      });

      container.querySelectorAll('.btn-delete-proj').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (confirm('Delete this project?')) {
            await window.portfolioService.deleteItem('projects', btn.dataset.id);
            showToast('Project deleted.', 'info');
            refreshBadges();
            renderProjectsSection();
          }
        });
      });

      container.querySelectorAll('.btn-move-up').forEach(btn => {
        btn.addEventListener('click', async () => {
          const idx = parseInt(btn.dataset.idx, 10);
          if (idx > 0) {
            const list = filteredProjects.slice();
            const temp = list[idx];
            list[idx] = list[idx - 1];
            list[idx - 1] = temp;
            
            // Assign sequential orders within this category
            list.forEach((p, i) => { p.order = i + 1; });
            for (const p of list) {
              await window.portfolioService.saveItem('projects', p);
            }
            showToast('Project order updated.', 'success');
            renderProjectsSection();
          }
        });
      });

      container.querySelectorAll('.btn-move-down').forEach(btn => {
        btn.addEventListener('click', async () => {
          const idx = parseInt(btn.dataset.idx, 10);
          if (idx < filteredProjects.length - 1) {
            const list = filteredProjects.slice();
            const temp = list[idx];
            list[idx] = list[idx + 1];
            list[idx + 1] = temp;

            list.forEach((p, i) => { p.order = i + 1; });
            for (const p of list) {
              await window.portfolioService.saveItem('projects', p);
            }
            showToast('Project order updated.', 'success');
            renderProjectsSection();
          }
        });
      });
    }

    document.getElementById('btnAddProject').addEventListener('click', () => {
      openProjectEditorModal(null, activeAdminProjectCategory === 'all' ? PROJECT_CATEGORIES[0] : activeAdminProjectCategory);
    });
  }

  function openProjectEditorModal(existingProject = null, defaultCategory = 'Web Development') {
    const isNew = !existingProject;
    const proj = existingProject ? Object.assign({}, existingProject) : {
      title: '',
      category: defaultCategory || PROJECT_CATEGORIES[0],
      projectType: '',
      technologies: '',
      skillsDemonstrated: '',
      architectureSummary: '',
      description: '',
      keyFeatures: '',
      specifications: '',
      liveUrl: '',
      githubUrl: '',
      videoUrl: '',
      imageUrl: '',
      imageOrientation: 'horizontal',
      status: 'published'
    };

    // Normalize backward-compatible fields
    if (!proj.category) proj.category = defaultCategory || PROJECT_CATEGORIES[0];
    if (!proj.technologies && proj.techStack) {
      proj.technologies = Array.isArray(proj.techStack) ? proj.techStack.join(', ') : String(proj.techStack);
    }
    if (!proj.architectureSummary && proj.shortDesc) {
      proj.architectureSummary = proj.shortDesc;
    }
    if (!proj.specifications && proj.detailedDesc) {
      proj.specifications = proj.detailedDesc;
    }
    if (!proj.imageOrientation) {
      proj.imageOrientation = 'horizontal';
    }

    modalDialog.innerHTML = `
      <div class="modal-header">
        <h3 class="modal-title">${isNew ? 'Create New Project Case Study' : 'Edit Project Case Study'}</h3>
        <button class="modal-close-btn" id="btnModalClose">&times;</button>
      </div>
      <div class="modal-body">
        
        <div class="form-group">
          <label class="form-label" for="projTitle">Project Title *</label>
          <input type="text" id="projTitle" class="form-control" value="${escapeHTML(proj.title)}" placeholder="e.g. Pony Website or Autonomous Cloud Sentinel Platform" required>
        </div>

        <div class="grid-2-col">
          <div class="form-group">
            <label class="form-label" for="projCategory">Primary Category *</label>
            <select id="projCategory" class="form-control" style="background:var(--admin-bg-base); color:#fff; cursor:pointer;" required>
              ${PROJECT_CATEGORIES.map(cat => `
                <option value="${escapeHTML(cat)}" ${proj.category === cat ? 'selected' : ''}>${escapeHTML(cat)}</option>
              `).join('')}
            </select>
            <div class="form-hint">Every project belongs to exactly 1 permanent category.</div>
          </div>

          <div class="form-group">
            <label class="form-label" for="projType">Project Type / Short Label</label>
            <input type="text" id="projType" class="form-control" value="${escapeHTML(proj.projectType || '')}" placeholder="e.g. E-Commerce / Business Website, Threat Engine">
            <div class="form-hint">Displayed below title on the public page.</div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="projTech">Technologies &amp; Tools</label>
          <input type="text" id="projTech" class="form-control" value="${escapeHTML(proj.technologies || '')}" placeholder="e.g. Python, JavaScript, HTML, CSS, Firebase, Cloudinary, GitHub, Vercel">
          <div class="form-hint">Comma-separated technologies. Rendered as bold badges on the public page.</div>
        </div>

        <div class="form-group">
          <label class="form-label" for="projSkills">Skills Demonstrated <span class="optional-tag">(Optional)</span></label>
          <input type="text" id="projSkills" class="form-control" value="${escapeHTML(proj.skillsDemonstrated || '')}" placeholder="e.g. Threat Intelligence, Asynchronous Architecture, Hardened API Security">
        </div>

        <div class="form-group">
          <label class="form-label" for="projDesc">Project Overview / Description</label>
          <textarea id="projDesc" class="form-control" rows="3" placeholder="Clear, readable explanation of what this project is and the business/technical problem it solves...">${escapeHTML(proj.description || '')}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label" for="projFeatures">Key Features</label>
          <textarea id="projFeatures" class="form-control" rows="3" placeholder="Enter key features (one per line, with or without bullet points):&#10;• Real-time automated packet inspection&#10;• Multi-region failover telemetry&#10;• Instant notification pipeline">${escapeHTML(proj.keyFeatures || '')}</textarea>
          <div class="form-hint">Rendered as a stately bulleted feature list on the case study page.</div>
        </div>

        <div class="form-group">
          <label class="form-label" for="projArch">Architecture / Technical Approach Summary</label>
          <textarea id="projArch" class="form-control" rows="2" placeholder="Explanation of how the system was built, microservice architecture, frameworks used...">${escapeHTML(proj.architectureSummary || '')}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label" for="projSpecs">Detailed Specifications <span class="optional-tag">(Optional)</span></label>
          <textarea id="projSpecs" class="form-control" rows="2" placeholder="Sub-200ms mitigation latency • 10,000+ packets/sec analysis • High-availability Redis store">${escapeHTML(proj.specifications || '')}</textarea>
        </div>

        <div class="grid-2-col">
          <div class="form-group">
            <label class="form-label" for="projLiveUrl">Live Website URL <span class="optional-tag">(Optional)</span></label>
            <input type="url" id="projLiveUrl" class="form-control" value="${escapeHTML(proj.liveUrl || '')}" placeholder="https://...">
          </div>

          <div class="form-group">
            <label class="form-label" for="projGithubUrl">GitHub Repository URL <span class="optional-tag">(Optional)</span></label>
            <input type="url" id="projGithubUrl" class="form-control" value="${escapeHTML(proj.githubUrl || '')}" placeholder="https://github.com/...">
          </div>
        </div>

        <div class="grid-2-col">
          <div class="form-group">
            <label class="form-label" for="projVideoUrl">Demo Video URL <span class="optional-tag">(Optional YouTube/Loom/MP4)</span></label>
            <input type="url" id="projVideoUrl" class="form-control" value="${escapeHTML(proj.videoUrl || '')}" placeholder="https://...">
          </div>

          <div class="form-group">
            <label class="form-label" for="projOrientation">Image Orientation</label>
            <select id="projOrientation" class="form-control" style="background:var(--admin-bg-base); color:#fff; cursor:pointer;">
              <option value="horizontal" ${proj.imageOrientation === 'horizontal' ? 'selected' : ''}>Horizontal (Landscape / Architecture Diagram)</option>
              <option value="vertical" ${proj.imageOrientation === 'vertical' ? 'selected' : ''}>Vertical (Portrait / Mobile Screenshot)</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Project Image / Architecture Diagram <span class="optional-tag">(Cloudinary Upload / Data URI)</span></label>
          <div id="modalProjMediaDropzone" class="media-uploader-widget"></div>
        </div>

        <div class="form-group" style="display:flex; align-items:center; justify-content:space-between; margin-top:20px; padding-top:14px; border-top:1px solid rgba(255,255,255,0.08);">
          <div>
            <label class="form-label" style="margin-bottom:2px;">Publication State</label>
            <div class="form-hint" style="margin-top:0;">Only published projects appear in the public book.</div>
          </div>
          <div class="publish-toggle ${proj.status === 'published' ? 'is-published' : 'is-draft'}" id="modalProjPublishToggle">
            <span class="publish-toggle-option opt-draft">DRAFT</span>
            <span class="publish-toggle-option opt-published">PUBLISHED</span>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary btn-sm" id="btnModalCancel">Cancel</button>
        <button class="btn btn-gold btn-sm" id="btnModalSaveProj">${isNew ? 'Create Project' : 'Save Project'}</button>
      </div>
    `;

    modalBackdrop.style.display = 'flex';
    document.getElementById('btnModalClose').addEventListener('click', closeModal);
    document.getElementById('btnModalCancel').addEventListener('click', closeModal);

    renderMediaUploader({
      containerId: 'modalProjMediaDropzone',
      currentUrl: proj.imageUrl,
      folder: 'portfolio/projects',
      onUrlChange: (newUrl) => { proj.imageUrl = newUrl; }
    });

    const toggle = document.getElementById('modalProjPublishToggle');
    toggle.addEventListener('click', () => {
      const isPub = toggle.classList.contains('is-published');
      proj.status = isPub ? 'draft' : 'published';
      toggle.className = `publish-toggle ${proj.status === 'published' ? 'is-published' : 'is-draft'}`;
    });

    document.getElementById('btnModalSaveProj').addEventListener('click', async () => {
      const title = document.getElementById('projTitle').value.trim();
      if (!title) {
        alert('Project title is required.');
        return;
      }

      proj.title = title;
      proj.category = document.getElementById('projCategory').value;
      proj.projectType = document.getElementById('projType').value.trim();
      proj.technologies = document.getElementById('projTech').value.trim();
      proj.skillsDemonstrated = document.getElementById('projSkills').value.trim();
      proj.description = document.getElementById('projDesc').value.trim();
      proj.keyFeatures = document.getElementById('projFeatures').value.trim();
      proj.architectureSummary = document.getElementById('projArch').value.trim();
      proj.specifications = document.getElementById('projSpecs').value.trim();
      proj.liveUrl = document.getElementById('projLiveUrl').value.trim();
      proj.githubUrl = document.getElementById('projGithubUrl').value.trim();
      proj.videoUrl = document.getElementById('projVideoUrl').value.trim();
      proj.imageOrientation = document.getElementById('projOrientation').value;

      // Keep legacy fields populated for backward compatibility
      proj.shortDesc = proj.architectureSummary || proj.description;
      proj.detailedDesc = proj.specifications || proj.keyFeatures;
      proj.techStack = proj.technologies.split(/[,•|]/).map(t => t.trim()).filter(Boolean);

      try {
        await window.portfolioService.saveItem('projects', proj);
        closeModal();
        showToast('Project saved successfully.', 'success');
        refreshBadges();
        renderProjectsSection();
      } catch (err) {
        alert('Error saving project: ' + err.message);
      }
    });
  }

  // ==========================================================================
  // 8. SECTION 5: CERTIFICATES (Separate from Education — Cloudinary Media)
  // ==========================================================================

  async function renderCertificatesSection() {
    const certs = await window.portfolioService.getItems('certificates', true);

    adminMainStage.innerHTML = `
      <div class="stage-header">
        <div class="stage-title-wrap">
          <h2>CERTIFICATES • Accreditations &amp; Badges</h2>
          <p>Strictly separate from formal education. Upload credential badges, verification links, and issuing authority details.</p>
        </div>
        <div class="stage-actions">
          <button class="btn btn-gold btn-sm" id="btnAddCert">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Add Certificate</span>
          </button>
        </div>
      </div>

      <div id="certsContainer">
        <!-- Rendered dynamically -->
      </div>
    `;

    const container = document.getElementById('certsContainer');

    if (certs.length === 0) {
      container.innerHTML = `
        <div class="empty-state-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-state-icon">
            <circle cx="12" cy="8" r="7"></circle>
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
          </svg>
          <div class="empty-state-title">No Certificates Added Yet</div>
          <p class="empty-state-caption">Add your cloud, security, or engineering certifications with optional badge images and verification URLs.</p>
          <button class="btn btn-gold btn-sm" id="btnEmptyAddCert">+ Add First Certificate</button>
        </div>
      `;
      document.getElementById('btnEmptyAddCert').addEventListener('click', () => openCertEditorModal(null));
    } else {
      let html = '<div class="admin-card"><div class="card-header"><div class="card-title">Certificates List</div></div>';
      certs.forEach((cert, idx) => {
        html += `
          <div class="cert-item-card" style="display:flex; align-items:center; justify-content:space-between; padding:14px; background:var(--admin-bg-base); border:1px solid var(--admin-border-subtle); border-radius:6px; margin-bottom:12px; gap:16px;">
            <div style="display:flex; align-items:center; gap:14px; flex:1;">
              <div class="order-btn-group">
                <button class="order-btn btn-move-up" data-id="${cert.id}" data-idx="${idx}" ${idx === 0 ? 'disabled' : ''}>▲</button>
                <button class="order-btn btn-move-down" data-id="${cert.id}" data-idx="${idx}" ${idx === certs.length - 1 ? 'disabled' : ''}>▼</button>
              </div>
              ${cert.imageUrl ? `<img src="${escapeHTML(cert.imageUrl)}" alt="" style="width:44px; height:44px; object-fit:contain; border-radius:4px; background:#000; padding:2px;">` : ''}
              <div>
                <div style="display:flex; align-items:center; gap:10px;">
                  <span style="font-weight:700; font-size:14px; color:#fff;">${escapeHTML(cert.title)}</span>
                  <span class="badge-status ${cert.status || 'draft'}">${(cert.status || 'draft').toUpperCase()}</span>
                </div>
                <div style="font-size:12px; color:var(--admin-text-muted); margin-top:2px;">
                  ${escapeHTML(cert.issuer || 'Issuing Authority')} • ${escapeHTML(cert.date || 'Date')}
                </div>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <button class="btn btn-secondary btn-sm btn-edit-cert" data-id="${cert.id}">Edit</button>
              <button class="btn btn-outline-danger btn-sm btn-delete-cert" data-id="${cert.id}">Delete</button>
            </div>
          </div>
        `;
      });
      html += '</div>';
      container.innerHTML = html;

      container.querySelectorAll('.btn-edit-cert').forEach(btn => {
        btn.addEventListener('click', () => {
          const c = certs.find(item => item.id === btn.dataset.id);
          if (c) openCertEditorModal(c);
        });
      });

      container.querySelectorAll('.btn-delete-cert').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (confirm('Delete this certificate?')) {
            await window.portfolioService.deleteItem('certificates', btn.dataset.id);
            showToast('Certificate deleted.', 'info');
            refreshBadges();
            renderCertificatesSection();
          }
        });
      });

      container.querySelectorAll('.btn-move-up').forEach(btn => {
        btn.addEventListener('click', async () => {
          const idx = parseInt(btn.dataset.idx, 10);
          if (idx > 0) {
            const reordered = certs.slice();
            const temp = reordered[idx];
            reordered[idx] = reordered[idx - 1];
            reordered[idx - 1] = temp;
            await window.portfolioService.reorderItems('certificates', reordered.map(p => p.id));
            renderCertificatesSection();
          }
        });
      });

      container.querySelectorAll('.btn-move-down').forEach(btn => {
        btn.addEventListener('click', async () => {
          const idx = parseInt(btn.dataset.idx, 10);
          if (idx < certs.length - 1) {
            const reordered = certs.slice();
            const temp = reordered[idx];
            reordered[idx] = reordered[idx + 1];
            reordered[idx + 1] = temp;
            await window.portfolioService.reorderItems('certificates', reordered.map(p => p.id));
            renderCertificatesSection();
          }
        });
      });
    }

    document.getElementById('btnAddCert').addEventListener('click', () => openCertEditorModal(null));
  }

  function openCertEditorModal(existingCert = null) {
    const isNew = !existingCert;
    const cert = existingCert ? Object.assign({}, existingCert) : {
      title: '',
      issuer: '',
      date: '',
      credentialUrl: '',
      imageUrl: '',
      description: '',
      status: 'published'
    };

    modalDialog.innerHTML = `
      <div class="modal-header">
        <h3 class="modal-title">${isNew ? 'Add Certificate' : 'Edit Certificate'}</h3>
        <button class="modal-close-btn" id="btnModalClose">&times;</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label" for="certTitle">Certificate Title</label>
          <input type="text" id="certTitle" class="form-control" value="${escapeHTML(cert.title)}" placeholder="e.g. AWS Certified Security - Specialty" required>
        </div>

        <div class="grid-2-col">
          <div class="form-group">
            <label class="form-label" for="certIssuer">Issuing Organization</label>
            <input type="text" id="certIssuer" class="form-control" value="${escapeHTML(cert.issuer || '')}" placeholder="e.g. Amazon Web Services or CompTIA">
          </div>

          <div class="form-group">
            <label class="form-label" for="certDate">Issue Date / Validity</label>
            <input type="text" id="certDate" class="form-control" value="${escapeHTML(cert.date || '')}" placeholder="e.g. 2025 or Current">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="certCredUrl">Credential Verification Link <span class="optional-tag">(Optional)</span></label>
          <input type="url" id="certCredUrl" class="form-control" value="${escapeHTML(cert.credentialUrl || '')}" placeholder="https://credly.com/...">
        </div>

        <div class="form-group">
          <label class="form-label">Certificate Badge Image <span class="optional-tag">(Cloudinary Upload)</span></label>
          <div id="modalCertMediaDropzone" class="media-uploader-widget"></div>
        </div>

        <div class="form-group">
          <label class="form-label" for="certDesc">Description / Skills Validated <span class="optional-tag">(Optional)</span></label>
          <textarea id="certDesc" class="form-control" rows="3" placeholder="Brief validation overview...">${escapeHTML(cert.description || '')}</textarea>
        </div>

        <div class="form-group" style="display:flex; align-items:center; justify-content:space-between; margin-top:20px; padding-top:14px; border-top:1px solid rgba(255,255,255,0.08);">
          <label class="form-label" style="margin-bottom:0;">Publication State</label>
          <div class="publish-toggle ${cert.status === 'published' ? 'is-published' : 'is-draft'}" id="modalCertPublishToggle">
            <span class="publish-toggle-option opt-draft">DRAFT</span>
            <span class="publish-toggle-option opt-published">PUBLISHED</span>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary btn-sm" id="btnModalCancel">Cancel</button>
        <button class="btn btn-gold btn-sm" id="btnModalSaveCert">${isNew ? 'Add Certificate' : 'Save Certificate'}</button>
      </div>
    `;

    modalBackdrop.style.display = 'flex';
    document.getElementById('btnModalClose').addEventListener('click', closeModal);
    document.getElementById('btnModalCancel').addEventListener('click', closeModal);

    renderMediaUploader({
      containerId: 'modalCertMediaDropzone',
      currentUrl: cert.imageUrl,
      folder: 'portfolio/certificates',
      onUrlChange: (newUrl) => { cert.imageUrl = newUrl; }
    });

    const toggle = document.getElementById('modalCertPublishToggle');
    toggle.addEventListener('click', () => {
      const isPub = toggle.classList.contains('is-published');
      cert.status = isPub ? 'draft' : 'published';
      toggle.className = `publish-toggle ${cert.status === 'published' ? 'is-published' : 'is-draft'}`;
    });

    document.getElementById('btnModalSaveCert').addEventListener('click', async () => {
      const title = document.getElementById('certTitle').value.trim();
      if (!title) {
        alert('Certificate title is required.');
        return;
      }

      cert.title = title;
      cert.issuer = document.getElementById('certIssuer').value.trim();
      cert.date = document.getElementById('certDate').value.trim();
      cert.credentialUrl = document.getElementById('certCredUrl').value.trim();
      cert.description = document.getElementById('certDesc').value.trim();

      try {
        await window.portfolioService.saveItem('certificates', cert);
        closeModal();
        showToast('Certificate saved successfully.', 'success');
        refreshBadges();
        renderCertificatesSection();
      } catch (err) {
        alert('Error saving certificate: ' + err.message);
      }
    });
  }

  // ==========================================================================
  // 9. SECTION 6: EDUCATION (Separate from Certificates)
  // ==========================================================================

  async function renderEducationSection() {
    const edu = await window.portfolioService.getItems('education', true);

    adminMainStage.innerHTML = `
      <div class="stage-header">
        <div class="stage-title-wrap">
          <h2>EDUCATION • Academic Foundations</h2>
          <p>Degrees, universities, and formal academic achievements. Distinct from professional certificates.</p>
        </div>
        <div class="stage-actions">
          <button class="btn btn-gold btn-sm" id="btnAddEdu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Add Education</span>
          </button>
        </div>
      </div>

      <div id="eduContainer">
        <!-- Rendered dynamically -->
      </div>
    `;

    const container = document.getElementById('eduContainer');

    if (edu.length === 0) {
      container.innerHTML = `
        <div class="empty-state-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-state-icon">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
            <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
          </svg>
          <div class="empty-state-title">No Education Records Added Yet</div>
          <p class="empty-state-caption">Add your university degree, coursework, or academic qualifications.</p>
          <button class="btn btn-gold btn-sm" id="btnEmptyAddEdu">+ Add Education</button>
        </div>
      `;
      document.getElementById('btnEmptyAddEdu').addEventListener('click', () => openEduEditorModal(null));
    } else {
      let html = '<div class="admin-card"><div class="card-header"><div class="card-title">Academic Records</div></div>';
      edu.forEach((item, idx) => {
        html += `
          <div class="edu-item-card" style="display:flex; align-items:center; justify-content:space-between; padding:14px; background:var(--admin-bg-base); border:1px solid var(--admin-border-subtle); border-radius:6px; margin-bottom:12px;">
            <div style="display:flex; align-items:center; gap:14px;">
              <div class="order-btn-group">
                <button class="order-btn btn-move-up" data-id="${item.id}" data-idx="${idx}" ${idx === 0 ? 'disabled' : ''}>▲</button>
                <button class="order-btn btn-move-down" data-id="${item.id}" data-idx="${idx}" ${idx === edu.length - 1 ? 'disabled' : ''}>▼</button>
              </div>
              <div>
                <div style="display:flex; align-items:center; gap:10px;">
                  <span style="font-weight:700; font-size:14px; color:#fff;">${escapeHTML(item.degree)}</span>
                  <span class="badge-status ${item.status || 'draft'}">${(item.status || 'draft').toUpperCase()}</span>
                </div>
                <div style="font-size:12px; color:var(--admin-text-muted); margin-top:2px;">
                  ${escapeHTML(item.institution || 'University')} • ${escapeHTML(item.period || 'Period')}
                </div>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <button class="btn btn-secondary btn-sm btn-edit-edu" data-id="${item.id}">Edit</button>
              <button class="btn btn-outline-danger btn-sm btn-delete-edu" data-id="${item.id}">Delete</button>
            </div>
          </div>
        `;
      });
      html += '</div>';
      container.innerHTML = html;

      container.querySelectorAll('.btn-edit-edu').forEach(btn => {
        btn.addEventListener('click', () => {
          const eItem = edu.find(it => it.id === btn.dataset.id);
          if (eItem) openEduEditorModal(eItem);
        });
      });

      container.querySelectorAll('.btn-delete-edu').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (confirm('Delete this education record?')) {
            await window.portfolioService.deleteItem('education', btn.dataset.id);
            showToast('Record deleted.', 'info');
            refreshBadges();
            renderEducationSection();
          }
        });
      });
    }

    document.getElementById('btnAddEdu').addEventListener('click', () => openEduEditorModal(null));
  }

  function openEduEditorModal(existingEdu = null) {
    const isNew = !existingEdu;
    const edu = existingEdu ? Object.assign({}, existingEdu) : {
      degree: '',
      institution: '',
      period: '',
      description: '',
      credentialUrl: '',
      status: 'published'
    };

    modalDialog.innerHTML = `
      <div class="modal-header">
        <h3 class="modal-title">${isNew ? 'Add Academic Degree' : 'Edit Academic Record'}</h3>
        <button class="modal-close-btn" id="btnModalClose">&times;</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label" for="eduDegree">Degree / Program Title</label>
          <input type="text" id="eduDegree" class="form-control" value="${escapeHTML(edu.degree)}" placeholder="e.g. B.Sc. Computer Science / Cybersecurity" required>
        </div>

        <div class="grid-2-col">
          <div class="form-group">
            <label class="form-label" for="eduInst">Institution / University</label>
            <input type="text" id="eduInst" class="form-control" value="${escapeHTML(edu.institution || '')}" placeholder="University Name">
          </div>

          <div class="form-group">
            <label class="form-label" for="eduPeriod">Years / Period</label>
            <input type="text" id="eduPeriod" class="form-control" value="${escapeHTML(edu.period || '')}" placeholder="e.g. 2021 – 2025">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="eduDesc">Academic Highlights / Coursework <span class="optional-tag">(Optional)</span></label>
          <textarea id="eduDesc" class="form-control" rows="3" placeholder="Key academic focus, research, or honors...">${escapeHTML(edu.description || '')}</textarea>
        </div>

        <div class="form-group" style="display:flex; align-items:center; justify-content:space-between; margin-top:20px; padding-top:14px; border-top:1px solid rgba(255,255,255,0.08);">
          <label class="form-label" style="margin-bottom:0;">Publication State</label>
          <div class="publish-toggle ${edu.status === 'published' ? 'is-published' : 'is-draft'}" id="modalEduPublishToggle">
            <span class="publish-toggle-option opt-draft">DRAFT</span>
            <span class="publish-toggle-option opt-published">PUBLISHED</span>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary btn-sm" id="btnModalCancel">Cancel</button>
        <button class="btn btn-gold btn-sm" id="btnModalSaveEdu">${isNew ? 'Add Record' : 'Save Record'}</button>
      </div>
    `;

    modalBackdrop.style.display = 'flex';
    document.getElementById('btnModalClose').addEventListener('click', closeModal);
    document.getElementById('btnModalCancel').addEventListener('click', closeModal);

    const toggle = document.getElementById('modalEduPublishToggle');
    toggle.addEventListener('click', () => {
      const isPub = toggle.classList.contains('is-published');
      edu.status = isPub ? 'draft' : 'published';
      toggle.className = `publish-toggle ${edu.status === 'published' ? 'is-published' : 'is-draft'}`;
    });

    document.getElementById('btnModalSaveEdu').addEventListener('click', async () => {
      const degree = document.getElementById('eduDegree').value.trim();
      if (!degree) {
        alert('Degree title is required.');
        return;
      }

      edu.degree = degree;
      edu.institution = document.getElementById('eduInst').value.trim();
      edu.period = document.getElementById('eduPeriod').value.trim();
      edu.description = document.getElementById('eduDesc').value.trim();

      try {
        await window.portfolioService.saveItem('education', edu);
        closeModal();
        showToast('Education record saved.', 'success');
        refreshBadges();
        renderEducationSection();
      } catch (err) {
        alert('Error saving education record: ' + err.message);
      }
    });
  }

  // ==========================================================================
  // 10. SECTION 7: JOURNEY / EXPERIENCE (Flexible Milestones)
  // ==========================================================================

  async function renderJourneySection() {
    const journey = await window.portfolioService.getItems('journey', true);

    adminMainStage.innerHTML = `
      <div class="stage-header">
        <div class="stage-title-wrap">
          <h2>JOURNEY • Evolution &amp; Milestones</h2>
          <p>Career stages, professional experience, learning breakthroughs, and pivotal development milestones.</p>
        </div>
        <div class="stage-actions">
          <button class="btn btn-gold btn-sm" id="btnAddJourney">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Add Milestone</span>
          </button>
        </div>
      </div>

      <div id="journeyContainer">
        <!-- Rendered dynamically -->
      </div>
    `;

    const container = document.getElementById('journeyContainer');

    if (journey.length === 0) {
      container.innerHTML = `
        <div class="empty-state-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-state-icon">
            <circle cx="12" cy="12" r="10"></circle>
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
          </svg>
          <div class="empty-state-title">No Journey Milestones Added Yet</div>
          <p class="empty-state-caption">Add key milestones in your progression as an engineer and cybersecurity specialist.</p>
          <button class="btn btn-gold btn-sm" id="btnEmptyAddJourney">+ Add Milestone</button>
        </div>
      `;
      document.getElementById('btnEmptyAddJourney').addEventListener('click', () => openJourneyEditorModal(null));
    } else {
      let html = '<div class="admin-card"><div class="card-header"><div class="card-title">Chronological Milestones</div></div>';
      journey.forEach((item, idx) => {
        html += `
          <div class="journey-item-card" style="display:flex; align-items:center; justify-content:space-between; padding:14px; background:var(--admin-bg-base); border:1px solid var(--admin-border-subtle); border-radius:6px; margin-bottom:12px;">
            <div style="display:flex; align-items:center; gap:14px;">
              <div class="order-btn-group">
                <button class="order-btn btn-move-up" data-id="${item.id}" data-idx="${idx}" ${idx === 0 ? 'disabled' : ''}>▲</button>
                <button class="order-btn btn-move-down" data-id="${item.id}" data-idx="${idx}" ${idx === journey.length - 1 ? 'disabled' : ''}>▼</button>
              </div>
              <div>
                <div style="display:flex; align-items:center; gap:10px;">
                  <span style="font-weight:700; font-size:14px; color:#fff;">${escapeHTML(item.title)}</span>
                  <span class="badge-status ${item.status || 'draft'}">${(item.status || 'draft').toUpperCase()}</span>
                </div>
                <div style="font-size:12px; color:var(--admin-text-muted); margin-top:2px;">
                  ${escapeHTML(item.milestoneType || 'Milestone')} ${item.milestoneStatus ? '• ' + escapeHTML(item.milestoneStatus) : ''} ${item.period ? '• ' + escapeHTML(item.period) : ''}
                </div>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <button class="btn btn-secondary btn-sm btn-edit-journey" data-id="${item.id}">Edit</button>
              <button class="btn btn-outline-danger btn-sm btn-delete-journey" data-id="${item.id}">Delete</button>
            </div>
          </div>
        `;
      });
      html += '</div>';
      container.innerHTML = html;

      container.querySelectorAll('.btn-edit-journey').forEach(btn => {
        btn.addEventListener('click', () => {
          const j = journey.find(it => it.id === btn.dataset.id);
          if (j) openJourneyEditorModal(j);
        });
      });

      container.querySelectorAll('.btn-delete-journey').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (confirm('Delete this milestone?')) {
            await window.portfolioService.deleteItem('journey', btn.dataset.id);
            showToast('Milestone deleted.', 'info');
            refreshBadges();
            renderJourneySection();
          }
        });
      });
    }

    document.getElementById('btnAddJourney').addEventListener('click', () => openJourneyEditorModal(null));
  }

  function openJourneyEditorModal(existingJourney = null) {
    const isNew = !existingJourney;
    const j = existingJourney ? Object.assign({}, existingJourney) : {
      title: '',
      milestoneType: 'Learning',
      milestoneStatus: 'Completed',
      period: '',
      story: '',
      achievement: '',
      learned: '',
      nextSteps: '',
      imageUrl: '',
      relatedLink: '',
      relatedLinkLabel: '',
      status: 'published'
    };

    const milestoneTypes = ['Education', 'Learning', 'Award', 'Project Milestone', 'Professional Experience', 'Team Experience', 'Future Goal'];
    const milestoneStatuses = ['Completed', 'In Progress', 'Upcoming'];

    modalDialog.innerHTML = `
      <div class="modal-header">
        <h3 class="modal-title">${isNew ? 'Add Journey Milestone' : 'Edit Milestone'}</h3>
        <button class="modal-close-btn" id="btnModalClose">&times;</button>
      </div>
      <div class="modal-body">

        <div class="form-group">
          <label class="form-label" for="jTitle">Milestone Title <span style="color:#ff6b6b;">*</span></label>
          <input type="text" id="jTitle" class="form-control" value="${escapeHTML(j.title)}" placeholder="e.g. Completed Google Cybersecurity Certificate" required>
        </div>

        <div class="grid-2-col">
          <div class="form-group">
            <label class="form-label" for="jType">Milestone Type</label>
            <select id="jType" class="form-control">
              ${milestoneTypes.map(t => `<option value="${escapeHTML(t)}" ${j.milestoneType === t ? 'selected' : ''}>${escapeHTML(t)}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="jMStatus">Status</label>
            <select id="jMStatus" class="form-control">
              ${milestoneStatuses.map(s => `<option value="${escapeHTML(s)}" ${j.milestoneStatus === s ? 'selected' : ''}>${escapeHTML(s)}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="jPeriod">Period / Timeline <span class="optional-tag">(Optional)</span></label>
          <input type="text" id="jPeriod" class="form-control" value="${escapeHTML(j.period || '')}" placeholder="e.g. Jan 2024 – Present">
        </div>

        <div class="form-group">
          <label class="form-label" for="jStory">The Story <span class="optional-tag">(Optional)</span></label>
          <textarea id="jStory" class="form-control" rows="4" placeholder="Narrate this milestone — what happened, what you did, the context...">${escapeHTML(j.story || j.description || '')}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label" for="jAchieve">Key Achievement <span class="optional-tag">(Optional)</span></label>
          <textarea id="jAchieve" class="form-control" rows="2" placeholder="The standout result or accomplishment from this milestone...">${escapeHTML(j.achievement || j.achievements || '')}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label" for="jLearned">What I Learned <span class="optional-tag">(Optional)</span></label>
          <textarea id="jLearned" class="form-control" rows="2" placeholder="Skills, insights, or lessons gained from this experience...">${escapeHTML(j.learned || '')}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label" for="jNextSteps">Next Steps <span class="optional-tag">(Optional)</span></label>
          <textarea id="jNextSteps" class="form-control" rows="2" placeholder="What this milestone leads to — what comes next...">${escapeHTML(j.nextSteps || '')}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Milestone Image <span class="optional-tag">(Optional — Cloudinary Upload)</span></label>
          <div id="jImageUploaderContainer"></div>
        </div>

        <div class="grid-2-col">
          <div class="form-group">
            <label class="form-label" for="jLink">Related Link <span class="optional-tag">(Optional)</span></label>
            <input type="text" id="jLink" class="form-control" value="${escapeHTML(j.relatedLink || j.link || '')}" placeholder="https://...">
          </div>
          <div class="form-group">
            <label class="form-label" for="jLinkLabel">Link Button Label <span class="optional-tag">(Optional)</span></label>
            <input type="text" id="jLinkLabel" class="form-control" value="${escapeHTML(j.relatedLinkLabel || '')}" placeholder="e.g. VIEW CERTIFICATE">
          </div>
        </div>

        <div class="form-group" style="display:flex; align-items:center; justify-content:space-between; margin-top:20px; padding-top:14px; border-top:1px solid rgba(255,255,255,0.08);">
          <label class="form-label" style="margin-bottom:0;">Publication State</label>
          <div class="publish-toggle ${j.status === 'published' ? 'is-published' : 'is-draft'}" id="modalJPublishToggle">
            <span class="publish-toggle-option opt-draft">DRAFT</span>
            <span class="publish-toggle-option opt-published">PUBLISHED</span>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary btn-sm" id="btnModalCancel">Cancel</button>
        <button class="btn btn-gold btn-sm" id="btnModalSaveJ">${isNew ? 'Add Milestone' : 'Save Milestone'}</button>
      </div>
    `;

    modalBackdrop.style.display = 'flex';
    document.getElementById('btnModalClose').addEventListener('click', closeModal);
    document.getElementById('btnModalCancel').addEventListener('click', closeModal);

    // Image uploader
    renderMediaUploader({
      containerId: 'jImageUploaderContainer',
      currentUrl: j.imageUrl || j.mediaUrl || '',
      folder: 'portfolio/journey',
      onUrlChange: (url) => { j.imageUrl = url; }
    });

    const toggle = document.getElementById('modalJPublishToggle');
    toggle.addEventListener('click', () => {
      const isPub = toggle.classList.contains('is-published');
      j.status = isPub ? 'draft' : 'published';
      toggle.className = `publish-toggle ${j.status === 'published' ? 'is-published' : 'is-draft'}`;
    });

    document.getElementById('btnModalSaveJ').addEventListener('click', async () => {
      const title = document.getElementById('jTitle').value.trim();
      if (!title) {
        alert('Milestone title is required.');
        return;
      }

      j.title = title;
      j.milestoneType = document.getElementById('jType').value;
      j.milestoneStatus = document.getElementById('jMStatus').value;
      j.period = document.getElementById('jPeriod').value.trim();
      j.story = document.getElementById('jStory').value.trim();
      j.achievement = document.getElementById('jAchieve').value.trim();
      j.learned = document.getElementById('jLearned').value.trim();
      j.nextSteps = document.getElementById('jNextSteps').value.trim();
      j.relatedLink = document.getElementById('jLink').value.trim();
      j.relatedLinkLabel = document.getElementById('jLinkLabel').value.trim() || 'RELATED LINK';
      // j.imageUrl already set via onUrlChange callback above

      try {
        await window.portfolioService.saveItem('journey', j);
        closeModal();
        showToast('Milestone saved successfully.', 'success');
        refreshBadges();
        renderJourneySection();
      } catch (err) {
        alert('Error saving milestone: ' + err.message);
      }
    });
  }


  // ==========================================================================
  // 11. SECTION 8: CONTACT (Direct Channels & Settings)
  // ==========================================================================

  async function renderContactSection() {
    const contactPages = await window.portfolioService.getPages('contact', true);
    const contactData = contactPages[0] || {
      email: '',
      linkedIn: '',
      github: '',
      introText: '',
      additionalNotes: '',
      status: 'published'
    };

    adminMainStage.innerHTML = `
      <div class="stage-header">
        <div class="stage-title-wrap">
          <h2>CONTACT • Communication Channels</h2>
          <p>Configure the public contact page — the final chapter of your portfolio.</p>
        </div>
        <div class="stage-actions">
          <button class="btn btn-gold btn-sm" id="btnSaveContact">Save Contact Info</button>
        </div>
      </div>

      <div class="admin-card" style="max-width: 720px;">
        <div class="card-header">
          <div class="card-title">Let's Connect — Public Page Content</div>
        </div>

        <div class="form-group">
          <label class="form-label" for="contactIntro">Introduction / Bio <span class="optional-tag">(Optional)</span></label>
          <textarea id="contactIntro" class="form-control" rows="3" placeholder="e.g. Whether you have an opportunity, a collaboration, or just want to talk engineering — I'm open to the conversation.">${escapeHTML(contactData.introText || contactData.additionalNotes || '')}</textarea>
          <div style="font-size:11px; color:var(--admin-text-muted); margin-top:4px;">Displayed beneath the "LET'S CONNECT" heading on the public contact page.</div>
        </div>

        <div style="height:1px; background:rgba(255,255,255,0.06); margin: 16px 0;"></div>

        <div class="form-group">
          <label class="form-label" for="contactEmail">Public Email Address</label>
          <input type="email" id="contactEmail" class="form-control" value="${escapeHTML(contactData.email || '')}" placeholder="you@example.com">
        </div>

        <div class="form-group">
          <label class="form-label" for="contactLinkedIn">LinkedIn Profile URL <span class="optional-tag">(Optional)</span></label>
          <input type="url" id="contactLinkedIn" class="form-control" value="${escapeHTML(contactData.linkedIn || '')}" placeholder="https://linkedin.com/in/your-profile">
        </div>

        <div class="form-group">
          <label class="form-label" for="contactGithub">GitHub Profile URL <span class="optional-tag">(Optional)</span></label>
          <input type="url" id="contactGithub" class="form-control" value="${escapeHTML(contactData.github || '')}" placeholder="https://github.com/your-username">
        </div>
      </div>
    `;

    ['contactEmail', 'contactLinkedIn', 'contactGithub', 'contactIntro'].forEach(id => {
      document.getElementById(id).addEventListener('input', () => setSaveStatus('dirty'));
    });

    document.getElementById('btnSaveContact').addEventListener('click', async () => {
      setSaveStatus('saving');
      contactData.email = document.getElementById('contactEmail').value.trim();
      contactData.linkedIn = document.getElementById('contactLinkedIn').value.trim();
      contactData.github = document.getElementById('contactGithub').value.trim();
      contactData.introText = document.getElementById('contactIntro').value.trim();
      contactData.additionalNotes = contactData.introText; // legacy compat
      contactData.sectionId = 'contact';
      contactData.title = "LET'S CONNECT";
      contactData.subtitle = 'COMMUNICATION CHANNELS';
      contactData.status = 'published';

      try {
        await window.portfolioService.savePage(contactData);
        setSaveStatus('saved', 'Contact Info Saved');
        showToast('Contact page updated successfully.', 'success');
      } catch (err) {
        setSaveStatus('error');
        showToast('Failed to save contact info: ' + err.message, 'error');
      }
    });
  }


  // ==========================================================================
  // 12. SYSTEM CONFIG: Firebase & Cloudinary Settings
  // ==========================================================================

  function renderCloudConfigSection() {
    const config = window.portfolioService.config;
    const fb = config.firebase || {};
    const cld = config.cloudinary || {};

    adminMainStage.innerHTML = `
      <div class="stage-header">
        <div class="stage-title-wrap">
          <h2>SYSTEM • Firebase &amp; Cloudinary Configuration</h2>
          <p>Configure live cloud credentials or inspect the robust local storage engine.</p>
        </div>
        <div class="stage-actions">
          <button class="btn btn-gold btn-sm" id="btnSaveConfig">Save Configuration</button>
        </div>
      </div>

      <div class="grid-2-col">
        <!-- Firebase Setup -->
        <div class="admin-card">
          <div class="card-header">
            <div class="card-title">Firebase Web App Config</div>
          </div>
          <div class="form-group">
            <label class="form-label" for="fbApiKey">API Key</label>
            <input type="text" id="fbApiKey" class="form-control" value="${escapeHTML(fb.apiKey || '')}">
          </div>
          <div class="form-group">
            <label class="form-label" for="fbAuthDomain">Auth Domain</label>
            <input type="text" id="fbAuthDomain" class="form-control" value="${escapeHTML(fb.authDomain || '')}">
          </div>
          <div class="form-group">
            <label class="form-label" for="fbProjectId">Project ID</label>
            <input type="text" id="fbProjectId" class="form-control" value="${escapeHTML(fb.projectId || '')}">
          </div>
          <div class="form-group">
            <label class="form-label" for="fbAppId">App ID</label>
            <input type="text" id="fbAppId" class="form-control" value="${escapeHTML(fb.appId || '')}">
          </div>
        </div>

        <!-- Cloudinary Setup -->
        <div class="admin-card">
          <div class="card-header">
            <div class="card-title">Cloudinary Direct Media Upload</div>
          </div>
          <div class="form-group">
            <label class="form-label" for="cldCloudName">Cloud Name</label>
            <input type="text" id="cldCloudName" class="form-control" value="${escapeHTML(cld.cloudName || 'demo')}">
          </div>
          <div class="form-group">
            <label class="form-label" for="cldPreset">Unsigned Upload Preset</label>
            <input type="text" id="cldPreset" class="form-control" value="${escapeHTML(cld.uploadPreset || 'portfolio_unsigned')}">
            <div class="form-hint">Security: Only unsigned upload presets are supported. API secret keys are never accepted or stored.</div>
          </div>

          <div style="margin-top:24px; padding-top:16px; border-top:1px solid rgba(255,255,255,0.06);">
            <button class="btn btn-secondary btn-sm btn-block" id="btnResetBaseline">Reset All Data to Master Baseline</button>
            <div class="form-hint" style="text-align:center; margin-top:6px;">Reverts local modifications to the approved baseline for Samuel Mercy Oluwatobi.</div>
          </div>
        </div>
      </div>

      <!-- Cloud Synchronization & Disaster Recovery -->
      <div class="admin-card" style="margin-top:24px;">
        <div class="card-header">
          <div class="card-title">Cloud Database Synchronization &amp; Backup Tools</div>
        </div>
        <p style="color:var(--text-muted); font-size:13px; line-height:1.6; margin-bottom:16px;">
          Synchronize your local portfolio content into Google Cloud Firestore so that public visitors can immediately view all published projects, skills, certificates, education, and career milestones.
        </p>

        <div style="display:flex; flex-wrap:wrap; gap:12px; align-items:center;">
          <button class="btn btn-gold btn-sm" id="btnSyncFirestore">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;margin-right:6px;display:inline-block;vertical-align:middle;">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
            </svg>
            Sync Local Data to Cloud Database (Firestore)
          </button>

          <label class="btn btn-secondary btn-sm" style="margin:0; cursor:pointer;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;margin-right:6px;display:inline-block;vertical-align:middle;">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            Restore from Backup JSON
            <input type="file" id="backupFileInput" accept=".json" style="display:none;">
          </label>

          <button class="btn btn-secondary btn-sm" id="btnExportBackup">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;margin-right:6px;display:inline-block;vertical-align:middle;">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
            </svg>
            Export Backup JSON
          </button>
        </div>
      </div>
    `;

    document.getElementById('btnSaveConfig').addEventListener('click', () => {
      const newConfig = {
        firebase: Object.assign({}, fb, {
          apiKey: document.getElementById('fbApiKey').value.trim(),
          authDomain: document.getElementById('fbAuthDomain').value.trim(),
          projectId: document.getElementById('fbProjectId').value.trim(),
          appId: document.getElementById('fbAppId').value.trim()
        }),
        cloudinary: {
          cloudName: document.getElementById('cldCloudName').value.trim(),
          uploadPreset: document.getElementById('cldPreset').value.trim()
        }
      };

      window.portfolioService.saveConfigOverride(newConfig);
      showToast('Cloud configuration saved.', 'success');
    });

    document.getElementById('btnResetBaseline').addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all data to the approved master baseline? This will overwrite local draft edits.')) {
        window.portfolioService.resetToBaseline();
        showToast('Reset to approved baseline.', 'info');
        refreshBadges();
        renderSection(activeSection);
      }
    });

    const btnSyncFirestore = document.getElementById('btnSyncFirestore');
    if (btnSyncFirestore) {
      btnSyncFirestore.addEventListener('click', async () => {
        if (!window.portfolioService.isAuthenticated()) {
          showToast('Please authenticate with Firebase first.', 'error');
          return;
        }
        btnSyncFirestore.disabled = true;
        btnSyncFirestore.textContent = 'Syncing to Firestore...';
        try {
          const res = await window.portfolioService.syncLocalToFirestore();
          console.log('[SyncReport]', res);

          const totalUploaded = (res.home ? 1 : 0) +
            (res.sections.count || 0) +
            (res.pages.count || 0) +
            (res.projects.count || 0) +
            (res.skills.count || 0) +
            (res.certificates.count || 0) +
            (res.education.count || 0) +
            (res.journey.count || 0);

          if (res.errors && res.errors.length > 0 && totalUploaded === 0) {
            console.error('Firestore sync errors:', res.errors);
            showToast(`Cloud Sync FAILED: 0 items written. ${res.errors[0]}`, 'error');
          } else {
            showToast(`Sync complete! ${totalUploaded} records processed. Check report modal.`, res.errors.length > 0 ? 'info' : 'success');
          }

          // Build Detailed Verification Report Modal
          const reportHtml = `
            <div class="modal-header">
              <h3>Cloud Database Synchronization Report</h3>
              <button class="modal-close" id="btnModalCloseReport">&times;</button>
            </div>
            <div class="modal-body" style="font-size:13px; line-height:1.6; max-height:65vh; overflow-y:auto;">
              <div style="background:rgba(212,175,55,0.08); border:1px solid rgba(212,175,55,0.25); border-radius:6px; padding:12px; margin-bottom:16px;">
                <strong>Sync Summary:</strong>
                <ul style="margin:8px 0 0 18px; padding:0;">
                  <li><strong>Cover Settings (HOME):</strong> ${res.home ? 'Uploaded' : 'Failed / Skipped'}</li>
                  <li><strong>Sections (Chapters):</strong> ${res.sections.count} uploaded (${res.sections.ids.join(', ')})</li>
                  <li><strong>Pages (Dynamic Spread Pages):</strong> ${res.pages.count} uploaded</li>
                  <li><strong>Projects:</strong> ${res.projects.count} uploaded</li>
                  <li><strong>Skills:</strong> ${res.skills.count} uploaded</li>
                  <li><strong>Certificates:</strong> ${res.certificates.count} uploaded</li>
                  <li><strong>Education:</strong> ${res.education.count} uploaded</li>
                  <li><strong>Journey Milestones:</strong> ${res.journey.count} uploaded</li>
                  <li><strong>Large Images Migrated to Cloudinary:</strong> ${res.migratedImages.length > 0 ? res.migratedImages.join(', ') : 'None needed (all under limit)'}</li>
                </ul>
              </div>

              <div style="margin-bottom:16px;">
                <strong>Document ID Discrepancy &amp; Orphan Check:</strong>
                <p style="color:var(--text-muted); font-size:12px; margin:4px 0 8px 0;">
                  Cloud documents without local matches are preserved untouched (automatic deletion disabled per policy):
                </p>
                <pre style="background:rgba(0,0,0,0.4); padding:10px; border-radius:4px; font-size:11px; max-height:140px; overflow:auto;">${escapeHTML(JSON.stringify(res.comparison, null, 2))}</pre>
              </div>

              ${res.errors.length > 0 ? `
                <div style="background:rgba(220,53,69,0.1); border:1px solid rgba(220,53,69,0.3); border-radius:6px; padding:12px; color:#ff8080;">
                  <strong>Errors Encountered (${res.errors.length}):</strong>
                  <ul style="margin:6px 0 0 18px; padding:0;">
                    ${res.errors.map(e => `<li>${escapeHTML(e)}</li>`).join('')}
                  </ul>
                </div>
              ` : `
                <div style="color:#70e090; font-size:12px;">All writes succeeded with 0 errors.</div>
              `}
            </div>
            <div class="modal-footer">
              <button class="btn btn-gold btn-sm" id="btnModalDismissReport">Close Report</button>
            </div>
          `;

          openModal(reportHtml);
          const closeBtn = document.getElementById('btnModalCloseReport');
          const dismissBtn = document.getElementById('btnModalDismissReport');
          if (closeBtn) closeBtn.addEventListener('click', closeModal);
          if (dismissBtn) dismissBtn.addEventListener('click', closeModal);

        } catch (err) {
          console.error('Sync failed:', err);
          showToast(`Sync failed: ${err.message}`, 'error');
        } finally {
          btnSyncFirestore.disabled = false;
          btnSyncFirestore.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;margin-right:6px;display:inline-block;vertical-align:middle;">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
            </svg>
            Sync Local Data to Cloud Database (Firestore)
          `;
        }
      });
    }

    const backupFileInput = document.getElementById('backupFileInput');
    if (backupFileInput) {
      backupFileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            window.portfolioService.importBackupData(event.target.result);
            showToast('Backup restored successfully!', 'success');
            refreshBadges();
            renderSection(activeSection);
          } catch (err) {
            showToast(`Restore failed: ${err.message}`, 'error');
          }
        };
        reader.readAsText(file);
      });
    }

    const btnExportBackup = document.getElementById('btnExportBackup');
    if (btnExportBackup) {
      btnExportBackup.addEventListener('click', () => {
        try {
          const backup = window.portfolioService.exportBackupData();
          const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `SMO-portfolio-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          showToast('Backup exported.', 'success');
        } catch (err) {
          showToast(`Export failed: ${err.message}`, 'error');
        }
      });
    }
  }

  // ==========================================================================
  // 13. Reusable Cloudinary Direct Media Uploader Widget
  // ==========================================================================

  function renderMediaUploader({ containerId, currentUrl = '', folder = 'portfolio', onUrlChange }) {
    const container = document.getElementById(containerId);
    if (!container) return;

    function renderView() {
      if (currentUrl) {
        container.innerHTML = `
          <div class="media-preview-container">
            <img src="${escapeHTML(currentUrl)}" alt="Preview" class="media-preview-thumb">
            <div class="media-preview-details">
              <div class="media-preview-url" title="${escapeHTML(currentUrl)}">${escapeHTML(currentUrl)}</div>
              <div style="display:flex; gap:8px;">
                <label class="btn btn-secondary btn-sm" style="margin:0; cursor:pointer;">
                  <span>Replace</span>
                  <input type="file" accept="image/*,video/*" style="display:none;" class="uploader-file-input">
                </label>
                <button type="button" class="btn btn-outline-danger btn-sm btn-remove-media">Remove</button>
              </div>
            </div>
          </div>
        `;

        container.querySelector('.btn-remove-media').addEventListener('click', () => {
          currentUrl = '';
          onUrlChange('');
          renderView();
        });
      } else {
        container.innerHTML = `
          <label class="media-dropzone" style="display:block; margin:0;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="dropzone-icon">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <div class="dropzone-text">Click or drag &amp; drop to upload media</div>
            <div class="dropzone-hint">Uploads directly to Cloudinary CDN (Images &amp; Videos)</div>
            <input type="file" accept="image/*,video/*" style="display:none;" class="uploader-file-input">
          </label>
        `;
      }

      const fileInput = container.querySelector('.uploader-file-input');
      if (fileInput) {
        fileInput.addEventListener('change', async (e) => {
          const file = e.target.files && e.target.files[0];
          if (!file) return;

          container.innerHTML = `<div style="text-align:center; padding:20px; font-size:12px; color:var(--admin-gold);">Uploading to Cloudinary...</div>`;

          try {
            const res = await window.portfolioService.uploadMedia(file, folder);
            currentUrl = res.secure_url || res.url;
            onUrlChange(currentUrl);
            renderView();
            showToast('Media uploaded to Cloudinary successfully.', 'success');
          } catch (err) {
            alert('Upload failed: ' + err.message);
            renderView();
          }
        });
      }
    }

    renderView();
  }

})();

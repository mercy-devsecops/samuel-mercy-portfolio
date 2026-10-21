/**
 * SAMUEL MERCY OLUWATOBI — SHARED PORTFOLIO DATA SERVICE
 * 
 * Provides a unified, reactive data layer for:
 * 1. Private Admin (Read/Write, Drafts, Ordering, Media Upload)
 * 2. Public Book Engine (Reads Published content dynamically)
 * 
 * BACKEND ADAPTERS:
 * - Firebase Authentication (Login, Logout, Session tracking)
 * - Firebase Firestore (Structured cloud document database)
 * - Cloudinary (Direct unsigned upload for images/videos with ZERO exposed secrets)
 * - Offline/Local Mirror (IndexedDB & LocalStorage fallback ensuring instant load & offline editing)
 */

(function(window) {
  'use strict';

  const STORAGE_KEY = 'smo_portfolio_data_v1';
  const AUTH_SESSION_KEY = 'smo_admin_session_v1';
  const CONFIG_OVERRIDE_KEY = 'smo_config_override_v1';

  class PortfolioService {
    constructor() {
      this.config = this._loadConfig();
      this.listeners = new Map();
      this.currentUser = null;
      this.isFirebaseReady = false;
      this.db = null;
      this.auth = null;
      this._authUnsubscribe = null; // Holds onAuthStateChanged unsubscribe fn

      // Initialize local data mirror
      this.localData = this._initLocalData();

      // Initialize Firebase if SDK is available
      this._initFirebase();
      this._restoreSession();
    }

    // ========================================================================
    // 1. Configuration & Firebase Initialization
    // ========================================================================

    _loadConfig() {
      const base = window.PORTFOLIO_CONFIG || {};
      const override = localStorage.getItem(CONFIG_OVERRIDE_KEY);
      if (override) {
        try {
          return Object.assign({}, base, JSON.parse(override));
        } catch (e) {
          console.warn('Failed to parse config override', e);
        }
      }
      return base;
    }

    saveConfigOverride(newConfig) {
      this.config = Object.assign({}, this.config, newConfig);
      localStorage.setItem(CONFIG_OVERRIDE_KEY, JSON.stringify(newConfig));
      this._initFirebase();
      this.emit('config:changed', this.config);
    }

    _initFirebase() {
      // Check if Firebase compat SDK is present and real credentials are configured
      if (window.firebase && this.config.firebase &&
          this.config.firebase.apiKey !== "AIzaSyDemoPlaceholderKeyForPortfolioAdmin") {
        try {
          // Detach any existing auth listener before re-initializing
          if (this._authUnsubscribe) {
            this._authUnsubscribe();
            this._authUnsubscribe = null;
          }

          // Initialize the Firebase app once; reuse the existing instance if already started
          if (!window.firebase.apps.length) {
            window.firebase.initializeApp(this.config.firebase);
          }

          this.auth = window.firebase.auth();
          this.db = window.firebase.firestore();
          this.isFirebaseReady = true;

          // Attach auth state listener — store unsubscribe handle to allow teardown
          this._authUnsubscribe = this.auth.onAuthStateChanged((user) => {
            this.currentUser = user ? { email: user.email, uid: user.uid, isLive: true } : null;
            this.emit('auth:stateChanged', this.currentUser);
          });
          console.log('[PortfolioService] Firebase connected successfully.');
        } catch (err) {
          console.warn('[PortfolioService] Firebase init failed, running on local storage fallback:', err);
          this.isFirebaseReady = false;
        }
      } else {
        console.log('[PortfolioService] Firebase credentials not configured — running on local storage engine.');
      }
    }

    _restoreSession() {
      const savedSession = localStorage.getItem(AUTH_SESSION_KEY);
      if (savedSession && !this.currentUser) {
        try {
          const parsed = JSON.parse(savedSession);
          // Only restore sessions created by real Firebase Auth (isLive: true).
          // Sessions with isLive: false were created by the removed development
          // fallback and must not be trusted. Purge them on detection.
          if (!parsed.isLive) {
            console.log('[PortfolioService] Discarding insecure local session — Firebase Auth required.');
            localStorage.removeItem(AUTH_SESSION_KEY);
            return;
          }
          this.currentUser = parsed;
          this.emit('auth:stateChanged', this.currentUser);
        } catch (e) {
          localStorage.removeItem(AUTH_SESSION_KEY);
        }
      }
    }

    // ========================================================================
    // 2. Authentication
    // ========================================================================

    async login(email, password) {
      if (!email || !password) {
        throw new Error('Email and password are required.');
      }

      // If live Firebase is configured, authenticate with Firebase
      if (this.isFirebaseReady && this.auth) {
        try {
          const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
          this.currentUser = {
            email: userCredential.user.email,
            uid: userCredential.user.uid,
            isLive: true
          };
          localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(this.currentUser));
          this.emit('auth:stateChanged', this.currentUser);
          return this.currentUser;
        } catch (err) {
          throw new Error(err.message || 'Firebase authentication failed.');
        }
      }
      // ── Firebase is not yet configured ──────────────────────────────────────
      // The insecure development fallback that accepted any 6-character password
      // has been removed for security.
      //
      // To enable Admin access:
      //   1. Create a Firebase project at https://console.firebase.google.com
      //   2. Enable Email/Password Authentication in the Firebase Console.
      //   3. Replace the placeholder values in portfolio-config.js with your
      //      real Firebase Web App configuration (apiKey, projectId, etc.).
      //
      // Once portfolio-config.js contains real credentials, Firebase Auth will
      // handle all login requests securely through the code path above.
      throw new Error(
        'Admin access requires Firebase Authentication. ' +
        'Please configure your Firebase credentials in portfolio-config.js to enable login.'
      );
    }

    async logout() {
      if (this.isFirebaseReady && this.auth) {
        try {
          await this.auth.signOut();
        } catch (err) {
          console.warn('Firebase signout error:', err);
        }
      }
      this.currentUser = null;
      localStorage.removeItem(AUTH_SESSION_KEY);
      this.emit('auth:stateChanged', null);
    }

    isAuthenticated() {
      return !!this.currentUser;
    }

    getCurrentUser() {
      return this.currentUser;
    }

    // ========================================================================
    // 3. Local Data Mirror & Persistence
    // ========================================================================

    _initLocalData() {
      const baseline = (window.PORTFOLIO_CONFIG && window.PORTFOLIO_CONFIG.baseline) ? 
        JSON.parse(JSON.stringify(window.PORTFOLIO_CONFIG.baseline)) : {};
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Check if parsed has valid items; if not, or if baseline has richer data, upgrade/merge
          const hasParsedItems = parsed && parsed.items && (
            (parsed.items.projects && parsed.items.projects.length > 0) ||
            (parsed.items.skills && parsed.items.skills.length > 0)
          );
          const hasBaselineItems = baseline && baseline.items && (
            (baseline.items.projects && baseline.items.projects.length > 0) ||
            (baseline.items.skills && baseline.items.skills.length > 0)
          );

          if (!hasParsedItems && hasBaselineItems) {
            const merged = Object.assign({}, baseline, parsed, {
              home: Object.assign({}, baseline.home || {}, parsed.home || {}),
              sections: (parsed.sections && parsed.sections.length > 0) ? parsed.sections : (baseline.sections || []),
              pages: (parsed.pages && Object.keys(parsed.pages).length > 0) ? parsed.pages : (baseline.pages || {}),
              items: Object.assign({}, baseline.items || {}, parsed.items || {})
            });
            if (baseline.items) {
              for (const [key, arr] of Object.entries(baseline.items)) {
                if ((!merged.items[key] || merged.items[key].length === 0) && arr && arr.length > 0) {
                  merged.items[key] = arr;
                }
              }
            }
            if (baseline.pages) {
              for (const [secId, pList] of Object.entries(baseline.pages)) {
                if ((!merged.pages[secId] || merged.pages[secId].length === 0) && pList && pList.length > 0) {
                  merged.pages[secId] = pList;
                }
              }
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
            return merged;
          }
          return parsed;
        } catch (e) {
          console.warn('Corrupted local storage data. Resetting to baseline.', e);
        }
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(baseline));
      return baseline;
    }

    _persistLocalData() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.localData));
        this.emit('data:changed', this.localData);
      } catch (err) {
        console.error('Failed to persist local data:', err);
      }
    }

    // Reset to approved master baseline
    resetToBaseline() {
      const baseline = (window.PORTFOLIO_CONFIG && window.PORTFOLIO_CONFIG.baseline) ? 
        JSON.parse(JSON.stringify(window.PORTFOLIO_CONFIG.baseline)) : {};
      this.localData = baseline;
      this._persistLocalData();
      return this.localData;
    }

    // Import full backup JSON
    importBackupData(backupJson) {
      let rawData = null;
      if (typeof backupJson === 'string') {
        try {
          rawData = JSON.parse(backupJson);
        } catch (e) {
          throw new Error('Invalid JSON format.');
        }
      } else {
        rawData = backupJson;
      }

      let target = null;
      if (rawData && rawData.data && rawData.data.portfolioData) {
        target = rawData.data.portfolioData;
      } else if (rawData && rawData.portfolioData) {
        target = rawData.portfolioData;
      } else if (rawData && rawData.sections && rawData.items) {
        target = rawData;
      }

      if (!target || typeof target !== 'object') {
        throw new Error('Unrecognized portfolio backup format. Could not locate portfolio data.');
      }

      this.localData = JSON.parse(JSON.stringify(target));
      this._persistLocalData();
      return this.localData;
    }

    // Export current portfolio data
    exportBackupData() {
      return {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        author: 'Samuel Mercy Oluwatobi',
        data: {
          portfolioData: JSON.parse(JSON.stringify(this.localData)),
          configOverride: localStorage.getItem(CONFIG_OVERRIDE_KEY) ? JSON.parse(localStorage.getItem(CONFIG_OVERRIDE_KEY)) : null
        }
      };
    }

    // Synchronize all local portfolio content into Cloud Firestore (Merge mode)
    async syncLocalToFirestore() {
      if (!this.isFirebaseReady || !this.db) {
        throw new Error('Firebase Firestore is not initialized or connected.');
      }
      if (!this.isAuthenticated()) {
        throw new Error('Admin authentication required. Please sign in to sync with Firestore.');
      }

      const results = {
        home: false,
        sections: 0,
        pages: 0,
        items: 0,
        errors: []
      };

      // 1. Settings / Home
      if (this.localData.home) {
        try {
          await this.db.collection('settings').doc('home').set(this.localData.home, { merge: true });
          results.home = true;
        } catch (err) {
          results.errors.push(`Settings/Home sync error: ${err.message}`);
        }
      }

      // 2. Sections
      if (Array.isArray(this.localData.sections)) {
        for (const sec of this.localData.sections) {
          try {
            await this.db.collection('sections').doc(sec.id).set(sec, { merge: true });
            results.sections++;
          } catch (err) {
            results.errors.push(`Section ${sec.id} sync error: ${err.message}`);
          }
        }
      }

      // 3. Pages
      if (this.localData.pages && typeof this.localData.pages === 'object') {
        for (const [secId, pageList] of Object.entries(this.localData.pages)) {
          if (Array.isArray(pageList)) {
            for (const page of pageList) {
              try {
                await this.db.collection('pages').doc(page.id).set(page, { merge: true });
                results.pages++;
              } catch (err) {
                results.errors.push(`Page ${page.id} sync error: ${err.message}`);
              }
            }
          }
        }
      }

      // 4. Structured Items (skills, projects, certificates, education, journey)
      if (this.localData.items && typeof this.localData.items === 'object') {
        for (const [colName, itemList] of Object.entries(this.localData.items)) {
          if (Array.isArray(itemList)) {
            for (const item of itemList) {
              try {
                await this.db.collection(colName).doc(item.id).set(item, { merge: true });
                results.items++;
              } catch (err) {
                results.errors.push(`Item ${colName}/${item.id} sync error: ${err.message}`);
              }
            }
          }
        }
      }

      return results;
    }

    // ========================================================================
    // 4. Section & Pages Operations (SECTION → PAGES[] Architecture)
    // ========================================================================

    // Get Sections (HOME, ABOUT ME, SKILLS, PROJECTS, CERTIFICATES, EDUCATION, JOURNEY, CONTACT)
    async getSections() {
      if (this.isFirebaseReady && this.db) {
        try {
          const snapshot = await this.db.collection('sections').orderBy('order').get();
          if (!snapshot.empty) {
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          }
        } catch (err) {
          console.warn('Firestore getSections failed, falling back to local data:', err);
        }
      }
      return (this.localData.sections || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0));
    }

    // Get Pages for a Section (Dynamic pages: 1, 2, 3, 4, 5+ pages)
    async getPages(sectionId, includeDrafts = true) {
      let pages = [];
      if (this.isFirebaseReady && this.db) {
        try {
          let query = this.db.collection('pages').where('sectionId', '==', sectionId);
          if (!includeDrafts) {
            query = query.where('status', '==', 'published');
          }
          const snapshot = await query.get();
          if (!snapshot.empty) {
            pages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            pages.sort((a, b) => (a.order || 0) - (b.order || 0));
            return pages;
          }
        } catch (err) {
          console.warn('Firestore getPages failed, falling back to local data:', err);
        }
      }

      const allSectionPages = (this.localData.pages && this.localData.pages[sectionId]) || [];
      pages = allSectionPages.filter(pg => includeDrafts || pg.status === 'published');
      pages.sort((a, b) => (a.order || 0) - (b.order || 0));
      return pages;
    }

    // Save Page (Create or Update)
    async savePage(page) {
      if (!page || !page.sectionId) {
        throw new Error('Page must have a sectionId.');
      }

      if (!page.id) {
        page.id = `${page.sectionId}-page-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      }

      page.updatedAt = new Date().toISOString();
      if (!page.createdAt) {
        page.createdAt = page.updatedAt;
      }
      if (!page.status) {
        page.status = 'draft';
      }

      // 1. Local update
      if (!this.localData.pages) this.localData.pages = {};
      if (!this.localData.pages[page.sectionId]) this.localData.pages[page.sectionId] = [];

      const list = this.localData.pages[page.sectionId];
      const existingIdx = list.findIndex(p => p.id === page.id);
      if (existingIdx >= 0) {
        list[existingIdx] = Object.assign({}, list[existingIdx], page);
      } else {
        if (!page.order) page.order = list.length + 1;
        list.push(page);
      }
      this._persistLocalData();

      // 2. Cloud Firestore update
      if (this.isFirebaseReady && this.db) {
        try {
          await this.db.collection('pages').doc(page.id).set(page, { merge: true });
        } catch (err) {
          console.warn('Firestore savePage error:', err);
        }
      }

      return page;
    }

    // Delete Page
    async deletePage(sectionId, pageId) {
      if (!this.localData.pages || !this.localData.pages[sectionId]) return false;

      this.localData.pages[sectionId] = this.localData.pages[sectionId].filter(p => p.id !== pageId);
      // Re-index orders
      this.localData.pages[sectionId].forEach((p, idx) => { p.order = idx + 1; });
      this._persistLocalData();

      if (this.isFirebaseReady && this.db) {
        try {
          await this.db.collection('pages').doc(pageId).delete();
        } catch (err) {
          console.warn('Firestore deletePage error:', err);
        }
      }

      return true;
    }

    // Reorder Pages
    async reorderPages(sectionId, orderedIds) {
      if (!this.localData.pages || !this.localData.pages[sectionId]) return [];

      const list = this.localData.pages[sectionId];
      const pageMap = new Map(list.map(p => [p.id, p]));
      const reordered = [];

      orderedIds.forEach((id, idx) => {
        const p = pageMap.get(id);
        if (p) {
          p.order = idx + 1;
          reordered.push(p);
        }
      });

      this.localData.pages[sectionId] = reordered;
      this._persistLocalData();

      if (this.isFirebaseReady && this.db) {
        try {
          const batch = this.db.batch();
          reordered.forEach(p => {
            const ref = this.db.collection('pages').doc(p.id);
            batch.update(ref, { order: p.order, updatedAt: new Date().toISOString() });
          });
          await batch.commit();
        } catch (err) {
          console.warn('Firestore reorderPages error:', err);
        }
      }

      return reordered;
    }

    // ========================================================================
    // 5. Section Specific Entities (HOME, SKILLS, PROJECTS, CERTIFICATES, etc.)
    // ========================================================================

    // HOME Cover Settings
    async getHomeData() {
      if (this.isFirebaseReady && this.db) {
        try {
          const doc = await this.db.collection('settings').doc('home').get();
          if (doc.exists) {
            return doc.data();
          }
        } catch (err) {
          console.warn('Firestore getHomeData error, falling back:', err);
        }
      }
      return Object.assign({}, this.localData.home || {});
    }

    async saveHomeData(homeData) {
      homeData.updatedAt = new Date().toISOString();
      this.localData.home = Object.assign({}, this.localData.home, homeData);
      this._persistLocalData();

      if (this.isFirebaseReady && this.db) {
        try {
          await this.db.collection('settings').doc('home').set(homeData, { merge: true });
        } catch (err) {
          console.warn('Firestore saveHomeData error:', err);
        }
      }
      return this.localData.home;
    }

    // Generic Structured Items Manager (skills, projects, certificates, education, journey)
    async getItems(collectionName, includeDrafts = true) {
      let items = [];
      if (this.isFirebaseReady && this.db) {
        try {
          let query = this.db.collection(collectionName);
          // Always filter to published when: (a) caller explicitly excludes drafts,
          // OR (b) the current session is unauthenticated (second line of defence
          // against any future code path that incorrectly passes includeDrafts=true
          // from a public/unauthenticated context).
          if (!includeDrafts || !this.isAuthenticated()) {
            query = query.where('status', '==', 'published');
          }
          const snapshot = await query.get();
          if (!snapshot.empty) {
            items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            items.sort((a, b) => (a.order || 0) - (b.order || 0));
            return items;
          }
        } catch (err) {
          console.warn(`Firestore getItems(${collectionName}) error:`, err);
        }
      }

      const list = (this.localData.items && this.localData.items[collectionName]) || [];
      items = list.filter(it => includeDrafts || it.status === 'published');
      items.sort((a, b) => (a.order || 0) - (b.order || 0));
      return items;
    }

    async saveItem(collectionName, item) {
      if (!item.id) {
        item.id = `${collectionName}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      }

      item.updatedAt = new Date().toISOString();
      if (!item.createdAt) item.createdAt = item.updatedAt;
      if (!item.status) item.status = 'draft';

      if (!this.localData.items) this.localData.items = {};
      if (!this.localData.items[collectionName]) this.localData.items[collectionName] = [];

      const list = this.localData.items[collectionName];
      const existingIdx = list.findIndex(it => it.id === item.id);
      if (existingIdx >= 0) {
        list[existingIdx] = Object.assign({}, list[existingIdx], item);
      } else {
        if (!item.order) item.order = list.length + 1;
        list.push(item);
      }
      this._persistLocalData();

      if (this.isFirebaseReady && this.db) {
        try {
          await this.db.collection(collectionName).doc(item.id).set(item, { merge: true });
        } catch (err) {
          console.warn(`Firestore saveItem(${collectionName}) error:`, err);
        }
      }

      return item;
    }

    async deleteItem(collectionName, itemId) {
      if (!this.localData.items || !this.localData.items[collectionName]) return false;

      this.localData.items[collectionName] = this.localData.items[collectionName].filter(it => it.id !== itemId);
      this.localData.items[collectionName].forEach((it, idx) => { it.order = idx + 1; });
      this._persistLocalData();

      if (this.isFirebaseReady && this.db) {
        try {
          await this.db.collection(collectionName).doc(itemId).delete();
        } catch (err) {
          console.warn(`Firestore deleteItem(${collectionName}) error:`, err);
        }
      }

      return true;
    }

    async reorderItems(collectionName, orderedIds) {
      if (!this.localData.items || !this.localData.items[collectionName]) return [];

      const list = this.localData.items[collectionName];
      const itemMap = new Map(list.map(it => [it.id, it]));
      const reordered = [];

      orderedIds.forEach((id, idx) => {
        const it = itemMap.get(id);
        if (it) {
          it.order = idx + 1;
          reordered.push(it);
        }
      });

      this.localData.items[collectionName] = reordered;
      this._persistLocalData();

      if (this.isFirebaseReady && this.db) {
        try {
          const batch = this.db.batch();
          reordered.forEach(it => {
            const ref = this.db.collection(collectionName).doc(it.id);
            batch.update(ref, { order: it.order, updatedAt: new Date().toISOString() });
          });
          await batch.commit();
        } catch (err) {
          console.warn(`Firestore reorderItems(${collectionName}) error:`, err);
        }
      }

      return reordered;
    }

    // ========================================================================
    // 6. Cloudinary Direct Unsigned Media Upload (Zero API Secret Exposure)
    // ========================================================================

    async uploadMedia(file, folder = 'portfolio', onProgress = null) {
      if (!file) throw new Error('No file provided for upload.');

      const cloudName = this.config.cloudinary && this.config.cloudinary.cloudName;
      const uploadPreset = this.config.cloudinary && this.config.cloudinary.uploadPreset;

      if (!cloudName || cloudName === 'demo') {
        // Fallback to high-fidelity Base64 data URL for local/offline testing if Cloudinary is not configured yet
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              url: reader.result,
              secure_url: reader.result,
              public_id: `local-${Date.now()}`,
              format: file.name.split('.').pop(),
              bytes: file.size,
              isLocalFallback: true
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      // Real Cloudinary Unsigned Upload Request
      const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', folder);

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', endpoint, true);

        if (onProgress && xhr.upload) {
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const percent = Math.round((e.loaded / e.total) * 100);
              onProgress(percent);
            }
          };
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const res = JSON.parse(xhr.responseText);
              resolve({
                url: res.url,
                secure_url: res.secure_url,
                public_id: res.public_id,
                format: res.format,
                bytes: res.bytes,
                width: res.width,
                height: res.height,
                resource_type: res.resource_type
              });
            } catch (err) {
              reject(new Error('Invalid Cloudinary response.'));
            }
          } else {
            let errorMsg = `Upload failed with status ${xhr.status}`;
            try {
              const res = JSON.parse(xhr.responseText);
              if (res.error && res.error.message) errorMsg = res.error.message;
            } catch (e) {}
            reject(new Error(errorMsg));
          }
        };

        xhr.onerror = () => reject(new Error('Network error during Cloudinary media upload.'));
        xhr.send(formData);
      });
    }

    // ========================================================================
    // 7. Full Public Portfolio Package Compiler (Consumed by script.js)
    // ========================================================================

    async getPublicPortfolioData(includeDrafts = false) {
      const home = await this.getHomeData();
      const sections = await this.getSections();
      const publishedSections = sections.filter(s => includeDrafts || s.status === 'published');

      const compiledPages = {};
      for (const sec of publishedSections) {
        compiledPages[sec.id] = await this.getPages(sec.id, includeDrafts);
      }

      const items = {
        skills: await this.getItems('skills', includeDrafts),
        projects: await this.getItems('projects', includeDrafts),
        certificates: await this.getItems('certificates', includeDrafts),
        education: await this.getItems('education', includeDrafts),
        journey: await this.getItems('journey', includeDrafts)
      };

      return {
        home,
        sections: publishedSections,
        pages: compiledPages,
        items
      };
    }

    // ========================================================================
    // 8. Event Emitter
    // ========================================================================

    on(event, callback) {
      if (!this.listeners.has(event)) {
        this.listeners.set(event, new Set());
      }
      this.listeners.get(event).add(callback);
      return () => this.off(event, callback);
    }

    off(event, callback) {
      if (this.listeners.has(event)) {
        this.listeners.get(event).delete(callback);
      }
    }

    emit(event, data) {
      if (this.listeners.has(event)) {
        this.listeners.get(event).forEach(cb => {
          try { cb(data); } catch (e) { console.error(`Error in listener for ${event}:`, e); }
        });
      }
    }
  }

  // Expose singleton to window
  window.portfolioService = new PortfolioService();

})(window);

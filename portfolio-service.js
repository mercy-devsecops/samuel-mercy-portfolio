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
    // 3. Cloud Firestore Backup & Export Operations (Single Source of Truth)
    // ========================================================================

    // Export current portfolio data directly from live Cloud Firestore
    async exportBackupData() {
      const liveData = await this.getPublicPortfolioData(true);
      return {
        exportedAt: new Date().toISOString(),
        version: '2.0',
        author: 'Samuel Mercy Oluwatobi',
        source: 'Firebase Firestore',
        data: {
          portfolioData: liveData,
          configOverride: localStorage.getItem(CONFIG_OVERRIDE_KEY) ? JSON.parse(localStorage.getItem(CONFIG_OVERRIDE_KEY)) : null
        }
      };
    }

    // Import backup JSON directly into Cloud Firestore
    async importBackupData(backupJson) {
      if (!this.isFirebaseReady || !this.db) {
        throw new Error('Cloud Firestore is not initialized or connected.');
      }
      if (!this.isAuthenticated() || !this.auth || !this.auth.currentUser) {
        throw new Error('Active administrator authentication required to import data.');
      }

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

      if (target.home) {
        await this.db.collection('settings').doc('home').set(target.home, { merge: true });
      }
      if (Array.isArray(target.sections)) {
        for (const s of target.sections) {
          await this.db.collection('sections').doc(s.id).set(s, { merge: true });
        }
      }
      if (target.pages && typeof target.pages === 'object') {
        for (const [secId, pList] of Object.entries(target.pages)) {
          if (Array.isArray(pList)) {
            for (const p of pList) {
              await this.db.collection('pages').doc(p.id).set(p, { merge: true });
            }
          }
        }
      }
      if (target.items && typeof target.items === 'object') {
        for (const [col, list] of Object.entries(target.items)) {
          if (Array.isArray(list)) {
            for (const it of list) {
              await this.db.collection(col).doc(it.id).set(it, { merge: true });
            }
          }
        }
      }

      this.emit('data:changed');
      return target;
    }

    // Helper to migrate large base64 data to Cloudinary via unsigned upload with verification
    async ensureCloudinaryImage(urlOrBase64, folder = 'portfolio') {
      if (!urlOrBase64 || typeof urlOrBase64 !== 'string') return urlOrBase64;
      if (urlOrBase64.startsWith('http://') || urlOrBase64.startsWith('https://')) {
        return urlOrBase64;
      }
      if (!urlOrBase64.startsWith('data:image/')) {
        return urlOrBase64;
      }

      const cloudName = this.config.cloudinary && this.config.cloudinary.cloudName;
      const uploadPreset = this.config.cloudinary && this.config.cloudinary.uploadPreset;
      if (!cloudName || !uploadPreset || cloudName === 'demo') {
        return urlOrBase64;
      }

      try {
        const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
        const formData = new FormData();
        formData.append('file', urlOrBase64);
        formData.append('upload_preset', uploadPreset);
        formData.append('folder', folder);

        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          console.warn('[Cloudinary] Upload failed with status:', response.status);
          return urlOrBase64;
        }

        const data = await response.json();
        const secureUrl = data.secure_url || data.url;
        if (!secureUrl) return urlOrBase64;

        try {
          const verifyRes = await fetch(secureUrl, { method: 'HEAD' });
          if (verifyRes.ok) {
            console.log('[Cloudinary] Successfully migrated base64 to:', secureUrl);
            return secureUrl;
          }
        } catch (vErr) {
          console.warn('[Cloudinary] Verification HEAD check warning:', vErr);
        }

        return secureUrl;
      } catch (err) {
        console.warn('[Cloudinary] Auto-migration error, retaining original:', err);
        return urlOrBase64;
      }
    }

    // Synchronize all local portfolio content into Cloud Firestore (Merge mode)
    async syncLocalToFirestore() {
      if (!this.isFirebaseReady || !this.db) {
        throw new Error('Firebase Firestore is not initialized or connected.');
      }
      if (!this.isAuthenticated() || !this.auth || !this.auth.currentUser) {
        throw new Error('Active Firebase Auth session required. Please sign in with your admin credentials.');
      }

      const results = {
        home: false,
        sections: { count: 0, ids: [] },
        pages: { count: 0, ids: [] },
        projects: { count: 0, ids: [] },
        skills: { count: 0, ids: [] },
        certificates: { count: 0, ids: [] },
        education: { count: 0, ids: [] },
        journey: { count: 0, ids: [] },
        comparison: {
          cloudIds: {},
          localIds: {},
          inLocalOnly: {},
          inCloudOnly: {}
        },
        migratedImages: [],
        errors: []
      };

      // Helper to fetch cloud IDs for comparison without deleting
      const checkCollectionDiff = async (colName, localList) => {
        try {
          const snap = await this.db.collection(colName).get();
          const cloudList = snap.docs.map(d => d.id);
          const localIdSet = new Set((localList || []).map(item => item.id));
          const cloudIdSet = new Set(cloudList);

          results.comparison.cloudIds[colName] = cloudList;
          results.comparison.localIds[colName] = Array.from(localIdSet);
          results.comparison.inLocalOnly[colName] = Array.from(localIdSet).filter(id => !cloudIdSet.has(id));
          results.comparison.inCloudOnly[colName] = cloudList.filter(id => !localIdSet.has(id));
        } catch (e) {
          results.comparison.cloudIds[colName] = `Notice: ${e.message}`;
        }
      };

      // 1. Settings / Home
      if (this.localData.home) {
        try {
          if (this.localData.home.heroImage && this.localData.home.heroImage.startsWith('data:image/')) {
            const uploaded = await this.ensureCloudinaryImage(this.localData.home.heroImage, 'portfolio/home');
            if (uploaded !== this.localData.home.heroImage) {
              this.localData.home.heroImage = uploaded;
              results.migratedImages.push('home.heroImage');
            }
          }
          await this.db.collection('settings').doc('home').set(this.localData.home, { merge: true });
          results.home = true;
        } catch (err) {
          results.errors.push(`Settings/Home sync error: ${err.message}`);
        }
      }

      // 2. Sections
      if (Array.isArray(this.localData.sections)) {
        await checkCollectionDiff('sections', this.localData.sections);
        for (const sec of this.localData.sections) {
          try {
            await this.db.collection('sections').doc(sec.id).set(sec, { merge: true });
            results.sections.count++;
            results.sections.ids.push(sec.id);
          } catch (err) {
            results.errors.push(`Section ${sec.id} sync error: ${err.message}`);
          }
        }
      }

      // 3. Pages
      if (this.localData.pages && typeof this.localData.pages === 'object') {
        const flatPages = [];
        for (const [secId, pageList] of Object.entries(this.localData.pages)) {
          if (Array.isArray(pageList)) flatPages.push(...pageList);
        }
        await checkCollectionDiff('pages', flatPages);

        for (const page of flatPages) {
          try {
            if (page.mediaUrl && page.mediaUrl.startsWith('data:image/')) {
              const uploaded = await this.ensureCloudinaryImage(page.mediaUrl, 'portfolio/pages');
              if (uploaded !== page.mediaUrl) {
                page.mediaUrl = uploaded;
                results.migratedImages.push(`page ${page.id} mediaUrl`);
              }
            }
            await this.db.collection('pages').doc(page.id).set(page, { merge: true });
            results.pages.count++;
            results.pages.ids.push(page.id);
          } catch (err) {
            results.errors.push(`Page ${page.id} sync error: ${err.message}`);
          }
        }
      }

      // 4. Structured Items (skills, projects, certificates, education, journey)
      if (this.localData.items && typeof this.localData.items === 'object') {
        for (const [colName, itemList] of Object.entries(this.localData.items)) {
          if (Array.isArray(itemList)) {
            await checkCollectionDiff(colName, itemList);
            for (const item of itemList) {
              try {
                for (const imgField of ['imageUrl', 'coverImage']) {
                  if (item[imgField] && item[imgField].startsWith('data:image/')) {
                    const uploaded = await this.ensureCloudinaryImage(item[imgField], `portfolio/${colName}`);
                    if (uploaded !== item[imgField]) {
                      item[imgField] = uploaded;
                      results.migratedImages.push(`${colName}/${item.id} ${imgField}`);
                    }
                  }
                }
                await this.db.collection(colName).doc(item.id).set(item, { merge: true });
                if (results[colName]) {
                  results[colName].count++;
                  results[colName].ids.push(item.id);
                }
              } catch (err) {
                results.errors.push(`Item ${colName}/${item.id} sync error: ${err.message}`);
              }
            }
          }
        }
      }

      if (results.migratedImages.length > 0) {
        this._persistLocalData();
      }

      return results;
    }

    // ========================================================================
    // 4. Section & Pages Operations (Pure Cloud Firestore Architecture)
    // ========================================================================

    // Get Sections (HOME, ABOUT ME, SKILLS, PROJECTS, CERTIFICATES, EDUCATION, JOURNEY, CONTACT)
    async getSections() {
      if (!this.isFirebaseReady || !this.db) {
        throw new Error('Cloud Firestore database is unavailable.');
      }
      const snapshot = await this.db.collection('sections').orderBy('order').get();
      if (snapshot.empty) return [];
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    // Get Pages for a Section (Dynamic pages)
    async getPages(sectionId, includeDrafts = true) {
      if (!this.isFirebaseReady || !this.db) {
        throw new Error('Cloud Firestore database is unavailable.');
      }
      let query = this.db.collection('pages').where('sectionId', '==', sectionId);
      if (!includeDrafts || !this.isAuthenticated()) {
        query = query.where('status', '==', 'published');
      }
      const snapshot = await query.get();
      const pages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      pages.sort((a, b) => (a.order || 0) - (b.order || 0));
      return pages;
    }

    // Save Page (Create or Update directly in Firestore)
    async savePage(page) {
      if (!this.isFirebaseReady || !this.db) {
        throw new Error('Cloud Firestore database is unavailable.');
      }
      if (!this.isAuthenticated() || !this.auth || !this.auth.currentUser) {
        throw new Error('Active administrator authentication required to save page.');
      }
      if (!page || !page.sectionId) {
        throw new Error('Page must have a sectionId.');
      }

      if (!page.id) {
        page.id = `${page.sectionId}-page-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      }

      page.updatedAt = new Date().toISOString();
      if (!page.createdAt) page.createdAt = page.updatedAt;
      if (!page.status) page.status = 'draft';

      // Auto-migrate base64 media if present
      if (page.mediaUrl && page.mediaUrl.startsWith('data:image/')) {
        page.mediaUrl = await this.ensureCloudinaryImage(page.mediaUrl, 'portfolio/pages');
      }

      await this.db.collection('pages').doc(page.id).set(page, { merge: true });
      this.emit('data:changed');
      return page;
    }

    // Delete Page directly from Firestore
    async deletePage(sectionId, pageId) {
      if (!this.isFirebaseReady || !this.db) {
        throw new Error('Cloud Firestore database is unavailable.');
      }
      if (!this.isAuthenticated() || !this.auth || !this.auth.currentUser) {
        throw new Error('Active administrator authentication required to delete page.');
      }
      await this.db.collection('pages').doc(pageId).delete();
      this.emit('data:changed');
      return true;
    }

    // Reorder Pages directly in Firestore
    async reorderPages(sectionId, orderedIds) {
      if (!this.isFirebaseReady || !this.db) {
        throw new Error('Cloud Firestore database is unavailable.');
      }
      const batch = this.db.batch();
      orderedIds.forEach((id, idx) => {
        const ref = this.db.collection('pages').doc(id);
        batch.update(ref, { order: idx + 1, updatedAt: new Date().toISOString() });
      });
      await batch.commit();
      this.emit('data:changed');
      return this.getPages(sectionId, true);
    }

    // ========================================================================
    // 5. Section Specific Entities (HOME, SKILLS, PROJECTS, CERTIFICATES, etc.)
    // ========================================================================

    // HOME Cover Settings directly in Firestore
    async getHomeData() {
      if (!this.isFirebaseReady || !this.db) {
        throw new Error('Cloud Firestore database is unavailable.');
      }
      const doc = await this.db.collection('settings').doc('home').get();
      if (!doc.exists) {
        throw new Error('Home cover settings not found in Firestore.');
      }
      return doc.data();
    }

    async saveHomeData(homeData) {
      if (!this.isFirebaseReady || !this.db) {
        throw new Error('Cloud Firestore database is unavailable.');
      }
      if (!this.isAuthenticated() || !this.auth || !this.auth.currentUser) {
        throw new Error('Active administrator authentication required to save home settings.');
      }
      homeData.updatedAt = new Date().toISOString();

      if (homeData.heroImage && homeData.heroImage.startsWith('data:image/')) {
        homeData.heroImage = await this.ensureCloudinaryImage(homeData.heroImage, 'portfolio/home');
      }

      await this.db.collection('settings').doc('home').set(homeData, { merge: true });
      this.emit('data:changed');
      return homeData;
    }

    // Generic Structured Items Manager (skills, projects, certificates, education, journey)
    async getItems(collectionName, includeDrafts = true) {
      if (!this.isFirebaseReady || !this.db) {
        throw new Error('Cloud Firestore database is unavailable.');
      }
      let query = this.db.collection(collectionName);
      if (!includeDrafts || !this.isAuthenticated()) {
        query = query.where('status', '==', 'published');
      }
      const snapshot = await query.get();
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      items.sort((a, b) => (a.order || 0) - (b.order || 0));
      return items;
    }

    async saveItem(collectionName, item) {
      if (!this.isFirebaseReady || !this.db) {
        throw new Error('Cloud Firestore database is unavailable.');
      }
      if (!this.isAuthenticated() || !this.auth || !this.auth.currentUser) {
        throw new Error('Active administrator authentication required to save records.');
      }

      if (!item.id) {
        item.id = `${collectionName}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      }

      item.updatedAt = new Date().toISOString();
      if (!item.createdAt) item.createdAt = item.updatedAt;
      if (!item.status) item.status = 'draft';

      for (const imgField of ['imageUrl', 'coverImage']) {
        if (item[imgField] && item[imgField].startsWith('data:image/')) {
          item[imgField] = await this.ensureCloudinaryImage(item[imgField], `portfolio/${collectionName}`);
        }
      }

      await this.db.collection(collectionName).doc(item.id).set(item, { merge: true });
      this.emit('data:changed');
      return item;
    }

    async deleteItem(collectionName, itemId) {
      if (!this.isFirebaseReady || !this.db) {
        throw new Error('Cloud Firestore database is unavailable.');
      }
      if (!this.isAuthenticated() || !this.auth || !this.auth.currentUser) {
        throw new Error('Active administrator authentication required to delete records.');
      }
      await this.db.collection(collectionName).doc(itemId).delete();
      this.emit('data:changed');
      return true;
    }

    async reorderItems(collectionName, orderedIds) {
      if (!this.isFirebaseReady || !this.db) {
        throw new Error('Cloud Firestore database is unavailable.');
      }
      const batch = this.db.batch();
      orderedIds.forEach((id, idx) => {
        const ref = this.db.collection(collectionName).doc(id);
        batch.update(ref, { order: idx + 1, updatedAt: new Date().toISOString() });
      });
      await batch.commit();
      this.emit('data:changed');
      return this.getItems(collectionName, true);
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

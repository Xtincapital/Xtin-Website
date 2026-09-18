/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * XTIN GINI - BACKUP & RESTORE SYSTEM
 * Privacy-First Local Data Management
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const GiniBackup = {
  // Configuration
  BACKUP_VERSION: 1,
  REMINDER_KEY: 'gini_backup_reminder',
  LAST_BACKUP_KEY: 'gini_last_backup_date',
  SNOOZE_DAYS: 7,
  
  // All storage keys used by Gini
  STORAGE_KEYS: [
    'gini_user_profile_v2',
    'giniAppState',
    'giniAssets',
    'giniLiabilities', 
    'giniGoals',
    'giniFamilyMembers',
    'giniSettings',
    'giniPortfolio',
    'giniCalculatorHistory',
    'giniMonteCarloResults',
    'giniRequiredReturnResults',
    'giniRetirementPlan',
    'giniFamilyPlanningData'
  ],
  
  // ============================================================================
  // REMINDER SYSTEM
  // ============================================================================
  
  /**
   * Check if we should show the backup reminder
   */
  shouldShowReminder() {
    const reminderData = localStorage.getItem(this.REMINDER_KEY);
    
    if (!reminderData) {
      return true; // First visit
    }
    
    try {
      const data = JSON.parse(reminderData);
      
      // Check if permanently dismissed
      if (data.dismissed === true) {
        return false;
      }
      
      // Check if snoozed and snooze period has passed
      if (data.snoozedUntil) {
        const snoozeDate = new Date(data.snoozedUntil);
        if (new Date() < snoozeDate) {
          return false; // Still in snooze period
        }
      }
      
      return true;
    } catch (e) {
      return true;
    }
  },
  
  /**
   * Snooze the reminder for X days
   */
  snoozeReminder(days = this.SNOOZE_DAYS) {
    const snoozeDate = new Date();
    snoozeDate.setDate(snoozeDate.getDate() + days);
    
    localStorage.setItem(this.REMINDER_KEY, JSON.stringify({
      dismissed: false,
      snoozedUntil: snoozeDate.toISOString(),
      lastShown: new Date().toISOString()
    }));
  },
  
  /**
   * Permanently dismiss reminder (not recommended)
   */
  dismissReminder() {
    localStorage.setItem(this.REMINDER_KEY, JSON.stringify({
      dismissed: true,
      dismissedAt: new Date().toISOString()
    }));
  },
  
  /**
   * Record last backup date
   */
  recordBackup() {
    localStorage.setItem(this.LAST_BACKUP_KEY, new Date().toISOString());
    // Also snooze reminder after successful backup
    this.snoozeReminder(30); // 30 days after backup
  },
  
  /**
   * Get last backup info
   */
  getLastBackupInfo() {
    const lastBackup = localStorage.getItem(this.LAST_BACKUP_KEY);
    if (lastBackup) {
      return {
        date: new Date(lastBackup),
        formatted: this.formatDate(new Date(lastBackup)),
        daysAgo: Math.floor((new Date() - new Date(lastBackup)) / (1000 * 60 * 60 * 24))
      };
    }
    return null;
  },
  
  // ============================================================================
  // BACKUP CREATION
  // ============================================================================
  
  /**
   * Gather ALL Gini data for backup
   */
  gatherAllData() {
    const backupData = {
      // Metadata
      _meta: {
        version: this.BACKUP_VERSION,
        createdAt: new Date().toISOString(),
        appVersion: '2.0.0',
        platform: 'Xtin Gini'
      },
      
      // Data sections
      sections: {}
    };
    
    // Collect data from localStorage
    this.STORAGE_KEYS.forEach(key => {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          backupData.sections[key] = JSON.parse(data);
        }
      } catch (e) {
        // Try storing as raw string if not JSON
        const data = localStorage.getItem(key);
        if (data) {
          backupData.sections[key] = data;
        }
      }
    });
    
    // Also gather from appState if available (in-memory data)
    if (typeof appState !== 'undefined') {
      backupData.sections.appStateMemory = {
        assets: appState.assets || [],
        liabilities: appState.liabilities || [],
        goals: appState.goals || [],
        familyMembers: appState.familyMembers || [],
        settings: appState.settings || {}
      };
    }
    
    // Validate backup completeness
    backupData._meta.sectionsCount = Object.keys(backupData.sections).length;
    backupData._meta.hasData = backupData._meta.sectionsCount > 0;
    
    return backupData;
  },
  
  /**
   * Validate backup data integrity
   */
  validateBackup(backupData) {
    const errors = [];
    const warnings = [];
    
    // Check metadata
    if (!backupData._meta) {
      errors.push('Missing backup metadata');
    } else {
      if (!backupData._meta.version) {
        errors.push('Missing backup version');
      }
      if (!backupData._meta.createdAt) {
        errors.push('Missing creation date');
      }
    }
    
    // Check sections
    if (!backupData.sections) {
      errors.push('Missing data sections');
    }
    
    // Check for important data
    if (backupData.sections) {
      if (!backupData.sections.appStateMemory && !backupData.sections.giniAppState) {
        warnings.push('No app state data found');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  },
  
  /**
   * Create and download backup file
   */
  downloadBackup() {
    try {
      const backupData = this.gatherAllData();
      const validation = this.validateBackup(backupData);
      
      if (!validation.isValid) {
        console.error('Backup validation failed:', validation.errors);
        return { success: false, errors: validation.errors };
      }
      
      // Create JSON blob
      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      // Generate filename with date
      const date = new Date().toISOString().split('T')[0];
      const filename = `gini-backup-${date}.json`;
      
      // Download file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Record backup
      this.recordBackup();
      
      return {
        success: true,
        filename,
        sectionsCount: backupData._meta.sectionsCount,
        warnings: validation.warnings
      };
    } catch (error) {
      console.error('Backup failed:', error);
      return { success: false, errors: [error.message] };
    }
  },
  
  // ============================================================================
  // RESTORE SYSTEM
  // ============================================================================
  
  /**
   * Read and parse backup file
   */
  async readBackupFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          resolve(data);
        } catch (error) {
          reject(new Error('Invalid JSON file. Please select a valid Gini backup file.'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file. Please try again.'));
      };
      
      reader.readAsText(file);
    });
  },
  
  /**
   * Validate restore data before applying
   */
  validateRestoreData(backupData) {
    const result = {
      isValid: false,
      version: null,
      createdAt: null,
      sections: [],
      errors: [],
      warnings: []
    };
    
    // Check if it's a Gini backup
    if (!backupData._meta || backupData._meta.platform !== 'Xtin Gini') {
      result.errors.push('This does not appear to be a valid Gini backup file.');
      return result;
    }
    
    // Check version compatibility
    result.version = backupData._meta.version;
    if (result.version > this.BACKUP_VERSION) {
      result.errors.push(`Backup version ${result.version} is newer than supported version ${this.BACKUP_VERSION}. Please update the app.`);
      return result;
    }
    
    // Parse creation date
    if (backupData._meta.createdAt) {
      result.createdAt = new Date(backupData._meta.createdAt);
    }
    
    // List available sections
    if (backupData.sections) {
      result.sections = Object.keys(backupData.sections);
    }
    
    // Validate sections have data
    if (result.sections.length === 0) {
      result.warnings.push('Backup appears to be empty.');
    }
    
    result.isValid = result.errors.length === 0;
    return result;
  },
  
  /**
   * Apply backup data to restore state
   */
  async applyRestore(backupData) {
    const results = {
      success: false,
      restored: [],
      failed: [],
      errors: []
    };
    
    try {
      // Validate first
      const validation = this.validateRestoreData(backupData);
      if (!validation.isValid) {
        results.errors = validation.errors;
        return results;
      }
      
      // Clear existing data (optional - could merge instead)
      // this.STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
      
      // Restore each section
      for (const [key, value] of Object.entries(backupData.sections)) {
        try {
          if (key === 'appStateMemory') {
            // Special handling for in-memory app state
            if (typeof appState !== 'undefined') {
              if (value.assets) appState.assets = value.assets;
              if (value.liabilities) appState.liabilities = value.liabilities;
              if (value.goals) appState.goals = value.goals;
              if (value.familyMembers) appState.familyMembers = value.familyMembers;
              if (value.settings) Object.assign(appState.settings, value.settings);
            }
            // Also save to localStorage for persistence
            localStorage.setItem('giniAppState', JSON.stringify(value));
            results.restored.push('App State (Memory)');
          } else {
            // Store in localStorage
            const dataStr = typeof value === 'string' ? value : JSON.stringify(value);
            localStorage.setItem(key, dataStr);
            results.restored.push(this.formatSectionName(key));
          }
        } catch (e) {
          results.failed.push(key);
          console.error(`Failed to restore ${key}:`, e);
        }
      }
      
      results.success = results.failed.length === 0;
      
      // Trigger UI refresh
      this.triggerUIRefresh();
      
      return results;
    } catch (error) {
      results.errors.push(error.message);
      return results;
    }
  },
  
  /**
   * Trigger UI refresh after restore
   */
  triggerUIRefresh() {
    // Dispatch custom event for app to listen
    window.dispatchEvent(new CustomEvent('giniDataRestored'));
    
    // Reload AI profile
    if (window.GiniUserProfile) {
      window.GiniUserProfile.load();
    }
    
    // Reinitialize AI engine
    if (window.GiniAIEngine) {
      window.GiniAIEngine.initialize();
    }
    
    // Update health score
    if (typeof updateHealthScoreBadge === 'function') {
      updateHealthScoreBadge();
    }
    
    // Trigger render functions if available
    if (typeof renderAssets === 'function') renderAssets();
    if (typeof renderLiabilities === 'function') renderLiabilities();
    if (typeof renderGoals === 'function') renderGoals();
    if (typeof renderFamilyMembers === 'function') renderFamilyMembers();
    if (typeof updateDashboard === 'function') updateDashboard();
    if (typeof updateAllCharts === 'function') updateAllCharts();
  },
  
  // ============================================================================
  // UTILITIES
  // ============================================================================
  
  formatDate(date) {
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },
  
  formatSectionName(key) {
    const names = {
      'gini_user_profile_v2': 'AI Profile',
      'giniAppState': 'App State',
      'giniAssets': 'Assets',
      'giniLiabilities': 'Liabilities',
      'giniGoals': 'Financial Goals',
      'giniFamilyMembers': 'Family Members',
      'giniSettings': 'Settings',
      'giniPortfolio': 'Portfolio',
      'giniCalculatorHistory': 'Calculator History',
      'giniMonteCarloResults': 'Monte Carlo Results',
      'giniRequiredReturnResults': 'Required Return',
      'giniRetirementPlan': 'Retirement Plan',
      'giniFamilyPlanningData': 'Family Planning'
    };
    return names[key] || key;
  },
  
  /**
   * Get data summary for display
   */
  getDataSummary() {
    const summary = {
      hasData: false,
      sections: [],
      lastBackup: this.getLastBackupInfo()
    };
    
    this.STORAGE_KEYS.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        summary.hasData = true;
        summary.sections.push(this.formatSectionName(key));
      }
    });
    
    // Check in-memory state
    if (typeof appState !== 'undefined') {
      if (appState.assets?.length > 0) summary.sections.push('Assets');
      if (appState.liabilities?.length > 0) summary.sections.push('Liabilities');
      if (appState.goals?.length > 0) summary.sections.push('Goals');
      if (appState.familyMembers?.length > 0) summary.sections.push('Family');
    }
    
    // Deduplicate
    summary.sections = [...new Set(summary.sections)];
    
    return summary;
  }
};

// ============================================================================
// UI MANAGER FOR BACKUP/RESTORE
// ============================================================================

const GiniBackupUI = {
  /**
   * Initialize backup UI components
   */
  init() {
    this.createReminderModal();
    this.createBackupPanel();
    this.createFloatingButton();
    this.attachEventListeners();
    
    // Check if we should show reminder on startup
    setTimeout(() => {
      if (GiniBackup.shouldShowReminder()) {
        this.showReminderModal();
      }
    }, 1500); // Delay to let app load first
  },
  
  /**
   * Create the startup reminder modal
   */
  createReminderModal() {
    const modal = document.createElement('div');
    modal.id = 'backupReminderModal';
    modal.className = 'backup-modal-overlay hidden';
    modal.innerHTML = `
      <div class="backup-modal">
        <div class="backup-modal-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="M12 8v4M12 16h.01"/>
          </svg>
        </div>
        <h2 class="backup-modal-title">Your Data, Your Control</h2>
        <p class="backup-modal-text">
          Your financial data is stored <strong>only on this device</strong>. 
          We never upload it to any server.
        </p>
        <p class="backup-modal-text backup-modal-text--muted">
          Please keep a backup to avoid losing your data if you clear browser storage or switch devices.
        </p>
        
        <div class="backup-modal-info">
          <div class="backup-info-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span>Download a backup file</span>
          </div>
          <div class="backup-info-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span>Restore anytime</span>
          </div>
        </div>
        
        <div class="backup-modal-actions">
          <button class="backup-btn backup-btn--primary" id="reminderDownloadBtn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download Backup
          </button>
          <button class="backup-btn backup-btn--secondary" id="reminderRestoreBtn">
            Restore from File
          </button>
        </div>
        
        <div class="backup-modal-footer">
          <button class="backup-link-btn" id="reminderSnoozeBtn">Remind me in 7 days</button>
          <button class="backup-link-btn backup-link-btn--muted" id="reminderDismissBtn">Don't show again</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  },
  
  /**
   * Create the backup/restore panel
   */
  createBackupPanel() {
    const panel = document.createElement('div');
    panel.id = 'backupPanel';
    panel.className = 'backup-panel hidden';
    panel.innerHTML = `
      <div class="backup-panel-header">
        <h3>Backup & Restore</h3>
        <button class="backup-panel-close" id="backupPanelClose">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      
      <div class="backup-panel-content">
        <div class="backup-status" id="backupStatus">
          <div class="backup-status-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <div class="backup-status-text">
            <span class="backup-status-label">Last Backup</span>
            <span class="backup-status-value" id="lastBackupDate">Never</span>
          </div>
        </div>
        
        <div class="backup-data-summary" id="backupDataSummary">
          <span class="backup-summary-label">Your Data</span>
          <div class="backup-summary-items" id="backupSummaryItems">
            <!-- Populated dynamically -->
          </div>
        </div>
        
        <div class="backup-actions">
          <button class="backup-action-btn backup-action-btn--download" id="panelDownloadBtn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span>Download Backup</span>
          </button>
          
          <label class="backup-action-btn backup-action-btn--restore" id="panelRestoreBtn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span>Restore from File</span>
            <input type="file" accept=".json" id="restoreFileInput" hidden />
          </label>
        </div>
        
        <div class="backup-privacy-note">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span>Your data never leaves your device</span>
        </div>
      </div>
      
      <!-- Restore Confirmation -->
      <div class="backup-confirm hidden" id="restoreConfirm">
        <div class="backup-confirm-icon backup-confirm-icon--warning">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <h4>Confirm Restore</h4>
        <p>This will <strong>replace all current data</strong> with the backup file.</p>
        <div class="backup-confirm-details" id="restoreDetails">
          <!-- Populated dynamically -->
        </div>
        <div class="backup-confirm-actions">
          <button class="backup-btn backup-btn--danger" id="confirmRestoreBtn">Yes, Restore</button>
          <button class="backup-btn backup-btn--ghost" id="cancelRestoreBtn">Cancel</button>
        </div>
      </div>
      
      <!-- Success/Error Messages -->
      <div class="backup-result hidden" id="backupResult">
        <div class="backup-result-icon" id="resultIcon"></div>
        <h4 id="resultTitle"></h4>
        <p id="resultMessage"></p>
        <button class="backup-btn backup-btn--primary" id="resultCloseBtn">Done</button>
      </div>
    `;
    document.body.appendChild(panel);
  },
  
  /**
   * Create floating backup button
   */
  createFloatingButton() {
    const btn = document.createElement('button');
    btn.id = 'backupFloatingBtn';
    btn.className = 'backup-floating-btn';
    btn.title = 'Backup & Restore';
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
        <polyline points="17 21 17 13 7 13 7 21"/>
        <polyline points="7 3 7 8 15 8"/>
      </svg>
    `;
    document.body.appendChild(btn);
  },
  
  /**
   * Attach all event listeners
   */
  attachEventListeners() {
    // Floating button
    document.getElementById('backupFloatingBtn')?.addEventListener('click', () => {
      this.showBackupPanel();
    });
    
    // Reminder modal buttons
    document.getElementById('reminderDownloadBtn')?.addEventListener('click', () => {
      this.handleDownload();
      this.hideReminderModal();
    });
    
    document.getElementById('reminderRestoreBtn')?.addEventListener('click', () => {
      this.hideReminderModal();
      this.showBackupPanel();
    });
    
    document.getElementById('reminderSnoozeBtn')?.addEventListener('click', () => {
      GiniBackup.snoozeReminder();
      this.hideReminderModal();
    });
    
    document.getElementById('reminderDismissBtn')?.addEventListener('click', () => {
      GiniBackup.dismissReminder();
      this.hideReminderModal();
    });
    
    // Backup panel buttons
    document.getElementById('backupPanelClose')?.addEventListener('click', () => {
      this.hideBackupPanel();
    });
    
    document.getElementById('panelDownloadBtn')?.addEventListener('click', () => {
      this.handleDownload();
    });
    
    document.getElementById('restoreFileInput')?.addEventListener('change', (e) => {
      if (e.target.files?.[0]) {
        this.handleRestoreFile(e.target.files[0]);
      }
    });
    
    document.getElementById('confirmRestoreBtn')?.addEventListener('click', () => {
      this.executeRestore();
    });
    
    document.getElementById('cancelRestoreBtn')?.addEventListener('click', () => {
      this.hideRestoreConfirm();
    });
    
    document.getElementById('resultCloseBtn')?.addEventListener('click', () => {
      this.hideResult();
    });
    
    // Close panel on overlay click
    document.getElementById('backupReminderModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'backupReminderModal') {
        GiniBackup.snoozeReminder();
        this.hideReminderModal();
      }
    });
  },
  
  /**
   * Show/hide methods
   */
  showReminderModal() {
    document.getElementById('backupReminderModal')?.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  },
  
  hideReminderModal() {
    document.getElementById('backupReminderModal')?.classList.add('hidden');
    document.body.style.overflow = '';
  },
  
  showBackupPanel() {
    this.updatePanelStatus();
    document.getElementById('backupPanel')?.classList.remove('hidden');
  },
  
  hideBackupPanel() {
    document.getElementById('backupPanel')?.classList.add('hidden');
    this.hideRestoreConfirm();
    this.hideResult();
  },
  
  showRestoreConfirm() {
    document.querySelector('.backup-panel-content')?.classList.add('hidden');
    document.getElementById('restoreConfirm')?.classList.remove('hidden');
  },
  
  hideRestoreConfirm() {
    document.getElementById('restoreConfirm')?.classList.add('hidden');
    document.querySelector('.backup-panel-content')?.classList.remove('hidden');
    this.pendingRestoreData = null;
  },
  
  showResult(success, title, message) {
    document.querySelector('.backup-panel-content')?.classList.add('hidden');
    document.getElementById('restoreConfirm')?.classList.add('hidden');
    
    const resultDiv = document.getElementById('backupResult');
    const iconDiv = document.getElementById('resultIcon');
    
    if (success) {
      iconDiv.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      `;
      iconDiv.className = 'backup-result-icon backup-result-icon--success';
    } else {
      iconDiv.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      `;
      iconDiv.className = 'backup-result-icon backup-result-icon--error';
    }
    
    document.getElementById('resultTitle').textContent = title;
    document.getElementById('resultMessage').textContent = message;
    resultDiv?.classList.remove('hidden');
  },
  
  hideResult() {
    document.getElementById('backupResult')?.classList.add('hidden');
    document.querySelector('.backup-panel-content')?.classList.remove('hidden');
  },
  
  /**
   * Update panel status display
   */
  updatePanelStatus() {
    // Last backup
    const lastBackup = GiniBackup.getLastBackupInfo();
    const lastBackupEl = document.getElementById('lastBackupDate');
    if (lastBackupEl) {
      if (lastBackup) {
        lastBackupEl.textContent = lastBackup.formatted;
        if (lastBackup.daysAgo > 30) {
          lastBackupEl.classList.add('backup-status-value--warning');
        } else {
          lastBackupEl.classList.remove('backup-status-value--warning');
        }
      } else {
        lastBackupEl.textContent = 'Never';
        lastBackupEl.classList.add('backup-status-value--warning');
      }
    }
    
    // Data summary
    const summary = GiniBackup.getDataSummary();
    const summaryEl = document.getElementById('backupSummaryItems');
    if (summaryEl) {
      if (summary.sections.length > 0) {
        summaryEl.innerHTML = summary.sections.map(s => 
          `<span class="backup-summary-tag">${s}</span>`
        ).join('');
      } else {
        summaryEl.innerHTML = '<span class="backup-summary-empty">No data yet</span>';
      }
    }
  },
  
  /**
   * Handle download action
   */
  handleDownload() {
    const result = GiniBackup.downloadBackup();
    
    if (result.success) {
      this.showResult(true, 'Backup Created!', 
        `Your data has been saved to ${result.filename}`);
      this.updatePanelStatus();
    } else {
      this.showResult(false, 'Backup Failed', 
        result.errors?.[0] || 'An unexpected error occurred.');
    }
  },
  
  /**
   * Handle restore file selection
   */
  async handleRestoreFile(file) {
    try {
      const data = await GiniBackup.readBackupFile(file);
      const validation = GiniBackup.validateRestoreData(data);
      
      if (!validation.isValid) {
        this.showResult(false, 'Invalid Backup', validation.errors[0]);
        return;
      }
      
      // Store for later
      this.pendingRestoreData = data;
      
      // Show confirmation with details
      const detailsEl = document.getElementById('restoreDetails');
      if (detailsEl) {
        detailsEl.innerHTML = `
          <div class="restore-detail">
            <span>Backup Date:</span>
            <strong>${GiniBackup.formatDate(validation.createdAt)}</strong>
          </div>
          <div class="restore-detail">
            <span>Sections:</span>
            <strong>${validation.sections.length} items</strong>
          </div>
        `;
      }
      
      this.showRestoreConfirm();
    } catch (error) {
      this.showResult(false, 'Error Reading File', error.message);
    }
    
    // Reset file input
    document.getElementById('restoreFileInput').value = '';
  },
  
  /**
   * Execute the restore
   */
  async executeRestore() {
    if (!this.pendingRestoreData) return;
    
    const result = await GiniBackup.applyRestore(this.pendingRestoreData);
    this.pendingRestoreData = null;
    
    if (result.success) {
      this.showResult(true, 'Restore Complete!', 
        `Successfully restored: ${result.restored.slice(0, 3).join(', ')}${result.restored.length > 3 ? '...' : ''}`);
      
      // Refresh page after short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else {
      this.showResult(false, 'Restore Failed', 
        result.errors?.[0] || 'Some data could not be restored.');
    }
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  GiniBackupUI.init();
});

// Export for external use
window.GiniBackup = GiniBackup;
window.GiniBackupUI = GiniBackupUI;

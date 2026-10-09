/**
 * CyberGuard Security Kit - Core Application Logic
 * 
 * Architecture:
 * - Pure Vanilla JavaScript (ES6)
 * - Zero external libraries or framework dependencies
 * - Client-side processing using native browser Web APIs
 * - Explanatory comments throughout to assist educational presentations
 */

// Global Application Controller Namespace
const CyberGuard = {
  // Current active view tab
  currentTab: 'dashboard',

  // Local storage keys
  STORAGE_HISTORY_KEY: 'cyberguard_audit_history',
  STORAGE_THEME_KEY: 'cyberguard_theme_pref',

  // Cached calculated file hash for verification comparison
  currentCalculatedHash: '',

  // Cached last audited password to prevent redundant duplicate audit logs
  lastAuditedPassword: '',

  // Cached log analyzer dataset for filtering
  currentLogLines: [],

  /* ==========================================================================
     1. Initialization & Life Cycle
     ========================================================================== */
  init() {
    console.log('[CyberGuard] Initializing client-side SOC workstation...');

    // Setup navigation tabs & sidebar
    this.setupNavigation();
    
    // Setup theme switcher
    this.setupTheme();

    // Setup tool modules
    this.setupPasswordChecker();
    this.setupUrlAnalyzer();
    this.setupFileIntegrity();
    this.setupLogAnalyzer();
    this.setupReportsAndHistory();
    this.setupSettings();

    // Load initial history & refresh dashboard metrics
    this.seedDemoHistoryIfEmpty();
    this.refreshDashboardMetrics();
    this.renderDashboardRecentTable();
  },

  /* ==========================================================================
     2. Navigation & View Controller
     ========================================================================== */
  setupNavigation() {
    // Handle sidebar navigation clicks
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetView = btn.getAttribute('data-target');
        if (targetView) {
          this.switchTab(targetView);
        }
      });
    });

    // Mobile sidebar toggle controls
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
    const sidebar = document.getElementById('sidebar');

    if (menuToggleBtn && sidebar) {
      menuToggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
    }

    if (sidebarCloseBtn && sidebar) {
      sidebarCloseBtn.addEventListener('click', () => {
        sidebar.classList.remove('open');
      });
    }
  },

  /**
   * Switch the active view section
   * @param {string} targetTabId - The tab name (e.g. 'dashboard', 'password-checker')
   */
  switchTab(targetTabId) {
    this.currentTab = targetTabId;

    // 1. Update navigation button active state
    document.querySelectorAll('.nav-link').forEach(btn => {
      if (btn.getAttribute('data-target') === targetTabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // 2. Hide all view sections and display the selected one
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.remove('active');
    });

    const targetSection = document.getElementById(`view-${targetTabId}`);
    if (targetSection) {
      targetSection.classList.add('active');
    }

    // 3. Update top breadcrumb title
    const headerTitle = document.getElementById('header-page-title');
    if (headerTitle) {
      const titles = {
        'dashboard': 'Dashboard',
        'password-checker': 'Password Checker',
        'url-analyzer': 'URL Analyzer',
        'file-integrity': 'File Integrity',
        'log-analyzer': 'Log Analyzer',
        'reports': 'Reports & History',
        'learn': 'Learn Security',
        'settings': 'Settings'
      };
      headerTitle.textContent = titles[targetTabId] || 'Workstation';
    }

    // 4. Close mobile sidebar drawer if open
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.remove('open');
    }

    // 5. Scroll main container to top
    const mainContainer = document.querySelector('.content-container');
    if (mainContainer) {
      mainContainer.scrollTop = 0;
    }

    // 6. Refresh views that require on-tab sync
    if (targetTabId === 'reports') {
      this.renderFullHistoryTable();
    } else if (targetTabId === 'dashboard') {
      this.refreshDashboardMetrics();
      this.renderDashboardRecentTable();
    } else if (targetTabId === 'settings') {
      this.updateSettingsCounts();
    }
  },

  /* ==========================================================================
     3. Theme System (Dark / Light)
     ========================================================================== */
  setupTheme() {
    const savedTheme = localStorage.getItem(this.STORAGE_THEME_KEY) || 'theme-dark';
    this.applyTheme(savedTheme);

    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const isCurrentDark = document.body.classList.contains('theme-dark');
        const newTheme = isCurrentDark ? 'theme-light' : 'theme-dark';
        this.applyTheme(newTheme);
      });
    }

    const themeSelect = document.getElementById('setting-theme-select');
    if (themeSelect) {
      themeSelect.value = savedTheme;
      themeSelect.addEventListener('change', (e) => {
        this.applyTheme(e.target.value);
      });
    }
  },

  applyTheme(themeName) {
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add(themeName);
    localStorage.setItem(this.STORAGE_THEME_KEY, themeName);

    // Sync select dropdown in settings
    const themeSelect = document.getElementById('setting-theme-select');
    if (themeSelect) themeSelect.value = themeName;

    // Toggle header button icons
    const darkIcon = document.querySelector('.theme-icon.dark-icon');
    const lightIcon = document.querySelector('.theme-icon.light-icon');
    if (darkIcon && lightIcon) {
      if (themeName === 'theme-dark') {
        darkIcon.style.display = 'inline-flex';
        lightIcon.style.display = 'none';
      } else {
        darkIcon.style.display = 'none';
        lightIcon.style.display = 'inline-flex';
      }
    }
  },

  /* ==========================================================================
     4. TOOL A: Password Checker Module
     ========================================================================== */
  setupPasswordChecker() {
    const input = document.getElementById('password-input');
    const toggleBtn = document.getElementById('password-toggle-btn');
    const eyeShow = document.getElementById('eye-icon-show');
    const eyeHide = document.getElementById('eye-icon-hide');
    const auditBtn = document.getElementById('btn-audit-password');

    if (!input) return;

    // Password visibility toggle
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const isPassword = input.getAttribute('type') === 'password';
        input.setAttribute('type', isPassword ? 'text' : 'password');
        if (eyeShow && eyeHide) {
          eyeShow.style.display = isPassword ? 'none' : 'block';
          eyeHide.style.display = isPassword ? 'block' : 'none';
        }
      });
    }

    // Real-time evaluation on typing
    input.addEventListener('input', () => {
      this.evaluatePassword(input.value);
    });

    // Helper to log audit check without saving raw password
    const recordPasswordCheck = (isExplicit = false) => {
      const val = input.value;
      if (val.trim().length > 0) {
        // Prevent duplicate spam if user blurred without changing value
        if (!isExplicit && val === this.lastAuditedPassword) {
          return;
        }
        this.lastAuditedPassword = val;
        const analysis = this.analyzePasswordEntropy(val);

        // Security rule: NEVER store, log or transmit the entered password string!
        // We strictly record non-sensitive metadata only (entropy, strength, length).
        this.recordAuditEvent({
          module: 'Password Checker',
          status: analysis.strengthLabel,
          summary: `Evaluated password: ${analysis.strengthLabel} (${analysis.entropy} bits entropy)`,
          details: `Length: ${val.length} chars. Estimated crack resistance: ${analysis.crackTimeText}.`
        });

        if (auditBtn && isExplicit) {
          const originalHTML = auditBtn.innerHTML;
          auditBtn.innerHTML = `&#10003; Check Logged!`;
          setTimeout(() => { auditBtn.innerHTML = originalHTML; }, 1800);
        }
      }
    };

    if (auditBtn) {
      auditBtn.addEventListener('click', () => recordPasswordCheck(true));
    }

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        recordPasswordCheck(true);
      }
    });

    input.addEventListener('blur', () => {
      recordPasswordCheck(false);
    });
  },

  /**
   * Helper to load a demo sample password from the preset buttons
   */
  testPassword(sampleText) {
    const input = document.getElementById('password-input');
    if (input) {
      input.value = sampleText;
      this.evaluatePassword(sampleText);
      this.lastAuditedPassword = sampleText;

      const analysis = this.analyzePasswordEntropy(sampleText);
      this.recordAuditEvent({
        module: 'Password Checker',
        status: analysis.strengthLabel,
        summary: `Evaluated sample: ${analysis.strengthLabel} (${analysis.entropy} bits entropy)`,
        details: `Length: ${sampleText.length} chars. Estimated crack resistance: ${analysis.crackTimeText}.`
      });

      // Auto-switch to password checker view
      this.switchTab('password-checker');
    }
  },

  /**
   * Evaluates the password, updates the UI meter, checklist, and feedback cards
   */
  evaluatePassword(password) {
    const statusText = document.getElementById('strength-status-text');
    const barFill = document.getElementById('strength-bar-fill');
    const entropyDisplay = document.getElementById('entropy-value');
    const crackTimeDisplay = document.getElementById('crack-time-value');
    const lengthDisplay = document.getElementById('pwd-length-value');
    const feedbackContainer = document.getElementById('password-feedback-container');

    if (!password || password.length === 0) {
      if (statusText) statusText.textContent = 'Awaiting Input';
      if (barFill) {
        barFill.style.width = '0%';
        barFill.style.backgroundColor = 'transparent';
      }
      if (entropyDisplay) entropyDisplay.textContent = '0 bits';
      if (crackTimeDisplay) crackTimeDisplay.textContent = 'Instant';
      if (lengthDisplay) lengthDisplay.textContent = '0';
      
      this.updatePasswordCriteriaUI({
        hasLength: false,
        hasUpper: false,
        hasLower: false,
        hasNumber: false,
        hasSymbol: false,
        noDictionary: false
      });

      if (feedbackContainer) {
        feedbackContainer.innerHTML = `
          <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <h4>No Password Entered</h4>
            <p>Enter any phrase on the left to review specific vulnerability indicators, entropy analysis, and improvement advice.</p>
          </div>
        `;
      }
      return;
    }

    // Perform mathematical and heuristic analysis
    const analysis = this.analyzePasswordEntropy(password);

    // Update stat numbers
    if (lengthDisplay) lengthDisplay.textContent = password.length;
    if (entropyDisplay) entropyDisplay.textContent = `${analysis.entropy} bits`;
    if (crackTimeDisplay) crackTimeDisplay.textContent = analysis.crackTimeText;
    if (statusText) {
      statusText.textContent = analysis.strengthLabel;
      statusText.style.color = analysis.color;
    }

    // Update meter fill
    if (barFill) {
      barFill.style.width = `${analysis.percentage}%`;
      barFill.style.backgroundColor = analysis.color;
    }

    // Update criteria checklist
    this.updatePasswordCriteriaUI(analysis.criteria);

    // Render actionable feedback
    if (feedbackContainer) {
      feedbackContainer.innerHTML = this.renderPasswordFeedbackHTML(analysis);
    }
  },

  /**
   * Computes entropy and password heuristics
   */
  analyzePasswordEntropy(pwd) {
    const len = pwd.length;
    let poolSize = 0;

    const hasLower = /[a-z]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSymbol = /[^a-zA-Z0-9]/.test(pwd);
    const hasLength = len >= 12;

    if (hasLower) poolSize += 26;
    if (hasUpper) poolSize += 26;
    if (hasNumber) poolSize += 10;
    if (hasSymbol) poolSize += 33;

    // Check for common dictionary words or sequences
    const commonPatterns = ['password', '123456', 'qwerty', 'admin', 'welcome', 'letmein', 'pass123', 'iloveyou', 'abc123', 'dragon'];
    const lowerPwd = pwd.toLowerCase();
    const hasCommonWord = commonPatterns.some(pattern => lowerPwd.includes(pattern));
    const hasSequential = /(123|abc|xyz|789)/i.test(pwd);
    const noDictionary = !hasCommonWord && !hasSequential;

    // Shannon Information Entropy: E = L * log2(Pool)
    let entropy = 0;
    if (poolSize > 0 && len > 0) {
      entropy = Math.round(len * (Math.log(poolSize) / Math.log(2)));
    }

    // Penalty for predictable patterns
    if (hasCommonWord) entropy = Math.max(10, entropy - 30);
    if (hasSequential) entropy = Math.max(10, entropy - 15);

    // Crack-time estimation (Assuming offline GPU hash cluster: ~10^10 guesses/sec)
    const guesses = Math.pow(2, entropy);
    const guessesPerSec = 10000000000; // 10 billion/sec
    const seconds = guesses / guessesPerSec;

    let crackTimeText = 'Instant (< 1 sec)';
    if (seconds >= 315360000000) {
      crackTimeText = 'Millions of years';
    } else if (seconds >= 3153600000) {
      crackTimeText = 'Centuries+';
    } else if (seconds >= 31536000) {
      const yrs = Math.round(seconds / 31536000);
      crackTimeText = `~${yrs} year${yrs > 1 ? 's' : ''}`;
    } else if (seconds >= 86400) {
      const days = Math.round(seconds / 86400);
      crackTimeText = `~${days} day${days > 1 ? 's' : ''}`;
    } else if (seconds >= 3600) {
      const hours = Math.round(seconds / 3600);
      crackTimeText = `~${hours} hour${hours > 1 ? 's' : ''}`;
    } else if (seconds >= 60) {
      const mins = Math.round(seconds / 60);
      crackTimeText = `~${mins} min${mins > 1 ? 's' : ''}`;
    } else if (seconds >= 1) {
      crackTimeText = `~${Math.round(seconds)} seconds`;
    }

    // Categorization according to NIST Special Publication 800-63B guidelines
    let strengthLabel = 'Very Weak';
    let color = 'var(--status-red)';
    let percentage = 20;

    if (entropy < 30 || len < 8) {
      strengthLabel = 'Very Weak';
      color = 'var(--status-red)';
      percentage = 20;
    } else if (entropy < 48 || len < 10) {
      strengthLabel = 'Weak';
      color = 'var(--status-amber)';
      percentage = 40;
    } else if (entropy < 65 || len < 12) {
      strengthLabel = 'Moderate';
      color = 'var(--status-blue)';
      percentage = 65;
    } else if (entropy < 85) {
      strengthLabel = 'Strong';
      color = 'var(--accent-teal)';
      percentage = 85;
    } else {
      strengthLabel = 'Very Strong';
      color = 'var(--status-green)';
      percentage = 100;
    }

    return {
      entropy,
      percentage,
      strengthLabel,
      color,
      crackTimeText,
      hasCommonWord,
      hasSequential,
      criteria: {
        hasLength,
        hasUpper,
        hasLower,
        hasNumber,
        hasSymbol,
        noDictionary
      }
    };
  },

  /**
   * Updates criteria list checkmark badges
   */
  updatePasswordCriteriaUI(crit) {
    const map = {
      'rule-length': crit.hasLength,
      'rule-upper': crit.hasUpper,
      'rule-lower': crit.hasLower,
      'rule-number': crit.hasNumber,
      'rule-symbol': crit.hasSymbol,
      'rule-dictionary': crit.noDictionary
    };

    for (const [id, passed] of Object.entries(map)) {
      const el = document.getElementById(id);
      if (el) {
        if (passed) {
          el.className = 'criteria-item checked';
        } else {
          el.className = 'criteria-item failed';
        }
      }
    }
  },

  /**
   * Generates feedback HTML based on weaknesses detected
   */
  renderPasswordFeedbackHTML(analysis) {
    let cards = [];

    if (analysis.hasCommonWord) {
      cards.push(`
        <div class="feedback-card danger">
          <div class="feedback-heading">&#9888; Common Dictionary Pattern Detected</div>
          <div class="feedback-body">This password contains well-known dictionary terms (like 'password' or 'admin'). Attackers test standard wordlists first in dictionary attacks, rendering complexity substitutions ineffective.</div>
        </div>
      `);
    }

    if (!analysis.criteria.hasLength) {
      cards.push(`
        <div class="feedback-card weakness">
          <div class="feedback-heading">&#9888; Insufficient Length</div>
          <div class="feedback-body">Length is the primary factor in brute-force resistance. Passwords under 12 characters have a limited search space and can be calculated rapidly on modern GPUs.</div>
        </div>
      `);
    }

    if (!analysis.criteria.hasSymbol || !analysis.criteria.hasNumber) {
      cards.push(`
        <div class="feedback-card weakness">
          <div class="feedback-heading">&#9432; Expand Character Variety</div>
          <div class="feedback-body">Mixing symbols (!@#$) and digits increases the per-character character pool from 26 to 95 possibilities, dramatically multiplying crack time.</div>
        </div>
      `);
    }

    if (analysis.entropy >= 65 && analysis.criteria.noDictionary) {
      cards.push(`
        <div class="feedback-card good">
          <div class="feedback-heading">&#10003; High Mathematical Entropy</div>
          <div class="feedback-body">This phrase exhibits robust theoretical resistance to offline brute-force attacks. Ensure you do not reuse this credential across different web services.</div>
        </div>
      `);
    }

    // Recommendation advice
    cards.push(`
      <div class="feedback-card">
        <div class="feedback-heading">Hardening Tip: Use Passphrases</div>
        <div class="feedback-body">Rather than difficult-to-remember short strings with random symbols, choose 4-5 unrelated words combined with separators (e.g. <code>coral-galaxy-timber-harvest-99</code>). This achieves 80+ bits of entropy while remaining memorable.</div>
      </div>
    `);

    return cards.join('');
  },

  /* ==========================================================================
     5. TOOL B: URL Analyzer Module
     ========================================================================== */
  setupUrlAnalyzer() {
    const input = document.getElementById('url-input');
    const analyzeBtn = document.getElementById('btn-analyze-url');
    const errorAlert = document.getElementById('url-error-alert');
    const errorMsg = document.getElementById('url-error-msg');

    if (!input || !analyzeBtn) return;

    const showError = (msg) => {
      if (errorAlert && errorMsg) {
        errorMsg.textContent = msg;
        errorAlert.style.display = 'flex';
      }
    };

    const hideError = () => {
      if (errorAlert) {
        errorAlert.style.display = 'none';
      }
    };

    analyzeBtn.addEventListener('click', () => {
      const urlText = input.value.trim();
      if (!urlText) {
        showError('Please enter a target URL to analyze.');
        return;
      }
      hideError();
      this.analyzeURL(urlText);
    });

    // Allow Enter key to trigger analysis
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        analyzeBtn.click();
      }
    });

    input.addEventListener('input', () => {
      hideError();
    });
  },

  /**
   * Helper to load a demo sample URL from presets
   */
  testUrl(sampleUrl) {
    const input = document.getElementById('url-input');
    const errorAlert = document.getElementById('url-error-alert');
    if (errorAlert) errorAlert.style.display = 'none';

    if (input) {
      input.value = sampleUrl;
      this.analyzeURL(sampleUrl);
      this.switchTab('url-analyzer');
    }
  },

  /**
   * Comprehensive Heuristic Analysis of a Target URL
   */
  analyzeURL(rawUrl) {
    const errorAlert = document.getElementById('url-error-alert');
    const errorMsg = document.getElementById('url-error-msg');

    let sanitized = rawUrl.trim();
    // Prepend protocol if user entered bare domain
    if (!sanitized.startsWith('http://') && !sanitized.startsWith('https://')) {
      sanitized = 'http://' + sanitized;
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(sanitized);
    } catch (err) {
      if (errorAlert && errorMsg) {
        errorMsg.textContent = 'Invalid URL format. Please enter a valid address (e.g., https://example.com/login).';
        errorAlert.style.display = 'flex';
      }
      return;
    }

    // Hide any previous error banner
    if (errorAlert) errorAlert.style.display = 'none';

    // Run Heuristic Inspection Checks
    const findings = [];
    let warningCount = 0;
    let alertCount = 0;

    // Check 1: Insecure HTTP Protocol
    const isInsecure = parsedUrl.protocol === 'http:';
    if (isInsecure) {
      warningCount++;
      findings.push({
        name: 'Insecure Protocol (HTTP)',
        status: 'WARNING',
        statusClass: 'badge-warning',
        reason: 'Data sent across HTTP is transmitted in plaintext without TLS/SSL encryption, making it vulnerable to interception via Man-in-the-Middle (MitM) attacks.',
        action: 'Avoid transmitting passwords, credit cards, or personal data on this connection.'
      });
    } else {
      findings.push({
        name: 'Transport Layer Security (HTTPS)',
        status: 'PASSED',
        statusClass: 'badge-success',
        reason: 'Connection utilizes TLS/HTTPS encryption. Note: Legitimate SSL certificates simply encrypt data; they do not guarantee the website owner is benevolent.',
        action: 'Normal transport encryption verified.'
      });
    }

    // Check 2: IP Address as Hostname
    const isIpHost = /^(\d{1,3}\.){3}\d{1,3}$/.test(parsedUrl.hostname);
    if (isIpHost) {
      alertCount++;
      findings.push({
        name: 'Raw IP Address Host',
        status: 'ALERT',
        statusClass: 'badge-danger',
        reason: `The URL uses a raw IP address (${parsedUrl.hostname}) instead of a registered domain name. Threat actors frequently host phishing portals or command-and-control servers directly on IPs to bypass domain reputation blocklists.`,
        action: 'Exercise extreme caution. Legitimate commercial web services rarely require users to navigate to bare IP addresses.'
      });
    } else {
      findings.push({
        name: 'Domain Name Resolution',
        status: 'PASSED',
        statusClass: 'badge-success',
        reason: 'Host relies on standard DNS domain hierarchy rather than raw IP routing.',
        action: 'Normal domain name.'
      });
    }

    // Check 3: Excessive Subdomain Depth (Subdomain spoofing)
    const hostParts = parsedUrl.hostname.split('.');
    const isMultiSubdomain = hostParts.length > 3 && !isIpHost;
    if (isMultiSubdomain) {
      warningCount++;
      findings.push({
        name: 'Excessive Subdomain Depth',
        status: 'WARNING',
        statusClass: 'badge-warning',
        reason: `Host contains ${hostParts.length} domain parts (${parsedUrl.hostname}). Phishing attackers stack subdomains to push the real registered domain out of visible view on mobile browser address bars.`,
        action: 'Carefully check the actual registered domain immediately before the TLD.'
      });
    }

    // Check 4: Brand Spoofing in Subdomains
    const wellKnownBrands = ['paypal', 'google', 'apple', 'microsoft', 'amazon', 'netflix', 'chase', 'bank', 'wellsfargo', 'login', 'account', 'verify', 'security'];
    const subdomains = hostParts.slice(0, -2).join('.');
    const brandMatches = wellKnownBrands.filter(b => subdomains.toLowerCase().includes(b));

    if (brandMatches.length > 0 && !isIpHost) {
      alertCount++;
      findings.push({
        name: 'Deceptive Brand Name in Subdomain',
        status: 'ALERT',
        statusClass: 'badge-danger',
        reason: `Subdomain contains recognizable brand keywords (${brandMatches.join(', ')}). In DNS, anyone who owns the root domain can name their subdomains anything (e.g. 'paypal.com.attacker.xyz').`,
        action: 'Do not enter credentials. Verify the legitimate company domain directly.'
      });
    }

    // Check 5: Suspicious or High-Abuse TLDs
    const suspiciousTlds = ['xyz', 'top', 'tk', 'ml', 'ga', 'cf', 'gq', 'click', 'fit', 'work', 'pw', 'zip', 'mov'];
    const tld = hostParts[hostParts.length - 1].toLowerCase();
    if (suspiciousTlds.includes(tld)) {
      warningCount++;
      findings.push({
        name: `High-Abuse TLD (.${tld})`,
        status: 'WARNING',
        statusClass: 'badge-warning',
        reason: `Top-Level Domain .${tld} has historically high frequencies of spam, phishing, and malware campaigns due to negligible registration costs or lack of identity vetting.`,
        action: 'Confirm the origin of the link before interacting.'
      });
    }

    // Check 6: Embedded User Credentials (@ Symbol Trick)
    const hasAtSymbol = parsedUrl.username || parsedUrl.password || rawUrl.includes('@');
    if (hasAtSymbol) {
      alertCount++;
      findings.push({
        name: 'Embedded Credentials / @ Sign Trick',
        status: 'ALERT',
        statusClass: 'badge-danger',
        reason: 'The "@" character in URLs instructs standard browsers to treat text before it as userinfo credentials. Attackers use this to display a fake brand in front (e.g., https://google.com@evil-site.com).',
        action: 'Severe phishing indicator. Avoid opening this destination.'
      });
    }

    // Check 7: Non-Standard Web Ports
    const hasCustomPort = parsedUrl.port && parsedUrl.port !== '80' && parsedUrl.port !== '443';
    if (hasCustomPort) {
      warningCount++;
      findings.push({
        name: `Non-Standard Port (Port ${parsedUrl.port})`,
        status: 'WARNING',
        statusClass: 'badge-warning',
        reason: `Standard web traffic uses port 80 (HTTP) or port 443 (HTTPS). Running web servers on port ${parsedUrl.port} is common in test environments or malicious staging servers.`,
        action: 'Ensure this service is expected before transmitting information.'
      });
    }

    // Check 8: Phishing Lures in URL Path
    const suspiciousPathKeywords = ['login', 'signin', 'verify', 'account-update', 'wallet', 'security-check', 'wp-login'];
    const pathMatches = suspiciousPathKeywords.filter(k => parsedUrl.pathname.toLowerCase().includes(k));
    if (pathMatches.length > 0 && (isInsecure || isIpHost || brandMatches.length > 0)) {
      warningCount++;
      findings.push({
        name: 'Authentication Lure in Path',
        status: 'WARNING',
        statusClass: 'badge-warning',
        reason: `URL path contains authentication trigger keywords (${pathMatches.join(', ')}) combined with secondary risk factors.`,
        action: 'Verify that you initiated this login request directly.'
      });
    }

    // Check 9: Obfuscated Characters, Punycode & Excessive Hyphens
    const hasPunycode = parsedUrl.hostname.toLowerCase().startsWith('xn--') || /[^\x00-\x7F]/.test(parsedUrl.hostname);
    const hyphenCount = (parsedUrl.hostname.match(/-/g) || []).length;
    const hasExcessiveHyphens = hyphenCount >= 3;
    const hasSuspiciousEncoding = /%(25|2e|2f|00)/i.test(rawUrl);

    if (hasPunycode) {
      alertCount++;
      findings.push({
        name: 'Punycode / Homograph Spoofing',
        status: 'ALERT',
        statusClass: 'badge-danger',
        reason: 'Host uses Punycode (xn--) or non-ASCII characters. Threat actors use lookalike Unicode/Cyrillic characters (e.g., Cyrillic "а" instead of Latin "a") to visually impersonate trusted domains.',
        action: 'Severe homograph risk. Inspect domain encoding.'
      });
    } else if (hasExcessiveHyphens) {
      warningCount++;
      findings.push({
        name: 'Excessive Domain Hyphenation',
        status: 'WARNING',
        statusClass: 'badge-warning',
        reason: `Host contains ${hyphenCount} hyphens (${parsedUrl.hostname}). Phishing operators frequently chain hyphenated keywords (e.g. apple-login-security-update) to simulate official service names.`,
        action: 'Check who officially owns the root domain.'
      });
    } else if (hasSuspiciousEncoding) {
      warningCount++;
      findings.push({
        name: 'Suspicious Character Percent-Encoding',
        status: 'WARNING',
        statusClass: 'badge-warning',
        reason: 'URL contains encoded slashes, dots, or null-byte characters (%2e, %2f, %00). Double encoding is often employed to bypass web application firewall (WAF) filters.',
        action: 'Inspect destination endpoint parameters before submitting credentials.'
      });
    } else {
      findings.push({
        name: 'Character Encoding & Representation',
        status: 'PASSED',
        statusClass: 'badge-success',
        reason: 'Host uses standard ASCII characters without punycode obfuscation or suspicious percent-encoded control characters.',
        action: 'Normal character encoding verified.'
      });
    }

    // Display Results in UI
    const emptyState = document.getElementById('url-empty-state');
    const resultContainer = document.getElementById('url-result-container');
    if (emptyState) emptyState.style.display = 'none';
    if (resultContainer) resultContainer.style.display = 'block';

    // Summary Card Risk Calculation
    const riskBadge = document.getElementById('url-risk-badge');
    const verdictTitle = document.getElementById('url-verdict-title');
    const verdictDesc = document.getElementById('url-verdict-desc');
    const warningDisplay = document.getElementById('url-warning-count');
    const alertDisplay = document.getElementById('url-alert-count');

    if (warningDisplay) warningDisplay.textContent = warningCount;
    if (alertDisplay) alertDisplay.textContent = alertCount;

    let overallVerdict = 'Low Risk';
    if (alertCount > 0) {
      overallVerdict = 'High Suspicion';
      if (riskBadge) {
        riskBadge.textContent = 'High Suspicion';
        riskBadge.className = 'url-risk-badge risk-high';
      }
      if (verdictTitle) verdictTitle.textContent = 'Critical Phishing Indicators Flagged';
      if (verdictDesc) verdictDesc.textContent = 'Address exhibits deceptive domain structure, raw IP host, or credential tricks.';
    } else if (warningCount > 0) {
      overallVerdict = 'Moderate Caution';
      if (riskBadge) {
        riskBadge.textContent = 'Moderate Caution';
        riskBadge.className = 'url-risk-badge risk-medium';
      }
      if (verdictTitle) verdictTitle.textContent = 'Potential Security Anomalies Detected';
      if (verdictDesc) verdictDesc.textContent = 'One or more non-standard parameters or insecure transport detected.';
    } else {
      overallVerdict = 'Low Risk';
      if (riskBadge) {
        riskBadge.textContent = 'Low Risk';
        riskBadge.className = 'url-risk-badge risk-safe';
      }
      if (verdictTitle) verdictTitle.textContent = 'URL Passed Primary Heuristic Rules';
      if (verdictDesc) verdictDesc.textContent = 'No obvious deceptive structures detected in this web address.';
    }

    // Render Anatomy Breakdown
    this.renderUrlAnatomy(parsedUrl, hostParts);

    // Render Heuristics Table
    const tableBody = document.getElementById('url-heuristics-table');
    if (tableBody) {
      tableBody.innerHTML = findings.map(item => `
        <tr>
          <td><strong>${item.name}</strong></td>
          <td><span class="badge ${item.statusClass}">${item.status}</span></td>
          <td>${item.reason}</td>
          <td>${item.action}</td>
        </tr>
      `).join('');
    }

    // Record Audit Entry
    this.recordAuditEvent({
      module: 'URL Analyzer',
      status: overallVerdict,
      summary: `Inspected: ${parsedUrl.hostname} (${overallVerdict})`,
      details: `Warnings: ${warningCount}, Critical Alerts: ${alertCount}. Protocol: ${parsedUrl.protocol}`
    });
  },

  /**
   * Renders color-coded breakdown tags of the URL components
   */
  renderUrlAnatomy(parsedUrl, hostParts) {
    const tagsContainer = document.getElementById('url-breakdown-tags');
    const protocolElem = document.getElementById('url-part-protocol');
    const hostElem = document.getElementById('url-part-host');
    const subdomainElem = document.getElementById('url-part-subdomain');
    const tldElem = document.getElementById('url-part-tld');
    const pathElem = document.getElementById('url-part-path');
    const portElem = document.getElementById('url-part-port');

    const subdomains = hostParts.length > 2 ? hostParts.slice(0, -2).join('.') : 'None';
    const domain = hostParts.length >= 2 ? hostParts.slice(-2).join('.') : parsedUrl.hostname;
    const tld = hostParts.length >= 2 ? hostParts[hostParts.length - 1] : 'N/A';

    if (protocolElem) protocolElem.textContent = parsedUrl.protocol;
    if (hostElem) hostElem.textContent = domain;
    if (subdomainElem) subdomainElem.textContent = subdomains;
    if (tldElem) tldElem.textContent = '.' + tld;
    if (pathElem) pathElem.textContent = parsedUrl.pathname + parsedUrl.search;
    if (portElem) portElem.textContent = parsedUrl.port || (parsedUrl.protocol === 'https:' ? '443 (Default)' : '80 (Default)');

    if (tagsContainer) {
      tagsContainer.innerHTML = `
        <span class="url-token tok-scheme" title="Scheme / Protocol">${parsedUrl.protocol}//</span>
        ${subdomains !== 'None' ? `<span class="url-token tok-sub" title="Subdomain">${subdomains}.</span>` : ''}
        <span class="url-token tok-domain" title="Registered Domain">${domain}</span>
        ${parsedUrl.port ? `<span class="url-token tok-port" title="Port">:${parsedUrl.port}</span>` : ''}
        <span class="url-token tok-path" title="Path & Query">${parsedUrl.pathname}${parsedUrl.search}</span>
      `;
    }
  },

  /* ==========================================================================
     6. TOOL C: File Integrity (Web Crypto SHA-256)
     ========================================================================== */
  setupFileIntegrity() {
    const dropZone = document.getElementById('file-drop-zone');
    const fileInput = document.getElementById('file-input');
    const copyBtn = document.getElementById('btn-copy-hash');
    const expectedInput = document.getElementById('expected-hash-input');
    const demoFileBtn = document.getElementById('btn-hash-demo-file');

    if (!dropZone || !fileInput) return;

    // File input change
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) this.processFileHash(file);
    });

    // Drag & Drop handlers
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        this.processFileHash(e.dataTransfer.files[0]);
      }
    });

    // One-click copy hash button
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        if (!this.currentCalculatedHash) return;
        navigator.clipboard.writeText(this.currentCalculatedHash).then(() => {
          const btnText = document.getElementById('copy-btn-text');
          if (btnText) {
            btnText.textContent = 'Copied!';
            setTimeout(() => { btnText.textContent = 'Copy Hash'; }, 2000);
          }
        }).catch(err => {
          console.error('Failed to copy hash:', err);
        });
      });
    }

    // Expected Hash Comparator
    if (expectedInput) {
      expectedInput.addEventListener('input', () => {
        this.compareHashes(expectedInput.value.trim());
      });
    }

    // Demo virtual file hash button
    if (demoFileBtn) {
      demoFileBtn.addEventListener('click', () => {
        // Create an in-memory virtual Blob for immediate zero-hassle testing
        const sampleContent = 'CyberGuard Security Kit - File Integrity Verification Test Document\nGenerated for college security presentation.\nSHA-256 integrity simulation payload.';
        const blob = new Blob([sampleContent], { type: 'text/plain' });
        blob.name = 'cyberguard-demo-document.txt';
        blob.lastModified = Date.now();
        this.processFileHash(blob);
      });
    }
  },

  /**
   * Processes file using HTML5 FileReader and native Web Crypto API
   */
  processFileHash(file) {
    const hashOutput = document.getElementById('hash-output-display');
    const metaCard = document.getElementById('file-meta-card');
    const nameDisplay = document.getElementById('file-name-display');
    const sizeDisplay = document.getElementById('file-size-display');
    const typeDisplay = document.getElementById('file-type-display');
    const dateDisplay = document.getElementById('file-date-display');
    const copyBtn = document.getElementById('btn-copy-hash');

    if (hashOutput) hashOutput.textContent = 'Calculating cryptographic SHA-256 fingerprint in browser memory...';

    // Show metadata
    if (metaCard) metaCard.style.display = 'flex';
    if (nameDisplay) nameDisplay.textContent = file.name;
    if (sizeDisplay) sizeDisplay.textContent = this.formatBytes(file.size);
    if (typeDisplay) typeDisplay.textContent = file.type || 'Plain Document / Binary';
    if (dateDisplay) dateDisplay.textContent = new Date(file.lastModified).toLocaleString();

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        // Native Web Crypto API SHA-256 Calculation
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        
        // Convert binary buffer to 64-character hexadecimal representation
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        this.currentCalculatedHash = hashHex;

        if (hashOutput) hashOutput.textContent = hashHex;
        if (copyBtn) copyBtn.disabled = false;

        // Auto re-check comparison if expected input already filled
        const expectedInput = document.getElementById('expected-hash-input');
        if (expectedInput && expectedInput.value.trim()) {
          this.compareHashes(expectedInput.value.trim());
        }

        // Record Audit Event
        this.recordAuditEvent({
          module: 'File Integrity',
          status: 'Calculated',
          summary: `Generated SHA-256 for: ${file.name}`,
          details: `Size: ${this.formatBytes(file.size)}. Hash starts with: ${hashHex.substring(0, 16)}...`
        });

      } catch (err) {
        console.error('Error generating hash:', err);
        if (hashOutput) hashOutput.textContent = 'Error calculating hash: ' + err.message;
      }
    };

    reader.onerror = () => {
      if (hashOutput) hashOutput.textContent = 'Error reading file stream.';
    };

    // Read file bytes into memory buffer
    reader.readAsArrayBuffer(file);
  },

  /**
   * Compares calculated hash with expected hash
   */
  compareHashes(expected) {
    const feedbackBox = document.getElementById('hash-compare-feedback');
    if (!feedbackBox) return;

    if (!expected || !this.currentCalculatedHash) {
      feedbackBox.style.display = 'none';
      return;
    }

    feedbackBox.style.display = 'block';

    const normalizedExpected = expected.toLowerCase().replace(/\s+/g, '');
    const normalizedCalculated = this.currentCalculatedHash.toLowerCase();

    if (normalizedExpected === normalizedCalculated) {
      feedbackBox.innerHTML = `
        <div class="banner-notice" style="background-color: var(--status-green-soft); border-color: rgba(16, 185, 129, 0.4);">
          <div class="notice-icon" style="color: var(--status-green);">&#10004;</div>
          <div class="notice-content">
            <strong style="color: var(--status-green);">Integrity Verified (MATCH):</strong>
            <span>The file's SHA-256 checksum exactly matches the expected baseline. The file is authentic and has not been altered, tampered with, or corrupted in transit.</span>
          </div>
        </div>
      `;
    } else {
      feedbackBox.innerHTML = `
        <div class="banner-notice" style="background-color: var(--status-red-soft); border-color: rgba(244, 63, 94, 0.4);">
          <div class="notice-icon" style="color: var(--status-red);">&#9888;</div>
          <div class="notice-content">
            <strong style="color: var(--status-red);">Integrity Alert (MISMATCH):</strong>
            <span>The calculated checksum does NOT match the expected value. This indicates the file has been altered, corrupted during download, or replaced with an unauthorized build.</span>
          </div>
        </div>
      `;
    }
  },

  /* ==========================================================================
     7. TOOL D: Log Analyzer Module
     ========================================================================== */
  setupLogAnalyzer() {
    const fileInput = document.getElementById('log-file-input');
    const fileNameDisplay = document.getElementById('log-file-name');
    const demoBtn = document.getElementById('btn-load-sample-log');
    const filterInput = document.getElementById('log-search-filter');

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          if (fileNameDisplay) fileNameDisplay.textContent = file.name;
          const reader = new FileReader();
          reader.onload = (event) => {
            this.parseLogContent(event.target.result, file.name);
          };
          reader.readAsText(file);
        }
      });
    }

    if (demoBtn) {
      demoBtn.addEventListener('click', () => {
        this.loadSampleAuthLog();
      });
    }

    if (filterInput) {
      filterInput.addEventListener('input', () => {
        this.filterTerminalLines(filterInput.value.trim());
      });
    }
  },

  /**
   * Pre-packaged Linux SSH Authentication Log for Presentation Demonstrations
   */
  loadSampleAuthLog() {
    const sampleAuthLog = `
Oct 09 04:12:01 srv-prod-01 sshd[14201]: Failed password for invalid user admin from 198.51.100.42 port 49120 ssh2
Oct 09 04:12:04 srv-prod-01 sshd[14205]: Failed password for invalid user admin from 198.51.100.42 port 49122 ssh2
Oct 09 04:12:07 srv-prod-01 sshd[14209]: Failed password for invalid user root from 198.51.100.42 port 49124 ssh2
Oct 09 04:12:10 srv-prod-01 sshd[14212]: Failed password for invalid user support from 198.51.100.42 port 49126 ssh2
Oct 09 04:12:13 srv-prod-01 sshd[14215]: Failed password for invalid user oracle from 198.51.100.42 port 49128 ssh2
Oct 09 04:12:16 srv-prod-01 sshd[14218]: Failed password for invalid user test from 198.51.100.42 port 49130 ssh2
Oct 09 04:12:20 srv-prod-01 sshd[14221]: Failed password for root from 198.51.100.42 port 49132 ssh2
Oct 09 04:14:30 srv-prod-01 sshd[14300]: Accepted publickey for sysadmin from 10.0.0.15 port 55102 ssh2: RSA SHA256:7uK+aB
Oct 09 04:16:01 srv-prod-01 sshd[14312]: pam_unix(sshd:auth): authentication failure; logname= uid=0 euid=0 tty=ssh ruser= rhost=203.0.113.195  user=root
Oct 09 04:16:04 srv-prod-01 sshd[14315]: Failed password for root from 203.0.113.195 port 38910 ssh2
Oct 09 04:16:07 srv-prod-01 sshd[14319]: Failed password for root from 203.0.113.195 port 38912 ssh2
Oct 09 04:16:11 srv-prod-01 sshd[14322]: Failed password for root from 203.0.113.195 port 38914 ssh2
Oct 09 04:18:22 srv-prod-01 sshd[14401]: Failed password for invalid user guest from 192.0.2.77 port 41105 ssh2
Oct 09 04:18:25 srv-prod-01 sshd[14404]: Failed password for invalid user guest from 192.0.2.77 port 41108 ssh2
Oct 09 04:19:00 srv-prod-01 sshd[14410]: Accepted password for deploy from 10.0.0.88 port 60231 ssh2
Oct 09 04:22:15 srv-prod-01 sshd[14450]: Connection closed by authenticating user root 198.51.100.42 [preauth]
Oct 09 04:25:30 srv-prod-01 sshd[14502]: Failed password for invalid user nagios from 198.51.100.42 port 49140 ssh2
Oct 09 04:25:33 srv-prod-01 sshd[14506]: Failed password for invalid user postgres from 198.51.100.42 port 49142 ssh2
Oct 09 04:30:12 srv-prod-01 sudo: sysadmin : TTY=pts/0 ; PWD=/home/sysadmin ; USER=root ; COMMAND=/usr/bin/apt update
`.trim();

    const fileNameDisplay = document.getElementById('log-file-name');
    if (fileNameDisplay) fileNameDisplay.textContent = 'sample_linux_auth.log (Demonstration Data)';

    this.parseLogContent(sampleAuthLog, 'sample_linux_auth.log (Demo)');
  },

  /**
   * Parses Raw Log Text Line-by-Line for Suspicious Attack Patterns
   */
  parseLogContent(rawText, sourceFileName) {
    if (!rawText || rawText.trim().length === 0) {
      alert('The chosen log file is empty. Please select a valid log file.');
      return;
    }

    const lines = rawText.split(/\r?\n/).filter(line => line.trim().length > 0);
    this.currentLogLines = lines;

    const failedPattern = /(Failed password|authentication failure|Invalid user|connection closed by authenticating user|access denied|status 401|status 403|401 Unauthorized|403 Forbidden)/i;
    const ipPattern = /\b(?:\d{1,3}\.){3}\d{1,3}\b/;

    let failedCount = 0;
    const ipCounts = {};
    const flaggedLines = [];

    lines.forEach(line => {
      const isFailed = failedPattern.test(line);
      const ipMatch = line.match(ipPattern);

      if (isFailed) {
        failedCount++;
        flaggedLines.push(line);

        if (ipMatch) {
          const ip = ipMatch[0];
          ipCounts[ip] = (ipCounts[ip] || 0) + 1;
        }
      }
    });

    // Sort Offending IPs by frequency
    const sortedIps = Object.entries(ipCounts)
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count);

    // Update UI Elements
    const emptyState = document.getElementById('log-empty-state');
    const resultsContainer = document.getElementById('log-analysis-results');

    if (emptyState) emptyState.style.display = 'none';
    if (resultsContainer) resultsContainer.style.display = 'block';

    // Metrics
    document.getElementById('log-stat-lines').textContent = lines.length;
    document.getElementById('log-stat-failed').textContent = failedCount;
    document.getElementById('log-stat-ips').textContent = sortedIps.length;

    // Threat level assessment
    const threatDisplay = document.getElementById('log-stat-threat');
    const threatDesc = document.getElementById('log-stat-threat-desc');
    let threatLevel = 'Normal';

    if (failedCount >= 10 || (sortedIps.length > 0 && sortedIps[0].count >= 6)) {
      threatLevel = 'Critical';
      if (threatDisplay) {
        threatDisplay.textContent = 'Critical Alert';
        threatDisplay.style.color = 'var(--status-red)';
      }
      if (threatDesc) threatDesc.textContent = 'Sustained brute-force dictionary attack detected';
    } else if (failedCount >= 3) {
      threatLevel = 'Elevated';
      if (threatDisplay) {
        threatDisplay.textContent = 'Elevated';
        threatDisplay.style.color = 'var(--status-amber)';
      }
      if (threatDesc) threatDesc.textContent = 'Multiple unauthorized authentication failures';
    } else {
      threatLevel = 'Low Risk';
      if (threatDisplay) {
        threatDisplay.textContent = 'Low Risk';
        threatDisplay.style.color = 'var(--status-green)';
      }
      if (threatDesc) threatDesc.textContent = 'Routine server activity';
    }

    // Populate Top Offending IPs Table
    const ipTableBody = document.getElementById('log-ip-table-body');
    if (ipTableBody) {
      if (sortedIps.length === 0) {
        ipTableBody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4">No suspicious external IP addresses found in log.</td></tr>`;
      } else {
        ipTableBody.innerHTML = sortedIps.map(entry => {
          const isPrivate = /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|127\.)/.test(entry.ip);
          let badge = '<span class="badge badge-warning">Medium</span>';
          let action = 'Monitor IP';
          if (isPrivate) {
            badge = '<span class="badge badge-info">Internal LAN (RFC 1918)</span>';
            action = 'Check LAN Host Configuration';
          } else if (entry.count >= 6) {
            badge = '<span class="badge badge-danger">High (Brute Force)</span>';
            action = '<strong>Block via iptables / Fail2ban</strong>';
          } else if (entry.count <= 2) {
            badge = '<span class="badge badge-info">Low</span>';
            action = 'Log entry';
          }

          return `
            <tr>
              <td class="font-mono text-amber"><strong>${entry.ip}</strong></td>
              <td><strong>${entry.count}</strong> attempts</td>
              <td>${badge}</td>
              <td>${action}</td>
            </tr>
          `;
        }).join('');
      }
    }

    // Populate Incident Summary
    const incidentCard = document.getElementById('log-incident-summary');
    if (incidentCard) {
      const topIp = sortedIps.length > 0 ? sortedIps[0].ip : 'None';
      const topCount = sortedIps.length > 0 ? sortedIps[0].count : 0;

      incidentCard.innerHTML = `
        <h4 class="mini-heading">Summary of Attack Vector:</h4>
        <p class="edu-text">
          Log analysis identified <strong>${failedCount} failed authentication attempts</strong> across <strong>${lines.length} total lines</strong>.
          The primary aggressor IP is <code class="text-amber">${topIp}</code> with <strong>${topCount} attempts</strong> targeting administrative service accounts (e.g. <code>root</code>, <code>admin</code>).
          Pattern is consistent with an automated dictionary attack scanning for weak remote credentials.
        </p>
      `;
    }

    // Render Terminal Log Output
    this.renderTerminalLines(flaggedLines.length > 0 ? flaggedLines : lines.slice(0, 30));

    // Record Audit Event
    this.recordAuditEvent({
      module: 'Log Analyzer',
      status: threatLevel,
      summary: `Parsed ${sourceFileName}: ${failedCount} failed logins from ${sortedIps.length} IPs`,
      details: `Top offending IP: ${sortedIps.length > 0 ? sortedIps[0].ip : 'None'}. Threat: ${threatLevel}.`
    });
  },

  /**
   * Renders colorized lines in the terminal box
   */
  renderTerminalLines(linesToRender) {
    const terminal = document.getElementById('log-terminal-output');
    if (!terminal) return;

    if (linesToRender.length === 0) {
      terminal.innerHTML = '<div class="terminal-line text-muted">No matching log lines to display.</div>';
      return;
    }

    terminal.innerHTML = linesToRender.map(line => {
      let isThreat = /(Failed|failure|Invalid|denied|401|403)/i.test(line);
      let formatted = line
        .replace(/(Failed password|authentication failure|Invalid user|access denied|status 401|status 403|401 Unauthorized|403 Forbidden)/gi, '<span class="terminal-alert">$1</span>')
        .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '<span class="terminal-ip">$&</span>');

      return `<div class="terminal-line ${isThreat ? 'threat' : ''}">${formatted}</div>`;
    }).join('');
  },

  /**
   * Filters the terminal lines by search query
   */
  filterTerminalLines(query) {
    if (!query) {
      this.renderTerminalLines(this.currentLogLines);
      return;
    }
    const qLower = query.toLowerCase();
    const filtered = this.currentLogLines.filter(line => line.toLowerCase().includes(qLower));
    this.renderTerminalLines(filtered);
  },

  /* ==========================================================================
     8. Reports & History Management
     ========================================================================== */
  setupReportsAndHistory() {
    const filterModule = document.getElementById('filter-module');
    const filterSearch = document.getElementById('filter-search');
    const exportCsvBtn = document.getElementById('btn-export-csv');
    const exportJsonBtn = document.getElementById('btn-export-json');
    const clearBtn = document.getElementById('btn-clear-history');

    // Modal controls
    const clearModal = document.getElementById('clear-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');
    const modalConfirmBtn = document.getElementById('modal-confirm-btn');

    if (filterModule) {
      filterModule.addEventListener('change', () => this.renderFullHistoryTable());
    }

    if (filterSearch) {
      filterSearch.addEventListener('input', () => this.renderFullHistoryTable());
    }

    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => this.exportHistoryCSV());
    }

    if (exportJsonBtn) {
      exportJsonBtn.addEventListener('click', () => this.exportHistoryJSON());
    }

    // Clear Modal Open
    if (clearBtn && clearModal) {
      clearBtn.addEventListener('click', () => {
        clearModal.style.display = 'flex';
      });
    }

    // Modal Close
    const closeModal = () => { if (clearModal) clearModal.style.display = 'none'; };
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (modalCancelBtn) modalCancelBtn.addEventListener('click', closeModal);

    // Modal Confirm Clear
    if (modalConfirmBtn) {
      modalConfirmBtn.addEventListener('click', () => {
        this.clearAllHistory();
        closeModal();
      });
    }
  },

  /**
   * Seeds demo data if storage is empty so the dashboard has demonstration data on first launch
   */
  seedDemoHistoryIfEmpty() {
    const existing = localStorage.getItem(this.STORAGE_HISTORY_KEY);
    if (!existing) {
      const demoData = [
        {
          id: 'demo-1',
          timestamp: new Date(Date.now() - 3600000 * 2).toLocaleString(),
          module: 'Password Checker',
          status: 'Weak',
          summary: 'Evaluated password: Weak (34 bits entropy)',
          details: 'Demonstration run. Length: 8 chars. Suggestion: use passphrases.',
          isDemo: true
        },
        {
          id: 'demo-2',
          timestamp: new Date(Date.now() - 3600000 * 5).toLocaleString(),
          module: 'URL Analyzer',
          status: 'High Suspicion',
          summary: 'Inspected: paypal.account-verify.xyz (High Suspicion)',
          details: 'Demonstration run. Brand subdomain deception and high-abuse .xyz TLD flagged.',
          isDemo: true
        },
        {
          id: 'demo-3',
          timestamp: new Date(Date.now() - 3600000 * 12).toLocaleString(),
          module: 'File Integrity',
          status: 'Calculated',
          summary: 'Generated SHA-256 for: Kali_Linux_2026.iso',
          details: 'Demonstration run. Checksum matched official repository baseline.',
          isDemo: true
        },
        {
          id: 'demo-4',
          timestamp: new Date(Date.now() - 3600000 * 24).toLocaleString(),
          module: 'Log Analyzer',
          status: 'Critical Alert',
          summary: 'Parsed auth.log: 12 failed logins from 198.51.100.42',
          details: 'Demonstration run. Sustained brute-force dictionary attack detected.',
          isDemo: true
        }
      ];
      localStorage.setItem(this.STORAGE_HISTORY_KEY, JSON.stringify(demoData));
    }
  },

  /**
   * Retrieves all audit events from localStorage
   */
  getAuditHistory() {
    try {
      const data = localStorage.getItem(this.STORAGE_HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed reading audit history:', e);
      return [];
    }
  },

  /**
   * Records a new audit event and updates dashboard metrics
   */
  recordAuditEvent(event) {
    const history = this.getAuditHistory();
    const newRecord = {
      id: 'audit-' + Date.now(),
      timestamp: new Date().toLocaleString(),
      module: event.module,
      status: event.status,
      summary: event.summary,
      details: event.details,
      isDemo: false
    };

    history.unshift(newRecord);

    // Keep up to 100 recent entries to avoid filling storage
    if (history.length > 100) history.pop();

    localStorage.setItem(this.STORAGE_HISTORY_KEY, JSON.stringify(history));

    // Refresh UI
    this.refreshDashboardMetrics();
    this.renderDashboardRecentTable();
    this.updateSettingsCounts();
  },

  /**
   * Renders the full history audit table on the Reports page
   */
  renderFullHistoryTable() {
    const tableBody = document.getElementById('full-history-table-body');
    const filterModule = document.getElementById('filter-module');
    const filterSearch = document.getElementById('filter-search');

    if (!tableBody) return;

    let items = this.getAuditHistory();

    const selectedMod = filterModule ? filterModule.value : 'all';
    const searchQuery = filterSearch ? filterSearch.value.trim().toLowerCase() : '';

    if (selectedMod !== 'all') {
      items = items.filter(it => it.module === selectedMod);
    }

    if (searchQuery) {
      items = items.filter(it => 
        (it.summary && it.summary.toLowerCase().includes(searchQuery)) ||
        (it.details && it.details.toLowerCase().includes(searchQuery)) ||
        (it.status && it.status.toLowerCase().includes(searchQuery))
      );
    }

    if (items.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No inspection entries match the current filter.</td></tr>`;
      return;
    }

    tableBody.innerHTML = items.map(it => {
      let badgeClass = 'badge-info';
      if (/high|critical|danger/i.test(it.status)) badgeClass = 'badge-danger';
      else if (/weak|warning|caution/i.test(it.status)) badgeClass = 'badge-warning';
      else if (/strong|passed|verified/i.test(it.status)) badgeClass = 'badge-success';

      return `
        <tr>
          <td class="font-mono">${it.timestamp}</td>
          <td>
            <strong>${it.module}</strong>
            ${it.isDemo ? '<span class="badge badge-demo ml-2">Demo</span>' : ''}
          </td>
          <td><span class="badge ${badgeClass}">${it.status}</span></td>
          <td>
            <div><strong>${it.summary}</strong></div>
            <div class="text-muted" style="font-size: 11px;">${it.details}</div>
          </td>
          <td>
            <button class="btn btn-sm btn-ghost" onclick="CyberGuard.deleteAuditEntry('${it.id}')" title="Delete record">&times; Delete</button>
          </td>
        </tr>
      `;
    }).join('');
  },

  /**
   * Deletes a single audit entry
   */
  deleteAuditEntry(id) {
    let history = this.getAuditHistory();
    history = history.filter(it => it.id !== id);
    localStorage.setItem(this.STORAGE_HISTORY_KEY, JSON.stringify(history));
    this.renderFullHistoryTable();
    this.refreshDashboardMetrics();
    this.renderDashboardRecentTable();
    this.updateSettingsCounts();
  },

  /**
   * Deletes all history
   */
  clearAllHistory() {
    localStorage.setItem(this.STORAGE_HISTORY_KEY, JSON.stringify([]));
    this.renderFullHistoryTable();
    this.refreshDashboardMetrics();
    this.renderDashboardRecentTable();
    this.updateSettingsCounts();
  },

  /**
   * Exports history as CSV file download
   */
  exportHistoryCSV() {
    const history = this.getAuditHistory();
    if (history.length === 0) {
      alert('No history entries available to export.');
      return;
    }

    let csv = 'Timestamp,Module,Verdict,Summary,Details\n';
    history.forEach(it => {
      const escape = (text) => `"${(text || '').replace(/"/g, '""')}"`;
      csv += `${escape(it.timestamp)},${escape(it.module)},${escape(it.status)},${escape(it.summary)},${escape(it.details)}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `cyberguard_audit_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Exports history as JSON file download
   */
  exportHistoryJSON() {
    const history = this.getAuditHistory();
    if (history.length === 0) {
      alert('No history entries available to export.');
      return;
    }

    const jsonStr = JSON.stringify(history, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `cyberguard_audit_report_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /* ==========================================================================
     9. Dashboard Metrics Synchronization
     ========================================================================== */
  refreshDashboardMetrics() {
    const history = this.getAuditHistory();

    const totalChecks = history.length;
    let totalFindings = 0;

    let catPassword = 0;
    let catUrl = 0;
    let catFile = 0;
    let catLog = 0;

    history.forEach(it => {
      // Count findings (weaknesses, alerts, anomalies)
      if (/weak|warning|caution|high|critical|alert|mismatch/i.test(it.status)) {
        totalFindings++;
      }

      // Count by category
      if (it.module === 'Password Checker') catPassword++;
      else if (it.module === 'URL Analyzer') catUrl++;
      else if (it.module === 'File Integrity') catFile++;
      else if (it.module === 'Log Analyzer') catLog++;
    });

    // Update Top Metric Cards
    const checksEl = document.getElementById('metric-total-checks');
    const findingsEl = document.getElementById('metric-total-findings');
    const completedEl = document.getElementById('metric-completed-analyses');

    if (checksEl) checksEl.textContent = totalChecks;
    if (findingsEl) findingsEl.textContent = totalFindings;
    if (completedEl) completedEl.textContent = totalChecks;

    // Update Category Breakdown
    const pCount = document.getElementById('cat-count-password');
    const uCount = document.getElementById('cat-count-url');
    const fCount = document.getElementById('cat-count-file');
    const lCount = document.getElementById('cat-count-log');

    if (pCount) pCount.textContent = `${catPassword} check${catPassword !== 1 ? 's' : ''}`;
    if (uCount) uCount.textContent = `${catUrl} check${catUrl !== 1 ? 's' : ''}`;
    if (fCount) fCount.textContent = `${catFile} run${catFile !== 1 ? 's' : ''}`;
    if (lCount) lCount.textContent = `${catLog} scan${catLog !== 1 ? 's' : ''}`;

    // Update Category Progress Bar Widths (proportional to total checks)
    const maxVal = Math.max(totalChecks, 1);
    const pBar = document.getElementById('cat-bar-password');
    const uBar = document.getElementById('cat-bar-url');
    const fBar = document.getElementById('cat-bar-file');
    const lBar = document.getElementById('cat-bar-log');

    if (pBar) pBar.style.width = `${Math.min(100, Math.round((catPassword / maxVal) * 100))}%`;
    if (uBar) uBar.style.width = `${Math.min(100, Math.round((catUrl / maxVal) * 100))}%`;
    if (fBar) fBar.style.width = `${Math.min(100, Math.round((catFile / maxVal) * 100))}%`;
    if (lBar) lBar.style.width = `${Math.min(100, Math.round((catLog / maxVal) * 100))}%`;
  },

  /**
   * Renders the 5 most recent activities on the Dashboard preview table
   */
  renderDashboardRecentTable() {
    const tableBody = document.getElementById('dashboard-recent-table');
    if (!tableBody) return;

    const history = this.getAuditHistory();
    const recent = history.slice(0, 5);

    if (recent.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4">No recent inspections recorded. Try running any tool!</td></tr>`;
      return;
    }

    tableBody.innerHTML = recent.map(it => {
      let badgeClass = 'badge-info';
      if (/high|critical|danger/i.test(it.status)) badgeClass = 'badge-danger';
      else if (/weak|warning|caution/i.test(it.status)) badgeClass = 'badge-warning';
      else if (/strong|passed|verified/i.test(it.status)) badgeClass = 'badge-success';

      return `
        <tr>
          <td class="font-mono">${it.timestamp.split(',')[1] || it.timestamp}</td>
          <td>
            <strong>${it.module}</strong>
            ${it.isDemo ? '<span class="badge badge-demo ml-2">Demo</span>' : ''}
          </td>
          <td><span class="badge ${badgeClass}">${it.status}</span></td>
          <td>${it.summary}</td>
        </tr>
      `;
    }).join('');
  },

  /* ==========================================================================
     10. Settings & Utilities
     ========================================================================== */
  setupSettings() {
    const wipeBtn = document.getElementById('btn-settings-wipe');
    if (wipeBtn) {
      wipeBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all workstation history and data?')) {
          this.clearAllHistory();
          alert('Workstation audit history reset successfully.');
        }
      });
    }
    this.updateSettingsCounts();
  },

  updateSettingsCounts() {
    const countDisplay = document.getElementById('setting-history-count');
    if (countDisplay) {
      const history = this.getAuditHistory();
      countDisplay.textContent = `${history.length} item${history.length !== 1 ? 's' : ''} stored`;
    }
  },

  /**
   * Formats raw bytes into readable KB/MB notation
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  CyberGuard.init();
});

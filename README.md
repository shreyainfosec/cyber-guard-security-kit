# CyberGuard Security Kit

> **A professional, zero-dependency, client-side cybersecurity workstation and SOC dashboard designed for educational demonstrations, security awareness, and college presentations.**

---

## 1. Project Objectives

- **Demystify Cybersecurity Concepts:** Provide an interactive, visual demonstration of fundamental security principles (Shannon entropy, heuristic URL analysis, cryptographic hashing, and syslog pattern recognition) for beginners and academic audiences.
- **Enterprise SOC Experience:** Emulate the interface, visual hierarchy, and analytical workflow of professional Security Operations Center (SOC) workstations without requiring complex cloud infrastructure or paid subscriptions.
- **Privacy-by-Design Architecture:** Deliver 100% client-side security tools that process sensitive inputs (passwords, files, URLs, and server logs) entirely in browser memory without transmitting a single byte over the network.
- **Explainable & Educational:** Every warning, anomaly, and calculation is paired with clear technical explanations and actionable defensive recommendations rather than vague scores or black-box verdicts.

---

## 2. Key Features & Security Toolset

### 🛡️ Dashboard (SOC Overview)
- **Real-Time Synchronized Metrics:** Tracks **Checks Performed**, **Tools Available (4)**, **Findings Identified**, and **Completed Analyses**. Counters update dynamically from actual tool usage stored locally.
- **Category Findings Distribution:** Visual progress bars displaying the distribution of alerts across Passwords, URLs, File Integrity, and Log modules.
- **Session Audit Table:** Quick overview of the 5 most recent inspections, distinguishing demonstration samples (`[Demo]`) from live user audits.
- **Transparent Local Sandbox Notice:** Explicit notification clarifying that the application runs locally and is not a live network monitoring service.

---

### 🔑 Tool 1: Password Strength & Entropy Checker
- **Shannon Entropy Calculation:** Computes mathematical information entropy in bits ($E = L \times \log_2(N)$) based on character length and character pool size.
- **Brute-Force Resistance Modeling:** Realistic offline cracking time estimation assuming a modern GPU cluster ($10^{10}$ guesses/second).
- **Heuristic Pattern & Dictionary Detection:** Flags common passwords (`password`, `123456`, `admin`), keyboard walks (`qwerty`), and sequential patterns (`123`, `abc`).
- **NIST SP 800-63B Compliance:** Visual checklist assessing length, character variety (uppercase, lowercase, numbers, symbols), and dictionary resistance.
- **Show/Hide Password Control:** Smooth visibility toggle with SVG eye icon.
- **Strict Privacy Guarantee:** Input is evaluated strictly in browser RAM. Passwords are **never** saved, logged to localStorage, or transmitted.
- **Preserved Honesty:** Explicitly reminds students that high entropy alone cannot protect against phishing, social engineering, or malware keyloggers.

---

### 🌐 Tool 2: Suspicious URL & Phishing Heuristic Analyzer
- **Local Text Parsing:** Uses the browser's native `URL` API to deconstruct addresses without ever pinging or visiting remote servers (safe client-side sandbox).
- **Visual Anatomy Breakdown:** Color-coded structural segmentation into Scheme/Protocol, Subdomain, Registered Domain, TLD, Path, and Port.
- **9 Enterprise SOC Heuristic Checks:**
  1. *Insecure Protocol (HTTP vs. HTTPS)*
  2. *Raw IP Address as Hostname* (e.g. `http://192.168.1.105:8080`)
  3. *Excessive Subdomain Depth* (subdomain stacking to deceive mobile address bars)
  4. *Deceptive Brand Subdomain Spoofing* (e.g. `paypal.com.account-update.xyz`)
  5. *High-Abuse Top-Level Domains* (`.xyz`, `.top`, `.tk`, `.zip`, `.mov`, etc.)
  6. *Embedded User Credentials / @ Sign Trick* (e.g. `https://google.com@evil-site.com`)
  7. *Non-Standard Web Ports* (ports other than standard 80/443)
  8. *Authentication Lures in URL Path* (`/login`, `/signin`, `/verify`)
  9. *Punycode / Homograph Character Spoofing & Excessive Hyphens* (`xn--` prefixes, Unicode homoglyphs, and multiple hyphen chains)
- **Heuristic Disclaimer:** Prominently explains that heuristic checks evaluate patterns and cannot guarantee whether a destination server is safe or malicious.

---

### 📁 Tool 3: Cryptographic File Integrity (SHA-256)
- **Native Web Crypto API:** Generates cryptographic SHA-256 checksums client-side using `crypto.subtle.digest('SHA-256', buffer)`.
- **Zero-Upload Processing:** Files are read into client memory via HTML5 `FileReader`; zero bytes leave your computer.
- **File Metadata Extraction:** Displays file name, formatted size (Bytes, KB, MB), MIME type, and last modified timestamp.
- **One-Click Copy:** Fast clipboard copying with instant visual feedback.
- **Interactive Checksum Comparator:** Paste an expected hash from a software vendor to receive an instant, color-coded **MATCH (Authentic & Untampered)** or **MISMATCH (Altered or Corrupted)** alert.
- **Instant Demo Test:** Built-in "Create & Hash Virtual Text File" button allowing instant demonstration without needing to look for external files.

---

### 📜 Tool 4: Server Authentication Log Analyzer
- **Multi-Vector Regex Parser:** Scans Linux syslog, `auth.log`, and web server logs for failed passwords, authentication failures, invalid users, pam_unix rejections, and HTTP 401/403 errors.
- **Brute-Force & Botnet Detection:** Aggregates and sorts offending IP addresses by failure volume, categorizing threats into Low, Medium, High (Brute Force), and Internal LAN (RFC 1918).
- **Incident Summary & Mitigation:** Provides tailored SOC recommendations (e.g. deploying Fail2ban, disabling SSH root password logins, enforcing Ed25519 keys).
- **Syntax-Highlighted Terminal Viewer:** Terminal interface featuring red alert tags on security triggers and amber highlights on source IP addresses.
- **Interactive Line Filtering:** Real-time search filter to query flagged lines by IP or keyword.
- **Pre-Packaged Demo & Sample File:** Includes one-click demo data as well as an included `sample_auth.log` file in the project folder for local file selection.

---

### 📊 Reports, History & Data Export
- **Local Session Audit Log:** Stores non-sensitive metadata (timestamp, tool name, verdict, summary, details) in `localStorage`.
- **Module & Search Filters:** Filter session history by security tool or keyword.
- **Export to CSV:** Standard RFC 4180 CSV export for spreadsheets.
- **Export to JSON:** Formatted JSON export for programmatic analysis.
- **Clear History with Modal Confirmation:** Custom non-destructive confirmation modal to reset local history.

---

### 📚 Learn Security (Educational Knowledge Base)
Beginner-friendly explanations of core cybersecurity concepts:
1. **The CIA Triad** (Confidentiality, Integrity, Availability)
2. **Hashing vs. Encryption vs. Encoding** (Comprehensive comparison table)
3. **Anatomy of a Phishing URL** (Visual breakdown of attacker domain deception)
4. **Defense in Depth** (Perimeter, Network, Host, Application, Data layers)
5. **Password Entropy & Brute-Force Mathematics** ($H = L \times \log_2(N)$ and the passphrase advantage)

---

### ⚙️ Settings & Customization
- **Theme Switcher:** Toggle between **Midnight Navy (SOC Dark)** and **Enterprise Light** mode. Preference persists in `localStorage`.
- **Local Storage Management:** Inspect stored audit item count and wipe data safely.
- **Privacy Architecture Audit:** Detailed breakdown of browser sandbox boundaries.

---

## 3. Technology Stack

- **HTML5:** Semantic markup, accessible elements, inline SVGs for crisp scaling.
- **CSS3:** Native CSS Custom Properties (CSS variables), CSS Grid, Flexbox, clean dark slate palette, fully responsive across desktop, tablet, and mobile browsers.
- **JavaScript (ES6):** Pure Vanilla JavaScript. Zero external frameworks (No React, Vue, Angular, jQuery, Bootstrap, or NPM packages).
- **Browser Web APIs:**
  - `crypto.subtle.digest` (Native Cryptography API for SHA-256)
  - `FileReader` & `Blob` (Local file stream reading)
  - `URL` (RFC-compliant URL parsing)
  - `localStorage` (Offline client persistence)
  - `navigator.clipboard` (Asynchronous clipboard API)

---

## 4. Realistic Security Limitations

To maintain academic rigor and honesty during presentations, keep these limitations in mind:
1. **Client-Side Sandbox:** The tool cannot inspect live network packets, ARP tables, or remote DNS records because web browsers intentionally block raw socket connections.
2. **Heuristics vs. Real-Time Threat Feeds:** The URL analyzer evaluates structural patterns (IP hosts, subdomains, TLDs). It cannot query live threat intelligence APIs (e.g. VirusTotal) without API keys and backend proxies.
3. **Entropy vs. Real-World Compromise:** A high-entropy password can still be stolen through phishing, social engineering, credential reuse across other services, or keylogger malware.
4. **Hashes Confirm Integrity, Not Safety:** A SHA-256 hash confirms a file has not been altered since publication, but if the original publisher file itself was malware, the hash will still verify successfully.

---

## 5. How to Run the Project Locally

No Node.js, Python, server setup, database installation, or internet connection is required.

### Option A: Direct Browser Launch (Recommended)
1. Navigate to the project folder:
   ```
   c:\Users\Shreya\Desktop\cyber guard security kit
   ```
2. Double-click **`index.html`** or right-click and select **Open with** &rarr; **Microsoft Edge**, **Google Chrome**, or **Mozilla Firefox**.
3. The dashboard will launch immediately.

### Option B: Local HTTP Server (Optional)
If you wish to serve it over a local port:
- **Using Python 3 (if installed):**
  ```bash
  python -m http.server 8000
  ```
  Open `http://localhost:8000` in your browser.
- **Using VS Code Live Server:**
  Right-click `index.html` and click **Open with Live Server**.

---

## 6. Project Structure

```
cyber guard security kit/
│
├── index.html          # Main application shell with all 8 views and modals
├── style.css           # Enterprise SOC stylesheet with dark/light themes & responsive layout
├── script.js           # Vanilla ES6 logic for all 4 tools, storage, and export
├── sample_auth.log     # Realistic Linux SSH authentication log for local testing
└── README.md           # Documentation, objectives, technical guide & presentation script
```

---

## 8. License & Attribution

- **Project:** CyberGuard Security Kit  
- **Author:** Kumari Shreya  
- **License:** MIT License — Open for academic and educational use.

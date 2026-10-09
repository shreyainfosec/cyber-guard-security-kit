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

## 7. College Presentation Script

Use this script during your presentation or project defense. It is organized into 5 concise parts:

### Part 1: Introduction (1 Minute)
> *"Good morning/afternoon, professors and fellow students. Today, I am presenting **CyberGuard Security Kit**, a client-side Security Operations Center workstation and cybersecurity analysis toolkit.*  
> *In cybersecurity, beginners often find security concepts abstract. My goal was to build a clean, professional, enterprise-grade dashboard using pure HTML, CSS, and JavaScript that demonstrates four foundational pillars of defensive security: credential entropy, URL phishing heuristics, cryptographic file integrity, and authentication log monitoring—all running 100% locally in the browser with zero external dependencies."*

### Part 2: Architecture & Privacy Model (1 Minute)
> *"From an architectural standpoint, CyberGuard is built with privacy-by-design. Because this is a security tool, user privacy is paramount:  
> 1. Passwords tested in the Password Checker are evaluated purely in memory and are **never** stored, logged, or transmitted.  
> 2. File hashing is performed directly in client RAM using the browser's native Web Crypto API (`crypto.subtle.digest`), meaning files are never uploaded to any third-party server.  
> 3. URLs are parsed safely as strings without sending network requests to potentially malicious destinations.  
> 4. Non-sensitive audit metadata is persisted locally using browser `localStorage`."*

### Part 3: Live Tool Walkthrough & Demonstration (2 to 3 Minutes)

#### Step 1: Dashboard
> *"Starting on the **Dashboard**, we see real-time metrics for Checks Performed, Available Tools, Findings Identified, and Completed Analyses. Below is our visual findings distribution and recent activity log. Note that demonstration data is clearly badged, and these metrics update in real-time as we interact with the tools."*

#### Step 2: Password Checker
> *(Navigate to Password Checker)*  
> *"In the **Password Checker**, I will test a common password like `P@ssw0rd2024`. Notice that even though it contains uppercase letters, numbers, and symbols, the system flags a dictionary weakness and calculates low entropy.  
> Now let's try a 4-word passphrase: `correct-horse-battery-staple-2026!`. The entropy immediately rises to over 90 bits, pushing the crack time from seconds into centuries. This illustrates Shannon's entropy formula, showing why character length provides exponentially greater brute-force resistance than short, complex strings."*

#### Step 3: URL Analyzer
> *(Navigate to URL Analyzer)*  
> *"Next is the **URL Analyzer**. Threat actors frequently use deceptive subdomains to trick victims. Let's analyze `http://paypal.com.account-update.xyz/login`.  
> The analyzer parses the address and highlights 4 critical warnings: insecure HTTP transport, deceptive brand keyword inside a subdomain, a high-abuse `.xyz` TLD, and an authentication lure in the path. Most importantly, it visually breaks down the URL anatomy so users can see that `xyz` is the real destination domain, not PayPal."*

#### Step 4: File Integrity
> *(Navigate to File Integrity)*  
> *"In **File Integrity**, we calculate a digital fingerprint using SHA-256. I'll click 'Create & Hash Virtual Text File'. The browser instantly computes the 64-character hexadecimal hash.  
> If we paste this hash into the verification box, we get a green **MATCH**. If even a single bit of that file were altered, the cryptographic avalanche effect would completely change the hash, instantly revealing tampering."*

#### Step 5: Log Analyzer
> *(Navigate to Log Analyzer)*  
> *"Finally, in the **Log Analyzer**, I will load our sample Linux authentication log—or select our included `sample_auth.log` file.  
> The regex engine processes each entry, detecting 13 failed login attempts. It identifies that IP address `198.51.100.42` is executing a sustained SSH dictionary attack against administrative accounts like `root` and `admin`, and recommends automated countermeasures such as Fail2ban and disabling root password logins."*

### Part 4: Reports, Education & Settings (1 Minute)
> *"All checks performed during our demo are compiled in **Reports & History**, where they can be filtered, searched, and exported to CSV or JSON for compliance records.  
> We also have a **Learn Security** section detailing the CIA Triad, Hashing vs Encryption, and Defense-in-Depth, as well as a full **Dark/Light Theme** switch."*

### Part 5: Conclusion & Q&A Preparation (30 Seconds)
> *"In conclusion, CyberGuard Security Kit demonstrates that effective, educational cybersecurity tools can be engineered with simple, standard web technologies without external bloat or cloud dependencies.  
> Thank you, and I look forward to your questions."*

---

### 💡 Frequently Asked Questions (Professors' Likely Questions)

1. **Q: Why did you build this with Vanilla JavaScript instead of React or Node.js?**  
   *A:* "To maintain maximum accessibility, educational clarity, and zero attack surface. By eliminating dependencies and npm packages, this application has no external vulnerabilities, requires zero installation, and can be inspected and run on any browser on any machine."

2. **Q: How does your password crack time estimation work?**  
   *A:* "It calculates Shannon information entropy $E = L \times \log_2(N)$ based on character pool size and length, minus penalties for dictionary words. The crack time assumes an offline attacker using high-end GPU clusters capable of $10^{10}$ (10 billion) hash evaluations per second."

3. **Q: Why can't the URL analyzer confirm 100% if a site is phishing?**  
   *A:* "Because modern phishing attackers can purchase legitimate domain names and obtain valid SSL certificates. Heuristics identify deceptive patterns and anomalies, but confirmation requires live threat intelligence blocklists or dynamic sandbox detonation."

4. **Q: How does the Web Crypto API differ from an external hashing library?**  
   *A:* "Web Crypto API (`window.crypto.subtle`) is a native C++ implementation built directly into modern browser engines. It is RFC-compliant, hardware-accelerated, significantly faster than pure JavaScript hashing libraries, and introduces zero third-party supply-chain risks."

---

## 8. License & Attribution

- **Project:** CyberGuard Security Kit  
- **Author:** Shreya  
- **License:** MIT License — Open for academic and educational use.

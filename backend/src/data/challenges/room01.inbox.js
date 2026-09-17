import { TOPICS } from '../../utils/constants.js';

/**
 * Authoritative Challenge Bank for ROOM 01: THE INBOX (Phishing Defense).
 * Contains 1 Beginner, 3 Intermediate, and 10 Expert challenges.
 * Private validation fields (correctActionId, privateIndicators, explanation) are server-authoritative.
 */
export const ROOM_01_CHALLENGES = [
  // ==========================================
  // BEGINNER (1 Challenge)
  // ==========================================
  {
    challengeId: 'ch-phish-01',
    roomId: 'room-01-inbox',
    topic: TOPICS.PHISHING,
    difficulty: 'beginner',
    scenarioType: 'malicious',
    prompt: 'Inspect the newly arrived IT security advisory before choosing how to respond.',
    narrative: 'A priority communication from "IT Security" requires immediate attention. Inspect evidence before deciding.',
    sanitizedEvidence: {
      type: 'email',
      sender: 'IT Support Center <support@micr0soft-update.com>',
      replyTo: 'inbox-collector@shadow-c2.net',
      subject: 'URGENT: Required Credential Resynchronization',
      receivedTime: '2026-09-10T11:45:00Z',
      body: 'Security breach detected. Click the emergency link below to verify your facility workstation immediately.',
      linkTarget: 'http://185.220.101.4/login.php',
      linkDisplayText: 'https://security.microsoft.com/sync-session',
      headers: {
        spf: 'FAIL',
        dkim: 'NONE',
        dmarc: 'FAIL',
        returnPath: 'inbox-collector@shadow-c2.net',
      },
      domainInspectionNotes: 'Domain identified: micr0soft-update.com. Notice the numeral 0 substituting the letter "o" (Typosquatted domain).',
      replyToNotes: 'Return-path routes responses to shadow-c2.net, diverging completely from legitimate Microsoft infrastructure.',
      linkInspectionNotes: 'Anchor text displays security.microsoft.com, but resolved destination routes to unencrypted foreign IP 185.220.101.4.',
      headerInspectionNotes: 'Originating IP was unauthorized. SPF and DMARC checks both reported HARD FAIL.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['header_return_path', 'url_inspect', 'spf_check'],
    allowedActions: [
      { actionId: 'ACTION_QUARANTINE', label: 'Quarantine & Report to SOC', variant: 'primary' },
      { actionId: 'ACTION_CLICK_LINK', label: 'Click Link to Sync Session', variant: 'danger' },
      { actionId: 'ACTION_IGNORE', label: 'Ignore Transmission', variant: 'ghost' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_QUARANTINE',
    privateIndicators: [
      'typosquatted_domain: numeral 0 in micr0soft-update.com',
      'mismatched_href: anchor displays microsoft.com but targets 185.220.101.4',
      'spf_dmarc_fail: domain failed sender policy framework check',
    ],
    scoringMetadata: {
      basePoints: 500,
      targetTimeSeconds: 35,
    },
    consequenceData: {
      onCorrect: 'Threat neutralized. Transmission quarantined and domain flagged across boundary firewalls.',
      onIncorrect: 'Malicious link accessed! Phishing payload triggered alarm klaxons and credential leakage.',
    },
    fivePartExplanation: {
      whatHappened: 'You clicked the simulated password reset link inside an unverified, spoofed message.',
      evidence: 'Sender domain was "micr0soft-update.com" (numeral 0) and the hyperlink targeted raw foreign IP 185.220.101.4.',
      whyDangerous: 'Credential harvesters record your workstation credentials, enabling lateral movement across subnets.',
      correctAction: 'Quarantine the email and submit a high-priority incident alert to the SOC.',
      securityTip: 'Always inspect the true destination URL before clicking and navigate to security portals via known bookmarks.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Inspect the sender domain name closely—observe whether any letters have been replaced with numbers.',
      'Check the raw SPF headers and hover over the hyperlink to compare the display text with the actual destination URL.',
    ],
  },

  // ==========================================
  // INTERMEDIATE (3 Challenges)
  // ==========================================
  {
    challengeId: 'ch-phish-int-01',
    roomId: 'room-01-inbox',
    topic: TOPICS.PHISHING,
    difficulty: 'intermediate',
    scenarioType: 'legitimate',
    prompt: 'Evaluate this mandatory corporate compliance training notice and choose the safest response.',
    narrative: 'An urgent reminder arrives from the Enterprise Information Security Office regarding the annual cybersecurity compliance deadline.',
    sanitizedEvidence: {
      type: 'email',
      sender: 'Enterprise Security Office <security-compliance@facility.internal>',
      replyTo: 'security-compliance@facility.internal',
      subject: 'ACTION REQUIRED: Annual Cybersecurity & Privacy Refresher Due in 48 Hours',
      receivedTime: '2026-09-12T08:15:00Z',
      body: 'All facility staff must complete the 2026 Cyber Compliance Module prior to Friday close of business. Access your assigned module on the authenticated staff portal.',
      linkTarget: 'https://intranet.facility.internal/compliance/training-2026',
      linkDisplayText: 'https://intranet.facility.internal/compliance/training-2026',
      headers: {
        spf: 'PASS',
        dkim: 'PASS',
        dmarc: 'PASS',
        returnPath: 'security-compliance@facility.internal',
      },
      domainInspectionNotes: 'Domain facility.internal is the legitimate corporate internal TLD. SPF, DKIM, and DMARC cryptographic signatures are fully verified.',
      replyToNotes: 'Reply-To matches the authorized internal compliance security distribution group.',
      linkInspectionNotes: 'Anchor text and destination target match identically: routes to official intranet.facility.internal via HTTPS with corporate internal CA certificate.',
      headerInspectionNotes: 'Originated directly from internal exchange relay (10.20.4.12). Zero external hops detected.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['header_return_path', 'url_inspect', 'spf_check'],
    allowedActions: [
      { actionId: 'ACTION_PROCEED_SSO_PORTAL', label: 'Proceed to Intranet Portal & Complete Training', variant: 'primary' },
      { actionId: 'ACTION_QUARANTINE_AS_PHISHING', label: 'Quarantine Email & Report to SOC as Urgent Phish', variant: 'danger' },
      { actionId: 'ACTION_DELETE_SPAM', label: 'Delete Notification Without Completing Training', variant: 'ghost' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_PROCEED_SSO_PORTAL',
    privateIndicators: [
      'valid_internal_spf_dkim: fully authenticated internal relay headers',
      'exact_url_match: anchor text and HTTPS destination identical to internal portal',
      'expected_compliance_timeline: scheduled annual compliance cycle',
    ],
    scoringMetadata: {
      basePoints: 600,
      targetTimeSeconds: 40,
    },
    consequenceData: {
      onCorrect: 'Authentic notification verified. Cryptographic headers, internal domain alignment, and matching intranet targets confirmed the advisory was 100% genuine.',
      onIncorrect: 'False positive disruption! Reporting legitimate compliance notices created false alarm overhead in the SOC and risked regulatory non-compliance.',
    },
    fivePartExplanation: {
      whatHappened: 'You flagged an authentic, verified internal corporate training notification as phishing (false positive).',
      evidence: 'The sender domain facility.internal matched official infrastructure, SPF/DKIM/DMARC passed with internal relays, and destination URLs matched official intranet links.',
      whyDangerous: 'Reflexively rejecting authentic internal notices halts compliance operations, creates alert fatigue for the SOC, and delays mandatory security training.',
      correctAction: 'Verify that headers, domains, and links resolve strictly to authenticated corporate systems, then proceed through the legitimate workflow.',
      securityTip: 'Urgency alone does not make an email phishing. Always corroborate urgency with technical indicators like SPF/DKIM signatures and domain origins.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Inspect the SPF, DKIM, and DMARC headers: Notice how all three indicate a clean PASS from internal corporate mail relays.',
      'Check the destination URL compared to the display text—do they both point to the genuine internal intranet?',
    ],
  },

  {
    challengeId: 'ch-phish-int-02',
    roomId: 'room-01-inbox',
    topic: TOPICS.PHISHING,
    difficulty: 'intermediate',
    scenarioType: 'malicious',
    prompt: 'Investigate the cloud document notification and authorize or neutralize the request.',
    narrative: 'A shared document alert from "SharePoint Corporate" claims board minutes are ready for your review.',
    sanitizedEvidence: {
      type: 'email',
      sender: 'SharePoint Online <no-reply@sharepoint-cloud-share.net>',
      replyTo: 'app-admin@azure-oauth-token-collector.com',
      subject: 'Shared Document: "Confidential_Executive_Compensation_2026.pdf"',
      receivedTime: '2026-09-12T09:14:22Z',
      body: 'Chief Strategy Officer shared a protected SharePoint workbook with your account. Access requires accepting third-party enterprise app consent permissions: "Mail.ReadWrite", "Offline_Access", and "Contacts.Read".',
      linkTarget: 'https://login.microsoftonline.com.oauth-consent-gateway.net/authorize?scope=Mail.ReadWrite',
      linkDisplayText: 'https://facility-my.sharepoint.com/:x:/g/personal/cso_executive_comp',
      headers: {
        spf: 'PASS',
        dkim: 'FAIL',
        dmarc: 'FAIL',
        returnPath: 'app-admin@azure-oauth-token-collector.com',
      },
      domainInspectionNotes: 'Domain sharepoint-cloud-share.net is an external spoof; legitimate SharePoint notifications arrive from no-reply@sharepointonline.com.',
      replyToNotes: 'Return-path targets an unverified token collector domain.',
      linkInspectionNotes: 'Destination points to oauth-consent-gateway.net attempting illicit OAuth consent grant attacks (Illicit Consent Grant Phishing).',
      headerInspectionNotes: 'DKIM and DMARC failed, indicating spoofed cryptographic authentication.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['header_return_path', 'url_inspect', 'spf_check'],
    allowedActions: [
      { actionId: 'ACTION_BLOCK_OAUTH_CONSENT', label: 'Revoke Application Consent & Quarantine Transmission', variant: 'primary' },
      { actionId: 'ACTION_GRANT_APP_PERMISSIONS', label: 'Accept Enterprise App Permissions to View Shared PDF', variant: 'danger' },
      { actionId: 'ACTION_PREVIEW_IN_BROWSER', label: 'Attempt In-Browser Document Preview Without Logging In', variant: 'warning' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_BLOCK_OAUTH_CONSENT',
    privateIndicators: [
      'illicit_consent_grant: application requesting Mail.ReadWrite and Offline_Access',
      'domain_spoof: sharepoint-cloud-share.net',
      'dkim_dmarc_fail: invalid signature',
    ],
    scoringMetadata: {
      basePoints: 600,
      targetTimeSeconds: 40,
    },
    consequenceData: {
      onCorrect: 'OAuth consent phishing thwarted. Rogue app authorization blocked before token theft could occur.',
      onIncorrect: 'Rogue application authorized! Attackers granted persistent API access to read and exfiltrate all tenant emails.',
    },
    fivePartExplanation: {
      whatHappened: 'An attacker deployed an illicit OAuth consent phishing attack disguised as a SharePoint shared document.',
      evidence: 'The link requested broad permissions (Mail.ReadWrite, Offline_Access) on an unauthorized lookalike domain.',
      whyDangerous: 'OAuth consent grants do not require passwords; once granted, attackers maintain API access even if passwords change.',
      correctAction: 'Reject unverified enterprise application permission prompts and report illicit app registrations to the SOC.',
      securityTip: 'Restrict end-user OAuth app consent in Microsoft Entra / Google Workspace to administrator-approved apps only.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Notice the excessive permissions requested: Does viewing a PDF require giving an app full access to read and write your email?',
      'Check the actual destination URL host: notice oauth-consent-gateway.net at the end of the domain structure.',
    ],
  },

  {
    challengeId: 'ch-phish-int-03',
    roomId: 'room-01-inbox',
    topic: TOPICS.PHISHING,
    difficulty: 'intermediate',
    scenarioType: 'ambiguous',
    prompt: 'Evaluate the vendor invoice modification request and determine the safest course of action.',
    narrative: 'Apex Logistics has emailed an updated banking remittance slip for an overdue shipment. Analyze the transmission.',
    sanitizedEvidence: {
      type: 'email',
      sender: 'Apex Logistics Billing <billing@apex-loglstics.com>',
      replyTo: 'collections-apex@secure-remit-portal.com',
      subject: 'INVOICE #90422: Urgent Banking Details Update Prior to Release',
      receivedTime: '2026-09-12T08:30:00Z',
      body: 'Attention Accounts Payable: Our primary treasury clearing account is undergoing scheduled audit reconciliation. Please remit all pending payments for Invoice #90422 to our secondary offshore clearing IBAN provided in the portal.',
      linkTarget: 'https://secure-remit-portal.com/apex/wire-auth.html',
      linkDisplayText: 'https://apex-logistics.com/billing/invoices/90422',
      headers: {
        spf: 'PASS',
        dkim: 'PASS',
        dmarc: 'NONE',
        returnPath: 'collections-apex@secure-remit-portal.com',
      },
      domainInspectionNotes: 'Notice the lookalike sender domain: "apex-loglstics.com" (letter "i" substituted with "l"). SPF passed because attackers registered the typo domain.',
      replyToNotes: 'Reply-To points to an external drop domain "secure-remit-portal.com" unaffiliated with the genuine vendor.',
      linkInspectionNotes: 'Display link claims official apex-logistics.com, but destination resolves to an attacker-controlled wire update phishing page.',
      headerInspectionNotes: 'DMARC is not configured on this lookalike domain, allowing unauthenticated return-path routing.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['header_return_path', 'url_inspect', 'spf_check'],
    allowedActions: [
      { actionId: 'ACTION_VERIFY_OOB_VENDOR', label: 'Hold Wire & Voice-Verify via Known Vendor Contract Phone', variant: 'primary' },
      { actionId: 'ACTION_PAY_UPDATED_IBAN', label: 'Approve Wire Transfer to Updated IBAN to Prevent Delivery Delay', variant: 'danger' },
      { actionId: 'ACTION_FORWARD_TO_PROCUREMENT', label: 'Forward Remittance Instructions to Procurement Department', variant: 'warning' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_VERIFY_OOB_VENDOR',
    privateIndicators: [
      'typosquatting: apex-loglstics.com with l replacing i',
      'wire_diversion: urgency requesting bank account change',
      'reply_to_mismatch: returns to secure-remit-portal.com',
    ],
    scoringMetadata: {
      basePoints: 600,
      targetTimeSeconds: 40,
    },
    consequenceData: {
      onCorrect: 'Financial diversion prevented. Known vendor verified over phone that no banking changes were made.',
      onIncorrect: 'Unauthorized wire approved! Facility corporate treasury lost $184,000 to an offshore money mule account.',
    },
    fivePartExplanation: {
      whatHappened: 'An attacker impersonated a known vendor using a typosquatted domain to redirect wire payments.',
      evidence: 'Sender domain was "apex-loglstics.com" with an "l" instead of an "i", diverting wire details to an unverified portal.',
      whyDangerous: 'Business Email Compromise (BEC) wire fraud causes catastrophic financial losses that are rarely recoverable.',
      correctAction: 'Never alter vendor payment account details without secondary voice verification via a pre-established contract phone number.',
      securityTip: 'Always maintain strict dual-custody verification protocols for any modifications to supplier banking records.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Compare the spelling of the sender domain "apex-loglstics" with the legitimate company name "Apex Logistics".',
      'Financial directives involving bank modifications must never be trusted without out-of-band verification.',
    ],
  },

  // ==========================================
  // EXPERT (10 Challenges)
  // ==========================================
  {
    challengeId: 'ch-phish-exp-01',
    roomId: 'room-01-inbox',
    topic: TOPICS.PHISHING,
    difficulty: 'expert',
    scenarioType: 'ambiguous',
    prompt: 'Investigate this Vendor Email Compromise (VEC) involving an established defense contractor.',
    narrative: 'An email arrives from the genuine email address of your primary industrial valve contractor, participating in an active ongoing thread.',
    sanitizedEvidence: {
      type: 'email',
      sender: 'Director Sarah Lin <s.lin@titan-heavy-valves.com>',
      replyTo: 's.lin@titan-heavy-valves.com',
      subject: 'Re: Sector 03 Pneumatic Valve Batch #401 Delivery & Wire Remittance',
      receivedTime: '2026-09-13T14:12:00Z',
      body: 'Hi Team, following up on our call yesterday regarding the Sector 03 valves. Please see the attached signed manifest. Note that our parent entity has transitioned our primary receiving account to Deutsche Commercial Bank. Please route today\'s $420,000 milestone invoice to the updated clearing coordinates attached.',
      linkTarget: 'https://files.titan-heavy-valves.com.s3-eu-west-1.file-vault-secure.co/remittance_v4.pdf',
      linkDisplayText: 'https://titan-heavy-valves.com/orders/batch401/remittance.pdf',
      headers: {
        spf: 'PASS',
        dkim: 'PASS',
        dmarc: 'PASS',
        returnPath: 's.lin@titan-heavy-valves.com',
      },
      domainInspectionNotes: 'Sender domain titan-heavy-valves.com is 100% authentic and has an established 5-year history. Cryptographic DKIM matches genuine contractor keys.',
      replyToNotes: 'Reply-To matches the sender address. The mailbox itself has been compromised via session token theft.',
      linkInspectionNotes: 'Destination URL routes through an Amazon S3 lookalike domain (file-vault-secure.co) hosting fraudulent bank remittance instructions.',
      headerInspectionNotes: 'Originating IP correlates with a VPN exit node in Stockholm, Sweden, whereas Titan Heavy Valves operations are based in Chicago, IL.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['header_return_path', 'url_inspect', 'spf_check'],
    allowedActions: [
      { actionId: 'ACTION_VEC_CALLBACK_AND_QUARANTINE', label: 'Quarantine Email, Freeze Wire, and Voice-Verify via Master Contract Phone', variant: 'primary' },
      { actionId: 'ACTION_PROCESS_WIRE_VERIFIED_DKIM', label: 'Release Payment Because Cryptographic SPF/DKIM/DMARC Signatures Are Valid', variant: 'danger' },
      { actionId: 'ACTION_REPLY_CONFIRM_BANK', label: 'Reply Directly to Sarah Lin Asking Her to Confirm the New Account Number in Email', variant: 'warning' },
      { actionId: 'ACTION_FORWARD_TO_ACCOUNTS', label: 'Forward to Accounts Payable with Note Noting Updated European Account', variant: 'ghost' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_VEC_CALLBACK_AND_QUARANTINE',
    privateIndicators: [
      'vendor_email_compromise: legitimate mailbox taken over by attacker',
      'geo_anomaly: sender IP in Sweden vs Chicago company origin',
      'malicious_s3_lookalike: file-vault-secure.co destination',
    ],
    scoringMetadata: {
      basePoints: 750,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'Multi-hundred thousand dollar VEC wire heist intercepted! Supplier confirmed their executive mailbox was breached.',
      onIncorrect: '$420,000 transferred to attacker-controlled German clearing account! Funds laundered through crypto exchanges.',
    },
    fivePartExplanation: {
      whatHappened: 'A threat actor executed Vendor Email Compromise (VEC) by compromising a real supplier mailbox and hijacking an ongoing conversation.',
      evidence: 'While SPF and DKIM passed completely, the invoice link led to an external S3-mimicking bucket and requested divergent banking details.',
      whyDangerous: 'VEC attacks bypass standard cryptographic email filters because the email genuinely originates from the victim organization\'s account.',
      correctAction: 'Always enforce secondary out-of-band voice verification using pre-established contract numbers whenever banking details change.',
      securityTip: 'Never reply to the email to confirm changes—the attacker controls the mailbox and will gladly confirm their own fraudulent request.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Look at the destination URL: Does file-vault-secure.co belong to Amazon AWS or Titan Heavy Valves?',
      'If an attacker controls the legitimate email account, what happens if you reply to the email to verify?',
    ],
  },

  {
    challengeId: 'ch-phish-exp-02',
    roomId: 'room-01-inbox',
    topic: TOPICS.PHISHING,
    difficulty: 'expert',
    scenarioType: 'malicious',
    prompt: 'Analyze this targeted Adversary-in-the-Middle (AiTM) reverse-proxy phishing transmission.',
    narrative: 'An urgent prompt from Microsoft Security Operations Center requests immediate verification of your hardware session token.',
    sanitizedEvidence: {
      type: 'email',
      sender: 'Microsoft Entra Security <alert@microsoft.security-notifications.net>',
      replyTo: 'mfa-proxy@evil-proxy-node.tech',
      subject: 'Security Alert: Anomalous Token Renewal Detected on Workstation #08',
      receivedTime: '2026-09-13T14:45:00Z',
      body: 'Your workstation token requires cryptographic re-attestation. Click below to confirm your multi-factor credentials and preserve system clearance.',
      linkTarget: 'https://login.microsoftonline.com.evil-proxy-node.tech/common/oauth2/authorize',
      linkDisplayText: 'https://login.microsoftonline.com/common/oauth2/authorize',
      headers: {
        spf: 'FAIL',
        dkim: 'NONE',
        dmarc: 'FAIL',
        returnPath: 'mfa-proxy@evil-proxy-node.tech',
      },
      domainInspectionNotes: 'Look at the domain structure: "login.microsoftonline.com.evil-proxy-node.tech". The actual root domain is evil-proxy-node.tech acting as an Evilginx reverse proxy.',
      replyToNotes: 'Return-path targets an active credential proxy terminal.',
      linkInspectionNotes: 'AiTM reverse proxy will proxy legitimate Microsoft login screens while intercepting session cookies (ESTSAuth) in transit.',
      headerInspectionNotes: 'SPF/DMARC hard fail against genuine Microsoft SPF records.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['header_return_path', 'url_inspect', 'spf_check'],
    allowedActions: [
      { actionId: 'ACTION_BLOCK_AITM_PROXY', label: 'Quarantine Email, Block Proxy Domain on Perimeter, and Invalidate Workstation Sessions', variant: 'primary' },
      { actionId: 'ACTION_ENTER_MFA_CODE', label: 'Complete Authentication Prompt Because Authenticator App Protects Against Phishing', variant: 'danger' },
      { actionId: 'ACTION_CHANGE_PASSWORD_ONLY', label: 'Change Account Password Immediately via Workstation Settings', variant: 'warning' },
      { actionId: 'ACTION_DISMISS_NOTIFICATION', label: 'Dismiss Alert as False Positive', variant: 'ghost' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_BLOCK_AITM_PROXY',
    privateIndicators: [
      'aitm_reverse_proxy: Evilginx proxying login.microsoftonline.com on evil-proxy-node.tech',
      'session_hijacking_risk: steals post-auth ESTSAUTH session cookies',
      'subdomain_chain_trick: login.microsoftonline.com is a subdomain of evil-proxy-node.tech',
    ],
    scoringMetadata: {
      basePoints: 750,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'AiTM reverse proxy neutralized. Perimeter edge blocked the proxy node and authenticated sessions remained secure.',
      onIncorrect: 'Session hijacked! Reverse proxy intercepted authenticated session cookie, bypassing SMS and TOTP MFA completely.',
    },
    fivePartExplanation: {
      whatHappened: 'An Adversary-in-the-Middle (AiTM) phishing framework proxied the real Microsoft login page to steal session cookies.',
      evidence: 'The link targeted "login.microsoftonline.com.evil-proxy-node.tech", an attacker-controlled Evilginx reverse proxy.',
      whyDangerous: 'AiTM proxies capture session tokens after successful MFA, rendering traditional SMS and OTP multi-factor authentication useless.',
      correctAction: 'Block the proxy domain, terminate existing session tokens, and enforce phishing-resistant FIDO2 / WebAuthn authentication.',
      securityTip: 'FIDO2 / passkeys cryptographically bind the credential to the exact browser URL origin, completely neutralizing reverse proxy attacks.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Examine the URL from right to left: What is the true second-level and top-level domain before the first single slash?',
      'Can regular SMS or mobile authenticator apps stop an attacker if you enter the code into the attacker’s proxy server?',
    ],
  },

  {
    challengeId: 'ch-phish-exp-03',
    roomId: 'room-01-inbox',
    topic: TOPICS.PHISHING,
    difficulty: 'expert',
    scenarioType: 'malicious',
    prompt: 'Examine this invoice containing an embedded QR code payload and determine the containment action.',
    narrative: 'An email arrives with a clean, virus-scanned PDF attachment named "Consolidated_Q3_Energy_Bill.pdf".',
    sanitizedEvidence: {
      type: 'email',
      sender: 'Regional Grid Utility <billing@regional-power-grid.net>',
      replyTo: 'support@regional-power-grid.net',
      subject: 'Delinquent Account Notice: Sector Substation 05 Power Cutoff',
      receivedTime: '2026-09-13T15:02:11Z',
      body: 'Your facility is 14 days overdue for high-capacity industrial electrical consumption. Review the attached certified utility statement. To avoid immediate load-shedding disconnection, scan the embedded payment authentication QR code with your mobile terminal.',
      linkTarget: 'http://quishing-redirector.cc/portal/pay-utility',
      linkDisplayText: 'Attached: Consolidated_Q3_Energy_Bill.pdf [Clean / Scanned by AV]',
      headers: {
        spf: 'PASS',
        dkim: 'NONE',
        dmarc: 'FAIL',
        returnPath: 'billing@regional-power-grid.net',
      },
      domainInspectionNotes: 'Domain regional-power-grid.net was created 10 days ago using privacy protection.',
      replyToNotes: 'Reply-To matches the lookalike domain.',
      linkInspectionNotes: 'PDF contains no text URLs, bypassing Secure Email Gateway (SEG) link scanners. The embedded QR code points to quishing-redirector.cc.',
      headerInspectionNotes: 'DMARC failed, indicating the message did not pass cryptographic policy.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['header_return_path', 'url_inspect', 'spf_check'],
    allowedActions: [
      { actionId: 'ACTION_QUARANTINE_QUISHING_PDF', label: 'Quarantine PDF, Extract Embedded QR Destination, and Sinkhole quishing-redirector.cc', variant: 'primary' },
      { actionId: 'ACTION_SCAN_QR_MOBILE', label: 'Scan Embedded QR Code with Personal Phone to Settle Utility Bill', variant: 'danger' },
      { actionId: 'ACTION_FORWARD_FACILITIES', label: 'Forward PDF to Facilities Maintenance Team with Urgent Priority', variant: 'warning' },
      { actionId: 'ACTION_WHITELIST_UTILITY', label: 'Whitelist regional-power-grid.net to Avoid Future Power Alerts', variant: 'ghost' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_QUARANTINE_QUISHING_PDF',
    privateIndicators: [
      'quishing_in_pdf: optical QR code embedded inside clean PDF to evade SEG scanners',
      'manufactured_disconnection_crisis: power cutoff threat',
      'malicious_destination: quishing-redirector.cc',
    ],
    scoringMetadata: {
      basePoints: 750,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'Quishing PDF neutralized! Embedded payload extracted and malicious C2 sinkholed across enterprise DNS.',
      onIncorrect: 'Quishing attack succeeded! Scanning the QR code from mobile device bypassed corporate endpoint controls and stole payment credentials.',
    },
    fivePartExplanation: {
      whatHappened: 'Attackers embedded a malicious QR code inside a PDF document to evade Secure Email Gateway text URL parsers.',
      evidence: 'The PDF contained zero hyperlinks but directed users to scan a QR code resolving to "quishing-redirector.cc".',
      whyDangerous: 'Scanning QR codes moves the transaction from protected corporate workstations to unmonitored mobile devices.',
      correctAction: 'Extract the QR link using automated sandbox tooling, quarantine the message, and sinkhole the destination domain.',
      securityTip: 'Treat QR codes in documents with the same suspicion as unknown executable files.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Why would an attacker place a QR code inside an email attachment instead of including a normal hyperlink?',
      'Check the destination domain extracted from the QR code: quishing-redirector.cc.',
    ],
  },

  {
    challengeId: 'ch-phish-exp-04',
    roomId: 'room-01-inbox',
    topic: TOPICS.PHISHING,
    difficulty: 'expert',
    scenarioType: 'malicious',
    prompt: 'Detect the Internationalized Domain Name (IDN) homoglyph attack hidden in this security advisory.',
    narrative: 'A communication claiming to be from internal legal counsel directs you to sign an updated nondisclosure agreement.',
    sanitizedEvidence: {
      type: 'email',
      sender: 'General Counsel <legal@xn--corp-facility-c7b.com>',
      replyTo: 'legal@xn--corp-facility-c7b.com',
      subject: 'ACTION REQUIRED: Updated Executive Mutual Non-Disclosure Agreement',
      receivedTime: '2026-09-13T15:30:00Z',
      body: 'Pursuant to our quarterly compliance audit, all credentialed operators must execute the updated facility confidentiality covenants. Review the agreement on our corporate legal repository.',
      linkTarget: 'https://xn--corp-facility-c7b.com/agreements/nda-sign.php',
      linkDisplayText: 'https://corp-fаcility.com/agreements/nda-sign.php',
      headers: {
        spf: 'PASS',
        dkim: 'PASS',
        dmarc: 'PASS',
        returnPath: 'legal@xn--corp-facility-c7b.com',
      },
      domainInspectionNotes: 'Visual display shows "corp-facility.com", but decoded Punycode is "xn--corp-facility-c7b.com". The "а" in facility is the Cyrillic small letter "а" (U+0430).',
      replyToNotes: 'Reply-To points to the Punycode domain.',
      linkInspectionNotes: 'Destination points to the homoglyph landing page designed to clone the internal legal portal.',
      headerInspectionNotes: 'Cryptographic checks pass because the threat actor legitimately owns the Cyrillic punycode registration.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['header_return_path', 'url_inspect', 'spf_check'],
    allowedActions: [
      { actionId: 'ACTION_IDENTIFY_HOMOGLYPH_PUNYCODE', label: 'Flag IDN Homoglyph / Punycode Spoofing & Block xn--corp-facility-c7b.com', variant: 'primary' },
      { actionId: 'ACTION_SIGN_LEGAL_AGREEMENT', label: 'Sign Document Since URL Visually Matches Official Domain corp-facility.com', variant: 'danger' },
      { actionId: 'ACTION_EMAIL_LEGAL_REPLY', label: 'Reply to Sender Inquiring Which Clauses Were Modified', variant: 'warning' },
      { actionId: 'ACTION_ARCHIVE_TRANSMISSION', label: 'Archive Transmission in Compliance Folder', variant: 'ghost' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_IDENTIFY_HOMOGLYPH_PUNYCODE',
    privateIndicators: [
      'punycode_homoglyph: xn--corp-facility-c7b.com using Cyrillic U+0430',
      'visual_impersonation: looks visually indistinguishable from corp-facility.com in certain fonts',
      'fully_signed_malicious_domain: SPF/DKIM pass on Punycode domain',
    ],
    scoringMetadata: {
      basePoints: 750,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'Homoglyph attack exposed! Punycode spoof blocked across all boundary DNS resolvers.',
      onIncorrect: 'Credential theft occurred! Cadet typed enterprise credentials into the Cyrillic homoglyph mirror site.',
    },
    fivePartExplanation: {
      whatHappened: 'An attacker utilized an IDN homoglyph attack, substituting Latin letters with visually identical Cyrillic characters.',
      evidence: 'The sender and destination domain resolved to "xn--corp-facility-c7b.com" via Punycode conversion.',
      whyDangerous: 'To the naked eye, homoglyphs can look identical to authentic corporate domains, easily deceiving experienced personnel.',
      correctAction: 'Configure mail gateways and browsers to display raw Punycode (xn--) for mixed-script domain registrations.',
      securityTip: 'Register common defensive homoglyphs of your organization’s domain or configure perimeter DNS to block unrecognized Punycode domains.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Look closely at the raw domain name in the headers: notice the "xn--" prefix indicating an Internationalized Domain Name.',
      'Check which character in "fаcility" is non-Latin.',
    ],
  },

  {
    challengeId: 'ch-phish-exp-05',
    roomId: 'room-01-inbox',
    topic: TOPICS.PHISHING,
    difficulty: 'expert',
    scenarioType: 'legitimate',
    prompt: 'Evaluate this Microsoft 365 Tenant Security Architecture Advisory and determine the appropriate action.',
    narrative: 'A formal notification from Microsoft 365 Message Center arrives announcing an upcoming retirement of legacy TLS 1.0/1.1 protocols.',
    sanitizedEvidence: {
      type: 'email',
      sender: 'Microsoft 365 Message Center <mscenter@messaging.microsoft.com>',
      replyTo: 'mscenter@messaging.microsoft.com',
      subject: 'MC910482: Retirement of Legacy Transport Layer Security (TLS) in Microsoft 365',
      receivedTime: '2026-09-13T16:00:00Z',
      body: 'Major Update: To safeguard customer security, Microsoft 365 services will permanently disable TLS 1.0 and 1.1 handshakes starting November 1. Ensure all facility API connectors and legacy mail relays support TLS 1.2 or higher. Review details in your Microsoft 365 Admin Center.',
      linkTarget: 'https://admin.microsoft.com/Adminportal/Home#/MessageCenter?id=MC910482',
      linkDisplayText: 'https://admin.microsoft.com/Adminportal/Home#/MessageCenter?id=MC910482',
      headers: {
        spf: 'PASS',
        dkim: 'PASS',
        dmarc: 'PASS',
        returnPath: 'mscenter@messaging.microsoft.com',
      },
      domainInspectionNotes: 'Originating domain messaging.microsoft.com is a verified Microsoft communications subdomain. Cryptographic DKIM key is officially signed by microsoft.com.',
      replyToNotes: 'Reply-To matches the authorized Microsoft automated messaging envelope.',
      linkInspectionNotes: 'Destination URL targets genuine Microsoft 365 Admin Center (admin.microsoft.com) via TLS 1.3 with Microsoft Corporation Extended Validation certificate.',
      headerInspectionNotes: 'SPF passed via authorized outbound Microsoft mail protection relays (mail-protection.outlook.com). DMARC is enforced with p=reject.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['header_return_path', 'url_inspect', 'spf_check'],
    allowedActions: [
      { actionId: 'ACTION_CONFIRM_TENANT_ADVISORY', label: 'Acknowledge Advisory & Schedule TLS Audit in Admin Center', variant: 'primary' },
      { actionId: 'ACTION_QUARANTINE_TENANT_ADVISORY', label: 'Quarantine Email as Phishing Attempt Due to Technical Complexity', variant: 'danger' },
      { actionId: 'ACTION_BLOCK_MICROSOFT_DOMAIN', label: 'Add messaging.microsoft.com to Boundary Firewall Blocklist', variant: 'warning' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_CONFIRM_TENANT_ADVISORY',
    privateIndicators: [
      'legitimate_microsoft_dkim: authentic signature from microsoft.com',
      'verified_admin_center_url: direct HTTPS link to admin.microsoft.com',
      'dmarc_alignment_pass: strict alignment on legitimate enterprise cloud vendor',
    ],
    scoringMetadata: {
      basePoints: 750,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'Official cloud security advisory confirmed. Infrastructure engineers queued legacy protocol audits in the verified Admin Center.',
      onIncorrect: 'False positive mistake! Quarantining official vendor service notices caused the organization to miss the TLS retirement deadline, causing API outages.',
    },
    fivePartExplanation: {
      whatHappened: 'You incorrectly marked an authentic Microsoft 365 architecture bulletin as malicious (false positive).',
      evidence: 'Headers proved strict cryptographic DKIM alignment with microsoft.com, SPF passed with Microsoft relays, and the hyperlink directed straight to admin.microsoft.com.',
      whyDangerous: 'Blocking or ignoring legitimate infrastructure advisories results in service deprecation blindspots, unexpected outages, and unpatched legacy protocols.',
      correctAction: 'Verify cryptographic authentication signatures and trusted admin URLs, then route the advisory to the appropriate IT operations queue.',
      securityTip: 'Security teams must never assume that complex or urgent technical advisories are fake without verifying cryptographic header authentication.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Check the cryptographic signature in the email header: Notice that dkim=PASS and the signing identity is microsoft.com.',
      'Inspect the destination link: Does admin.microsoft.com belong to the real Microsoft 365 service?',
    ],
  },

  {
    challengeId: 'ch-phish-exp-06',
    roomId: 'room-01-inbox',
    topic: TOPICS.PHISHING,
    difficulty: 'expert',
    scenarioType: 'legitimate',
    prompt: 'Examine this emergency vulnerability remediation directive from the internal CISO Office.',
    narrative: 'A priority alert arrives from the Chief Information Security Officer instructing all administrators to verify an out-of-band OpenSSL patch.',
    sanitizedEvidence: {
      type: 'email',
      sender: 'CISO Rapid Response <ciso-advisory@facility.internal>',
      replyTo: 'ciso-advisory@facility.internal',
      subject: 'CRITICAL SECURITY DIRECTIVE: Emergency OpenSSL Vulnerability Mitigation (CVE-2026-3819)',
      receivedTime: '2026-09-13T16:20:00Z',
      body: 'A remote code execution zero-day in OpenSSL has been disclosed. All facility server custodians must apply package hotfix openssl-3.0.15 immediately from the internal repository. Verify checksums via the internal portal.',
      linkTarget: 'https://security.facility.internal/cve-2026-3819/advisory.html',
      linkDisplayText: 'https://security.facility.internal/cve-2026-3819/advisory.html',
      headers: {
        spf: 'PASS',
        dkim: 'PASS',
        dmarc: 'PASS',
        returnPath: 'ciso-advisory@facility.internal',
      },
      domainInspectionNotes: 'Internal enterprise top-level domain (.internal). SPF, DKIM, and internal relay records confirm origin from CISO Office secure workstation subnet.',
      replyToNotes: 'Reply-To matches the authorized internal advisory mailing list.',
      linkInspectionNotes: 'Destination URL is hosted strictly on internal security infrastructure (security.facility.internal) with internal PKI certificate.',
      headerInspectionNotes: 'DKIM signature created using 4096-bit RSA key belonging to the facility internal root CA authority.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['header_return_path', 'url_inspect', 'spf_check'],
    allowedActions: [
      { actionId: 'ACTION_ACKNOWLEDGE_AND_DEPLOY_PATCH', label: 'Verify Internal Advisory & Coordinate Emergency Hotfix Deployment', variant: 'primary' },
      { actionId: 'ACTION_FLAG_CISO_AS_PHISH', label: 'Quarantine Advisory as Phishing Due to Severe Threat Language', variant: 'danger' },
      { actionId: 'ACTION_BLOCK_INTERNAL_DOMAIN', label: 'Report security.facility.internal to External Blacklist', variant: 'warning' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_ACKNOWLEDGE_AND_DEPLOY_PATCH',
    privateIndicators: [
      'internal_pki_dkim: 4096-bit RSA signature from internal facility root authority',
      'intranet_exclusive_link: targets internal security repository',
      'authenticated_emergency_protocol: follows pre-established CISO emergency response procedure',
    ],
    scoringMetadata: {
      basePoints: 750,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'Emergency directive verified. Custodians staged the official OpenSSL patch, mitigating the zero-day vulnerability before exploitation.',
      onIncorrect: 'False positive blunder! Quarantining the genuine CISO directive prevented system patching, leaving facility servers exposed to active zero-day exploitation.',
    },
    fivePartExplanation: {
      whatHappened: 'You flagged an authentic emergency security directive from the corporate CISO as a phishing attack.',
      evidence: 'The message was signed with internal 4096-bit RSA keys, SPF/DKIM passed on the internal network, and all links pointed to internal repositories.',
      whyDangerous: 'Blocking legitimate emergency security advisories halts vulnerability remediation, directly leaving production systems exposed to active threat actors.',
      correctAction: 'Validate internal cryptographic headers and repository links, then urgently coordinate patch verification with system administrators.',
      securityTip: 'Legitimate security alerts often describe critical threats and urgent deadlines. Distinguish them by checking internal sender cryptographic signatures.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Review the sender domain and cryptographic signature: Is it signed by the facility internal root authority?',
      'Check the destination link: Does it lead to an external commercial site or an internal security resource?',
    ],
  },

  {
    challengeId: 'ch-phish-exp-07',
    roomId: 'room-01-inbox',
    topic: TOPICS.PHISHING,
    difficulty: 'expert',
    scenarioType: 'malicious',
    prompt: 'Examine this HTML Smuggling transmission and identify the payload delivery mechanism.',
    narrative: 'A quarterly incident response metrics report arrives as an HTML file named "Q3_SOC_Telemetry_Report.html".',
    sanitizedEvidence: {
      type: 'email',
      sender: 'Global SOC Operations <reports@soc-telemetry-portal.com>',
      replyTo: 'reports@soc-telemetry-portal.com',
      subject: 'Confidential: Facility Cybersecurity Incident Log (Q3)',
      receivedTime: '2026-09-13T15:58:00Z',
      body: 'Attached is the compiled Q3 threat telemetry audit report. To view interactive graphs, open the attached HTML file in your browser.',
      linkTarget: 'attachment://Q3_SOC_Telemetry_Report.html',
      linkDisplayText: 'Attached File: Q3_SOC_Telemetry_Report.html (HTML Document / 42 KB)',
      headers: {
        spf: 'PASS',
        dkim: 'PASS',
        dmarc: 'NONE',
        returnPath: 'reports@soc-telemetry-portal.com',
      },
      domainInspectionNotes: 'Domain soc-telemetry-portal.com is not part of the facility registered enterprise domain registry.',
      replyToNotes: 'Return-path routes to external host.',
      linkInspectionNotes: 'Attachment analysis reveals embedded JavaScript with URL.createObjectURL(new Blob([base64Payload], {type: "application/x-iso9660-image"})) to assemble malware on client disk.',
      headerInspectionNotes: 'No DMARC enforcement on sender domain.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['header_return_path', 'url_inspect', 'spf_check'],
    allowedActions: [
      { actionId: 'ACTION_NEUTRALIZE_HTML_SMUGGLING', label: 'Quarantine Attachment, Extract Embedded Blob, and Block Smuggler Domain', variant: 'primary' },
      { actionId: 'ACTION_OPEN_HTML_REPORT', label: 'Double-Click Q3_SOC_Telemetry_Report.html to View Incident Graphs', variant: 'danger' },
      { actionId: 'ACTION_FORWARD_SOC_ANALYST', label: 'Forward Attachment to Junior SOC Analyst for Review', variant: 'warning' },
      { actionId: 'ACTION_REPLY_REQUEST_CSV', label: 'Reply Requesting the Report in Raw CSV Format', variant: 'ghost' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_NEUTRALIZE_HTML_SMUGGLING',
    privateIndicators: [
      'html_smuggling: JavaScript Blobs constructing ISO file in local memory',
      'perimeter_evasion: zero outbound payload transfer across network perimeter',
      'malicious_mimetype: application/x-iso9660-image embedded in base64 string',
    ],
    scoringMetadata: {
      basePoints: 750,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'HTML Smuggling payload detected! Malicious Blob assembly prevented and ISO container quarantined.',
      onIncorrect: 'Payload executed! Browser assembled the smuggled ISO archive, launching an embedded infostealer binary.',
    },
    fivePartExplanation: {
      whatHappened: 'An attacker utilized HTML Smuggling to construct a malicious ISO container file inside the browser memory.',
      evidence: 'The HTML file contained JavaScript utilizing URL.createObjectURL and Blob APIs to synthesize an executable image.',
      whyDangerous: 'HTML Smuggling bypasses traditional network firewalls and email gateways because the malicious file does not cross the wire as a whole binary.',
      correctAction: 'Quarantine suspicious HTML attachments and configure mail security solutions to block HTML attachments containing JavaScript decoding functions.',
      securityTip: 'Never open HTML attachments from external sources—modern enterprise reports are hosted on authenticated portals, not emailed as raw HTML.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'What happens when JavaScript code in an HTML file uses "Blob" and "URL.createObjectURL"?',
      'Why would a legitimate security team email an interactive report as a raw HTML attachment rather than hosting it on an intranet dashboard?',
    ],
  },

  {
    challengeId: 'ch-phish-exp-08',
    roomId: 'room-01-inbox',
    topic: TOPICS.PHISHING,
    difficulty: 'expert',
    scenarioType: 'legitimate',
    prompt: 'Evaluate this executive board meeting invitation and encrypted calendar payload.',
    narrative: 'A formal calendar invite arrives from the Executive Secretariat for next week’s Quarter 4 Strategy and Risk Review.',
    sanitizedEvidence: {
      type: 'email',
      sender: 'Executive Secretariat <secretariat@facility.gov.internal>',
      replyTo: 'secretariat@facility.gov.internal',
      subject: 'INVITATION: Executive Committee Quarterly Cyber Governance & Risk Review (Q4)',
      receivedTime: '2026-09-13T16:45:00Z',
      body: 'You are requested to attend the Executive Committee Risk Review on Tuesday at 0900 EST in Bulkhead Briefing Room Alpha. Please accept the calendar invite to sync coordinates and access the encrypted briefing packet via the internal committee repository.',
      linkTarget: 'https://briefings.facility.gov.internal/q4-risk-packet.pdf',
      linkDisplayText: 'https://briefings.facility.gov.internal/q4-risk-packet.pdf',
      headers: {
        spf: 'PASS',
        dkim: 'PASS',
        dmarc: 'PASS',
        returnPath: 'secretariat@facility.gov.internal',
      },
      domainInspectionNotes: 'Originating domain facility.gov.internal is the high-security executive internal domain. Cryptographic DKIM key matches internal executive cluster.',
      replyToNotes: 'Reply-To matches the authorized executive office mailbox.',
      linkInspectionNotes: 'Destination points to internal authenticated document repository (briefings.facility.gov.internal) requiring smart card mutual TLS.',
      headerInspectionNotes: 'SPF passed via internal executive mail gateways (10.10.1.5). Message includes valid iCalendar (.ics) attachment without external web-bugs.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['header_return_path', 'url_inspect', 'spf_check'],
    allowedActions: [
      { actionId: 'ACTION_ACCEPT_BOARD_MEETING', label: 'Accept Meeting Invite & Sync with Internal Corporate Calendar', variant: 'primary' },
      { actionId: 'ACTION_QUARANTINE_EXECUTIVE_INVITE', label: 'Quarantine Calendar Invite as Phishing Threat Due to Executive Sender', variant: 'danger' },
      { actionId: 'ACTION_BLOCK_SECRETARIAT', label: 'Block Secretariat Domain on Mail Server', variant: 'warning' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_ACCEPT_BOARD_MEETING',
    privateIndicators: [
      'authenticated_executive_dkim: authentic DKIM signature from executive gateway cluster',
      'mutual_tls_destination: briefing repository enforces smart-card mTLS',
      'valid_icalendar_payload: standard ICS without script injection or external beacon tracking',
    ],
    scoringMetadata: {
      basePoints: 750,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'Executive calendar invitation verified. Briefing coordinates synchronized with secure internal calendar.',
      onIncorrect: 'False positive blunder! Flagging the Board of Directors invitation as phishing prevented participation in mandatory risk governance sessions.',
    },
    fivePartExplanation: {
      whatHappened: 'You flagged an authentic executive meeting invitation as phishing simply because it came from leadership.',
      evidence: 'Cryptographic DKIM signed by executive cluster, SPF and DMARC aligned on internal domain, and links led strictly to internal mTLS repositories.',
      whyDangerous: 'Reflexively suspecting all communications from executive leadership without inspecting technical evidence disrupts high-level corporate governance.',
      correctAction: 'Verify that cryptographic signatures originate from genuine executive mail gateways and that document links reside on corporate intranet servers.',
      securityTip: 'Executive impersonation is common, but genuine executive emails also exist! Differentiate them using cryptographic headers, not cynical assumptions.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Inspect the cryptographic headers: Does the email originate from internal executive relays (10.10.1.5)?',
      'Check the calendar document link: Does it require internal smart-card mutual TLS?',
    ],
  },

  {
    challengeId: 'ch-phish-exp-09',
    roomId: 'room-01-inbox',
    topic: TOPICS.PHISHING,
    difficulty: 'expert',
    scenarioType: 'ambiguous',
    prompt: 'Investigate this unsolicited authentic password reset confirmation and choose the safest response.',
    narrative: 'A genuine password reset notification arrives from Okta Identity Cloud for your facility administrative account—but you did not initiate any reset.',
    sanitizedEvidence: {
      type: 'email',
      sender: 'Okta Identity Management <notifications@okta.com>',
      replyTo: 'no-reply@okta.com',
      subject: 'Password Reset Requested for Your Enterprise Account',
      receivedTime: '2026-09-13T17:10:00Z',
      body: 'A request has been made to reset the password for account: cadet_operator@facility.internal. If you made this request, click the link below to set your new password. If you did NOT request this, your credentials may be targeted.',
      linkTarget: 'https://facility.okta.com/signin/reset-password/token_98f41e0b',
      linkDisplayText: 'https://facility.okta.com/signin/reset-password/token_98f41e0b',
      headers: {
        spf: 'PASS',
        dkim: 'PASS',
        dmarc: 'PASS',
        returnPath: 'bounce@okta.com',
      },
      domainInspectionNotes: 'The email is 100% authentic: originated from okta.com with valid cryptographic signatures from Okta Inc.',
      replyToNotes: 'Return-path matches legitimate Okta notifications infrastructure.',
      linkInspectionNotes: 'The hyperlink actually leads to your authentic corporate Okta tenant (facility.okta.com). It is NOT a phishing link.',
      headerInspectionNotes: 'All cryptographic checks pass. However, you did NOT initiate this password reset request.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['header_return_path', 'url_inspect', 'spf_check'],
    allowedActions: [
      { actionId: 'ACTION_ALERT_SOC_CREDENTIAL_STUFFING', label: 'Do NOT Click Link; Alert SOC to Audit Login Attempts for Credential Stuffing', variant: 'primary' },
      { actionId: 'ACTION_CLICK_RESET_LINK', label: 'Click the Link to Complete the Reset Since Okta Email Is Authentic', variant: 'danger' },
      { actionId: 'ACTION_IGNORE_AS_SPAM', label: 'Ignore the Notification Because the Link Is Legitimately From Okta', variant: 'warning' },
      { actionId: 'ACTION_QUARANTINE_OKTA_SERVER', label: 'Quarantine okta.com Domain as a Phishing Sender', variant: 'ghost' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_ALERT_SOC_CREDENTIAL_STUFFING',
    privateIndicators: [
      'authentic_service_unsolicited_trigger: genuine email triggered by third-party adversary attempting credential stuffing',
      'password_spray_indicator: adversary testing user account on public IdP login page',
      'do_not_click_reset: clicking reset may invalidate existing session or satisfy attacker state',
    ],
    scoringMetadata: {
      basePoints: 750,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'Targeted attack thwarted! SOC investigated authentication logs and discovered an active credential stuffing attack against cadet accounts.',
      onIncorrect: 'Compromise or blindspot! Either you clicked an unsolicited reset link during an active attack or ignored an active credential stuffing campaign.',
    },
    fivePartExplanation: {
      whatHappened: 'An attacker triggered a genuine password reset on your enterprise Okta tenant while attempting credential stuffing.',
      evidence: 'The email was 100% cryptographically authentic from okta.com, but you never requested a password reset.',
      whyDangerous: 'An unsolicited reset from a genuine service means an adversary possesses your username and is actively probing your authentication boundary.',
      correctAction: 'Never click links in unsolicited reset emails; immediately report the event to the SOC so they can correlate brute-force attempts in IdP logs.',
      securityTip: 'Authentic emails can still be symptoms of an attack! When legitimate services send you alerts you did not trigger, investigate immediately.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'The email is genuine from Okta—but did YOU ask for a password reset?',
      'If someone else triggered a password reset on your account, what does that indicate about their intentions?',
    ],
  },

  {
    challengeId: 'ch-phish-exp-10',
    roomId: 'room-01-inbox',
    topic: TOPICS.PHISHING,
    difficulty: 'expert',
    scenarioType: 'legitimate',
    prompt: 'Inspect this hardware security token registration confirmation and choose the appropriate action.',
    narrative: 'An email arrives confirming the physical registration of a new FIDO2 hardware YubiKey to your operator profile.',
    sanitizedEvidence: {
      type: 'email',
      sender: 'Enterprise Identity Provider <identity-auth@facility.internal>',
      replyTo: 'identity-auth@facility.internal',
      subject: 'Security Confirmation: New FIDO2 Security Key Registered to Your Profile',
      receivedTime: '2026-09-13T17:35:00Z',
      body: 'A new FIDO2 hardware security key (YubiKey 5C NFC, Serial #19842201) was successfully registered to your operator profile at the facility enrollment kiosk. If you just enrolled this key, review your registered devices via your account portal.',
      linkTarget: 'https://identity.facility.internal/my-account/security-keys',
      linkDisplayText: 'https://identity.facility.internal/my-account/security-keys',
      headers: {
        spf: 'PASS',
        dkim: 'PASS',
        dmarc: 'PASS',
        returnPath: 'identity-auth@facility.internal',
      },
      domainInspectionNotes: 'Sender domain facility.internal matches official enterprise identity cluster. Cryptographic DKIM matches enterprise IdP root certificate.',
      replyToNotes: 'Reply-To matches the authorized internal identity management service.',
      linkInspectionNotes: 'Destination URL is internal HTTPS portal (identity.facility.internal) with matching anchor text and internal CA trust.',
      headerInspectionNotes: 'Headers confirm internal mail routing with zero external hops. Device registration timestamp matches your scheduled hardware key distribution.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['header_return_path', 'url_inspect', 'spf_check'],
    allowedActions: [
      { actionId: 'ACTION_CONFIRM_KEY_REGISTRATION', label: 'Verify Hardware Key in Official Identity Portal & Continue Work', variant: 'primary' },
      { actionId: 'ACTION_QUARANTINE_DEVICE_RECEIPT', label: 'Quarantine Email & File Urgent Phishing Incident with SOC', variant: 'danger' },
      { actionId: 'ACTION_REVOKE_HARDWARE_KEY', label: 'Immediately Revoke Hardware Key Without Checking Enrollment Record', variant: 'warning' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_CONFIRM_KEY_REGISTRATION',
    privateIndicators: [
      'expected_security_event: matches physical distribution of security tokens',
      'internal_pki_signature: authentic IdP signature',
      'trusted_internal_origin: exact match on corporate identity infrastructure',
    ],
    scoringMetadata: {
      basePoints: 750,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'Legitimate device confirmation verified. New phishing-resistant FIDO2 hardware key safely recorded in operator profile.',
      onIncorrect: 'False positive blunder! Quarantining authentic hardware key registrations halted multi-factor security rollouts and broke authentication setups.',
    },
    fivePartExplanation: {
      whatHappened: 'You flagged an authentic security token enrollment confirmation as a phishing attack (false positive).',
      evidence: 'The sender domain was the verified internal IdP, cryptographic signatures passed, and the event matched physical security key enrollment.',
      whyDangerous: 'Blocking authentic identity security alerts disrupts deployment of phishing-resistant authentication and creates unnecessary confusion.',
      correctAction: 'Correlate the notification with your recent physical actions, check internal headers, and confirm the device in your official identity portal.',
      securityTip: 'Real security systems generate alerts when you perform sensitive actions. Don\'t panic—verify technical indicators and confirm with your actions.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Does the serial number and device type in the email match the physical hardware key issued to you?',
      'Check the SPF and DKIM signatures: Are they validated by your internal enterprise identity server?',
    ],
  },
];

/**
 * Returns all challenges defined for Room 01.
 */
export function getRoom01Challenges() {
  return ROOM_01_CHALLENGES;
}

/**
 * Finds a Room 01 challenge definition by ID.
 */
export function getRoom01ChallengeById(challengeId) {
  return ROOM_01_CHALLENGES.find((c) => c.challengeId === challengeId);
}

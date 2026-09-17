import { TOPICS } from '../../utils/constants.js';

/**
 * Authoritative Challenge Definitions for ROOM 04: THE MESSAGE (Social Engineering & Pretexting).
 * Contains 1 Beginner, 3 Intermediate, and 10 Expert challenges.
 * Private validation fields (correctActionId, privateIndicators, explanation) are kept strictly server-side.
 */
export const ROOM_04_CHALLENGES = [
  // ==========================================
  // BEGINNER (1 Challenge)
  // ==========================================
  {
    challengeId: 'ch-msg-01',
    roomId: 'room-04-message',
    topic: TOPICS.SOCIAL_ENGINEERING,
    difficulty: 'beginner',
    scenarioType: 'malicious',
    prompt: 'Determine the appropriate response to the emergency direct message.',
    narrative: 'Direct communications terminal is receiving urgent requests claiming executive authorization.',
    sanitizedEvidence: {
      type: 'chat_message',
      senderName: 'VP Operations — Marcus Vance',
      senderHandle: '@m_vance_exec_secure',
      channel: 'Direct Telegram Message',
      messageText:
        'I am in a critical emergency board meeting and locked out of the Sector 04 core server. Send me the 6-digit OTP sent to your terminal RIGHT NOW or the entire facility contract is terminated!',
      receivedTime: '2026-09-10T11:58:12Z',
      internalDirectoryRecord: {
        name: 'Marcus Vance',
        title: 'VP of Operations',
        officialPhone: '+1-555-0199',
        officialSlack: '@marcus.vance',
        policyNote: 'Executives will NEVER contact personnel via personal Telegram or request OTP / 2FA tokens.',
      },
      channelNotes: 'Message arrived via unverified external Telegram handle. Corporate policy mandates official Slack or encrypted company phone lines.',
      policyNotes: 'Policy strictly prohibits sharing one-time passcodes, passwords, or authentication prompts with anyone under any circumstances.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['directory_lookup', 'channel_verification', 'policy_check'],
    allowedActions: [
      { actionId: 'ACTION_DISCLOSE_OTP', label: 'Transmit 6-Digit OTP Immediately to Avert Crisis', variant: 'danger' },
      { actionId: 'ACTION_REQUEST_EMPLOYEE_ID', label: 'Ask Sender to State Their Employee ID in Telegram', variant: 'warning' },
      { actionId: 'ACTION_VERIFY_OOB', label: 'Refuse Request & Verify Out-of-Band via Official Phone', variant: 'primary' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_VERIFY_OOB',
    privateIndicators: [
      'authority_pressure: pretext leverages executive rank to intimidate target',
      'artificial_urgency: extreme consequence threatened to rush emotional decision',
      'external_unverified_channel: communication conducted outside enterprise directory via third-party chat',
    ],
    scoringMetadata: {
      basePoints: 500,
      targetTimeSeconds: 35,
    },
    consequenceData: {
      onCorrect: 'Social engineering attack rebuffed! Identity verified out-of-band via official directory; administrative OTP was protected.',
      onIncorrect: 'Authentication bypass successful! Surrendering the 6-digit OTP granted the adversary full access to core facility servers.',
    },
    fivePartExplanation: {
      whatHappened: 'An attacker impersonated an executive using artificial urgency, fear, and authority pressure to extract an MFA one-time passcode.',
      evidence: 'The message came from an external Telegram handle (@m_vance_exec_secure) instead of official internal Slack, directly violating the facility OTP disclosure policy.',
      whyDangerous: 'OTPs are the second factor protecting critical accounts. Sharing an OTP gives the attacker instant unauthorized access, bypassing multi-factor authentication.',
      correctAction: 'Refuse to share the code and immediately verify the request using an independent, official channel (such as calling their desk phone from the directory).',
      securityTip: 'Legitimate administrators and executives will NEVER ask for your password or OTP. Always verify urgent, unusual requests out-of-band.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Notice the intense pressure and urgency being applied—attackers use fear of consequences to bypass rational security procedures.',
      'Cross-reference the external messaging handle with the internal corporate directory and corporate policy on MFA tokens.',
    ],
  },

  // ==========================================
  // INTERMEDIATE (3 Challenges)
  // ==========================================
  {
    challengeId: 'ch-msg-int-01',
    roomId: 'room-04-message',
    topic: TOPICS.SOCIAL_ENGINEERING,
    difficulty: 'intermediate',
    scenarioType: 'legitimate',
    prompt: 'Assess an official IT Helpdesk Slack bot notification regarding an upcoming software license renewal.',
    sanitizedEvidence: {
      type: 'chat_message',
      senderName: 'IT Service Desk Bot (Verified)',
      senderHandle: '@it-service-desk-app',
      channel: 'Slack Automated Workflow Channel (#it-notifications)',
      messageText:
        '"Hello Cadet! Your annual JetBrains IDE developer license is scheduled for renewal in 3 business days under Ticket #INC-84912. Please log into the internal IT Self-Service Portal (https://it-portal.facility.local/tickets/84912) and click \'Acknowledge Renewal\' to confirm continued use, or reply to this ticket if the tool is no longer required."',
      receivedTime: '2026-09-12T09:30:00Z',
      internalDirectoryRecord: {
        name: 'IT Operations Bot Integration',
        title: 'Verified Slack Enterprise Application',
        officialPhone: 'IT Service Desk Ext #4357',
        officialSlack: '@it-service-desk-app (Enterprise Verified)',
        policyNote: 'Standard software renewals are routed via automated Slack bot notifications directing users to the authenticated internal IT portal.',
      },
      channelNotes: 'Message delivered by authorized enterprise bot app with verified badge; links to internal non-routable .local portal.',
      policyNotes: 'Users must acknowledge annual developer software renewals to ensure accurate license budgeting.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['directory_lookup', 'channel_verification', 'policy_check'],
    allowedActions: [
      { actionId: 'ACTION_VERIFY_TICKET_PORTAL_APPROVE', label: 'Verify Ticket #INC-84912 in Internal IT Portal & Acknowledge License Renewal', variant: 'primary' },
      { actionId: 'ACTION_REPORT_IT_BOT_AS_PHISHING', label: 'Report IT Service Desk Bot as a Phishing Imposter and Block the Channel', variant: 'danger' },
      { actionId: 'ACTION_DM_BOT_PASSWORD', label: 'Send Corporate Master Password in Direct Message to Bot to Authorize License', variant: 'warning' },
      { actionId: 'ACTION_IGNORE_RENEWAL_PERMANENTLY', label: 'Ignore Notification and Assume Software Licenses Never Expire', variant: 'ghost' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_VERIFY_TICKET_PORTAL_APPROVE',
    privateIndicators: [
      'verified_slack_app: authenticated enterprise workflow bot',
      'internal_portal_link: directs to non-routable it-portal.facility.local ticket',
      'routine_administrative_task: annual software license hygiene',
    ],
    scoringMetadata: {
      basePoints: 600,
      targetTimeSeconds: 40,
    },
    consequenceData: {
      onCorrect: 'License renewal acknowledged! Verified legitimate IT workflow ticket, preserving developer tool access with zero disruption.',
      onIncorrect: 'Operational disruption! Reporting official IT automation as phishing blocked routine maintenance and caused developer IDE revocation.',
    },
    fivePartExplanation: {
      whatHappened: 'The employee received a routine automated software license renewal notification from the verified IT Service Desk bot.',
      evidence: 'The bot had a verified Slack enterprise app badge, referenced a valid ticket number (#INC-84912), and directed the user to the internal .local portal without requesting credentials.',
      whyDangerous: 'Falsely reporting routine operational IT notices as phishing creates false-alarm fatigue, delays ticket processing, and results in revoked software licenses.',
      correctAction: 'Verify the ticket number in the internal IT portal and confirm the renewal through established self-service channels.',
      securityTip: 'Authentic automated IT workflows guide users to authenticated internal portals and never ask for passwords in chat.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Look at the sender: Is the Slack app verified by enterprise IT administration?',
      'Does the message ask you for passwords or OTPs, or simply ask you to view an internal ticket in the official portal?',
    ],
  },

  {
    challengeId: 'ch-msg-int-02',
    roomId: 'room-04-message',
    topic: TOPICS.SOCIAL_ENGINEERING,
    difficulty: 'intermediate',
    scenarioType: 'malicious',
    prompt: 'Respond to an unsolicited inbound phone call claiming to be Tier 2 IT Helpdesk.',
    sanitizedEvidence: {
      type: 'chat_message',
      senderName: 'Helpdesk Analyst "Kevin Chen"',
      senderHandle: 'Inbound VoIP Call (Caller ID Spoofed: 555-0100)',
      channel: 'Corporate Desk Phone Terminal',
      messageText:
        '"Hello Cadet, this is Kevin from Tier 2 Central IT Support. Our SIEM alerts indicate your workstation is transmitting anomalous telemetry packets to a rogue external IP. I need you to install AnyDesk or TeamViewer immediately and read me your 9-digit connection ID so I can remote in and apply an emergency security hotfix."',
      receivedTime: '2026-09-12T11:15:00Z',
      internalDirectoryRecord: {
        name: 'Kevin Chen',
        title: 'IT Helpdesk Support Specialist',
        officialPhone: '+1-555-0144',
        officialSlack: '@kevin.chen.it',
        policyNote: 'Central IT only initiates remote sessions via approved pre-installed corporate software (Quick Assist / BeyondTrust) after generating a valid IT ticket number.',
      },
      channelNotes: 'Caller ID displays internal Helpdesk number, but Caller ID is easily spoofed over SIP/VoIP trunks.',
      policyNotes: 'Personnel must never install third-party remote access tools (AnyDesk, TeamViewer) at the request of an inbound caller.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['directory_lookup', 'channel_verification', 'policy_check'],
    allowedActions: [
      { actionId: 'ACTION_REFUSE_HANGUP_VERIFY_IT', label: 'Refuse Remote Software Install, Ask for Ticket Number, Hang Up, and Call IT Helpdesk Directly via Directory Extension', variant: 'primary' },
      { actionId: 'ACTION_INSTALL_ANYDESK_ASSIST', label: 'Install AnyDesk Immediately to Allow IT to Clean the Infected Workstation', variant: 'danger' },
      { actionId: 'ACTION_READ_MAC_ADDRESS', label: 'Read Out Workstation MAC Address and Local Administrator Password to the Caller', variant: 'warning' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_REFUSE_HANGUP_VERIFY_IT',
    privateIndicators: [
      'caller_id_spoofing: 555-0100 spoofed via VoIP trunk',
      'unauthorized_rat_installation: requests AnyDesk/TeamViewer instead of enterprise tooling',
      'technical_intimidation_pretext: claiming PC is transmitting malicious packets',
    ],
    scoringMetadata: {
      basePoints: 600,
      targetTimeSeconds: 40,
    },
    consequenceData: {
      onCorrect: 'Vishing attack blocked! Real IT Helpdesk confirmed Kevin Chen never called and no ticket was open.',
      onIncorrect: 'Remote Access Trojan installed! Threat actor took over mouse control and staged ransomware on the workstation.',
    },
    fivePartExplanation: {
      whatHappened: 'An attacker used voice phishing (vishing) with spoofed Caller ID to trick an employee into installing remote desktop software.',
      evidence: 'The caller demanded third-party software (AnyDesk) and could not provide an official internal IT service desk ticket number.',
      whyDangerous: 'Remote access software bypasses all boundary firewalls, giving the attacker interactive desktop control and keyboard access.',
      correctAction: 'Never accept unsolicited inbound IT calls requiring remote software installation; hang up and call back via the known internal directory.',
      securityTip: 'Treat Caller ID as unverified text; phone numbers can be spoofed trivially by any SIP VoIP service.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Does your company IT department ask employees to download public consumer tools like AnyDesk to fix computers?',
      'Can phone Caller ID numbers be spoofed by attackers?',
    ],
  },

  {
    challengeId: 'ch-msg-int-03',
    roomId: 'room-04-message',
    topic: TOPICS.SOCIAL_ENGINEERING,
    difficulty: 'intermediate',
    scenarioType: 'ambiguous',
    prompt: 'Evaluate a direct message from an engineering colleague requesting an urgent peer code review on internal GitHub Enterprise.',
    sanitizedEvidence: {
      type: 'chat_message',
      senderName: 'Senior DevOps Engineer Alex Rivera',
      senderHandle: '@alex.rivera',
      channel: 'Internal Corporate Slack Direct Message',
      messageText:
        '"Hey! Can you take a look at my pull request before the 14:00 deployment freeze? It adds the new rate-limiting middleware to the auth gateway: https://github.internal.facility-corp.com/core-infra/pull/184. Let me know if the unit tests pass on your staging branch."',
      receivedTime: '2026-09-12T13:10:00Z',
      internalDirectoryRecord: {
        name: 'Alex Rivera',
        title: 'Senior DevOps Engineer',
        officialPhone: '+1-555-0167',
        officialSlack: '@alex.rivera',
        policyNote: 'Code reviews must be performed exclusively on internal GitHub Enterprise repositories with signed commits.',
      },
      channelNotes: 'Slack account is authentic and matches internal directory. URL points directly to internal private GitHub instance.',
      policyNotes: 'All code reviews require checking commit GPG signatures and automated CI/CD pipeline test results prior to approval.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['directory_lookup', 'channel_verification', 'policy_check'],
    allowedActions: [
      { actionId: 'ACTION_REVIEW_PR_INTERNAL_GIT', label: 'Inspect Commit Author & Branch on Internal GitHub Enterprise Before Approving', variant: 'primary' },
      { actionId: 'ACTION_REPORT_COLLEAGUE_AS_HACKER', label: 'Report Alex Rivera to SOC as Compromised Account and Lock His Slack Access', variant: 'danger' },
      { actionId: 'ACTION_MERGE_WITHOUT_INSPECTION', label: 'Click "Merge Pull Request" Immediately Without Reviewing Code or Testing', variant: 'warning' },
      { actionId: 'ACTION_POST_CODE_TO_PUBLIC_GITHUB', label: 'Copy Internal Code to Public GitHub to Ask Reddit for Peer Review', variant: 'ghost' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_REVIEW_PR_INTERNAL_GIT',
    privateIndicators: [
      'authentic_internal_channel: authentic Slack account communicating routine task',
      'internal_git_destination: host is non-routable internal github enterprise instance',
      'verification_requirement: peer review requires inspecting commit signatures and diffs before merging',
    ],
    scoringMetadata: {
      basePoints: 600,
      targetTimeSeconds: 40,
    },
    consequenceData: {
      onCorrect: 'Code review completed safely! Validated authentic branch, checked GPG commit signatures, and merged approved middleware.',
      onIncorrect: 'Disruptive mistake! Either blindly merging introduced unreviewed flaws, or falsely reporting a colleague halted critical deployments.',
    },
    fivePartExplanation: {
      whatHappened: 'A colleague sent a legitimate, urgent request for a peer review on an internal enterprise repository.',
      evidence: 'The link directed to internal GitHub Enterprise (github.internal.facility-corp.com) and the sender matched the verified company directory.',
      whyDangerous: 'Blindly merging code without inspection risks pushing bugs, but falsely reporting colleagues paralyzes engineering productivity.',
      correctAction: 'Navigate to the pull request, verify GPG commit signatures and automated CI test results, and perform standard peer code review.',
      securityTip: 'Differentiate between suspicious external lures and normal internal collaborative requests; verify git commits cryptographically.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Is the URL pointing to a public third-party website or your private internal GitHub Enterprise instance?',
      'What is the proper engineering procedure before merging any pull request?',
    ],
  },

  // ==========================================
  // EXPERT (10 Challenges)
  // ==========================================
  {
    challengeId: 'ch-msg-exp-01',
    roomId: 'room-04-message',
    topic: TOPICS.SOCIAL_ENGINEERING,
    difficulty: 'expert',
    scenarioType: 'malicious',
    prompt: 'Detect and neutralize an AI-synthesized Deepfake Voice Vishing attack targeting executive treasury.',
    sanitizedEvidence: {
      type: 'chat_message',
      senderName: 'Chief Executive Officer (Audio Call)',
      senderHandle: '+1-555-0101 (Voice Call to Chief Financial Officer)',
      channel: 'Encrypted Executive Mobile Line',
      messageText:
        '"[VOICE CALL TRANSCRIPT]: David, it\'s me. I am in Zurich with the investment bankers finalizing the acquisition of Nordik Defense Systems. Regulators gave us a 45-minute window to deposit the $2.8M earnest collateral into escrow or the merger is void. Wire the funds to the Swiss UBS coordinates I am texting you right now. Do not discuss this with anyone—we are under strict SEC quiet period restrictions."',
      receivedTime: '2026-09-13T18:10:00Z',
      internalDirectoryRecord: {
        name: 'Arthur Sterling',
        title: 'Chief Executive Officer',
        officialPhone: '+1-555-0101',
        officialSlack: '@arthur.sterling',
        policyNote: 'Facility Treasury By-Laws mandate that any financial transfer exceeding $50,000 requires dual physical token signatures and in-person or out-of-band video verification regardless of executive rank.',
      },
      channelNotes: 'Voice biometrics match Arthur Sterling\'s pitch, accent, and breathing pattern with 98% similarity, but audio analysis reveals subtle synthetic pitch jitter indicative of real-time AI generative voice cloning (Deepfake Vishing).',
      policyNotes: 'Treasury wire transfers cannot be authorized over phone calls without dual cryptographic hardware token attestation.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['directory_lookup', 'channel_verification', 'policy_check'],
    allowedActions: [
      { actionId: 'ACTION_ENFORCE_DUAL_KEY_CHALLENGE', label: 'Enforce Dual-Custody Treasury Policy, Challenge Caller with Pre-Arranged Shared Duress Passphrase, and Freeze Wire Request', variant: 'primary' },
      { actionId: 'ACTION_EXECUTE_CEO_EMERGENCY_WIRE', label: 'Execute $2.8M Escrow Wire Immediately to Prevent Voiding the Merger', variant: 'danger' },
      { actionId: 'ACTION_TEXT_CEO_CELL_PHONE', label: 'Send an SMS to the CEO Asking If He Really Wants the Money Sent', variant: 'warning' },
      { actionId: 'ACTION_POST_MERGER_ON_SLACK', label: 'Congratulate the CEO on Slack for the Zurich Acquisition', variant: 'ghost' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_ENFORCE_DUAL_KEY_CHALLENGE',
    privateIndicators: [
      'deepfake_voice_cloning: AI voice model synthesized from public keynote speeches',
      'extreme_confidentiality_pretext: "SEC quiet period" used to isolate target from advisors',
      'catastrophic_financial_theft: $2.8M fraudulent wire to offshore shell account',
    ],
    scoringMetadata: {
      basePoints: 750,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'Deepfake heist thwarted! Duress challenge failed, fraudulent Swiss wire blocked, and FBI cyber division notified.',
      onIncorrect: 'Catastrophic treasury loss! $2.8M transferred to Swiss shell account; funds instantly converted to privacy cryptocurrencies.',
    },
    fivePartExplanation: {
      whatHappened: 'Threat actors utilized real-time generative AI voice cloning to impersonate the CEO in a targeted executive wire fraud scheme.',
      evidence: 'Audio spectral analysis detected generative pitch jitter, and the caller attempted to bypass dual-authorization policies under "confidentiality".',
      whyDangerous: 'Modern voice cloning requires only 30 seconds of sample audio (from YouTube, podcasts, or webinars) to generate convincing live telephone speech.',
      correctAction: 'Enforce strict dual-custody verification protocols and challenge high-stakes requests with a pre-arranged out-of-band duress word.',
      securityTip: 'Never allow verbal or telephone instructions to override cryptographic dual-control policies for financial or access changes.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Can an executive’s voice be cloned using modern artificial intelligence models?',
      'What facility policy prevents a single phone call from moving millions of dollars?',
    ],
  },

  {
    challengeId: 'ch-msg-exp-02',
    roomId: 'room-04-message',
    topic: TOPICS.SOCIAL_ENGINEERING,
    difficulty: 'expert',
    scenarioType: 'legitimate',
    prompt: 'Evaluate an internal audit data request from the Chief Risk Officer for an upcoming ISO 27001 surveillance audit.',
    sanitizedEvidence: {
      type: 'chat_message',
      senderName: 'Chief Risk Officer "Eleanor Vance"',
      senderHandle: '@eleanor.vance.cro',
      channel: 'Internal Corporate Slack Direct Message',
      messageText:
        '"Hello Cadet. As scheduled in the Q3 Compliance Roadmap, our external ISO 27001 auditor is reviewing Sector 04 system access logs tomorrow morning. Please review formal Jira ticket #AUDIT-2026-44, sanitize any customer PII according to Data Handling Policy 4.2, and upload the sanitized authentication logs to our internal encrypted compliance vault: https://vault.internal.facility-corp.com/audit/iso27001."',
      receivedTime: '2026-09-13T18:30:00Z',
      internalDirectoryRecord: {
        name: 'Eleanor Vance',
        title: 'Chief Risk & Compliance Officer',
        officialPhone: '+1-555-0112',
        officialSlack: '@eleanor.vance.cro',
        policyNote: 'Audit log exports must reference a valid Jira AUDIT ticket and be transmitted exclusively to the internal encrypted compliance vault.',
      },
      channelNotes: 'Message delivered via verified internal Slack account with verified security icon; matches corporate directory extension.',
      policyNotes: 'Uploading sanitized logs to the internal compliance vault under an approved audit ticket complies with ISO 27001 requirements.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['directory_lookup', 'channel_verification', 'policy_check'],
    allowedActions: [
      { actionId: 'ACTION_VERIFY_AUDIT_TICKET_DISPATCH_LOGS', label: 'Verify Jira Ticket #AUDIT-2026-44, Sanitize Customer PII, and Upload Logs to Internal Compliance Vault', variant: 'primary' },
      { actionId: 'ACTION_REFUSE_AUDIT_REPORT_AS_PHISHING', label: 'Accuse Chief Risk Officer of Social Engineering and Report Her Account to SOC', variant: 'danger' },
      { actionId: 'ACTION_EMAIL_RAW_PII_LOGS', label: 'Email Raw Unsanitized Customer PII Logs to an External Gmail Address', variant: 'warning' },
      { actionId: 'ACTION_DELETE_ALL_AUDIT_LOGS', label: 'Delete All Sector 04 Audit Logs to Prevent the Auditor from Finding Flaws', variant: 'ghost' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_VERIFY_AUDIT_TICKET_DISPATCH_LOGS',
    privateIndicators: [
      'verified_internal_executive: legitimate request matching corporate compliance roadmap',
      'formal_ticket_traceability: Jira #AUDIT-2026-44 verified in governance system',
      'internal_secure_destination: encrypted vault on internal private network',
    ],
    scoringMetadata: {
      basePoints: 750,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'Audit request fulfilled! Validated Jira ticket, sanitized customer PII, and delivered logs to the compliance vault on schedule.',
      onIncorrect: 'Regulatory failure! Accusing the Chief Risk Officer of phishing and refusing compliance data caused the organization to fail its ISO 27001 audit.',
    },
    fivePartExplanation: {
      whatHappened: 'The Chief Risk Officer requested sanitized access logs via verified internal Slack for a scheduled ISO 27001 compliance audit.',
      evidence: 'The message originated from the authentic internal account, linked to a legitimate Jira ticket (#AUDIT-2026-44), and directed data to the internal vault.',
      whyDangerous: 'Falsely treating legitimate executive compliance workflows as attacks disrupts governance and causes failure in mandatory regulatory audits.',
      correctAction: 'Cross-reference the audit ticket in Jira, sanitize sensitive customer data per policy, and transmit via authorized internal vaults.',
      securityTip: 'Authentic internal requests reference verifiable project tickets and use official corporate storage repositories.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Check the destination URL: Is it an internal corporate vault or an external third-party file sharing site?',
      'Does the request reference an authorized, scheduled compliance ticket (#AUDIT-2026-44)?',
    ],
  },

  {
    challengeId: 'ch-msg-exp-03',
    roomId: 'room-04-message',
    topic: TOPICS.SOCIAL_ENGINEERING,
    difficulty: 'expert',
    scenarioType: 'malicious',
    prompt: 'Triage an active SIM Swapping attack underway against an executive mobile device.',
    sanitizedEvidence: {
      type: 'chat_message',
      senderName: 'Cellular Carrier Automated System',
      senderHandle: 'SMS Shortcode #9001 (Verizon / AT&T Carrier Alert)',
      channel: 'Personal Executive Smartphone SMS',
      messageText:
        '"CARRIER ALERT: A request to transfer your phone number to a new SIM card (ICCID: 89014103211982) was submitted at our retail store in Miami, FL. If you did NOT authorize this SIM swap, call carrier fraud immediately or reply NO within 5 minutes before cellular service transfers."',
      receivedTime: '2026-09-13T19:00:00Z',
      internalDirectoryRecord: {
        name: 'Arthur Sterling',
        title: 'Chief Executive Officer',
        officialPhone: '+1-555-0101',
        officialSlack: '@arthur.sterling',
        policyNote: 'Executive accounts must never use SMS for two-factor authentication. All identity portals require hardware-backed WebAuthn / FIDO2 security keys.',
      },
      channelNotes: 'SIM swap is in progress. Within 5 minutes, the executive\'s mobile phone will lose cellular service ("SOS Mode / No Service"), and all SMS 2FA codes will route to the attacker\'s phone.',
      policyNotes: 'Carrier port locks and PIN codes are required for all VIP and executive accounts.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['directory_lookup', 'channel_verification', 'policy_check'],
    allowedActions: [
      { actionId: 'ACTION_PORT_LOCK_REVOKE_SESSIONS', label: 'Call Carrier Fraud to Freeze SIM Port, Lock Executive Identity Accounts, and Terminate All Active SSO Sessions Immediately', variant: 'primary' },
      { actionId: 'ACTION_IGNORE_AS_SPAM_SMS', label: 'Ignore SMS as Generic Phishing Spam and Continue Working', variant: 'danger' },
      { actionId: 'ACTION_REBOOT_PHONE_REPEATEDLY', label: 'Reboot Phone Several Times to Try to Restore Cellular Signal', variant: 'warning' },
      { actionId: 'ACTION_SEND_PASSWORD_OVER_SMS', label: 'Reply to SMS with Account Password to Prove Identity', variant: 'ghost' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_PORT_LOCK_REVOKE_SESSIONS',
    privateIndicators: [
      'sim_swapping_in_progress: carrier shortcode alert warning of unauthorized ICCID swap',
      'imminent_service_loss: phone will drop to SOS mode when attacker SIM activates',
      'sms_2fa_hijack_target: attacker aims to reset banking and corporate SSO passwords via SMS OTP',
    ],
    scoringMetadata: {
      basePoints: 750,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'SIM swap intercepted! Carrier froze the unauthorized transfer, and security revoked all active corporate executive sessions.',
      onIncorrect: 'Cellular hijack successful! Attacker took over the executive\'s phone number and reset multiple corporate cloud passwords via SMS.',
    },
    fivePartExplanation: {
      whatHappened: 'A threat actor socially engineered cellular carrier customer support to execute a fraudulent SIM swap against the CEO\'s phone.',
      evidence: 'The carrier alert reported an unauthorized transfer request to a new SIM card ICCID originating from an unfamiliar location.',
      whyDangerous: 'Once the SIM swap completes, the attacker receives all incoming SMS messages, phone calls, and two-factor authentication reset codes.',
      correctAction: 'Contact the carrier immediately to freeze the port, lock corporate accounts, and revoke all active cloud session tokens.',
      securityTip: 'Remove SMS as a two-factor authentication method across all critical services; enforce hardware tokens (FIDO2) or authenticator apps.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'What happens to your phone when an attacker successfully moves your phone number to their own SIM card?',
      'If an attacker controls your phone number, what can they reset using SMS verification codes?',
    ],
  },

  {
    challengeId: 'ch-msg-exp-04',
    roomId: 'room-04-message',
    topic: TOPICS.SOCIAL_ENGINEERING,
    difficulty: 'expert',
    scenarioType: 'ambiguous',
    prompt: 'Investigate an urgent Slack message from an overseas traveling colleague sharing an external Zoom cloud meeting recording.',
    sanitizedEvidence: {
      type: 'chat_message',
      senderName: 'Lead Systems Architect "David Kim"',
      senderHandle: '@david.kim.arch',
      channel: 'Internal Corporate Slack Direct Message',
      messageText:
        '"Hey! I am boarding my connecting flight in Frankfurt. The European partner briefing just concluded and has crucial architecture decisions for our Sector 04 rollout. The recording was hosted on Zoom Cloud: https://facilitycorp.zoom.us/rec/share/9284102948?pwd=ZWNk... Please review session #9284102948 and verify if the data residency clauses match our specs."',
      receivedTime: '2026-09-13T19:15:00Z',
      internalDirectoryRecord: {
        name: 'David Kim',
        title: 'Lead Systems Architect',
        officialPhone: '+1-555-0155',
        officialSlack: '@david.kim.arch',
        policyNote: 'External cloud meeting links must be cross-referenced with authorized calendar invites before entering single sign-on credentials.',
      },
      channelNotes: 'Slack account is authentic; David Kim is confirmed traveling in Germany on business.',
      policyNotes: 'Zoom cloud recordings must reside on the corporate tenant (facilitycorp.zoom.us) with meeting ID matching the registered corporate calendar invite.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['directory_lookup', 'channel_verification', 'policy_check'],
    allowedActions: [
      { actionId: 'ACTION_CROSS_REFERENCE_MEETING_CALENDAR', label: 'Cross-Reference Meeting ID #9284102948 with Corporate Calendar & Confirm Tenant Domain Before Accessing', variant: 'primary' },
      { actionId: 'ACTION_BLOCK_DAVID_KIM_IMMEDIATELY', label: 'Report David Kim as Compromised and Block All Zoom Links Enterprise-Wide', variant: 'danger' },
      { actionId: 'ACTION_FORWARD_RECORDING_PUBLIC_TWITTER', label: 'Post the Recording Password on Public Social Media to Test Audio Stream', variant: 'warning' },
      { actionId: 'ACTION_DELETE_RECORDING_MEETING', label: 'Attempt to Delete the Recording to Prevent Anyone from Watching It', variant: 'ghost' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_CROSS_REFERENCE_MEETING_CALENDAR',
    privateIndicators: [
      'legitimate_tenant_binding: facilitycorp.zoom.us corporate tenant URL',
      'calendar_cross_reference_required: verify session ID against scheduled calendar briefing',
      'business_continuity_preservation: traveling colleagues rely on cloud meeting archives',
    ],
    scoringMetadata: {
      basePoints: 750,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'Recording verified! Calendar cross-reference matched partner briefing #9284102948 on corporate Zoom tenant; architecture specs confirmed.',
      onIncorrect: 'Mismanaged triage! Falsely blocking a traveling lead architect paralyzed international collaboration during a key partnership deployment.',
    },
    fivePartExplanation: {
      whatHappened: 'A traveling architect shared a corporate Zoom recording link for an international partner meeting.',
      evidence: 'The link was on the authentic corporate tenant (facilitycorp.zoom.us) and matched an active calendar event for the European partner briefing.',
      whyDangerous: 'Unchecked links can lead to credential harvesting, but knee-jerk blocking of legitimate collaborative tools isolates remote team members.',
      correctAction: 'Cross-reference the meeting ID and timestamp against the corporate calendar and verify tenant URL parameters before accessing.',
      securityTip: 'Verify external collaboration links by corroborating meeting IDs and organizers with official corporate scheduling systems.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Check the domain: Does it belong to the corporate tenant (facilitycorp.zoom.us)?',
      'How can you confirm whether David Kim really had a partner briefing with that meeting ID today?',
    ],
  },

  {
    challengeId: 'ch-msg-exp-05',
    roomId: 'room-04-message',
    topic: TOPICS.SOCIAL_ENGINEERING,
    difficulty: 'expert',
    scenarioType: 'legitimate',
    prompt: 'Evaluate a physical access request at Sector 04 server room bulkhead by an HVAC contractor with an authorized security escort.',
    sanitizedEvidence: {
      type: 'chat_message',
      senderName: 'Physical Security Officer "Sergeant Davis" & HVAC Tech "Tom Miller"',
      senderHandle: 'Physical Intercom / Bulkhead Checkpoint Station',
      channel: 'Sector 04 Bulkhead Access Intercom',
      messageText:
        '"[INTERCOM AUDIO]: Sector 04 control, this is Sergeant Davis from Facility Physical Security. I am escorting Tom Miller from Carrier Commercial HVAC for the scheduled emergency compressor maintenance under Work Order #WO-7714. Both badges scanned green at the main guard shack and visitor registration log is signed. Requesting release of the outer mantrap bulkhead."',
      receivedTime: '2026-09-13T19:40:00Z',
      internalDirectoryRecord: {
        name: 'Work Order #WO-7714',
        title: 'Facilities Emergency HVAC Compressor Servicing',
        officialPhone: 'Security Command Dispatch Ext #4400',
        officialSlack: '#physical-security-ops',
        policyNote: 'Contractors accompanied by an active, badged Physical Security Officer with a valid Work Order and signed visitor logbook are authorized for mantrap entry.',
      },
      channelNotes: 'Video feed shows Sergeant Davis in full uniform with RFID duty badge displayed alongside authorized visitor badge on contractor.',
      policyNotes: 'Maintaining server room thermal regulation is critical; authorized escorted contractors must be granted timely access.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['directory_lookup', 'channel_verification', 'policy_check'],
    allowedActions: [
      { actionId: 'ACTION_VERIFY_ESCORT_LOG_PERMIT_ACCESS', label: 'Verify Security Officer Davis Badge on CCTV, Cross-Reference Work Order #WO-7714, and Release Bulkhead', variant: 'primary' },
      { actionId: 'ACTION_REFUSE_ALL_MAINTENANCE_LOCKDOWN', label: 'Refuse Entry to Armed Security Escort and Trigger Facility Anti-Intruder Lockdown', variant: 'danger' },
      { actionId: 'ACTION_UNLOCK_ALL_FACILITY_DOORS', label: 'Unlock Every Server Room Door in Sector 04 Permanently to Save Time', variant: 'warning' },
      { actionId: 'ACTION_IGNORE_INTERCOM_LEAVE_POST', label: 'Turn off Intercom Speaker and Leave Bulkhead Console Unattended', variant: 'ghost' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_VERIFY_ESCORT_LOG_PERMIT_ACCESS',
    privateIndicators: [
      'uniformed_security_escort: accompanied by verified on-duty security sergeant',
      'work_order_dispatch_match: WO-7714 verified in facility maintenance system',
      'visitor_log_compliance: badges registered and signed at perimeter checkpoint',
    ],
    scoringMetadata: {
      basePoints: 750,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'Authorized access granted! Validated security officer escort, logged Work Order #WO-7714, and restored server room thermal cooling.',
      onIncorrect: 'Thermal shutdown! Refusing authorized security-escorted technicians prevented cooling repairs, causing thermal server rack shutdowns.',
    },
    fivePartExplanation: {
      whatHappened: 'An authorized contractor accompanied by a uniformed Physical Security Officer requested access to repair a cooling compressor.',
      evidence: 'Security Officer Davis provided full badge attestation, visual CCTV verification, and a matching Work Order (#WO-7714) in facilities dispatch.',
      whyDangerous: 'Denying authorized maintenance accompanied by verified security escorts causes physical server overheating, thermal damage, and system outages.',
      correctAction: 'Verify the security officer\'s credentials on CCTV, confirm the active work order in dispatch, and log the escorted entry.',
      securityTip: 'Physical security protocols rely on dual verification: escort presence, formal work orders, and visitor registration logs.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Is the contractor unescorted or accompanied by a uniformed, badged Physical Security Officer?',
      'Does the request match an active emergency Work Order (#WO-7714) in the facilities management system?',
    ],
  },

  {
    challengeId: 'ch-msg-exp-06',
    roomId: 'room-04-message',
    topic: TOPICS.SOCIAL_ENGINEERING,
    difficulty: 'expert',
    scenarioType: 'malicious',
    prompt: 'Triage an attack utilizing Microsoft Teams External Domain Federation.',
    sanitizedEvidence: {
      type: 'chat_message',
      senderName: 'External Auditor "Robert Sterling (External)"',
      senderHandle: 'r.sterling@facility-audit-associates.com',
      channel: 'Microsoft Teams Direct Chat (External User)',
      messageText:
        '"Hello Cadet. We are conducting an emergency SOX IT compliance audit on your sector. We noticed several missing access logs. Review the compliance worksheet attached in our shared OneNote package: Q3_Compliance_Review.one. You must confirm all findings before 17:00."',
      receivedTime: '2026-09-13T20:05:00Z',
      internalDirectoryRecord: {
        name: 'Robert Sterling',
        title: 'Unverified External Domain User',
        officialPhone: 'External (+1-555-0188)',
        officialSlack: 'None',
        policyNote: 'Facility policy requires external audit communications to go through the Chief Risk Officer. External users must never send .one (OneNote) or script attachments over Teams.',
      },
      channelNotes: 'Teams displays "(External)" tag. Corporate Teams federation was left open, allowing any external Microsoft 365 tenant to message internal staff directly.',
      policyNotes: 'OneNote attachments (.one) are frequently weaponized with embedded VBScript/HTA loaders that execute when clicked.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['directory_lookup', 'channel_verification', 'policy_check'],
    allowedActions: [
      { actionId: 'ACTION_BLOCK_EXTERNAL_TEAMS_REPORT', label: 'Do NOT Open .one File, Block Sender Domain in Teams Admin Center, and Report Pretext to Chief Risk Officer', variant: 'primary' },
      { actionId: 'ACTION_OPEN_ONENOTE_AUDIT', label: 'Double-Click Q3_Compliance_Review.one to Complete Audit Requirements', variant: 'danger' },
      { actionId: 'ACTION_REPLY_TEAMS_CHAT', label: 'Reply in Chat Explaining Where the Missing Access Logs Are Stored', variant: 'warning' },
      { actionId: 'ACTION_FORWARD_TEAMS_COLLEAGUE', label: 'Forward OneNote File to Colleague in Finance', variant: 'ghost' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_BLOCK_EXTERNAL_TEAMS_REPORT',
    privateIndicators: [
      'teams_external_federation_exploit: open federation allows unsolicited external messages',
      'weaponized_onenote: .one file containing embedded malicious VBScript',
      'audit_intimidation: using compliance pressure to compel interaction',
    ],
    scoringMetadata: {
      basePoints: 750,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'Teams federation attack blocked! Malicious OneNote attachment quarantined and open external federation restricted.',
      onIncorrect: 'Malware infection! Opening the OneNote file executed embedded VBScript that dropped a command-and-control beacon.',
    },
    fivePartExplanation: {
      whatHappened: 'An attacker exploited open Microsoft Teams federation to message staff directly with a weaponized OneNote (.one) attachment.',
      evidence: 'The sender had an "(External)" tag, referenced an unannounced audit, and distributed a file format known for embedding malware.',
      whyDangerous: 'Because users associate Teams with trusted internal communications, they are less suspicious of links and files received via chat.',
      correctAction: 'Block the sender, report the message to security, and configure Teams federation policies to whitelist trusted partner domains only.',
      securityTip: 'Restrict external Teams federation and block inbound transmission of .one, .iso, and .vbs file types across all collaboration tools.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Notice the "(External)" badge next to the sender\'s name in Microsoft Teams.',
      'Why are attackers distributing .one (OneNote) files instead of standard Word or PDF documents?',
    ],
  },

  {
    challengeId: 'ch-msg-exp-07',
    roomId: 'room-04-message',
    topic: TOPICS.SOCIAL_ENGINEERING,
    difficulty: 'expert',
    scenarioType: 'legitimate',
    prompt: 'Validate an emergency patch deployment advisory in the verified corporate infrastructure alerts channel.',
    sanitizedEvidence: {
      type: 'chat_message',
      senderName: 'Lead Architect "Elena Rostova" (Change Advisory Board)',
      senderHandle: '@elena.rostova.cab',
      channel: 'Verified Internal Slack Channel (#infrastructure-alerts)',
      messageText:
        '"[CAB ADVISORY #2026-09-E]: Critical security update for OpenSSL buffer vulnerability CVE-2026-1184. The patch has passed automated CI/CD unit testing and has been signed with my GPG Key (0x7F9B124A). All Sector 04 nodes must pull commit hash `c48e91f7` from the internal git mirror (git.internal.facility-corp.com/security/openssl-hotfix) and execute the canary container rollout."',
      receivedTime: '2026-09-13T20:25:00Z',
      internalDirectoryRecord: {
        name: 'Elena Rostova',
        title: 'Principal Infrastructure Architect / CAB Chair',
        officialPhone: '+1-555-0149',
        officialSlack: '@elena.rostova.cab',
        policyNote: 'Emergency hotfix advisories in #infrastructure-alerts must include a valid CAB advisory number, GPG commit signature, and internal git mirror URL.',
      },
      channelNotes: 'Posted in write-restricted broadcast channel requiring multi-factor hardware key to publish. GPG key fingerprint matches corporate keyserver.',
      policyNotes: 'Rapid deployment of emergency cryptographic patches prevents remote exploitation of critical vulnerabilities.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['directory_lookup', 'channel_verification', 'policy_check'],
    allowedActions: [
      { actionId: 'ACTION_VERIFY_GPG_SIGNATURE_DEPLOY_PATCH', label: 'Verify Lead Architect GPG Signature (0x7F9B124A) & Schedule Canary Patch Deployment', variant: 'primary' },
      { actionId: 'ACTION_REJECT_PATCH_AS_MALWARE', label: 'Delete Git Mirror Repository and Report CAB Chair as Malicious Insider', variant: 'danger' },
      { actionId: 'ACTION_DEPLOY_UNTESTED_DEV_BRANCH', label: 'Pull Random Untested Code from Public Internet Instead of Signed Internal Mirror', variant: 'warning' },
      { actionId: 'ACTION_DISABLE_OPENSSL_ENTIRELY', label: 'Uninstall OpenSSL from All Core Infrastructure Nodes Permanently', variant: 'ghost' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_VERIFY_GPG_SIGNATURE_DEPLOY_PATCH',
    privateIndicators: [
      'cryptographic_gpg_verification: commit signed with verified hardware GPG key',
      'write_restricted_channel: #infrastructure-alerts channel protected by role RBAC',
      'internal_git_mirror: code hosted on git.internal.facility-corp.com',
    ],
    scoringMetadata: {
      basePoints: 750,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'Emergency patch deployed! Cryptographic GPG signature verified, internal mirror validated, and CVE-2026-1184 remediated safely.',
      onIncorrect: 'Vulnerability left exposed! Rejecting verified cryptographic patches left Sector 04 vulnerable to active remote code execution exploits.',
    },
    fivePartExplanation: {
      whatHappened: 'The Change Advisory Board issued a cryptographically signed emergency patch advisory in an authenticated corporate channel.',
      evidence: 'The advisory was published in a write-restricted channel, matched the official CAB schedule, and included a valid GPG signature and internal git mirror.',
      whyDangerous: 'Refusing authentic, verified security patches leaves zero-day vulnerabilities unpatched, exposing infrastructure to threat actors.',
      correctAction: 'Verify the author\'s GPG signature against the internal keyserver, inspect the commit hash on the internal mirror, and deploy via canary rollout.',
      securityTip: 'Use cryptographic signing (GPG/Sigstore) for emergency advisories and software commits to establish tamper-proof trust chains.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Is the announcement in a write-restricted verified broadcast channel or a public community chat?',
      'Can you cryptographically verify the GPG signature on the commit hash before deployment?',
    ],
  },

  {
    challengeId: 'ch-msg-exp-08',
    roomId: 'room-04-message',
    topic: TOPICS.SOCIAL_ENGINEERING,
    difficulty: 'expert',
    scenarioType: 'malicious',
    prompt: 'Identify and respond to a smishing attack paired with an Interactive Voice Response (IVR) phone intercept.',
    sanitizedEvidence: {
      type: 'chat_message',
      senderName: 'Commercial Banking Security Department',
      senderHandle: 'SMS Shortcode: +1-833-555-0199',
      channel: 'Mobile Phone SMS Text Message',
      messageText:
        '"BANK ALERT: A suspicious debit of $1,420.00 at Apple Store Chicago was attempted on your corporate procurement card. If this was NOT you, reply NO immediately or call our automated fraud prevention IVR system at +1-833-555-0199."',
      receivedTime: '2026-09-13T20:45:00Z',
      internalDirectoryRecord: {
        name: 'Corporate Card Program Policy',
        title: 'Treasury & Expense Management Standard',
        officialPhone: 'Official Bank Support on Back of Card: 1-800-432-1000',
        officialSlack: '#treasury-help',
        policyNote: 'Bank fraud alerts must only be verified by calling the official telephone number physically stamped on the back of the corporate payment card.',
      },
      channelNotes: 'Replying "NO" triggers an immediate automated phone call with an interactive voice response (IVR) prompting the user to enter their full 16-digit card number, PIN, and CVV to "cancel the charge".',
      policyNotes: 'Real banking fraud departments never ask customers to input their card PIN or CVV over an automated phone call.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['directory_lookup', 'channel_verification', 'policy_check'],
    allowedActions: [
      { actionId: 'ACTION_CALL_BACK_OF_CARD_REPORT', label: 'Do NOT Reply to SMS, Dial Official Fraud Number Physically Stamped on Back of Card, and Report Smishing Attack to Treasury', variant: 'primary' },
      { actionId: 'ACTION_REPLY_NO_AND_ENTER_PIN', label: 'Reply NO and Follow IVR Voice Prompts to Input Card PIN and CVV to Cancel Charge', variant: 'danger' },
      { actionId: 'ACTION_CALL_SMS_NUMBER_DIRECTLY', label: 'Call +1-833-555-0199 and Give the Automated Operator Card Details', variant: 'warning' },
      { actionId: 'ACTION_IGNORE_AND_DELETE_SMS', label: 'Delete SMS and Wait to See If the Charge Appears on Next Month\'s Statement', variant: 'ghost' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_CALL_BACK_OF_CARD_REPORT',
    privateIndicators: [
      'smishing_ivr_combo: SMS lure paired with automated IVR voice phishing to steal PIN/CVV',
      'spoofed_bank_alert: fake $1,420 charge creates immediate panic',
      'pin_harvesting: real banks never request card PIN via automated inbound calls',
    ],
    scoringMetadata: {
      basePoints: 750,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'Banking smishing attack dismantled! Official card provider confirmed zero fraudulent charges were attempted.',
      onIncorrect: 'Card compromise! Cadet followed IVR prompts and inputted card PIN and CVV, enabling immediate ATM cash extraction.',
    },
    fivePartExplanation: {
      whatHappened: 'Attackers combined SMS smishing with an automated interactive voice response (IVR) system to harvest payment card PINs.',
      evidence: 'The SMS directed the victim to call an unauthorized number (+1-833-555-0199) that simulated a legitimate bank fraud desk.',
      whyDangerous: 'Interactive voice systems sound professional and automated, tricking victims into believing they are speaking with a secure bank system.',
      correctAction: 'Never use phone numbers provided in SMS alerts; always turn over the physical card and call the official customer service number.',
      securityTip: 'Financial institutions will never request your ATM PIN, online banking password, or card CVV to verify fraud.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Where is the only 100% trustworthy telephone number for your corporate credit card located?',
      'Does a legitimate bank ever ask you to enter your secret 4-digit ATM PIN to dispute an unauthorized charge?',
    ],
  },

  {
    challengeId: 'ch-msg-exp-09',
    roomId: 'room-04-message',
    topic: TOPICS.SOCIAL_ENGINEERING,
    difficulty: 'expert',
    scenarioType: 'ambiguous',
    prompt: 'Investigate an external customer message demanding immediate GDPR / CCPA "Right to be Forgotten" data deletion.',
    sanitizedEvidence: {
      type: 'chat_message',
      senderName: 'External Customer "Jean-Luc Moreau"',
      senderHandle: 'privacy-request@moreau-consulting.fr',
      channel: 'Customer Privacy Inquiries Portal',
      messageText:
        '"Pursuant to Article 17 of the EU GDPR and California CCPA, I hereby exercise my Right to Erasure. You must delete all my account records, transaction logs, and operational telemetry within 24 hours or face statutory regulatory fines. Verification documents are attached in our encrypted portal token."',
      receivedTime: '2026-09-13T21:05:00Z',
      internalDirectoryRecord: {
        name: 'Data Privacy Officer (DPO) Protocol',
        title: 'Statutory Data Subject Access Request (DSAR) Standard',
        officialPhone: 'Legal Compliance Hotline Ext #7720',
        officialSlack: '#legal-privacy-dsar',
        policyNote: 'DSAR erasure requests cannot be executed directly by operational staff or dismissed summarily; they must be routed to the Data Privacy Officer for statutory identity verification and legal hold review.',
      },
      channelNotes: 'Customer identity appears genuine, but operational database engineers cannot directly delete logs without legal review due to statutory financial audit retention laws.',
      policyNotes: 'Immediate unilateral deletion risks destroying evidence under legal hold, while ignoring requests risks GDPR non-compliance fines.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['directory_lookup', 'channel_verification', 'policy_check'],
    allowedActions: [
      { actionId: 'ACTION_ESCALATE_PRIVACY_COMPLIANCE_OFFICER', label: 'Forward DSAR Request to Legal & Data Privacy Officer (DPO) for Statutory Verification & Legal Hold Check', variant: 'primary' },
      { actionId: 'ACTION_PURGE_DATABASE_RECORDS_NOW', label: 'Immediately Execute SQL "DROP / DELETE" on All Customer Records Without Legal Review', variant: 'danger' },
      { actionId: 'ACTION_DISMISS_AND_BLOCK_CUSTOMER', label: 'Block Customer Email Domain and Mark Request as Spam Extortion', variant: 'warning' },
      { actionId: 'ACTION_POST_CUSTOMER_PASSPORT_SLACK', label: 'Post Customer\'s Verification Passport to Public Slack Channel for Advice', variant: 'ghost' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_ESCALATE_PRIVACY_COMPLIANCE_OFFICER',
    privateIndicators: [
      'statutory_privacy_framework: legitimate GDPR Article 17 invocation',
      'legal_retention_conflict: financial records require tax hold reconciliation',
      'formal_escalation_protocol: operational engineers must route DSAR to DPO',
    ],
    scoringMetadata: {
      basePoints: 750,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'DSAR routed properly! Legal confirmed valid GDPR request, verified identity documents, and applied compliant redaction without violating tax retention laws.',
      onIncorrect: 'Legal compliance breach! Either unilateral deletion destroyed records subject to legal hold, or ignoring the request incurred regulatory penalties.',
    },
    fivePartExplanation: {
      whatHappened: 'A customer submitted a statutory GDPR/CCPA data erasure request requiring formal legal evaluation.',
      evidence: 'The request cited regulatory frameworks (Article 17) and provided verification tokens, touching both privacy rights and legal retention mandates.',
      whyDangerous: 'Unilaterally wiping databases destroys data required for tax and legal holds, while ignoring valid requests leads to massive regulatory fines.',
      correctAction: 'Route all statutory Data Subject Access Requests (DSAR) to the Data Privacy Officer (DPO) and Legal for formal compliance review.',
      securityTip: 'Establish clear demarcation between operational IT tasks and statutory privacy requests requiring legal compliance oversight.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Should an operational database engineer unilaterally delete customer records without legal compliance review?',
      'Who in the organization is legally responsible for verifying and executing GDPR Data Subject Access Requests?',
    ],
  },

  {
    challengeId: 'ch-msg-exp-10',
    roomId: 'room-04-message',
    topic: TOPICS.SOCIAL_ENGINEERING,
    difficulty: 'expert',
    scenarioType: 'legitimate',
    prompt: 'Assess an emergency containment directive from the Incident Response Commander in the active incident war room.',
    sanitizedEvidence: {
      type: 'chat_message',
      senderName: 'Incident Response Commander "Sarah Jenkins"',
      senderHandle: '@sarah.jenkins.soc',
      channel: 'Authenticated Emergency War Room (#incident-2026-09-alpha)',
      messageText:
        '"SECTOR 04 OPERATORS: Active lateral movement detected from compromised jump-box node 10.14.2.8. Under emergency authority IR-PLAYBOOK-07, isolate VLAN 42 (Operations Staging) at the boundary switch immediately to protect primary containment. Incident Bridge Ticket #INC-9912 is active and CISO approved."',
      receivedTime: '2026-09-13T21:30:00Z',
      internalDirectoryRecord: {
        name: 'Sarah Jenkins',
        title: 'Senior Incident Response Commander',
        officialPhone: '+1-555-0190',
        officialSlack: '@sarah.jenkins.soc',
        policyNote: 'Incident Commander containment directives in authenticated war rooms with active ticket references must be executed promptly according to established playbooks.',
      },
      channelNotes: 'Authenticated incident bridge created by SOC automation; Sarah Jenkins verified via dual-factor hardware token.',
      policyNotes: 'Rapid network isolation during active lateral movement halts ransomware propagation across core facility infrastructure.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['directory_lookup', 'channel_verification', 'policy_check'],
    allowedActions: [
      { actionId: 'ACTION_EXECUTE_VERIFIED_INCIDENT_RUNBOOK', label: 'Confirm Active Incident Ticket #INC-9912 in SOC Console & Execute Automated VLAN 42 Isolation', variant: 'primary' },
      { actionId: 'ACTION_REFUSE_CONTAINMENT_AS_IMPOSTER', label: 'Refuse Containment Order, Accuse IR Commander of Social Engineering, and Reconnect Jump-Box', variant: 'danger' },
      { actionId: 'ACTION_SHUT_DOWN_POWER_GRID_ENTIRE_FACILITY', label: 'Cut Main Electrical Breakers to the Entire Facility Without Authorization', variant: 'warning' },
      { actionId: 'ACTION_LEAVE_WAR_ROOM_AND_SILENCE_ALERTS', label: 'Mute Slack Channel and Go on Break While Attack Is Active', variant: 'ghost' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_EXECUTE_VERIFIED_INCIDENT_RUNBOOK',
    privateIndicators: [
      'authenticated_incident_bridge: verified automated channel created for active incident',
      'playbook_authority: containment directive matches IR-PLAYBOOK-07 standard',
      'lateral_movement_containment: immediate network isolation needed to stop ransomware spread',
    ],
    scoringMetadata: {
      basePoints: 750,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'Threat contained! Confirmed active ticket #INC-9912, isolated compromised staging VLAN 42, and blocked attacker lateral movement.',
      onIncorrect: 'Catastrophic breach propagation! Refusing the Incident Commander\'s containment order allowed active lateral movement to reach primary facility databases.',
    },
    fivePartExplanation: {
      whatHappened: 'The Incident Response Commander ordered emergency containment in an authenticated war room during an active security incident.',
      evidence: 'The directive was issued in the authenticated emergency channel (#incident-2026-09-alpha) with active ticket #INC-9912 and CISO approval.',
      whyDangerous: 'Hesitating or refusing legitimate incident response containment directives allows active threats to spread laterally across the network.',
      correctAction: 'Confirm the active incident ticket in the SOC dashboard and promptly execute the containment playbook as directed.',
      securityTip: 'Familiarize yourself with authorized incident response communication channels and established emergency response playbooks.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Is the emergency war room Slack channel authenticated and tied to an active incident ticket (#INC-9912)?',
      'What happens if an engineer refuses to execute containment playbooks during an active cyber attack?',
    ],
  },
];

/**
 * Returns all challenges defined for Room 04.
 */
export function getRoom04Challenges() {
  return ROOM_04_CHALLENGES;
}

/**
 * Finds a Room 04 challenge definition by ID.
 */
export function getRoom04ChallengeById(challengeId) {
  return ROOM_04_CHALLENGES.find((c) => c.challengeId === challengeId);
}

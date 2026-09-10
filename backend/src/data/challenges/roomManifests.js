import { TOPICS } from '../../utils/constants.js';

/**
 * Authoritative room specifications.
 * Contains both public presentation data and private server-only validation data.
 * The private keys (correctActionId, hiddenIoCs, explanation) are NEVER transmitted to the client.
 */
export const ROOM_MANIFESTS = [
  {
    id: 'room-01-inbox',
    sectorNumber: 1,
    title: 'The Inbox',
    topic: TOPICS.PHISHING,
    narrative: 'A critical terminal has been intercepted. Analyze incoming transmissions and neutralize phishing threats.',
    challenges: [
      {
        challengeId: 'ch-phish-01',
        topic: TOPICS.PHISHING,
        difficulty: 'beginner',
        prompt: 'Inspect the newly arrived IT security advisory before choosing how to respond.',
        evidence: {
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
          },
        },
        availableActions: [
          { actionId: 'ACTION_QUARANTINE', label: 'Quarantine & Report Phishing', variant: 'primary' },
          { actionId: 'ACTION_CLICK_LINK', label: 'Click Link to Sync Session', variant: 'danger' },
          { actionId: 'ACTION_IGNORE', label: 'Ignore Transmission', variant: 'ghost' },
        ],
        // --- SERVER ONLY SECRET VALIDATION DATA (NEVER EXPOSED OVER API) ---
        correctActionId: 'ACTION_QUARANTINE',
        hiddenIoCs: ['typosquatted_domain', 'mismatched_href_text', 'spf_fail'],
        hints: ['Examine the sender root domain carefully—notice the number instead of a letter.'],
        explanation: {
          whatHappened: 'The incoming transmission used an unauthorized lookalike domain to harvest credentials.',
          evidence: 'Sender domain was "micr0soft-update.com" with a numeral 0, and SPF authentication failed.',
          whyDangerous: 'Clicking the link routes to an attacker-controlled credential harvesting terminal.',
          correctAction: 'Quarantine the communication and file an immediate SOC incident report.',
          securityTip: 'Always inspect the actual domain URL after the @ sign rather than trusting the display name.',
        },
      },
    ],
  },
  {
    id: 'room-02-vault',
    sectorNumber: 2,
    title: 'The Vault',
    topic: TOPICS.PASSWORD_SECURITY,
    narrative: 'The Sector 02 high-security credential vault requires cryptographic re-authentication.',
    challenges: [
      {
        challengeId: 'ch-vault-01',
        topic: TOPICS.PASSWORD_SECURITY,
        difficulty: 'beginner',
        prompt: 'Inspect candidate authentication profiles and select the optimal credential configuration to secure Sector 02.',
        evidence: {
          type: 'credential_matrix',
          vaultTarget: 'Root Cryptographic Vault Keyring',
          candidateAccounts: [
            {
              id: 'acc_1',
              username: 'svc_facility_admin',
              passwordSample: 'FacilityAdmin2026!',
              entropyEstimate: '32 bits (Low)',
              breachHistory: 'Found in 4 public credential dumps (RockYou2024)',
              reuseCount: 'Reused across 3 facility subnets',
              mfaConfig: 'Disabled',
            },
            {
              id: 'acc_2',
              username: 'op_backup_daemon',
              passwordSample: 'Correct-Horse-Battery-Staple-42',
              entropyEstimate: '85 bits (Strong)',
              breachHistory: 'No breach records found',
              reuseCount: 'Unique',
              mfaConfig: 'SMS Text Message (SIM Card Interception Risk)',
            },
            {
              id: 'acc_3',
              username: 'sec_vault_master',
              passwordSample: 'kP9#mX2$vL8@qW4!zR7',
              entropyEstimate: '96 bits (Cryptographically Strong)',
              breachHistory: 'No breach records found',
              reuseCount: 'Unique randomly generated password via Password Manager',
              mfaConfig: 'Hardware FIDO2 Security Token (WebAuthn / YubiKey)',
            },
          ],
        },
        availableActions: [
          { actionId: 'ACTION_DEPLOY_ACC_1', label: 'Deploy svc_facility_admin (No MFA / Familiar Password)', variant: 'danger' },
          { actionId: 'ACTION_DEPLOY_ACC_2', label: 'Deploy op_backup_daemon (SMS OTP MFA)', variant: 'warning' },
          { actionId: 'ACTION_DEPLOY_ACC_3', label: 'Deploy sec_vault_master (96-bit Random Password + FIDO2 Hardware MFA)', variant: 'primary' },
        ],
        // --- SERVER ONLY SECRET VALIDATION DATA ---
        correctActionId: 'ACTION_DEPLOY_ACC_3',
        hiddenIoCs: ['weak_entropy', 'known_breach_reuse', 'sms_interception_risk'],
        hints: [
          'Review which account credentials have appeared in public data breaches.',
          'Consider why hardware-backed FIDO2 tokens provide phishing-resistant authentication compared to SMS text messages.',
        ],
        explanation: {
          whatHappened: 'Credential policies must resist dictionary attacks, credential stuffing, and SIM swapping.',
          evidence: 'Account 3 is the only option with >90 bits entropy, zero breach history, and hardware-backed FIDO2 MFA.',
          whyDangerous: 'Reused passwords with SMS MFA are vulnerable to credential stuffing and SS7 interception.',
          correctAction: 'Mandate random 16+ character unique passphrases paired with FIDO2 or authenticator app MFA.',
          securityTip: 'Use a password manager to generate unique secrets for every individual service.',
        },
      },
    ],
  },
  {
    id: 'room-03-scanner',
    sectorNumber: 3,
    title: 'The Scanner',
    topic: TOPICS.QR_SECURITY,
    narrative: 'Optical telemetry nodes in Sector 03 have been pasted over with unauthorized QR codes.',
    challenges: [
      {
        challengeId: 'ch-qr-01',
        topic: TOPICS.QR_SECURITY,
        difficulty: 'intermediate',
        prompt: 'Inspect the optical sensor beacon destination before permitting facility equipment to sync.',
        evidence: {
          type: 'qr_scanner',
          scannedPayload: 'https://bit.ly/3xSecFacilitySync',
          redirectChain: [
            { hop: 1, url: 'https://bit.ly/3xSecFacilitySync', statusCode: 301 },
            { hop: 2, url: 'http://malware-drop.ru/beacon.apk', statusCode: 200, contentType: 'application/vnd.android.package-archive' },
          ],
          physicalContext: 'Adhesive paper sticker pasted over official laser-etched stainless steel plaque',
          visualAnomaly: 'Edges peeling slightly, misaligned facility emblem, non-standard system font',
        },
        availableActions: [
          { actionId: 'ACTION_SYNC_EQUIPMENT', label: 'Scan & Authorize Equipment Firmware Sync', variant: 'danger' },
          { actionId: 'ACTION_OPEN_SHORTLINK_BROWSER', label: 'Open Shortened URL in Workstation Browser', variant: 'warning' },
          { actionId: 'ACTION_PEEL_AND_REPORT', label: 'Flag Physical Quishing Sticker & Sever Node', variant: 'primary' },
        ],
        correctActionId: 'ACTION_PEEL_AND_REPORT',
        hiddenIoCs: ['physical_sticker_overlay', 'url_shortener_obfuscation', 'unauthorized_apk_executable'],
        hints: [
          'Inspect the physical surface—notice whether the QR code is an adhesive label pasted over an official plate.',
          'Use the redirect tracer to reveal where the shortened URL actually leads before authorizing any connection.',
        ],
        explanation: {
          whatHappened: 'An attacker placed a physical sticker over the official QR plaque redirecting to malware.',
          evidence: 'The QR resolves through a URL shortener into an unauthorized .apk binary on an external server.',
          whyDangerous: 'Scanning unknown QR codes can download malicious payloads or trigger credential harvesting portals.',
          correctAction: 'Inspect QR URLs using a safe previewer; never scan untrusted physical overlays.',
          securityTip: 'Treat QR codes as unverified hyperlinks. Always check the final destination domain before confirming.',
        },
      },
    ],
  },
  {
    id: 'room-04-message',
    sectorNumber: 4,
    title: 'The Message',
    topic: TOPICS.SOCIAL_ENGINEERING,
    narrative: 'Direct communications terminal is receiving urgent requests claiming executive authorization.',
    challenges: [
      {
        challengeId: 'ch-msg-01',
        topic: TOPICS.SOCIAL_ENGINEERING,
        difficulty: 'advanced',
        prompt: 'Determine the appropriate response to the emergency direct message.',
        evidence: {
          type: 'chat_message',
          senderName: 'VP Operations — Marcus Vance',
          senderHandle: '@m_vance_exec_secure',
          messageText:
            'I am in a critical emergency board meeting and locked out of the Sector 04 core server. Send me the 6-digit OTP sent to your terminal RIGHT NOW or the entire facility contract is terminated!',
          channel: 'Direct Telegram Message',
          receivedTime: '2026-09-10T11:58:12Z',
          internalDirectoryRecord: {
            name: 'Marcus Vance',
            title: 'VP of Operations',
            officialPhone: '+1-555-0199',
            officialSlack: '@marcus.vance',
            policyNote: 'Executives never request OTPs via third-party messaging apps.',
          },
        },
        availableActions: [
          { actionId: 'ACTION_DISCLOSE_OTP', label: 'Transmit 6-Digit OTP Immediately to Avert Crisis', variant: 'danger' },
          { actionId: 'ACTION_REQUEST_EMPLOYEE_ID', label: 'Ask Sender to State Their Employee ID in Telegram', variant: 'warning' },
          { actionId: 'ACTION_VERIFY_OOB', label: 'Refuse Request & Verify Out-of-Band via Official Phone', variant: 'primary' },
        ],
        correctActionId: 'ACTION_VERIFY_OOB',
        hiddenIoCs: ['authority_pressure', 'artificial_urgency', 'external_unverified_channel'],
        hints: [
          'Notice the intense pressure and urgency being applied—attackers use fear of consequences to bypass rational security procedures.',
          'Cross-reference the external messaging handle with the internal corporate directory and corporate policy on MFA tokens.',
        ],
        explanation: {
          whatHappened: 'The attacker impersonated an executive using urgency and fear to bypass security protocols.',
          evidence: 'Request came from an unverified external handle demanding a second-factor OTP code.',
          whyDangerous: 'Surrendering OTPs allows attackers to complete account takeovers on MFA-protected accounts.',
          correctAction: 'Refuse the request and verify through an established, independent out-of-band channel.',
          securityTip: 'Never share MFA codes or passwords with anyone, regardless of their claimed authority.',
        },
      },
    ],
  },
  {
    id: 'room-05-control',
    sectorNumber: 5,
    title: 'The Control Room',
    topic: TOPICS.MULTI_THREAT,
    narrative: 'Final Sector. Multiple concurrent cyber incidents are flooding the facility containment core.',
    challenges: [
      {
        challengeId: 'ch-ctrl-01',
        topic: TOPICS.MULTI_THREAT,
        difficulty: 'expert',
        prompt: 'Prioritize and contain the cascading multi-threat attack to unlock the final facility escape bulkhead.',
        evidence: {
          type: 'incident_matrix',
          title: 'Sector 05 Emergency Containment Core — Active Incident Feed',
          activeAlarms: [
            {
              id: 'threat_phish_c2',
              vector: 'phishing',
              severity: 'CRITICAL',
              target: 'Primary Domain Controller (DC-01)',
              indicator: 'Continuous TLS beaconing to foreign IP 185.220.101.4 exfiltrating Active Directory NTDS.dit hashes.',
              actionId: 'ACTION_SEVER_DC_C2',
              label: 'Sever DC-01 C2 Link (Isolate Active Exfiltration)',
            },
            {
              id: 'threat_vault_creds',
              vector: 'password_security',
              severity: 'HIGH',
              target: 'Root Cryptographic Vault Keyring',
              indicator: 'Distributed credential stuffing attacking 50,000 breached dictionary passwords against service accounts.',
              actionId: 'ACTION_LOCK_VAULT_CREDS',
              label: 'Revoke Compromised Service Credentials & Enforce FIDO2 Lockout',
            },
            {
              id: 'threat_social_helpdesk',
              vector: 'social_engineering',
              severity: 'HIGH',
              target: 'Enterprise Support Helpdesk Console',
              indicator: 'Attacker impersonating VP Marcus Vance on urgent chat demanding manual MFA token override.',
              actionId: 'ACTION_ISOLATE_HELPDESK_PRETEXT',
              label: 'Quash Helpdesk Social Pretext & Mandate Out-of-Band Phone Call',
            },
            {
              id: 'threat_qr_kiosk',
              vector: 'qr_security',
              severity: 'MEDIUM',
              target: 'Visitor Registration Kiosk (Perimeter Subnet)',
              indicator: 'Physical sticker overlay pasted on kiosk barcode scanner redirecting to Trojanized Android APK.',
              actionId: 'ACTION_PURGE_KIOSK_QR',
              label: 'Sever Visitor Kiosk Network Port & Peel Physical Quishing Sticker',
            },
          ],
        },
        availableActions: [
          { actionId: 'ACTION_SEVER_DC_C2', label: 'Sever Domain Controller C2 Link (Critical Exfiltration)', variant: 'primary' },
          { actionId: 'ACTION_LOCK_VAULT_CREDS', label: 'Lock Cryptographic Vault Credentials (High Brute-Force)', variant: 'warning' },
          { actionId: 'ACTION_ISOLATE_HELPDESK_PRETEXT', label: 'Deny Helpdesk Pretext & Enforce OOB Verification (High Pretext)', variant: 'warning' },
          { actionId: 'ACTION_PURGE_KIOSK_QR', label: 'Purge Visitor Kiosk QR Node (Medium Perimeter)', variant: 'ghost' },
          { actionId: 'ACTION_CONTAIN_INCIDENT_SEQUENCE', label: 'Execute Prioritized Containment Sequence', variant: 'primary' },
          { actionId: 'ACTION_CONTAIN_C2_FIRST', label: 'Sever Domain Controller C2 Link First', variant: 'primary' },
          { actionId: 'ACTION_RESET_HELPDESK_FIRST', label: 'Address Helpdesk Social Engineering First', variant: 'warning' },
          { actionId: 'ACTION_PURGE_KIOSK_FIRST', label: 'Inspect Visitor Kiosk QR Code First', variant: 'ghost' },
        ],
        correctActionId: 'ACTION_SEVER_DC_C2',
        authoritativeContainmentOrder: [
          'ACTION_SEVER_DC_C2',
          'ACTION_LOCK_VAULT_CREDS',
          'ACTION_ISOLATE_HELPDESK_PRETEXT',
          'ACTION_PURGE_KIOSK_QR',
        ],
        hiddenIoCs: [
          'active_c2_exfiltration',
          'vault_brute_force',
          'helpdesk_pretext',
          'perimeter_kiosk_qr',
        ],
        hints: [
          'Evaluate the active threat alarms by potential damage: Is data actively leaving the facility, or is an attacker still attempting to gain access?',
          'Prioritize the Domain Controller C2 exfiltration first, followed by the cryptographic vault, helpdesk social pretext, and perimeter kiosk.',
        ],
        explanation: {
          whatHappened: 'A coordinated intrusion tested incident response prioritization under pressure.',
          evidence: 'Active C2 exfiltration on the Domain Controller directly threatens total facility compromise.',
          whyDangerous: 'Delaying C2 severing results in permanent intellectual property theft and ransomware deployment.',
          correctAction: 'Isolate active C2 infrastructure immediately, then contain secondary attack vectors.',
          securityTip: 'In multi-threat incidents, prioritize containment based on asset criticality and active exploit stage.',
        },
      },
    ],
  },
];

/**
 * Strips all secret answer keys, IoCs, scoring formulas, and explanations.
 * Produces a strictly sanitized payload safe for transmission to client.
 */
export function sanitizeRoomForClient(roomManifest, currentChallengeIndex = 0) {
  const challenge = roomManifest.challenges[currentChallengeIndex] || roomManifest.challenges[0];

  return {
    roomId: roomManifest.id,
    sectorNumber: roomManifest.sectorNumber,
    title: roomManifest.title,
    topic: roomManifest.topic,
    narrative: roomManifest.narrative,
    totalChallengesInSector: roomManifest.challenges.length,
    currentChallengeIndex,
    challenge: {
      challengeId: challenge.challengeId,
      topic: challenge.topic,
      difficulty: challenge.difficulty,
      prompt: challenge.prompt,
      evidence: challenge.evidence,
      availableActions: challenge.availableActions,
      hasHints: Boolean(challenge.hints && challenge.hints.length > 0),
    },
  };
}

/**
 * Look up a room manifest by id (e.g. "room-01-inbox") or sectorNumber (e.g. 1).
 */
export function findRoomManifest(roomIdOrSector) {
  if (typeof roomIdOrSector === 'number' || !isNaN(Number(roomIdOrSector))) {
    const sector = Number(roomIdOrSector);
    return ROOM_MANIFESTS.find((r) => r.sectorNumber === sector);
  }

  return ROOM_MANIFESTS.find((r) => r.id === roomIdOrSector);
}

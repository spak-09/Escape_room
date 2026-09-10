import { TOPICS, SCORING } from '../../utils/constants.js';

/**
 * Authoritative Challenge Definitions for ROOM 05: THE CONTROL ROOM (Multi-Threat Incident Response).
 * Private validation fields (authoritativeContainmentOrder, privateIndicators, explanation) are kept strictly server-side.
 */
export const ROOM_05_CHALLENGES = [
  {
    challengeId: 'ch-ctrl-01',
    roomId: 'room-05-control',
    topic: TOPICS.MULTI_THREAT,
    difficulty: 'expert',
    prompt: 'Prioritize and contain the cascading multi-threat attack to unlock the final facility escape bulkhead.',
    narrative: 'Final Sector. Multiple concurrent cyber incidents are flooding the facility containment core.',
    sanitizedEvidence: {
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
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: [
      'c2_traffic_analyzer',
      'vault_audit_log',
      'helpdesk_directory_check',
      'kiosk_firmware_scan',
    ],
    allowedActions: [
      { actionId: 'ACTION_SEVER_DC_C2', label: 'Sever Domain Controller C2 Link (Critical Exfiltration)', variant: 'primary' },
      { actionId: 'ACTION_LOCK_VAULT_CREDS', label: 'Lock Cryptographic Vault Credentials (High Brute-Force)', variant: 'warning' },
      { actionId: 'ACTION_ISOLATE_HELPDESK_PRETEXT', label: 'Deny Helpdesk Pretext & Enforce OOB Verification (High Pretext)', variant: 'warning' },
      { actionId: 'ACTION_PURGE_KIOSK_QR', label: 'Purge Visitor Kiosk QR Node (Medium Perimeter)', variant: 'ghost' },
      { actionId: 'ACTION_CONTAIN_INCIDENT_SEQUENCE', label: 'Execute Prioritized Containment Sequence', variant: 'primary' },
      // Aliases for compatibility with earlier manifest definitions
      { actionId: 'ACTION_CONTAIN_C2_FIRST', label: 'Sever Domain Controller C2 Link First', variant: 'primary' },
      { actionId: 'ACTION_RESET_HELPDESK_FIRST', label: 'Address Helpdesk Social Engineering First', variant: 'warning' },
      { actionId: 'ACTION_PURGE_KIOSK_FIRST', label: 'Inspect Visitor Kiosk QR Code First', variant: 'ghost' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    // --- SERVER-AUTHORITATIVE PRIVATE FIELDS ---
    correctActionId: 'ACTION_SEVER_DC_C2',
    authoritativeContainmentOrder: [
      'ACTION_SEVER_DC_C2',
      'ACTION_LOCK_VAULT_CREDS',
      'ACTION_ISOLATE_HELPDESK_PRETEXT',
      'ACTION_PURGE_KIOSK_QR',
    ],
    authoritativeThreatOrder: [
      'threat_phish_c2',
      'threat_vault_creds',
      'threat_social_helpdesk',
      'threat_qr_kiosk',
    ],
    privateIndicators: [
      'active_c2_exfiltration: crown jewel DC-01 data actively leaking to 185.220.101.4',
      'vault_brute_force: secondary active attack requiring high-priority cryptographic revocation',
      'helpdesk_pretext: imminent lateral escalation requiring OOB policy enforcement',
      'perimeter_kiosk_qr: low-impact isolated subnet Trojanized APK download',
    ],
    scoringMetadata: {
      basePoints: SCORING.BASE_POINTS_CONTROL_ROOM, // 1500 points
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'All cascading intrusions contained in optimal triage priority! Domain Controller isolated, vault locked down, social pretext denied, and rogue kiosk purged. Facility lockdown lifted — ESCAPE COMPLETE!',
      onIncorrect: 'Containment prioritization failure! Delaying critical Domain Controller isolation permitted adversarial lateral movement and data exfiltration.',
    },
    fivePartExplanation: {
      whatHappened: 'You selected an inappropriate containment priority or submitted an invalid containment sequence under high-stress multi-threat conditions.',
      evidence: 'The Domain Controller was actively beaconing Active Directory hashes to an external C2 server (Critical), whereas the kiosk QR and secondary vectors posed lower immediate damage.',
      whyDangerous: 'In incident triage, failing to contain active data exfiltration first allows attackers to harvest crown jewel assets permanently.',
      correctAction: 'Prioritize containment based on active data loss and asset criticality: First sever the active C2 exfiltration, then lock down vault credentials, then neutralize social pretexts, and finally purge perimeter QR nodes.',
      securityTip: 'In multi-vector cybersecurity incidents, always triage by: Active Exploit / Data Loss > Crown Jewel Assets > Secondary Vectors > Perimeter Decoys.',
    },
    hints: [
      'Evaluate the active threat alarms by potential damage: Is data actively leaving the facility, or is an attacker still attempting to gain access?',
      'Prioritize the Domain Controller C2 exfiltration first, followed by the cryptographic vault, helpdesk social pretext, and perimeter kiosk.',
    ],
  },
];

/**
 * Finds a Room 05 challenge definition by ID.
 */
export function getRoom05ChallengeById(challengeId) {
  return ROOM_05_CHALLENGES.find((c) => c.challengeId === challengeId);
}

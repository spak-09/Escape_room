import { TOPICS } from '../../utils/constants.js';

/**
 * Authoritative Challenge Definitions for ROOM 01: THE INBOX (Phishing).
 * Private validation fields (correctActionId, hiddenIoCs, explanation) are kept strictly server-side.
 */
export const ROOM_01_CHALLENGES = [
  {
    challengeId: 'ch-phish-01',
    roomId: 'room-01-inbox',
    topic: TOPICS.PHISHING,
    difficulty: 'beginner',
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
    },
    // Investigation artifacts that grant thoroughness bonus when inspected
    valuableArtifacts: ['header_return_path', 'url_inspect', 'spf_check'],
    allowedActions: [
      { actionId: 'ACTION_QUARANTINE', label: 'Quarantine & Report to SOC', variant: 'primary' },
      { actionId: 'ACTION_CLICK_LINK', label: 'Click Link to Sync Session', variant: 'danger' },
      { actionId: 'ACTION_IGNORE', label: 'Ignore Transmission', variant: 'ghost' },
    ],
    // --- SERVER-AUTHORITATIVE PRIVATE FIELDS ---
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
      onCorrect: 'Threat neutralized. Transmission quarantined and domain flagged across facility boundary firewalls.',
      onIncorrect: 'Malicious link accessed! Phishing payload triggered alarm klaxons and logged an unauthorized credential leakage.',
    },
    fivePartExplanation: {
      whatHappened: 'You clicked the simulated password reset link inside an unverified, spoofed message.',
      evidence: 'Sender domain was "micr0soft-update.com" (numeral 0) and the hyperlink targeted a raw foreign IP address (185.220.101.4).',
      whyDangerous: 'Credential harvesters record your workstation credentials, enabling immediate lateral movement across subnets.',
      correctAction: 'Quarantine the email and submit a high-priority incident alert to the SOC.',
      securityTip: 'Always inspect the true destination URL before clicking and navigate to security portals via known bookmarks.',
    },
    hints: [
      'Inspect the sender domain name closely—observe whether any letters have been replaced with numbers.',
      'Check the raw SPF headers and hover over the hyperlink to compare the display text with the actual destination URL.',
    ],
  },
];

/**
 * Finds a Room 01 challenge definition by ID.
 */
export function getRoom01ChallengeById(challengeId) {
  return ROOM_01_CHALLENGES.find((c) => c.challengeId === challengeId);
}

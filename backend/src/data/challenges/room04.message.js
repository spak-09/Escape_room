import { TOPICS } from '../../utils/constants.js';

/**
 * Authoritative Challenge Definitions for ROOM 04: THE MESSAGE (Social Engineering).
 * Private validation fields (correctActionId, privateIndicators, explanation) are kept strictly server-side.
 */
export const ROOM_04_CHALLENGES = [
  {
    challengeId: 'ch-msg-01',
    roomId: 'room-04-message',
    topic: TOPICS.SOCIAL_ENGINEERING,
    difficulty: 'advanced',
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
    // --- SERVER-AUTHORITATIVE PRIVATE FIELDS ---
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
    hints: [
      'Notice the intense pressure and urgency being applied—attackers use fear of consequences to bypass rational security procedures.',
      'Cross-reference the external messaging handle with the internal corporate directory and corporate policy on MFA tokens.',
    ],
  },
];

/**
 * Finds a Room 04 challenge definition by ID.
 */
export function getRoom04ChallengeById(challengeId) {
  return ROOM_04_CHALLENGES.find((c) => c.challengeId === challengeId);
}

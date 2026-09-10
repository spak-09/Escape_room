import { TOPICS } from '../../utils/constants.js';

/**
 * Authoritative Challenge Definitions for ROOM 02: THE VAULT (Password Security & MFA).
 * Private validation fields (correctActionId, privateIndicators, explanation) are kept strictly server-side.
 */
export const ROOM_02_CHALLENGES = [
  {
    challengeId: 'ch-vault-01',
    roomId: 'room-02-vault',
    topic: TOPICS.PASSWORD_SECURITY,
    difficulty: 'beginner',
    prompt: 'Inspect candidate authentication profiles and select the optimal credential configuration to secure Sector 02.',
    sanitizedEvidence: {
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
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['entropy_calculator', 'breach_database_check', 'mfa_evaluation'],
    allowedActions: [
      { actionId: 'ACTION_DEPLOY_ACC_1', label: 'Deploy svc_facility_admin (No MFA / Familiar Password)', variant: 'danger' },
      { actionId: 'ACTION_DEPLOY_ACC_2', label: 'Deploy op_backup_daemon (SMS OTP MFA)', variant: 'warning' },
      { actionId: 'ACTION_DEPLOY_ACC_3', label: 'Deploy sec_vault_master (96-bit Random Password + FIDO2 Hardware MFA)', variant: 'primary' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    // --- SERVER-AUTHORITATIVE PRIVATE FIELDS ---
    correctActionId: 'ACTION_DEPLOY_ACC_3',
    privateIndicators: [
      'dictionary_pattern: common alphanumeric pattern in public dumps',
      'password_reuse: shared credentials across 3 distinct subnets',
      'sms_vulnerability: SMS OTP vulnerable to SS7 and SIM swapping',
    ],
    scoringMetadata: {
      basePoints: 500,
      targetTimeSeconds: 35,
    },
    consequenceData: {
      onCorrect: 'Cryptographic vault unlocked! High-entropy master key and FIDO2 hardware MFA established. Sector 02 secured.',
      onIncorrect: 'Authentication breach! Reused or weakly protected credentials permitted simulated credential-stuffing penetration.',
    },
    fivePartExplanation: {
      whatHappened: 'You selected an authentication profile containing breached credentials or vulnerable SMS-based MFA.',
      evidence: 'Account 1 reused a password listed in public dumps, while Account 2 relied on SMS which is vulnerable to SIM swap attacks.',
      whyDangerous: 'Reused passwords allow automated credential stuffing attacks, and SMS codes can be intercepted over cellular networks.',
      correctAction: 'Mandate unique high-entropy credentials stored in a password manager paired with hardware (FIDO2) or TOTP app-based MFA.',
      securityTip: 'Never reuse passwords across services, and upgrade from SMS verification to authenticator apps or physical security keys.',
    },
    hints: [
      'Review which account credentials have appeared in public data breaches.',
      'Consider why hardware-backed FIDO2 tokens provide phishing-resistant authentication compared to SMS text messages.',
    ],
  },
];

/**
 * Finds a Room 02 challenge definition by ID.
 */
export function getRoom02ChallengeById(challengeId) {
  return ROOM_02_CHALLENGES.find((c) => c.challengeId === challengeId);
}

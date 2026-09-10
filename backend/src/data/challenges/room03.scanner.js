import { TOPICS } from '../../utils/constants.js';

/**
 * Authoritative Challenge Definitions for ROOM 03: THE SCANNER (QR Security & Quishing).
 * Private validation fields (correctActionId, privateIndicators, explanation) are kept strictly server-side.
 */
export const ROOM_03_CHALLENGES = [
  {
    challengeId: 'ch-qr-01',
    roomId: 'room-03-scanner',
    topic: TOPICS.QR_SECURITY,
    difficulty: 'intermediate',
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
    // --- SERVER-AUTHORITATIVE PRIVATE FIELDS ---
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
      onCorrect: 'Quishing attack neutralized! Malicious physical sticker identified, malicious APK download prevented, and optical sensor node secured.',
      onIncorrect: 'Malicious payload executed! Scanning the rogue QR code triggered an unauthorized APK download to facility equipment.',
    },
    fivePartExplanation: {
      whatHappened: 'An adversary pasted a rogue QR code sticker over an official scanner plaque to trick personnel into downloading a Trojanized APK.',
      evidence: 'The physical sticker was peeling over the metal plaque, and tracing the shortened Bitly link revealed an unencrypted redirect to "malware-drop.ru/beacon.apk".',
      whyDangerous: 'QR codes hide the true destination URL. Scanning unverified codes can trigger drive-by downloads or credential phishing portals.',
      correctAction: 'Never scan unexpected or physically overlaid QR codes. Use a safe QR reader that displays full destination URLs, or navigate directly via official portals.',
      securityTip: 'Treat QR codes like unverified hyperlinks. Check for physical tampering and always verify the final expanded domain before taking action.',
    },
    hints: [
      'Inspect the physical surface—notice whether the QR code is an adhesive label pasted over an official plate.',
      'Use the redirect tracer to reveal where the shortened URL actually leads before authorizing any connection.',
    ],
  },
];

/**
 * Finds a Room 03 challenge definition by ID.
 */
export function getRoom03ChallengeById(challengeId) {
  return ROOM_03_CHALLENGES.find((c) => c.challengeId === challengeId);
}

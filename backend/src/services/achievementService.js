import { Achievement } from '../models/Achievement.js';
import { ChallengeAttempt } from '../models/ChallengeAttempt.js';
import { GAME_STATUS, INITIAL_LIVES } from '../utils/constants.js';

export const BADGE_DEFINITIONS = {
  CYBER_GUARDIAN: {
    badgeCode: 'CYBER_GUARDIAN',
    title: 'Cyber Guardian',
    description: 'Successfully completed the facility escape and neutralized all cyber threats.',
  },
  ZERO_MISTAKE_ESCAPE: {
    badgeCode: 'ZERO_MISTAKE_ESCAPE',
    title: 'Flawless Security Operator',
    description: 'Escaped the facility with full operational integrity without losing a single life.',
  },
  PHISHING_EXPERT: {
    badgeCode: 'PHISHING_EXPERT',
    title: 'Phishing Detection Specialist',
    description: 'Demonstrated flawless identification of email deception in Sector 01.',
  },
  SECURE_AUTHENTICATOR: {
    badgeCode: 'SECURE_AUTHENTICATOR',
    title: 'Cryptographic Defender',
    description: 'Mandated high-entropy credentials and hardware FIDO2 authentication in Sector 02.',
  },
  QR_DETECTIVE: {
    badgeCode: 'QR_DETECTIVE',
    title: 'Optical Threat Detective',
    description: 'Identified physical quishing sticker tampering and malicious redirects in Sector 03.',
  },
  SOCIAL_SHIELD: {
    badgeCode: 'SOCIAL_SHIELD',
    title: 'Social Engineering Shield',
    description: 'Defended administrative authentication tokens against urgent executive pretexts in Sector 04.',
  },
  MULTI_THREAT_MASTER: {
    badgeCode: 'MULTI_THREAT_MASTER',
    title: 'Incident Response Commander',
    description: 'Successfully triaged and contained concurrent multi-vector intrusions in Sector 05.',
  },
};

/**
 * Authoritatively evaluates session attempt history and awards unlocked achievements.
 */
export async function evaluateAndAwardAchievements(session) {
  if (session.status !== GAME_STATUS.COMPLETED) {
    return [];
  }

  const userId = session.userId;
  const attempts = await ChallengeAttempt.find({ sessionId: session._id });

  const earnedBadges = [];

  // 1. Cyber Guardian (Always awarded upon full escape)
  earnedBadges.push(BADGE_DEFINITIONS.CYBER_GUARDIAN);

  // 2. Incident Response Commander (Awarded upon clearing Room 05)
  earnedBadges.push(BADGE_DEFINITIONS.MULTI_THREAT_MASTER);

  // 3. Zero Mistake Escape (Full lives preserved)
  if (session.livesRemaining === INITIAL_LIVES) {
    earnedBadges.push(BADGE_DEFINITIONS.ZERO_MISTAKE_ESCAPE);
  }

  // Helper to count mistakes in a specific room
  const mistakesInRoom = (roomId) =>
    attempts.filter((a) => a.roomId === roomId && !a.isCorrect).length;

  // 4. Sector 01 (Phishing) Expert
  if (mistakesInRoom('room-01-inbox') === 0) {
    earnedBadges.push(BADGE_DEFINITIONS.PHISHING_EXPERT);
  }

  // 5. Sector 02 (Password/MFA) Authenticator
  if (mistakesInRoom('room-02-vault') === 0) {
    earnedBadges.push(BADGE_DEFINITIONS.SECURE_AUTHENTICATOR);
  }

  // 6. Sector 03 (QR) Detective
  if (mistakesInRoom('room-03-scanner') === 0) {
    earnedBadges.push(BADGE_DEFINITIONS.QR_DETECTIVE);
  }

  // 7. Sector 04 (Social) Shield
  if (mistakesInRoom('room-04-message') === 0) {
    earnedBadges.push(BADGE_DEFINITIONS.SOCIAL_SHIELD);
  }

  // Persist newly earned badges without duplicates
  const awardedBadgeCodes = [];

  for (const badge of earnedBadges) {
    awardedBadgeCodes.push(badge.badgeCode);
    const existing = await Achievement.findOne({ userId, badgeCode: badge.badgeCode });

    if (!existing) {
      await Achievement.create({
        userId,
        badgeCode: badge.badgeCode,
        title: badge.title,
        description: badge.description,
        earnedAt: new Date(),
      });
    }
  }

  return awardedBadgeCodes;
}

/**
 * Authoritative badge presentation metadata mapped to server badge codes.
 */
export const BADGE_METADATA = {
  CYBER_GUARDIAN: {
    badgeCode: 'CYBER_GUARDIAN',
    title: 'Cyber Guardian',
    description: 'Successfully completed the facility escape and neutralized all cyber threats.',
    rarity: 'LEGENDARY',
    color: 'emerald',
  },
  ZERO_MISTAKE_ESCAPE: {
    badgeCode: 'ZERO_MISTAKE_ESCAPE',
    title: 'Flawless Security Operator',
    description: 'Escaped the facility with full operational integrity without losing a single life.',
    rarity: 'MYTHIC',
    color: 'amber',
  },
  PHISHING_EXPERT: {
    badgeCode: 'PHISHING_EXPERT',
    title: 'Phishing Detection Specialist',
    description: 'Demonstrated flawless identification of email deception in Sector 01.',
    rarity: 'ELITE',
    color: 'cyan',
  },
  SECURE_AUTHENTICATOR: {
    badgeCode: 'SECURE_AUTHENTICATOR',
    title: 'Cryptographic Defender',
    description: 'Mandated high-entropy credentials and hardware FIDO2 authentication in Sector 02.',
    rarity: 'ELITE',
    color: 'amber',
  },
  QR_DETECTIVE: {
    badgeCode: 'QR_DETECTIVE',
    title: 'Optical Threat Detective',
    description: 'Identified physical quishing sticker tampering and malicious redirects in Sector 03.',
    rarity: 'ELITE',
    color: 'cyan',
  },
  SOCIAL_SHIELD: {
    badgeCode: 'SOCIAL_SHIELD',
    title: 'Social Engineering Shield',
    description: 'Defended administrative authentication tokens against urgent executive pretexts in Sector 04.',
    rarity: 'ELITE',
    color: 'pink',
  },
  MULTI_THREAT_MASTER: {
    badgeCode: 'MULTI_THREAT_MASTER',
    title: 'Incident Response Commander',
    description: 'Successfully triaged and contained concurrent multi-vector intrusions in Sector 05.',
    rarity: 'LEGENDARY',
    color: 'crimson',
  },
};

export function getBadgeInfo(badgeCode) {
  if (typeof badgeCode === 'object' && badgeCode !== null) {
    const code = badgeCode.badgeCode || badgeCode.code || '';
    return {
      ...(BADGE_METADATA[code] || {
        badgeCode: code,
        title: badgeCode.title || code,
        description: badgeCode.description || 'Facility Achievement Unlocked',
        rarity: 'SPECIAL',
        color: 'cyan',
      }),
      earnedAt: badgeCode.earnedAt,
    };
  }

  return (
    BADGE_METADATA[badgeCode] || {
      badgeCode,
      title: badgeCode?.replace(/_/g, ' ') || 'Achievement Unlocked',
      description: 'Facility Achievement Unlocked',
      rarity: 'SPECIAL',
      color: 'cyan',
    }
  );
}

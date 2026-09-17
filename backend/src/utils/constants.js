export const GAME_STATUS = Object.freeze({
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  ABANDONED: 'ABANDONED',
});

export const INITIAL_LIVES = 3;
export const MAX_ROOMS = 5;

export const SCORING = Object.freeze({
  BASE_POINTS_STANDARD: 500,
  BASE_POINTS_CONTROL_ROOM: 1500,
  HINT_PENALTY: 75,
  MISTAKE_PENALTY: 150,
  MIN_CHALLENGE_SCORE: 50,
  MAX_TIME_BONUS: 200,
});

export const TOPICS = Object.freeze({
  PHISHING: 'phishing',
  PASSWORD_SECURITY: 'password_security',
  QR_SECURITY: 'qr_security',
  SOCIAL_ENGINEERING: 'social_engineering',
  MULTI_THREAT: 'multi_threat',
});

export const INTERVENTION_LEVELS = Object.freeze({
  LEVEL_1_NONE: 1,
  LEVEL_2_CONTEXTUAL_EXPLANATION: 2,
  LEVEL_3_MICRO_TUTORIAL: 3,
  LEVEL_4_GUIDED_RETRY: 4,
});

export const USER_ROLES = Object.freeze({
  PLAYER: 'player',
  ADMIN: 'admin',
});

export const DIFFICULTY_LEVELS = Object.freeze({
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  EXPERT: 'expert',
});

export const DIFFICULTY_QUESTION_COUNTS = Object.freeze({
  beginner: { perRoom: 1, total: 5 },
  intermediate: { perRoom: 3, total: 15 },
  expert: { perRoom: 10, total: 50 },
});

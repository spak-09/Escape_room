# DOCUMENTATION CONSISTENCY FINAL REFERENCE
## Digital Safety Escape Room — Canonical Frontend Developer Guide

---

This document represents the **authoritative, contradiction-free specification** for frontend development. Every data contract, route behavior, state boundary, and error code recorded here directly reflects the **frozen and verified backend engine**.

---

### 1. Canonical API Base URL

* **Development API Base URL**: `http://localhost:5000/api/v1`
* **Vite Environment Variable**: `VITE_API_BASE_URL` (configured in `/frontend/.env`)
* **Transport Protocol**: RESTful JSON over HTTP/1.1 (HTTPS in production)
* **Axios Configuration**:
  ```javascript
  import axios from 'axios';

  export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
    withCredentials: true, // Mandatory for HttpOnly refreshToken cookie
    headers: {
      'Content-Type': 'application/json',
    },
  });
  ```
* **Axios Interceptor Unwrapping Contract**:
  - `api.interceptors.response.use((response) => response.data, ...)`
  - Calling `const res = await api.get('/session/active')` delivers the server envelope `{ success: true, data: { session: ... } }`.
  - Calling `res.data` accesses the payload.

---

### 2. Authentication Contract

#### Token Storage & Lifecycle
* **Access Token**: Short-lived (15 minutes). Held **strictly in module memory** (`AuthContext`). Never written to `localStorage` or `sessionStorage`.
* **Refresh Token**: Long-lived (7 days). Stored in a secure `HttpOnly`, `SameSite=Strict`, `Path=/`, `Secure` (in production) cookie named `refreshToken`.
* **User Object Shape**:
  ```json
  {
    "_id": "66e01234567890abcdef1234",
    "username": "CadetAlpha",
    "email": "alpha@facility.mil",
    "role": "player",
    "createdAt": "2026-09-10T12:00:00.000Z",
    "updatedAt": "2026-09-10T12:00:00.000Z"
  }
  ```
  *(Note: The server returns `_id`. Frontend `AuthContext` provides a convenience getter `id = user._id`)*.

#### Endpoints

| Method | Endpoint | Auth | Request Body | Response Payload (`res.data`) |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | None | `{ username, email, password }` | `{ user, accessToken }` (Sets cookie) |
| `POST` | `/api/v1/auth/login` | None | `{ email, password }` | `{ user, accessToken }` (Sets cookie) |
| `POST` | `/api/v1/auth/refresh` | Cookie | None | `{ accessToken }` |
| `POST` | `/api/v1/auth/logout` | None* | None | `{ message: "Security session ended. Logged out successfully." }` (Clears cookie) |
| `GET` | `/api/v1/auth/me` | Bearer | None | `{ user }` |

*\*Logout does not mount `authMiddleware` so expired tokens do not block clearing the cookie.*

#### Automatic Refresh Interceptor Flow
```javascript
let isRefreshing = false;
let failedQueue = [];

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/login')) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newAccessToken = refreshResponse.data.data.accessToken;
        setInMemoryAccessToken(newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        clearInMemoryAccessToken();
        window.dispatchEvent(new CustomEvent('auth:expired'));
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error.response?.data?.error || error);
  }
);
```

---

### 3. Route Contract

| Path | Component | Tier / Guard | Condition / Behavior |
| :--- | :--- | :--- | :--- |
| `/` | `LandingPage.jsx` | Public | Public showcase and CTA to enter |
| `/auth` | `AuthPage.jsx` | Public | Login / Register terminal tabs |
| `/leaderboard` | `LeaderboardPage.jsx` | Public | Global verified rankings |
| `/dashboard` | `DashboardPage.jsx` | `ProtectedRoute` | Requires authenticated player (`user !== null`) |
| `/assessment` | `AssessmentPage.jsx` | `ProtectedRoute` | 4-topic baseline confidence survey |
| `/facility-entry` | `FacilityIntroPage.jsx` | `AssessmentGuard` | Requires auth + completed assessment |
| `/game/room/:roomId`| `GameRoomPage.jsx` | `GameGuard` | Requires active `IN_PROGRESS` session matching sector |
| `/game/escape-result/:sessionId` | `EscapeResultPage.jsx` | `ProtectedRoute` | Final performance report and badge shelf |
| `*` | `NotFoundPage.jsx` | Public | Monospaced 404 terminal diagnostic |

---

### 4. Session Contract

#### Session Model & Fields
* **Primary Key**: `session._id` (Mongoose ObjectId). The frontend should normalize:
  `sessionId = session._id || session.sessionId`.
* **Progression Index**: `currentRoomIndex` is **1-indexed** (1 to 5).
* **Challenge Index**: `currentChallengeIndex` is **0-indexed**.
* **Lives Pool**: `livesRemaining` (Integer 0 to 3).
* **Score Counter**: `currentScore` (Integer, non-negative).
* **Hints History**: `hintsUsed` (Array of Strings: `['ch-phish-01']`).
* **Session Status**: `'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'ABANDONED'`.

#### Endpoints
* `POST /api/v1/session/start`:
  - Returns `201 Created` with `{ session, isResumed: false, message }` if new.
  - Returns `200 OK` with `{ session, isResumed: true, message }` if resuming existing active run.
* `GET /api/v1/session/active`:
  - Returns `200 OK` with `{ session }`.
  - Returns `404 Not Found` with `ACTIVE_SESSION_NOT_FOUND` if no active playthrough.
* `POST /api/v1/session/abandon`:
  - Request body: `{ sessionId: string }` (optional, falls back to active).
  - Returns `200 OK` with `{ session, message }` (sets status to `ABANDONED`).

---

### 5. Room Contract

#### Sector Identification & Order
1. Sector 1: `room-01-inbox` (The Inbox — Phishing & Domain Spoofing)
2. Sector 2: `room-02-vault` (The Vault — Credential Hygiene & MFA)
3. Sector 3: `room-03-scanner` (The Scanner — Quishing & Optical Integrity)
4. Sector 4: `room-04-message` (The Message — Social Engineering & Pretexting)
5. Sector 5: `room-05-control` (The Control Room — Multi-Threat Incident Response)

#### Fetching Sector Data
* `GET /api/v1/rooms/:roomId?sessionId=xxx`
* Response payload (`res.data`):
  ```json
  {
    "id": "room-01-inbox",
    "sectorNumber": 1,
    "title": "The Inbox",
    "topic": "phishing",
    "narrative": "A critical terminal has been intercepted...",
    "currentChallenge": {
      "challengeId": "ch-phish-01",
      "topic": "phishing",
      "difficulty": "beginner",
      "prompt": "Inspect the newly arrived IT security advisory...",
      "evidence": { ... },
      "availableActions": [
        { "actionId": "ACTION_QUARANTINE", "label": "Quarantine & Report Phishing", "variant": "primary" },
        { "actionId": "ACTION_CLICK_LINK", "label": "Click Link to Sync Session", "variant": "danger" },
        { "actionId": "ACTION_IGNORE", "label": "Ignore Transmission", "variant": "ghost" }
      ]
    },
    "session": {
      "sessionId": "66e01234567890abcdef1234",
      "livesRemaining": 3,
      "currentScore": 0,
      "currentRoomIndex": 1
    }
  }
  ```
* **Progression Guard**: Requesting Sector $M$ when `currentRoomIndex < M` returns HTTP 403 `PREREQUISITES_INCOMPLETE`.

---

### 6. Challenge Submission Contract

* `POST /api/v1/challenges/:id/submit`
* Request Body:
  ```json
  {
    "sessionId": "66e01234567890abcdef1234",
    "actionId": "ACTION_QUARANTINE",
    "containmentSequence": ["ACTION_SEVER_DC_C2", "..."], // Optional (Room 05)
    "inspectedArtifacts": ["header_spf", "link_hover"],   // Optional
    "timeElapsedSeconds": 14                               // Optional
  }
  ```

#### Outcome A: Correct Decision (Rooms 01–04)
```json
{
  "isCorrect": true,
  "consequence": "Threat neutralized. Transmission flagged as malicious.",
  "scoreDelta": 500,
  "currentScore": 500,
  "livesRemaining": 3,
  "roomCompleted": true,
  "nextRoomIndex": 2,
  "escapeCompleted": false,
  "gameStatus": "IN_PROGRESS",
  "completionTime": null,
  "isLeaderboardEligible": false,
  "investigationBonusAwarded": false
}
```

#### Outcome B: Incorrect Decision (Rooms 01–05)
```json
{
  "isCorrect": false,
  "consequence": "Dangerous action executed! Phishing payload detonated.",
  "lifeDelta": -1,
  "livesRemaining": 2,
  "gameOver": false,
  "reason": null,
  "intervention": {
    "level": 2,
    "type": "CONTEXTUAL_EXPLANATION",
    "payload": {
      "whatHappened": "The incoming transmission used an unauthorized lookalike domain...",
      "evidence": "Sender domain was 'micr0soft-update.com' with numeral 0...",
      "whyDangerous": "Clicking routes to an attacker-controlled harvest terminal...",
      "correctAction": "Quarantine communication and file SOC incident report...",
      "securityTip": "Always inspect the actual domain URL after the @ sign..."
    },
    "context": {
      "topic": "phishing",
      "difficulty": "beginner",
      "historicalMistakes": 1,
      "hintsUsed": 0,
      "selfConfidenceRating": 4,
      "overconfidenceDetected": false
    }
  },
  "containedThreats": []
}
```

#### Outcome C: Room 05 Intermediate Containment Step
```json
{
  "isCorrect": true,
  "stepCompleted": true,
  "roomCompleted": false,
  "isFullyContained": false,
  "threatContained": "threat_phish_c2",
  "containedThreats": ["threat_phish_c2"],
  "remainingThreats": 3,
  "consequence": "Contained threat threat_phish_c2. C2 beacon severed!",
  "scoreDelta": 250,
  "currentScore": 1750,
  "livesRemaining": 3
}
```

#### Outcome D: Room 05 Final Facility Escape
```json
{
  "isCorrect": true,
  "consequence": "All 4 incident vectors contained. Lockdown override engaged!",
  "scoreDelta": 1500,
  "currentScore": 3250,
  "livesRemaining": 3,
  "roomCompleted": true,
  "nextRoomIndex": 5,
  "isFullyContained": true,
  "escapeCompleted": true,
  "gameStatus": "COMPLETED",
  "completionTime": "2026-09-10T12:15:00.000Z",
  "isLeaderboardEligible": true,
  "badgesEarned": ["CYBER_GUARDIAN", "ZERO_MISTAKE_ESCAPE", "MULTI_THREAT_MASTER"],
  "investigationBonusAwarded": true,
  "containedThreats": ["threat_phish_c2", "threat_vault_creds", "threat_social_helpdesk", "threat_qr_kiosk"]
}
```

---

### 7. Hint Contract

* `POST /api/v1/challenges/:id/hint`
* Request Body: `{ sessionId: "66e01234567890abcdef1234" }`
* Response Payload (`res.data`):
  ```json
  {
    "challengeId": "ch-phish-01",
    "hint": "Examine the sender root domain carefully—notice the number instead of a letter.",
    "hintsUsed": ["ch-phish-01"],
    "scorePenalty": 75,
    "currentScore": 425,
    "hintsRemainingInChallenge": 0
  }
  ```

---

### 8. Learning Intervention Contract

The backend adaptive learning engine evaluates mistakes against the player's self-reported confidence:

* **Level 1 (`1`, type: `'NONE'`):** 0 mistakes. Player proceeds with uninterrupted flow.
* **Level 2 (`2`, type: `'CONTEXTUAL_EXPLANATION'`):** 1 isolated mistake with normal/high confidence ($>2$). Triggers 5-part debrief modal.
* **Level 3 (`3`, type: `'MICRO_TUTORIAL'`):** 2 cumulative mistakes in topic OR 1 mistake with low confidence ($\le 2$). Triggers micro-tutorial drawer.
* **Level 4 (`4`, type: `'GUIDED_RETRY'`):** $\ge 3$ mistakes in topic or $\ge 4$ attempts. Disables known wrong options and provides step-by-step guidance.

#### Authoritative 5-Part Debrief Structure:
1. `whatHappened`: Plain-English diagnosis of the misstep.
2. `evidence`: Concrete IoC that was missed or misinterpreted.
3. `whyDangerous`: Operational facility consequence in real terms.
4. `correctAction`: Protocol-compliant remediation step.
5. `securityTip`: Universal cybersecurity takeaway for real life.

---

### 9. Performance Report Contract

* `GET /api/v1/reports/:sessionId` (requires authentication and session ownership)
* Generated only for `COMPLETED` sessions (in-progress sessions return 400 `REPORT_NOT_AVAILABLE`).
* Response Payload (`res.data`):
  ```json
  {
    "sessionId": "66e01234567890abcdef1234",
    "userId": "66e09876543210fedcba4321",
    "status": "COMPLETED",
    "overallScore": 3250,
    "finalScore": 3250,
    "accuracy": 83,
    "accuracyPercentage": 83,
    "livesRemaining": 2,
    "completionTime": "2026-09-10T12:15:00.000Z",
    "totalDurationSeconds": 480,
    "challengesCompleted": 5,
    "hintsUsed": 1,
    "hintsUsedCount": 1,
    "mistakes": 1,
    "totalMistakes": 1,
    "topicMastery": {
      "phishing": 100,
      "password_security": 50,
      "qr_security": 100,
      "social_engineering": 100,
      "multi_threat": 100,
      "passwordSecurity": 50,
      "qrSecurity": 100,
      "socialEngineering": 100,
      "multiThreat": 100
    },
    "topicScores": {
      "phishing": 100,
      "passwordSecurity": 50,
      "qrSecurity": 100,
      "socialEngineering": 100,
      "multiThreat": 100
    },
    "strongestSkill": "phishing",
    "weakestSkill": "password_security",
    "primaryVulnerability": "password_security",
    "personalizedRecommendation": "Mandate unique, random 16+ character passphrases stored in a password manager...",
    "personalizedActionableRecommendation": "Mandate unique, random 16+ character passphrases stored in a password manager...",
    "badgesEarned": ["CYBER_GUARDIAN", "MULTI_THREAT_MASTER"]
  }
  ```

---

### 10. Dashboard Contract

* `GET /api/v1/dashboard/summary`
* Response Payload (`res.data`):
  ```json
  {
    "userId": "66e09876543210fedcba4321",
    "username": "CadetAlpha",
    "email": "alpha@facility.mil",
    "activeSession": {
      "sessionId": "66e01234567890abcdef1234",
      "currentRoomIndex": 3,
      "currentRoomId": "room-03-scanner",
      "currentScore": 1250,
      "livesRemaining": 3,
      "startTime": "2026-09-10T12:00:00.000Z",
      "hintsUsedCount": 0
    },
    "currentRoom": "room-03-scanner",
    "overallProgress": 40,
    "currentScore": 1250,
    "currentLives": 3,
    "bestScore": 9500,
    "totalEscapes": 1,
    "totalSessions": 2,
    "gameHistory": [
      {
        "sessionId": "66e0pastrun00000000000001",
        "status": "COMPLETED",
        "finalScore": 9500,
        "currentScore": 9500,
        "livesRemaining": 3,
        "currentRoomIndex": 5,
        "startTime": "2026-09-09T10:00:00.000Z",
        "completionTime": "2026-09-09T10:12:00.000Z",
        "durationSeconds": 720,
        "date": "2026-09-09T10:12:00.000Z"
      }
    ],
    "achievements": [
      {
        "badgeCode": "CYBER_GUARDIAN",
        "title": "Cyber Guardian",
        "description": "Successfully completed the facility escape and neutralized all cyber threats.",
        "earnedAt": "2026-09-09T10:12:00.000Z"
      }
    ],
    "topicPerformance": {
      "phishing": 100,
      "password_security": 100,
      "qr_security": 100,
      "social_engineering": 100,
      "multi_threat": 100,
      "passwordSecurity": 100,
      "qrSecurity": 100,
      "socialEngineering": 100,
      "multiThreat": 100
    }
  }
  ```

---

### 11. Leaderboard Contract

* `GET /api/v1/leaderboard?page=1&limit=50`
* Public access (no auth required).
* Response Payload (`res.data`):
  ```json
  {
    "totalEntries": 42,
    "page": 1,
    "limit": 50,
    "totalPages": 1,
    "leaderboard": [
      {
        "rank": 1,
        "id": "66e0lead0000000000000001",
        "sessionId": "66e0sess0000000000000001",
        "userId": "66e0user0000000000000001",
        "username": "ZeroDayNinja",
        "finalScore": 9850,
        "totalDurationSeconds": 412,
        "accuracyPercentage": 100,
        "livesRemaining": 3,
        "badgesEarned": ["CYBER_GUARDIAN", "ZERO_MISTAKE_ESCAPE", "MULTI_THREAT_MASTER"],
        "recordedAt": "2026-09-10T11:00:00.000Z",
        "isVerified": true
      }
    ]
  }
  ```
* **Sorting Principle**: Server authoritatively sorts by `finalScore DESC`, then `totalDurationSeconds ASC`. Frontend must **never** re-sort rankings.

---

### 12. Error Contract & Status Codes

All errors conform strictly to:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE_STRING",
    "message": "Human-readable description of error.",
    "details": null
  }
}
```

| HTTP Status | Code | Description | Frontend Handling |
| :--- | :--- | :--- | :--- |
| **400** | `VALIDATION_ERROR` | Request body failed Zod schema | Highlight invalid form fields |
| **400** | `INVALID_IDENTIFIER` | Malformed ObjectId string | Show terminal error toast |
| **400** | `REPORT_NOT_AVAILABLE`| Session not in `COMPLETED` state | Redirect to active game or dashboard |
| **401** | `TOKEN_EXPIRED` | 15-minute access token expired | Interceptor triggers `/auth/refresh` |
| **401** | `TOKEN_INVALID` / `TOKEN_MISSING` | Bad token signature or missing | Clear session; redirect to `/auth` |
| **401** | `INVALID_CREDENTIALS` | Bad email or password | Show red credential error banner |
| **403** | `PREREQUISITES_INCOMPLETE` | Attempting to enter sealed sector | Play sealed door sound; keep in current sector |
| **403** | `NO_ACTIVE_SESSION` | Accessing room without session | Call `POST /session/start` or redirect to `/assessment` |
| **403** | `FORBIDDEN_REPORT_ACCESS` | Accessing another cadet's run | Show permission denied alert; go to `/dashboard` |
| **404** | `ROOM_NOT_FOUND` | Non-existent sector ID | Navigate to `/dashboard` |
| **404** | `ACTIVE_SESSION_NOT_FOUND` | No active game in progress | Prompt player to start new facility escape |
| **409** | `CHALLENGE_ALREADY_COMPLETED` | Duplicate submission | Advance UI to next challenge or door |
| **409** | `SESSION_LOCKED` | Submitting on completed/failed game | Lock inputs; present final debrief/game over |
| **429** | `RATE_LIMIT_EXCEEDED` | Exceeded 120/min or 30 actions/min | Disable submit for 10s; display cooldown toast |
| **500** | `INTERNAL_SERVER_ERROR` | Uncaught server exception | Show glitch error modal with retry button |
| **503** | `SERVICE_UNAVAILABLE` | Database reconnecting | Axios interceptor retries with backoff |

---

### 13. Server-Authoritative State Rules

The following values are **sacrosanct server state**. The frontend must **NEVER** calculate, predict, or mutate these client-side:

1. **Score**: Never add points locally upon button click. Always replace `currentScore` with `res.data.currentScore`.
2. **Lives**: Never decrement hearts on client click. Always update heart icons using `res.data.livesRemaining`.
3. **Room Clearance**: Never unlock a sector door locally. Only advance viewport when `res.data.roomCompleted === true` and navigate to `res.data.nextRoomIndex`.
4. **Challenge Correctness**: No answer keys exist in frontend code. Correctness is strictly determined by `res.data.isCorrect`.
5. **Escape Completion**: Only transition session to completed state when `res.data.escapeCompleted === true`.
6. **Achievements**: Badges are awarded solely by the backend in `res.data.badgesEarned`.
7. **Leaderboard Positions**: Ranks are computed by MongoDB query order (`rank: skip + index + 1`).

---

### 14. Client-Only UI State Rules

The following states belong purely to local React components:

1. **Inspection Panels**: Which evidence tab is currently visible (e.g. Email body vs Headers vs URL Inspector).
2. **Modal Visibility**: `isConsequenceModalOpen`, `isHintConfirmOpen`, `isDebriefDrawerOpen`.
3. **Form Buffers**: Selected radio button, input buffer on PIN pad before submitting.
4. **Audio & Animation**: `isMuted`, volume level, `prefersReducedMotion` toggle, scanline effect overlay.
5. **Telemetry Timers**: Local stopwatch display during investigation (transmitted as advisory `timeElapsedSeconds`).

---

### 15. Approved Frontend Dependencies

The frontend project is pure **JavaScript (ES Modules + JSX)**. Only the following libraries are installed and approved:

* `react`: `^18.3.1`
* `react-dom`: `^18.3.1`
* `react-router-dom`: `^7.1.5`
* `axios`: `^1.7.9`
* `framer-motion`: `^12.4.3`
* `lucide-react`: `^0.475.0`
* `dompurify`: `^3.2.4`
* `clsx`: `^2.1.1`
* `tailwind-merge`: `^3.0.1`
* `tailwindcss`: `^3.4.17`
* `vite`: `^6.1.0`

**Explicitly Disallowed**: Redux, Zustand, React Query, WebSockets, Socket.io, TypeScript compiler, `@floating-ui/react`.

---

### 16. Remaining Unresolved Issues

**NONE**. All 19 investigated architectural areas have been reconciled, verified against the frozen backend implementation, and confirmed ready for frontend UI construction.

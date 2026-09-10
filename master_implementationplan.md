MASTER IMPLEMENTATION PLAN
Digital Safety Escape Room
1. Project Vision

Digital Safety Escape Room is a story-driven, interactive cybersecurity education platform where users are placed inside a virtual digital-security facility and must solve cybersecurity incidents room by room to escape.

The experience combines:

Narrative + Investigation + Decision Making + Gamification + Adaptive Learning

The player begins with limited lives. They investigate realistic cybersecurity situations, make decisions, receive consequences, learn from mistakes, and progressively unlock the facility.

The application should feel primarily like an interactive escape-room game, not a conventional quiz platform, LMS, or administrative dashboard.

2. Core Product Principles

These principles govern every implementation phase.

Principle 1 — Game before dashboard

The primary product experience is the escape room.

The dashboard exists to support the game rather than becoming the central experience.

Principle 2 — Investigation before answer

Players should inspect evidence before making decisions.

Examples:

Email
→ inspect sender
→ inspect domain
→ inspect link
→ inspect wording
→ make decision

rather than:

Question
→ choose A/B/C
Principle 3 — Learn from mistakes

A wrong decision should not simply say:

Wrong answer.

It should explain:

What happened
+
Evidence
+
Why it was dangerous
+
Correct action
+
Practical security lesson
Principle 4 — Adaptive learning

Players begin with a short cybersecurity knowledge/confidence assessment.

The system should also learn from actual gameplay performance.

The player's self-assessment must not be treated as the final truth.

Example:

Self-confidence: High
Actual performance: Weak

→ Increase learning support

or:

Self-confidence: Low
Actual performance: Strong

→ Reduce unnecessary tutorial intervention
Principle 5 — Preserve immersion

Tutorials, explanations, scoring, lives, and transitions should feel integrated into the escape-room narrative.

The application should avoid becoming a collection of unrelated screens.

Principle 6 — Server-authoritative game integrity

The backend must validate important game state.

The browser must not be trusted to determine:

score
lives
room completion
challenge success
leaderboard position
3. High-Level User Journey
PUBLIC WEBSITE
      ↓
ENTER THE FACILITY
      ↓
LOGIN / REGISTER
      ↓
KNOWLEDGE ASSESSMENT
      ↓
OPTIONAL QUICK TUTORIAL
      ↓
FACILITY LOCKDOWN
      ↓
ROOM 01 — THE INBOX
      ↓
ROOM 02 — THE VAULT
      ↓
ROOM 03 — THE SCANNER
      ↓
ROOM 04 — THE MESSAGE
      ↓
ROOM 05 — THE CONTROL ROOM
      ↓
ESCAPE
      ↓
CYBERSECURITY PERFORMANCE REPORT
      ↓
BADGE / ACHIEVEMENT
      ↓
LEADERBOARD
4. Knowledge Assessment

Before entering the first room, the player completes a short assessment.

The assessment covers:

Phishing

Player confidence in identifying:

suspicious senders
malicious links
suspicious domains
urgency
attachments
impersonation
Password Security

Player confidence in:

password strength
password reuse
password managers
MFA
authentication security
QR Security

Player confidence in:

suspicious QR codes
QR destinations
domains
unexpected QR requests
QR phishing / quishing
Social Engineering

Player confidence in:

impersonation
urgency
authority pressure
emotional manipulation
suspicious requests
independent verification

The user can also indicate whether they want an optional introductory tutorial.

The assessment establishes a baseline but does not permanently determine the game difficulty.

5. Adaptive Learning System

The application should continuously evaluate:

self-reported confidence
actual performance
mistake frequency
hints used
attempt count
challenge difficulty
topic performance

The system uses these signals to determine when learning support is useful.

Learning intervention levels
Level 1 — No intervention

Player is performing confidently.

Continue gameplay.

Level 2 — Contextual explanation

Player makes an isolated mistake.

Show a concise explanation.

Level 3 — Micro-tutorial

Player repeatedly struggles with a topic.

Show a short tutorial explaining the relevant concept.

Level 4 — Guided retry

Player receives a focused example and then retries the challenge.

The goal is to avoid forcing expert players through basic explanations while still helping beginners learn.

6. Core Game Mechanics

Each room contains multiple cybersecurity challenges.

Every challenge follows approximately:

DISCOVER
    ↓
INVESTIGATE
    ↓
DECIDE
    ↓
CONSEQUENCE
    ↓
LEARN
    ↓
PROGRESS
Lives

Players start with a limited number of lives.

For example:

♥ ♥ ♥

Certain dangerous decisions can remove a life.

Lives should have meaningful consequences but should not make the game unnecessarily frustrating.

Score

Correct decisions award points.

Score can be affected by:

correctness
difficulty
investigation quality
speed
hints
mistakes

The scoring system must be consistent and documented.

Hints

Hints can help players who are stuck.

Using a hint may reduce score or create another measurable tradeoff.

Progression

Players unlock rooms sequentially.

A room should not be considered completed simply because the frontend says it is complete.

The backend validates progression.

7. Room Structure
ROOM 01 — THE INBOX
Cybersecurity focus

Phishing

Narrative

The player enters the first room and discovers a compromised communication terminal.

They must identify which communications are legitimate and which are malicious.

Skills tested
sender verification
domain inspection
URL analysis
urgency detection
attachment awareness
impersonation
independent verification
Gameplay

Players inspect realistic email evidence and make security decisions.

Difficulty progression:

obvious phishing
        ↓
moderately convincing phishing
        ↓
subtle phishing
        ↓
multi-indicator phishing
Learning objective

The player should leave the room understanding how to identify suspicious email communication in practical situations.

8. ROOM 02 — THE VAULT
Cybersecurity focus

Password Security + Authentication

Narrative

The player reaches a protected security vault.

Access is blocked by weak authentication practices.

Skills tested
password strength
password reuse
unique credentials
password managers
MFA
authentication decisions
Gameplay

Possible activities include:

comparing passwords
identifying reused credentials
selecting secure authentication settings
enabling MFA
inspecting account security
responding to compromised credentials
Learning objective

The player should understand why strong, unique authentication practices matter.

9. ROOM 03 — THE SCANNER
Cybersecurity focus

QR Security / Quishing

Narrative

The player discovers QR codes placed throughout the facility.

Some are legitimate.

Some redirect to malicious destinations.

Skills tested
QR destination inspection
URL analysis
domain recognition
context analysis
suspicious redirects
urgency
Gameplay

The player must inspect QR destinations before interacting with them.

Difficulty should gradually increase.

Learning objective

The player should understand that QR codes can conceal malicious destinations and should be treated as potential links rather than inherently trustworthy objects.

10. ROOM 04 — THE MESSAGE
Cybersecurity focus

Social Engineering

Narrative

The player begins receiving messages from people claiming to have authority or urgent reasons for requesting information.

Skills tested
identity verification
authority manipulation
urgency
fear
emotional pressure
OTP/password requests
financial requests
independent verification
Gameplay

Players inspect:

sender
context
request
authority claim
urgency
requested information
requested action

and determine how they should respond.

Learning objective

The player should understand that attackers manipulate human psychology rather than relying only on technical vulnerabilities.

11. ROOM 05 — THE CONTROL ROOM
Cybersecurity focus

Multi-threat incident

This is the final challenge.

Unlike the earlier rooms, several threats occur simultaneously.

Possible threats:

phishing email
compromised account
malicious QR code
social-engineering message

The player must:

identify threats
      ↓
prioritize
      ↓
investigate
      ↓
respond
      ↓
contain
      ↓
secure the facility

This room evaluates whether the player can apply previously learned concepts rather than recall isolated definitions.

The final room should be substantially more difficult than the earlier rooms.

12. Escape Result

When the player successfully completes the facility, the game enters the final escape state.

Example information:

FACILITY UNLOCKED

ESCAPE COMPLETE

Then display:

Overall Score
Accuracy
Lives Remaining
Completion Time
Challenges Completed
Hints Used
Mistakes
13. Cybersecurity Performance Report

The final report evaluates the player across:

Phishing
Password Security
QR Security
Social Engineering

Example:

Phishing              92%
Password Security     78%
QR Security           86%
Social Engineering    64%

The report should identify:

Strongest skill

Example:

Your strongest skill:
Phishing detection
Weakest skill

Example:

Needs improvement:
Social engineering
Personalized recommendation

Example:

Verify unexpected requests
through an independent trusted channel.

This makes the project an actual educational assessment rather than merely a game score.

14. Achievement System

Achievements should be based on actual gameplay.

Examples:

Cyber Guardian

Complete the full facility successfully.

Phishing Expert

Demonstrate strong phishing performance.

QR Detective

Successfully identify QR-related threats.

Secure Authenticator

Demonstrate strong password/MFA decisions.

Social Engineering Shield

Strong performance against manipulation scenarios.

Zero Mistake Escape

Complete without losing a life.

Achievements should never be awarded arbitrarily.

15. Player Dashboard

The dashboard is secondary to gameplay.

It should provide:

current room
overall progress
current score
current lives
best score
game history
achievements
topic performance
continue game
start new game

Example:

ROOM 03 / 05

♥ ♥ ♡

SCORE
620

CONTINUE ESCAPE

The dashboard should visually belong to the same product as the game.

It should not look like an enterprise SaaS admin panel.

16. Authentication

The system supports:

registration
login
logout
protected player area

A user should be able to:

start a game
leave
logout
return later
continue

Game progress must persist.

17. Game Session Management

Each playthrough should be represented by a game session.

A session contains information conceptually equivalent to:

session ID
player
current room
current challenge
lives
score
attempts
hints
completed rooms
start time
completion time
status
final result

Possible status values:

NOT_STARTED
IN_PROGRESS
COMPLETED
FAILED
ABANDONED
18. Backend Authority

The backend is responsible for validating:

authentication
challenge submissions
attempts
score
lives
room progression
game completion
results
leaderboard data
achievements

The frontend is responsible primarily for presenting the game state and collecting user interaction.

The architecture should prevent basic client-side manipulation.

19. Technical Architecture Direction

The application uses:

React + Vite
        ↓
REST API
        ↓
Node.js + Express
        ↓
MongoDB + Mongoose

Separate applications:

/frontend
/backend

Additional project documentation:

/docs

The detailed technical architecture should be generated separately and must remain aligned with this master plan.

20. Frontend Direction

The frontend must prioritize:

Immersion

The player should feel like they are inside a digital facility.

Clarity

Players should always understand:

where they are
what they discovered
what they can inspect
what they need to decide
what happened
Motion

Motion should communicate:

room transitions
locking/unlocking
progress
consequences
success
failure

Animation should support gameplay rather than exist merely for decoration.

Responsive experience

The game should work on desktop and mobile without destroying the gameplay hierarchy.

21. UX Architecture Direction

The UX architecture should be organized around:

discover
investigate
decide
learn
progress

rather than:

question
answer
next

Every important game interaction should communicate consequences clearly.

Error and learning states should never feel punitive or confusing.

22. Content Architecture

Cybersecurity challenges should be structured as data rather than hard-coded into giant React components.

Conceptually:

Room
 ├── Challenge
 │    ├── Evidence
 │    ├── Actions
 │    ├── Correct outcome
 │    ├── Consequence
 │    ├── Explanation
 │    ├── Learning topic
 │    └── Difficulty

This makes it possible to add new rooms/challenges without rewriting the game engine.

23. Difficulty System

Difficulty should progress through:

Beginner

Obvious indicators.

Intermediate

Multiple pieces of evidence required.

Advanced

Subtle indicators and conflicting signals.

Expert / Final

Multiple cybersecurity concepts must be combined.

Difficulty should be based on actual challenge design rather than simply increasing the number of questions.

24. Learning Content Standards

Every educational explanation should answer:

WHAT happened?

WHAT evidence revealed the threat?

WHY was the action dangerous?

WHAT should the user do instead?

WHAT practical rule should the player remember?

Avoid large textbook-style explanations during gameplay.

Learning content should be:

short
specific
contextual
actionable

Longer explanations can exist in optional learning sections.

25. Data & Persistence

The system should persist:

player account
knowledge assessment
game sessions
room progression
challenge attempts
score
lives
hints
completion results
skill performance
achievements
leaderboard eligibility
26. Leaderboard

The leaderboard introduces competitive motivation.

Display:

rank
player
score
accuracy
completion time
badge

Ranking values must come from validated server-side game results.

The leaderboard must not accept arbitrary client-provided scores.

27. Security Requirements

Because the project itself is about cybersecurity, its own security posture matters.

The final implementation must review:

authentication
authorization
password hashing
session/token security
input validation
API security
rate limiting
CORS
security headers
IDOR
score manipulation
progress manipulation
duplicate submissions
leaderboard manipulation

The security review should be documented.

28. Performance Requirements

The final application should avoid unnecessary:

large bundles
unoptimized images
excessive animation
unnecessary API requests
duplicate state

Animations should remain smooth without compromising usability.

29. Accessibility Requirements

The application should account for:

keyboard navigation
focus states
readable typography
sufficient contrast
semantic controls
screen-reader meaningful labels
reduced-motion considerations

Accessibility should be considered during implementation rather than added as an afterthought.

30. Hackathon Demo Requirements

The application must be demonstrable from beginning to end.

The ideal demonstration flow is:

1. Landing page
2. Enter facility
3. Knowledge assessment
4. Facility lockdown
5. Room 01
6. Make a phishing mistake
7. Lose a life
8. Receive explanation
9. Use learned information
10. Progress through rooms
11. Reach Control Room
12. Escape
13. Show cybersecurity report
14. Show badge
15. Show leaderboard

The demo should visibly demonstrate the learning loop, because that is one of the project's strongest differentiators.

31. Phase Breakdown
PHASE 0 — Project Foundation

Establish:

repository structure
frontend
backend
database architecture
environment configuration
routing structure
base data models
development standards

No complete gameplay.

PHASE 1 — Immersive Game Foundation

Build:

landing page
authentication screens
initial game shell
facility entry
visual system
global game state architecture
room navigation foundation

Establish the visual identity of the escape room.

PHASE 2 — Knowledge Assessment + Adaptive Learning

Build:

pre-game assessment
confidence profiling
tutorial system
micro-learning system
learning interventions
topic tracking

Establish the adaptive education engine before building the rooms.

PHASE 3 — Room 01

Build:

The Inbox
phishing challenges
email investigation
phishing feedback
phishing tutorial integration
score/life interaction
server validation
PHASE 4 — Room 02

Build:

The Vault
password challenges
password security
MFA
authentication decisions
feedback
server validation
PHASE 5 — Room 03

Build:

The Scanner
QR security
quishing
URL inspection
QR investigation
feedback
server validation
PHASE 6 — Room 04

Build:

The Message
social engineering
impersonation
authority manipulation
urgency
verification decisions
feedback
server validation
PHASE 7 — Room 05

Build:

The Control Room
multi-threat scenario
prioritization
incident response
cross-topic reasoning
final escape
PHASE 8 — Escape Result & Performance Analysis

Build:

escape result
score calculation
accuracy
topic performance
skill breakdown
personalized feedback
badges
achievement logic
PHASE 9 — Dashboard & Persistence

Build:

player dashboard
continue game
game history
saved progression
performance history
achievements
PHASE 10 — Leaderboard & Gamification

Build:

leaderboard
ranking
achievement presentation
competitive statistics
PHASE 11 — Security Hardening

Perform:

authentication review
authorization review
API security review
game integrity review
database validation
client manipulation testing
leaderboard manipulation testing
PHASE 12 — Final Hackathon Polish

Perform:

visual polish
responsive optimization
accessibility
performance optimization
loading states
error handling
animation refinement
demo-flow testing
end-to-end testing
cleanup
32. Definition of Done

The project should not be considered complete simply because every page exists.

The complete product must satisfy:

✓ Player can register/login

✓ Player completes knowledge assessment

✓ Player enters the facility

✓ Player begins with limited lives

✓ Player progresses room by room

✓ Player investigates cybersecurity evidence

✓ Player makes decisions

✓ Incorrect decisions have consequences

✓ Mistakes produce meaningful explanations

✓ Tutorials appear when useful

✓ Learning is contextual

✓ Score is validated by backend

✓ Progress persists

✓ Player can resume

✓ All five rooms are playable

✓ Final room combines multiple concepts

✓ Player can escape

✓ Final cybersecurity report is generated

✓ Skill breakdown is generated

✓ Achievement is earned

✓ Leaderboard works

✓ Basic security hardening is completed

✓ Application is responsive

✓ Application is accessible

✓ Complete hackathon demo can run from start to finish
33. Source-of-Truth Hierarchy

This part is important for Antigravity.

Whenever there is a conflict between documents, use this hierarchy:

1. MASTER_IMPLEMENTATION_PLAN.md
                 ↓
2. TECHNICAL_ARCHITECTURE.md
                 ↓
3. UX_ARCHITECTURE.md
                 ↓
4. FRONTEND_ARCHITECTURE.md
                 ↓
5. BACKEND_ARCHITECTURE.md
                 ↓
6. Existing implementation

But there is one nuance:
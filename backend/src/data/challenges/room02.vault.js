import { TOPICS } from '../../utils/constants.js';

/**
 * Authoritative Challenge Definitions for ROOM 02: THE VAULT (Password Security & MFA).
 * Contains 1 Beginner, 3 Intermediate, and 10 Expert challenges.
 * Private validation fields (correctActionId, privateIndicators, explanation) are kept strictly server-side.
 */
export const ROOM_02_CHALLENGES = [
  // ==========================================
  // BEGINNER (1 Challenge)
  // ==========================================
  {
    challengeId: 'ch-vault-01',
    roomId: 'room-02-vault',
    topic: TOPICS.PASSWORD_SECURITY,
    difficulty: 'beginner',
    scenarioType: 'legitimate',
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
      entropyNotes: 'Account 1 has only 32 bits of entropy (predictable dictionary word). Account 2 has 85 bits. Account 3 achieves 96 bits of CSPRNG entropy.',
      breachNotes: 'Account 1 was compromised in public breach lists. Account 2 and Account 3 are clean.',
      mfaNotes: 'Account 1 has no MFA. Account 2 SMS OTP is vulnerable to SIM swap and SS7 interception. Account 3 uses phishing-resistant FIDO2 hardware token.',
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
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Review which account credentials have appeared in public data breaches.',
      'Consider why hardware-backed FIDO2 tokens provide phishing-resistant authentication compared to SMS text messages.',
    ],
  },

  // ==========================================
  // INTERMEDIATE (3 Challenges)
  // ==========================================
  {
    challengeId: 'ch-vault-int-01',
    roomId: 'room-02-vault',
    topic: TOPICS.PASSWORD_SECURITY,
    difficulty: 'intermediate',
    scenarioType: 'legitimate',
    prompt: 'Evaluate candidate service daemon configurations to eliminate hardcoded credentials in facility infrastructure.',
    sanitizedEvidence: {
      type: 'credential_matrix',
      vaultTarget: 'Sector 02 Automated Backup Daemon Credential Architecture',
      candidateAccounts: [
        {
          id: 'cfg_1',
          username: 'daemon_legacy_static',
          passwordSample: 'V@ultB@ckupDaemon2026#Secure',
          entropyEstimate: '58 bits (Moderate)',
          breachHistory: 'Hardcoded in plaintext in /etc/backup/config.yaml',
          reuseCount: 'Shared across 14 database servers',
          mfaConfig: 'Disabled (Non-interactive Daemon Account)',
        },
        {
          id: 'cfg_2',
          username: 'daemon_quarterly_rot',
          passwordSample: 'xR8$nK2#mP9@vL4!zW7',
          entropyEstimate: '88 bits (Strong)',
          breachHistory: 'Stored in HashiCorp Vault with quarterly manual admin rotation',
          reuseCount: 'Per-server static passwords',
          mfaConfig: 'IP Whitelist Restricted',
        },
        {
          id: 'cfg_3',
          username: 'daemon_managed_identity',
          passwordSample: 'Zero-Static-Secret (Ephemeral OIDC Tokens / IAM Role)',
          entropyEstimate: 'Cryptographic Asymmetric Keypair (2048-bit RSA / Ed25519)',
          breachHistory: 'Zero static secrets stored; 15-minute ephemeral token lifetime',
          reuseCount: 'Strict instance metadata service bound (IMDSv2)',
          mfaConfig: 'Workload Identity Federation with Hardware-Rooted Attestation',
        },
      ],
      entropyNotes: 'Config 1 uses hardcoded plaintext credentials. Config 2 uses strong static secrets rotated quarterly. Config 3 eliminates static secrets entirely using ephemeral tokens.',
      breachNotes: 'Hardcoded credentials in config files are the #1 source of internal service compromise.',
      mfaNotes: 'Non-human workload identities must leverage short-lived cryptographic tokens rather than persistent long-lived passwords.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['entropy_calculator', 'breach_database_check', 'mfa_evaluation'],
    allowedActions: [
      { actionId: 'ACTION_DEPLOY_CFG_1', label: 'Retain daemon_legacy_static (Hardcoded in /etc/backup/config.yaml)', variant: 'danger' },
      { actionId: 'ACTION_DEPLOY_CFG_2', label: 'Deploy daemon_quarterly_rot (Static Password in Vault Rotated Quarterly)', variant: 'warning' },
      { actionId: 'ACTION_DEPLOY_CFG_3', label: 'Deploy daemon_managed_identity (Ephemeral Workload Identity / No Static Secrets)', variant: 'primary' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_DEPLOY_CFG_3',
    privateIndicators: [
      'hardcoded_secret_risk: static passwords in configuration files easily leaked',
      'ephemeral_tokens: 15-minute lifetime eliminates persistent credential theft',
      'workload_identity_federation: modern cloud security standard',
    ],
    scoringMetadata: {
      basePoints: 600,
      targetTimeSeconds: 40,
    },
    consequenceData: {
      onCorrect: 'Service identity upgraded! Ephemeral workload identity federation eliminates static credentials across Sector 02.',
      onIncorrect: 'Credential leak! Static password scraped from plaintext configuration during simulated lateral traversal.',
    },
    fivePartExplanation: {
      whatHappened: 'You selected a configuration relying on static long-lived credentials for a background service daemon.',
      evidence: 'Static credentials in files or vaults remain vulnerable to exposure during code audits, memory dumps, and lateral movement.',
      whyDangerous: 'Attackers discovering hardcoded service credentials gain persistent unmonitored access to backup infrastructure.',
      correctAction: 'Adopt Managed Workload Identities and ephemeral cryptographic tokens (IMDSv2 / OIDC) that eliminate static secrets.',
      securityTip: 'The most secure password is no password at all: leverage short-lived tokens and IAM role assumption for automated services.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Compare static passwords (even long ones) with architectures that eliminate static credentials completely.',
      'Which configuration ensures that a leaked configuration file contains zero reusable credentials?',
    ],
  },

  {
    challengeId: 'ch-vault-int-02',
    roomId: 'room-02-vault',
    topic: TOPICS.PASSWORD_SECURITY,
    difficulty: 'intermediate',
    scenarioType: 'malicious',
    prompt: 'Respond to an active Multi-Factor Authentication Push Fatigue (Prompt Bombing) attack.',
    sanitizedEvidence: {
      type: 'credential_matrix',
      vaultTarget: 'Lead Security Engineer Workstation Authentication Log (2:14 AM UTC)',
      candidateAccounts: [
        {
          id: 'mfa_alert_log',
          username: 'eng_marcus_dev',
          passwordSample: 'Known to Threat Actor (Harvested via External Phishing Link)',
          entropyEstimate: 'Compromised Primary Password',
          breachHistory: '42 Consecutive Push Notifications Dispatched to Mobile Authenticator in 18 Minutes',
          reuseCount: 'Originating IPs: 12 Distinct Tor Exit Nodes',
          mfaConfig: 'Mobile Push Notification ("Approve" / "Deny" One-Touch)',
        },
      ],
      incidentContext: 'It is 2:14 AM. Your phone has buzzed 42 times with Duo/Authenticator push notifications. The attacker possesses your valid primary password and is attempting to provoke an accidental or exhausted "Approve" touch.',
      entropyNotes: 'The attacker already knows the primary password. The second factor is the sole barrier preventing total account takeover.',
      breachNotes: 'Threat actors deliberately target early morning hours (2:00 - 4:00 AM) to maximize cognitive fatigue and induce accidental approvals.',
      mfaNotes: 'Simple push notifications lack context binding. Number matching or FIDO2 hardware keys completely stop push fatigue attacks.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['entropy_calculator', 'breach_database_check', 'mfa_evaluation'],
    allowedActions: [
      { actionId: 'ACTION_REJECT_LOCKOUT_SOC', label: 'Deny Notification, Trigger Emergency Account Lockout, and Alert SOC of Active Password Compromise', variant: 'primary' },
      { actionId: 'ACTION_APPROVE_TO_STOP_BUZZ', label: 'Approve Single Notification to Stop Phone From Buzzing and Inspect Workstation Later', variant: 'danger' },
      { actionId: 'ACTION_IGNORE_PHONE_GO_TO_SLEEP', label: 'Put Phone on Do Not Disturb and Deal with Notifications in the Morning', variant: 'warning' },
      { actionId: 'ACTION_CHANGE_PASSWORD_WITHOUT_SOC', label: 'Change Password on Personal Mobile Browser Without Alerting SOC', variant: 'ghost' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_REJECT_LOCKOUT_SOC',
    privateIndicators: [
      'mfa_push_bombing: 42 notifications in 18 minutes',
      'password_compromised: attacker has valid primary credentials',
      'immediate_lockout_required: must terminate active session and alert SOC',
    ],
    scoringMetadata: {
      basePoints: 600,
      targetTimeSeconds: 40,
    },
    consequenceData: {
      onCorrect: 'Push fatigue attack thwarted! Compromised account locked immediately and SOC dispatched incident response team.',
      onIncorrect: 'Account takeover complete! Single approval allowed attacker to register their own device and deploy ransomware.',
    },
    fivePartExplanation: {
      whatHappened: 'The attacker executed an MFA Fatigue / Prompt Bombing attack after harvesting the primary password.',
      evidence: '42 consecutive mobile push notifications arrived at 2:00 AM from disparate anonymized IP addresses.',
      whyDangerous: 'A single accidental "Approve" click gives the attacker authenticated access to the corporate network.',
      correctAction: 'Deny the notification immediately, lock down the account, and report the primary credential compromise to the SOC.',
      securityTip: 'Deploy MFA number matching or FIDO2 hardware tokens to make push fatigue attacks technically impossible.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'If your phone is buzzing repeatedly with MFA prompts you did not initiate, what does that prove about your primary password?',
      'Simply ignoring the notifications leaves your account vulnerable to an accidental tap.',
    ],
  },

  {
    challengeId: 'ch-vault-int-03',
    roomId: 'room-02-vault',
    topic: TOPICS.PASSWORD_SECURITY,
    difficulty: 'intermediate',
    scenarioType: 'ambiguous',
    prompt: 'Investigate this anomalous off-hours service account authentication surge and select the safest response.',
    sanitizedEvidence: {
      type: 'credential_matrix',
      vaultTarget: 'Disaster Recovery Replication Service Account (svc_dr_replicator)',
      candidateAccounts: [
        {
          id: 'sspr_event_log',
          username: 'svc_dr_replicator',
          passwordSample: 'Managed High-Entropy Key (64-character Vault Credential)',
          entropyEstimate: 'High Entropy (Rotated Monthly)',
          breachHistory: '15 Rapid Kerberos TGS Requests from IP 10.40.2.18 at 03:00 UTC',
          reuseCount: 'Single-purpose replication service',
          mfaConfig: 'Mutual TLS Certificate Authentication',
        },
      ],
      incidentContext: 'Active Directory logs report 15 rapid authentication requests for svc_dr_replicator from an off-subnet IP (10.40.2.18). However, Change Management Ticket CHG-DR-8891 indicates an authorized Disaster Recovery drill scheduled between 02:30 and 04:00 UTC.',
      entropyNotes: 'The credentials exhibit high cryptographic entropy and valid mTLS client certificates.',
      breachNotes: 'Anomalous traffic matches the exact timestamp, source IP subnet, and scope of approved Change Ticket CHG-DR-8891.',
      mfaNotes: 'Client certificate presented matches the authorized Disaster Recovery secondary site intermediate CA.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['entropy_calculator', 'breach_database_check', 'mfa_evaluation'],
    allowedActions: [
      { actionId: 'ACTION_VERIFY_CHANGE_TICKET', label: 'Cross-Reference Telemetry with Change Ticket CHG-DR-8891 & Monitor DR Replication', variant: 'primary' },
      { actionId: 'ACTION_TERMINATE_SERVICE_ACCOUNT', label: 'Immediately Disable svc_dr_replicator Account & Sever Network Port', variant: 'danger' },
      { actionId: 'ACTION_IGNORE_TELEMETRY', label: 'Ignore Incident Without Checking Change Records', variant: 'ghost' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_VERIFY_CHANGE_TICKET',
    privateIndicators: [
      'authorized_change_window: CHG-DR-8891 covers exact timeframe and subnet',
      'mtls_certificate_alignment: valid DR site certificate presented',
      'avoid_false_positive_lockout: locking account aborts critical DR replication',
    ],
    scoringMetadata: {
      basePoints: 600,
      targetTimeSeconds: 40,
    },
    consequenceData: {
      onCorrect: 'Drill verified! Cross-referencing change management confirmed the activity was part of the scheduled DR drill. Data mirrors synchronized cleanly.',
      onIncorrect: 'Disaster Recovery aborted! Disabling the service account halted critical storage replication and corrupted cross-datacenter backup snapshots.',
    },
    fivePartExplanation: {
      whatHappened: 'You investigated an anomalous off-hours service account authentication surge and correctly verified it against approved change management tickets.',
      evidence: 'Ticket CHG-DR-8891 scheduled disaster recovery replication from subnet 10.40.2.18 between 02:30 and 04:00 UTC, matching the alarm parameters exactly.',
      whyDangerous: 'Reflexively locking accounts during scheduled maintenance without checking change control disrupts business continuity and aborts vital disaster recovery drills.',
      correctAction: 'Always correlate anomalous off-hours service activity against ITIL change management records before initiating destructive containment.',
      securityTip: 'Security operations must maintain real-time visibility into authorized change windows to avoid costly false-positive lockouts.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Check the incident context: Is there an authorized Change Management ticket covering this exact timeframe and IP address?',
      'What happens to production backup replication if you disable the service account during an active drill?',
    ],
  },

  // ==========================================
  // EXPERT (10 Challenges)
  // ==========================================
  {
    challengeId: 'ch-vault-exp-01',
    roomId: 'room-02-vault',
    topic: TOPICS.PASSWORD_SECURITY,
    difficulty: 'expert',
    scenarioType: 'malicious',
    prompt: 'Investigate an active Kerberoasting attack against Service Principal Names (SPNs) in Active Directory.',
    sanitizedEvidence: {
      type: 'credential_matrix',
      vaultTarget: 'Active Directory Kerberos Ticket-Granting Service (TGS) Audit Log',
      candidateAccounts: [
        {
          id: 'spn_sql_service',
          username: 'MSSQLSvc/sql-cluster.facility.local:1433',
          passwordSample: 'Summer2025! (RC4-HMAC Encrypted / 38 bits)',
          entropyEstimate: '38 bits (Crackable via Hashcat in 14 minutes)',
          breachHistory: 'SPN associated with user account "svc_sql_prod" holding Domain Admin rights',
          reuseCount: 'Single domain',
          mfaConfig: 'Cannot enforce MFA on Kerberos TGS service requests',
        },
      ],
      incidentContext: 'Security Event ID 4769 reveals an unprivileged domain user requested 18 Kerberos TGS tickets within 4 seconds using legacy RC4 encryption (0x17). The attacker is extracting service account password hashes to crack offline.',
      entropyNotes: 'RC4 encryption in Kerberos enables rapid offline GPU dictionary attacks exceeding 50 billion guesses per second.',
      breachNotes: 'User account tied to SPN has Domain Admin privileges, allowing immediate domain takeover upon hash crack.',
      mfaNotes: 'Kerberos service tickets do not support interactive MFA; protection relies entirely on password entropy and AES-256.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['entropy_calculator', 'breach_database_check', 'mfa_evaluation'],
    allowedActions: [
      { actionId: 'ACTION_REMEDIATE_KERBEROASTING', label: 'Migrate SPN to Group Managed Service Account (gMSA) with 128-Char Random Password & Enforce AES-256 Kerberos', variant: 'primary' },
      { actionId: 'ACTION_ENABLE_MFA_ON_SPN', label: 'Enable Mobile Phone Push MFA on the MSSQL Service Account', variant: 'danger' },
      { actionId: 'ACTION_RESET_USER_PASSWORD_ONLY', label: 'Reset Unprivileged Domain User Password to 16 Characters', variant: 'warning' },
      { actionId: 'ACTION_DISABLE_KERBEROS', label: 'Disable Kerberos and Fall Back to NTLMv2 Authentication', variant: 'ghost' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_REMEDIATE_KERBEROASTING',
    privateIndicators: [
      'kerberoasting_detected: rapid Event 4769 TGS requests with RC4 (0x17)',
      'overprivileged_service_account: svc_sql_prod in Domain Admins',
      'gmsa_solution: Group Managed Service Accounts automate 128-char AES keys',
    ],
    scoringMetadata: {
      basePoints: 750,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'Kerberoasting attack neutralized! Service account migrated to gMSA with automated 128-character AES-256 rotation.',
      onIncorrect: 'Domain compromised! Attacker cracked the RC4 service ticket offline and seized Domain Admin privileges.',
    },
    fivePartExplanation: {
      whatHappened: 'An attacker executed a Kerberoasting attack, requesting TGS service tickets for SPNs to crack offline.',
      evidence: 'Event 4769 showed bulk TGS requests with RC4-HMAC encryption for "svc_sql_prod", which held Domain Admin privileges.',
      whyDangerous: 'Any authenticated user can request TGS tickets for any SPN; weak passwords can be cracked offline without generating lockouts.',
      correctAction: 'Migrate service accounts to Group Managed Service Accounts (gMSAs) with 128+ character passwords and disable RC4.',
      securityTip: 'Service accounts should never be members of Domain Admins or other privileged Active Directory groups.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Can non-interactive Kerberos database services answer interactive push MFA prompts?',
      'What is a Group Managed Service Account (gMSA) in Active Directory?',
    ],
  },

  {
    challengeId: 'ch-vault-exp-02',
    roomId: 'room-02-vault',
    topic: TOPICS.PASSWORD_SECURITY,
    difficulty: 'expert',
    scenarioType: 'malicious',
    prompt: 'Triage a Golden Ticket attack following the compromise of the Active Directory KRBTGT account.',
    sanitizedEvidence: {
      type: 'credential_matrix',
      vaultTarget: 'Key Distribution Center (KDC) Master Secret Keyring — KRBTGT Account',
      candidateAccounts: [
        {
          id: 'krbtgt_master',
          username: 'KRBTGT (Domain Key Distribution Center Account)',
          passwordSample: 'Cryptographic Master Secret Key (Shared Domain Secret)',
          entropyEstimate: 'Full Domain Authority / Forged TGT Lifetime: 10 Years',
          breachHistory: 'Mimikatz DCSync extracted KRBTGT NTLM hash 3 hours ago',
          reuseCount: 'Master root key for all Kerberos tickets across entire forest',
          mfaConfig: 'Immune to standard password resets unless dual-cycle executed',
        },
      ],
      incidentContext: 'Forensic telemetry discovered a forged Kerberos Ticket Granting Ticket (TGT) presenting user "fake_admin" with non-existent RID 500 rights. The KRBTGT master password hash was stolen via DCSync.',
      entropyNotes: 'A forged Golden Ticket bypasses all passwords, smart cards, and MFA; it is signed by the domain’s master secret.',
      breachNotes: 'Even if all regular administrator passwords are changed, Golden Tickets remain valid until the KRBTGT password is reset twice.',
      mfaNotes: 'Golden Tickets bypass MFA because the KDC treats any ticket encrypted by the KRBTGT key as cryptographically authentic.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['entropy_calculator', 'breach_database_check', 'mfa_evaluation'],
    allowedActions: [
      { actionId: 'ACTION_KRBTGT_DOUBLE_RESET', label: 'Execute Authoritative KRBTGT Password Reset Twice (Separated by Replication Interval) & Invalidate All Kerberos Tickets', variant: 'primary' },
      { actionId: 'ACTION_RESET_DOMAIN_ADMINS_ONLY', label: 'Reset Passwords for All Members of Domain Admins Group Once', variant: 'danger' },
      { actionId: 'ACTION_REBOOT_DOMAIN_CONTROLLERS', label: 'Reboot All Domain Controllers to Flush Volatile Memory Tickets', variant: 'warning' },
      { actionId: 'ACTION_REVOKE_SMART_CARDS', label: 'Revoke and Reissue All Physical PIV/CAC Smart Cards', variant: 'ghost' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_KRBTGT_DOUBLE_RESET',
    privateIndicators: [
      'golden_ticket_forgery: arbitrary TGT forged using stolen KRBTGT secret',
      'double_krbtgt_reset_required: AD retains previous password for ticket validity',
      'complete_domain_persistence: Golden Tickets remain valid up to 10 years without dual reset',
    ],
    scoringMetadata: {
      basePoints: 750,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'Golden Ticket eradicated! Dual KRBTGT reset executed across all domain controllers, severing all forged tickets.',
      onIncorrect: 'Persistent domain backdoor retained! Attacker forged new 10-year Golden Tickets using the un-rotated previous KRBTGT key.',
    },
    fivePartExplanation: {
      whatHappened: 'The threat actor forged a Kerberos Golden Ticket using the compromised password hash of the KRBTGT account.',
      evidence: 'Security logs identified an unauthorized TGT ticket granting arbitrary Domain Admin privileges with an anomalous 10-year lifetime.',
      whyDangerous: 'Golden Tickets grant unrestricted access to every computer, server, and file in the domain, bypassing MFA and passwords.',
      correctAction: 'Reset the KRBTGT password twice, allowing adequate time for replication between resets, to invalidate both current and prior keys.',
      securityTip: 'Active Directory maintains the previous password of the KRBTGT account to prevent service outages; a single reset is insufficient.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Why must the KRBTGT account specifically be reset TWICE rather than once?',
      'Does rebooting a server invalidate an encrypted Kerberos ticket presented by a client?',
    ],
  },

  {
    challengeId: 'ch-vault-exp-03',
    roomId: 'room-02-vault',
    topic: TOPICS.PASSWORD_SECURITY,
    difficulty: 'expert',
    scenarioType: 'legitimate',
    prompt: 'Evaluate this Privileged Access Management (PAM) Just-in-Time elevation request and determine the appropriate action.',
    narrative: 'A senior database administrator requests a 2-hour ephemeral credential elevation to execute an authorized emergency indexing job on the primary cluster.',
    sanitizedEvidence: {
      type: 'credential_matrix',
      vaultTarget: 'CyberArk / HashiCorp PAM Ephemeral Credential Broker',
      candidateAccounts: [
        {
          id: 'pam_jit_request',
          username: 'dba_marcus_temp_jit',
          passwordSample: 'Ephemeral 128-bit Cryptographic Vault Token (Valid 120 Minutes)',
          entropyEstimate: 'High Entropy (Cryptographically Random JIT Secret)',
          breachHistory: 'Clean audit trail; linked to pre-approved Change Ticket CHG-DB-9042',
          reuseCount: 'Single-session ephemeral credential destroyed automatically after 2 hours',
          mfaConfig: 'Hardware FIDO2 YubiKey Authentication Verified at Check-Out',
        },
      ],
      incidentContext: 'DBA Marcus Vance checked out a Just-in-Time (JIT) administrative role via the enterprise PAM portal. Change Ticket CHG-DB-9042 approved the 2-hour maintenance window for database index optimization. Hardware token authentication passed.',
      entropyNotes: 'JIT credentials completely eliminate persistent standing privileges; the credentials expire automatically after 120 minutes.',
      breachNotes: 'No standing passwords exist to be compromised or breached.',
      mfaNotes: 'Checked out using mandatory hardware-rooted FIDO2 authentication.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['entropy_calculator', 'breach_database_check', 'mfa_evaluation'],
    allowedActions: [
      { actionId: 'ACTION_APPROVE_JIT_ELEVATION', label: 'Approve JIT Elevation via PAM Portal & Log Session Audit Telemetry', variant: 'primary' },
      { actionId: 'ACTION_BLOCK_PAM_REQUEST', label: 'Reject JIT Request and Revoke Administrator Account Due to Elevation Alert', variant: 'danger' },
      { actionId: 'ACTION_GRANT_PERMANENT_ROOT', label: 'Convert JIT Account to Permanent Static Root Credential to Save Admin Time', variant: 'warning' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_APPROVE_JIT_ELEVATION',
    privateIndicators: [
      'authorized_pam_workflow: conforms to enterprise JIT credential policy',
      'ephemeral_token_lifetime: automatically revoked after 120 minutes',
      'hardware_mfa_verified: FIDO2 key presented during checkout',
    ],
    scoringMetadata: {
      basePoints: 750,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'JIT elevation verified! Time-bound ephemeral credential issued for database maintenance and automatically purged after session completion.',
      onIncorrect: 'Operational outage! Reflexively blocking legitimate JIT elevation halted emergency database indexing, causing transaction queue timeouts.',
    },
    fivePartExplanation: {
      whatHappened: 'You reviewed an authentic Just-in-Time (JIT) Privileged Access Management elevation request and correctly approved it.',
      evidence: 'The request was linked to authorized Change Ticket CHG-DB-9042, enforced a 120-minute ephemeral lease, and required FIDO2 key verification.',
      whyDangerous: 'Reflexively denying authorized PAM requests disrupts critical database maintenance and encourages administrators to create insecure backdoors.',
      correctAction: 'Verify that the PAM elevation matches an approved change ticket and enforces short-lived ephemeral tokens, then approve with audit logging.',
      securityTip: 'Just-in-Time (JIT) access reduces the attack surface by ensuring zero permanent standing administrative privileges exist in the environment.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Inspect the credential lifetime: Is this a permanent password or an ephemeral 2-hour token?',
      'Check the change ticket record: Was this maintenance pre-approved in CHG-DB-9042?',
    ],
  },

  {
    challengeId: 'ch-vault-exp-04',
    roomId: 'room-02-vault',
    topic: TOPICS.PASSWORD_SECURITY,
    difficulty: 'expert',
    scenarioType: 'malicious',
    prompt: 'Neutralize an active NTLM Relay and Pass-the-Hash attack targeting facility SMB shares.',
    sanitizedEvidence: {
      type: 'credential_matrix',
      vaultTarget: 'Facility Core Switch SMB Traffic & NTLM Authentication Stream',
      candidateAccounts: [
        {
          id: 'smb_relay_node',
          username: 'NTLMv2 Challenge-Response Protocol Stream',
          passwordSample: 'NetNTLMv2 Hash (Relayed in Real-Time to 185.220.101.4)',
          entropyEstimate: 'Vulnerable to Cross-Protocol Relaying',
          breachHistory: 'Attacker running Responder on local subnet answering LLMNR/NBT-NS broadcast queries',
          reuseCount: 'Broadcast across entire local subnet VLAN 10',
          mfaConfig: 'NTLM does not support multi-factor authentication',
        },
      ],
      incidentContext: 'Network monitoring detects an unauthenticated rogue machine poisoning LLMNR/NBT-NS broadcast traffic. The rogue host intercepts NTLM authentication negotiations from administrative workstations and relays them in real-time to gain administrative shells on adjacent database servers.',
      entropyNotes: 'In an NTLM relay attack, the attacker does not even need to crack the password hash; they relay the cryptographic challenge-response live.',
      breachNotes: 'Unsigned SMB connections allow transparent man-in-the-middle relaying.',
      mfaNotes: 'Legacy protocols like NTLM lack MFA support and must be eradicated from modern zero-trust environments.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['entropy_calculator', 'breach_database_check', 'mfa_evaluation'],
    allowedActions: [
      { actionId: 'ACTION_DISABLE_NTLM_SMB_SIGNING', label: 'Disable LLMNR/NBT-NS Broadcasts, Mandate SMB Signing Across Enterprise, and Restrict NTLM via GPO', variant: 'primary' },
      { actionId: 'ACTION_INCREASE_NTLM_LENGTH', label: 'Require NTLM Passwords to Be 20 Characters Long Without Changing Protocol', variant: 'danger' },
      { actionId: 'ACTION_REBOOT_SWITCHES', label: 'Reboot Core Network Switches to Clear ARP Caches', variant: 'warning' },
      { actionId: 'ACTION_INSTALL_ANTIVIRUS_RELAY', label: 'Install Antivirus on the Rogue Relaying Host', variant: 'ghost' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_DISABLE_NTLM_SMB_SIGNING',
    privateIndicators: [
      'llmnr_poisoning_detected: rogue machine answering multicast name resolution',
      'smb_relay_execution: NetNTLMv2 relayed to unsigned SMB targets',
      'smb_signing_remediation: SMB signing cryptographically prevents MITM relaying',
    ],
    scoringMetadata: {
      basePoints: 750,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'NTLM relay neutralized! SMB signing enforced enterprise-wide and legacy LLMNR multicast protocols disabled.',
      onIncorrect: 'Network pivot successful! Attacker relayed administrative credentials to the domain backup server and gained root shell.',
    },
    fivePartExplanation: {
      whatHappened: 'An attacker poisoned LLMNR/NBT-NS broadcasts and relayed captured NetNTLMv2 authentication attempts to unsigned SMB servers.',
      evidence: 'Telemetry recorded multicast poisoning paired with real-time NTLM relaying against servers lacking SMB signing enforcement.',
      whyDangerous: 'NTLM relaying requires zero password cracking; the attacker acts as a transparent proxy, inheriting the victim\'s full privileges.',
      correctAction: 'Disable LLMNR and NBT-NS, mandate SMB Signing on all domain machines, and disable legacy NTLM authentication.',
      securityTip: 'Enforce Extended Protection for Authentication (EPA) and SMB signing to render credential relaying mathematically impossible.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Does having a longer password prevent an attacker from relaying your authentication challenge in real time?',
      'What cryptographic setting on SMB connections stops man-in-the-middle relaying?',
    ],
  },

  {
    challengeId: 'ch-vault-exp-05',
    roomId: 'room-02-vault',
    topic: TOPICS.PASSWORD_SECURITY,
    difficulty: 'expert',
    scenarioType: 'ambiguous',
    prompt: 'Investigate an automated backup service account authentication spike with repeated failures during a scheduled maintenance window.',
    sanitizedEvidence: {
      type: 'credential_matrix',
      vaultTarget: 'Storage Area Network (SAN) Snapshot Service Daemon (svc-san-backup)',
      candidateAccounts: [
        {
          id: 'svc_san_backup',
          username: 'svc-san-backup@internal.facility.local',
          passwordSample: 'Rotated 24-character cryptographic token',
          entropyEstimate: '128-bit Machine Token',
          breachHistory: '0 breaches found; internal service principal',
          reuseCount: 'Bound to DC-01 and SAN-Storage-Node-04',
          mfaConfig: 'Service Principal / Certificate Keypair (Non-Interactive)',
        },
      ],
      incidentContext: 'SIEM triggered an alert for 5 consecutive authentication failures from svc-san-backup at 02:00 UTC. At 02:05 UTC, authentication succeeded and an incremental backup completed. The service account password was scheduled for monthly rotation yesterday.',
      entropyNotes: 'High-entropy machine credential; failures stopped once the dependent service worker reloaded the updated vault secret.',
      breachNotes: 'No public breach exposure or external IP involvement detected.',
      mfaNotes: 'Non-interactive service account authenticating via mutual TLS / Kerberos SPN.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['entropy_calculator', 'breach_database_check', 'mfa_evaluation'],
    allowedActions: [
      { actionId: 'ACTION_AUDIT_SERVICE_DEPENDENCIES', label: 'Audit Backup Daemon Dependencies & Verify Password Expiration Calendar', variant: 'primary' },
      { actionId: 'ACTION_LOCK_BACKUP_SERVICE_ACCOUNT', label: 'Immediately Disable svc-san-backup Account and Purge Backup Snapshots', variant: 'danger' },
      { actionId: 'ACTION_REVERT_SERVICE_PASSWORD', label: 'Revert Password to Previous Static Password to Stop Authentication Errors', variant: 'warning' },
      { actionId: 'ACTION_IGNORE_AUTHENTICATION_ERRORS', label: 'Ignore Alert Without Verifying Service Token Synchronization', variant: 'ghost' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_AUDIT_SERVICE_DEPENDENCIES',
    privateIndicators: [
      'caching_delay: service workers held old secret for 5 minutes during rotation',
      'internal_source: auth originated strictly from authorized SAN management IP',
      'successful_completion: backup job finished normally once token updated',
    ],
    scoringMetadata: {
      basePoints: 750,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'Investigation verified! Audit confirmed a brief 5-minute secret caching desynchronization following scheduled monthly rotation. Critical backup services remain healthy and uninterrupted.',
      onIncorrect: 'Operational disruption! Disabling the service account halted critical enterprise volume snapshots, causing data replication failures without addressing the configuration desync.',
    },
    fivePartExplanation: {
      whatHappened: 'A scheduled monthly rotation of a service account password caused a temporary 5-minute caching desync while background backup worker daemons updated.',
      evidence: 'Auth failures ceased immediately once workers retrieved the new secret at 02:05 UTC; all requests originated exclusively from authorized SAN internal IP addresses.',
      whyDangerous: 'Knee-jerk account disabling during normal maintenance desynchronizations causes major operational outages and breaks disaster recovery pipelines.',
      correctAction: 'Investigate and verify the scheduled rotation calendar and daemon dependency synchronization before taking disruptive account action.',
      securityTip: 'Use managed service identities (e.g. gMSA or Azure Managed Identities) to avoid manual rotation caching race conditions.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Notice the timing: 5 failures at 02:00 followed immediately by success at 02:05 during a maintenance window.',
      'Would shutting down the backup service account immediately protect the organization, or cause an operational outage for a routine rotation delay?',
    ],
  },

  {
    challengeId: 'ch-vault-exp-06',
    roomId: 'room-02-vault',
    topic: TOPICS.PASSWORD_SECURITY,
    difficulty: 'expert',
    scenarioType: 'legitimate',
    prompt: 'Evaluate a FIDO2 WebAuthn credential registration request asserting an enterprise hardware security key.',
    sanitizedEvidence: {
      type: 'credential_matrix',
      vaultTarget: 'Facility Single Sign-On (SSO) WebAuthn Relying Party (auth.facility-corp.com)',
      candidateAccounts: [
        {
          id: 'fido2_hw_reg',
          username: 'cadet.chief.engineer@facility-corp.com',
          passwordSample: 'ECDSA P-256 Public Key (Hardware Attestation Verified)',
          entropyEstimate: 'FIDO2 Level 2 Certified Cryptographic Authenticator',
          breachHistory: '0 breaches found; private key generated inside Secure Element',
          reuseCount: 'Scoped strictly to RP ID: "auth.facility-corp.com"',
          mfaConfig: 'Hardware Security Key (FIDO2 / WebAuthn with User Presence & Verification)',
        },
      ],
      incidentContext: 'The Chief Engineer requested registration of a new enterprise YubiKey 5 FIPS hardware token. The browser attestation statement contains a valid cryptographic certificate signed by Yubico CA, and the Relying Party ID is bound precisely to auth.facility-corp.com.',
      entropyNotes: 'Asymmetric public-key cryptography; the private key cannot be extracted from the hardware token.',
      breachNotes: 'Immune to credential theft and breach dumps because credentials are origin-bound.',
      mfaNotes: 'User presence (physical touch) and user verification (PIN) both enforced.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['entropy_calculator', 'breach_database_check', 'mfa_evaluation'],
    allowedActions: [
      { actionId: 'ACTION_REGISTER_FIDO2_HARDWARE_KEY', label: 'Validate Origin & Register FIDO2 Hardware Key in Enterprise SSO', variant: 'primary' },
      { actionId: 'ACTION_REJECT_FIDO2_REGISTRATION', label: 'Reject WebAuthn Registration and Force Fallback to SMS OTP', variant: 'danger' },
      { actionId: 'ACTION_EXPAND_RPID_WILDCARD_RP', label: 'Allow Registration but Broaden RP ID to Root Wildcard Domain (*.facility-corp.com)', variant: 'warning' },
      { actionId: 'ACTION_DELETE_USER_CREDENTIALS', label: 'Revoke Chief Engineer Access and Report Hardware Key as Malicious Peripheral', variant: 'ghost' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_REGISTER_FIDO2_HARDWARE_KEY',
    privateIndicators: [
      'valid_hardware_attestation: signed by genuine Yubico Root CA',
      'strict_rpid_binding: exactly matches auth.facility-corp.com',
      'phishing_resistant: asymmetric hardware key prevents credential theft',
    ],
    scoringMetadata: {
      basePoints: 750,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'Hardware key registered! Cryptographic origin binding and FIPS hardware attestation successfully established phishing-resistant authentication.',
      onIncorrect: 'False-positive error! Rejecting valid FIDO2 attestation forced the user to fallback to insecure legacy channels, weakening enterprise security posture.',
    },
    fivePartExplanation: {
      whatHappened: 'An authorized engineer registered an enterprise hardware security key with valid cryptographic attestation.',
      evidence: 'WebAuthn Relying Party ID is strictly scoped to auth.facility-corp.com, and the attestation certificate matches the vendor root of trust.',
      whyDangerous: 'Blocking authentic hardware keys hampers productivity and tempts staff to request weaker, phishable MFA alternatives like SMS.',
      correctAction: 'Verify the cryptographic attestation chain and approve the hardware key registration to achieve phishing resistance.',
      securityTip: 'Hardware-bound FIDO2 credentials provide the strongest known defense against adversary-in-the-middle (AiTM) phishing.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Look at the RP ID: Is it strictly scoped to auth.facility-corp.com?',
      'Is the attestation signed by a trusted vendor CA (Yubico)?',
    ],
  },

  {
    challengeId: 'ch-vault-exp-07',
    roomId: 'room-02-vault',
    topic: TOPICS.PASSWORD_SECURITY,
    difficulty: 'expert',
    scenarioType: 'malicious',
    prompt: 'Neutralize an infostealer malware attack extracting unencrypted browser master credentials and session tokens.',
    sanitizedEvidence: {
      type: 'credential_matrix',
      vaultTarget: 'Workstation Local Storage & Web Browser SQLite Master Databases (WS-ENG-082)',
      candidateAccounts: [
        {
          id: 'infostealer_dump',
          username: 'Local User: eng_operator (Master Keyring SQLite)',
          passwordSample: 'Decrypted DPAPI Master Key & 142 Saved Corporate Passwords',
          entropyEstimate: 'Compromised Memory / Disk Extraction',
          breachHistory: 'RedLine / Lumma Stealer payload executed from infected developer tool archive',
          reuseCount: 'All local browser session cookies, Slack tokens, and AWS CLI keys exfiltrated',
          mfaConfig: 'Session cookies stolen post-MFA, allowing direct session hijacking',
        },
      ],
      incidentContext: 'EDR alerts triggered on WS-ENG-082 when an unauthorized binary invoked CryptUnprotectData to decrypt Chrome and Edge Login Data databases, followed immediately by an encrypted ZIP archive sent to Telegram C2 API endpoints.',
      entropyNotes: 'Passwords stored in browser vaults rely on DPAPI, which is easily unmasked by malware running under the logged-in user context.',
      breachNotes: 'Infostealers bypass MFA by stealing live session cookies alongside stored credentials.',
      mfaNotes: 'Active session cookies must be invalidated across all identity providers.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['entropy_calculator', 'breach_database_check', 'mfa_evaluation'],
    allowedActions: [
      { actionId: 'ACTION_REVOKE_EXFILTRATED_MASTER_KEYS', label: 'Isolate Workstation, Invalidate All Active SSO Sessions, and Revoke Exfiltrated Credentials', variant: 'primary' },
      { actionId: 'ACTION_CLEAR_BROWSER_CACHE_ONLY', label: 'Instruct Engineer to Clear Browser Cache and Delete Local Cookies', variant: 'danger' },
      { actionId: 'ACTION_RENAME_SQLITE_DATABASE', label: 'Rename Login Data Database File to Hide It from Future Malware', variant: 'warning' },
      { actionId: 'ACTION_RESTART_BROWSER_IN_INCOGNITO', label: 'Relaunch Browser in Incognito Mode and Resume Work', variant: 'ghost' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_REVOKE_EXFILTRATED_MASTER_KEYS',
    privateIndicators: [
      'cryptunprotectdata_abuse: unauthorized extraction of browser vault secrets',
      'c2_exfiltration: telemetry sent to Telegram bot API endpoints',
      'session_hijacking_risk: stolen cookies allow direct MFA bypass',
    ],
    scoringMetadata: {
      basePoints: 750,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'Infostealer blast radius contained! Workstation isolated, all cloud sessions terminated, and compromised API keys revoked immediately.',
      onIncorrect: 'Enterprise breach! Attacker imported exfiltrated session cookies into an antidetect browser, bypassing MFA to access enterprise cloud consoles.',
    },
    fivePartExplanation: {
      whatHappened: 'Infostealer malware decrypted browser credential databases and exfiltrated active session tokens to a Telegram bot API.',
      evidence: 'EDR detected CryptUnprotectData execution followed by bulk SQLite exfiltration from Chrome/Edge user data paths.',
      whyDangerous: 'Infostealers steal valid session cookies that bypass MFA entirely, allowing attackers instant access without needing to authenticate.',
      correctAction: 'Isolate the host, terminate all active web sessions across all IdPs, and rotate every credential stored on the system.',
      securityTip: 'Prohibit browser password saving via Group Policy and mandate enterprise password managers with hardware-bound encryption.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'If malware exfiltrated session cookies, what must happen to the user\'s active web sessions across identity providers?',
      'Does simply clearing the local browser cache stop an attacker who already downloaded the credentials?',
    ],
  },

  {
    challengeId: 'ch-vault-exp-08',
    roomId: 'room-02-vault',
    topic: TOPICS.PASSWORD_SECURITY,
    difficulty: 'expert',
    scenarioType: 'legitimate',
    prompt: 'Validate a Group Managed Service Account (gMSA) automated 30-day credential rotation event.',
    sanitizedEvidence: {
      type: 'credential_matrix',
      vaultTarget: 'Active Directory Group Managed Service Account (gMSA: svc_sql_cluster$)',
      candidateAccounts: [
        {
          id: 'gmsa_auto_rot',
          username: 'svc_sql_cluster$ (Domain Member Service Principal)',
          passwordSample: '128-character machine-generated cryptographically secure pseudo-random key',
          entropyEstimate: '512-bit Active Directory KDS Root Key Derived Password',
          breachHistory: '0 breaches; never exposed to human administrators',
          reuseCount: 'Managed exclusively by Windows Key Distribution Services (KDS)',
          mfaConfig: 'Machine Identity Kerberos Mutual Authentication',
        },
      ],
      incidentContext: 'Active Directory security log Event ID 4742 (A computer account was changed) logged on DC-01 for svc_sql_cluster$. The password was automatically updated by the Key Distribution Service at the standard 30-day interval with no manual intervention.',
      entropyNotes: '128 characters of cryptographically secure random bytes generated directly by the domain controller.',
      breachNotes: 'No human knows or manages the gMSA password; immune to password guessing, credential stuffing, and social engineering.',
      mfaNotes: 'Uses Kerberos SPN encryption backed by AES-256.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['entropy_calculator', 'breach_database_check', 'mfa_evaluation'],
    allowedActions: [
      { actionId: 'ACTION_VALIDATE_GMSA_ROTATION', label: 'Validate gMSA Replication & Log Scheduled Key Rotation as Normal Activity', variant: 'primary' },
      { actionId: 'ACTION_RESET_GMSA_PASSWORD_MANUALLY', label: 'Manually Reset gMSA Password to a Human-Readable String to Regain Control', variant: 'danger' },
      { actionId: 'ACTION_DISABLE_KDS_SERVICE', label: 'Disable Active Directory Key Distribution Service (KDS) to Prevent Future Changes', variant: 'warning' },
      { actionId: 'ACTION_ISOLATE_SQL_CLUSTER', label: 'Isolate SQL Cluster Nodes Believing the Machine Account Password Was Altered by Hackers', variant: 'ghost' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_VALIDATE_GMSA_ROTATION',
    privateIndicators: [
      'event_4742_kds: automated change by authorized Domain Controller KDS process',
      'standard_30_day_interval: perfectly aligns with gMSA rotation policy',
      'zero_human_exposure: password handled entirely within Active Directory replication',
    ],
    scoringMetadata: {
      basePoints: 750,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'Service account health confirmed! Validated normal automated gMSA rotation, preserving high-entropy security and zero downtime.',
      onIncorrect: 'Production outage! Manually resetting a gMSA breaks Active Directory Kerberos SPN delegation, halting all database services.',
    },
    fivePartExplanation: {
      whatHappened: 'Active Directory KDS executed an automated, scheduled 30-day password change for a Group Managed Service Account.',
      evidence: 'Event ID 4742 originated from Domain Controller KDS daemon at the precise 30-day interval with valid service attributes.',
      whyDangerous: 'Interfering with gMSA mechanics by manually resetting passwords breaks Kerberos SPN bindings and stops mission-critical services.',
      correctAction: 'Validate that the KDS replication is successful across domain controllers and acknowledge the routine security event.',
      securityTip: 'Group Managed Service Accounts eliminate human password management and ensure automatic 128-character cryptographic rotation.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Look at the account type: It is a gMSA ($ suffix) managed by Active Directory KDS.',
      'Is an automated 30-day machine password rotation normal operational hygiene or a breach?',
    ],
  },

  {
    challengeId: 'ch-vault-exp-09',
    roomId: 'room-02-vault',
    topic: TOPICS.PASSWORD_SECURITY,
    difficulty: 'expert',
    scenarioType: 'ambiguous',
    prompt: 'Investigate an executive anomalous geolocation login alert originating from an international IP address.',
    sanitizedEvidence: {
      type: 'credential_matrix',
      vaultTarget: 'Executive Corporate Email & Cloud ERP Portal',
      candidateAccounts: [
        {
          id: 'exec_travel_login',
          username: 'vp_operations@facility-corp.com',
          passwordSample: 'Strong 20-character passphrase + FIDO2 Security Key Authenticated',
          entropyEstimate: 'High Entropy + Hardware MFA',
          breachHistory: '0 breaches found',
          reuseCount: 'Single authorized executive user',
          mfaConfig: 'FIDO2 Hardware Key Verified; Device Managed by Enterprise MDM',
        },
      ],
      incidentContext: 'Identity Protection triggered a "Medium Risk: Unfamiliar Sign-in Properties" alert for the VP of Operations from an IP address in Tokyo, Japan (AS2516 KDDI Corporation), 14 hours after a login from San Francisco. Device telemetry shows the corporate-managed laptop with compliant antivirus and BitLocker enabled.',
      entropyNotes: 'Password was entered alongside a successful FIDO2 WebAuthn touch.',
      breachNotes: 'No credential reuse or breach records.',
      mfaNotes: 'Compliant Intune MDM device certificate present; FIDO2 token physically touched.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['entropy_calculator', 'breach_database_check', 'mfa_evaluation'],
    allowedActions: [
      { actionId: 'ACTION_VERIFY_TRAVEL_REGISTRY', label: 'Cross-Reference Login with HR Travel Registry & Confirm Device Health Before Action', variant: 'primary' },
      { actionId: 'ACTION_INSTANT_EXECUTIVE_LOCKOUT', label: 'Instantly Terminate VP Account and Wipe Corporate Laptop Remotely', variant: 'danger' },
      { actionId: 'ACTION_DISABLE_IMPOSSIBLE_TRAVEL_ALERTS', label: 'Disable Geolocation Risk Alerts for Executive Accounts Permanently', variant: 'warning' },
      { actionId: 'ACTION_DISMISS_ALERT_UNCHECKED', label: 'Dismiss Alert Without Checking Travel Dates or Device Telemetry', variant: 'ghost' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_VERIFY_TRAVEL_REGISTRY',
    privateIndicators: [
      'realistic_transit_time: 14 hours between SF and Tokyo is physically feasible',
      'fido2_mfa_satisfied: hardware security key was physically tapped',
      'mdm_compliance: endpoint device complies with all corporate security policies',
    ],
    scoringMetadata: {
      basePoints: 750,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'Investigation confirmed authorized activity! VP confirmed flight to Tokyo for international conference; MDM telemetry validated healthy managed device.',
      onIncorrect: 'High-impact false positive! Remotely wiping the VP\'s laptop during a critical overseas partner negotiation caused major operational and executive turmoil.',
    },
    fivePartExplanation: {
      whatHappened: 'A geolocation risk alert fired for an executive logging in from Tokyo with a managed device and hardware MFA.',
      evidence: '14 hours elapsed between SF and Tokyo (realistic flight time), device is enterprise MDM-enrolled, and hardware FIDO2 key was used.',
      whyDangerous: 'Unchecked knee-jerk device wiping and account termination of traveling executives disrupts vital business operations.',
      correctAction: 'Investigate by cross-referencing HR travel registries and confirming MDM device posture before considering lockout.',
      securityTip: 'Combine conditional access policies with travel exception registries and device compliance rather than relying solely on IP geolocation.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Calculate the time difference: 14 hours between SF and Tokyo. Is that physically possible for commercial air travel?',
      'Was the device corporate-managed and verified by a hardware key?',
    ],
  },

  {
    challengeId: 'ch-vault-exp-10',
    roomId: 'room-02-vault',
    topic: TOPICS.PASSWORD_SECURITY,
    difficulty: 'expert',
    scenarioType: 'legitimate',
    prompt: 'Assess an enterprise passkey synchronization event to an authorized, managed mobile device enclave.',
    sanitizedEvidence: {
      type: 'credential_matrix',
      vaultTarget: 'Enterprise Cloud Identity Provider Passkey Synchronizer',
      candidateAccounts: [
        {
          id: 'managed_passkey_sync',
          username: 'lead.architect@facility-corp.com',
          passwordSample: 'Synchronized Multi-Device FIDO2 Passkey (Hardware Enclave Protected)',
          entropyEstimate: 'ECDSA P-256 Public Key Cryptography',
          breachHistory: '0 breaches found; private key never touches remote servers',
          reuseCount: 'Scoped strictly to enterprise tenant RP ID',
          mfaConfig: 'Hardware Secure Enclave + Biometric FaceID / Fingerprint Verification',
        },
      ],
      incidentContext: 'An enrollment log recorded the creation of a synced passkey on an enterprise-supervised iPhone enrolled in Microsoft Intune / Apple Business Manager. Cryptographic hardware attestation confirms key generation occurred inside the device\'s Secure Enclave.',
      entropyNotes: 'Cryptographic asymmetric keypair; immune to offline dictionary attacks.',
      breachNotes: 'Passkeys cannot be phished or leaked via data breaches.',
      mfaNotes: 'Requires biometric user verification on an approved, MDM-supervised mobile device.',
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['entropy_calculator', 'breach_database_check', 'mfa_evaluation'],
    allowedActions: [
      { actionId: 'ACTION_ENROLL_MANAGED_PASSKEY', label: 'Approve Enclave-Attested Passkey Enrollment on Supervised Device', variant: 'primary' },
      { actionId: 'ACTION_BLOCK_PASSKEY_FORCE_STATIC', label: 'Block Passkey Enrollment and Force 8-Character Password with 90-Day Rotation', variant: 'danger' },
      { actionId: 'ACTION_ALLOW_UNMANAGED_PERSONAL_DEVICE', label: 'Allow Passkeys to Sync to Personal Unmanaged Android/iOS Devices Without MDM', variant: 'warning' },
      { actionId: 'ACTION_QUARANTINE_DEVICE', label: 'Quarantine Device Believing Biometric Enclave Keys Indicate Malicious Tampering', variant: 'ghost' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_ENROLL_MANAGED_PASSKEY',
    privateIndicators: [
      'secure_enclave_attestation: hardware-backed key generation verified',
      'mdm_supervised: device enrolled in enterprise Intune MDM policy',
      'phishing_proof: passkeys eliminate credential theft risks',
    ],
    scoringMetadata: {
      basePoints: 750,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'Passkey enrollment approved! Supervised device Secure Enclave successfully bound to enterprise identity, reinforcing phishing defense.',
      onIncorrect: 'Regressive security decision! Forcing fallback to short rotating static passwords re-introduces credential stuffing and phishing vulnerabilities.',
    },
    fivePartExplanation: {
      whatHappened: 'A user enrolled an enterprise-supervised mobile device passkey with hardware Secure Enclave attestation.',
      evidence: 'MDM telemetry confirms the device is managed and supervised, and the WebAuthn attestation matches Apple/Intune enterprise roots.',
      whyDangerous: 'Blocking modern phishing-resistant passkeys in favor of outdated password policies degrades overall security posture.',
      correctAction: 'Validate enterprise MDM supervision and hardware enclave attestation, then approve passkey enrollment.',
      securityTip: 'Passkeys anchored in hardware enclaves provide phishing resistance while simplifying user authentication workflows.',
    },
    get explanation() {
      return this.fivePartExplanation;
    },
    hints: [
      'Is the mobile device enrolled in enterprise MDM (Intune / Apple Business Manager)?',
      'Does hardware Secure Enclave attestation prove the key was generated securely on the authentic device?',
    ],
  },
];

/**
 * Returns all challenges defined for Room 02.
 */
export function getRoom02Challenges() {
  return ROOM_02_CHALLENGES;
}

/**
 * Finds a Room 02 challenge definition by ID.
 */
export function getRoom02ChallengeById(challengeId) {
  return ROOM_02_CHALLENGES.find((c) => c.challengeId === challengeId);
}

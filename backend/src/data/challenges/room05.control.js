import { TOPICS, SCORING } from '../../utils/constants.js';

/**
 * Authoritative Challenge Definitions for ROOM 05: THE CONTROL ROOM (Multi-Threat Incident Response).
 * Contains 1 Beginner, 3 Intermediate, and 10 Expert challenges.
 * Private validation fields (authoritativeContainmentOrder, authoritativeThreatOrder, explanation) are server-authoritative.
 */
export const ROOM_05_CHALLENGES = [
  // ==========================================
  // BEGINNER (1 Challenge)
  // ==========================================
  {
    challengeId: 'ch-ctrl-01',
    roomId: 'room-05-control',
    topic: TOPICS.MULTI_THREAT,
    difficulty: 'beginner',
    scenarioType: 'ambiguous',
    prompt: 'Prioritize and contain the cascading multi-threat attack to unlock the final facility escape bulkhead.',
    narrative: 'Final Sector. Multiple concurrent cyber incidents are flooding the facility containment core.',
    sanitizedEvidence: {
      type: 'incident_matrix',
      title: 'Sector 05 Emergency Containment Core — Active Incident Feed',
      activeAlarms: [
        {
          id: 'threat_phish_c2',
          vector: 'phishing',
          severity: 'CRITICAL',
          target: 'Primary Domain Controller (DC-01)',
          indicator: 'Continuous TLS beaconing to foreign IP 185.220.101.4 exfiltrating Active Directory NTDS.dit hashes.',
          actionId: 'ACTION_SEVER_DC_C2',
          label: 'Sever DC-01 C2 Link (Isolate Active Exfiltration)',
        },
        {
          id: 'threat_vault_creds',
          vector: 'password_security',
          severity: 'HIGH',
          target: 'Root Cryptographic Vault Keyring',
          indicator: 'Distributed credential stuffing attacking 50,000 breached dictionary passwords against service accounts.',
          actionId: 'ACTION_LOCK_VAULT_CREDS',
          label: 'Revoke Compromised Service Credentials & Enforce FIDO2 Lockout',
        },
        {
          id: 'threat_social_helpdesk',
          vector: 'social_engineering',
          severity: 'HIGH',
          target: 'Enterprise Support Helpdesk Console',
          indicator: 'Attacker impersonating VP Marcus Vance on urgent chat demanding manual MFA token override.',
          actionId: 'ACTION_ISOLATE_HELPDESK_PRETEXT',
          label: 'Quash Helpdesk Social Pretext & Mandate Out-of-Band Phone Call',
        },
        {
          id: 'threat_qr_kiosk',
          vector: 'qr_security',
          severity: 'MEDIUM',
          target: 'Visitor Registration Kiosk (Perimeter Subnet)',
          indicator: 'Physical sticker overlay pasted on kiosk barcode scanner redirecting to Trojanized Android APK.',
          actionId: 'ACTION_PURGE_KIOSK_QR',
          label: 'Sever Visitor Kiosk Network Port & Peel Physical Quishing Sticker',
        },
      ],
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: [
      'c2_traffic_analyzer',
      'vault_audit_log',
      'helpdesk_directory_check',
      'kiosk_firmware_scan',
    ],
    allowedActions: [
      { actionId: 'ACTION_SEVER_DC_C2', label: 'Sever Domain Controller C2 Link (Critical Exfiltration)', variant: 'primary' },
      { actionId: 'ACTION_LOCK_VAULT_CREDS', label: 'Lock Cryptographic Vault Credentials (High Brute-Force)', variant: 'warning' },
      { actionId: 'ACTION_ISOLATE_HELPDESK_PRETEXT', label: 'Deny Helpdesk Pretext & Enforce OOB Verification (High Pretext)', variant: 'warning' },
      { actionId: 'ACTION_PURGE_KIOSK_QR', label: 'Purge Visitor Kiosk QR Node (Medium Perimeter)', variant: 'ghost' },
      { actionId: 'ACTION_CONTAIN_INCIDENT_SEQUENCE', label: 'Execute Prioritized Containment Sequence', variant: 'primary' },
      { actionId: 'ACTION_CONTAIN_C2_FIRST', label: 'Sever Domain Controller C2 Link First', variant: 'primary' },
      { actionId: 'ACTION_RESET_HELPDESK_FIRST', label: 'Address Helpdesk Social Engineering First', variant: 'warning' },
      { actionId: 'ACTION_PURGE_KIOSK_FIRST', label: 'Inspect Visitor Kiosk QR Code First', variant: 'ghost' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_SEVER_DC_C2',
    authoritativeContainmentOrder: [
      'ACTION_SEVER_DC_C2',
      'ACTION_LOCK_VAULT_CREDS',
      'ACTION_ISOLATE_HELPDESK_PRETEXT',
      'ACTION_PURGE_KIOSK_QR',
    ],
    authoritativeThreatOrder: [
      'threat_phish_c2',
      'threat_vault_creds',
      'threat_social_helpdesk',
      'threat_qr_kiosk',
    ],
    privateIndicators: [
      'active_c2_exfiltration: crown jewel DC-01 data actively leaking to 185.220.101.4',
      'vault_brute_force: secondary active attack requiring high-priority cryptographic revocation',
      'helpdesk_pretext: imminent lateral escalation requiring OOB policy enforcement',
      'perimeter_kiosk_qr: low-impact isolated subnet Trojanized APK download',
    ],
    scoringMetadata: {
      basePoints: SCORING.BASE_POINTS_CONTROL_ROOM,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'All cascading intrusions contained in optimal triage priority! Domain Controller isolated, vault locked down, social pretext denied, and rogue kiosk purged. Facility lockdown lifted — ESCAPE COMPLETE!',
      onIncorrect: 'Containment prioritization failure! Delaying critical Domain Controller isolation permitted adversarial lateral movement and data exfiltration.',
    },
    fivePartExplanation: {
      whatHappened: 'You selected an inappropriate containment priority or submitted an invalid containment sequence under high-stress multi-threat conditions.',
      evidence: 'The Domain Controller was actively beaconing Active Directory hashes to an external C2 server (Critical), whereas the kiosk QR and secondary vectors posed lower immediate damage.',
      whyDangerous: 'In incident triage, failing to contain active data exfiltration first allows attackers to harvest crown jewel assets permanently.',
      correctAction: 'Prioritize containment based on active data loss and asset criticality: First sever the active C2 exfiltration, then lock down vault credentials, then neutralize social pretexts, and finally purge perimeter QR nodes.',
      securityTip: 'In multi-vector cybersecurity incidents, always triage by: Active Exploit / Data Loss > Crown Jewel Assets > Secondary Vectors > Perimeter Decoys.',
    },
    hints: [
      'Evaluate the active threat alarms by potential damage: Is data actively leaving the facility, or is an attacker still attempting to gain access?',
      'Prioritize the Domain Controller C2 exfiltration first, followed by the cryptographic vault, helpdesk social pretext, and perimeter kiosk.',
    ],
  },

  // ==========================================
  // INTERMEDIATE (3 Challenges)
  // ==========================================
  {
    challengeId: 'ch-ctrl-int-01',
    roomId: 'room-05-control',
    topic: TOPICS.MULTI_THREAT,
    difficulty: 'intermediate',
    scenarioType: 'legitimate',
    prompt: 'Triage this simultaneous SAN snapshot replication, Nessus vulnerability scan, and edge health-check telemetry surge during the scheduled 02:00 UTC maintenance window.',
    narrative: 'Containment core alerts flag high storage throughput and subnet port sweeps at 02:15 UTC.',
    sanitizedEvidence: {
      type: 'incident_matrix',
      title: 'Incident Feed: Storage Throughput Surge vs Vulnerability Scanner Activity',
      activeAlarms: [
        {
          id: 'threat_san_replication',
          vector: 'multi_threat',
          severity: 'MEDIUM',
          target: 'SAN Storage Fabric (SAN-FABRIC-01)',
          indicator: 'Continuous 8.2 GB/s Fibre Channel block replication to offsite disaster recovery site matching Change Request CR-94021.',
          actionId: 'ACTION_VERIFY_MAINTENANCE_WINDOW_BASELINE',
          label: 'Verify Authorized Maintenance Window CR-94021 & Acknowledge Scheduled SAN Snapshot',
        },
        {
          id: 'threat_nessus_scan',
          vector: 'password_security',
          severity: 'MEDIUM',
          target: 'Core Database & App Subnets',
          indicator: 'Authorized Tenable Nessus vulnerability scanner (10.0.99.50) performing scheduled credentialed security audit sweep.',
          actionId: 'ACTION_CONFIRM_NESSUS_SCAN_SCHEDULE',
          label: 'Confirm Scheduled SecOps Vulnerability Sweep & Log Ingest',
        },
        {
          id: 'threat_gateway_health',
          vector: 'phishing',
          severity: 'LOW',
          target: 'Perimeter Edge Gateways',
          indicator: 'Routine ICMP echo / KeepAlive telemetry ping every 5 seconds from central network monitoring cluster.',
          actionId: 'ACTION_ACKNOWLEDGE_HEALTH_PING',
          label: 'Acknowledge Routine Edge Gateway Health Monitoring',
        },
      ],
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['c2_traffic_analyzer', 'vault_audit_log'],
    allowedActions: [
      { actionId: 'ACTION_VERIFY_MAINTENANCE_WINDOW_BASELINE', label: 'Verify Authorized Maintenance Window & Acknowledge SAN Snapshot (Legitimate Baseline)', variant: 'primary' },
      { actionId: 'ACTION_SEVER_SAN_FIBRE_CHANNEL', label: 'Sever SAN Fibre Channel & Freeze Replication (False Positive Knee-Jerk)', variant: 'warning' },
      { actionId: 'ACTION_BLOCK_VULN_SCANNER_IP', label: 'Block Internal Vulnerability Scanner IP 10.0.99.50 on Firewalls', variant: 'warning' },
      { actionId: 'ACTION_CONTAIN_INCIDENT_SEQUENCE', label: 'Execute Prioritized Containment Sequence', variant: 'primary' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_VERIFY_MAINTENANCE_WINDOW_BASELINE',
    authoritativeContainmentOrder: [
      'ACTION_VERIFY_MAINTENANCE_WINDOW_BASELINE',
      'ACTION_CONFIRM_NESSUS_SCAN_SCHEDULE',
      'ACTION_ACKNOWLEDGE_HEALTH_PING',
    ],
    authoritativeThreatOrder: [
      'threat_san_replication',
      'threat_nessus_scan',
      'threat_gateway_health',
    ],
    privateIndicators: [
      'san_volume_replication: authorized change request CR-94021 scheduled for 02:00-04:00 UTC',
      'nessus_vulnerability_scan: authenticated SecOps scan from dedicated management IP 10.0.99.50',
      'edge_health_pings: routine network operations center telemetry',
    ],
    scoringMetadata: {
      basePoints: 1200,
      targetTimeSeconds: 40,
    },
    consequenceData: {
      onCorrect: 'Operational baseline verified! Storage replication and vulnerability compliance auditing proceeded cleanly without false panic.',
      onIncorrect: 'False-positive containment failure! Severing SAN Fibre Channel aborted critical database replication and corrupted in-flight snapshots.',
    },
    fivePartExplanation: {
      whatHappened: 'You severed storage connections or blocked internal vulnerability scanning during an authorized, pre-scheduled maintenance window.',
      evidence: 'Telemetry explicitly correlated the 8.2 GB/s SAN replication with approved Change Request CR-94021 and authenticated Nessus auditing from known SecOps IP 10.0.99.50.',
      whyDangerous: 'Reacting with emergency incident containment during scheduled maintenance causes unnecessary business outages, corrupts in-flight database snapshots, and wastes SOC incident response resources.',
      correctAction: 'Cross-reference anomalous traffic surges with the approved Change Management calendar (CR-94021) and acknowledge the scheduled operational activity instead of severing production links.',
      securityTip: 'Effective SOC triage requires distinguishing authorized administrative maintenance from adversarial activity by verifying change management tickets and source IP origin.',
    },
    hints: [
      'Check the timestamp and change management ticket reference: Was this high-throughput activity pre-approved for 02:00 UTC?',
      'Does high storage replication during an approved maintenance window indicate an attack or legitimate operational baseline?',
    ],
  },

  {
    challengeId: 'ch-ctrl-int-02',
    roomId: 'room-05-control',
    topic: TOPICS.MULTI_THREAT,
    difficulty: 'intermediate',
    scenarioType: 'malicious',
    prompt: 'Triage this simultaneous ransomware staging, lateral SMB traversal, and external port scan incident feed.',
    narrative: 'Containment core telemetry indicates rapid adversary movement towards corporate backup repositories.',
    sanitizedEvidence: {
      type: 'incident_matrix',
      title: 'Incident Feed: Ransomware Infiltration vs Network Perimeter',
      activeAlarms: [
        {
          id: 'threat_ransomware_staging',
          vector: 'multi_threat',
          severity: 'CRITICAL',
          target: 'Primary File Server (FS-01)',
          indicator: 'Execution of vssadmin delete shadows /all /quiet and mass batch encryption in progress (.locked extensions).',
          actionId: 'ACTION_ISOLATE_FILE_SERVER',
          label: 'Sever FS-01 Network Interfaces & Freeze Storage Volumes',
        },
        {
          id: 'threat_smb_traversal',
          vector: 'password_security',
          severity: 'HIGH',
          target: 'Internal Subnet Workstations',
          indicator: 'PsExec lateral execution spreading using compromised service account credentials over SMB port 445.',
          actionId: 'ACTION_BLOCK_LATERAL_SMB',
          label: 'Block Lateral SMB Port 445 Across Host Firewalls',
        },
        {
          id: 'threat_port_scan',
          vector: 'phishing',
          severity: 'LOW',
          target: 'Perimeter Edge Gateway',
          indicator: 'Inbound SYN port scan originating from internet IP range probing public port 80/443.',
          actionId: 'ACTION_DISMISS_PORT_SCAN',
          label: 'Log Perimeter Port Scan as Routine Noise',
        },
      ],
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['c2_traffic_analyzer', 'vault_audit_log'],
    allowedActions: [
      { actionId: 'ACTION_ISOLATE_FILE_SERVER', label: 'Sever FS-01 Network Interfaces & Freeze Storage Volumes (Critical)', variant: 'primary' },
      { actionId: 'ACTION_BLOCK_LATERAL_SMB', label: 'Block Lateral SMB Port 445 Across Host Firewalls (High)', variant: 'warning' },
      { actionId: 'ACTION_DISMISS_PORT_SCAN', label: 'Address Perimeter Port Scan on Edge Gateway (Low)', variant: 'ghost' },
      { actionId: 'ACTION_CONTAIN_INCIDENT_SEQUENCE', label: 'Execute Prioritized Containment Sequence', variant: 'primary' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_ISOLATE_FILE_SERVER',
    authoritativeContainmentOrder: [
      'ACTION_ISOLATE_FILE_SERVER',
      'ACTION_BLOCK_LATERAL_SMB',
      'ACTION_DISMISS_PORT_SCAN',
    ],
    authoritativeThreatOrder: [
      'threat_ransomware_staging',
      'threat_smb_traversal',
      'threat_port_scan',
    ],
    privateIndicators: [
      'active_ransomware_encryption: vssadmin shadow deletion represents immediate irrecoverable loss',
      'lateral_movement: secondary propagation vector requiring containment after isolating source',
      'perimeter_port_scan: low-priority background internet scanning',
    ],
    scoringMetadata: {
      basePoints: 1200,
      targetTimeSeconds: 40,
    },
    consequenceData: {
      onCorrect: 'Ransomware outbreak quarantined! Primary file server isolated before backup volumes could be encrypted.',
      onIncorrect: 'Ransomware failure! Focusing on perimeter scans allowed ransomware to destroy shadow copies and encrypt all corporate shares.',
    },
    fivePartExplanation: {
      whatHappened: 'You prioritized perimeter noise or secondary propagation over active, irreversible ransomware file encryption.',
      evidence: 'FS-01 was actively deleting shadow copies and encrypting files, representing imminent catastrophic operational destruction.',
      whyDangerous: 'Once shadow copies are purged and encryption keys rotate, data recovery is impossible without paying criminal ransoms.',
      correctAction: 'Isolate actively encrypting servers immediately from network interfaces, then block lateral propagation mechanisms.',
      securityTip: 'In incident triage, always isolate active irreversible destruction first before addressing secondary propagation or reconnaissance.',
    },
    hints: [
      'Which alarm represents active, irreversible destruction of facility data right now?',
      'Is an internet port scan more dangerous than a file server actively deleting backups and encrypting documents?',
    ],
  },

  {
    challengeId: 'ch-ctrl-int-03',
    roomId: 'room-05-control',
    topic: TOPICS.MULTI_THREAT,
    difficulty: 'intermediate',
    scenarioType: 'ambiguous',
    prompt: 'Investigate an off-hours break-glass administrative VPN session coinciding with high CPU utilization and process termination on the primary database.',
    narrative: 'Sensors detect a privileged root terminal opened via VPN at 03:22 AM executing process kill commands during an active service degradation.',
    sanitizedEvidence: {
      type: 'incident_matrix',
      title: 'Incident Feed: Off-Hours Root Shell vs Production Database Degradation',
      activeAlarms: [
        {
          id: 'threat_emergency_vpn',
          vector: 'multi_threat',
          severity: 'HIGH',
          target: 'Primary Payment Database (DB-PROD-01)',
          indicator: 'Break-glass root SSH session initiated over VPN from IP 198.51.100.44 using YubiKey hardware token registered to lead SRE Marcus Vance.',
          actionId: 'ACTION_AUDIT_ONCALL_PAGERDUTY_INCIDENT',
          label: 'Cross-Reference On-Call Incident Bridge & PagerDuty Roster Before Terminating Admin VPN Session',
        },
        {
          id: 'threat_db_cpu_spike',
          vector: 'password_security',
          severity: 'HIGH',
          target: 'Database Compute Node Cluster',
          indicator: 'CPU utilization spiked to 99% following 50 hung deadlocked transactions in settlement processing.',
          actionId: 'ACTION_VERIFY_DB_HEALTH',
          label: 'Verify Database Deadlock Resolution State & Transaction Log Pipeline',
        },
        {
          id: 'threat_unmonitored_kill_cmd',
          vector: 'social_engineering',
          severity: 'MEDIUM',
          target: 'Interactive Terminal Shell',
          indicator: 'Interactive shell executing "kill -9" on runaway worker PID 88419 matching documented recovery procedure.',
          actionId: 'ACTION_LOG_BREAK_GLASS_SESSION',
          label: 'Require Emergency Incident Ticket Reference in Break-Glass Session Log',
        },
      ],
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['c2_traffic_analyzer', 'vault_audit_log'],
    allowedActions: [
      { actionId: 'ACTION_AUDIT_ONCALL_PAGERDUTY_INCIDENT', label: 'Cross-Reference On-Call Incident Bridge Before Terminating Admin VPN (Investigate Ambiguity)', variant: 'primary' },
      { actionId: 'ACTION_TERMINATE_VPN_SESSION', label: 'Immediately Sever VPN Session & Lock Marcus Vance Account (Knee-Jerk Panic)', variant: 'warning' },
      { actionId: 'ACTION_FORCE_REBOOT_DB_NODE', label: 'Force Emergency Reboot of Primary Database Node DB-PROD-01', variant: 'danger' },
      { actionId: 'ACTION_CONTAIN_INCIDENT_SEQUENCE', label: 'Execute Prioritized Containment Sequence', variant: 'primary' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_AUDIT_ONCALL_PAGERDUTY_INCIDENT',
    authoritativeContainmentOrder: [
      'ACTION_AUDIT_ONCALL_PAGERDUTY_INCIDENT',
      'ACTION_VERIFY_DB_HEALTH',
      'ACTION_LOG_BREAK_GLASS_SESSION',
    ],
    authoritativeThreatOrder: [
      'threat_emergency_vpn',
      'threat_db_cpu_spike',
      'threat_unmonitored_kill_cmd',
    ],
    privateIndicators: [
      'break_glass_admin_access: session authenticated with hardware YubiKey token registered to on-call engineer',
      'deadlocked_database: 99% CPU caused by runaway hung query being cleared per runbook',
      'pagerduty_incident_4812: active Sev-1 incident bridge currently open with engineering lead',
    ],
    scoringMetadata: {
      basePoints: 1200,
      targetTimeSeconds: 40,
    },
    consequenceData: {
      onCorrect: 'Incident deconfliction verified! On-call SRE was actively clearing deadlocked worker threads on PagerDuty bridge #4812. Premature account termination averted.',
      onIncorrect: 'Critical operational disruption! Abruptly severing the on-call engineer\'s VPN session stranded a hung database transaction, causing widespread checkout downtime.',
    },
    fivePartExplanation: {
      whatHappened: 'You terminated a break-glass administrative session or rebooted a production database without verifying whether the on-call engineer was resolving an active incident.',
      evidence: 'The SSH session was authenticated via hardware YubiKey MFA and executing documented recovery runbook commands ("kill -9 runaway PID") during a Sev-1 database deadlock.',
      whyDangerous: 'Knee-jerk locking out on-call engineers while they are actively resolving a Sev-1 outage prolongs customer-facing downtime and risks database transaction log corruption.',
      correctAction: 'Cross-reference break-glass administrative sessions with active PagerDuty incidents and on-call communication channels before pulling emergency kill switches.',
      securityTip: 'Security Operations should integrate SIEM break-glass alerting with PagerDuty / Opsgenie to automatically correlate off-hours admin sessions with active incident bridges.',
    },
    hints: [
      'Is this root session authenticated with a hardware YubiKey, and does the command execution match an emergency recovery runbook?',
      'Check whether an active PagerDuty incident bridge is currently open before severing an engineer\'s emergency access.',
    ],
  },

  // ==========================================
  // EXPERT (10 Challenges)
  // ==========================================
  {
    challengeId: 'ch-ctrl-exp-01',
    roomId: 'room-05-control',
    topic: TOPICS.MULTI_THREAT,
    difficulty: 'expert',
    scenarioType: 'malicious',
    prompt: 'Contain an active Kubernetes container breakout (CVE-2024-21626) exfiltrating AWS node IAM credentials.',
    narrative: 'Sensors detect a container breakout on Kubernetes cluster worker node worker-k8s-07 traversing into the host kernel.',
    sanitizedEvidence: {
      type: 'incident_matrix',
      title: 'Incident Feed: Container Breakout vs Node IAM Theft',
      activeAlarms: [
        {
          id: 'threat_runc_escape',
          vector: 'multi_threat',
          severity: 'CRITICAL',
          target: 'Kubernetes Worker Node (worker-k8s-07)',
          indicator: 'Pod exploited CVE-2024-21626 (runc fd leak) escaping container isolation to host filesystem and writing to /proc/sysrq-trigger.',
          actionId: 'ACTION_ISOLATE_KUBE_NODE_REVOKE_IAM',
          label: 'Cordon & Drain Node worker-k8s-07, Terminate Rogue Pods & Revoke Compromised IAM Role',
        },
        {
          id: 'threat_imds_theft',
          vector: 'password_security',
          severity: 'HIGH',
          target: 'Cloud Instance Metadata Service (IMDSv2)',
          indicator: 'Attacker querying IMDS to extract temporary NodeRole IAM STS credentials and execute aws sts get-caller-identity.',
          actionId: 'ACTION_REVOKE_NODE_IAM_STS',
          label: 'Revoke NodeRole IAM STS Session & Enforce Hop Limit 1',
        },
        {
          id: 'threat_daemonset_persist',
          vector: 'social_engineering',
          severity: 'HIGH',
          target: 'Cluster Master API Server',
          indicator: 'Unauthorized privileged DaemonSet manifest submitted with hostPID=true and privileged:true.',
          actionId: 'ACTION_PURGE_PRIVILEGED_DAEMONSET',
          label: 'Delete Unauthorized Privileged DaemonSet from API Server',
        },
        {
          id: 'threat_ingress_cert_warning',
          vector: 'qr_security',
          severity: 'LOW',
          target: 'Public Ingress Controller',
          indicator: 'Ingress TLS certificate expiry warning scheduled for 14 days out.',
          actionId: 'ACTION_RENEW_INGRESS_CERT',
          label: 'Acknowledge Ingress TLS Renewal Warning',
        },
      ],
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['c2_traffic_analyzer', 'vault_audit_log'],
    allowedActions: [
      { actionId: 'ACTION_ISOLATE_KUBE_NODE_REVOKE_IAM', label: 'Cordon & Drain Node worker-k8s-07 & Revoke NodeRole IAM (Critical)', variant: 'primary' },
      { actionId: 'ACTION_PURGE_PRIVILEGED_DAEMONSET', label: 'Delete Unauthorized Privileged DaemonSet (High)', variant: 'warning' },
      { actionId: 'ACTION_REVOKE_NODE_IAM_STS', label: 'Revoke NodeRole IAM STS Session (High)', variant: 'warning' },
      { actionId: 'ACTION_RENEW_INGRESS_CERT', label: 'Acknowledge Ingress TLS Renewal (Low)', variant: 'ghost' },
      { actionId: 'ACTION_CONTAIN_INCIDENT_SEQUENCE', label: 'Execute Prioritized Containment Sequence', variant: 'primary' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_ISOLATE_KUBE_NODE_REVOKE_IAM',
    authoritativeContainmentOrder: [
      'ACTION_ISOLATE_KUBE_NODE_REVOKE_IAM',
      'ACTION_REVOKE_NODE_IAM_STS',
      'ACTION_PURGE_PRIVILEGED_DAEMONSET',
      'ACTION_RENEW_INGRESS_CERT',
    ],
    authoritativeThreatOrder: [
      'threat_runc_escape',
      'threat_imds_theft',
      'threat_daemonset_persist',
      'threat_ingress_cert_warning',
    ],
    privateIndicators: [
      'runc_container_escape: active host root filesystem compromise on worker-k8s-07',
      'imds_credential_theft: attacker escalating from container escape to AWS cloud environment',
      'cluster_persistence: privileged DaemonSet staged to infect all nodes',
    ],
    scoringMetadata: {
      basePoints: 1500,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'Container breakout quarantined! Node cordoned, rogue pods terminated, and compromised IAM role revoked before cloud pivot occurred.',
      onIncorrect: 'Cloud infrastructure compromise! Failure to isolate worker-k8s-07 allowed the attacker to use stolen IAM credentials to drain cloud databases.',
    },
    fivePartExplanation: {
      whatHappened: 'An attacker exploited a runc file descriptor vulnerability to break out of a container and access the host node and cloud metadata service.',
      evidence: 'Host logs on worker-k8s-07 recorded container breakout commands paired with calls to the IMDS metadata service for NodeRole credentials.',
      whyDangerous: 'Once an attacker escapes to the host node in a cloud Kubernetes cluster, they inherit the node\'s IAM privileges and can pivot across the entire cloud tenant.',
      correctAction: 'Cordon and drain the compromised worker node immediately, terminate rogue pods, and revoke the node\'s IAM credentials.',
      securityTip: 'Enforce IMDSv2 with a maximum hop limit of 1 to prevent containerized workloads from querying node IAM metadata.',
    },
    hints: [
      'Which alarm represents active breakout from container sandboxing into host kernel space?',
      'Prioritize isolating the compromised Kubernetes node and revoking its cloud credentials over addressing routine certificate notices.',
    ],
  },

  {
    challengeId: 'ch-ctrl-exp-02',
    roomId: 'room-05-control',
    topic: TOPICS.MULTI_THREAT,
    difficulty: 'expert',
    scenarioType: 'legitimate',
    prompt: 'Triage a massive 40 Gbps outbound dark fiber data surge and simultaneous datastore mounting across the secondary data center.',
    narrative: 'Network boundary monitors report saturated 40 Gbps link throughput to the secondary disaster recovery site at 04:00 UTC.',
    sanitizedEvidence: {
      type: 'incident_matrix',
      title: 'Incident Feed: Dark Fiber Bandwidth Surge vs Standby Storage Sync',
      activeAlarms: [
        {
          id: 'threat_dr_cross_replication',
          vector: 'multi_threat',
          severity: 'MEDIUM',
          target: 'Dark Fiber Interface DF-01 (Secondary Datacenter West)',
          indicator: 'Continuous 40 Gbps outbound block replication surge matching scheduled semi-annual disaster recovery drill CR-DR-Q3-009 approved by VP Infrastructure.',
          actionId: 'ACTION_VALIDATE_DR_DRILL_AUTHORIZATION',
          label: 'Confirm Scheduled DR Drill in Change Management CR-DR-Q3-009 & Acknowledge Warm-Site Sync',
        },
        {
          id: 'threat_vcenter_datastore_mount',
          vector: 'password_security',
          severity: 'MEDIUM',
          target: 'Secondary Warm-Site ESXi Hypervisors',
          indicator: 'Automated orchestration script simultaneously registering 120 production VM datastores in standby state.',
          actionId: 'ACTION_CONFIRM_ORCHESTRATION_LOGS',
          label: 'Confirm Automated DR Orchestration Scripts & Log Sync Milestones',
        },
        {
          id: 'threat_dns_ttl_countdown',
          vector: 'phishing',
          severity: 'LOW',
          target: 'Global Route 53 DNS Traffic Director',
          indicator: 'Health check polling frequency increased from 300s to 10s for scheduled failover latency benchmark.',
          actionId: 'ACTION_LOG_HEALTH_CHECK_TEST',
          label: 'Log DNS Failover Health Check Benchmark Metric',
        },
        {
          id: 'threat_dr_sms_broadcast',
          vector: 'social_engineering',
          severity: 'LOW',
          target: 'Emergency NOC Notification Channel',
          indicator: 'PagerDuty broadcast logged: "Scheduled DR failover drill CR-DR-Q3-009 commences at 04:00 UTC."',
          actionId: 'ACTION_ACKNOWLEDGE_PAGERDUTY_BROADCAST',
          label: 'Acknowledge NOC Team DR Drill Active Notification',
        },
      ],
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['c2_traffic_analyzer', 'vault_audit_log'],
    allowedActions: [
      { actionId: 'ACTION_VALIDATE_DR_DRILL_AUTHORIZATION', label: 'Confirm Scheduled DR Drill CR-DR-Q3-009 & Acknowledge Warm-Site Sync (Legitimate Baseline)', variant: 'primary' },
      { actionId: 'ACTION_SEVER_DARK_FIBRE_LINK', label: 'Sever Dark Fiber DF-01 Interface (False Positive Knee-Jerk)', variant: 'warning' },
      { actionId: 'ACTION_UNMOUNT_STANDBY_DATASTORES', label: 'Forcefully Unmount Standby Datastores on Secondary Hypervisors', variant: 'warning' },
      { actionId: 'ACTION_CONTAIN_INCIDENT_SEQUENCE', label: 'Execute Prioritized Containment Sequence', variant: 'primary' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_VALIDATE_DR_DRILL_AUTHORIZATION',
    authoritativeContainmentOrder: [
      'ACTION_VALIDATE_DR_DRILL_AUTHORIZATION',
      'ACTION_CONFIRM_ORCHESTRATION_LOGS',
      'ACTION_LOG_HEALTH_CHECK_TEST',
      'ACTION_ACKNOWLEDGE_PAGERDUTY_BROADCAST',
    ],
    authoritativeThreatOrder: [
      'threat_dr_cross_replication',
      'threat_vcenter_datastore_mount',
      'threat_dns_ttl_countdown',
      'threat_dr_sms_broadcast',
    ],
    privateIndicators: [
      'authorized_dr_drill: ticket CR-DR-Q3-009 approved by VP Infrastructure for semi-annual DR verification',
      'expected_bandwidth_spike: 40 Gbps storage block sync is expected baseline during full warm-site cutover test',
      'pagerduty_deconfliction: active alert broadcast matches current drill phase',
    ],
    scoringMetadata: {
      basePoints: 1500,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'Disaster recovery validation verified! Warm-site replication and standby hypervisor registration completed cleanly without interrupting enterprise operations.',
      onIncorrect: 'Critical drill interruption! Severing the dark fiber link aborted a $200,000 regulatory DR compliance audit and corrupted standby VM replication pools.',
    },
    fivePartExplanation: {
      whatHappened: 'You severed dark fiber connections or unmounted storage during an authorized, pre-scheduled Disaster Recovery failover drill.',
      evidence: 'The 40 Gbps bandwidth spike correlated exactly with approved Change Request CR-DR-Q3-009 and PagerDuty notifications sent to the infrastructure team.',
      whyDangerous: 'Knee-jerk isolation of disaster recovery infrastructure aborts mandatory regulatory compliance tests and can leave warm-site backups desynchronized.',
      correctAction: 'Verify high-bandwidth replication against approved Change Management records (CR-DR-Q3-009) and acknowledge the scheduled operational test.',
      securityTip: 'Correlate high-volume replication alerts with enterprise change management schedules to prevent mistaking scheduled disaster recovery exercises for data exfiltration.',
    },
    hints: [
      'Does this high-throughput dark fiber transfer match an approved semi-annual DR change request ticket (CR-DR-Q3-009)?',
      'Is high bandwidth between corporate data centers during an authorized DR window malicious or expected operational baseline?',
    ],
  },

  {
    challengeId: 'ch-ctrl-exp-03',
    roomId: 'room-05-control',
    topic: TOPICS.MULTI_THREAT,
    difficulty: 'expert',
    scenarioType: 'malicious',
    prompt: 'Contain an active BGP prefix hijack and DNS cache poisoning diverting enterprise authentication traffic to a rogue IdP.',
    narrative: 'Global sensors detect unauthorized BGP route announcements and DNS cache poisoning targeting corporate SSO authentication.',
    sanitizedEvidence: {
      type: 'incident_matrix',
      title: 'Incident Feed: BGP Hijack & DNS Cache Poisoning vs Secondary Routing',
      activeAlarms: [
        {
          id: 'threat_bgp_hijack',
          vector: 'multi_threat',
          severity: 'CRITICAL',
          target: 'Corporate SSO Gateway (auth.facility.com)',
          indicator: 'Rogue Autonomous System AS209871 announcing unauthorized /24 prefix hijacking enterprise SSO gateway traffic.',
          actionId: 'ACTION_REROUTE_BGP_RPKI_ENFORCE',
          label: 'Enforce RPKI Origin Validation, Announce BGP More-Specifics & Flush DNS Caches',
        },
        {
          id: 'threat_dns_cache_poison',
          vector: 'password_security',
          severity: 'CRITICAL',
          target: 'Core Recursive DNS Resolvers',
          indicator: 'Cache poisoning injection redirecting SAML validation endpoints to foreign IP 91.240.118.52.',
          actionId: 'ACTION_PURGE_CORRUPT_DNS_CACHE',
          label: 'Flush Poisoned DNS Resolver Caches & Enforce DNSSEC Validation',
        },
        {
          id: 'threat_fake_sso_portal',
          vector: 'phishing',
          severity: 'HIGH',
          target: 'Active Directory Federated Users',
          indicator: 'Cloned login portal harvesting enterprise credentials and session cookies from redirected staff.',
          actionId: 'ACTION_REVOKE_COMPROMISED_SSO_TOKENS',
          label: 'Revoke SSO Session Tokens Issued in Last 60 Minutes',
        },
        {
          id: 'threat_bgp_route_flap',
          vector: 'qr_security',
          severity: 'LOW',
          target: 'Secondary Transit Provider Link',
          indicator: 'Transient route flapping on backup ISP interface.',
          actionId: 'ACTION_DISMISS_BGP_ROUTE_FLAP',
          label: 'Log Secondary Transit Flapping as ISP Maintenance',
        },
      ],
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['c2_traffic_analyzer', 'vault_audit_log'],
    allowedActions: [
      { actionId: 'ACTION_REROUTE_BGP_RPKI_ENFORCE', label: 'Enforce RPKI Route Origin Validation & Announce More-Specifics (Critical)', variant: 'primary' },
      { actionId: 'ACTION_PURGE_CORRUPT_DNS_CACHE', label: 'Flush Poisoned DNS Caches & Enforce DNSSEC (Critical)', variant: 'primary' },
      { actionId: 'ACTION_REVOKE_COMPROMISED_SSO_TOKENS', label: 'Revoke Recent SSO Session Tokens (High)', variant: 'warning' },
      { actionId: 'ACTION_DISMISS_BGP_ROUTE_FLAP', label: 'Log Secondary Transit Flap (Low)', variant: 'ghost' },
      { actionId: 'ACTION_CONTAIN_INCIDENT_SEQUENCE', label: 'Execute Prioritized Containment Sequence', variant: 'primary' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_REROUTE_BGP_RPKI_ENFORCE',
    authoritativeContainmentOrder: [
      'ACTION_REROUTE_BGP_RPKI_ENFORCE',
      'ACTION_PURGE_CORRUPT_DNS_CACHE',
      'ACTION_REVOKE_COMPROMISED_SSO_TOKENS',
      'ACTION_DISMISS_BGP_ROUTE_FLAP',
    ],
    authoritativeThreatOrder: [
      'threat_bgp_hijack',
      'threat_dns_cache_poison',
      'threat_fake_sso_portal',
      'threat_bgp_route_flap',
    ],
    privateIndicators: [
      'bgp_prefix_hijacking: rogue AS stealing authentication traffic globally',
      'dns_cache_poisoning: forged records directing users to adversary-controlled harvesting portal',
      'credential_interception: enterprise SSO sessions actively compromised',
    ],
    scoringMetadata: {
      basePoints: 1500,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'BGP hijack neutralized! RPKI validation enforced, more-specific prefixes announced, and poisoned DNS caches purged before master tokens leaked.',
      onIncorrect: 'Mass enterprise credential harvesting! Diverted authentication traffic fed thousands of employee passwords directly into adversary servers.',
    },
    fivePartExplanation: {
      whatHappened: 'An adversary announced rogue BGP routes to intercept enterprise Single Sign-On traffic paired with DNS cache poisoning.',
      evidence: 'Global BGP tables recorded AS209871 advertising an illegitimate /24 route covering auth.facility.com while recursive DNS resolvers served forged IPs.',
      whyDangerous: 'BGP hijacking diverts traffic at the internet backbone level, enabling man-in-the-middle credential interception for thousands of users simultaneously.',
      correctAction: 'Enforce RPKI Route Origin Validation, publish BGP more-specific announcements, flush poisoned DNS caches, and revoke compromised SSO tokens.',
      securityTip: 'Deploy RPKI with ROA (Route Origin Authorization) and enforce strict BGP prefix filtering with upstream Tier-1 transit providers.',
    },
    hints: [
      'What action restores internet routing integrity when a rogue Autonomous System hijacks your IP space?',
      'Prioritize reclaiming your BGP route origin and purging DNS caches over individual token cleanups.',
    ],
  },

  {
    challengeId: 'ch-ctrl-exp-04',
    roomId: 'room-05-control',
    topic: TOPICS.MULTI_THREAT,
    difficulty: 'expert',
    scenarioType: 'ambiguous',
    prompt: 'Investigate a sudden 500% egress bandwidth spike (50 Gbps) across perimeter edge gateways during a global product release window.',
    narrative: 'Perimeter firewall alarms indicate continuous 50 Gbps outbound traffic across Edge-GW-01 coincident with a scheduled firmware release.',
    sanitizedEvidence: {
      type: 'incident_matrix',
      title: 'Incident Feed: Perimeter Bandwidth Surge vs CDN Origin Distribution',
      activeAlarms: [
        {
          id: 'threat_edge_bandwidth_surge',
          vector: 'multi_threat',
          severity: 'HIGH',
          target: 'Perimeter Edge Gateway (Edge-GW-01)',
          indicator: 'Egress bandwidth saturated at 96% capacity (50 Gbps outbound) with high TCP session creation rate.',
          actionId: 'ACTION_ANALYZE_NETFLOW_CANARY_ROLLOUT',
          label: 'Analyze NetFlow Telemetry to Correlate Egress with Authorized CDN Firmware Distribution Window',
        },
        {
          id: 'threat_cdn_origin_pull',
          vector: 'password_security',
          severity: 'MEDIUM',
          target: 'Origin Distribution Storage Bucket',
          indicator: '8,000 concurrent origin cache-miss requests downloading signed IoT firmware package /firmware/v4.2.0.bin.',
          actionId: 'ACTION_CORRELATE_CDN_ORIGIN_PULLS',
          label: 'Verify CDN Origin Request Distribution & Check Firmware Hash',
        },
        {
          id: 'threat_concurrent_socket_spike',
          vector: 'phishing',
          severity: 'MEDIUM',
          target: 'Edge NAT Translation Table',
          indicator: '45,000 new outbound TCP connections per minute from global CDN edge points.',
          actionId: 'ACTION_VERIFY_FIRMWARE_RELEASE_WINDOW',
          label: 'Cross-Reference Release Schedule Ticket REL-420-IOT',
        },
        {
          id: 'threat_bgp_telemetry',
          vector: 'qr_security',
          severity: 'LOW',
          target: 'BGP Peering Telemetry',
          indicator: 'Inbound flow stats confirming traffic destined for Akamai/Cloudflare IP blocks.',
          actionId: 'ACTION_LOG_PEERING_TELEMETRY',
          label: 'Log Peering Traffic Telemetry',
        },
      ],
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['c2_traffic_analyzer', 'vault_audit_log'],
    allowedActions: [
      { actionId: 'ACTION_ANALYZE_NETFLOW_CANARY_ROLLOUT', label: 'Analyze NetFlow Telemetry to Correlate Egress with CDN Rollout (Investigate Ambiguity)', variant: 'primary' },
      { actionId: 'ACTION_BLACKHOLE_EDGE_TRAFFIC', label: 'Blackhole Outbound Egress & Sever 50 Gbps Connection (Knee-Jerk Panic)', variant: 'warning' },
      { actionId: 'ACTION_RATE_LIMIT_ALL_TRAFFIC', label: 'Throttle Perimeter Gateway Bandwidth to 1 Gbps', variant: 'warning' },
      { actionId: 'ACTION_CONTAIN_INCIDENT_SEQUENCE', label: 'Execute Prioritized Containment Sequence', variant: 'primary' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_ANALYZE_NETFLOW_CANARY_ROLLOUT',
    authoritativeContainmentOrder: [
      'ACTION_ANALYZE_NETFLOW_CANARY_ROLLOUT',
      'ACTION_CORRELATE_CDN_ORIGIN_PULLS',
      'ACTION_VERIFY_FIRMWARE_RELEASE_WINDOW',
      'ACTION_LOG_PEERING_TELEMETRY',
    ],
    authoritativeThreatOrder: [
      'threat_edge_bandwidth_surge',
      'threat_cdn_origin_pull',
      'threat_concurrent_socket_spike',
      'threat_bgp_telemetry',
    ],
    privateIndicators: [
      'cdn_origin_cache_miss_surge: global firmware rollout caused spike in origin pulls from verified CDN IP ranges',
      'signed_firmware_package: hash matches approved build manifest for v4.2.0.bin',
      'investigate_before_blocking: severing connection breaks firmware updates for 200,000 devices',
    ],
    scoringMetadata: {
      basePoints: 1500,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'NetFlow analysis confirmed legitimate CDN origin pulls! Firmware distribution verified without causing customer-facing service blackout.',
      onIncorrect: 'Disastrous global outage! Knee-jerk rate-limiting or severing edge interfaces severed firmware updates to 200,000 active devices worldwide.',
    },
    fivePartExplanation: {
      whatHappened: 'You severed perimeter interfaces or throttled traffic during an authorized global firmware release without investigating NetFlow sources.',
      evidence: 'NetFlow analysis revealed that 99% of outbound traffic was origin pulls from verified CDN edge servers downloading approved firmware release v4.2.0.bin.',
      whyDangerous: 'Treating legitimate high-volume distribution as an exfiltration attack and pulling emergency kill-switches results in massive customer outages and breach of SLAs.',
      correctAction: 'Analyze NetFlow telemetry, inspect request URLs and destination ASN ranges, and cross-reference release management tickets before taking containment action.',
      securityTip: 'Use Content Delivery Networks (CDNs) with origin shield caching to smooth out egress spikes during major software distribution events.',
    },
    hints: [
      'Is the destination of the 50 Gbps traffic verified CDN networks downloading an approved firmware package?',
      'Investigate the NetFlow telemetry to verify the data distribution before abruptly cutting off perimeter bandwidth.',
    ],
  },

  {
    challengeId: 'ch-ctrl-exp-05',
    roomId: 'room-05-control',
    topic: TOPICS.MULTI_THREAT,
    difficulty: 'expert',
    scenarioType: 'legitimate',
    prompt: 'Triage internal Active Directory enumeration, BloodHound LDAP graph ingestion, and Kerberoasting alerts from an internal IP.',
    narrative: 'SOC alarms report aggressive Active Directory enumeration and Kerberoasting ticket requests from an internal subnet host.',
    sanitizedEvidence: {
      type: 'incident_matrix',
      title: 'Incident Feed: Internal Active Directory Reconnaissance vs Authorized Assessment',
      activeAlarms: [
        {
          id: 'threat_bloodhound_ad_graph',
          vector: 'multi_threat',
          severity: 'HIGH',
          target: 'Active Directory Domain Controller (DC-01)',
          indicator: 'Full LDAP domain object enumeration and ACL graph dump originating from host SEC-TEST-LAPTOP-04 (IP 10.0.88.14).',
          actionId: 'ACTION_DECONFLICT_WITH_CISO_WHITE_CELL',
          label: 'Deconflict with CISO White Cell, Validate RoE Code RED-STORM-2026 & Monitor Without Terminating Scope',
        },
        {
          id: 'threat_kerberoast_ticket_req',
          vector: 'password_security',
          severity: 'HIGH',
          target: 'Kerberos KDC Ticket Granting Service',
          indicator: '25 TGS ticket requests for service accounts using legacy RC4 encryption, carrying engagement header X-Engagement-Id: RED-STORM-2026.',
          actionId: 'ACTION_VALIDATE_ROE_ARTIFACTS',
          label: 'Validate Engagement Header RED-STORM-2026 & RoE IP Whitelist',
        },
        {
          id: 'threat_cobalt_simulated_c2',
          vector: 'phishing',
          severity: 'MEDIUM',
          target: 'Internal Pentest Jumpbox',
          indicator: 'Simulated HTTPS beaconing to authorized external security assessment infrastructure matching formal Rules of Engagement.',
          actionId: 'ACTION_LOG_SIMULATION_TELEMETRY',
          label: 'Log Red Team Simulation Telemetry for After-Action Report',
        },
        {
          id: 'threat_security_ops_page',
          vector: 'social_engineering',
          severity: 'LOW',
          target: 'SOC Tier-1 Triage Queue',
          indicator: 'Automated high-priority alert generated by endpoint detection rule "BloodHound Ingestion Detected".',
          actionId: 'ACTION_TAG_ALERT_EXERCISE_NOISE',
          label: 'Tag Alert as Exercise Artifact & Suppress Escalation',
        },
      ],
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['c2_traffic_analyzer', 'vault_audit_log'],
    allowedActions: [
      { actionId: 'ACTION_DECONFLICT_WITH_CISO_WHITE_CELL', label: 'Deconflict with CISO White Cell & Track RoE RED-STORM-2026 (Legitimate Assessment)', variant: 'primary' },
      { actionId: 'ACTION_REVOKE_DOMAIN_ADMIN_PASSWORDS', label: 'Emergency Reset All Enterprise Domain Admin Passwords (Knee-Jerk Panic)', variant: 'warning' },
      { actionId: 'ACTION_SEVER_DC_01_NETWORK', label: 'Isolate Domain Controller DC-01 from Corporate Subnet', variant: 'warning' },
      { actionId: 'ACTION_CONTAIN_INCIDENT_SEQUENCE', label: 'Execute Prioritized Containment Sequence', variant: 'primary' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_DECONFLICT_WITH_CISO_WHITE_CELL',
    authoritativeContainmentOrder: [
      'ACTION_DECONFLICT_WITH_CISO_WHITE_CELL',
      'ACTION_VALIDATE_ROE_ARTIFACTS',
      'ACTION_LOG_SIMULATION_TELEMETRY',
      'ACTION_TAG_ALERT_EXERCISE_NOISE',
    ],
    authoritativeThreatOrder: [
      'threat_bloodhound_ad_graph',
      'threat_kerberoast_ticket_req',
      'threat_cobalt_simulated_c2',
      'threat_security_ops_page',
    ],
    privateIndicators: [
      'authorized_red_team_assessment: engagement code RED-STORM-2026 matches CISO-approved penetration test',
      'roe_ip_whitelisting: host SEC-TEST-LAPTOP-04 is contracted third-party auditor test platform',
      'deconfliction_required: terminating exercise without White Cell confirmation incurs contract breach',
    ],
    scoringMetadata: {
      basePoints: 1500,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'Exercise deconfliction verified! Red Team assessment tracked cleanly, validating detection engineering without disrupting contracted penetration testing.',
      onIncorrect: 'Exercise disruption failure! Knee-jerk domain password reset ruined a $150,000 authorized penetration test without consulting the CISO White Cell.',
    },
    fivePartExplanation: {
      whatHappened: 'You initiated emergency enterprise containment against an authorized, pre-approved Red Team penetration testing assessment.',
      evidence: 'The reconnaissance traffic carried engagement header "RED-STORM-2026" and originated from host SEC-TEST-LAPTOP-04, an authorized testing device.',
      whyDangerous: 'Prematurely killing a contracted penetration test without deconfliction wastes tens of thousands of dollars and deprives the organization of realistic security evaluation.',
      correctAction: 'Contact the CISO White Cell to deconflict alerts, verify the engagement code against the active Rules of Engagement (RoE), and monitor the exercise.',
      securityTip: 'SOC playbooks should include a formal "Deconfliction Procedure" to verify if suspicious activities match active penetration test engagements before triggering emergency incident containment.',
    },
    hints: [
      'Look at the engagement header in the Kerberoasting telemetry: Does it match an approved test code (RED-STORM-2026)?',
      'Before resetting all company passwords, should you deconflict with the CISO White Cell running the assessment?',
    ],
  },

  {
    challengeId: 'ch-ctrl-exp-06',
    roomId: 'room-05-control',
    topic: TOPICS.MULTI_THREAT,
    difficulty: 'expert',
    scenarioType: 'malicious',
    prompt: 'Contain an active dependency confusion attack poisoning the CI/CD production release container registry.',
    narrative: 'Sensors detect a supply chain compromise where a public namespace package injected reverse shell binaries into the container registry.',
    sanitizedEvidence: {
      type: 'incident_matrix',
      title: 'Incident Feed: CI/CD Supply Chain Poisoning vs Release Candidates',
      activeAlarms: [
        {
          id: 'threat_dep_confusion_rce',
          vector: 'multi_threat',
          severity: 'CRITICAL',
          target: 'CI/CD Build Runner (Runner-04)',
          indicator: 'Build runner pulled public npm package @facility/telemetry-core containing pre-install script downloading an obfuscated reverse shell.',
          actionId: 'ACTION_PURGE_CORRUPT_CONTAINER_IMAGE',
          label: 'Halt CI/CD Pipeline, Purge Corrupt Container Image & Pin Scoped Package Registry',
        },
        {
          id: 'threat_container_poison',
          vector: 'password_security',
          severity: 'CRITICAL',
          target: 'Internal Production Docker Registry (harbor.facility.local)',
          indicator: 'Backdoored container image facility-core:v3.9.1 pushed with embedded SSH key and root backdoor.',
          actionId: 'ACTION_REVOKE_REGISTRY_WRITE_TOKENS',
          label: 'Revoke Container Registry Service Account Write Tokens & Delete Poisoned Tags',
        },
        {
          id: 'threat_git_commit_spoof',
          vector: 'phishing',
          severity: 'HIGH',
          target: 'Production Git Repository',
          indicator: 'Commits signed with stolen PGP key modifying build manifests to point to external untrusted registry.',
          actionId: 'ACTION_PURGE_DEPENDENCY_CACHE',
          label: 'Invalidate CI/CD Runner Package Caches & Enforce GPG Verification',
        },
        {
          id: 'threat_linter_syntax_warning',
          vector: 'qr_security',
          severity: 'LOW',
          target: 'Code Quality SonarQube Scanner',
          indicator: 'Code analysis linter flagged deprecated library syntax warning.',
          actionId: 'ACTION_RESTART_BUILD_RUNNER',
          label: 'Acknowledge SonarQube Warning & Clear Runner Staging Queue',
        },
      ],
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['c2_traffic_analyzer', 'vault_audit_log'],
    allowedActions: [
      { actionId: 'ACTION_PURGE_CORRUPT_CONTAINER_IMAGE', label: 'Halt Pipeline, Purge Corrupt Image & Enforce Registry Scoping (Critical)', variant: 'primary' },
      { actionId: 'ACTION_REVOKE_REGISTRY_WRITE_TOKENS', label: 'Revoke Registry Write Tokens & Delete Tags (Critical)', variant: 'primary' },
      { actionId: 'ACTION_PURGE_DEPENDENCY_CACHE', label: 'Invalidate CI/CD Runner Caches (High)', variant: 'warning' },
      { actionId: 'ACTION_RESTART_BUILD_RUNNER', label: 'Clear Runner Staging Queue (Low)', variant: 'ghost' },
      { actionId: 'ACTION_CONTAIN_INCIDENT_SEQUENCE', label: 'Execute Prioritized Containment Sequence', variant: 'primary' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_PURGE_CORRUPT_CONTAINER_IMAGE',
    authoritativeContainmentOrder: [
      'ACTION_PURGE_CORRUPT_CONTAINER_IMAGE',
      'ACTION_REVOKE_REGISTRY_WRITE_TOKENS',
      'ACTION_PURGE_DEPENDENCY_CACHE',
      'ACTION_RESTART_BUILD_RUNNER',
    ],
    authoritativeThreatOrder: [
      'threat_dep_confusion_rce',
      'threat_container_poison',
      'threat_git_commit_spoof',
      'threat_linter_syntax_warning',
    ],
    privateIndicators: [
      'dependency_confusion_rce: public malicious package shadow-published internal scope',
      'poisoned_production_artifact: container image ready to deploy reverse shell to production',
      'immediate_pipeline_freeze_required: must prevent automatic CD deployment into live Kubernetes cluster',
    ],
    scoringMetadata: {
      basePoints: 1500,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'Supply chain compromise eradicated! Corrupt container image purged from harbor registry, build runner isolated, and private registry scope pinned.',
      onIncorrect: 'Downstream catastrophe! Compromised container image deployed into production, exposing all internal customer databases to remote adversaries.',
    },
    fivePartExplanation: {
      whatHappened: 'Attackers registered a fake public package under the company\'s internal scope to trick the CI/CD pipeline into building and pushing a backdoored container image.',
      evidence: 'Build logs recorded npm pulling @facility/telemetry-core from the public npmjs registry rather than the internal authenticated Artifactory proxy.',
      whyDangerous: 'Dependency confusion attacks automatically inject malicious code into trusted builds, propagating trojans straight to customer production clusters.',
      correctAction: 'Halt CI/CD deployments immediately, purge the poisoned container image from the registry, revoke builder credentials, and enforce scoped registry namespace reservation.',
      securityTip: 'Configure package managers to strictly route internal organization namespaces (@facility/*) exclusively through internal authenticated artifact repositories.',
    },
    hints: [
      'What happens if a poisoned container image in your registry is deployed by automated continuous delivery (CD)?',
      'Halt the pipeline and purge the backdoored container image before addressing peripheral linter notices.',
    ],
  },

  {
    challengeId: 'ch-ctrl-exp-07',
    roomId: 'room-05-control',
    topic: TOPICS.MULTI_THREAT,
    difficulty: 'expert',
    scenarioType: 'legitimate',
    prompt: 'Triage extreme disk I/O saturation (4,500 IOPS), 98% CPU utilization, and table locks on core database cluster pg-master-01 during Sunday 03:00 UTC maintenance.',
    narrative: 'Containment sensors alert on database query queue buildup, disk I/O saturation, and high table lock counts at 03:20 UTC Sunday.',
    sanitizedEvidence: {
      type: 'incident_matrix',
      title: 'Incident Feed: Core Database Saturation vs Scheduled Index Rebuild',
      activeAlarms: [
        {
          id: 'threat_db_io_spike',
          vector: 'multi_threat',
          severity: 'MEDIUM',
          target: 'Core Settlement Database (pg-master-01)',
          indicator: 'Disk I/O saturation at 4,500 IOPS and CPU at 98% during pre-scheduled weekly index maintenance window DBA-MAINT-8841.',
          actionId: 'ACTION_ACKNOWLEDGE_DB_MAINTENANCE_JOB',
          label: 'Confirm DBA Maintenance Schedule DBA-MAINT-8841 & Allow Vacuum/Index Rebuild to Complete',
        },
        {
          id: 'threat_table_exclusive_lock',
          vector: 'password_security',
          severity: 'MEDIUM',
          target: 'Database Table: settlements_ledger',
          indicator: 'Exclusive table lock acquired by maintenance worker thread executing VACUUM FULL ANALYZE and B-tree index re-indexing.',
          actionId: 'ACTION_MONITOR_WAL_PARTITION_SPACE',
          label: 'Monitor WAL Log Volume & Temporary Storage Space Allocation',
        },
        {
          id: 'threat_wal_volume_surge',
          vector: 'phishing',
          severity: 'LOW',
          target: 'PostgreSQL WAL Log Partition',
          indicator: 'High write volume generating 250 GB of write-ahead logs during heavy page compaction.',
          actionId: 'ACTION_LOG_MAINTENANCE_PROGRESS',
          label: 'Log Ongoing Database Vacuum Percentage Milestones',
        },
        {
          id: 'threat_dba_status_heartbeat',
          vector: 'social_engineering',
          severity: 'LOW',
          target: 'Postgres Maintenance Telemetry Daemon',
          indicator: 'Syslog status entry: "Scheduled maintenance job DBA-MAINT-8841 phase 2 of 3 in progress. Normal completion expected at 04:30 UTC."',
          actionId: 'ACTION_ACKNOWLEDGE_DBA_HEARTBEAT',
          label: 'Acknowledge DBA Telemetry Heartbeat Entry',
        },
      ],
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['c2_traffic_analyzer', 'vault_audit_log'],
    allowedActions: [
      { actionId: 'ACTION_ACKNOWLEDGE_DB_MAINTENANCE_JOB', label: 'Confirm DBA Maintenance Schedule DBA-MAINT-8841 & Allow Vacuum to Complete (Legitimate)', variant: 'primary' },
      { actionId: 'ACTION_FORCE_KILL_POSTGRES', label: 'Force Kill PostgreSQL Daemon with SIGKILL (False Positive Catastrophe)', variant: 'danger' },
      { actionId: 'ACTION_FAILOVER_DATABASE_CLUSTER', label: 'Trigger Emergency Database Failover to Standby Replica', variant: 'warning' },
      { actionId: 'ACTION_CONTAIN_INCIDENT_SEQUENCE', label: 'Execute Prioritized Containment Sequence', variant: 'primary' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_ACKNOWLEDGE_DB_MAINTENANCE_JOB',
    authoritativeContainmentOrder: [
      'ACTION_ACKNOWLEDGE_DB_MAINTENANCE_JOB',
      'ACTION_MONITOR_WAL_PARTITION_SPACE',
      'ACTION_LOG_MAINTENANCE_PROGRESS',
      'ACTION_ACKNOWLEDGE_DBA_HEARTBEAT',
    ],
    authoritativeThreatOrder: [
      'threat_db_io_spike',
      'threat_table_exclusive_lock',
      'threat_wal_volume_surge',
      'threat_dba_status_heartbeat',
    ],
    privateIndicators: [
      'authorized_dba_job: ticket DBA-MAINT-8841 scheduled for 03:00-05:00 UTC Sunday',
      'vacuum_full_locks: table locks and WAL spikes are normal characteristics of deep compaction',
      'do_not_kill_process: force killing Postgres during VACUUM causes severe index and WAL corruption',
    ],
    scoringMetadata: {
      basePoints: 1500,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'Database maintenance acknowledged! Compaction completed cleanly, reducing table bloat by 40% without corrupting transaction ledgers.',
      onIncorrect: 'Severe database corruption! Force-killing PostgreSQL during VACUUM FULL corrupted the B-tree index and transaction log, forcing an 8-hour restoration from cold backup.',
    },
    fivePartExplanation: {
      whatHappened: 'You force-killed database daemons or initiated panic failovers during an authorized, pre-scheduled database vacuum and index rebuild.',
      evidence: 'Telemetry recorded database lock activity coinciding with the weekly Sunday 03:00 UTC maintenance ticket DBA-MAINT-8841 and clean DBA heartbeat syslog entries.',
      whyDangerous: 'Force-killing PostgreSQL during VACUUM FULL leaves database files in an inconsistent state, corrupting indexes and causing catastrophic operational downtime.',
      correctAction: 'Verify database alert timestamps against the DBA maintenance calendar (DBA-MAINT-8841) and monitor system resource headroom until completion.',
      securityTip: 'Integrate database administrative maintenance calendars into SOC dashboards so automated alerting rules suppress false alarms during known maintenance intervals.',
    },
    hints: [
      'Is Sunday 03:00 UTC an approved database maintenance window corresponding to ticket DBA-MAINT-8841?',
      'What happens to database consistency if you issue SIGKILL (kill -9) to a database undergoing a VACUUM FULL index rebuild?',
    ],
  },

  {
    challengeId: 'ch-ctrl-exp-08',
    roomId: 'room-05-control',
    topic: TOPICS.MULTI_THREAT,
    difficulty: 'expert',
    scenarioType: 'malicious',
    prompt: 'Contain an active nation-state wiper targeting physical SCADA turbine controllers and IT/OT boundary switches.',
    narrative: 'Containment core telemetry indicates raw disk wiper malware executing on physical turbine controllers and pivoting across the industrial boundary.',
    sanitizedEvidence: {
      type: 'incident_matrix',
      title: 'Incident Feed: OT/SCADA Physical Infrastructure Wiper Attack',
      activeAlarms: [
        {
          id: 'threat_scada_wiper',
          vector: 'multi_threat',
          severity: 'CRITICAL',
          target: 'SCADA Turbine Controller Gateway (PLC-CORE-01)',
          indicator: 'Raw disk wiper malware overwriting Master Boot Records (MBR) and transmitting rogue IEC 60870-5-104 commands to trip emergency safety governors.',
          actionId: 'ACTION_AIRGAP_OT_SCADA_SEGMENT',
          label: 'Sever IT/OT Firewall Bridge, Engage Physical Industrial Airgap & Lock Turbine Safety Governors',
        },
        {
          id: 'threat_it_ot_lateral',
          vector: 'password_security',
          severity: 'CRITICAL',
          target: 'IT/OT Boundary Firewall Bridge',
          indicator: 'Threat actor traversing compromised corporate engineering jumpbox into industrial control network subnet.',
          actionId: 'ACTION_BLOCK_ROGUE_IEC104_TELEGRAMS',
          label: 'Block Unauthorized Modbus & IEC-104 Protocols at Industrial Firewall',
        },
        {
          id: 'threat_gpo_deploy_wiper',
          vector: 'phishing',
          severity: 'HIGH',
          target: 'Human-Machine Interface (HMI) Consoles',
          indicator: 'Rogue GPO scheduled task staging wiper binaries across operator consoles.',
          actionId: 'ACTION_PURGE_MALICIOUS_GPO',
          label: 'Block Malicious Group Policy Object & Revoke Engineering Admin Roles',
        },
        {
          id: 'threat_hvac_temp_drift',
          vector: 'qr_security',
          severity: 'LOW',
          target: 'Facility Ambient Environmental Sensors',
          indicator: '1.5-degree temperature variance detected in auxiliary server room.',
          actionId: 'ACTION_RESET_OPERATOR_CONSOLE',
          label: 'Log Server Room Temperature Telemetry Variance',
        },
      ],
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['c2_traffic_analyzer', 'vault_audit_log'],
    allowedActions: [
      { actionId: 'ACTION_AIRGAP_OT_SCADA_SEGMENT', label: 'Sever IT/OT Firewall Bridge & Engage Physical Airgap (Critical)', variant: 'primary' },
      { actionId: 'ACTION_BLOCK_ROGUE_IEC104_TELEGRAMS', label: 'Block Unauthorized IEC-104 & Modbus Traffic (Critical)', variant: 'primary' },
      { actionId: 'ACTION_PURGE_MALICIOUS_GPO', label: 'Block Malicious GPO & Revoke Engineering Admins (High)', variant: 'warning' },
      { actionId: 'ACTION_RESET_OPERATOR_CONSOLE', label: 'Log Ambient Temperature Variance (Low)', variant: 'ghost' },
      { actionId: 'ACTION_CONTAIN_INCIDENT_SEQUENCE', label: 'Execute Prioritized Containment Sequence', variant: 'primary' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_AIRGAP_OT_SCADA_SEGMENT',
    authoritativeContainmentOrder: [
      'ACTION_AIRGAP_OT_SCADA_SEGMENT',
      'ACTION_BLOCK_ROGUE_IEC104_TELEGRAMS',
      'ACTION_PURGE_MALICIOUS_GPO',
      'ACTION_RESET_OPERATOR_CONSOLE',
    ],
    authoritativeThreatOrder: [
      'threat_scada_wiper',
      'threat_it_ot_lateral',
      'threat_gpo_deploy_wiper',
      'threat_hvac_temp_drift',
    ],
    privateIndicators: [
      'scada_life_safety_threat: MBR wiper targeting physical industrial turbine controllers',
      'it_ot_convergence_exploit: attacker traversing from corporate IT network into physical OT plant',
      'physical_damage_risk: turbine governor corruption causes physical kinetic destruction',
    ],
    scoringMetadata: {
      basePoints: 1500,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'Industrial plant protected! IT/OT boundary severed and turbine control systems isolated before wiper malware reached generator governors.',
      onIncorrect: 'Kinetic catastrophe! Wiper malware corrupted turbine firmware, causing physical hardware destruction in Sector 05.',
    },
    fivePartExplanation: {
      whatHappened: 'A nation-state threat actor deployed disk wiping malware into the physical industrial control (SCADA/OT) network.',
      evidence: 'Raw disk sectors were being overwritten on turbine control gateways across the converged IT/OT boundary.',
      whyDangerous: 'Attacks on operational technology cause real-world physical damage, turbine explosions, and severe threats to human life.',
      correctAction: 'Sever the IT/OT bridge immediately to enforce an absolute physical airgap, protecting industrial safety systems.',
      securityTip: 'Maintain strict physical and logical separation between corporate IT networks and industrial control systems (Purdue Model Level 3/0).',
    },
    hints: [
      'Which alarm threatens actual physical equipment and human life in the facility?',
      'What must be done to the bridge between corporate IT and physical industrial controllers (OT)?',
    ],
  },

  {
    challengeId: 'ch-ctrl-exp-09',
    roomId: 'room-05-control',
    topic: TOPICS.MULTI_THREAT,
    difficulty: 'expert',
    scenarioType: 'ambiguous',
    prompt: 'Investigate simultaneous lockout of 400 user accounts and 18,000 Kerberos Event ID 4771 pre-authentication failures across the corporate domain.',
    narrative: 'Active Directory domain controllers report rapid concurrent user lockouts and massive Kerberos pre-authentication failure surges.',
    sanitizedEvidence: {
      type: 'incident_matrix',
      title: 'Incident Feed: Mass Account Lockouts vs Campus RADIUS Authentication',
      activeAlarms: [
        {
          id: 'threat_mass_account_lockout',
          vector: 'multi_threat',
          severity: 'HIGH',
          target: 'Enterprise Active Directory Domain Controllers',
          indicator: '400 employee accounts locked out across campus within 10 minutes, generating massive ticket volume.',
          actionId: 'ACTION_INVESTIGATE_AUTH_EVENT_ROOT_CAUSE',
          label: 'Analyze Kerberos Pre-Auth Event Telemetry to Distinguish Password Spraying from Expired RADIUS Service Key',
        },
        {
          id: 'threat_kerberos_4771_flood',
          vector: 'password_security',
          severity: 'HIGH',
          target: 'KDC Kerberos Pre-Authentication Service',
          indicator: '18,000 Event ID 4771 pre-authentication failures with error code 0x18 (bad password) originating from campus 802.1X RADIUS server IP 10.0.10.15.',
          actionId: 'ACTION_REMEDIATE_RADIUS_CA_CERT',
          label: 'Check RADIUS Server Intermediate CA Certificate Expiration & Service Account Key',
        },
        {
          id: 'threat_radius_wifi_reject',
          vector: 'phishing',
          severity: 'MEDIUM',
          target: 'Campus Wireless Controller',
          indicator: '802.1X EAP-TLS / PEAP authentications failing after RADIUS root certificate rotation 30 minutes ago.',
          actionId: 'ACTION_CLEAR_CACHED_BAD_PREAUTH',
          label: 'Push Updated RADIUS Root Certificate Profile to Enterprise MDM Devices',
        },
        {
          id: 'threat_helpdesk_call_queue',
          vector: 'social_engineering',
          severity: 'LOW',
          target: 'IT Support Call Center',
          indicator: '85 callers on hold reporting sudden disconnection from office Wi-Fi network.',
          actionId: 'ACTION_POST_WIFI_OUTAGE_BULLETIN',
          label: 'Broadcast Wi-Fi Certificate Troubleshooting Bulletin to Staff',
        },
      ],
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['c2_traffic_analyzer', 'vault_audit_log'],
    allowedActions: [
      { actionId: 'ACTION_INVESTIGATE_AUTH_EVENT_ROOT_CAUSE', label: 'Analyze Kerberos Pre-Auth Telemetry to Distinguish Spraying from RADIUS Certificate Loop (Investigate Ambiguity)', variant: 'primary' },
      { actionId: 'ACTION_INITIATE_ENTERPRISE_PASSWORD_RESET', label: 'Force Immediate Company-Wide Password Reset for All 5,000 Employees (Knee-Jerk Panic)', variant: 'warning' },
      { actionId: 'ACTION_ISOLATE_RADIUS_SERVER', label: 'Sever RADIUS Server from Subnet (Terminates All Campus Physical Access)', variant: 'danger' },
      { actionId: 'ACTION_CONTAIN_INCIDENT_SEQUENCE', label: 'Execute Prioritized Containment Sequence', variant: 'primary' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_INVESTIGATE_AUTH_EVENT_ROOT_CAUSE',
    authoritativeContainmentOrder: [
      'ACTION_INVESTIGATE_AUTH_EVENT_ROOT_CAUSE',
      'ACTION_REMEDIATE_RADIUS_CA_CERT',
      'ACTION_CLEAR_CACHED_BAD_PREAUTH',
      'ACTION_POST_WIFI_OUTAGE_BULLETIN',
    ],
    authoritativeThreatOrder: [
      'threat_mass_account_lockout',
      'threat_kerberos_4771_flood',
      'threat_radius_wifi_reject',
      'threat_helpdesk_call_queue',
    ],
    privateIndicators: [
      'radius_certificate_loop: 18,000 bad pre-auths all source from IP 10.0.10.15 (RADIUS server), not external IP ranges',
      'client_retry_storm: laptops retrying Wi-Fi auth with stale cached certificates triggered AD lockout thresholds',
      'do_not_force_reset: forcing 5,000 user password resets prolongs operational paralysis during an internal configuration error',
    ],
    scoringMetadata: {
      basePoints: 1500,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'Root cause identified! 18,000 Kerberos failures traced to internal RADIUS server retry storm following certificate update. Panic company-wide password reset averted.',
      onIncorrect: 'Massive operational paralysis! Forcing enterprise-wide password reset during a RADIUS certificate outage overwhelmed the helpdesk and brought business operations to a halt.',
    },
    fivePartExplanation: {
      whatHappened: 'You triggered an enterprise-wide password reset or severed RADIUS servers without investigating the origin of the Kerberos pre-authentication failures.',
      evidence: 'All 18,000 Kerberos failure events (Event ID 4771) originated from a single internal IP: 10.0.10.15 (the campus RADIUS server) following a certificate rotation 30 minutes earlier.',
      whyDangerous: 'Assuming every account lockout surge is an external brute-force attack leads to catastrophic false alarms, locking out the entire workforce when an internal configuration error is the true culprit.',
      correctAction: 'Inspect Event ID 4771 source IPs in the SIEM to identify whether failures stem from external attackers or internal automated authentication services before taking disruptive containment steps.',
      securityTip: 'Configure RADIUS authentication policies to avoid passing cached client retries directly to Active Directory KDCs to prevent certificate misalignment from triggering mass account lockouts.',
    },
    hints: [
      'Examine the source IP of all 18,000 Kerberos failure events: Is it a foreign attacker, or the internal campus RADIUS server (10.0.10.15)?',
      'Did a certificate rotation 30 minutes ago cause enterprise laptops to repeatedly retry Wi-Fi authentication?',
    ],
  },

  {
    challengeId: 'ch-ctrl-exp-10',
    roomId: 'room-05-control',
    topic: TOPICS.MULTI_THREAT,
    difficulty: 'expert',
    scenarioType: 'legitimate',
    prompt: 'Triage a 14 TB network transfer, high disk I/O, and read-only shard locks on central SIEM cluster siem-hot-01..08 during the monthly archival window.',
    narrative: 'Storage and network monitors alert on a 14 TB outbound transfer and read-only shard locks across the central logging cluster at 01:00 UTC.',
    sanitizedEvidence: {
      type: 'incident_matrix',
      title: 'Incident Feed: SIEM Storage Lifecycle Policy vs Egress Data Movement',
      activeAlarms: [
        {
          id: 'threat_siem_shard_relocation',
          vector: 'multi_threat',
          severity: 'MEDIUM',
          target: 'SIEM Logging Cluster Hot Tier (siem-hot-01..08)',
          indicator: '14 TB high-speed network egress from hot NVMe index nodes to S3 cold storage matching automated retention policy cron job.',
          actionId: 'ACTION_VALIDATE_SIEM_LOG_ARCHIVAL',
          label: 'Validate Storage Lifecycle Policy Execution & Acknowledge Scheduled Shard Migration',
        },
        {
          id: 'threat_index_read_only_mode',
          vector: 'password_security',
          severity: 'MEDIUM',
          target: 'Elasticsearch/OpenSearch Index Metadata',
          indicator: '30 index shards transitioned into read-only lock state during snapshot creation and gzip compression.',
          actionId: 'ACTION_CONFIRM_ILM_DAEMON_STATUS',
          label: 'Verify Index Lifecycle Management (ILM) Daemon State & Log Sync',
        },
        {
          id: 'threat_storage_capacity_rebalance',
          vector: 'phishing',
          severity: 'LOW',
          target: 'Cold Tier Archival Node Storage',
          indicator: 'Disk utilization alert reaching 91% on archival repository node during bulk ingest.',
          actionId: 'ACTION_VERIFY_SHARD_CHECKSUM_INTEGRITY',
          label: 'Confirm Shard SHA-256 Checksum Integrity in Cold Storage',
        },
        {
          id: 'threat_lifecycle_cron_log',
          vector: 'social_engineering',
          severity: 'LOW',
          target: 'Index Lifecycle Management (ILM) Daemon',
          indicator: 'Cron daemon logged: "Scheduled monthly ILM policy execution: migrating indices > 90 days to cold tier."',
          actionId: 'ACTION_ACKNOWLEDGE_ILM_CRON_LOG',
          label: 'Acknowledge ILM Policy Execution Log Entry',
        },
      ],
    },
    get evidence() {
      return this.sanitizedEvidence;
    },
    valuableArtifacts: ['c2_traffic_analyzer', 'vault_audit_log'],
    allowedActions: [
      { actionId: 'ACTION_VALIDATE_SIEM_LOG_ARCHIVAL', label: 'Validate Storage Lifecycle Execution & Acknowledge Shard Migration (Legitimate Baseline)', variant: 'primary' },
      { actionId: 'ACTION_TERMINATE_SIEM_NETWORK_TRANSFERS', label: 'Sever SIEM Network Interfaces & Kill Archival Transfers (False Positive Knee-Jerk)', variant: 'warning' },
      { actionId: 'ACTION_REBOOT_HOT_INDEX_NODES', label: 'Reboot Hot Index Nodes to Clear Read-Only Shard Locks (Corrupts Shards)', variant: 'danger' },
      { actionId: 'ACTION_CONTAIN_INCIDENT_SEQUENCE', label: 'Execute Prioritized Containment Sequence', variant: 'primary' },
    ],
    get availableActions() {
      return this.allowedActions;
    },
    correctActionId: 'ACTION_VALIDATE_SIEM_LOG_ARCHIVAL',
    authoritativeContainmentOrder: [
      'ACTION_VALIDATE_SIEM_LOG_ARCHIVAL',
      'ACTION_CONFIRM_ILM_DAEMON_STATUS',
      'ACTION_VERIFY_SHARD_CHECKSUM_INTEGRITY',
      'ACTION_ACKNOWLEDGE_ILM_CRON_LOG',
    ],
    authoritativeThreatOrder: [
      'threat_siem_shard_relocation',
      'threat_index_read_only_mode',
      'threat_storage_capacity_rebalance',
      'threat_lifecycle_cron_log',
    ],
    privateIndicators: [
      'authorized_ilm_migration: monthly automated ILM policy migrating logs older than 90 days to cold S3 tier',
      'read_only_locks_expected: shards are intentionally locked read-only during compression and snapshot export',
      'severing_causes_corruption: aborting transfer corrupts cluster shard metadata and creates backpressure',
    ],
    scoringMetadata: {
      basePoints: 1500,
      targetTimeSeconds: 45,
    },
    consequenceData: {
      onCorrect: 'Storage lifecycle migration validated! Aged index shards moved safely to cold archive, reclaiming 14 TB of high-speed NVMe capacity without interrupting live log ingestion.',
      onIncorrect: 'Disastrous data corruption! Aborting SIEM transfers and rebooting cluster nodes orphaned index shard locks, causing permanent loss of compliance audit logs.',
    },
    fivePartExplanation: {
      whatHappened: 'You severed SIEM network connections or rebooted index nodes during a scheduled Index Lifecycle Management (ILM) shard migration.',
      evidence: 'The 14 TB data movement correlated with automated ILM cron execution logs migrating indices older than 90 days from hot NVMe to S3 Glacier storage.',
      whyDangerous: 'Abruptly severing network transfers during Elasticsearch/OpenSearch snapshot operations causes shard state corruption and crashes cluster metadata managers.',
      correctAction: 'Verify that the high data transfer matches the pre-configured Index Lifecycle Management schedule and allow the cold tier migration to finish.',
      securityTip: 'Configure automated ILM policies with network egress throttling to prevent cluster tiering operations from triggering bandwidth anomaly detection rules.',
    },
    hints: [
      'Does the 14 TB data transfer match the monthly Index Lifecycle Management (ILM) policy migrating aged logs to cold storage?',
      'Why are index shards placed in a read-only lock state during snapshot compression?',
    ],
  },
];

/**
 * Returns all challenges defined for Room 05.
 */
export function getRoom05Challenges() {
  return ROOM_05_CHALLENGES;
}

/**
 * Finds a Room 05 challenge definition by ID.
 */
export function getRoom05ChallengeById(challengeId) {
  return ROOM_05_CHALLENGES.find((c) => c.challengeId === challengeId);
}

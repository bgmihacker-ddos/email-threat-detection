import { Threat } from '../types';

export const demoThreats: Threat[] = [
  {
    id: 'THR-2026-00421',
    type: 'Credential Theft',
    severity: 'Critical',
    confidence: 97,
    target: 'finance@enterprise.local',
    location: 'United States',
    firstSeen: '2026-09-05T08:14:22Z',
    lastSeen: '2026-09-05T12:41:32Z',
    status: 'Open',
    sender: 'security-alert@micros0ft-demo.example',
    description: 'Targeted Microsoft 365 credential harvester mimicking administrative account expiration alerts with obfuscated redirect chains.',
    indicators: ['login-update-auth.example', '198.51.100.45', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'],
    attackStages: [
      { stage: 'Reconnaissance', status: 'completed', description: 'Domain typosquatting & MX record enumeration' },
      { stage: 'Delivery', status: 'completed', description: 'Direct SMTP injection with forged From headers' },
      { stage: 'Execution', status: 'completed', description: 'User triggered macro-embedded decoy link' },
      { stage: 'Credential Theft', status: 'active', description: 'Active Reverse-Proxy credential harvesting page' },
      { stage: 'Exfiltration', status: 'pending', description: 'Automated token exfiltration to command relay' }
    ]
  },
  {
    id: 'THR-2026-00422',
    type: 'Phishing',
    severity: 'High',
    confidence: 92,
    target: 'executive-team@enterprise.local',
    location: 'Germany',
    firstSeen: '2026-09-04T15:20:00Z',
    lastSeen: '2026-09-05T11:05:10Z',
    status: 'In Progress',
    sender: 'payroll-notify@secure-portal-demo.example',
    description: 'Impersonation of HR Payroll department attempting to redirect salary direct deposits to unauthorized accounts.',
    indicators: ['secure-portal-demo.example', '203.0.113.88'],
    attackStages: [
      { stage: 'Reconnaissance', status: 'completed', description: 'Employee directory OSINT harvest' },
      { stage: 'Delivery', status: 'completed', description: 'High-urgency subject header routing' },
      { stage: 'Execution', status: 'active', description: 'Credential submission on cloned payroll landing page' },
      { stage: 'Credential Theft', status: 'pending', description: 'Bank account routing information modification' }
    ]
  },
  {
    id: 'THR-2026-00423',
    type: 'BEC',
    severity: 'High',
    confidence: 89,
    target: 'cfo@enterprise.local',
    location: 'United Kingdom',
    firstSeen: '2026-09-03T09:12:00Z',
    lastSeen: '2026-09-05T09:40:00Z',
    status: 'Quarantined',
    sender: 'ceo-office@corp-executive-vip.example',
    description: 'CEO fraud email requesting urgent multi-stage wire transfer authorization under confidential acquisition context.',
    indicators: ['corp-executive-vip.example', '192.0.2.14', 'payment-escrow-swift.example'],
    attackStages: [
      { stage: 'Reconnaissance', status: 'completed', description: 'M&A news release intelligence analysis' },
      { stage: 'Delivery', status: 'completed', description: 'VIP display name spoofing with disposable domain' },
      { stage: 'Execution', status: 'pending', description: 'Attempted fraud authorization bypass' }
    ]
  },
  {
    id: 'THR-2026-00424',
    type: 'Malware',
    severity: 'Critical',
    confidence: 99,
    target: 'devops@enterprise.local',
    location: 'Russia',
    firstSeen: '2026-09-02T22:04:15Z',
    lastSeen: '2026-09-05T04:11:00Z',
    status: 'Resolved',
    sender: 'build-system-notifier@ci-cd-pipeline.example',
    description: 'Infected invoice PDF attachment containing obfuscated PowerShell dropper payload initiating reverse-shell command and control.',
    indicators: ['198.51.100.201', '7d793037a0760186574b0282f2f435e7', 'ci-cd-pipeline.example'],
    attackStages: [
      { stage: 'Reconnaissance', status: 'completed', description: 'Git repository webhook spoofing' },
      { stage: 'Delivery', status: 'completed', description: 'Weaponized attachment distribution' },
      { stage: 'Execution', status: 'completed', description: 'Endpoint sandbox execution detected and halted' }
    ]
  },
  {
    id: 'THR-2026-00425',
    type: 'Suspicious',
    severity: 'Medium',
    confidence: 74,
    target: 'marketing@enterprise.local',
    location: 'Singapore',
    firstSeen: '2026-09-05T06:30:00Z',
    lastSeen: '2026-09-05T08:00:00Z',
    status: 'Open',
    sender: 'survey-rewards@gift-portal-demo.example',
    description: 'Unsolicited mass marketing campaign containing high-frequency redirect links and tracking pixels.',
    indicators: ['gift-portal-demo.example', '203.0.113.111']
  }
];

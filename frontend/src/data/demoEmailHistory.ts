import { EmailScanRecord } from '../types';

export const demoEmailHistory: EmailScanRecord[] = [
  {
    id: 'SCN-2026-9042',
    user: 'analyst@demo.local',
    sender: 'security-alert@micros0ft-demo.example',
    recipient: 'finance@enterprise.local',
    subject: 'Action Required: Update your billing details',
    threatScore: 94,
    verdict: 'Critical',
    scannedAt: '2026-09-05T12:41:32Z',
    status: 'Blocked',
    processingTimeMs: 1254
  },
  {
    id: 'SCN-2026-9041',
    user: 'system',
    sender: 'payroll-notify@secure-portal-demo.example',
    recipient: 'executive-team@enterprise.local',
    subject: 'Direct Deposit Verification Update',
    threatScore: 82,
    verdict: 'Malicious',
    scannedAt: '2026-09-05T11:05:10Z',
    status: 'Quarantined',
    processingTimeMs: 890
  },
  {
    id: 'SCN-2026-9040',
    user: 'system',
    sender: 'ceo-office@corp-executive-vip.example',
    recipient: 'cfo@enterprise.local',
    subject: 'Confidential: Acquisition Wire Transfer',
    threatScore: 78,
    verdict: 'Suspicious',
    scannedAt: '2026-09-05T09:40:00Z',
    status: 'Quarantined',
    processingTimeMs: 450
  },
  {
    id: 'SCN-2026-9039',
    user: 'analyst@demo.local',
    sender: 'newsletter@trusted-vendor.example',
    recipient: 'marketing@enterprise.local',
    subject: 'Your Q3 Marketing Insights',
    threatScore: 12,
    verdict: 'Safe',
    scannedAt: '2026-09-05T08:30:15Z',
    status: 'Clean',
    processingTimeMs: 210
  }
];

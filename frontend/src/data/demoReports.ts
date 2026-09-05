import { SecurityReport } from '../types';

export const demoReports: SecurityReport[] = [
  {
    id: 'RPT-2026-09-001',
    title: 'Executive Phishing Activity Summary',
    description: 'Weekly summary of highly targeted credential phishing attempts against executive aliases.',
    dateRange: 'Aug 29, 2026 - Sep 5, 2026',
    category: 'Executive Summary',
    metrics: [
      { label: 'Blocked Threats', value: 142, change: '+12%' },
      { label: 'Impersonation Attempts', value: 18, change: '-4%' }
    ],
    status: 'Ready'
  },
  {
    id: 'RPT-2026-09-002',
    title: 'BEC Threat Landscape',
    description: 'Detailed analysis of Business Email Compromise patterns, targeting vectors, and source infrastructure.',
    dateRange: 'Aug 1, 2026 - Aug 31, 2026',
    category: 'Threat Landscape',
    metrics: [
      { label: 'Financial Requests', value: 45, change: '+2%' },
      { label: 'Avg Threat Score', value: 88, change: '+5%' }
    ],
    status: 'Ready'
  },
  {
    id: 'RPT-2026-09-003',
    title: 'Malware Attachment Trends',
    description: 'Analysis of malicious macro and dropper payloads delivered via automated invoice themes.',
    dateRange: 'Aug 29, 2026 - Sep 5, 2026',
    category: 'Malware Analysis',
    metrics: [
      { label: 'Malicious PDFs', value: '412', change: '-10%' },
      { label: 'Macros Blocked', value: '1,204', change: '+25%' }
    ],
    status: 'Generating'
  }
];

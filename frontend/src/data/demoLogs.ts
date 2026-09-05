import { SecurityLog } from '../types/dashboard';

export const demoLogs: SecurityLog[] = [
    {
        id: 'LOG-001',
        timestamp: '2026-09-05T09:00:00Z',
        user: 'analyst@demo.local',
        event: 'Analyzed Email',
        type: 'Action',
        severity: 'Low',
        source: 'UI',
        status: 'Success'
    },
    {
        id: 'LOG-002',
        timestamp: '2026-09-05T09:05:00Z',
        user: 'admin@demo.local',
        event: 'System Configuration',
        type: 'Security',
        severity: 'Medium',
        source: 'AdminPanel',
        status: 'Success'
    }
];

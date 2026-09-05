import { dashboardMetrics, threatActivityData, distributionData, activeThreats } from '../data/demoCharts';
import { demoLogs } from '../data/demoLogs';

export const getDashboardMetrics = async () => Promise.resolve(dashboardMetrics);
export const getThreatActivity = async () => Promise.resolve(threatActivityData);
export const getDistribution = async () => Promise.resolve(distributionData);
export const getActiveThreats = async () => Promise.resolve(activeThreats);
export const getRecentLogs = async () => Promise.resolve(demoLogs);

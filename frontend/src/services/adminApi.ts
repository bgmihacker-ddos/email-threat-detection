import { ThreatIndicator, EmailScanRecord, SecurityReport, AdminUserRecord, ThreatIntelProvider, SystemServiceHealth, AuditLogRecord } from '../types';
import { demoIndicators, demoEmailHistory, demoReports, demoAdminUsers, demoThreatIntelProviders, demoSystemHealth, demoAuditLogs } from '../data';

export const getIndicators = async (): Promise<ThreatIndicator[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(demoIndicators), 400));
};

export const getEmailHistory = async (): Promise<EmailScanRecord[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(demoEmailHistory), 500));
};

export const getReports = async (): Promise<SecurityReport[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(demoReports), 600));
};

export const getAdminUsers = async (): Promise<AdminUserRecord[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(demoAdminUsers), 300));
};

export const getThreatIntelProviders = async (): Promise<ThreatIntelProvider[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(demoThreatIntelProviders), 200));
};

export const getSystemHealth = async (): Promise<SystemServiceHealth[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(demoSystemHealth), 250));
};

export const getAuditLogs = async (): Promise<AuditLogRecord[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(demoAuditLogs), 350));
};

export const getAdminScans = async (): Promise<EmailScanRecord[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(demoEmailHistory), 300)); // Reuse history for scans view
};

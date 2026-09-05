// Types are used in the SearchResult interface but not imported directly
import { demoThreats, demoIndicators, demoEmailHistory, demoReports, demoAdminUsers, demoThreatIntelProviders, demoSystemHealth, demoAuditLogs } from '../data';

export interface SearchResult {
  id: string;
  type: 'Threat' | 'Indicator' | 'EmailScan' | 'Report' | 'User' | 'IntelProvider' | 'SystemService' | 'AuditLog';
  title: string;
  description: string;
  relevance: number; // 0-100
  data: any;
}

export const globalSearch = async (query: string): Promise<SearchResult[]> => {
  if (!query.trim()) return [];

  const searchTerm = query.toLowerCase();
  const results: SearchResult[] = [];

  // Search threats
  demoThreats.forEach(threat => {
    const matches = [
      threat.id.toLowerCase().includes(searchTerm),
      threat.type.toLowerCase().includes(searchTerm),
      threat.target.toLowerCase().includes(searchTerm),
      threat.location.toLowerCase().includes(searchTerm),
      threat.description?.toLowerCase().includes(searchTerm),
    ].filter(Boolean).length;

    if (matches > 0) {
      results.push({
        id: threat.id,
        type: 'Threat',
        title: threat.type,
        description: `Target: ${threat.target} | ${threat.severity} | ${threat.location}`,
        relevance: matches * 20,
        data: threat,
      });
    }
  });

  // Search indicators
  demoIndicators.forEach(indicator => {
    const matches = [
      indicator.ioc.toLowerCase().includes(searchTerm),
      indicator.type.toLowerCase().includes(searchTerm),
      indicator.source.toLowerCase().includes(searchTerm),
    ].filter(Boolean).length;

    if (matches > 0) {
      results.push({
        id: indicator.id,
        type: 'Indicator',
        title: indicator.ioc,
        description: `${indicator.type} | ${indicator.risk} | Source: ${indicator.source}`,
        relevance: matches * 25,
        data: indicator,
      });
    }
  });

  // Search email scans
  demoEmailHistory.forEach(scan => {
    const matches = [
      scan.subject.toLowerCase().includes(searchTerm),
      scan.sender.toLowerCase().includes(searchTerm),
      scan.recipient.toLowerCase().includes(searchTerm),
      scan.user.toLowerCase().includes(searchTerm),
    ].filter(Boolean).length;

    if (matches > 0) {
      results.push({
        id: scan.id,
        type: 'EmailScan',
        title: scan.subject,
        description: `From: ${scan.sender} → To: ${scan.recipient} | ${scan.verdict}`,
        relevance: matches * 20,
        data: scan,
      });
    }
  });

  // Search reports
  demoReports.forEach(report => {
    const matches = [
      report.title.toLowerCase().includes(searchTerm),
      report.description.toLowerCase().includes(searchTerm),
      report.category.toLowerCase().includes(searchTerm),
    ].filter(Boolean).length;

    if (matches > 0) {
      results.push({
        id: report.id,
        type: 'Report',
        title: report.title,
        description: `${report.category} | ${report.dateRange}`,
        relevance: matches * 20,
        data: report,
      });
    }
  });

  // Search users
  demoAdminUsers.forEach(user => {
    const matches = [
      user.name.toLowerCase().includes(searchTerm),
      user.email.toLowerCase().includes(searchTerm),
      user.role.toLowerCase().includes(searchTerm),
    ].filter(Boolean).length;

    if (matches > 0) {
      results.push({
        id: user.id,
        type: 'User',
        title: user.name,
        description: `${user.role} | ${user.email} | ${user.status}`,
        relevance: matches * 25,
        data: user,
      });
    }
  });

  // Search threat intel providers
  demoThreatIntelProviders.forEach(provider => {
    const matches = [
      provider.name.toLowerCase().includes(searchTerm),
      provider.type.toLowerCase().includes(searchTerm),
    ].filter(Boolean).length;

    if (matches > 0) {
      results.push({
        id: provider.id,
        type: 'IntelProvider',
        title: provider.name,
        description: `${provider.type} | Status: ${provider.status}`,
        relevance: matches * 20,
        data: provider,
      });
    }
  });

  // Search system services
  demoSystemHealth.forEach(service => {
    const matches = [
      service.service.toLowerCase().includes(searchTerm),
      service.description.toLowerCase().includes(searchTerm),
    ].filter(Boolean).length;

    if (matches > 0) {
      results.push({
        id: service.id,
        type: 'SystemService',
        title: service.service,
        description: `${service.status} | Uptime: ${service.uptimePct}%`,
        relevance: matches * 20,
        data: service,
      });
    }
  });

  // Search audit logs
  demoAuditLogs.forEach(log => {
    const matches = [
      log.actor.toLowerCase().includes(searchTerm),
      log.action.toLowerCase().includes(searchTerm),
      log.resource.toLowerCase().includes(searchTerm),
      log.details?.toLowerCase().includes(searchTerm),
    ].filter(Boolean).length;

    if (matches > 0) {
      results.push({
        id: log.id,
        type: 'AuditLog',
        title: log.action,
        description: `${log.actor} | ${log.resource} | ${log.result}`,
        relevance: matches * 20,
        data: log,
      });
    }
  });

  // Sort by relevance and limit to top 10
  return results
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 10);
};

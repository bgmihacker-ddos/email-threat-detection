import { FileText, Shield } from 'lucide-react';

export default function AuditLogs() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Shield className="text-cyan-400" /> Security Audit Logs
        </h1>
        <p className="text-xs text-gray-400">Platform audit-event visibility</p>
      </div>

      <section className="bg-[#101b21] border border-[#1b3037] rounded p-8 text-center max-w-3xl">
        <FileText className="mx-auto text-gray-600 mb-4" size={32} />
        <h2 className="text-sm font-bold text-gray-200">No audit-event feed is available</h2>
        <p className="text-xs text-gray-500 leading-relaxed mt-3">
          The current backend does not expose an audit-log endpoint. This console intentionally does not invent
          administrative or security events. Use the Email Scans view for persisted analysis activity.
        </p>
      </section>
    </div>
  );
}

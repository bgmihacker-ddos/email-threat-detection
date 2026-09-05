export default function AdminOverview() {
    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-white uppercase">Administrator Overview</h1>
            <div className="grid grid-cols-4 gap-6">
                <StatCard title="Total Users" value="1,284" />
                <StatCard title="Total Email Scans" value="48.2M" />
                <StatCard title="Threats Detected" value="12,503" />
                <StatCard title="Critical Threats" value="342" />
            </div>
            <div className="grid grid-cols-2 gap-6">
                <Panel title="Recent Users" content="List of recent user registrations..." />
                <Panel title="Recent Email Scans" content="List of recent scans..." />
                <Panel title="Threat Intelligence Status" content="DEMO: NOT CONNECTED" />
                <Panel title="System Health" content="All systems nominal" />
                <Panel title="Security Activity" content="Audit events log..." />
            </div>
        </div>
    );
}

function StatCard({ title, value }: { title: string, value: string }) {
    return (
        <div className="bg-[#080D14] p-6 border border-[#151D28] rounded">
            <p className="text-gray-500 text-xs font-bold uppercase">{title}</p>
            <p className="text-3xl font-bold text-white mt-1">{value}</p>
        </div>
    );
}

function Panel({ title, content }: { title: string, content: string }) {
    return (
        <div className="bg-[#080D14] p-6 border border-[#151D28] rounded">
            <h2 className="text-sm font-bold text-gray-300 mb-4">{title}</h2>
            <p className="text-gray-500 text-xs">{content}</p>
        </div>
    );
}

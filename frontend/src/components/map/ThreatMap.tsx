import { useMemo, useState } from 'react';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Feature, Geometry } from 'geojson';
import worldAtlas from 'world-atlas/countries-110m.json';
import { Maximize2, Minimize2, RotateCcw, X, ZoomIn, ZoomOut } from 'lucide-react';
import { ThreatMapEvent } from '../../types/threats';

interface ThreatMapProps {
    threatEvents: ThreatMapEvent[];
}

const WIDTH = 1000;
const HEIGHT = 500;
const projection = geoNaturalEarth1().fitExtent([[18, 28], [WIDTH - 18, HEIGHT - 24]], { type: 'Sphere' });
const path = geoPath(projection);
const countries = (feature(worldAtlas as never, (worldAtlas as never as { objects: { countries: unknown } }).objects.countries as never) as unknown as { features: Array<Feature<Geometry>> }).features;

export function ThreatMap({ threatEvents }: ThreatMapProps) {
    const [selectedThreat, setSelectedThreat] = useState<ThreatMapEvent | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [zoom, setZoom] = useState(1);

    const validEvents = useMemo(
        () => threatEvents.filter((event) => Number.isFinite(event.latitude) && Number.isFinite(event.longitude)),
        [threatEvents],
    );
    const stats = useMemo(() => ({
        total: threatEvents.length,
        geolocated: validEvents.length,
        high: threatEvents.filter((event) => event.severity === 'High' || event.severity === 'Critical').length,
        safe: threatEvents.filter((event) => event.severity === 'Safe' || event.severity === 'Low').length,
    }), [threatEvents, validEvents]);
    const labels = useMemo(() => {
        const seen = new Set<string>();
        return validEvents.filter((event) => {
            if (!event.country || seen.has(event.country)) return false;
            seen.add(event.country);
            return true;
        }).slice(0, 8);
    }, [validEvents]);

    const colorFor = (event: ThreatMapEvent) => event.severity === 'High' || event.severity === 'Critical' ? '#ff5b68' : event.severity === 'Medium' ? '#ffad4d' : '#3edb8b';
    const pointFor = (event: ThreatMapEvent) => projection([event.longitude as number, event.latitude as number]);

    return (
        <div className={`${isFullscreen ? 'fixed inset-4 z-50' : 'relative h-[500px]'} min-h-[500px] overflow-hidden rounded-lg border border-[#1b3037] bg-[#111d2b] shadow-2xl`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(35,86,103,0.25),transparent_48%)]" />
            <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full" role="img" aria-label="Live threat world map">
                <defs>
                    <filter id="map-glow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                    <linearGradient id="route-line" x1="0" x2="1"><stop offset="0" stopColor="#36d5c5" stopOpacity=".15" /><stop offset=".5" stopColor="#6de8df" stopOpacity=".8" /><stop offset="1" stopColor="#ff6675" stopOpacity=".45" /></linearGradient>
                </defs>
                <g transform={`translate(${WIDTH / 2} ${HEIGHT / 2}) scale(${zoom}) translate(${-WIDTH / 2} ${-HEIGHT / 2})`}>
                    <path d={path({ type: 'Sphere' }) || undefined} fill="#132537" stroke="#315069" strokeWidth="1" />
                    <g fill="#25384a" stroke="#3c5364" strokeWidth=".55" opacity=".96">
                        {countries.map((country, index) => <path key={index} d={path(country) || undefined} />)}
                    </g>
                    <g stroke="#2f6170" strokeWidth=".5" strokeDasharray="2 7" opacity=".38">
                        {[...Array(5)].map((_, index) => <path key={`lat-${index}`} d={`M 20 ${92 + index * 78} Q 500 ${65 + index * 78} 980 ${92 + index * 78}`} fill="none" />)}
                    </g>
                    {validEvents.slice(0, 24).map((event, index) => {
                        const point = pointFor(event);
                        if (!point) return null;
                        const previous = validEvents[index - 1];
                        const previousPoint = previous ? pointFor(previous) : null;
                        const color = colorFor(event);
                        return <g key={event.id}>
                            {previousPoint && <path d={`M ${previousPoint[0]} ${previousPoint[1]} Q ${(previousPoint[0] + point[0]) / 2} ${Math.min(previousPoint[1], point[1]) - 55} ${point[0]} ${point[1]}`} fill="none" stroke="url(#route-line)" strokeWidth="1.6" strokeDasharray="4 5" opacity=".72" />}
                            <circle cx={point[0]} cy={point[1]} r="10" fill={color} opacity=".12" filter="url(#map-glow)" />
                            <circle cx={point[0]} cy={point[1]} r={event.severity === 'High' || event.severity === 'Critical' ? 5 : 3.5} fill={color} stroke="#f3ffff" strokeWidth="1.1" className="cursor-pointer" onClick={() => setSelectedThreat(event)} />
                        </g>;
                    })}
                    {labels.map((event) => {
                        const point = pointFor(event);
                        if (!point) return null;
                        return <text key={`label-${event.country}`} x={point[0] + 9} y={point[1] - 8} fill="#d7e4e7" fontSize="12" fontFamily="ui-monospace, monospace" opacity=".9">{event.country}</text>;
                    })}
                </g>
            </svg>

            <div className="absolute left-4 top-4 rounded border border-[#385368] bg-[#101c2a]/90 px-3 py-2 font-mono text-[10px] text-gray-300 shadow-lg backdrop-blur">
                <div className="flex items-center gap-2 text-white"><span className="h-2 w-2 animate-pulse rounded-full bg-[#49d6bd]" /> LIVE TELEMETRY MAP</div>
                <div className="mt-2 grid grid-cols-2 gap-x-5 gap-y-1 text-[9px]"><span className="text-gray-500">OBSERVED</span><strong>{stats.total}</strong><span className="text-gray-500">GEOLOCATED</span><strong className="text-cyan-300">{stats.geolocated}</strong><span className="text-gray-500">ELEVATED</span><strong className="text-red-300">{stats.high}</strong><span className="text-gray-500">SAFE / LOW</span><strong className="text-emerald-300">{stats.safe}</strong></div>
            </div>

            <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-3 rounded border border-[#385368] bg-[#101c2a]/90 px-3 py-2 font-mono text-[9px] text-gray-300 backdrop-blur">
                <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#ff5b68]" /> Threats</span><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#3edb8b]" /> Safe emails</span><span className="text-gray-600">·</span><span>{stats.geolocated} active nodes</span>
            </div>

            <div className="absolute right-4 top-4 flex flex-col gap-1.5">
                <button type="button" onClick={() => setZoom((value) => Math.min(1.7, value + .15))} title="Zoom in" className="rounded border border-[#385368] bg-[#101c2a]/90 p-2 text-gray-300 hover:text-white"><ZoomIn size={14} /></button>
                <button type="button" onClick={() => setZoom((value) => Math.max(.85, value - .15))} title="Zoom out" className="rounded border border-[#385368] bg-[#101c2a]/90 p-2 text-gray-300 hover:text-white"><ZoomOut size={14} /></button>
                <button type="button" onClick={() => setZoom(1)} title="Reset map" className="rounded border border-[#385368] bg-[#101c2a]/90 p-2 text-gray-300 hover:text-white"><RotateCcw size={14} /></button>
                <button type="button" onClick={() => setIsFullscreen((value) => !value)} title="Toggle fullscreen" className="rounded border border-[#385368] bg-[#101c2a]/90 p-2 text-gray-300 hover:text-white">{isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}</button>
            </div>

            {selectedThreat && <div className="absolute bottom-4 right-4 z-10 max-w-[280px] rounded border border-cyan-500/30 bg-[#101c2a]/95 p-4 text-[11px] text-gray-300 shadow-2xl backdrop-blur">
                <div className="flex items-start justify-between gap-3 border-b border-[#385368] pb-2"><div><p className="font-mono text-[9px] uppercase tracking-widest text-cyan-300">Selected telemetry</p><p className="mt-1 font-semibold text-white">{selectedThreat.country} · {selectedThreat.city}</p></div><button type="button" onClick={() => setSelectedThreat(null)} title="Close event details" className="text-gray-500 hover:text-white"><X size={14} /></button></div>
                <div className="mt-3 space-y-2 font-mono"><Detail label="Threat" value={selectedThreat.threatType} /><Detail label="Severity" value={selectedThreat.severity} tone={colorFor(selectedThreat)} /><Detail label="Indicator" value={selectedThreat.indicator || 'Not reported'} /><Detail label="Source" value={selectedThreat.source || 'Not reported'} /><Detail label="Observed" value={formatDate(selectedThreat.timestamp)} /></div>
            </div>}
        </div>
    );
}

function Detail({ label, value, tone }: { label: string; value: string; tone?: string }) {
    return <div className="flex gap-2"><span className="w-16 shrink-0 text-gray-500">{label}</span><span className="break-all" style={tone ? { color: tone } : undefined}>{value}</span></div>;
}

function formatDate(value: string) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

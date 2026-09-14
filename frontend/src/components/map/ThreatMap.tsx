import { useMemo, useRef, useState, type MouseEvent, type PointerEvent } from 'react';
import { geoEquirectangular, geoPath } from 'd3-geo';
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
const MAP_EVENT_LIMIT = 240;
const projection = geoEquirectangular().fitExtent([[8, 18], [WIDTH - 8, HEIGHT - 12]], { type: 'Sphere' });
const path = geoPath(projection);
const countries = (feature(worldAtlas as never, (worldAtlas as never as { objects: { countries: unknown } }).objects.countries as never) as unknown as { features: Array<Feature<Geometry>> }).features;

export function ThreatMap({ threatEvents }: ThreatMapProps) {
    const [selectedThreat, setSelectedThreat] = useState<ThreatMapEvent | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const svgRef = useRef<SVGSVGElement | null>(null);
    const dragRef = useRef<{ pointerId: number; x: number; y: number } | null>(null);
    const mouseDragRef = useRef<{ x: number; y: number } | null>(null);

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
    const topCountries = useMemo(() => {
        const counts = new Map<string, number>();
        validEvents.forEach((event) => counts.set(event.country || 'Unknown', (counts.get(event.country || 'Unknown') || 0) + 1));
        return [...counts.entries()].sort((left, right) => right[1] - left[1]).slice(0, 4);
    }, [validEvents]);
    const attackTypes = useMemo(() => [...new Set(threatEvents.map((event) => event.threatType))].slice(0, 5), [threatEvents]);

    const colorFor = (event: ThreatMapEvent) => event.severity === 'High' || event.severity === 'Critical' ? '#ff5b68' : event.severity === 'Medium' ? '#ffad4d' : '#3edb8b';
    const pointFor = (event: ThreatMapEvent) => projection([event.longitude as number, event.latitude as number]);
    const handlePointerDown = (event: PointerEvent<SVGSVGElement>) => {
        if ((event.target as Element).closest('circle')) return;
        svgRef.current?.setPointerCapture(event.pointerId);
        dragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
    };
    const handlePointerMove = (event: PointerEvent<SVGSVGElement>) => {
        if (!dragRef.current || dragRef.current.pointerId !== event.pointerId || !svgRef.current) return;
        const bounds = svgRef.current.getBoundingClientRect();
        const scaleX = WIDTH / bounds.width;
        const scaleY = HEIGHT / bounds.height;
        setPan((value) => ({ x: value.x + (event.clientX - dragRef.current!.x) * scaleX, y: value.y + (event.clientY - dragRef.current!.y) * scaleY }));
        dragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
    };
    const handlePointerUp = (event: PointerEvent<SVGSVGElement>) => {
        if (dragRef.current?.pointerId === event.pointerId) {
            svgRef.current?.releasePointerCapture(event.pointerId);
            dragRef.current = null;
        }
    };
    const handleMouseDown = (event: MouseEvent<SVGSVGElement>) => {
        if ((event.target as Element).closest('circle')) return;
        mouseDragRef.current = { x: event.clientX, y: event.clientY };
    };
    const handleMouseMove = (event: MouseEvent<SVGSVGElement>) => {
        if (!mouseDragRef.current || !svgRef.current) return;
        const bounds = svgRef.current.getBoundingClientRect();
        setPan((value) => ({ x: value.x + (event.clientX - mouseDragRef.current!.x) * (WIDTH / bounds.width), y: value.y + (event.clientY - mouseDragRef.current!.y) * (HEIGHT / bounds.height) }));
        mouseDragRef.current = { x: event.clientX, y: event.clientY };
    };
    const handleMouseUp = () => {
        mouseDragRef.current = null;
    };

    return (
        <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'relative h-[650px]'} min-h-[500px] overflow-hidden border border-[#214d57] bg-[#020b10] shadow-2xl`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_45%,rgba(13,92,103,0.32),transparent_42%),linear-gradient(180deg,#031017,#02090d)]" />
            <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(30,144,155,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(30,144,155,0.12)_1px,transparent_1px)] [background-size:34px_34px]" />
            <svg ref={svgRef} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full cursor-grab touch-none active:cursor-grabbing" role="img" aria-label="Live threat world map" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
                <defs>
                    <filter id="map-glow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                    <linearGradient id="route-line" x1="0" x2="1"><stop offset="0" stopColor="#36d5c5" stopOpacity=".15" /><stop offset=".5" stopColor="#6de8df" stopOpacity=".8" /><stop offset="1" stopColor="#ff6675" stopOpacity=".45" /></linearGradient>
                </defs>
                <g transform={`translate(${WIDTH / 2 + pan.x} ${HEIGHT / 2 + pan.y}) scale(${zoom}) translate(${-WIDTH / 2} ${-HEIGHT / 2})`}>
                    <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="#04131a" />
                    <g fill="#06151b" stroke="#23848d" strokeWidth=".8" opacity=".98">
                        {countries.map((country, index) => <path key={index} d={path(country) || undefined} />)}
                    </g>
                    <g stroke="#1d7982" strokeWidth=".6" strokeDasharray="2 8" opacity=".55">
                        {[...Array(5)].map((_, index) => <path key={`lat-${index}`} d={`M 20 ${92 + index * 78} Q 500 ${65 + index * 78} 980 ${92 + index * 78}`} fill="none" />)}
                        {[...Array(7)].map((_, index) => <path key={`lon-${index}`} d={`M ${130 + index * 125} 28 Q ${170 + index * 105} 250 ${130 + index * 125} 476`} fill="none" />)}
                    </g>
                    {validEvents.slice(0, MAP_EVENT_LIMIT).map((event, index) => {
                        const point = pointFor(event);
                        if (!point) return null;
                        const previous = validEvents[index - 1];
                        const previousPoint = previous ? pointFor(previous) : null;
                        const color = colorFor(event);
                        return <g key={event.id}>
                            {previousPoint && <path d={`M ${previousPoint[0]} ${previousPoint[1]} Q ${(previousPoint[0] + point[0]) / 2} ${Math.min(previousPoint[1], point[1]) - 55} ${point[0]} ${point[1]}`} fill="none" stroke="url(#route-line)" strokeWidth="1.6" strokeDasharray="4 5" opacity=".72"><animate attributeName="stroke-dashoffset" from="36" to="0" dur={`${2.8 + (index % 4) * .4}s`} repeatCount="indefinite" /></path>}
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

            <div className="absolute right-16 top-4 hidden w-52 rounded border border-[#385368] bg-[#101c2a]/90 p-3 font-mono text-[9px] text-gray-300 shadow-lg backdrop-blur sm:block">
                <div className="flex items-center justify-between border-b border-[#385368] pb-2"><span className="uppercase tracking-widest text-gray-400">Top observed origins</span><span className="text-cyan-300">1H</span></div>
                <div className="mt-2 space-y-2">{topCountries.length ? topCountries.map(([country, count]) => <div key={country} className="flex items-center justify-between"><span className="text-gray-300">{country}</span><span className="text-white">{count}</span></div>) : <span className="text-gray-600">Awaiting telemetry</span>}</div>
            </div>

            <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-3 rounded border border-[#385368] bg-[#101c2a]/90 px-3 py-2 font-mono text-[9px] text-gray-300 backdrop-blur">
                <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#ff5b68]" /> Threats</span><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#3edb8b]" /> Safe emails</span><span className="text-gray-600">·</span><span>{Math.min(stats.geolocated, MAP_EVENT_LIMIT)} active nodes</span><span className="hidden text-gray-500 sm:inline">Drag to explore</span>
            </div>

            <div className="absolute bottom-4 left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded border border-[#385368] bg-[#101c2a]/90 p-1 font-mono text-[9px] backdrop-blur md:flex">
                {attackTypes.map((type, index) => <span key={type} className={`rounded px-2.5 py-1.5 uppercase ${index === 0 ? 'bg-cyan-400/15 text-cyan-200' : 'text-gray-500'}`}>{type}</span>)}
            </div>

            <div className="absolute bottom-10 left-1/2 hidden w-[46%] -translate-x-1/2 items-center gap-3 font-mono text-[8px] uppercase tracking-widest text-gray-600 lg:flex">
                <span className="text-cyan-300">NOW</span><div className="relative h-px flex-1 bg-[#385368]"><i className="absolute left-[14%] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-cyan-300" /><i className="absolute left-[58%] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-red-400" /></div><span>−30 MIN</span>
            </div>

            <div className="absolute right-4 top-4 flex flex-col gap-1.5">
                <button type="button" onClick={() => setZoom((value) => Math.min(1.7, value + .15))} title="Zoom in" className="rounded border border-[#385368] bg-[#101c2a]/90 p-2 text-gray-300 hover:text-white"><ZoomIn size={14} /></button>
                <button type="button" onClick={() => setZoom((value) => Math.max(.85, value - .15))} title="Zoom out" className="rounded border border-[#385368] bg-[#101c2a]/90 p-2 text-gray-300 hover:text-white"><ZoomOut size={14} /></button>
                <button type="button" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} title="Reset map" className="rounded border border-[#385368] bg-[#101c2a]/90 p-2 text-gray-300 hover:text-white"><RotateCcw size={14} /></button>
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

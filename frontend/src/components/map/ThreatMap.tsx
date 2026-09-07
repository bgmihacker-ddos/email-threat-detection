import { useEffect, useRef, useState, useMemo } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ThreatMapEvent } from '../../types/threats';
import { Maximize2, Minimize2, RotateCcw, ZoomIn, ZoomOut, AlertTriangle } from 'lucide-react';

interface ThreatMapProps {
    threatEvents: ThreatMapEvent[];
}

export function ThreatMap({ threatEvents }: ThreatMapProps) {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);
    const markersRef = useRef<maplibregl.Marker[]>([]);
    const [selectedThreat, setSelectedThreat] = useState<ThreatMapEvent | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const containerWrapperRef = useRef<HTMLDivElement | null>(null);

    const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY || '';

    // Filter valid geolocated events only
    const validEvents = useMemo(() => {
        return threatEvents.filter(
            (e) =>
                e.latitude !== null &&
                e.longitude !== null &&
                e.latitude !== undefined &&
                e.longitude !== undefined &&
                !(e.latitude === 0 && e.longitude === 0)
        );
    }, [threatEvents]);

    const stats = useMemo(() => {
        const total = threatEvents.length;
        const geolocated = validEvents.length;
        const high = threatEvents.filter(
            (e) => e.severity === 'High' || e.severity === 'Critical'
        ).length;
        const medium = threatEvents.filter((e) => e.severity === 'Medium').length;
        return { total, geolocated, high, medium };
    }, [threatEvents, validEvents]);

    // Initialize MapLibre instance
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        if (!apiKey) {
            setLoadError('Geoapify API key is not configured. Set VITE_GEOAPIFY_API_KEY in your frontend environment.');
            return;
        }

        try {
            const map = new maplibregl.Map({
                container: mapContainerRef.current,
                style: {
                    version: 8,
                    sources: {
                        'geoapify-raster': {
                            type: 'raster',
                            tiles: [
                                `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${apiKey}`
                            ],
                            tileSize: 256,
                            maxzoom: 20,
                            attribution: '© OpenStreetMap contributors | Geoapify'
                        }
                    },
                    layers: [
                        {
                            id: 'geoapify-raster-layer',
                            type: 'raster',
                            source: 'geoapify-raster'
                        }
                    ]
                },
                center: [0, 20] as [number, number], // Lng, Lat
                zoom: 1.5,
                minZoom: 1,
                maxZoom: 18
            });

            map.on('load', () => {
                setMapLoaded(true);
            });

            map.on('error', (e: maplibregl.ErrorEvent) => {
                console.error('MapLibre error:', e);
            });

            mapRef.current = map;
        } catch (err) {
            console.error('Failed to initialize MapLibre:', err);
            setLoadError('Failed to initialize the map engine.');
        }

        return () => {
            markersRef.current.forEach(m => m.remove());
            markersRef.current = [];
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [apiKey]);

    // Update markers when validEvents change or map loads
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !mapLoaded) return;

        // Clear existing markers
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];

        // Add markers for each geolocated threat event
        validEvents.forEach((event) => {
            const color =
                event.severity === 'High' || event.severity === 'Critical'
                    ? '#ef4444'
                    : event.severity === 'Medium'
                    ? '#f97316'
                    : '#06b6d4';

            const diameter =
                event.severity === 'High' || event.severity === 'Critical'
                    ? 12
                    : event.severity === 'Medium'
                    ? 10
                    : 8;

            const el = document.createElement('div');
            el.style.width = `${diameter}px`;
            el.style.height = `${diameter}px`;
            el.style.borderRadius = '50%';
            el.style.backgroundColor = color;
            el.style.border = '1.5px solid #ffffff';
            el.style.boxShadow = `0 0 10px ${color}`;
            el.style.cursor = 'pointer';

            el.addEventListener('click', (e) => {
                e.stopPropagation();
                setSelectedThreat(event);
            });

            const marker = new maplibregl.Marker({ element: el })
                .setLngLat([event.longitude, event.latitude] as [number, number])
                .addTo(map);

            markersRef.current.push(marker);
        });
    }, [validEvents, mapLoaded]);

    const handleZoomIn = () => {
        if (!mapRef.current) return;
        mapRef.current.zoomIn();
    };

    const handleZoomOut = () => {
        if (!mapRef.current) return;
        mapRef.current.zoomOut();
    };

    const handleResetView = () => {
        if (!mapRef.current) return;
        mapRef.current.flyTo({ center: [0, 20], zoom: 1.5 });
    };

    const toggleFullscreen = () => {
        if (!containerWrapperRef.current) return;
        if (!isFullscreen) {
            if (containerWrapperRef.current.requestFullscreen) {
                containerWrapperRef.current.requestFullscreen();
            }
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
            setIsFullscreen(false);
        }
    };

    return (
        <div
            ref={containerWrapperRef}
            className="relative bg-[#060A10] rounded-lg border border-[#151D28] w-full h-full min-h-[550px] overflow-hidden shadow-2xl flex flex-col"
        >
            {/* HUD / Map Overlay */}
            <div className="absolute top-3 left-3 z-10 bg-[#0A101D]/90 backdrop-blur border border-[#1E293B] px-3 py-2 rounded text-[11px] font-mono text-gray-300 shadow-md space-y-1 pointer-events-none">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-bold text-white tracking-widest text-[10px]">LIVE SOC FEED</span>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px]">
                    <span className="text-gray-400">THREATS:</span>
                    <span className="text-right font-bold text-white">{stats.total}</span>
                    <span className="text-gray-400">GEOLOCATED:</span>
                    <span className="text-right font-bold text-cyan-400">{stats.geolocated}</span>
                    <span className="text-gray-400">HIGH/CRIT:</span>
                    <span className="text-right font-bold text-red-400">{stats.high}</span>
                    <span className="text-gray-400">MEDIUM:</span>
                    <span className="text-right font-bold text-orange-400">{stats.medium}</span>
                </div>
            </div>

            {/* Map Controls */}
            <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
                <button
                    onClick={handleZoomIn}
                    title="Zoom In"
                    className="p-2 bg-[#0A101D]/90 hover:bg-[#1E293B] text-gray-300 hover:text-white rounded border border-[#1E293B] shadow transition-colors"
                >
                    <ZoomIn size={14} />
                </button>
                <button
                    onClick={handleZoomOut}
                    title="Zoom Out"
                    className="p-2 bg-[#0A101D]/90 hover:bg-[#1E293B] text-gray-300 hover:text-white rounded border border-[#1E293B] shadow transition-colors"
                >
                    <ZoomOut size={14} />
                </button>
                <button
                    onClick={handleResetView}
                    title="Reset World View"
                    className="p-2 bg-[#0A101D]/90 hover:bg-[#1E293B] text-gray-300 hover:text-white rounded border border-[#1E293B] shadow transition-colors"
                >
                    <RotateCcw size={14} />
                </button>
                <button
                    onClick={toggleFullscreen}
                    title="Toggle Fullscreen"
                    className="p-2 bg-[#0A101D]/90 hover:bg-[#1E293B] text-gray-300 hover:text-white rounded border border-[#1E293B] shadow transition-colors"
                >
                    {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>
            </div>

            {/* Error Overlay if key is missing or load failed */}
            {loadError && (
                <div className="absolute inset-0 z-20 flex items-center justify-center p-6 bg-[#060A10]/95">
                    <div className="max-w-md p-4 bg-[#0F172A] border border-yellow-700/50 rounded-lg text-center space-y-3 shadow-2xl">
                        <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto" />
                        <h4 className="text-sm font-bold text-white font-mono">MAP CONFIGURATION REQUIRED</h4>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            {loadError}
                        </p>
                        <div className="text-[10px] text-gray-500 font-mono bg-[#060A10] p-2 rounded border border-[#1E293B] break-all">
                            frontend/.env: VITE_GEOAPIFY_API_KEY=your_key_here
                        </div>
                    </div>
                </div>
            )}

            {/* Map Container */}
            <div
                ref={mapContainerRef}
                className="w-full h-full"
            />

            {/* Threat Detail Popup */}
            {selectedThreat && (
                <div className="absolute bottom-4 right-4 z-20 bg-[#0B111A]/95 backdrop-blur border border-[#1E293B] p-4 rounded-lg text-xs text-gray-300 w-72 shadow-2xl space-y-2">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-[9px] uppercase tracking-wider text-cyan-400 font-mono">
                                {selectedThreat.source || 'Threat Feed'}
                            </span>
                            <h4 className="font-bold text-white text-sm">{selectedThreat.country}</h4>
                        </div>
                        <button
                            onClick={() => setSelectedThreat(null)}
                            className="text-gray-400 hover:text-white font-mono text-xs px-1.5 py-0.5 bg-[#1E293B] rounded"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="space-y-1 text-[11px] font-mono border-t border-[#1E293B] pt-2">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Severity:</span>
                            <span
                                className={`font-bold uppercase ${
                                    selectedThreat.severity === 'High' || selectedThreat.severity === 'Critical'
                                        ? 'text-red-400'
                                        : selectedThreat.severity === 'Medium'
                                        ? 'text-orange-400'
                                        : 'text-blue-400'
                                }`}
                            >
                                {selectedThreat.severity}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Confidence:</span>
                            <span className="text-white font-bold">{selectedThreat.confidence}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Type:</span>
                            <span className="text-white">{selectedThreat.threatType}</span>
                        </div>
                        {selectedThreat.geoSource && (
                            <div className="flex justify-between">
                                <span className="text-gray-400">Geo Source:</span>
                                <span className="text-gray-300">{selectedThreat.geoSource}</span>
                            </div>
                        )}
                        {selectedThreat.indicator && (
                            <div className="pt-1">
                                <span className="text-gray-400 block text-[10px]">Indicator:</span>
                                <span className="text-cyan-300 break-all bg-[#060A10] p-1 rounded block text-[10px] border border-[#1E293B]">
                                    {selectedThreat.indicator}
                                </span>
                            </div>
                        )}
                        <div className="text-[9px] text-gray-500 pt-1">
                            Observed: {new Date(selectedThreat.timestamp).toLocaleString()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
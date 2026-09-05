import { useMemo, useState } from 'react';
import * as d3 from 'd3-geo';
import { feature } from 'topojson-client';
import worldData from 'world-atlas/countries-110m.json';
import { ThreatMapEvent } from '../../types/threats';
import { demoThreatEvents } from '../../data/demoMapEvents';

const worldFeature = feature(worldData as any, worldData.objects.countries as any);

const projection = d3.geoMercator().scale(100).translate([400, 250]);
const pathGenerator = d3.geoPath(projection);

export function ThreatMap() {
    const [selectedThreat, setSelectedThreat] = useState<ThreatMapEvent | null>(null);

    const paths = useMemo(() => {
        return (worldFeature as any).features.map((d: any, i: number) => (
            <path
                key={`map-path-${i}`}
                d={pathGenerator(d as any)!}
                className="fill-[#151D28] stroke-[#05080D]"
            />
        ));
    }, []);

    return (
        <div className="relative bg-[#080D14] rounded-lg p-2 h-[450px] w-full overflow-hidden border border-[#153D28]">
            <svg viewBox="0 0 800 500" className="w-full h-full">
                {paths}
                {demoThreatEvents.map((event) => {
                    const [x, y] = projection([event.longitude, event.latitude])!;
                    return (
                        <circle
                            key={event.id}
                            cx={x}
                            cy={y}
                            r={4}
                            className={`cursor-pointer ${event.severity === 'Critical' ? 'fill-red-500' : 'fill-cyan-500'}`}
                            onClick={() => setSelectedThreat(event)}
                        />
                    );
                })}
            </svg>
            {selectedThreat && (
                <div className="absolute top-4 right-4 bg-[#0B111A] p-4 rounded border border-[#151D28] text-xs text-gray-300 w-48 shadow-lg z-10">
                   <p className="font-bold text-white mb-1">{selectedThreat.city}, {selectedThreat.country}</p>
                   <p>{selectedThreat.threatType}</p>
                   <p className={`font-bold ${selectedThreat.severity === 'Critical' ? 'text-red-500' : 'text-cyan-500'}`}>{selectedThreat.severity}</p>
                   <button onClick={() => setSelectedThreat(null)} className="mt-2 text-[9px] hover:text-white">CLOSE</button>
                </div>
            )}
        </div>
    );
}

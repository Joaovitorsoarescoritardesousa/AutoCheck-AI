import React, { useState } from 'react';
import { MapPin, Navigation, Layers, ExternalLink, ShieldCheck } from 'lucide-react';
import { UserLocation, ServiceProvider, ServiceCategory } from '../types';

interface LocationMapVisualProps {
  location: UserLocation;
  providers: ServiceProvider[];
  onSelectCategory: (category: ServiceCategory) => void;
}

export const LocationMapVisual: React.FC<LocationMapVisualProps> = ({
  location,
  providers,
  onSelectCategory,
}) => {
  const [activeMarker, setActiveMarker] = useState<ServiceProvider | null>(null);

  // Group closest service for each main category
  const categories: { cat: ServiceCategory; icon: string; label: string }[] = [
    { cat: 'mecanico', icon: '🔧', label: 'Mecânico' },
    { cat: 'borracheiro', icon: '🛞', label: 'Borracheiro' },
    { cat: 'eletricista', icon: '🔌', label: 'Eletricista' },
    { cat: 'guincho', icon: '🚨', label: 'Guincho' },
  ];

  // Find nearest provider for each category
  const nearestByCategory = categories.map(({ cat, icon, label }) => {
    const found = providers.find((p) => p.category === cat);
    return {
      cat,
      icon,
      label,
      distanceKm: found ? found.distanceKm : 1.5,
      providerName: found?.name || 'Serviço Próximo',
      isOpenNow: found ? found.isOpenNow : true,
    };
  });

  const getOpenMapUrl = () => {
    return `https://www.google.com/maps/search/auto+socorro+mecanico+guincho/@${location.lat},${location.lng},15z`;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
      {/* Map visual stage (Stylized GPS radar view with interactive markers) */}
      <div className="relative h-44 sm:h-52 w-full bg-slate-950 overflow-hidden select-none border-b border-slate-800/80">
        {/* Radar radar grid pattern */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at center, #f59e0b 1px, transparent 1px), linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)`,
            backgroundSize: '24px 24px, 24px 24px, 24px 24px',
          }}
        />

        {/* Pulse radius circles centered at user */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-64 rounded-full border border-amber-500/10 animate-ping opacity-40"></div>
          <div className="w-48 h-48 rounded-full border border-amber-500/20 absolute"></div>
          <div className="w-28 h-28 rounded-full border border-emerald-500/30 bg-emerald-500/5 absolute"></div>
        </div>

        {/* Map Header Overlay */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-auto z-20">
          <div className="bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-800 flex items-center gap-1.5 shadow-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10px] font-black text-slate-200 uppercase tracking-wider">
              {location.isAutoDetected ? 'GPS Ativo em Tempo Real' : 'Local Definido Manualmente'}
            </span>
          </div>

          <a
            id="btn-open-google-maps"
            href={getOpenMapUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-950/85 hover:bg-slate-800 backdrop-blur-md px-2 py-1 rounded-xl border border-slate-800 text-[10px] font-bold text-amber-400 flex items-center gap-1 shadow-md transition-colors"
          >
            <span>Ver no Google Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Center: "📍 Você está aqui" User Marker */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto z-10">
          <div className="relative flex flex-col items-center -mt-4 cursor-default group">
            {/* Marker tooltip tag */}
            <div className="bg-slate-950/95 border border-emerald-500/60 text-emerald-300 px-2.5 py-1 rounded-full text-[11px] font-black shadow-lg shadow-emerald-950/50 flex items-center gap-1 whitespace-nowrap mb-1 animate-pulse">
              <span>📍 Você está aqui</span>
            </div>

            {/* Pin head with ripple */}
            <div className="relative">
              <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-emerald-500/40">
                <Navigation className="w-3.5 h-3.5 fill-slate-950 rotate-45" />
              </div>
              <span className="absolute -inset-1 rounded-full border border-emerald-400 animate-ping opacity-75"></span>
            </div>
          </div>
        </div>

        {/* Scattered Provider Markers around center */}
        {providers.slice(0, 4).map((p, idx) => {
          // Positions calculated deterministically for visual representation
          const positions = [
            { top: '22%', left: '22%' },
            { top: '28%', right: '18%' },
            { bottom: '20%', left: '26%' },
            { bottom: '22%', right: '22%' },
          ];
          const pos = positions[idx % positions.length];
          const isSelected = activeMarker?.id === p.id;

          const categoryIcons: Record<string, string> = {
            mecanico: '🔧',
            borracheiro: '🛞',
            eletricista: '🔌',
            guincho: '🚨',
            funilaria: '🎨',
          };

          return (
            <div
              key={p.id}
              style={pos}
              className="absolute z-10 cursor-pointer pointer-events-auto group"
              onClick={() => setActiveMarker(isSelected ? null : p)}
            >
              <div
                className={`p-1.5 rounded-xl border flex items-center gap-1 text-[10px] font-black transition-all shadow-md ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-300 scale-110'
                    : 'bg-slate-900/90 text-slate-200 border-slate-700 hover:border-amber-400'
                }`}
              >
                <span>{categoryIcons[p.category] || '🚗'}</span>
                <span>{p.distanceKm} km</span>
              </div>
            </div>
          );
        })}

        {/* Floating details when a map pin is tapped */}
        {activeMarker && (
          <div className="absolute bottom-2 left-2 right-2 z-30 bg-slate-950/95 border border-amber-500/50 p-2.5 rounded-xl text-xs flex items-center justify-between gap-2 shadow-2xl animate-in fade-in">
            <div className="truncate">
              <span className="text-[10px] text-amber-400 font-bold block truncate">
                {activeMarker.categoryLabel}
              </span>
              <p className="font-black text-white truncate text-xs">
                {activeMarker.name}
              </p>
              <p className="text-[10px] text-slate-400">
                {activeMarker.distanceKm} km de você • ~{activeMarker.estimatedArrivalMin} min
              </p>
            </div>
            <button
              onClick={() => onSelectCategory(activeMarker.category)}
              className="px-3 py-1.5 bg-amber-500 text-slate-950 text-[11px] font-black rounded-lg shrink-0 hover:bg-amber-400 active:scale-95"
            >
              Ver perfil
            </button>
          </div>
        )}
      </div>

      {/* Footer list format as explicitly requested:
          Exemplo:
          📍 Sua localização atual
          "Localização encontrada."
          Serviços próximos:
          🔧 Mecânico — 1,2 km
          🛞 Borracheiro — 2,1 km
          🔌 Eletricista — 3,4 km
          🚨 Guincho — 1,8 km
      */}
      <div className="p-3.5 space-y-3 bg-slate-900">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-black text-white">📍 Sua localização atual</span>
            </div>
            <p className="text-[11px] text-emerald-400 font-bold mt-0.5">
              Localização encontrada.
            </p>
            <p className="text-[11px] text-slate-400 truncate max-w-[280px]">
              {location.addressName} {location.cityState ? `(${location.cityState})` : ''}
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] font-bold text-slate-400 block">Status:</span>
            <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              {location.isAutoDetected ? 'GPS Sincronizado' : 'Manual'}
            </span>
          </div>
        </div>

        {/* Quick Nearest Services Row */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Serviços mais próximos no seu raio:
            </span>
            <span className="text-[10px] text-amber-400 font-bold">Toque para chamar</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {nearestByCategory.map((item) => (
              <button
                key={item.cat}
                id={`btn-nearest-${item.cat}`}
                onClick={() => onSelectCategory(item.cat)}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 active:scale-[0.98] transition-all text-left group"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-base">{item.icon}</span>
                  <div className="truncate">
                    <span className="text-xs font-bold text-white group-hover:text-amber-400 block truncate">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      a {item.distanceKm} km
                    </span>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-lg bg-slate-900 flex items-center justify-center shrink-0 text-slate-400 group-hover:text-white">
                  <Navigation className="w-3 h-3 group-hover:text-amber-400" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { MapPin, RefreshCw, Edit3, Check, Navigation, ShieldCheck } from 'lucide-react';
import { UserLocation } from '../types';

interface LocationBarProps {
  location: UserLocation;
  isDetecting: boolean;
  onRefreshLocation: () => void;
  onOpenManualModal: () => void;
  onRequestPermission: () => void;
}

export const LocationBar: React.FC<LocationBarProps> = ({
  location,
  isDetecting,
  onRefreshLocation,
  onOpenManualModal,
  onRequestPermission,
}) => {
  const isGpsActive = location.permissionStatus === 'granted' && location.isAutoDetected;
  const isDenied = location.permissionStatus === 'denied';

  return (
    <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-3.5 shadow-md shadow-black/40 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold">
          {isGpsActive ? (
            <>
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="uppercase tracking-wider text-emerald-400 font-extrabold flex items-center gap-1">
                📍 Você está aqui
              </span>
            </>
          ) : isDenied ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="uppercase tracking-wider text-amber-400 font-extrabold">
                Localização Manual
              </span>
            </>
          ) : (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
              <span className="uppercase tracking-wider text-slate-300 font-extrabold">
                📍 Sua Posição
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* If GPS is granted, allow quick refresh */}
          {isGpsActive && (
            <button
              id="btn-refresh-location"
              onClick={onRefreshLocation}
              disabled={isDetecting}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1 text-[11px]"
              title="Atualizar posição GPS"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isDetecting ? 'animate-spin text-amber-400' : ''}`} />
              <span className="hidden xs:inline">Atualizar</span>
            </button>
          )}

          {/* If denied or in manual mode, show prompt to enable GPS or change address */}
          {isDenied && (
            <button
              id="btn-switch-to-gps"
              onClick={onRequestPermission}
              className="px-2 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
              title="Autorizar GPS nativo"
            >
              <Navigation className="w-3 h-3" />
              <span>Ativar GPS</span>
            </button>
          )}

          {/* Button to manually edit/pick address (only when not relying strictly on active GPS unless user clicks) */}
          <button
            id="btn-edit-location"
            onClick={onOpenManualModal}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Alterar endereço ou cidade"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex items-start gap-2.5">
        <MapPin className={`w-4 h-4 shrink-0 mt-0.5 ${isGpsActive ? 'text-emerald-400' : 'text-amber-400'}`} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-white truncate">
            {location.addressName}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
            {location.cityState && <span>{location.cityState}</span>}
            <span>•</span>
            <span className={isGpsActive ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
              {isGpsActive ? 'GPS Autorizado' : 'Raio de busca: ~15 km'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

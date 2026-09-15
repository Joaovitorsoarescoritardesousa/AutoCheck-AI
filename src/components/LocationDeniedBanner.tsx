import React from 'react';
import { ShieldAlert, MapPin, Edit3, Navigation } from 'lucide-react';

interface LocationDeniedBannerProps {
  onRequestPermission: () => void;
  onOpenManualModal: () => void;
}

export const LocationDeniedBanner: React.FC<LocationDeniedBannerProps> = ({
  onRequestPermission,
  onOpenManualModal,
}) => {
  return (
    <div className="bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/40 rounded-2xl p-4 shadow-xl space-y-3.5 animate-in fade-in duration-200">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-black text-white flex items-center gap-1.5">
            <span>📍</span> Localização não autorizada
          </h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Para encontrar serviços próximos, permita o acesso à sua localização.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-800">
        {/* Main button: Permitir localização */}
        <button
          id="btn-permitir-localizacao-banner"
          onClick={onRequestPermission}
          className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-black rounded-xl text-xs shadow-md shadow-amber-500/10 flex items-center justify-center gap-1.5 transition-all"
        >
          <MapPin className="w-3.5 h-3.5 fill-slate-950" />
          <span>Permitir localização</span>
        </button>

        {/* Alternative: Informar localização manualmente */}
        <button
          id="btn-informar-manualmente-banner"
          onClick={onOpenManualModal}
          className="w-full py-2.5 px-3 bg-slate-950 hover:bg-slate-800 active:scale-[0.98] text-slate-300 hover:text-white font-bold rounded-xl text-xs border border-slate-800 flex items-center justify-center gap-1.5 transition-all"
        >
          <Edit3 className="w-3.5 h-3.5 text-amber-400" />
          <span>Informar localização manualmente</span>
        </button>
      </div>
    </div>
  );
};

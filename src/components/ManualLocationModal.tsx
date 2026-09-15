import React, { useState } from 'react';
import { Search, MapPin, X, Navigation, Check } from 'lucide-react';
import { UserLocation } from '../types';

interface ManualLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: UserLocation;
  onSelectLocation: (addressName: string, cityState: string, lat: number, lng: number) => void;
}

// Popular reference points across Brazilian capitals and major roads for immediate 1-tap selection
const PRESET_LOCATIONS = [
  { name: 'Av. Paulista, Bela Vista', city: 'São Paulo - SP', lat: -23.561684, lng: -46.655981 },
  { name: 'Av. Brigadeiro Faria Lima, Itaim Bibi', city: 'São Paulo - SP', lat: -23.586616, lng: -46.682173 },
  { name: 'Av. das Américas, Barra da Tijuca', city: 'Rio de Janeiro - RJ', lat: -23.000371, lng: -43.365894 },
  { name: 'Av. Afonso Pena, Centro', city: 'Belo Horizonte - MG', lat: -19.923485, lng: -43.937746 },
  { name: 'Av. Tancredo Neves, Caminho das Árvores', city: 'Salvador - BA', lat: -12.981881, lng: -38.456641 },
  { name: 'Rodovia Presidente Dutra (BR-116)', city: 'Trecho SP/RJ', lat: -23.447545, lng: -46.496582 },
  { name: 'Rodovia dos Imigrantes (SP-160)', city: 'Trecho Planalto', lat: -23.705847, lng: -46.599182 },
];

export const ManualLocationModal: React.FC<ManualLocationModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
}) => {
  const [searchQuery, setSearchQuery] = useState(currentLocation.addressName);
  const [cityInput, setCityInput] = useState(currentLocation.cityState || 'Brasil');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Use current lat/lng or approximate city coordinates
    onSelectLocation(searchQuery.trim(), cityInput.trim() || 'Local informado', currentLocation.lat, currentLocation.lng);
    onClose();
  };

  const handlePickPreset = (preset: typeof PRESET_LOCATIONS[0]) => {
    onSelectLocation(preset.name, preset.city, preset.lat, preset.lng);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                Informar Localização
              </h3>
              <p className="text-[11px] text-slate-400">
                Digite seu endereço, bairro ou rodovia
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1">
              Rua, Av., Bairro ou Ponto de Referência
            </label>
            <div className="relative">
              <input
                id="input-search-address"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ex: Rodovia Anchieta km 28, Av. Paulista 1000..."
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:border-amber-500"
                autoFocus
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1">
              Cidade / Estado
            </label>
            <input
              id="input-search-city"
              type="text"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              placeholder="Ex: São Paulo - SP, Curitiba - PR..."
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            id="btn-confirm-manual-location"
            type="submit"
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Definir esta localização</span>
          </button>
        </form>

        {/* Quick Suggestions / Popular Points */}
        <div className="pt-2 border-t border-slate-800">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
            Locais Rápidos de Referência:
          </p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {PRESET_LOCATIONS.map((loc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePickPreset(loc)}
                className="w-full text-left p-2 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/60 hover:border-amber-500/30 flex items-center justify-between text-xs transition-colors group"
              >
                <div className="truncate pr-2">
                  <span className="font-bold text-slate-200 group-hover:text-amber-400 block truncate">
                    {loc.name}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {loc.city}
                  </span>
                </div>
                <Navigation className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

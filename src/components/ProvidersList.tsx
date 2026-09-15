import React, { useState } from 'react';
import {
  Phone,
  Navigation,
  MessageCircle,
  Star,
  Clock,
  MapPin,
  ChevronLeft,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { ServiceCategory, ServiceProvider } from '../types';

interface ProvidersListProps {
  category: ServiceCategory | 'todos';
  providers: ServiceProvider[];
  userAddress: string;
  onBackToHome: () => void;
  onFilterChange: (cat: ServiceCategory | 'todos') => void;
}

const CATEGORY_NAMES: Record<ServiceCategory | 'todos', string> = {
  todos: 'Todos os Profissionais',
  mecanico: 'Mecânicos',
  borracheiro: 'Borracheiros',
  eletricista: 'Eletricistas',
  guincho: 'Guinchos & Reboques',
  funilaria: 'Funilaria & Pintura',
};

export const ProvidersList: React.FC<ProvidersListProps> = ({
  category,
  providers,
  userAddress,
  onBackToHome,
  onFilterChange,
}) => {
  const [selectedSort, setSelectedSort] = useState<'distancia' | 'avaliacao' | 'abertos'>('distancia');

  const filteredAndSortedProviders = [...providers].sort((a, b) => {
    if (selectedSort === 'abertos') {
      if (a.isOpenNow !== b.isOpenNow) return a.isOpenNow ? -1 : 1;
      return a.distanceKm - b.distanceKm;
    }
    if (selectedSort === 'avaliacao') {
      return b.rating - a.rating;
    }
    // Default: distance first, then open
    return a.distanceKm - b.distanceKm;
  });

  const getWhatsappUrl = (phone: string, providerName: string) => {
    const text = encodeURIComponent(
      `Olá ${providerName}! Encontrei vocês no AutoCheck AI. Preciso de socorro com meu carro próximo a: ${userAddress}. Vocês estão atendendo agora?`
    );
    return `https://wa.me/${phone}?text=${text}`;
  };

  const getRouteUrl = (lat: number, lng: number, providerName: string) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(
      providerName
    )}`;
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between gap-2">
        <button
          id="btn-back-to-home"
          onClick={onBackToHome}
          className="flex items-center gap-1.5 text-sm font-bold text-slate-300 hover:text-white px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Voltar ao início</span>
        </button>

        <span className="text-xs text-amber-400 font-extrabold px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/20">
          {filteredAndSortedProviders.length} próximos de você
        </span>
      </div>

      {/* Category Pills Slider */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
        {(['todos', 'guincho', 'borracheiro', 'mecanico', 'eletricista', 'funilaria'] as const).map((cat) => (
          <button
            key={cat}
            id={`filter-pill-${cat}`}
            onClick={() => onFilterChange(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              category === cat
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            {CATEGORY_NAMES[cat]}
          </button>
        ))}
      </div>

      {/* Title & Sorting Bar */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div>
          <h2 className="text-xl font-black text-white leading-tight">
            {CATEGORY_NAMES[category]}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Ordenados pelos mais rápidos para chegar até você
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-[11px] font-semibold">
          <button
            onClick={() => setSelectedSort('distancia')}
            className={`px-2 py-1 rounded-lg ${
              selectedSort === 'distancia' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            Distância
          </button>
          <button
            onClick={() => setSelectedSort('abertos')}
            className={`px-2 py-1 rounded-lg ${
              selectedSort === 'abertos' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            Abertos
          </button>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-3.5">
        {filteredAndSortedProviders.map((provider) => (
          <div
            key={provider.id}
            id={`provider-card-${provider.id}`}
            className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-lg transition-all"
          >
            {/* Header: Name, Distance & Status */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  {provider.badge && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-400/15 text-amber-300 border border-amber-400/30">
                      {provider.badge}
                    </span>
                  )}
                  {provider.isOpenNow ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      🟢 Aberto agora
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                      Fechado agora
                    </span>
                  )}
                </div>

                <h3 className="text-base font-black text-white leading-snug">
                  {provider.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {provider.specialty}
                </p>
              </div>

              {/* Distance block */}
              <div className="text-right shrink-0 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-end gap-1 text-xs font-black text-amber-400">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{provider.distanceKm < 1 ? `${Math.round(provider.distanceKm * 1000)} m` : `${provider.distanceKm} km`}</span>
                </div>
                <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 mt-0.5">
                  <Clock className="w-3 h-3" />
                  <span>~{provider.estimatedArrivalMin} min</span>
                </div>
              </div>
            </div>

            {/* Info Row: Rating and Address */}
            <div className="flex items-center gap-3 text-xs text-slate-300 mt-2.5 pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-1 font-bold text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{provider.rating.toFixed(1)}</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  ({provider.reviewsCount})
                </span>
              </div>
              <span className="text-slate-600">•</span>
              <div className="text-slate-400 truncate text-[11px]">
                {provider.hoursDescription}
              </div>
            </div>

            {/* Large Buttons: LIGAR, ROTA, WHATSAPP */}
            <div className="grid grid-cols-3 gap-2 mt-3.5 pt-2 border-t border-slate-800">
              {/* 1. Ligar */}
              <a
                id={`btn-call-${provider.id}`}
                href={`tel:${provider.phone}`}
                className="bg-slate-950 hover:bg-slate-800 active:scale-[0.97] text-white font-black min-h-[48px] py-3 px-2 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-800 shadow transition-all"
              >
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <span>LIGAR</span>
              </a>

              {/* 2. Rota */}
              <a
                id={`btn-route-${provider.id}`}
                href={getRouteUrl(provider.lat, provider.lng, provider.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-950 hover:bg-slate-800 active:scale-[0.97] text-white font-black min-h-[48px] py-3 px-2 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-800 shadow transition-all"
              >
                <Navigation className="w-4 h-4 text-amber-400 shrink-0" />
                <span>ROTA</span>
              </a>

              {/* 3. WhatsApp */}
              <a
                id={`btn-whatsapp-${provider.id}`}
                href={getWhatsappUrl(provider.whatsapp, provider.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-500 active:scale-[0.97] text-white font-black min-h-[48px] py-3 px-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-white shrink-0" />
                <span>WHATSAPP</span>
              </a>
            </div>
          </div>
        ))}

        {filteredAndSortedProviders.length === 0 && (
          <div className="text-center py-10 bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <p className="text-sm text-slate-300 font-bold">
              Nenhum profissional encontrado nesta categoria no raio atual.
            </p>
            <button
              onClick={() => onFilterChange('todos')}
              className="mt-3 px-4 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl"
            >
              Ver todos os socorristas
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

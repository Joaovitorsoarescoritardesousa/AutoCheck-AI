import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LocationBar } from './components/LocationBar';
import { HomeHeroGrid } from './components/HomeHeroGrid';
import { ProvidersList } from './components/ProvidersList';
import { CrashAnalysisModal } from './components/CrashAnalysisModal';
import { EmergencyModal } from './components/EmergencyModal';
import { StickyEmergencyButton } from './components/StickyEmergencyButton';
import { HistoryDrawer } from './components/HistoryDrawer';
import { EmergencyNumbersModal } from './components/EmergencyNumbersModal';
import { LocationPermissionModal } from './components/LocationPermissionModal';
import { LocationDeniedBanner } from './components/LocationDeniedBanner';
import { ManualLocationModal } from './components/ManualLocationModal';
import { LocationMapVisual } from './components/LocationMapVisual';
import { getProvidersForLocation } from './data/mockProviders';
import {
  ServiceCategory,
  ServiceProvider,
  UserLocation,
  CrashHistoryItem,
  CrashAnalysisResult,
  EmergencyProblemId,
} from './types';

const STORAGE_KEY_LOCATION_PERMISSION = 'autocheck_location_permission';
const STORAGE_KEY_SAVED_LOCATION = 'autocheck_saved_location';

export default function App() {
  // Current view state: 'home' | 'providers'
  const [currentView, setCurrentView] = useState<'home' | 'providers'>('home');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'todos'>('todos');

  // Location state
  const [location, setLocation] = useState<UserLocation>(() => {
    try {
      const savedPerm = localStorage.getItem(STORAGE_KEY_LOCATION_PERMISSION);
      const savedLoc = localStorage.getItem(STORAGE_KEY_SAVED_LOCATION);
      if (savedLoc) {
        const parsed = JSON.parse(savedLoc);
        return {
          ...parsed,
          permissionStatus: (savedPerm as any) || 'prompt',
        };
      }
      return {
        lat: -23.561684,
        lng: -46.655981,
        addressName: 'Av. Paulista, Bela Vista',
        cityState: 'São Paulo - SP',
        isAutoDetected: false,
        permissionStatus: (savedPerm as any) || 'prompt',
      };
    } catch {
      return {
        lat: -23.561684,
        lng: -46.655981,
        addressName: 'Av. Paulista, Bela Vista',
        cityState: 'São Paulo - SP',
        isAutoDetected: false,
        permissionStatus: 'prompt',
      };
    }
  });

  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);
  const [showPermissionModal, setShowPermissionModal] = useState<boolean>(false);
  const [showManualLocationModal, setShowManualLocationModal] = useState<boolean>(false);

  // Modals state
  const [isCrashModalOpen, setIsCrashModalOpen] = useState<boolean>(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState<boolean>(false);
  const [isEmergencyCallOpen, setIsEmergencyCallOpen] = useState<boolean>(false);

  // Crash history in localStorage
  const [crashHistory, setCrashHistory] = useState<CrashHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('autocheck_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Providers list based on location and category
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [pendingCategory, setPendingCategory] = useState<ServiceCategory | null>(null);

  // Check initial permission status on mount WITHOUT showing intrusive modal immediately
  // Only silently restore GPS if user previously granted permission
  useEffect(() => {
    const savedPerm = localStorage.getItem(STORAGE_KEY_LOCATION_PERMISSION);
    if (savedPerm === 'granted') {
      fetchCurrentGpsPosition();
    }
  }, []);

  // Update providers when location or category changes
  useEffect(() => {
    const updated = getProvidersForLocation(
      selectedCategory,
      location.lat,
      location.lng,
      location.addressName
    );
    setProviders(updated);
  }, [selectedCategory, location.lat, location.lng, location.addressName]);

  // Execute native device GPS geolocation
  const fetchCurrentGpsPosition = (onComplete?: () => void) => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({
        ...prev,
        permissionStatus: 'denied',
        isAutoDetected: false,
      }));
      onComplete?.();
      return;
    }

    setIsDetectingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        let addressName = `Coordenadas: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        let cityState = 'Localização Detectada via GPS';

        // Attempt reverse geocoding via OpenStreetMap Nominatim
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4000);
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            { signal: controller.signal }
          );
          clearTimeout(timeoutId);
          if (res.ok) {
            const data = await res.json();
            const road = data.address?.road || data.address?.suburb || 'Sua localização atual';
            const city = data.address?.city || data.address?.town || data.address?.municipality || '';
            const state = data.address?.state_code || data.address?.state || '';
            addressName = road;
            cityState = city && state ? `${city} - ${state}` : city || state || 'Brasil';
          }
        } catch (e) {
          // Fallback to coordinates
        }

        const newLoc: UserLocation = {
          lat: latitude,
          lng: longitude,
          addressName,
          cityState,
          isAutoDetected: true,
          permissionStatus: 'granted',
          isManualMode: false,
        };

        setLocation(newLoc);
        setIsDetectingLocation(false);
        setShowPermissionModal(false);

        try {
          localStorage.setItem(STORAGE_KEY_LOCATION_PERMISSION, 'granted');
          localStorage.setItem(STORAGE_KEY_SAVED_LOCATION, JSON.stringify(newLoc));
        } catch {
          // ignore storage error
        }

        onComplete?.();
      },
      (error) => {
        console.warn('Geolocation error / denied:', error.message);
        setIsDetectingLocation(false);
        setShowPermissionModal(false);
        setLocation((prev) => ({
          ...prev,
          permissionStatus: 'denied',
          isAutoDetected: false,
        }));
        try {
          localStorage.setItem(STORAGE_KEY_LOCATION_PERMISSION, 'denied');
        } catch {
          // ignore
        }
        onComplete?.();
      },
      { enableHighAccuracy: true, timeout: 9000 }
    );
  };

  // User accepts permission in modal
  const handleAllowPermission = () => {
    setShowPermissionModal(false);
    fetchCurrentGpsPosition(() => {
      if (pendingCategory) {
        setSelectedCategory(pendingCategory);
        setCurrentView('providers');
        setPendingCategory(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  };

  // User declines permission in modal ("Agora não")
  const handleDenyPermission = () => {
    setShowPermissionModal(false);
    setLocation((prev) => ({
      ...prev,
      permissionStatus: 'denied',
      isAutoDetected: false,
    }));
    try {
      localStorage.setItem(STORAGE_KEY_LOCATION_PERMISSION, 'denied');
    } catch {
      // ignore
    }
    if (pendingCategory) {
      setSelectedCategory(pendingCategory);
      setCurrentView('providers');
      setPendingCategory(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // User sets manual location
  const handleSelectManualLocation = (
    addressName: string,
    cityState: string,
    lat: number,
    lng: number
  ) => {
    const updated: UserLocation = {
      lat,
      lng,
      addressName,
      cityState,
      isAutoDetected: false,
      permissionStatus: location.permissionStatus,
      isManualMode: true,
    };
    setLocation(updated);
    try {
      localStorage.setItem(STORAGE_KEY_SAVED_LOCATION, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Contextual permission: when user chooses a service, request permission if not yet decided
  const handleSelectCategory = (cat: ServiceCategory) => {
    if (location.permissionStatus === 'prompt') {
      setPendingCategory(cat);
      setShowPermissionModal(true);
      return;
    }
    setSelectedCategory(cat);
    setCurrentView('providers');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectEmergencyProblem = (
    _problemId: EmergencyProblemId,
    category: ServiceCategory
  ) => {
    setIsEmergencyModalOpen(false);
    setSelectedCategory(category);
    setCurrentView('providers');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveToHistory = (result: CrashAnalysisResult, photoData: string) => {
    const newItem: CrashHistoryItem = {
      id: `hist-${Date.now()}`,
      date: new Date().toISOString(),
      photoUrl: photoData,
      damage: result.identifiedDamage,
      severity: result.severity,
      estimate: result.estimatedCost.formattedRange,
      recommendedService: result.recommendedCategoryLabel,
      safeToDrive: result.safeToDrive,
      needsTowTruck: result.needsTowTruck,
    };

    const updated = [newItem, ...crashHistory];
    setCrashHistory(updated);
    try {
      localStorage.setItem('autocheck_history', JSON.stringify(updated.slice(0, 20)));
    } catch {
      // Storage limit handling
    }
  };

  const handleClearHistory = () => {
    setCrashHistory([]);
    localStorage.removeItem('autocheck_history');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 pb-16">
      {/* Top Header */}
      <Header
        onOpenHistory={() => setIsHistoryDrawerOpen(true)}
        onOpenEmergencyCall={() => setIsEmergencyCallOpen(true)}
        historyCount={crashHistory.length}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-3 space-y-4">
        {/* Banner shown if user denied or haven't authorized location */}
        {location.permissionStatus === 'denied' && (
          <LocationDeniedBanner
            onRequestPermission={fetchCurrentGpsPosition}
            onOpenManualModal={() => setShowManualLocationModal(true)}
          />
        )}

        {/* Location Bar with clear indicator if GPS is active or manual */}
        <LocationBar
          location={location}
          isDetecting={isDetectingLocation}
          onRefreshLocation={fetchCurrentGpsPosition}
          onOpenManualModal={() => setShowManualLocationModal(true)}
          onRequestPermission={fetchCurrentGpsPosition}
        />

        {/* Visual Map Stage & Nearest services preview (shown after user authorized or picked location) */}
        {location.permissionStatus === 'granted' && (
          <LocationMapVisual
            location={location}
            providers={providers}
            onSelectCategory={handleSelectCategory}
          />
        )}

        {currentView === 'home' ? (
          /* Home Screen: 4 main buttons + highlighted crash analysis */
          <div className="space-y-4 animate-in fade-in duration-150">
            <HomeHeroGrid
              onSelectCategory={handleSelectCategory}
              onOpenCrashModal={() => setIsCrashModalOpen(true)}
              onSelectEmergencyMode={() => setIsEmergencyModalOpen(true)}
            />

            {/* Quick Tips for Drivers in Emergency */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-slate-200 font-bold">
                <span>🛡️ Protocolo de Segurança Imediato:</span>
              </div>
              <ul className="space-y-1 pl-4 list-disc text-slate-400 text-[11px]">
                <li>Acione o pisca-alerta imediatamente.</li>
                <li>Se possível, pare o carro no acostamento ou faixa da direita.</li>
                <li>Coloque o triângulo de sinalização a pelo menos 30 passos (~30 metros).</li>
                <li>Permaneça fora da pista, preferencialmente atrás de muretas ou guard-rails.</li>
              </ul>
            </div>
          </div>
        ) : (
          /* Providers List Screen */
          <div className="animate-in fade-in duration-150">
            <ProvidersList
              category={selectedCategory}
              providers={providers}
              userAddress={location.addressName}
              onBackToHome={() => setCurrentView('home')}
              onFilterChange={(cat) => setSelectedCategory(cat)}
            />
          </div>
        )}
      </main>

      {/* Sticky Bottom Emergency Button */}
      <StickyEmergencyButton
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setCurrentView('providers');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Permission Dialog (Shown on first entry or when requested) */}
      <LocationPermissionModal
        isOpen={showPermissionModal}
        onRequestPermission={handleAllowPermission}
        onDenyPermission={handleDenyPermission}
      />

      {/* Manual Location Search Modal */}
      <ManualLocationModal
        isOpen={showManualLocationModal}
        onClose={() => setShowManualLocationModal(false)}
        currentLocation={location}
        onSelectLocation={handleSelectManualLocation}
      />

      {/* Modals & Drawers */}
      <CrashAnalysisModal
        isOpen={isCrashModalOpen}
        onClose={() => setIsCrashModalOpen(false)}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setCurrentView('providers');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSaveToHistory={handleSaveToHistory}
      />

      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        onSelectProblem={handleSelectEmergencyProblem}
        onOpenCrashModal={() => setIsCrashModalOpen(true)}
      />

      <HistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        history={crashHistory}
        onClearHistory={handleClearHistory}
        onSelectHistoryItem={(_item) => {
          setIsHistoryDrawerOpen(false);
          setIsCrashModalOpen(true);
        }}
      />

      <EmergencyNumbersModal
        isOpen={isEmergencyCallOpen}
        onClose={() => setIsEmergencyCallOpen(false)}
      />
    </div>
  );
}

import React, { useState } from 'react';
import { MobileDeviceFrame } from './components/MobileDeviceFrame';
import { Header } from './components/Header';
import { LaudoPlateSearch } from './components/LaudoPlateSearch';
import { LaudoEditor } from './components/LaudoEditor';
import { LaudoCertificateView } from './components/LaudoCertificateView';
import { AiInspectionModal } from './components/AiInspectionModal';
import { LaudoHistoryModal } from './components/LaudoHistoryModal';
import { CameraViewfinderModal } from './components/CameraViewfinderModal';
import { DEMO_LAUDOS, lookupOrGenerateLaudo, generateRealVehicleLaudo } from './data/mockVehicles';
import {
  LaudoInspection,
  AiInspectionResult,
  InspectionPhoto,
} from './types';

const STORAGE_KEY_LAUDOS_HISTORY = 'autocheck_laudos_history';

export default function App() {
  // Navigation tab state: 'search' | 'editor' | 'certificate'
  const [currentView, setCurrentView] = useState<'search' | 'editor' | 'certificate'>('search');

  // Searching loading indicator
  const [isSearchingPlate, setIsSearchingPlate] = useState<boolean>(false);

  // Active Laudo
  const [activeLaudo, setActiveLaudo] = useState<LaudoInspection>(() => DEMO_LAUDOS[0]);

  // History of Laudos in localStorage
  const [laudoHistory, setLaudoHistory] = useState<LaudoInspection[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LAUDOS_HISTORY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return DEMO_LAUDOS;
    } catch {
      return DEMO_LAUDOS;
    }
  });

  // Modals state
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [aiPresetPart, setAiPresetPart] = useState<string>('Geral');
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isQuickCameraOpen, setIsQuickCameraOpen] = useState<boolean>(false);
  const [photoToast, setPhotoToast] = useState<string | null>(null);

  // Save history to localStorage
  const saveHistoryToStorage = (updatedHistory: LaudoInspection[]) => {
    setLaudoHistory(updatedHistory);
    try {
      localStorage.setItem(STORAGE_KEY_LAUDOS_HISTORY, JSON.stringify(updatedHistory));
    } catch (e) {
      console.error('Failed to save laudo history:', e);
    }
  };

  // Search by Plate: REAL LIFE QUERY -> OPENS COMPLETE LAUDO DIRECTLY!
  const handleSearchPlate = async (plate: string) => {
    const clean = plate.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    setIsSearchingPlate(true);

    try {
      const laudoFoundOrGenerated = await lookupOrGenerateLaudo(
        clean,
        'Posto Central de Vistoria',
        'São Paulo - SP',
        laudoHistory
      );

      setActiveLaudo(laudoFoundOrGenerated);
      handleSaveLaudo(laudoFoundOrGenerated);

      // IMMEDIATELY OPEN THE COMPLETE LAUDO AS REQUESTED!
      setCurrentView('certificate');
    } catch (err) {
      console.error('Error during plate query:', err);
      const fallback = generateRealVehicleLaudo(clean, 'Posto Central de Vistoria', 'São Paulo - SP');
      setActiveLaudo(fallback);
      handleSaveLaudo(fallback);
      setCurrentView('certificate');
    } finally {
      setIsSearchingPlate(false);
    }
  };

  // Select Demo -> Directly shows the complete Laudo
  const handleSelectDemo = (demo: LaudoInspection) => {
    setActiveLaudo(demo);
    setCurrentView('certificate');
  };

  // Start New Laudo
  const handleStartNewLaudo = () => {
    const randomSuffix = Math.floor(10 + Math.random() * 89);
    const newLaudo = generateRealVehicleLaudo(`NOVA${randomSuffix}`, 'Posto Central de Vistoria', 'São Paulo - SP');
    setActiveLaudo(newLaudo);
    setCurrentView('editor');
  };

  // Save Laudo to history
  const handleSaveLaudo = (laudoToSave: LaudoInspection) => {
    setLaudoHistory((prev) => {
      const exists = prev.some((l) => l.id === laudoToSave.id);
      let updated: LaudoInspection[];
      if (exists) {
        updated = prev.map((l) => (l.id === laudoToSave.id ? laudoToSave : l));
      } else {
        updated = [laudoToSave, ...prev];
      }
      try {
        localStorage.setItem(STORAGE_KEY_LAUDOS_HISTORY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save to localStorage:', e);
      }
      return updated;
    });
  };

  // Add captured photo directly to the active Laudo
  const handleAddPhoto = (photo: InspectionPhoto) => {
    setActiveLaudo((prev) => {
      const updatedPhotos = [photo, ...prev.photos];
      const updatedLaudo = { ...prev, photos: updatedPhotos };
      handleSaveLaudo(updatedLaudo);
      return updatedLaudo;
    });
  };

  // Remove photo from active Laudo
  const handleRemovePhoto = (id: string) => {
    setActiveLaudo((prev) => {
      const updatedPhotos = prev.photos.filter((p) => p.id !== id);
      const updatedLaudo = { ...prev, photos: updatedPhotos };
      handleSaveLaudo(updatedLaudo);
      return updatedLaudo;
    });
  };

  // Delete Laudo
  const handleDeleteLaudo = (id: string) => {
    const updated = laudoHistory.filter((l) => l.id !== id);
    saveHistoryToStorage(updated);
  };

  const handleClearAllLaudos = () => {
    saveHistoryToStorage([]);
  };

  // AI Inspection Modal Handlers
  const handleOpenAiModal = (presetPart?: string) => {
    setAiPresetPart(presetPart || 'Geral (Carroceria / Estrutura)');
    setIsAiModalOpen(true);
  };

  const handleApplyAiResultToLaudo = (result: AiInspectionResult, photoUrl: string) => {
    const newPhoto: InspectionPhoto = {
      id: `photo-${Date.now()}`,
      category: 'avaria',
      label: result.identifiedComponent,
      url: photoUrl,
      aiAnalysis: `${result.visualCondition}. Risco: ${result.structuralRisk}. Observação: ${result.technicalObservations}`,
    };

    setActiveLaudo((prev) => {
      const photos = [newPhoto, ...prev.photos];
      const next = { ...prev, photos };
      if (result.verdictImpact === 'Reprovado') {
        next.verdict = 'REPROVADO';
        next.score = Math.min(next.score, 45);
        next.apontamentos = [
          `Reprovação em ${result.identifiedComponent}: ${result.visualCondition}`,
          ...next.apontamentos,
        ];
      } else if (result.verdictImpact === 'Apontamento') {
        if (next.verdict === 'APROVADO') next.verdict = 'APROVADO COM APONTAMENTO';
        next.score = Math.min(next.score, 85);
        next.apontamentos = [
          `Apontamento em ${result.identifiedComponent}: ${result.visualCondition}`,
          ...next.apontamentos,
        ];
      }
      handleSaveLaudo(next);
      return next;
    });
  };

  // Bottom navigation tab click handler
  const handleSelectBottomTab = (tab: string) => {
    if (tab === 'history') {
      setIsHistoryOpen(true);
    } else if (tab === 'search' || tab === 'editor' || tab === 'certificate') {
      setCurrentView(tab);
    }
  };

  return (
    <MobileDeviceFrame
      activeTab={currentView}
      onSelectTab={handleSelectBottomTab}
      savedCount={laudoHistory.length}
      onQuickCamera={() => setIsQuickCameraOpen(true)}
    >
      {/* Photo capture toast feedback */}
      {photoToast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2">
          <span>✓</span>
          <span>{photoToast}</span>
        </div>
      )}

      {/* App Bar (Compact on mobile, desktop navigation on PC) */}
      <Header
        onOpenHistory={() => setIsHistoryOpen(true)}
        onNewLaudo={handleStartNewLaudo}
        onOpenAiInspection={() => handleOpenAiModal()}
        historyCount={laudoHistory.length}
        activeTab={currentView}
        onSelectTab={handleSelectBottomTab}
        onQuickCamera={() => setIsQuickCameraOpen(true)}
      />

      {/* Main View Area inside the smartphone */}
      <div className="space-y-3">
        {/* VIEW 1: SEARCH & CONSULTATION */}
        {currentView === 'search' && (
          <LaudoPlateSearch
            onSearchPlate={handleSearchPlate}
            onSelectDemoLaudo={handleSelectDemo}
            onOpenAiQuickCheck={() => handleOpenAiModal()}
            isSearching={isSearchingPlate}
          />
        )}

        {/* VIEW 2: VISTORIA / LAUDO EDITOR */}
        {currentView === 'editor' && (
          <LaudoEditor
            laudo={activeLaudo}
            onUpdateLaudo={(updated) => {
              setActiveLaudo(updated);
              handleSaveLaudo(updated);
            }}
            onViewCertificate={() => setCurrentView('certificate')}
            onOpenAiForPanel={(panelName) => handleOpenAiModal(panelName)}
            onAddPhoto={handleAddPhoto}
            onRemovePhoto={handleRemovePhoto}
          />
        )}

        {/* VIEW 3: OFFICIAL COMPLETE LAUDO CERTIFICATE */}
        {currentView === 'certificate' && (
          <LaudoCertificateView
            laudo={activeLaudo}
            onBackToEdit={() => setCurrentView('editor')}
            onSaveToHistory={handleSaveLaudo}
            onAddPhoto={handleAddPhoto}
            onRemovePhoto={handleRemovePhoto}
          />
        )}
      </div>

      {/* AI Photo Inspection Modal */}
      <AiInspectionModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        presetPartName={aiPresetPart}
        onApplyResultToLaudo={handleApplyAiResultToLaudo}
      />

      {/* Saved Laudos History Modal */}
      <LaudoHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={laudoHistory}
        onSelectLaudo={(selected) => {
          setActiveLaudo(selected);
          setCurrentView('certificate');
        }}
        onDeleteLaudo={handleDeleteLaudo}
        onClearAll={handleClearAllLaudos}
      />

      {/* Global Quick Camera Modal */}
      <CameraViewfinderModal
        isOpen={isQuickCameraOpen}
        onClose={() => setIsQuickCameraOpen(false)}
        categoryLabel="Foto da Vistoria Cautelar"
        instruction="Aponte a câmera para o veículo, peça ou identificação e fotografe"
        onCapturePhoto={(photoBase64) => {
          const newPhoto: InspectionPhoto = {
            id: `photo-${Date.now()}`,
            category: 'frente',
            label: `Foto Vistoria (${activeLaudo.vehicle.placa || 'Veículo'})`,
            url: photoBase64,
            aiAnalysis: 'Foto registrada diretamente pela câmera do aplicativo.',
          };
          handleAddPhoto(newPhoto);
          setIsQuickCameraOpen(false);
          setPhotoToast(`Foto anexada à vistoria de ${activeLaudo.vehicle.placa || 'veículo'}!`);
          setTimeout(() => setPhotoToast(null), 3500);
        }}
      />
    </MobileDeviceFrame>
  );
}

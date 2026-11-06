import React, { useRef, useState } from 'react';
import { Camera, Image, Check, Sparkles, Trash2, Plus } from 'lucide-react';
import { InspectionPhoto } from '../types';
import { CameraViewfinderModal } from './CameraViewfinderModal';

interface PhotoCaptureBarProps {
  photos: InspectionPhoto[];
  onAddPhoto: (photo: InspectionPhoto) => void;
  onRemovePhoto: (id: string) => void;
  onAnalyzeWithAi?: (photoUrl: string, label: string) => void;
}

const PHOTO_CATEGORIES = [
  { id: 'frente', label: 'Frente do Carro' },
  { id: 'traseira', label: 'Traseira' },
  { id: 'lateral_esq', label: 'Lateral Esquerda' },
  { id: 'lateral_dir', label: 'Lateral Direita' },
  { id: 'odometro', label: 'Painel / Odômetro (KM)' },
  { id: 'motor', label: 'Cofre do Motor' },
  { id: 'chassi', label: 'Gravação do Chassi' },
  { id: 'avaria', label: 'Avaria / Amassado' },
];

export const PhotoCaptureBar: React.FC<PhotoCaptureBarProps> = ({
  photos,
  onAddPhoto,
  onRemovePhoto,
  onAnalyzeWithAi,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('frente');
  const [justAddedLabel, setJustAddedLabel] = useState<string | null>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);

  const galleryInputRef = useRef<HTMLInputElement>(null);

  const addPhotoFromBase64 = (base64: string, source: 'câmera' | 'galeria') => {
    const catObj = PHOTO_CATEGORIES.find((c) => c.id === selectedCategory) || PHOTO_CATEGORIES[0];

    const newPhoto: InspectionPhoto = {
      id: `photo-${Date.now()}`,
      category: catObj.id as any,
      label: catObj.label,
      url: base64,
      aiAnalysis: `Foto de ${catObj.label} registrada via ${source} do dispositivo.`,
    };

    onAddPhoto(newPhoto);
    setJustAddedLabel(catObj.label);
    setTimeout(() => setJustAddedLabel(null), 3500);
  };

  const handleGalleryFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      addPhotoFromBase64(base64, 'galeria');
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be triggered again
    e.target.value = '';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 leading-tight">
              Tirar Fotos da Vistoria
            </h4>
            <p className="text-[10px] text-slate-500">
              Registre as fotos do veículo pelo celular
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
          {photos.length} foto{photos.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Select Photo Type */}
      <div>
        <label className="text-[10px] font-bold text-slate-600 block mb-1">
          Selecione a peça ou ângulo da foto:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {PHOTO_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`p-1.5 rounded-lg text-[10px] font-semibold text-left truncate transition-all ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Camera & Gallery Trigger Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          onClick={() => setIsCameraModalOpen(true)}
          className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Camera className="w-4 h-4" />
          <span>Tirar Foto (Câmera)</span>
        </button>

        <button
          type="button"
          onClick={() => galleryInputRef.current?.click()}
          className="py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs rounded-xl shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Image className="w-4 h-4 text-blue-600" />
          <span>Galeria</span>
        </button>

        {/* Hidden gallery file input */}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          onChange={handleGalleryFile}
          className="hidden"
        />
      </div>

      {/* Live Camera Viewfinder Modal */}
      <CameraViewfinderModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapturePhoto={(photoBase64) => {
          addPhotoFromBase64(photoBase64, 'câmera');
          setIsCameraModalOpen(false);
        }}
        categoryLabel={PHOTO_CATEGORIES.find((c) => c.id === selectedCategory)?.label || 'Vistoria Veicular'}
        instruction="Focalize o veículo com boa iluminação e clique no botão circular para tirar a foto"
      />

      {justAddedLabel && (
        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Foto de "{justAddedLabel}" anexada ao laudo com sucesso!</span>
        </div>
      )}

      {/* Mini Photo Gallery Strip */}
      {photos.length > 0 && (
        <div className="pt-2 border-t border-slate-100 space-y-1.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Fotos Anexadas no Laudo:
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {photos.map((ph) => (
              <div
                key={ph.id}
                className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-900 group aspect-4/3"
              >
                <img src={ph.url} alt={ph.label} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-between p-1.5">
                  <button
                    type="button"
                    onClick={() => onRemovePhoto(ph.id)}
                    className="self-end p-1 rounded-md bg-black/60 hover:bg-rose-600 text-white transition-colors"
                    title="Remover foto"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <span className="text-[9px] font-bold text-white truncate block">
                    {ph.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export type ServiceCategory = 'mecanico' | 'borracheiro' | 'eletricista' | 'guincho' | 'funilaria';

export interface ServiceProvider {
  id: string;
  name: string;
  category: ServiceCategory;
  categoryLabel: string;
  rating: number;
  reviewsCount: number;
  distanceKm: number;
  isOpenNow: boolean;
  hoursDescription: string;
  estimatedArrivalMin: number;
  phone: string;
  whatsapp: string;
  address: string;
  lat: number;
  lng: number;
  badge?: string;
  specialty?: string;
}

export interface EstimatedCost {
  min: number;
  max: number;
  partsMin?: number;
  partsMax?: number;
  laborMin?: number;
  laborMax?: number;
  formattedRange: string;
}

export interface CrashAnalysisResult {
  identifiedDamage: string;
  severity: 'Baixa' | 'Moderada' | 'Alta';
  safeToDrive: boolean;
  needsTowTruck: boolean;
  safetyWarning?: string;
  possibleServices: string[];
  recommendedCategory: ServiceCategory;
  recommendedCategoryLabel: string;
  estimatedCost: EstimatedCost;
  disclaimer: string;
  emergencyGuidance: string;
  analyzedAt?: string;
  photoUrl?: string;
}

export interface CrashHistoryItem {
  id: string;
  date: string;
  photoUrl: string;
  vehicle?: string;
  damage: string;
  severity: 'Baixa' | 'Moderada' | 'Alta';
  estimate: string;
  recommendedService: string;
  safeToDrive: boolean;
  needsTowTruck: boolean;
}

export interface UserLocation {
  lat: number;
  lng: number;
  addressName: string;
  cityState?: string;
  isAutoDetected: boolean;
  permissionStatus: 'prompt' | 'granted' | 'denied';
  isManualMode?: boolean;
}

export type EmergencyProblemId = 'batida' | 'pneu' | 'nao_liga' | 'eletrico' | 'outro';

export interface EmergencyProblemOption {
  id: EmergencyProblemId;
  label: string;
  icon: string;
  subtitle: string;
  recommendedCategory: ServiceCategory;
  categoryLabel: string;
  urgentGuidance: string;
}

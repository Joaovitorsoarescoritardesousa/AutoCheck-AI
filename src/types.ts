export type LaudoVerdict = 'APROVADO' | 'APROVADO COM APONTAMENTO' | 'REPROVADO';

export type StructuralItemStatus = 'original' | 'apontamento' | 'reprovado';

export interface StructuralCheckItem {
  id: string;
  name: string;
  category: 'dianteira' | 'lateral' | 'traseira' | 'assoalho';
  status: StructuralItemStatus;
  description: string;
  details?: string;
}

export type PaintPanelStatus = 'original' | 'repintura' | 'massa';

export interface PaintPanelItem {
  id: string;
  name: string;
  microns: number; // e.g. 115 µm (original: 80-150, repintura: 151-240, massa: >240)
  status: PaintPanelStatus;
  notes?: string;
}

export interface FipeData {
  valorFipe: number;
  codigoFipe: string;
  mesReferencia: string;
  comparativoMercado: string;
}

export interface KmHistoryItem {
  data: string;
  km: number;
  origem: string;
  status: 'regular' | 'adulterado';
}

export interface VehicleData {
  placa: string;
  marca: string;
  modelo: string;
  versao: string;
  anoFab: number;
  anoMod: number;
  cor: string;
  combustivel: string;
  chassi: string;
  motor: string;
  renavam: string;
  cambio: 'Automático' | 'Manual' | 'CVT';
  km: number;
  municipio: string;
  fipe: FipeData;
  qtdProprietarios: number;
  tipoUsoAnterior: 'Particular' | 'Frotista / Locadora' | 'Táxi / Aplicativo';
  historicoKm: KmHistoryItem[];
}

export interface DocCheck {
  leilao: 'Nenhum' | 'Leilão Financeira' | 'Leilão Seguradora Pequena Monta' | 'Leilão Seguradora Média Monta' | 'Leilão Seguradora Grande Monta';
  sinistro: boolean;
  rouboFurto: 'Nada Consta' | 'Recuperado de Furto' | 'Alerta de Roubo Ativo';
  bloqueioJudicial: 'Nada Consta' | 'Restrição Renajud' | 'Bloqueio Policial';
  debitosMultas: 'Quitado / Sem débitos' | 'Possui débitos pendentes';
  valorDebitosTotal?: number;
  gravame: 'Sem restrição (Livre)' | 'Alienação Fiduciária';
  recall: 'Nenhum recall pendente' | 'Recall pendente na montadora';
}

export interface MechanicalCheck {
  pneus: {
    dianteiroEsqMm: number;
    dianteiroDirMm: number;
    traseiroEsqMm: number;
    traseiroDirMm: number;
    estepe: 'Excelente' | 'Bom' | 'Desgastado' | 'Ausente';
  };
  vazamentoFluidos: 'Nenhum vazamento' | 'Suor leve sem gotejamento' | 'Vazamento ativo de óleo/arrefecimento';
  vidrosChassi: 'Todos os vidros originais com gravação' | 'Parabrisa substituído sem gravação' | 'Vidro lateral divergente';
  airbagAbs: 'Sistemas operantes sem falhas' | 'Luz de advertência acesa no painel';
  motorFuncionamento: 'Marcha lenta e ruído normais' | 'Ruído mecânico atípico / fumaça visível';
  etiquetasIdentificacao: 'Todas originais presentes (ETA/VIS)' | 'Etiqueta de coluna ausente' | 'Divergência de etiquetas';
}

export interface InspectionPhoto {
  id: string;
  category: 'frente' | 'traseira' | 'lateral_esq' | 'lateral_dir' | 'motor' | 'chassi' | 'odometro' | 'avaria';
  label: string;
  url: string;
  aiAnalysis?: string;
}

export interface LaudoInspection {
  id: string;
  numeroLaudo: string; // e.g. LC-2026-84912
  codigoAutenticidade: string;
  dataEmissao: string;
  horaEmissao: string;
  cidadeUf: string;
  enderecoVistoria: string;
  vistoriadorNome: string;
  vistoriadorCertificado: string;
  vehicle: VehicleData;
  docCheck: DocCheck;
  structuralCheck: StructuralCheckItem[];
  paintPanels: PaintPanelItem[];
  mechanicalCheck: MechanicalCheck;
  photos: InspectionPhoto[];
  score: number; // 0 to 100
  verdict: LaudoVerdict;
  resumoParecer: string;
  apontamentos: string[];
  isDemonstrativeScenario?: boolean;
  demonstrativeDisclaimer?: string;
}

export interface UserLocation {
  lat: number;
  lng: number;
  addressName: string;
  cityState?: string;
  isAutoDetected: boolean;
  permissionStatus: 'prompt' | 'granted' | 'denied';
  isManualMode?: boolean;
  isRealTimeTracking?: boolean;
}

export interface AiInspectionResult {
  identifiedComponent: string;
  visualCondition: string;
  severity: 'Baixa' | 'Moderada' | 'Alta' | 'Crítica';
  structuralRisk: 'Nenhum' | 'Leve (Estético)' | 'Médio (Alinhamento)' | 'Grave (Comprometimento Estrutural)';
  verdictImpact: 'Aprovado' | 'Apontamento' | 'Reprovado';
  technicalObservations: string;
  estimatedPaintMicrons?: number;
  recommendation: string;
  confidenceScore?: number;
}

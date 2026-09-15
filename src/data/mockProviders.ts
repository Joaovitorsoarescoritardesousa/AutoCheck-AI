import { ServiceCategory, ServiceProvider, EmergencyProblemOption } from '../types';

export const EMERGENCY_PROBLEMS: EmergencyProblemOption[] = [
  {
    id: 'batida',
    label: 'Bati o carro',
    icon: '🚗',
    subtitle: 'Colisão com outro veículo, poste ou obstáculo',
    recommendedCategory: 'funilaria',
    categoryLabel: 'Funilaria e Guincho',
    urgentGuidance: 'Ligue o pisca-alerta, coloque o triângulo a 30m e certifique-se de estar em local seguro.',
  },
  {
    id: 'pneu',
    label: 'Pneu furou',
    icon: '🛞',
    subtitle: 'Pneu murcho, rasgado ou estourado',
    recommendedCategory: 'borracheiro',
    categoryLabel: 'Borracheiro 24h',
    urgentGuidance: 'Não continue rodando com a roda no aro. Pare em local plano e sinalize a pista.',
  },
  {
    id: 'nao_liga',
    label: 'Carro não liga',
    icon: '🔋',
    subtitle: 'Motor gira e não pega ou bateria arriou',
    recommendedCategory: 'mecanico',
    categoryLabel: 'Mecânico / Socorro',
    urgentGuidance: 'Evite forçar a ignição repetidas vezes para não queimar o motor de arranque.',
  },
  {
    id: 'eletrico',
    label: 'Problema elétrico',
    icon: '⚡',
    subtitle: 'Pane geral, fumaça, luzes apagadas ou fusível',
    recommendedCategory: 'eletricista',
    categoryLabel: 'Auto Elétrica',
    urgentGuidance: 'Se houver cheiro de fumaça plástica, desligue a chave imediatamente e abra o capô com cuidado.',
  },
  {
    id: 'outro',
    label: 'Outro problema',
    icon: '❓',
    subtitle: 'Superaquecimento, barulho estranho ou pane desconhecida',
    recommendedCategory: 'guincho',
    categoryLabel: 'Guincho e Reboque',
    urgentGuidance: 'Se não tiver certeza do defeito, um guincho levará seu carro com segurança à oficina de sua escolha.',
  },
];

export const SAMPLE_CRASH_IMAGES = [
  {
    id: 'sample-bumper',
    label: 'Batida Leve / Para-choque',
    subtitle: 'Colisão frontal urbana',
    previewUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
    description: 'Para-choque amassado, pintura raspada e farol desalinhado',
  },
  {
    id: 'sample-door',
    label: 'Batida Lateral / Porta e Paralama',
    subtitle: 'Abalroamento lateral',
    previewUrl: 'https://images.unsplash.com/photo-1590362891988-37583a48e3e4?w=800&auto=format&fit=crop&q=80',
    description: 'Porta dianteira amassada e vinco no paralama',
  },
  {
    id: 'sample-severe',
    label: 'Colisão Grave / Suspensão e Roda',
    subtitle: 'Não seguro rodar (Guincho recomendado)',
    previewUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop&q=80',
    description: 'Roda torta, frente destruída com perda de radiador',
  },
];

interface ProviderTemplate {
  name: string;
  category: ServiceCategory;
  categoryLabel: string;
  baseDistance: number;
  rating: number;
  reviewsCount: number;
  isOpenNow: boolean;
  hoursDescription: string;
  phone: string;
  whatsapp: string;
  badge?: string;
  specialty: string;
}

const TEMPLATE_PROVIDERS: ProviderTemplate[] = [
  // GUINCHOS
  {
    name: 'SOS Guincho & Reboque 24 Horas',
    category: 'guincho',
    categoryLabel: 'Guincho 24h',
    baseDistance: 1.2,
    rating: 4.9,
    reviewsCount: 342,
    isOpenNow: true,
    hoursDescription: 'Aberto 24 Horas • Plantão Noturno',
    phone: '11988770011',
    whatsapp: '5511988770011',
    badge: '⚡ Resposta Rápida (15 min)',
    specialty: 'Plataforma hidráulica para veículos leves e SUVs',
  },
  {
    name: 'Guincho Expresso Pró-Socorro',
    category: 'guincho',
    categoryLabel: 'Guincho',
    baseDistance: 2.8,
    rating: 4.8,
    reviewsCount: 198,
    isOpenNow: true,
    hoursDescription: 'Aberto 24 Horas',
    phone: '11977665544',
    whatsapp: '5511977665544',
    badge: 'Chegada em ~20 min',
    specialty: 'Reboque com patins para rodas travadas',
  },
  {
    name: 'Auto Socorro & Resgate Rodoviário',
    category: 'guincho',
    categoryLabel: 'Guincho Rodoviário',
    baseDistance: 4.1,
    rating: 4.7,
    reviewsCount: 154,
    isOpenNow: true,
    hoursDescription: 'Aberto 24h',
    phone: '11966554433',
    whatsapp: '5511966554433',
    specialty: 'Atendimento urbano e rodovias próximas',
  },

  // BORRACHEIROS
  {
    name: 'Borracharia SOS Móvel & 24h',
    category: 'borracheiro',
    categoryLabel: 'Borracheiro 24h',
    baseDistance: 0.9,
    rating: 4.9,
    reviewsCount: 285,
    isOpenNow: true,
    hoursDescription: 'Aberto agora • Atende no local',
    phone: '11999112233',
    whatsapp: '5511999112233',
    badge: '🛞 Socorro Móvel no Local',
    specialty: 'Troca de estepe, vulcanização e remendo rápido',
  },
  {
    name: 'Central dos Pneus & Borracharia Central',
    category: 'borracheiro',
    categoryLabel: 'Borracheiro',
    baseDistance: 1.6,
    rating: 4.7,
    reviewsCount: 140,
    isOpenNow: true,
    hoursDescription: 'Aberto até 22:00',
    phone: '11988223344',
    whatsapp: '5511988223344',
    specialty: 'Alinhamento, conserto a frio e calibragem',
  },
  {
    name: 'Borracharia Express da Avenida',
    category: 'borracheiro',
    categoryLabel: 'Borracheiro',
    baseDistance: 3.2,
    rating: 4.6,
    reviewsCount: 88,
    isOpenNow: false,
    hoursDescription: 'Fecha às 20:00 • Abre amanhã às 07:00',
    phone: '11977334455',
    whatsapp: '5511977334455',
    specialty: 'Remendos em geral e vendas de estepe usado',
  },

  // MECÂNICOS
  {
    name: 'Oficina Mecânica Precision Auto Care',
    category: 'mecanico',
    categoryLabel: 'Mecânico Geral',
    baseDistance: 1.4,
    rating: 4.9,
    reviewsCount: 420,
    isOpenNow: true,
    hoursDescription: 'Aberto agora • Plantão mecânico',
    phone: '11966443322',
    whatsapp: '5511966443322',
    badge: '⭐ Oficina 5 Estrelas',
    specialty: 'Diagnóstico por scanner, freios, suspensão e motor',
  },
  {
    name: 'SOS Mecânico Rápido & Diagnóstico',
    category: 'mecanico',
    categoryLabel: 'Mecânico / Socorro',
    baseDistance: 2.1,
    rating: 4.8,
    reviewsCount: 215,
    isOpenNow: true,
    hoursDescription: 'Aberto agora até 21:00',
    phone: '11955332211',
    whatsapp: '5511955332211',
    badge: 'Socorro no local disponível',
    specialty: 'Arrefecimento, correia, falhas de injeção e partida',
  },
  {
    name: 'Centro Automotivo Master Motors',
    category: 'mecanico',
    categoryLabel: 'Centro Automotivo',
    baseDistance: 3.7,
    rating: 4.7,
    reviewsCount: 164,
    isOpenNow: true,
    hoursDescription: 'Aberto agora até 19:00',
    phone: '11944221100',
    whatsapp: '5511944221100',
    specialty: 'Revisão preventiva, embreagem e suspensão',
  },

  // ELETRICISTAS
  {
    name: 'Auto Elétrica & Baterias SOS Express',
    category: 'eletricista',
    categoryLabel: 'Eletricista Automotivo',
    baseDistance: 1.1,
    rating: 4.9,
    reviewsCount: 310,
    isOpenNow: true,
    hoursDescription: 'Aberto agora • Entrega e troca de bateria',
    phone: '11933110099',
    whatsapp: '5511933110099',
    badge: '🔋 Troca Bateria no Local',
    specialty: 'Baterias Moura/Heliar, alternador e motor de arranque',
  },
  {
    name: 'EletroCar Soluções Elétricas',
    category: 'eletricista',
    categoryLabel: 'Eletricista',
    baseDistance: 2.4,
    rating: 4.7,
    reviewsCount: 172,
    isOpenNow: true,
    hoursDescription: 'Aberto agora até 19:30',
    phone: '11922009988',
    whatsapp: '5511922009988',
    specialty: 'Chave codificada, fiação, faróis e iluminação',
  },
  {
    name: 'Oficina Elétrica Power Volts',
    category: 'eletricista',
    categoryLabel: 'Eletricista',
    baseDistance: 3.9,
    rating: 4.6,
    reviewsCount: 95,
    isOpenNow: false,
    hoursDescription: 'Fecha às 18:30 • Plantão WhatsApp',
    phone: '11911998877',
    whatsapp: '5511911998877',
    specialty: 'Módulos de injeção, fusíveis e chicote elétrico',
  },

  // FUNILARIA E PINTURA
  {
    name: 'Auto Funilaria & Martelinho Express',
    category: 'funilaria',
    categoryLabel: 'Funilaria e Pintura',
    baseDistance: 1.5,
    rating: 4.9,
    reviewsCount: 260,
    isOpenNow: true,
    hoursDescription: 'Aberto agora • Orçamento rápido por foto',
    phone: '11900887766',
    whatsapp: '5511900887766',
    badge: '🎨 Pintura em Estufa',
    specialty: 'Recuperação de para-choques, martelinho e alinhamento',
  },
  {
    name: 'Centro de Colisão & Funilaria VIP',
    category: 'funilaria',
    categoryLabel: 'Centro de Colisão',
    baseDistance: 2.7,
    rating: 4.8,
    reviewsCount: 188,
    isOpenNow: true,
    hoursDescription: 'Aberto agora até 19:00',
    phone: '11999887711',
    whatsapp: '5511999887711',
    specialty: 'Mesa de alinhamento monobloco e todas as seguradoras',
  },
  {
    name: 'Oficina Renascer Funilaria Express',
    category: 'funilaria',
    categoryLabel: 'Funilaria',
    baseDistance: 4.5,
    rating: 4.7,
    reviewsCount: 124,
    isOpenNow: true,
    hoursDescription: 'Aberto até 18:00',
    phone: '11988776622',
    whatsapp: '5511988776622',
    specialty: 'Solda plástica de para-choque e polimento técnico',
  },
];

export function getProvidersForLocation(
  category: ServiceCategory | 'todos',
  userLat: number,
  userLng: number,
  addressPrefix: string = 'Av. Principal'
): ServiceProvider[] {
  const filtered = category === 'todos'
    ? TEMPLATE_PROVIDERS
    : TEMPLATE_PROVIDERS.filter((p) => p.category === category);

  return filtered
    .map((template, index) => {
      // Deterministic slight angle offset around user coordinate
      const angle = (index * 60 + 25) * (Math.PI / 180);
      const kmDistance = Number((template.baseDistance + (index % 3) * 0.3).toFixed(1));
      
      // ~1 deg lat = 111km
      const dLat = (kmDistance / 111) * Math.cos(angle);
      const dLng = (kmDistance / (111 * Math.cos((userLat * Math.PI) / 180))) * Math.sin(angle);

      const lat = userLat + dLat;
      const lng = userLng + dLng;

      // Estimated arrival time: 1km approx 4 mins + 5 min prep
      const estimatedArrivalMin = Math.max(8, Math.round(kmDistance * 3.5 + 5));

      return {
        id: `provider-${template.category}-${index + 1}`,
        name: template.name,
        category: template.category,
        categoryLabel: template.categoryLabel,
        rating: template.rating,
        reviewsCount: template.reviewsCount,
        distanceKm: kmDistance,
        isOpenNow: template.isOpenNow,
        hoursDescription: template.hoursDescription,
        estimatedArrivalMin,
        phone: template.phone,
        whatsapp: template.whatsapp,
        address: `${addressPrefix}, nº ${100 + index * 140} - Próximo ao km ${(kmDistance + 1).toFixed(1)}`,
        lat,
        lng,
        badge: template.badge,
        specialty: template.specialty,
      };
    })
    .sort((a, b) => {
      // Prioritization requested: 1. Distância, 2. Aberto agora, 3. Avaliação, 4. Tempo
      if (a.isOpenNow !== b.isOpenNow) return a.isOpenNow ? -1 : 1;
      return a.distanceKm - b.distanceKm;
    });
}

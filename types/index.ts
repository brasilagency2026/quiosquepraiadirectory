export type Quiosque = {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  plan: 'free' | 'premium';
  status: 'pending' | 'active' | 'paused';
  lat: number | null;
  lng: number | null;
  state: string;
  city: string;
  address: string;
  beach_name: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  website: string;
  operating_hours: string;
  services: string[];
  specialties: string[];
  photos: string[];
  google_place_id: string;
  google_rating: number | null;
  google_reviews_count: number;
  premium_verified_at: string | null;
  created_at: string;
};

export type UserProfile = {
  id: string;
  email: string;
  role: 'proprietario' | 'admin' | 'super_admin';
  quiosque_id: string | null;
  premium_email: string | null;
  is_premium: boolean;
  created_at: string;
};

export const SERVICES_PREDEFINIS = [
  'Wi-Fi grátis', 'Estacionamento', 'Música ao vivo', 'DJ',
  'Cadeiras de praia', 'Guarda-sol', 'Área VIP', 'Piscina',
  'Playground', 'Pet friendly', 'Acessível', 'Chuveiro',
  'Banheiro', 'Ar condicionado', 'Deck', 'Rede',
  'Esporte (vôlei/futebol)', 'Stand up paddle', 'Caiaque',
];

export const ESPECIALIDADES_PREDEFINIDAS = [
  'Caipirinha', 'Cerveja artesanal', 'Drinks tropicais', 'Açaí',
  'Frutos do mar', 'Peixe grelhado', 'Camarão', 'Espetinhos',
  'Petiscos', 'Pizza', 'Hambúrguer', 'Tapioca',
  'Queijo coalho', 'Acarajé', 'Pastel', 'Saladas',
  'Brunch', 'Café da manhã', 'Comida baiana', 'Comida japonesa',
];

export const ESTADOS_BRASIL = [
  'Acre (AC)', 'Alagoas (AL)', 'Amapá (AP)', 'Amazonas (AM)',
  'Bahia (BA)', 'Ceará (CE)', 'Distrito Federal (DF)',
  'Espírito Santo (ES)', 'Goiás (GO)', 'Maranhão (MA)',
  'Mato Grosso (MT)', 'Mato Grosso do Sul (MS)', 'Minas Gerais (MG)',
  'Pará (PA)', 'Paraíba (PB)', 'Paraná (PR)', 'Pernambuco (PE)',
  'Piauí (PI)', 'Rio de Janeiro (RJ)', 'Rio Grande do Norte (RN)',
  'Rio Grande do Sul (RS)', 'Rondônia (RO)', 'Roraima (RR)',
  'Santa Catarina (SC)', 'São Paulo (SP)', 'Sergipe (SE)',
  'Tocantins (TO)',
];

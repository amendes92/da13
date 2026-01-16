import { FreightJob, JobStatus } from './types';

export const GOOGLE_API_KEY = "AIzaSyBepLuzXFBeWe551N4t4j3l78RKMtJ0t9k";

export const MAP_CENTER = { lat: -23.5409, lng: -46.5744 }; // Tatuapé (Zona Leste)

// Mock Data: List of Deliveries/Moves
export const INITIAL_JOBS: FreightJob[] = [
  {
    id: 'j1',
    clientName: 'Roberto Carlos',
    address: 'Rua Emilia Marengo, 500',
    cargoType: 'Mudança Residencial (Sofá, Geladeira)',
    weight: '350kg',
    price: 'R$ 450,00',
    status: JobStatus.PENDING,
    photoUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=150&h=150&fit=crop',
    lat: -23.5613, 
    lng: -46.5600
  },
  {
    id: 'j2',
    clientName: 'Loja Móveis Planejados',
    address: 'Av. Regente Feijó, 1739',
    cargoType: 'Entrega Armário Cozinha',
    weight: '80kg',
    price: 'R$ 120,00',
    status: JobStatus.PENDING,
    photoUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=150&h=150&fit=crop',
    lat: -23.5610, 
    lng: -46.5650
  },
  {
    id: 'j3',
    clientName: 'Escritório Tech',
    address: 'Rua Eleonora Cintra, 200',
    cargoType: '20 Caixas de Arquivo',
    weight: '200kg',
    price: 'R$ 180,00',
    status: JobStatus.PENDING,
    photoUrl: 'https://images.unsplash.com/photo-1503959638915-d996e93d2391?w=150&h=150&fit=crop',
    lat: -23.5539, 
    lng: -46.5617
  },
  {
    id: 'j4',
    clientName: 'Ana Maria Braga',
    address: 'Rua Padre Adelino, 800',
    cargoType: 'Mesa de Jantar Vidro',
    weight: '40kg',
    price: 'R$ 90,00',
    status: JobStatus.PENDING,
    photoUrl: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=150&h=150&fit=crop',
    lat: -23.5411, 
    lng: -46.5911
  },
  {
    id: 'j5',
    clientName: 'Depósito Construção',
    address: 'Rua da Mooca, 3000',
    cargoType: 'Palete de Cimento',
    weight: '1000kg',
    price: 'R$ 300,00',
    status: JobStatus.PENDING,
    photoUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=150&h=150&fit=crop',
    lat: -23.5580, 
    lng: -46.5900
  }
];

export const SUPABASE_URL = "https://supabase.santanamendes.com.br";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzE1MDUwODAwLAogICJleHAiOiAxODcyODE3MjAwCn0.JFLEfHEf4gwNOM06kbg0pB5acVFjdFBJTTWULmHLzT4";
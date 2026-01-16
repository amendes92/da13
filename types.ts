
export enum UserRole {
  CLIENT = 'CLIENT',
  DRIVER = 'DRIVER',
  GUEST = 'GUEST',
  NONE = 'NONE'
}

export enum JobStatus {
  PENDING = 'PENDENTE',
  IN_TRANSIT = 'EM TRÂNSITO',
  DELIVERED = 'ENTREGUE',
  CANCELED = 'CANCELADO'
}

export interface FreightJob {
  id: string;
  clientName: string;
  address: string; // Destination/Delivery
  pickupAddress?: string; // Origin
  cargoType: string; 
  weight: string;   
  price: string;     
  status: JobStatus;
  photoUrl: string; 
  lat: number;
  lng: number;
  requirements?: string[]; // Checklists result
}

export interface Location {
  lat: number;
  lng: number;
}

export interface RouteStatus {
  isActive: boolean;
  currentLocation: Location;
  speed: number; // km/h
  nextStop: string;
  eta: string;
  directionsResult?: any;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

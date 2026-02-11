
export enum TurnoEstado {
  PENDIENTE = 'pendiente',
  ACEPTADO = 'aceptado',
  RECHAZADO = 'rechazado',
  COMPLETADO = 'completado'
}

export interface Cliente {
  whatsapp: string;
  nombre: string;
  email?: string;
  cumpleaños?: string; // YYYY-MM-DD
  fotoPerfil?: string;
  historialDisenos: string[]; // URLs de imágenes
}

export interface Servicio {
  id: string;
  nombre: string;
  precio: number;
  duracion: number; // en minutos
  descripcion: string;
}

export interface Venta {
  id: string;
  fecha: string; // YYYY-MM-DD
  items: { nombre: string; precio: number }[];
  total: number;
  clienteWhatsapp?: string;
}

export interface Turno {
  id: string;
  clienteWhatsapp: string;
  servicioId: string;
  fecha: string; // YYYY-MM-DD
  hora: string;  // HH:mm
  estado: TurnoEstado;
  comprobanteUrl?: string; 
  disenoUrl?: string; 
  montoSenia: number;
}

export interface ConfiguracionNegocio {
  porcentajeSenia: number;
  diasDisponibles: string[]; 
  horariosDisponibles: string[]; 
}

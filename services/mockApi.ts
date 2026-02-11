
import { Cliente, Turno, TurnoEstado, Servicio, ConfiguracionNegocio, Venta } from '../types';

const STORAGE_KEYS = {
  CLIENTES: 'fv_clientes',
  TURNOS: 'fv_turnos',
  SERVICIOS: 'fv_servicios',
  CONFIG: 'fv_config',
  VENTAS: 'fv_ventas'
};

const get = <T>(key: string, def: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : def;
};

const set = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Utilidad para mostrar fechas en formato DD/MM/AAAA
export const formatDateDisplay = (dateStr: string | undefined): string => {
  if (!dateStr) return 'Sin fecha';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

// Datos iniciales - NO BORRAR SERVICIOS REALES
if (!localStorage.getItem(STORAGE_KEYS.SERVICIOS)) {
  set(STORAGE_KEYS.SERVICIOS, [
    { id: '1', nombre: 'Semipermanente', precio: 5000, duracion: 60, descripcion: 'Esmaltado impecable con refuerzo.' },
    { id: '2', nombre: 'Esculpidas Gel', precio: 8500, duracion: 120, descripcion: 'Extensión con terminación natural.' },
    { id: '3', nombre: 'Makeup Social', precio: 12000, duracion: 90, descripcion: 'Look radiante para eventos.' }
  ]);
}

if (!localStorage.getItem(STORAGE_KEYS.CONFIG)) {
  set(STORAGE_KEYS.CONFIG, {
    porcentajeSenia: 30,
    diasDisponibles: [],
    horariosDisponibles: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00']
  });
}

export const api = {
  getCliente: (whatsapp: string): Cliente | null => {
    const clientes = get<Cliente[]>(STORAGE_KEYS.CLIENTES, []);
    return clientes.find(c => c.whatsapp === whatsapp) || null;
  },
  getClientes: (): Cliente[] => get<Cliente[]>(STORAGE_KEYS.CLIENTES, []),
  saveCliente: (cliente: Cliente) => {
    const clientes = get<Cliente[]>(STORAGE_KEYS.CLIENTES, []);
    const idx = clientes.findIndex(c => c.whatsapp === cliente.whatsapp);
    if (idx > -1) clientes[idx] = cliente;
    else clientes.push(cliente);
    set(STORAGE_KEYS.CLIENTES, clientes);
  },
  
  getTurnos: () => get<Turno[]>(STORAGE_KEYS.TURNOS, []),
  createTurno: (turno: Turno) => {
    const turnos = get<Turno[]>(STORAGE_KEYS.TURNOS, []);
    turnos.push(turno);
    set(STORAGE_KEYS.TURNOS, turnos);
  },
  updateTurno: (id: string, updates: Partial<Turno>) => {
    const turnos = get<Turno[]>(STORAGE_KEYS.TURNOS, []);
    const idx = turnos.findIndex(t => t.id === id);
    if (idx > -1) {
      turnos[idx] = { ...turnos[idx], ...updates };
      set(STORAGE_KEYS.TURNOS, turnos);
    }
  },
  deleteTurno: (id: string) => {
    const turnos = get<Turno[]>(STORAGE_KEYS.TURNOS, []);
    set(STORAGE_KEYS.TURNOS, turnos.filter(t => t.id !== id));
  },

  getServicios: () => get<Servicio[]>(STORAGE_KEYS.SERVICIOS, []),
  saveServicio: (s: Servicio) => {
    const services = api.getServicios();
    const idx = services.findIndex(item => item.id === s.id);
    if (idx > -1) services[idx] = s;
    else services.push(s);
    set(STORAGE_KEYS.SERVICIOS, services);
  },
  deleteServicio: (id: string) => {
    const services = api.getServicios();
    set(STORAGE_KEYS.SERVICIOS, services.filter(s => s.id !== id));
  },

  getVentas: () => get<Venta[]>(STORAGE_KEYS.VENTAS, []),
  saveVenta: (venta: Venta) => {
    const ventas = get<Venta[]>(STORAGE_KEYS.VENTAS, []);
    ventas.push(venta);
    set(STORAGE_KEYS.VENTAS, ventas);
  },

  getConfig: () => get<ConfiguracionNegocio>(STORAGE_KEYS.CONFIG, { porcentajeSenia: 30, diasDisponibles: [], horariosDisponibles: [] }),
  saveConfig: (c: ConfiguracionNegocio) => set(STORAGE_KEYS.CONFIG, c)
};

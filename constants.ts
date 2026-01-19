import { MaterialOption } from './types';

export const MATERIALS: MaterialOption[] = [
  { id: 'vida-suero-oral', name: 'Vida Suero Oral' },
  { id: 'espejos-vaginales', name: 'Espejos Vaginales' },
  { id: 'laminillas', name: 'Laminillas' },
  { id: 'citobrush', name: 'Citobrush' },
  { id: 'pruebas-rapidas', name: 'Pruebas Rápidas', hasSubtypes: true },
];

export const RAPID_TEST_TYPES = [
  'Hepatitis B',
  'Hepatitis C',
  'VIH/Sífilis',
  'Antígeno Prostático'
];

export const STORAGE_KEY = 'medistock_db_v1';
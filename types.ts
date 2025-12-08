export enum TransactionType {
  INGRESO = 'INGRESO',
  SALIDA = 'SALIDA'
}

export interface MaterialOption {
  id: string;
  name: string;
  hasSubtypes?: boolean;
  subtypes?: string[];
}

export interface Transaction {
  id: string;
  date: string; // ISO String
  type: TransactionType;
  materialName: string;
  subtype?: string; // For Specific Rapid Tests
  batchNumber: string; // Lote
  originOrDestination: string; // Procedencia for IN, Destino for OUT
  quantity: number;
  observations?: string;
}

export interface InventoryItem {
  materialName: string;
  totalQuantity: number;
  lastUpdated: string;
}

export interface FilterState {
  searchTerm: string;
  type: 'ALL' | TransactionType;
  startDate: string;
  endDate: string;
}
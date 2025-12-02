import { Transaction, TransactionType, InventoryItem } from '../types';
import { STORAGE_KEY } from '../constants';

// Simulating a database with LocalStorage
export const getTransactions = (): Transaction[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveTransaction = (transaction: Transaction): Transaction[] => {
  const current = getTransactions();
  // Ensure strict normalization on save
  const normalized: Transaction = {
    ...transaction,
    materialName: transaction.materialName,
    batchNumber: transaction.batchNumber.trim().toUpperCase(),
    originOrDestination: transaction.originOrDestination.trim().toUpperCase(),
    subtype: transaction.subtype,
  };
  
  const updated = [normalized, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const updateTransaction = (updatedTx: Transaction): Transaction[] => {
  const current = getTransactions();
  const index = current.findIndex(t => t.id === updatedTx.id);
  if (index !== -1) {
    current[index] = {
      ...updatedTx,
      batchNumber: updatedTx.batchNumber.trim().toUpperCase(),
      originOrDestination: updatedTx.originOrDestination.trim().toUpperCase(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  }
  return current;
};

export const deleteTransaction = (id: string): Transaction[] => {
  const current = getTransactions();
  const updated = current.filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const calculateInventory = (transactions: Transaction[]): InventoryItem[] => {
  const inventoryMap = new Map<string, { total: number, lastUpdate: string }>();

  transactions.forEach(tx => {
    // Composite key for materials with subtypes (e.g., "Pruebas Rápidas - VIH")
    const key = tx.subtype ? `${tx.materialName} (${tx.subtype})` : tx.materialName;
    
    if (!inventoryMap.has(key)) {
      inventoryMap.set(key, { total: 0, lastUpdate: tx.date });
    }

    const current = inventoryMap.get(key)!;
    
    if (tx.type === TransactionType.INGRESO) {
      current.total += tx.quantity;
    } else {
      current.total -= tx.quantity;
    }
    
    // Keep track of most recent activity
    if (new Date(tx.date) > new Date(current.lastUpdate)) {
      current.lastUpdate = tx.date;
    }
  });

  return Array.from(inventoryMap.entries()).map(([name, data]) => ({
    materialName: name,
    totalQuantity: data.total,
    lastUpdated: data.lastUpdate
  }));
};

export const exportToCSV = (transactions: Transaction[]) => {
  const headers = ['ID', 'Fecha', 'Tipo', 'Material', 'Subtipo', 'Lote', 'Origen/Destino', 'Cantidad', 'Observaciones'];
  
  const rows = transactions.map(t => [
    t.id,
    new Date(t.date).toLocaleString(),
    t.type,
    t.materialName,
    t.subtype || 'N/A',
    t.batchNumber,
    t.originOrDestination,
    t.quantity,
    `"${t.observations || ''}"` // Escape quotes
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `inventario_export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
import { Transaction, TransactionType, InventoryItem } from '../types';
import { db } from './firebaseConfig';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';

const COLLECTION_NAME = 'transactions';

// --- CLOUD FIRESTORE FUNCTIONS ---

// Subscribe to real-time updates from Firestore with error handling
export const subscribeToTransactions = (
  onData: (transactions: Transaction[]) => void,
  onError?: (error: Error) => void
) => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('date', 'desc'));
  
  const unsubscribe = onSnapshot(q, 
    (snapshot) => {
      const transactions: Transaction[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Transaction));
      onData(transactions);
    },
    (error) => {
      console.error("Firestore subscription error:", error);
      if (onError) onError(error);
    }
  );

  return unsubscribe;
};

// Add a new transaction to the cloud
export const saveTransaction = async (transaction: Transaction): Promise<void> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...data } = transaction;
  
  const normalizedData = {
    ...data,
    materialName: data.materialName,
    batchNumber: data.batchNumber.trim().toUpperCase(),
    originOrDestination: data.originOrDestination.trim().toUpperCase(),
    subtype: data.subtype || null,
    observations: data.observations || null
  };

  await addDoc(collection(db, COLLECTION_NAME), normalizedData);
};

// Update an existing transaction in the cloud
export const updateTransaction = async (transaction: Transaction): Promise<void> => {
  if (!transaction.id) return;

  const transactionRef = doc(db, COLLECTION_NAME, transaction.id);
  
  const normalizedData = {
    date: transaction.date,
    type: transaction.type,
    materialName: transaction.materialName,
    batchNumber: transaction.batchNumber.trim().toUpperCase(),
    originOrDestination: transaction.originOrDestination.trim().toUpperCase(),
    quantity: transaction.quantity,
    subtype: transaction.subtype || null,
    observations: transaction.observations || null
  };

  await updateDoc(transactionRef, normalizedData);
};

// Delete a transaction from the cloud
export const deleteTransaction = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
};

// --- UTILITY FUNCTIONS ---

export const calculateInventory = (transactions: Transaction[]): InventoryItem[] => {
  const inventoryMap = new Map<string, { total: number, lastUpdate: string }>();

  transactions.forEach(tx => {
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
    `"${t.observations || ''}"`
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `inventario_cloud_export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
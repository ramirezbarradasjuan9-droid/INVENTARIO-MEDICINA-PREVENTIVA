import React, { useState, useEffect } from 'react';
import { 
  subscribeToTransactions, 
  saveTransaction, 
  updateTransaction, 
  deleteTransaction, 
  calculateInventory 
} from './services/inventoryService';
import { Transaction, InventoryItem } from './types';
import Dashboard from './components/Dashboard';
import TransactionTable from './components/TransactionTable';
import TransactionForm from './components/TransactionForm';
import { LayoutDashboard, List, PlusCircle, Activity, Cloud, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'DASHBOARD' | 'HISTORY'>('DASHBOARD');
  const [showForm, setShowForm] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  // Load data from Firebase on mount using real-time listener
  useEffect(() => {
    const unsubscribe = subscribeToTransactions((data) => {
      setTransactions(data);
      setLoading(false);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  // Recalculate inventory whenever transactions change
  useEffect(() => {
    const inv = calculateInventory(transactions);
    setInventory(inv);
  }, [transactions]);

  const handleCreateTransaction = async (t: Transaction) => {
    // Optimistically close form, but wait for DB confirmation ideally
    // With real-time listener, the UI will update automatically when DB updates
    await saveTransaction(t);
    setShowForm(false);
  };

  const handleUpdateTransaction = async (t: Transaction) => {
    await updateTransaction(t);
    setShowForm(false);
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = async (id: string) => {
    await deleteTransaction(id);
  };

  const startEditing = (t: Transaction) => {
    setEditingTransaction(t);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-700">Conectando con la Nube...</h2>
          <p className="text-slate-500 text-sm">Cargando inventario en tiempo real</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-teal-500 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none">MediStock</h1>
              <span className="block text-xs text-slate-400 mt-1">Medicina Preventiva</span>
              <span className="block text-[10px] font-bold text-slate-500 mt-0.5 tracking-wider">HGSC PEMEX</span>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2 flex-1">
          <button
            onClick={() => setView('DASHBOARD')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              view === 'DASHBOARD' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard size={20} />
            <span>Panel General</span>
          </button>
          
          <button
            onClick={() => setView('HISTORY')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              view === 'HISTORY' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <List size={20} />
            <span>Historial y Registros</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-700 text-xs text-slate-500 text-center">
          <div className="flex items-center justify-center gap-1 mb-2 text-green-400">
            <Cloud size={12} />
            <span>Conectado a Nube</span>
          </div>
          v2.0.0 Cloud - Medicina Prev.
          <div className="mt-1 opacity-50">Ref: 736727518542</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white border-b border-slate-200 p-4 md:hidden flex justify-between items-center">
           <div className="flex items-center space-x-2">
            <div className="p-1 bg-teal-500 rounded">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-slate-800 block leading-none">MediStock</span>
              <span className="text-[10px] text-slate-500 font-bold block leading-none mt-0.5">HGSC PEMEX</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <button onClick={() => setView('DASHBOARD')} className={`p-2 rounded ${view === 'DASHBOARD' ? 'bg-slate-100' : ''}`}>
              <LayoutDashboard size={20} />
            </button>
             <button onClick={() => setView('HISTORY')} className={`p-2 rounded ${view === 'HISTORY' ? 'bg-slate-100' : ''}`}>
              <List size={20} />
            </button>
          </div>
        </header>

        {/* Top Bar for Desktop */}
        <header className="hidden md:flex justify-between items-center p-6 bg-white border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800">
            {view === 'DASHBOARD' ? 'Panel General' : 'Historial y Registros'}
          </h2>
          <button
            onClick={() => {
              setEditingTransaction(null);
              setShowForm(true);
            }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Nuevo Registro
          </button>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-6 relative">
          
          {/* Form Modal Overlay */}
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
              <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <TransactionForm
                  initialData={editingTransaction}
                  onSubmit={editingTransaction ? handleUpdateTransaction : handleCreateTransaction}
                  onCancel={() => {
                    setShowForm(false);
                    setEditingTransaction(null);
                  }}
                />
              </div>
            </div>
          )}

          {/* View Routing */}
          <div className="max-w-7xl mx-auto">
            {view === 'DASHBOARD' ? (
              <Dashboard inventory={inventory} />
            ) : (
              <div className="space-y-4">
                 {/* Mobile Add Button */}
                 <button
                    onClick={() => {
                      setEditingTransaction(null);
                      setShowForm(true);
                    }}
                    className="md:hidden w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg shadow-sm mb-4"
                  >
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Nuevo Registro
                  </button>

                <TransactionTable 
                  transactions={transactions} 
                  onEdit={startEditing}
                  onDelete={handleDeleteTransaction}
                  // onDataReload is no longer needed as subscription handles it automatically
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
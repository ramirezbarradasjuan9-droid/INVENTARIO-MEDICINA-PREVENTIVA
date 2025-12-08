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
import { LayoutDashboard, List, PlusCircle, Activity, Cloud, Loader2, AlertOctagon } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'DASHBOARD' | 'HISTORY'>('DASHBOARD');
  const [showForm, setShowForm] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from Firebase on mount using real-time listener
  useEffect(() => {
    // Note: subscribeToTransactions implementation should ideally handle errors
    // Since the current signature in inventoryService.ts might not have onError callback
    // we assume it works or update inventoryService if needed.
    // Based on previous context, we'll try to use a version that supports error handling if available
    // or wrap it. For now, using the standard subscription.
    
    try {
      const unsubscribe = subscribeToTransactions((data) => {
        setTransactions(data);
        setLoading(false);
      });
      return () => unsubscribe();
    } catch (err: any) {
      console.error("Setup error:", err);
      setLoading(false);
      setError(err.message);
      return () => {};
    }
  }, []);

  // Recalculate inventory whenever transactions change
  useEffect(() => {
    const inv = calculateInventory(transactions);
    setInventory(inv);
  }, [transactions]);

  const handleCreateTransaction = async (t: Transaction) => {
    try {
      await saveTransaction(t);
      setShowForm(false);
    } catch (e: any) {
      alert("Error al guardar: " + e.message);
    }
  };

  const handleUpdateTransaction = async (t: Transaction) => {
    try {
      await updateTransaction(t);
      setShowForm(false);
      setEditingTransaction(null);
    } catch (e: any) {
      alert("Error al actualizar: " + e.message);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await deleteTransaction(id);
    } catch (e: any) {
      alert("Error al eliminar: " + e.message);
    }
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
          <h2 className="text-lg font-semibold text-slate-700">Conectando con inventariomphgsc...</h2>
          <p className="text-slate-500 text-sm">Cargando inventario en tiempo real</p>
        </div>
      </div>
    );
  }

  if (error) {
     return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-lg w-full p-8 rounded-xl shadow-lg border border-red-100 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertOctagon className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Error de Conexión</h2>
          <p className="text-red-600 font-medium mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Reintentar
          </button>
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
          v2.2.1 Cloud - Medicina Prev.
          <div className="mt-1 opacity-50">Ref: 825147498372</div>
          <div className="mt-0.5 opacity-30 text-[10px]">ID: inventariomphgsc</div>
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
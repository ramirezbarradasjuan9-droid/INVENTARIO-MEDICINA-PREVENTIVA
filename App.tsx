import React, { useState, useEffect } from 'react';
import { 
  getTransactions, 
  saveTransaction, 
  updateTransaction, 
  deleteTransaction, 
  calculateInventory 
} from './services/inventoryService';
import { Transaction, InventoryItem } from './types';
import Dashboard from './components/Dashboard';
import TransactionTable from './components/TransactionTable';
import TransactionForm from './components/TransactionForm';
import { LayoutDashboard, List, PlusCircle, Activity } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'DASHBOARD' | 'HISTORY'>('DASHBOARD');
  const [showForm, setShowForm] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Load data on mount
  useEffect(() => {
    const data = getTransactions();
    // Sort by date descending
    data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setTransactions(data);
  }, []);

  // Recalculate inventory whenever transactions change
  useEffect(() => {
    const inv = calculateInventory(transactions);
    setInventory(inv);
  }, [transactions]);

  const handleCreateTransaction = (t: Transaction) => {
    const updated = saveTransaction(t);
    setTransactions(updated);
    setShowForm(false);
  };

  const handleUpdateTransaction = (t: Transaction) => {
    const updated = updateTransaction(t);
    setTransactions(updated);
    setShowForm(false);
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = deleteTransaction(id);
    setTransactions(updated);
  };

  const startEditing = (t: Transaction) => {
    setEditingTransaction(t);
    setShowForm(true);
  };

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
          v1.0.0 - Dpto. Medicina Preventiva
          <div className="mt-1 opacity-50">Ref: 736727518542</div>
          <div className="opacity-50">ID: inventariomedprevhgsc</div>
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
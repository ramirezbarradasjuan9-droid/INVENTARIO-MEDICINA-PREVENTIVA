import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { Edit2, Search, Download, Trash2, Calendar } from 'lucide-react';
import { exportToCSV } from '../services/inventoryService';

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | TransactionType>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredData = useMemo(() => {
    return transactions.filter(t => {
      // 1. Filter by Search Term
      const matchesSearch = 
        t.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.originOrDestination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.subtype && t.subtype.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // 2. Filter by Type
      const matchesType = filterType === 'ALL' || t.type === filterType;

      // 3. Filter by Date Range
      let matchesDate = true;
      const txDate = new Date(t.date);

      if (startDate) {
        // Parse "YYYY-MM-DD" safely to local start of day
        const [y, m, d] = startDate.split('-').map(Number);
        const start = new Date(y, m - 1, d, 0, 0, 0, 0);
        if (txDate < start) matchesDate = false;
      }

      if (endDate) {
        // Parse "YYYY-MM-DD" safely to local end of day
        const [y, m, d] = endDate.split('-').map(Number);
        const end = new Date(y, m - 1, d, 23, 59, 59, 999);
        if (txDate > end) matchesDate = false;
      }

      return matchesSearch && matchesType && matchesDate;
    });
  }, [transactions, searchTerm, filterType, startDate, endDate]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Table Header / Filters */}
      <div className="p-4 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 w-full xl:w-auto">
          {/* Search */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          
          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="w-full md:w-auto px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="ALL">Todos los Movimientos</option>
            <option value={TransactionType.INGRESO}>Solo Ingresos</option>
            <option value={TransactionType.SALIDA}>Solo Salidas</option>
          </select>

          {/* Date Filters */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-auto group">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full md:w-auto px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                title="Fecha Inicial"
              />
            </div>
            <span className="text-slate-400 font-medium">-</span>
            <div className="relative w-full md:w-auto group">
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full md:w-auto px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                title="Fecha Final"
              />
            </div>
            {(startDate || endDate) && (
               <button 
                 onClick={() => { setStartDate(''); setEndDate(''); }}
                 className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                 title="Limpiar fechas"
               >
                 <Trash2 size={16} />
               </button>
            )}
          </div>
        </div>

        <button
          onClick={() => exportToCSV(filteredData)}
          className="w-full md:w-auto flex items-center justify-center px-4 py-2 text-sm text-green-700 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors shadow-sm"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar Excel
        </button>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-3 whitespace-nowrap">Fecha</th>
              <th className="px-6 py-3">Tipo</th>
              <th className="px-6 py-3">Material</th>
              <th className="px-6 py-3">Lote</th>
              <th className="px-6 py-3">Origen / Destino</th>
              <th className="px-6 py-3 text-center">Cant.</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400 flex flex-col items-center justify-center w-full">
                  <Calendar className="w-12 h-12 mb-2 opacity-20" />
                  <p>No se encontraron registros con los filtros actuales.</p>
                </td>
              </tr>
            ) : (
              filteredData.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 whitespace-nowrap text-slate-600">
                    {new Date(t.date).toLocaleDateString()} <span className="text-xs text-slate-400 block sm:inline">{new Date(t.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                      t.type === TransactionType.INGRESO 
                        ? 'bg-green-50 text-green-700 border-green-100' 
                        : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {t.type === TransactionType.INGRESO ? 'ENTRADA' : 'SALIDA'}
                    </span>
                  </td>
                  <td className="px-6 py-3 font-medium text-slate-800">
                    {t.materialName}
                    {t.subtype && <span className="block text-xs text-slate-500 font-normal mt-0.5">{t.subtype}</span>}
                  </td>
                  <td className="px-6 py-3 font-mono text-xs text-slate-600 bg-slate-50 px-2 rounded w-fit">{t.batchNumber}</td>
                  <td className="px-6 py-3 text-slate-600 max-w-xs truncate" title={t.originOrDestination}>
                    {t.originOrDestination}
                  </td>
                  <td className="px-6 py-3 text-center font-bold text-slate-700">{t.quantity}</td>
                  <td className="px-6 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-1">
                      <button 
                        onClick={() => onEdit(t)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => {
                          if(window.confirm('¿Seguro que desea eliminar este registro?')) {
                            onDelete(t.id);
                          }
                        }}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="bg-slate-50 px-6 py-3 text-xs text-slate-500 border-t border-slate-200 flex justify-between items-center">
        <span>Mostrando {filteredData.length} registros</span>
        {(startDate || endDate) && <span className="text-blue-600 font-medium">Filtro de fecha activo</span>}
      </div>
    </div>
  );
};

export default TransactionTable;
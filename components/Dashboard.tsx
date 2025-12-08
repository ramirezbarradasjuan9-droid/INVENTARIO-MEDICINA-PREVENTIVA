import React from 'react';
import { InventoryItem } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Package, AlertTriangle, Activity, CalendarClock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface DashboardProps {
  inventory: InventoryItem[];
}

const Dashboard: React.FC<DashboardProps> = ({ inventory }) => {
  const totalStock = inventory.reduce((acc, item) => acc + item.totalQuantity, 0);
  const lowStockItems = inventory.filter(item => item.totalQuantity < 10); // Threshold example

  // Prepare data for chart
  const chartData = inventory.map(item => ({
    name: item.materialName.replace('Pruebas Rápidas', 'P.R.'), // Abbreviate for chart
    cantidad: item.totalQuantity
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPI Cards */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Unidades</p>
            <h3 className="text-2xl font-bold text-slate-800">{totalStock}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="p-3 bg-teal-100 text-teal-600 rounded-full">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Materiales Activos</p>
            <h3 className="text-2xl font-bold text-slate-800">{inventory.length}</h3>
          </div>
        </div>

        <div className={`p-6 rounded-xl shadow-sm border flex items-center space-x-4 transition-all duration-500 ${
          lowStockItems.length > 0 
            ? 'bg-red-50 border-red-500 ring-4 ring-red-500/20' 
            : 'bg-white border-slate-200'
        }`}>
          <div className={`p-3 rounded-full ${
            lowStockItems.length > 0 
              ? 'bg-red-200 text-red-700 animate-bounce' 
              : 'bg-green-100 text-green-600'
          }`}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className={`text-sm font-medium ${lowStockItems.length > 0 ? 'text-red-700' : 'text-slate-500'}`}>
              Alerta Stock Bajo
            </p>
            <h3 className={`text-2xl font-bold ${lowStockItems.length > 0 ? 'text-red-900' : 'text-slate-800'}`}>
              {lowStockItems.length}
            </h3>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Nivel de Stock Actual</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                interval={0} 
                height={80}
                tick={{fontSize: 12}}
              />
              <YAxis />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="top" height={36}/>
              <Bar dataKey="cantidad" name="Cantidad Disponible" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cantidad < 10 ? '#ef4444' : '#0f766e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Consolidated Inventory Report */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Package className="w-5 h-5 text-slate-500" />
            Reporte Detallado de Existencias
          </h3>
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full border border-slate-200">
            {inventory.length} Insumos Registrados
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 w-1/2">Material / Insumo</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3">Último Movimiento</th>
                <th className="px-6 py-3 text-right">Stock Actual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inventory.length === 0 ? (
                 <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                      No hay inventario registrado aún.
                    </td>
                 </tr>
              ) : (
                inventory.map((item, index) => {
                  const isLowStock = item.totalQuantity < 10;
                  return (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {item.materialName}
                      </td>
                      <td className="px-6 py-4">
                        {isLowStock ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Stock Crítico
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Disponible
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500 flex items-center gap-2">
                        <CalendarClock className="w-4 h-4 text-slate-400" />
                        {new Date(item.lastUpdated).toLocaleDateString()}
                        <span className="text-xs text-slate-400">
                          {new Date(item.lastUpdated).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`text-lg font-bold ${isLowStock ? 'text-red-600' : 'text-slate-700'}`}>
                          {item.totalQuantity}
                        </span>
                        <span className="text-xs text-slate-400 ml-1">unid.</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
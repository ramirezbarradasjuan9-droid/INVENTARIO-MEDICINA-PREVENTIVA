import React from 'react';
import { InventoryItem } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Package, AlertTriangle, Activity } from 'lucide-react';

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

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className={`p-3 rounded-full ${lowStockItems.length > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Alerta Stock Bajo</p>
            <h3 className="text-2xl font-bold text-slate-800">{lowStockItems.length}</h3>
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
    </div>
  );
};

export default Dashboard;
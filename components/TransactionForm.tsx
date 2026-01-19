import React, { useState, useEffect } from 'react';
import { MATERIALS, RAPID_TEST_TYPES } from '../constants';
import { TransactionType, Transaction } from '../types';
import { Save, X, AlertTriangle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface TransactionFormProps {
  onSubmit: (transaction: Transaction) => void;
  onCancel: () => void;
  initialData?: Transaction | null;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [type, setType] = useState<TransactionType>(TransactionType.INGRESO);
  const [materialId, setMaterialId] = useState<string>('');
  const [subtype, setSubtype] = useState<string>('');
  const [batchNumber, setBatchNumber] = useState<string>('');
  const [originOrDestination, setOriginOrDestination] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [observations, setObservations] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      const mat = MATERIALS.find(m => m.name === initialData.materialName);
      setMaterialId(mat ? mat.id : '');
      setSubtype(initialData.subtype || '');
      setBatchNumber(initialData.batchNumber);
      setOriginOrDestination(initialData.originOrDestination);
      setQuantity(initialData.quantity.toString());
      setObservations(initialData.observations || '');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const material = MATERIALS.find(m => m.id === materialId);
    if (!material) {
      setError('Seleccione un material.');
      return;
    }

    if (material.hasSubtypes && !subtype) {
      setError('Seleccione el tipo de prueba rápida.');
      return;
    }

    if (!batchNumber.trim()) {
      setError('El lote es obligatorio.');
      return;
    }

    // Validación: Lote alfanumérico (letras, números y guiones)
    const batchRegex = /^[a-zA-Z0-9-]+$/;
    if (!batchRegex.test(batchNumber.trim())) {
      setError('El lote debe ser alfanumérico (solo letras, números y guiones, sin espacios).');
      return;
    }

    if (!originOrDestination.trim()) {
      setError(type === TransactionType.INGRESO ? 'La procedencia es obligatoria.' : 'El destino es obligatorio.');
      return;
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setError('La cantidad debe ser un número positivo.');
      return;
    }

    const transaction: Transaction = {
      id: initialData ? initialData.id : crypto.randomUUID(),
      date: initialData ? initialData.date : new Date().toISOString(),
      type,
      materialName: material.name,
      subtype: material.hasSubtypes ? subtype : undefined,
      batchNumber,
      originOrDestination,
      quantity: qty,
      observations
    };

    onSubmit(transaction);
  };

  const selectedMaterial = MATERIALS.find(m => m.id === materialId);

  // Clase común para inputs más claros y limpios
  const inputClass = "w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-400";

  return (
    <div className="bg-white p-8 rounded-xl shadow-xl border border-slate-100">
      <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
        <h2 className="text-2xl font-bold text-slate-800">
          {initialData ? 'Editar Registro' : 'Nuevo Movimiento'}
        </h2>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Transaction Type Switch */}
        <div className="flex p-1.5 bg-slate-50 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setType(TransactionType.INGRESO)}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              type === TransactionType.INGRESO
                ? 'bg-white text-green-700 shadow-sm border border-slate-100'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            INGRESO (Entrada)
          </button>
          <button
            type="button"
            onClick={() => setType(TransactionType.SALIDA)}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              type === TransactionType.SALIDA
                ? 'bg-white text-red-700 shadow-sm border border-slate-100'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            SALIDA (Entrega)
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Material Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Material</label>
            <select
              value={materialId}
              onChange={(e) => {
                setMaterialId(e.target.value);
                setSubtype('');
              }}
              className={inputClass}
            >
              <option value="">Seleccionar Material...</option>
              {MATERIALS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subtype Selection (Conditional) */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {selectedMaterial?.hasSubtypes ? 'Tipo de Reactivo' : 'Subtipo'}
            </label>
            <select
              value={subtype}
              onChange={(e) => setSubtype(e.target.value)}
              disabled={!selectedMaterial?.hasSubtypes}
              className={`${inputClass} ${!selectedMaterial?.hasSubtypes ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : ''}`}
            >
              <option value="">{selectedMaterial?.hasSubtypes ? 'Seleccionar Tipo...' : 'N/A'}</option>
              {selectedMaterial?.hasSubtypes &&
                RAPID_TEST_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Batch Number */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Lote (Batch)</label>
            <input
              type="text"
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
              placeholder="Ej. B2309-X"
              className={`${inputClass} uppercase`}
            />
            <p className="text-xs text-slate-400 mt-1 ml-1">Solo letras, números y guiones</p>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Cantidad</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className={inputClass}
              placeholder="0"
            />
          </div>
        </div>

        {/* Origin / Destination */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            {type === TransactionType.INGRESO ? 'Procedencia (Proveedor/Origen)' : 'Destino (Área/Persona)'}
          </label>
          <input
            type="text"
            value={originOrDestination}
            onChange={(e) => setOriginOrDestination(e.target.value)}
            placeholder={type === TransactionType.INGRESO ? 'Ej. Almacén Central' : 'Ej. Consultorio 3'}
            className={`${inputClass} uppercase`}
          />
        </div>

        {/* Observations */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Observaciones</label>
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            rows={2}
            className={`${inputClass} resize-none`}
            placeholder="Detalles adicionales..."
          ></textarea>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg flex items-center animate-pulse">
            <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="flex justify-end pt-6 border-t border-slate-100 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-lg mr-3 transition-colors font-medium"
          >
            Volver
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-lg mr-3 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg flex items-center transition-all font-medium"
          >
            <Save className="w-5 h-5 mr-2" />
            {initialData ? 'Actualizar Registro' : 'Guardar Movimiento'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
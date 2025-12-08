import React, { useState, useEffect, useMemo } from 'react';
import { MATERIALS } from '../constants';
import { TransactionType, Transaction } from '../types';
import { Save, X, AlertTriangle, ArrowLeft } from 'lucide-react';

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

  // Detectar si hay cambios sin guardar comparando con el estado inicial
  const isDirty = useMemo(() => {
    if (initialData) {
      const initialMat = MATERIALS.find(m => m.name === initialData.materialName);
      return (
        type !== initialData.type ||
        materialId !== (initialMat ? initialMat.id : '') ||
        subtype !== (initialData.subtype || '') ||
        batchNumber !== initialData.batchNumber ||
        originOrDestination !== initialData.originOrDestination ||
        quantity !== initialData.quantity.toString() ||
        observations !== (initialData.observations || '')
      );
    }
    // Para nuevos registros, dirty si algún campo tiene valor
    return (
      type !== TransactionType.INGRESO ||
      materialId !== '' ||
      subtype !== '' ||
      batchNumber !== '' ||
      originOrDestination !== '' ||
      quantity !== '' ||
      observations !== ''
    );
  }, [type, materialId, subtype, batchNumber, originOrDestination, quantity, observations, initialData]);

  const handleBack = () => {
    if (isDirty) {
      if (window.confirm('Tiene cambios sin guardar. ¿Desea descartarlos y volver?')) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const material = MATERIALS.find(m => m.id === materialId);
    if (!material) {
      setError('Seleccione un material.');
      return;
    }

    if (material.hasSubtypes && !subtype) {
      setError('Seleccione la especificación o subtipo del material.');
      return;
    }

    if (!batchNumber.trim()) {
      setError('El lote es obligatorio.');
      return;
    }

    // Validación: Lote alfanumérico
    const batchRegex = /^[a-zA-Z0-9-]+$/;
    if (!batchRegex.test(batchNumber.trim())) {
      setError('El lote debe ser alfanumérico (solo letras, números y guiones, sin espacios).');
      return;
    }

    // Validación de Cantidad
    const qty = parseInt(quantity, 10);
    if (!quantity || isNaN(qty) || qty <= 0) {
      setError('Error: La cantidad debe ser un número mayor a 0.');
      return;
    }

    // Validación de Procedencia / Destino
    if (!originOrDestination.trim()) {
      const msg = type === TransactionType.INGRESO 
        ? 'Error: Debe especificar la Procedencia (Origen) del material.' 
        : 'Error: Debe especificar el Destino (Área/Paciente) del material.';
      setError(msg);
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

  // Estilos base para inputs
  const baseInputClass = "w-full px-3 py-2 border rounded-lg outline-none transition-all bg-white text-slate-800 placeholder-slate-400";
  const defaultBorderClass = "border-slate-300 focus:ring-2 focus:ring-blue-500";
  const errorBorderClass = "border-red-300 focus:ring-2 focus:ring-red-500 bg-red-50";

  // Función auxiliar para determinar si un campo tiene error visual
  const hasError = (keywords: string[]) => {
    if (!error) return false;
    return keywords.some(k => error.toLowerCase().includes(k));
  };

  const getInputClass = (keywords: string[] = []) => 
    `${baseInputClass} ${keywords.length > 0 && hasError(keywords) ? errorBorderClass : defaultBorderClass}`;

  const labelClass = "block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide";

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200">
      <div className="bg-slate-900 px-6 py-4 flex justify-between items-center">
        <h3 className="text-white font-bold text-lg flex items-center">
          {initialData ? 'Editar Registro' : 'Nuevo Movimiento'}
        </h3>
        <button onClick={handleBack} className="text-slate-400 hover:text-white transition-colors">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center text-sm border border-red-200 animate-pulse">
            <AlertTriangle size={18} className="mr-2 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Tipo de Transacción */}
        <div>
          <label className={labelClass}>Tipo de Movimiento</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setType(TransactionType.INGRESO)}
              className={`py-3 rounded-lg border-2 font-medium transition-all ${
                type === TransactionType.INGRESO
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
              }`}
            >
              ENTRADA (Ingreso)
            </button>
            <button
              type="button"
              onClick={() => setType(TransactionType.SALIDA)}
              className={`py-3 rounded-lg border-2 font-medium transition-all ${
                type === TransactionType.SALIDA
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
              }`}
            >
              SALIDA (Egreso)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Material */}
          <div>
            <label className={labelClass}>Material</label>
            <select
              value={materialId}
              onChange={(e) => {
                setMaterialId(e.target.value);
                setSubtype('');
              }}
              className={getInputClass(['material'])}
            >
              <option value="">-- Seleccionar Material --</option>
              {MATERIALS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subtipo (Dinamico basado en configuración del material) */}
          {selectedMaterial?.hasSubtypes && selectedMaterial.subtypes && (
            <div>
              <label className={labelClass}>Tipo / Especificación</label>
              <select
                value={subtype}
                onChange={(e) => setSubtype(e.target.value)}
                className={getInputClass(['tipo', 'prueba', 'especificación'])}
              >
                <option value="">-- Seleccionar --</option>
                {selectedMaterial.subtypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lote */}
          <div>
            <label className={labelClass}>Número de Lote</label>
            <input
              type="text"
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value.toUpperCase())}
              placeholder="Ej. A123-B"
              className={getInputClass(['lote', 'alfanumérico'])}
            />
          </div>

          {/* Cantidad */}
          <div>
            <label className={labelClass}>Cantidad</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              className={getInputClass(['cantidad', 'número'])}
            />
          </div>
        </div>

        {/* Procedencia / Destino - Renderizado Condicional */}
        {type === TransactionType.INGRESO ? (
          <div>
            <label className={labelClass}>Procedencia (Origen)</label>
            <input
              type="text"
              value={originOrDestination}
              onChange={(e) => setOriginOrDestination(e.target.value)}
              placeholder="Ej. Almacén General"
              className={getInputClass(['procedencia', 'origen'])}
            />
          </div>
        ) : (
          <div>
            <label className={labelClass}>Destino (Área/Paciente)</label>
            <input
              type="text"
              value={originOrDestination}
              onChange={(e) => setOriginOrDestination(e.target.value)}
              placeholder="Ej. Consulta Externa 1"
              className={getInputClass(['destino'])}
            />
          </div>
        )}

        {/* Observaciones */}
        <div>
          <label className={labelClass}>Observaciones</label>
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Detalles adicionales..."
            className={getInputClass()}
            rows={3}
          />
        </div>

        {/* Footer de Botones */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium flex items-center"
            title="Volver al listado"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </button>
          
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2 text-slate-500 hover:text-slate-700 font-medium text-sm"
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md flex items-center font-medium"
          >
            <Save className="w-4 h-4 mr-2" />
            Guardar Registro
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
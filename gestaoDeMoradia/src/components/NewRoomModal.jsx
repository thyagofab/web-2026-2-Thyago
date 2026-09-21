import { useState } from 'react';
import { X, Building, Check } from 'lucide-react';

export default function NewRoomModal({ isOpen, onClose, campi, onConfirmCreateRoom }) {
  const camposList = campi.filter((c) => c.id !== 'todos');

  const [campusId, setCampusId] = useState(camposList[0]?.id || '');
  const [numero, setNumero] = useState('');
  const [ala, setAla] = useState('Masculina');
  const [bloco, setBloco] = useState('');
  const [capacidade, setCapacidade] = useState(2);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleClose = () => {
    setNumero('');
    setBloco('');
    setCapacidade(2);
    setAla('Masculina');
    setErrors({});
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!campusId) newErrors.campusId = 'Selecione o campus.';
    const numeroNormalizado = numero.trim();
    const blocoNormalizado = bloco.trim();
    if (!numeroNormalizado) {
      newErrors.numero = 'Informe o número/identificação do quarto.';
    } else if (!/^[A-Za-z0-9][A-Za-z0-9 -]{0,19}$/.test(numeroNormalizado)) {
      newErrors.numero = 'Use até 20 caracteres, com letras, números, espaços ou hífen.';
    }
    if (!blocoNormalizado) {
      newErrors.bloco = 'Informe o bloco ou nome do prédio.';
    } else if (blocoNormalizado.length > 60) {
      newErrors.bloco = 'O bloco/prédio deve ter no máximo 60 caracteres.';
    }
    const capacidadeNum = Number(capacidade);
    if (!Number.isInteger(capacidadeNum) || capacidadeNum < 1 || capacidadeNum > 8) {
      newErrors.capacidade = 'A capacidade deve ser um número entre 1 e 8 leitos.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    const letras = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const camas = Array.from({ length: capacidadeNum }, (_, i) => ({
      id: `${numero.trim()}-${letras[i]}-${Date.now().toString().slice(-4)}`,
      numero: `Cama ${letras[i]}`,
      status: 'Livre',
      moradorId: null,
    }));

    const novoQuarto = {
      id: `${numeroNormalizado}-${Date.now().toString().slice(-4)}`,
      numero: `Quarto ${numeroNormalizado}`,
      campusId,
      ala,
      bloco: blocoNormalizado,
      capacidade: capacidadeNum,
      camas,
    };

    onConfirmCreateRoom(novoQuarto);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">

        {/* Header */}
        <div className="bg-ufersa-green-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-ufersa-green-700 flex items-center justify-center text-amber-300">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Cadastro de Novo Quarto</h3>
              <p className="text-xs text-ufersa-green-200">Infraestrutura de Moradias Estudantis</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-1 rounded-lg text-ufersa-green-200 hover:text-white hover:bg-ufersa-green-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Campus:</label>
            <select
              value={campusId}
              onChange={(e) => setCampusId(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                errors.campusId ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300 focus:ring-ufersa-green-500'
              }`}
            >
              {camposList.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
            {errors.campusId && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.campusId}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Número do Quarto:</label>
              <input
                type="text"
                maxLength={20}
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                placeholder="Ex: 103"
                aria-invalid={Boolean(errors.numero)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                  errors.numero ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300 focus:ring-ufersa-green-500'
                }`}
              />
              {errors.numero && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.numero}</p>}
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ala:</label>
              <select
                value={ala}
                onChange={(e) => setAla(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ufersa-green-500 focus:outline-none"
              >
                <option>Masculina</option>
                <option>Feminina</option>
                <option>Mista</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bloco / Prédio:</label>
              <input
                type="text"
                maxLength={60}
                value={bloco}
                onChange={(e) => setBloco(e.target.value)}
                placeholder="Ex: Bloco A"
                aria-invalid={Boolean(errors.bloco)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                  errors.bloco ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300 focus:ring-ufersa-green-500'
                }`}
              />
              {errors.bloco && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.bloco}</p>}
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Capacidade (leitos):</label>
              <input
                type="number"
                min={1}
                max={8}
                value={capacidade}
                onChange={(e) => setCapacidade(e.target.value)}
                aria-invalid={Boolean(errors.capacidade)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                  errors.capacidade ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300 focus:ring-ufersa-green-500'
                }`}
              />
              {errors.capacidade && <p className="mt-1 text-xs font-semibold text-rose-600">{errors.capacidade}</p>}
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Todos os leitos do novo quarto serão criados automaticamente com status <strong>&quot;Livre&quot;</strong>, prontos para alocação.
          </p>

          {/* Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-ufersa-green-700 hover:bg-ufersa-green-800 text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition"
            >
              <Check className="w-4 h-4" />
              Cadastrar Quarto
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

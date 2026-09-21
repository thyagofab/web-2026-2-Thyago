import { useState } from 'react';
import { X, Wrench, Send, Clock } from 'lucide-react';

export default function NewDemandModal({
  isOpen,
  onClose,
  currentUser,
  currentRole,
  onSaveDemand,
}) {
  const [tipo, setTipo] = useState('Manutenção Predial');
  const [prioridade, setPrioridade] = useState('Média');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!titulo.trim()) {
      newErrors.titulo = 'Informe um título resumido do problema.';
    } else if (titulo.trim().length < 5) {
      newErrors.titulo = 'O título deve ter pelo menos 5 caracteres.';
    }
    if (!descricao.trim()) {
      newErrors.descricao = 'Descreva o problema com mais detalhes.';
    } else if (descricao.trim().length < 15) {
      newErrors.descricao = 'Descreva com mais detalhes (mínimo 15 caracteres) para agilizar o atendimento.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    const novaDemanda = {
      id: `DEM-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
      moradorId: currentUser?.id || 'morador-1',
      moradorNome: currentUser?.nome || 'Thyago Fernandes da Silva',
      matricula: currentUser?.matricula || '2022014589',
      campusId: currentUser?.campusId || 'mossoro',
      campusNome: currentUser?.campusNome || 'Campus Mossoró',
      quarto: currentUser ? `${currentUser.quarto} (${currentUser.ala})` : 'Quarto 101 - Ala Masc.',
      tipo,
      titulo,
      descricao,
      prioridade,
      status: 'Pendente',
      dataAbertura: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
      dataAtualizacao: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
      origem: currentRole === 'morador' ? 'Solicitação do Morador' : 'Vistoria In Loco (Gestor COAE)',
      respostas: [],
    };

    onSaveDemand(novaDemanda);
    setTitulo('');
    setDescricao('');
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-ufersa-green-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-ufersa-green-700 flex items-center justify-center text-amber-300">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {currentRole === 'morador' ? 'Nova Solicitação de Atendimento' : 'Cadastrar Demanda de Vistoria'}
              </h3>
              <p className="text-xs text-ufersa-green-200">
                Canal de Atendimento Contínuo às Residências da UFERSA
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-ufersa-green-200 hover:text-white hover:bg-ufersa-green-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Categoria da Demanda:</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ufersa-green-500 focus:outline-none"
              >
                <option>Manutenção Predial</option>
                <option>Elétrica / Iluminação</option>
                <option>Hidráulica / Encanamento</option>
                <option>Convivência / Normas</option>
                <option>Infraestrutura / Internet</option>
                <option>Apoio Social / Psicológico</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Prioridade Sugerida:</label>
              <select
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ufersa-green-500 focus:outline-none"
              >
                <option>Baixa</option>
                <option>Média</option>
                <option>Alta</option>
                <option>Urgente (Risco Estrutural)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Título Resumido do Problema:</label>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Chuveiro elétrico parou de aquecer no Bloco B"
              aria-invalid={Boolean(errors.titulo)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none font-medium ${
                errors.titulo ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300 focus:ring-ufersa-green-500'
              }`}
            />
            {errors.titulo && (
              <p className="mt-1 text-xs font-semibold text-rose-600">{errors.titulo}</p>
            )}
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Descrição Detalhada:</label>
            <textarea
              rows={4}
              required
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva detalhadamente o ocorrido, localização exata (cômodo, quarto ou área comum) e quando começou..."
              aria-invalid={Boolean(errors.descricao)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                errors.descricao ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300 focus:ring-ufersa-green-500'
              }`}
            />
            <div className="flex items-center justify-between mt-1">
              {errors.descricao ? (
                <p className="text-xs font-semibold text-rose-600">{errors.descricao}</p>
              ) : (
                <span />
              )}
              <span className="text-xs text-slate-400">{descricao.trim().length} caracteres</span>
            </div>
          </div>

          <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 flex items-start gap-2 text-sky-900">
            <Clock className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">
              <strong>Canal Direto COAE/PROAE:</strong> As demandas registradas são encaminhadas em tempo real para a equipe técnica do seu campus. O acompanhamento de respostas e status poderá ser feito nesta mesma tela.
            </p>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-ufersa-green-700 hover:bg-ufersa-green-800 text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition"
            >
              <Send className="w-4 h-4" />
              Registrar Demanda
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

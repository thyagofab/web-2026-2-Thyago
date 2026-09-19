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

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!titulo || !descricao) {
      alert('Por favor preencha todos os campos obrigatórios.');
      return;
    }

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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-emerald-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-amber-300">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {currentRole === 'morador' ? 'Nova Solicitação de Atendimento' : 'Cadastrar Demanda de Vistoria'}
              </h3>
              <p className="text-xs text-emerald-200">
                Canal de Atendimento Contínuo às Residências da UFERSA
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Categoria da Demanda:</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Descrição Detalhada:</label>
            <textarea
              rows={4}
              required
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva detalhadamente o ocorrido, localização exata (cômodo, quarto ou área comum) e quando começou..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 flex items-start gap-2 text-sky-900">
            <Clock className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
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
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition"
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

import { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Send,
} from 'lucide-react';

export default function DemandsView({
  demands,
  onOpenNewDemand,
  onUpdateDemandStatus,
  currentRole,
}) {
  const [filterStatus, setFilterStatus] = useState('todos');
  const [selectedDemandId, setSelectedDemandId] = useState(demands[0]?.id || null);
  const [respostaTexto, setRespostaTexto] = useState('');

  const selectedDemand = demands.find((d) => d.id === selectedDemandId) || demands[0];

  const filteredDemands = demands.filter((d) => {
    if (filterStatus === 'todos') return true;
    return d.status === filterStatus;
  });

  const handleAddResponse = (e) => {
    e.preventDefault();
    if (!respostaTexto.trim()) return;

    const novaResposta = {
      autor: currentRole === 'morador' ? 'Morador' : 'Gestão COAE / PROAE',
      data: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
      mensagem: respostaTexto,
    };

    const updatedDemand = {
      ...selectedDemand,
      respostas: [...(selectedDemand.respostas || []), novaResposta],
      dataAtualizacao: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
    };

    onUpdateDemandStatus(selectedDemand.id, selectedDemand.status, updatedDemand);
    setRespostaTexto('');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pendente':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Em Análise':
        return 'bg-sky-100 text-sky-900 border-sky-300';
      case 'Em Atendimento':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'Resolvido':
        return 'bg-ufersa-green-100 text-ufersa-green-900 border-ufersa-green-300';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Central de Demandas e Atendimentos
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
              Atendimento Contínuo 24h
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Registro de chamados de manutenção predial, convivência coletiva e vistorias in loco com histórico integrado.
          </p>
        </div>

        <button
          onClick={onOpenNewDemand}
          className="px-4 py-2.5 bg-ufersa-green-700 hover:bg-ufersa-green-800 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          {currentRole === 'morador' ? 'Nova Solicitação de Atendimento' : 'Registrar Demanda In Loco'}
        </button>
      </div>

      {/* Main Grid: Lista de Demandas (Esquerda) + Detalhe e Timeline (Direita) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Coluna da Esquerda: Lista de Demandas */}
        <div className="lg:col-span-5 space-y-3">
          
          {/* Filtro de Status */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">Filtrar chamados:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs focus:outline-none"
            >
              <option value="todos">Todos ({demands.length})</option>
              <option value="Pendente">Pendentes</option>
              <option value="Em Análise">Em Análise</option>
              <option value="Em Atendimento">Em Atendimento</option>
              <option value="Resolvido">Resolvidos</option>
            </select>
          </div>

          <div className="space-y-2.5 max-h-[680px] overflow-y-auto pr-1">
            {filteredDemands.map((demand) => {
              const isSelected = selectedDemand?.id === demand.id;

              return (
                <div
                  key={demand.id}
                  onClick={() => setSelectedDemandId(demand.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition text-xs flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-ufersa-green-50/70 border-ufersa-green-600 shadow-xs ring-1 ring-ufersa-green-600'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-500">
                      {demand.id}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                        demand.status
                      )}`}
                    >
                      {demand.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-xs leading-snug line-clamp-1">
                    {demand.titulo}
                  </h3>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                    <span className="truncate max-w-[170px]">{demand.moradorNome}</span>
                    <span className="shrink-0">{demand.quarto}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Prioridade: <strong className="text-slate-700">{demand.prioridade}</strong></span>
                    <span>{demand.dataAbertura}</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Coluna da Direita: Detalhes, Ações e Despachos */}
        <div className="lg:col-span-7">
          {selectedDemand ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between min-h-[580px]">
              
              <div className="space-y-4">
                
                {/* Header da Demanda Selecionada */}
                <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-ufersa-green-800 bg-ufersa-green-50 px-2 py-0.5 rounded border border-ufersa-green-200">
                        {selectedDemand.id}
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                          selectedDemand.status
                        )}`}
                      >
                        {selectedDemand.status}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-slate-900 leading-snug">
                      {selectedDemand.titulo}
                    </h2>
                  </div>

                  {/* Alteração rápida de status pelo Gestor */}
                  {currentRole !== 'morador' && (
                    <div className="flex items-center gap-1 shrink-0 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                      <span className="text-xs font-bold text-slate-500 px-1">Mudar Status:</span>
                      {['Pendente', 'Em Análise', 'Em Atendimento', 'Resolvido'].map((st) => (
                        <button
                          key={st}
                          onClick={() => onUpdateDemandStatus(selectedDemand.id, st)}
                          className={`px-2 py-1 rounded text-xs font-bold transition ${
                            selectedDemand.status === st
                              ? 'bg-ufersa-green-800 text-white shadow-2xs'
                              : 'text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Metadados */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 block text-xs">Solicitante:</span>
                    <strong className="text-slate-900">{selectedDemand.moradorNome}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs">Localização:</span>
                    <strong className="text-slate-900">{selectedDemand.quarto}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs">Categoria:</span>
                    <span className="text-ufersa-green-900 font-semibold">{selectedDemand.tipo}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs">Origem:</span>
                    <span className="text-slate-700">{selectedDemand.origem}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs">Data de Abertura:</span>
                    <span className="text-slate-700">{selectedDemand.dataAbertura}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs">Prioridade:</span>
                    <span className="font-bold text-amber-700">{selectedDemand.prioridade}</span>
                  </div>
                </div>

                {/* Descrição Completa */}
                <div>
                  <h3 className="text-xs font-bold text-slate-700 mb-1">Descrição da Demanda:</h3>
                  <div className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                    {selectedDemand.descricao}
                  </div>
                </div>

                {/* Timeline de Respostas e Despachos */}
                <div>
                  <h3 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-ufersa-green-700" />
                    Histórico de Acompanhamento e Despachos ({selectedDemand.respostas?.length || 0})
                  </h3>

                  <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                    {selectedDemand.respostas && selectedDemand.respostas.length > 0 ? (
                      selectedDemand.respostas.map((resp, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <strong className="text-ufersa-green-900">{resp.autor}</strong>
                            <span className="text-slate-400">{resp.data}</span>
                          </div>
                          <p className="text-slate-700 leading-relaxed">{resp.mensagem}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic py-2">
                        Nenhum despacho ou resposta registrado ainda para este atendimento.
                      </p>
                    )}
                  </div>
                </div>

              </div>

              {/* Formulário de Resposta / Despacho */}
              <form onSubmit={handleAddResponse} className="mt-4 pt-4 border-t border-slate-200 flex gap-2">
                <input
                  type="text"
                  value={respostaTexto}
                  onChange={(e) => setRespostaTexto(e.target.value)}
                  placeholder={
                    currentRole === 'morador'
                      ? 'Escreva um esclarecimento ou comentário sobre a solicitação...'
                      : 'Registrar despacho oficial da COAE / PROAE...'
                  }
                  className="flex-1 px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-ufersa-green-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-ufersa-green-800 hover:bg-ufersa-green-900 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  Enviar Despacho
                </button>
              </form>

            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
              Selecione um chamado para visualizar detalhes.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

import { useState } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';

export default function RecadastramentoView({
  campaigns,
  residents,
  onApplyInadimplencia,
  onOpenDesligamento,
  currentRole,
}) {
  const activeCampaign = campaigns[0];
  const [processadoSucesso, setProcessadoSucesso] = useState(false);

  // Filtros de status no recadastramento
  const [filterStatus, setFilterStatus] = useState('todos');

  const filteredResidents = residents.filter((r) => {
    if (filterStatus === 'todos') return true;
    return r.recadastramentoStatus === filterStatus;
  });

  const handleProcessar = () => {
    onApplyInadimplencia();
    setProcessadoSucesso(true);
    setTimeout(() => setProcessadoSucesso(false), 3000);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Aprovado':
        return 'bg-ufersa-green-100 text-ufersa-green-800 border-ufersa-green-300';
      case 'Em Análise':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'Pendente':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Desligamento Pendente':
        return 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse';
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
              Módulo de Recadastramento Semestral
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
              Campanha Ativa: {activeCampaign.periodo}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestão dos ciclos semestrais de renovação de moradia, confirmação de permanência e conformidade normativa.
          </p>
        </div>

        {currentRole !== 'morador' && (
          <button
            onClick={handleProcessar}
            className="px-3.5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
            title="Atualizar discentes que não enviaram o recadastramento no prazo para Desligamento Pendente"
          >
            <ShieldAlert className="w-4 h-4" />
            Processar Inadimplência de Recadastramento
          </button>
        )}
      </div>

      {/* Alerta de Processamento */}
      {processadoSucesso && (
        <div className="p-4 bg-rose-600 text-white rounded-2xl text-xs font-bold shadow-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-white" />
            <span>Processamento concluído com sucesso! Discentes com documentação pendente foram alterados para &quot;Desligamento Pendente&quot;.</span>
          </div>
        </div>
      )}

      {/* Card da Campanha Vigente */}
      <div className="bg-gradient-to-br from-ufersa-blue-900 to-ufersa-blue-950 text-white rounded-2xl p-6 shadow-md border border-ufersa-blue-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-ufersa-blue-800/80 pb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-ufersa-green-400">
              Edital Unificado de Renovação
            </span>
            <h2 className="text-lg font-black tracking-tight mt-1">{activeCampaign.titulo}</h2>
            <p className="text-xs text-ufersa-blue-200 mt-1 max-w-2xl leading-relaxed">
              {activeCampaign.descricao}
            </p>
          </div>

          <div className="flex flex-col items-end shrink-0 text-xs">
            <span className="text-ufersa-blue-300">Prazo de Submissão:</span>
            <strong className="text-white font-mono text-sm">
              {activeCampaign.dataInicio} até {activeCampaign.dataFim}
            </strong>
            <span className="mt-1 px-2.5 py-0.5 rounded-full bg-ufersa-green-600/70 border border-ufersa-green-400/50 text-xs font-bold text-ufersa-green-100">
              Status: {activeCampaign.status}
            </span>
          </div>
        </div>

        {/* Estatísticas de Envio */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
          <div className="bg-white/10 rounded-xl p-3.5 border border-white/10">
            <span className="text-xs text-ufersa-blue-300">Total de Residentes Alvo:</span>
            <p className="text-2xl font-black mt-1">{residents.length}</p>
          </div>

          <div className="bg-white/10 rounded-xl p-3.5 border border-white/10">
            <span className="text-xs text-ufersa-blue-300">Formulários Submetidos:</span>
            <p className="text-2xl font-black text-ufersa-green-300 mt-1">
              {residents.filter((r) => r.recadastramentoStatus !== 'Pendente').length}
            </p>
          </div>

          <div className="bg-white/10 rounded-xl p-3.5 border border-white/10">
            <span className="text-xs text-ufersa-blue-300">Inadimplentes (Prazo Expirado):</span>
            <p className="text-2xl font-black text-rose-300 mt-1">
              {residents.filter((r) => r.recadastramentoStatus === 'Pendente' || r.recadastramentoStatus === 'Desligamento Pendente').length}
            </p>
          </div>
        </div>
      </div>

      {/* Regra de Negócio em Destaque */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs flex items-start gap-3 text-amber-950">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="text-sm font-bold text-amber-900">
            Obrigatoriedade do Recadastramento Semestral
          </strong>
          <p className="mt-1 text-amber-900/80 leading-relaxed">
            O discente residente que não submeter o formulário no módulo de recadastramento com a respectiva comprovação acadêmica (mínimo de 4 componentes curriculares) dentro do prazo limite terá seu status alterado compulsoriamente para <strong>&quot;Desligamento Pendente&quot;</strong>, iniciando a fase de notificação e liberação da vaga para a lista de espera de suplentes.
          </p>
        </div>
      </div>

      {/* Tabela de Acompanhamento das Submissões */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="font-bold text-slate-800">
            Acompanhamento de Residentes na Campanha {activeCampaign.periodo}
          </span>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Filtrar por Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs focus:outline-none"
            >
              <option value="todos">Todos ({residents.length})</option>
              <option value="Aprovado">Aprovados</option>
              <option value="Em Análise">Em Análise</option>
              <option value="Pendente">Pendentes de Envio</option>
              <option value="Desligamento Pendente">Desligamento Pendente</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Discente / Curso</th>
                <th className="px-3 py-3.5">Vaga Atual</th>
                <th className="px-3 py-3.5">Campus</th>
                <th className="px-3 py-3.5 text-center">Status no Recadastramento</th>
                <th className="px-3 py-3.5 text-center">Matrícula Mínima</th>
                <th className="px-4 py-3.5 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResidents.map((morador) => (
                <tr key={morador.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-4 py-3">
                    <strong className="text-slate-900 font-bold block">{morador.nome}</strong>
                    <span className="text-xs text-slate-500 font-mono">
                      {morador.matricula} • {morador.curso}
                    </span>
                  </td>

                  <td className="px-3 py-3">
                    <span className="font-semibold text-slate-800">{morador.quarto}</span>
                    <span className="text-slate-500 text-xs block">{morador.camaId}</span>
                  </td>

                  <td className="px-3 py-3 text-slate-600">{morador.campusNome}</td>

                  <td className="px-3 py-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full font-bold text-xs border ${getStatusBadge(
                        morador.recadastramentoStatus
                      )}`}
                    >
                      {morador.recadastramentoStatus}
                    </span>
                  </td>

                  <td className="px-3 py-3 text-center">
                    <span
                      className={`font-semibold ${
                        morador.componentesMatriculados >= 4
                          ? 'text-ufersa-green-700'
                          : 'text-rose-700 font-bold'
                      }`}
                    >
                      {morador.componentesMatriculados} componentes
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    {morador.recadastramentoStatus === 'Desligamento Pendente' ? (
                      <button
                        onClick={() => onOpenDesligamento(morador)}
                        className="px-2.5 py-1 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-lg text-xs transition shadow-2xs"
                      >
                        Executar Desligamento
                      </button>
                    ) : (
                      <span className="text-slate-400 text-xs italic">Em conformidade</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

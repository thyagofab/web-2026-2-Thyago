import { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Eye,
  UserX,
} from 'lucide-react';

export default function AcademicComplianceView({
  residents,
  selectedCampus,
  onOpenDesligamento,
  onOpenTermo,
  onToggleAuxilioTransporte,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompliance, setFilterCompliance] = useState('todos');

  const campusResidents = selectedCampus === 'todos'
    ? residents
    : residents.filter((r) => r.campusId === selectedCampus);

  const filteredResidents = campusResidents.filter((resident) => {
    const matchesSearch =
      resident.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.matricula.includes(searchTerm) ||
      resident.curso.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterCompliance === 'alertas') {
      return (
        resident.reprovacaoFalta ||
        resident.reprovacaoMediaQtd > 2 ||
        resident.componentesMatriculados < 4 ||
        resident.acumulaAuxilioTransporte ||
        resident.desocupacaoIminente
      );
    }
    if (filterCompliance === 'regulares') {
      return (
        !resident.reprovacaoFalta &&
        resident.reprovacaoMediaQtd <= 2 &&
        resident.componentesMatriculados >= 4 &&
        !resident.acumulaAuxilioTransporte
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Acompanhamento Acadêmico e Conformidade de Edital
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
              Verificação Semestral
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Validação automatizada das normas: Matrícula mínima de 4 disciplinas, rendimento semestral, vedação a trancamento e controle de auxílios.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl font-medium">
            Semestre Vigente: <strong>2026.1</strong>
          </span>
        </div>
      </div>

      {/* Cards de Critérios Normativos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-ufersa-green-50/70 border border-ufersa-green-200 rounded-xl p-3.5">
          <span className="font-bold text-ufersa-green-950 block mb-1">Matrícula Mínima Obrigatória</span>
          <p className="text-xs text-ufersa-green-800 leading-tight">
            Exigência de manter matrícula ativa em pelo menos <strong>4 componentes curriculares</strong> regulares no semestre.
          </p>
        </div>

        <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3.5">
          <span className="font-bold text-rose-950 block mb-1">Rendimento & Frequência</span>
          <p className="text-xs text-rose-800 leading-tight">
            Sinalização para desligamento caso haja <strong>reprovação por falta</strong> ou mais de 2 reprovações por média.
          </p>
        </div>

        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5">
          <span className="font-bold text-amber-950 block mb-1">Proibição de Trancamento</span>
          <p className="text-xs text-amber-800 leading-tight">
            É <strong>terminantemente proibido</strong> o trancamento total da matrícula no semestre em que residir na moradia.
          </p>
        </div>

        <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-3.5">
          <span className="font-bold text-sky-950 block mb-1">Incompatibilidade de Auxílio</span>
          <p className="text-xs text-sky-800 leading-tight">
            É vedado acumular moradia estudantil com o benefício de <strong>Auxílio Transporte</strong> (registro manual pelo gestor).
          </p>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, matrícula ou curso..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-ufersa-green-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-semibold text-slate-700">Situação:</span>
            <select
              value={filterCompliance}
              onChange={(e) => setFilterCompliance(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="todos">Todos os Residentes</option>
              <option value="alertas">Apenas com Alertas / Inconsistências</option>
              <option value="regulares">Apenas 100% Regulares</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela de Monitoramento */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Discente / Matrícula</th>
                <th className="px-3 py-3.5">Vaga / Campus</th>
                <th className="px-3 py-3.5 text-center">Matrícula Ativa</th>
                <th className="px-3 py-3.5 text-center">Reprovações</th>
                <th className="px-3 py-3.5 text-center">Trancamento</th>
                <th className="px-3 py-3.5 text-center">Aux. Transporte</th>
                <th className="px-3 py-3.5">Diagnóstico Geral</th>
                <th className="px-4 py-3.5 text-right">Ações da Gestão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResidents.map((resident) => {
                const hasMatriculaInsuficiente = resident.componentesMatriculados < 4;
                const hasReprovacaoFalta = resident.reprovacaoFalta;
                const hasReprovacaoMedia = resident.reprovacaoMediaQtd > 2;
                const hasTrancamento = resident.trancamentoRegistrado;
                const hasConflitoTransporte = resident.acumulaAuxilioTransporte;
                const hasAnyAlert =
                  hasMatriculaInsuficiente ||
                  hasReprovacaoFalta ||
                  hasReprovacaoMedia ||
                  hasTrancamento ||
                  hasConflitoTransporte ||
                  resident.desocupacaoIminente;

                return (
                  <tr
                    key={resident.id}
                    className={`hover:bg-slate-50/80 transition ${
                      hasAnyAlert ? 'bg-rose-50/20' : ''
                    }`}
                  >
                    {/* Discente */}
                    <td className="px-4 py-3">
                      <div>
                        <strong className="text-slate-900 font-bold block">{resident.nome}</strong>
                        <span className="text-xs text-slate-500 font-mono">
                          {resident.matricula} • {resident.curso}
                        </span>
                      </div>
                    </td>

                    {/* Vaga */}
                    <td className="px-3 py-3">
                      <span className="font-semibold text-slate-800 block">
                        {resident.quarto} • {resident.camaId}
                      </span>
                      <span className="text-xs text-slate-500">{resident.campusNome}</span>
                    </td>

                    {/* Componentes Matriculados (mínimo 4) */}
                    <td className="px-3 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded font-bold ${
                          hasMatriculaInsuficiente
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-ufersa-green-100 text-ufersa-green-800'
                        }`}
                        title={hasMatriculaInsuficiente ? 'Menos de 4 disciplinas matriculadas (Inconforme)' : 'Atende ao mínimo regulamentar'}
                      >
                        {hasMatriculaInsuficiente ? (
                          <XCircle className="w-3 h-3 text-rose-600" />
                        ) : (
                          <CheckCircle2 className="w-3 h-3 text-ufersa-green-600" />
                        )}
                        {resident.componentesMatriculados} disc.
                      </span>
                    </td>

                    {/* Reprovações */}
                    <td className="px-3 py-3 text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        {hasReprovacaoFalta ? (
                          <span className="px-2 py-0.5 bg-rose-600 text-white rounded text-xs font-bold">
                            Reprov. Falta
                          </span>
                        ) : resident.reprovacaoMediaQtd > 0 ? (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-xs font-semibold">
                            {resident.reprovacaoMediaQtd} por média
                          </span>
                        ) : (
                          <span className="text-ufersa-green-700 font-semibold text-xs">Nenhuma</span>
                        )}
                      </div>
                    </td>

                    {/* Trancamento */}
                    <td className="px-3 py-3 text-center">
                      {hasTrancamento ? (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-300 rounded font-bold">
                          Trancado
                        </span>
                      ) : (
                        <span className="text-ufersa-green-700 font-semibold">Regular</span>
                      )}
                    </td>

                    {/* Acúmulo com Auxílio Transporte (com toggle manual do Gestor) */}
                    <td className="px-3 py-3 text-center">
                      <button
                        onClick={() => onToggleAuxilioTransporte && onToggleAuxilioTransporte(resident.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold transition cursor-pointer ${
                          hasConflitoTransporte
                            ? 'bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                        }`}
                        title="Clique para alternar o registro manual de Auxílio Transporte"
                      >
                        {hasConflitoTransporte ? (
                          <>
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            Acúmulo Ativo
                          </>
                        ) : (
                          'Não Acumula'
                        )}
                      </button>
                    </td>

                    {/* Diagnóstico Geral */}
                    <td className="px-3 py-3">
                      {hasReprovacaoFalta || resident.statusAcademico.includes('Sinalizado') ? (
                        <span className="inline-block px-2.5 py-1 rounded-full font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          Sinalizado para Desligamento
                        </span>
                      ) : hasMatriculaInsuficiente ? (
                        <span className="inline-block px-2.5 py-1 rounded-full font-bold bg-amber-100 text-amber-900 border border-amber-200">
                          Matrícula Insuficiente
                        </span>
                      ) : hasConflitoTransporte ? (
                        <span className="inline-block px-2.5 py-1 rounded-full font-bold bg-amber-100 text-amber-900 border border-amber-200">
                          Conflito de Benefício
                        </span>
                      ) : resident.desocupacaoIminente ? (
                        <span className="inline-block px-2.5 py-1 rounded-full font-bold bg-amber-100 text-amber-900 border border-amber-200">
                          Prazo Limite Atingido
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-1 rounded-full font-bold bg-ufersa-green-100 text-ufersa-green-800 border border-ufersa-green-200">
                          Regular (Conforme)
                        </span>
                      )}
                    </td>

                    {/* Ações */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenTermo(resident)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                          title="Ver Termo de Compromisso e Cadastro"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {hasAnyAlert && (
                          <button
                            onClick={() => onOpenDesligamento(resident)}
                            className="px-2.5 py-1 bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-2xs"
                            title="Instaurar processo de desligamento"
                          >
                            <UserX className="w-3 h-3" />
                            Desligar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

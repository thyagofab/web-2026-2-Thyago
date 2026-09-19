import {
  Bed,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  ShieldAlert,
  ChevronRight,
  Wrench,
  Calendar,
} from 'lucide-react';

export default function DashboardView({
  rooms,
  residents,
  demands,
  selectedCampus,
  onNavigate,
}) {
  // Filtrar dados conforme campus selecionado
  const filteredRooms = selectedCampus === 'todos'
    ? rooms
    : rooms.filter((r) => r.campusId === selectedCampus);

  const filteredResidents = selectedCampus === 'todos'
    ? residents
    : residents.filter((r) => r.campusId === selectedCampus);

  // Cálculos de Ocupação
  const totalBeds = filteredRooms.reduce((acc, r) => acc + r.camas.length, 0);
  const occupiedBeds = filteredRooms.reduce(
    (acc, r) => acc + r.camas.filter((c) => c.status === 'Ocupada' || c.status === 'Desocupação Iminente').length,
    0
  );
  const freeBeds = filteredRooms.reduce(
    (acc, r) => acc + r.camas.filter((c) => c.status === 'Livre').length,
    0
  );
  const maintenanceBeds = filteredRooms.reduce(
    (acc, r) => acc + r.camas.filter((c) => c.status === 'Manutenção').length,
    0
  );

  const occupancyRate = totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(1) : 0;

  // Moradores em período limite de permanência (Duração regular + 2 semestres)
  const imminentVacancies = filteredResidents.filter((r) => r.desocupacaoIminente);
  
  // Alertas de conformidade acadêmica
  const academicAlerts = filteredResidents.filter(
    (r) => r.reprovacaoFalta || r.reprovacaoMediaQtd > 2 || r.componentesMatriculados < 4 || r.acumulaAuxilioTransporte
  );

  // Demandas pendentes de atendimento
  const pendingDemands = demands.filter(
    (d) => d.status === 'Pendente' || d.status === 'Em Análise'
  );

  // Tempo médio de permanência em semestres
  const totalSemestres = filteredResidents.reduce((acc, r) => acc + r.tempoPermanenciaSemestres, 0);
  const avgSemestres = filteredResidents.length > 0 ? (totalSemestres / filteredResidents.length).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      
      {/* Header com Boas-vindas e Contexto PROAE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Painel Geral de Ocupação e Permanência
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              PROAE / COAE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Monitoramento em tempo real da ocupação das residências, permanência discente e conformidade acadêmica.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('infrastructure')}
            className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
          >
            <Bed className="w-4 h-4" />
            Mapa de Vagas
          </button>
          <button
            onClick={() => onNavigate('academic')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
          >
            <TrendingUp className="w-4 h-4 text-emerald-700" />
            Auditoria Acadêmica
          </button>
        </div>
      </div>

      {/* Banner de Aviso: Vagas com Prazo Limite Próximo de Expirar */}
      {imminentVacancies.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-2xl p-4 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-900 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-amber-950">
                    Aviso de Prazo Máximo Regulamentar ({imminentVacancies.length} discentes em período final)
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                    Duração Regular + 2 Semestres
                  </span>
                </div>
                <p className="text-xs text-amber-900/80 mt-1 leading-relaxed">
                  Os seguintes moradores estão no penúltimo ou último período letivo do limite máximo concedido pelo regimento. A gestão pode realizar aviso prévio e planejar a alocação de suplentes:
                </p>

                {/* Badges de discentes */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {imminentVacancies.map((m) => (
                    <div
                      key={m.id}
                      className="bg-white/90 border border-amber-300/80 px-2.5 py-1 rounded-lg text-xs flex items-center gap-2 shadow-2xs"
                    >
                      <span className="font-semibold text-slate-900">{m.nome}</span>
                      <span className="text-[11px] text-amber-800 font-mono">({m.camaId})</span>
                      <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-medium">
                        Semestre {m.semestreAtual} de {m.duracaoRegularSemestres + 2} máx.
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('academic')}
              className="text-xs font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-300 px-3 py-1.5 rounded-lg shrink-0 transition flex items-center gap-1"
            >
              Auditar Vagas
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Grid de Indicadores Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Taxa de Ocupação */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Taxa Geral de Ocupação
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{occupancyRate}%</span>
            <span className="text-xs text-slate-500 font-medium">
              {occupiedBeds} de {totalBeds} leitos
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${occupancyRate}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
            <span>{occupiedBeds} leitos ocupados</span>
            <span className="text-emerald-700 font-semibold">{freeBeds} leitos livres</span>
          </p>
        </div>

        {/* Card 2: Vagas Ociosas / Livres */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Vagas Ociosas / Disponíveis
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center">
              <Bed className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-sky-950">{freeBeds}</span>
            <span className="text-xs text-slate-500 font-medium">prontas para alocação</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">
            {maintenanceBeds > 0 ? `${maintenanceBeds} leito em manutenção física.` : 'Nenhum leito interditado.'}
          </p>
          <button
            onClick={() => onNavigate('infrastructure')}
            className="mt-2 text-xs font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1 transition"
          >
            Ver leitos disponíveis
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        {/* Card 3: Tempo Médio de Permanência */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Permanência Média
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{avgSemestres}</span>
            <span className="text-xs text-slate-500 font-medium">semestres letivos</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">
            Média histórica dos {filteredResidents.length} residentes ativos.
          </p>
          <span className="inline-block mt-2 text-[10px] font-semibold text-purple-800 bg-purple-50 px-2 py-0.5 rounded">
            Limite: Duração Regular + 2 Semestres
          </span>
        </div>

        {/* Card 4: Demandas em Aberto */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Chamados em Aberto
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-950">{pendingDemands.length}</span>
            <span className="text-xs text-slate-500 font-medium">aguardando atendimento</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">
            Atendimento contínuo para suporte e infraestrutura.
          </p>
          <button
            onClick={() => onNavigate('demands')}
            className="mt-2 text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 transition"
          >
            Gerenciar chamados
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

      </div>

      {/* Grid de 2 Colunas: Ocupação por Unidade & Inconsistências de Conformidade */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna 1 e 2: Ocupação por Campus / Setores */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Distribuição de Ocupação por Campus da UFERSA
              </h2>
              <p className="text-xs text-slate-500">
                Capacidade instalada e ocupação atual por campus universitário
              </p>
            </div>
            <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              Dados atualizados hoje
            </span>
          </div>

          <div className="space-y-4">
            {[
              { nome: 'Campus Mossoró (Sede)', total: 12, ocupadas: 10, livres: 1, manutencao: 1, pct: 83 },
              { nome: 'Campus Angicos', total: 2, ocupadas: 1, livres: 1, manutencao: 0, pct: 50 },
              { nome: 'Campus Caraúbas', total: 2, ocupadas: 2, livres: 0, manutencao: 0, pct: 100 },
              { nome: 'Campus Pau dos Ferros', total: 2, ocupadas: 1, livres: 1, manutencao: 0, pct: 50 },
            ].map((campus, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-slate-900">{campus.nome}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">
                      {campus.ocupadas}/{campus.total} leitos ({campus.pct}%)
                    </span>
                    {campus.livres > 0 && (
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                        {campus.livres} vaga livre
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all ${
                      campus.pct >= 90
                        ? 'bg-rose-500'
                        : campus.pct >= 70
                        ? 'bg-emerald-600'
                        : 'bg-sky-500'
                    }`}
                    style={{ width: `${campus.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Campanhas Ativas de Recadastramento */}
          <div className="mt-5 pt-4 border-t border-slate-200/80">
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-700" />
                <span className="font-bold text-slate-900">Campanha Ativa: Recadastramento Semestral 2026.1</span>
              </div>
              <span className="text-emerald-700 font-bold">9 de 12 submetidos (75%)</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '75%' }} />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
              <span>Prazo regulamentar até 30/09/2026</span>
              <span className="text-rose-600 font-semibold">3 moradores em risco de perda da vaga por falta de envio</span>
            </div>
          </div>
        </div>

        {/* Coluna 3: Alertas Críticos de Conformidade */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                Inconformidades Identificadas
              </h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                {academicAlerts.length} casos
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Discentes com pendências de rendimento, matrícula ou acúmulo de benefício:
            </p>

            <div className="space-y-2.5">
              {academicAlerts.slice(0, 3).map((aluno) => (
                <div
                  key={aluno.id}
                  className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/50 text-xs flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-900">{aluno.nome}</strong>
                    <span className="text-[10px] font-bold text-rose-700 font-mono">
                      {aluno.camaId}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    {aluno.reprovacaoFalta && '• Reprovação por falta registrada.'}
                    {aluno.componentesMatriculados < 4 && '• Menos de 4 disciplinas matriculadas.'}
                    {aluno.acumulaAuxilioTransporte && '• Acúmulo indevido com Auxílio Transporte.'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200/80 mt-4 space-y-2">
            <button
              onClick={() => onNavigate('academic')}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition text-center block"
            >
              Auditar Situação Acadêmica Completa
            </button>
            <button
              onClick={() => onNavigate('allocations')}
              className="w-full py-2 border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-semibold transition text-center block"
            >
              Chamar Suplentes para Vagas Ociosas
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}

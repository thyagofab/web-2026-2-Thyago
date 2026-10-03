import {
  AlertTriangle,
  ArrowUpRight,
  Bed,
  Building2,
  ChevronRight,
  Users,
  Wrench,
} from 'lucide-react';

const campusNames = {
  mossoro: 'Mossoró',
  angicos: 'Angicos',
  caraubas: 'Caraúbas',
  pau_dos_ferros: 'Pau dos Ferros',
};

const cardColorClasses = {
  blue: 'bg-blue-50 text-blue-600',
  sky: 'bg-sky-50 text-sky-600',
  indigo: 'bg-indigo-50 text-indigo-600',
};

export default function DashboardView({
  rooms,
  residents,
  demands,
  selectedCampus,
  onNavigate,
}) {
  const filteredRooms = selectedCampus === 'todos'
    ? rooms
    : rooms.filter((room) => room.campusId === selectedCampus);
  const filteredResidents = selectedCampus === 'todos'
    ? residents
    : residents.filter((resident) => resident.campusId === selectedCampus);

  const totalBeds = filteredRooms.reduce((total, room) => total + room.camas.length, 0);
  const occupiedBeds = filteredRooms.reduce(
    (total, room) =>
      total +
      room.camas.filter(
        (bed) => bed.status === 'Ocupada' || bed.status === 'Desocupação Iminente'
      ).length,
    0
  );
  const freeBeds = filteredRooms.reduce(
    (total, room) => total + room.camas.filter((bed) => bed.status === 'Livre').length,
    0
  );
  const maintenanceBeds = filteredRooms.reduce(
    (total, room) => total + room.camas.filter((bed) => bed.status === 'Manutenção').length,
    0
  );
  const occupancyRate = totalBeds ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
  const imminentVacancies = filteredResidents.filter((resident) => resident.desocupacaoIminente);
  const academicAlerts = filteredResidents.filter(
    (resident) =>
      resident.reprovacaoFalta ||
      resident.reprovacaoMediaQtd > 2 ||
      resident.componentesMatriculados < 4 ||
      resident.acumulaAuxilioTransporte
  );
  const pendingDemands = demands.filter(
    (demand) => demand.status === 'Pendente' || demand.status === 'Em Análise'
  );
  const averageStay = filteredResidents.length
    ? (
        filteredResidents.reduce(
          (total, resident) => total + resident.tempoPermanenciaSemestres,
          0
        ) / filteredResidents.length
      ).toFixed(1)
    : '0.0';

  const cards = [
    {
      label: 'Ocupação atual',
      value: `${occupancyRate}%`,
      detail: `${occupiedBeds} de ${totalBeds} leitos ocupados`,
      icon: Bed,
      color: 'blue',
      action: () => onNavigate('infrastructure'),
    },
    {
      label: 'Vagas disponíveis',
      value: freeBeds,
      detail: maintenanceBeds ? `${maintenanceBeds} em manutenção` : 'Prontas para alocação',
      icon: Building2,
      color: 'sky',
      action: () => onNavigate('infrastructure'),
    },
    {
      label: 'Moradores ativos',
      value: filteredResidents.length,
      detail: `Permanência média de ${averageStay} semestres`,
      icon: Users,
      color: 'indigo',
      action: () => onNavigate('allocations'),
    },
    {
      label: 'Demandas abertas',
      value: pendingDemands.length,
      detail: 'Aguardando atendimento',
      icon: Wrench,
      color: 'blue',
      action: () => onNavigate('demands'),
    },
  ];

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
            Visão geral
          </p>
          <h1 className="text-2xl font-black tracking-tight text-slate-950">
            Dashboard de moradias
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Acompanhe os principais indicadores de ocupação e atendimento.
          </p>
        </div>
        <button
          onClick={() => onNavigate('infrastructure')}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Bed className="h-4 w-4" />
          Ver mapa de vagas
        </button>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, detail, icon: Icon, color, action }) => (
          <button
            key={label}
            onClick={action}
            className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
              <span className={`rounded-xl p-2 ${cardColorClasses[color]}`}>
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-4 flex items-end justify-between gap-2">
              <strong className="text-3xl font-black text-slate-950">{value}</strong>
              <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-blue-600" />
            </div>
            <p className="mt-2 text-xs text-slate-500">{detail}</p>
            {label === 'Ocupação atual' && (
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-blue-50">
                <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${occupancyRate}%` }} />
              </div>
            )}
          </button>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-3">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="font-bold text-slate-950">Atenção necessária</h2>
              <p className="mt-1 text-xs text-slate-500">Itens que precisam de acompanhamento da equipe.</p>
            </div>
            <AlertTriangle className="h-5 w-5 text-blue-600" />
          </div>
          <div className="divide-y divide-slate-100">
            <button
              onClick={() => onNavigate('academic')}
              className="flex w-full items-center justify-between gap-4 py-3 text-left transition hover:bg-blue-50/50"
            >
              <div>
                <p className="text-sm font-semibold text-slate-800">Conformidade acadêmica</p>
                <p className="text-xs text-slate-500">Moradores com indicadores para revisão</p>
              </div>
              <span className="flex items-center gap-1 text-sm font-bold text-blue-600">
                {academicAlerts.length}
                <ChevronRight className="h-4 w-4" />
              </span>
            </button>
            <button
              onClick={() => onNavigate('academic')}
              className="flex w-full items-center justify-between gap-4 py-3 text-left transition hover:bg-blue-50/50"
            >
              <div>
                <p className="text-sm font-semibold text-slate-800">Desocupações próximas</p>
                <p className="text-xs text-slate-500">Moradores em período final de permanência</p>
              </div>
              <span className="flex items-center gap-1 text-sm font-bold text-blue-600">
                {imminentVacancies.length}
                <ChevronRight className="h-4 w-4" />
              </span>
            </button>
            <button
              onClick={() => onNavigate('demands')}
              className="flex w-full items-center justify-between gap-4 py-3 text-left transition hover:bg-blue-50/50"
            >
              <div>
                <p className="text-sm font-semibold text-slate-800">Demandas em aberto</p>
                <p className="text-xs text-slate-500">Chamados pendentes ou em análise</p>
              </div>
              <span className="flex items-center gap-1 text-sm font-bold text-blue-600">
                {pendingDemands.length}
                <ChevronRight className="h-4 w-4" />
              </span>
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-blue-700 p-5 text-white shadow-sm lg:col-span-2">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-200">Acesso rápido</p>
          <h2 className="mt-2 text-lg font-bold">O que você deseja fazer?</h2>
          <div className="mt-5 space-y-2">
            {[
              ['allocations', 'Gerenciar alocações'],
              ['demands', 'Atender demandas'],
              ['academic', 'Abrir auditoria acadêmica'],
            ].map(([tab, label]) => (
              <button
                key={tab}
                onClick={() => onNavigate(tab)}
                className="flex w-full items-center justify-between rounded-xl border border-blue-500/60 bg-blue-600/60 px-3 py-2.5 text-left text-sm font-semibold transition hover:bg-blue-500"
              >
                {label}
                <ArrowUpRight className="h-4 w-4 text-blue-200" />
              </button>
            ))}
          </div>
        </div>
      </section>

      <p className="text-right text-xs text-slate-400">
        {selectedCampus === 'todos' ? 'Todos os campi' : campusNames[selectedCampus] || selectedCampus} · Dados atualizados agora
      </p>
    </div>
  );
}

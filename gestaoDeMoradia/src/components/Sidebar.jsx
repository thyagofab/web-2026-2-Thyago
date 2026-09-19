import {
  LayoutDashboard,
  Building,
  UserCheck,
  GraduationCap,
  ClipboardList,
  Wrench,
  User,
  ShieldCheck,
  Clock,
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  currentRole,
  imminentVacanciesCount,
  academicAlertsCount,
  pendingDemandsCount,
  mobileOpen,
  setMobileOpen,
}) {
  const isStudent = currentRole === 'morador';

  const managerNavItems = [
    {
      id: 'dashboard',
      label: 'Painel Geral',
      sublabel: 'Visão Geral & Indicadores',
      icon: LayoutDashboard,
      badge: imminentVacanciesCount > 0 ? `${imminentVacanciesCount} Avisos` : null,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    },
    {
      id: 'infrastructure',
      label: 'Infraestrutura & Vagas',
      sublabel: 'Campi, Alas, Quartos & Leitos',
      icon: Building,
      badge: null,
    },
    {
      id: 'allocations',
      label: 'Alocação & Posse',
      sublabel: 'Convocação, Termo & Entrada',
      icon: UserCheck,
      badge: null,
    },
    {
      id: 'academic',
      label: 'Acompanhamento Acadêmico',
      sublabel: 'Matrícula & Rendimento Semestral',
      icon: GraduationCap,
      badge: academicAlertsCount > 0 ? `${academicAlertsCount}` : null,
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    },
    {
      id: 'recadastramento',
      label: 'Recadastramento Semestral',
      sublabel: 'Campanhas de Renovação',
      icon: ClipboardList,
      badge: '2026.1',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    {
      id: 'demands',
      label: 'Demandas & Atendimento',
      sublabel: 'Manutenção & Convivência',
      icon: Wrench,
      badge: pendingDemandsCount > 0 ? `${pendingDemandsCount} Novas` : null,
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
    },
    {
      id: 'student_portal',
      label: 'Portal do Morador',
      sublabel: 'Visão do Aluno Residente',
      icon: User,
      badge: 'Discente',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    {
      id: 'audit_logs',
      label: 'Trilha de Auditoria',
      sublabel: 'Registro de Operações',
      icon: ShieldCheck,
      badge: null,
    },
  ];

  const studentNavItems = [
    {
      id: 'student_portal',
      label: 'Meu Acesso Morador',
      sublabel: 'Dados da Vaga & Concessão',
      icon: User,
      badge: 'Ativo',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    {
      id: 'demands',
      label: 'Minhas Demandas',
      sublabel: 'Solicitação de Manutenção 24h',
      icon: Wrench,
      badge: pendingDemandsCount > 0 ? `${pendingDemandsCount}` : null,
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
    },
    {
      id: 'recadastramento',
      label: 'Meu Recadastramento',
      sublabel: 'Renovação Semestre 2026.1',
      icon: ClipboardList,
      badge: 'Aberto',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    },
    {
      id: 'academic',
      label: 'Situação Acadêmica',
      sublabel: 'Comprovação & Disciplinas',
      icon: GraduationCap,
      badge: null,
    },
  ];

  const itemsToRender = isStudent ? studentNavItems : managerNavItems;

  const handleSelect = (id) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-30 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Aside Container */}
      <aside
        className={`fixed lg:static top-16 bottom-0 left-0 z-30 w-72 bg-white border-r border-slate-200 flex flex-col justify-between transform transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Navigation List */}
        <div className="p-4 space-y-1.5 overflow-y-auto flex-1">
          <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {isStudent ? 'Menu do Morador' : 'Módulos de Gestão'}
          </div>

          {itemsToRender.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full text-left flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 group ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-950 font-semibold shadow-xs border border-emerald-200'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className={`text-xs leading-tight ${isActive ? 'text-emerald-950 font-bold' : 'text-slate-800'}`}>
                      {item.label}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.sublabel}</p>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                      item.badgeColor || 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer info box: Normativas UFERSA */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70">
          <div className="bg-emerald-900/5 rounded-xl p-3.5 border border-emerald-900/10">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Semestre Letivo 2026.1</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Normativas da Pró-Reitoria de Assuntos Estudantis e Regimento Geral das Moradias Estudantis.
            </p>
            <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-emerald-800 font-medium">
              <span>PROAE / COAE</span>
              <span className="text-[11px] text-slate-500 font-medium">UFERSA</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

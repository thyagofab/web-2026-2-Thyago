import { useState, useRef, useEffect } from 'react';
import { Building2, Bell, ChevronDown, AlertTriangle, CheckCircle2, Menu, X, MapPin } from 'lucide-react';

export default function Navbar({
  currentRole,
  setCurrentRole,
  selectedCampus,
  setSelectedCampus,
  campi,
  imminentVacanciesCount,
  academicAlertsCount,
  pendingDemandsCount,
  onNavigate,
  mobileMenuOpen,
  setMobileMenuOpen,
}) {
  const totalNotifications = imminentVacanciesCount + academicAlertsCount + pendingDemandsCount;
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-ufersa-blue-900 text-white shadow-md border-b border-ufersa-blue-800/80">
      {/* Top Banner institucional */}
      <div className="bg-ufersa-blue-950 px-4 py-1.5 text-xs text-ufersa-blue-300 flex justify-between items-center border-b border-ufersa-blue-900/60">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-wider text-ufersa-blue-100">UFERSA</span>
          <span className="text-ufersa-blue-500">•</span>
          <span className="hidden sm:inline text-ufersa-blue-200">Universidade Federal Rural do Semi-Árido</span>
          <span className="hidden md:inline text-ufersa-blue-500">•</span>
          <span className="hidden md:inline text-ufersa-blue-300 font-medium">Pró-Reitoria de Assuntos Estudantis (PROAE)</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-ufersa-green-300 font-medium text-xs">Semestre Ativo: 2026.1</span>
          <span className="hidden sm:inline bg-ufersa-blue-800/80 text-ufersa-blue-200 px-2 py-0.5 rounded text-xs font-medium border border-ufersa-blue-700/60">
            Residências Universitárias
          </span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand UFERSA / SGM */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-ufersa-blue-200 hover:text-white hover:bg-ufersa-blue-800 focus:outline-none"
              aria-label="Abrir menu lateral"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => onNavigate('dashboard')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ufersa-blue-600 to-ufersa-green-500 flex items-center justify-center shadow-sm border border-ufersa-blue-400/40">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black tracking-tight text-white">SGM</span>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-ufersa-green-500/20 text-ufersa-green-300 rounded border border-ufersa-green-500/30">
                    UFERSA
                  </span>
                </div>
                <p className="text-xs text-ufersa-blue-200 font-medium leading-none hidden sm:block">
                  Gestão Integrada de Moradias Estudantis
                </p>
              </div>
            </div>
          </div>

          {/* Controls: Campus Selector + Alerts + Role Switcher */}
          <div className="flex items-center gap-3">
            
            {/* Campus Selector (com controle de escopo COAE vs PROAE) */}
            {currentRole === 'gestor_proae' ? (
              <div className="hidden md:flex items-center gap-2 bg-ufersa-blue-800/80 px-3 py-1.5 rounded-xl border border-ufersa-blue-700/70 text-xs">
                <MapPin className="w-3.5 h-3.5 text-ufersa-green-400" />
                <span className="text-xs font-semibold text-ufersa-blue-300 uppercase tracking-wide">Campus:</span>
                <select
                  value={selectedCampus}
                  onChange={(e) => setSelectedCampus(e.target.value)}
                  className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer pr-1"
                >
                  {campi.map((c) => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>
            ) : currentRole === 'gestor_coae' ? (
              <div className="hidden md:flex items-center gap-2 bg-ufersa-blue-800/80 px-3 py-1.5 rounded-xl border border-ufersa-blue-700/70 text-xs">
                <MapPin className="w-3.5 h-3.5 text-ufersa-green-400" />
                <span className="text-ufersa-blue-100 font-semibold">Campus Mossoró</span>
                <span className="text-xs bg-ufersa-blue-700 text-ufersa-blue-200 px-1.5 py-0.5 rounded font-mono">
                  COAE Local
                </span>
              </div>
            ) : null}

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                className="relative p-2 rounded-xl bg-ufersa-blue-800/70 hover:bg-ufersa-blue-700 text-ufersa-blue-100 hover:text-white transition"
                title="Avisos e Pendências"
                aria-expanded={notifOpen}
                onClick={() => setNotifOpen((prev) => !prev)}
              >
                <Bell className="w-5 h-5" />
                {totalNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-slate-950 font-black text-xs rounded-full flex items-center justify-center border-2 border-ufersa-blue-900 animate-pulse">
                    {totalNotifications}
                  </span>
                )}
              </button>

              {/* Notification Flyout */}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[90vw] bg-white rounded-2xl shadow-xl border border-slate-200 p-4 text-slate-800 text-xs z-50">
                  <div className="font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <span>Avisos do Sistema</span>
                    <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded">
                      {totalNotifications} pendências
                    </span>
                  </div>
                  <div className="py-2 space-y-2">
                    {imminentVacanciesCount > 0 && (
                      <button
                        onClick={() => {
                          onNavigate('academic');
                          setNotifOpen(false);
                        }}
                        className="w-full text-left flex items-start gap-2 text-amber-800 bg-amber-50/80 hover:bg-amber-100 p-2.5 rounded-xl border border-amber-200/60 transition"
                      >
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span><strong>{imminentVacanciesCount} moradores</strong> no período final do prazo regulamentar.</span>
                      </button>
                    )}
                    {academicAlertsCount > 0 && (
                      <button
                        onClick={() => {
                          onNavigate('academic');
                          setNotifOpen(false);
                        }}
                        className="w-full text-left flex items-start gap-2 text-rose-800 bg-rose-50/80 hover:bg-rose-100 p-2.5 rounded-xl border border-rose-200/60 transition"
                      >
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <span><strong>{academicAlertsCount} discentes</strong> com inconformidade acadêmica ou benefício.</span>
                      </button>
                    )}
                    {pendingDemandsCount > 0 && (
                      <button
                        onClick={() => {
                          onNavigate('demands');
                          setNotifOpen(false);
                        }}
                        className="w-full text-left flex items-start gap-2 text-sky-800 bg-sky-50/80 hover:bg-sky-100 p-2.5 rounded-xl border border-sky-200/60 transition"
                      >
                        <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                        <span><strong>{pendingDemandsCount} chamados</strong> de manutenção aguardando atendimento.</span>
                      </button>
                    )}
                    {totalNotifications === 0 && (
                      <p className="text-slate-500 italic text-center py-2">Nenhum aviso pendente no momento.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile / Role Selector */}
            <div className="flex items-center gap-2 bg-ufersa-blue-950/70 p-1.5 rounded-xl border border-ufersa-blue-700/60">
              <div className="hidden sm:flex flex-col text-right pl-2">
                <span className="text-xs font-bold text-white leading-tight">
                  {currentRole === 'gestor_proae'
                    ? 'Coordenação Central'
                    : currentRole === 'gestor_coae'
                    ? 'Equipe Mossoró'
                    : 'Thyago Fernandes'}
                </span>
                <span className="text-xs text-ufersa-blue-300 leading-tight">
                  {currentRole === 'morador' ? 'Morador Residente' : 'Gestão PROAE / COAE'}
                </span>
              </div>

              <div className="relative">
                <select
                  value={currentRole}
                  onChange={(e) => {
                    const newRole = e.target.value;
                    setCurrentRole(newRole);
                    if (newRole === 'morador') {
                      onNavigate('student_portal');
                    } else if (newRole === 'gestor_coae') {
                      setSelectedCampus('mossoro');
                      onNavigate('dashboard');
                    } else {
                      onNavigate('dashboard');
                    }
                  }}
                  className="appearance-none bg-ufersa-green-500 hover:bg-ufersa-green-400 text-slate-950 text-xs font-bold py-1.5 pl-3 pr-7 rounded-lg cursor-pointer transition shadow-xs"
                  title="Alternar perfil de visualização"
                >
                  <option value="gestor_proae">Gestor PROAE (Central)</option>
                  <option value="gestor_coae">Gestor COAE (Campus Local)</option>
                  <option value="morador">Morador (Discente)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-900 absolute right-2 top-2.5 pointer-events-none" />
              </div>
            </div>

          </div>

        </div>

        {/* Seletor de Campus (versão mobile, exibida quando o dropdown desktop está oculto) */}
        {currentRole === 'gestor_proae' && (
          <div className="md:hidden pb-3 flex items-center gap-2 bg-ufersa-blue-800/80 px-3 py-1.5 rounded-xl border border-ufersa-blue-700/70 text-xs">
            <MapPin className="w-3.5 h-3.5 text-ufersa-green-400 shrink-0" />
            <span className="text-xs font-semibold text-ufersa-blue-300 uppercase tracking-wide shrink-0">Campus:</span>
            <select
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
              className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer w-full"
            >
              {campi.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  {c.nome}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </header>
  );
}

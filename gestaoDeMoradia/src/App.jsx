import { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import InfrastructureView from './components/InfrastructureView';
import AllocationsView from './components/AllocationsView';
import AcademicComplianceView from './components/AcademicComplianceView';
import DemandsView from './components/DemandsView';
import RecadastramentoView from './components/RecadastramentoView';
import StudentPortalView from './components/StudentPortalView';
import AuditLogsView from './components/AuditLogsView';

import TermoCompromissoModal from './components/TermoCompromissoModal';
import AllocateBedModal from './components/AllocateBedModal';
import DesligamentoModal from './components/DesligamentoModal';
import NewDemandModal from './components/NewDemandModal';

import {
  CAMPI,
  INITIAL_ROOMS,
  INITIAL_RESIDENTS,
  INITIAL_SUPLENTES,
  INITIAL_DEMANDS,
  INITIAL_CAMPAIGNS,
  INITIAL_LOGS,
} from './data/mockData';

export default function App() {
  // Estado do Perfil e Campus ativo
  const [currentRole, setCurrentRole] = useState('gestor_proae'); // 'gestor_proae', 'gestor_coae', 'morador'
  const [selectedCampus, setSelectedCampus] = useState('todos');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Estados dos Dados Centrais
  const [rooms, setRooms] = useState(INITIAL_ROOMS);
  const [residents, setResidents] = useState(INITIAL_RESIDENTS);
  const [suplentes, setSuplentes] = useState(INITIAL_SUPLENTES);
  const [demands, setDemands] = useState(INITIAL_DEMANDS);
  const [campaigns] = useState(INITIAL_CAMPAIGNS);
  const [logs, setLogs] = useState(INITIAL_LOGS);

  // Estados dos Modais
  const [termoModalOpen, setTermoModalOpen] = useState(false);
  const [selectedResidentForTermo, setSelectedResidentForTermo] = useState(null);

  const [allocateModalOpen, setAllocateModalOpen] = useState(false);
  const [targetBedForAllocate, setTargetBedForAllocate] = useState(null);
  const [targetRoomForAllocate, setTargetRoomForAllocate] = useState(null);

  const [desligamentoModalOpen, setDesligamentoModalOpen] = useState(false);
  const [selectedResidentForDesligamento, setSelectedResidentForDesligamento] = useState(null);

  const [newDemandModalOpen, setNewDemandModalOpen] = useState(false);

  // Usuário padrão logado quando em visão do Morador
  const currentStudentUser = residents.find((r) => r.id === 'morador-1') || residents[0];

  // Contadores para alertas do Navbar
  const imminentVacanciesCount = residents.filter((r) => r.desocupacaoIminente).length;
  const academicAlertsCount = residents.filter(
    (r) => r.reprovacaoFalta || r.reprovacaoMediaQtd > 2 || r.componentesMatriculados < 4 || r.acumulaAuxilioTransporte
  ).length;
  const pendingDemandsCount = demands.filter((d) => d.status === 'Pendente').length;

  // Handler: Assinar Termo de Compromisso
  const handleAssinarTermo = (moradorId) => {
    setResidents((prev) =>
      prev.map((m) => (m.id === moradorId ? { ...m, termoAssinado: true } : m))
    );

    const targetMorador = residents.find((m) => m.id === moradorId);
    const newLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleString('pt-BR'),
      usuario: `${targetMorador?.nome || 'Discente'} (Assinatura Eletrônica)`,
      tipoAcao: 'Termo de Compromisso Assinado',
      detalhes: `Discente assinou eletronicamente o Termo de Moradia Estudantil para a vaga ${targetMorador?.camaId}.`,
      campus: targetMorador?.campusNome || 'Campus Mossoró',
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Handler: Confirmar Tomada de Posse Física
  const handleConfirmarPosse = (moradorId) => {
    const dataHoje = new Date().toLocaleDateString('pt-BR');
    setResidents((prev) =>
      prev.map((m) =>
        m.id === moradorId
          ? { ...m, status: 'Ativo', dataPosse: dataHoje, tempoPermanenciaSemestres: 1 }
          : m
      )
    );

    const targetMorador = residents.find((m) => m.id === moradorId);
    const newLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleString('pt-BR'),
      usuario: 'gestor.coae (Equipe Administrativa)',
      tipoAcao: 'Registro de Posse Física',
      detalhes: `Confirmada posse física da vaga ${targetMorador?.camaId} pelo discente ${targetMorador?.nome}. Status alterado para Ativo.`,
      campus: targetMorador?.campusNome || 'Campus Mossoró',
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Handler: Alocar Suplente ou Convocado em Cama Livre
  const handleConfirmAllocate = (bedId, newStudent) => {
    // 1. Adiciona o novo discente à lista de moradores
    setResidents((prev) => [newStudent, ...prev]);

    // 2. Atualiza a cama no quarto para 'Ocupada'
    setRooms((prev) =>
      prev.map((room) => {
        const hasBed = room.camas.some((c) => c.id === bedId);
        if (!hasBed) return room;
        return {
          ...room,
          camas: room.camas.map((cama) =>
            cama.id === bedId
              ? { ...cama, status: 'Ocupada', moradorId: newStudent.id }
              : cama
          ),
        };
      })
    );

    // 3. Remove de suplentes se presente
    setSuplentes((prev) => prev.filter((s) => s.matricula !== newStudent.matricula));

    // 4. Log de auditoria
    const newLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleString('pt-BR'),
      usuario: 'gestor.proae (Alocação de Vagas)',
      tipoAcao: 'Alocação de Discente em Vaga',
      detalhes: `Discente ${newStudent.nome} vinculado ao leito ${bedId} no quarto ${newStudent.quarto}. Termo de Compromisso emitido.`,
      campus: newStudent.campusNome,
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Handler: Desligamento Formal de Morador e Liberação Imediata da Vaga
  const handleConfirmDesligamento = (moradorId, motivo, justificativa, notificarSuplente) => {
    const targetMorador = residents.find((m) => m.id === moradorId);
    if (!targetMorador) return;

    // 1. Atualiza o status do morador para 'Desligado'
    setResidents((prev) =>
      prev.map((m) =>
        m.id === moradorId
          ? { ...m, status: 'Desligado', camaId: 'Nenhuma (Desligado)' }
          : m
      )
    );

    // 2. Libera a cama para 'Livre' imediatamente
    setRooms((prev) =>
      prev.map((room) => {
        const hasBed = room.camas.some((c) => c.id === targetMorador.camaId);
        if (!hasBed) return room;
        return {
          ...room,
          camas: room.camas.map((cama) =>
            cama.id === targetMorador.camaId
              ? { ...cama, status: 'Livre', moradorId: null }
              : cama
          ),
        };
      })
    );

    // 3. Registra em log de auditoria
    const newLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleString('pt-BR'),
      usuario: 'gestor.coae (Comissão de Permanência)',
      tipoAcao: 'Desligamento de Morador',
      detalhes: `Morador ${targetMorador.nome} desligado. Motivo: ${motivo}. Parecer: ${justificativa || 'Nenhum'}. Vaga ${targetMorador.camaId} liberada para suplentes: ${notificarSuplente ? 'Sim' : 'Não'}.`,
      campus: targetMorador.campusNome,
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Handler: Salvar Nova Demanda
  const handleSaveDemand = (novaDemanda) => {
    setDemands((prev) => [novaDemanda, ...prev]);

    const newLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleString('pt-BR'),
      usuario: `${novaDemanda.moradorNome} (${novaDemanda.origem})`,
      tipoAcao: 'Nova Demanda Registrada',
      detalhes: `Demanda ${novaDemanda.id} aberta (${novaDemanda.tipo}): "${novaDemanda.titulo}".`,
      campus: novaDemanda.campusNome,
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Handler: Atualizar Status de Demanda
  const handleUpdateDemandStatus = (demandId, newStatus, updatedDemandData) => {
    setDemands((prev) =>
      prev.map((d) => {
        if (d.id !== demandId) return d;
        if (updatedDemandData) return updatedDemandData;
        return {
          ...d,
          status: newStatus,
          dataAtualizacao: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
        };
      })
    );

    const newLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleString('pt-BR'),
      usuario: 'gestor.coae (Atendimento)',
      tipoAcao: 'Status de Demanda Atualizado',
      detalhes: `Demanda ${demandId} teve seu status alterado para "${newStatus}".`,
      campus: 'Campus Mossoró',
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Handler: Processar Inadimplência do Recadastramento
  const handleApplyInadimplencia = () => {
    setResidents((prev) =>
      prev.map((r) => {
        if (r.recadastramentoStatus === 'Pendente') {
          return { ...r, recadastramentoStatus: 'Desligamento Pendente' };
        }
        return r;
      })
    );

    const newLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleString('pt-BR'),
      usuario: 'sistema.regras (Agendador)',
      tipoAcao: 'Inadimplência de Recadastramento',
      detalhes: 'Discentes inadimplentes com o prazo de recadastramento alterados para "Desligamento Pendente".',
      campus: 'Todos os Campi',
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Handler: Alternar registro manual de Auxílio Transporte (Incompatibilidade)
  const handleToggleAuxilioTransporte = (moradorId) => {
    const target = residents.find((m) => m.id === moradorId);
    if (!target) return;
    const novoValor = !target.acumulaAuxilioTransporte;

    setResidents((prev) =>
      prev.map((m) => {
        if (m.id !== moradorId) return m;
        return {
          ...m,
          acumulaAuxilioTransporte: novoValor,
          statusAcademico: novoValor ? 'Conflito de Auxílio Transporte' : 'Regular',
        };
      })
    );

    const newLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleString('pt-BR'),
      usuario: 'gestor.coae (Registro Manual de Benefício)',
      tipoAcao: 'Atualização de Auxílio Transporte',
      detalhes: `Registro de Auxílio Transporte alterado para ${novoValor ? 'Acúmulo Identificado' : 'Regular'} para ${target.nome}.`,
      campus: target.campusNome || 'Campus Mossoró',
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Modais Openers
  const handleOpenAllocate = (cama, room) => {
    setTargetBedForAllocate(cama);
    setTargetRoomForAllocate(room);
    setAllocateModalOpen(true);
  };

  const handleOpenTermo = (morador) => {
    setSelectedResidentForTermo(morador);
    setTermoModalOpen(true);
  };

  const handleOpenDesligamento = (morador) => {
    setSelectedResidentForDesligamento(morador);
    setDesligamentoModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      
      {/* Top Navbar */}
      <Navbar
        currentRole={currentRole}
        setCurrentRole={(role) => {
          setCurrentRole(role);
          if (role === 'morador') {
            setActiveTab('student_portal');
          } else if (role === 'gestor_coae') {
            setSelectedCampus('mossoro');
            if (activeTab === 'student_portal') setActiveTab('dashboard');
          } else if (activeTab === 'student_portal') {
            setActiveTab('dashboard');
          }
        }}
        selectedCampus={selectedCampus}
        setSelectedCampus={setSelectedCampus}
        campi={CAMPI}
        imminentVacanciesCount={imminentVacanciesCount}
        academicAlertsCount={academicAlertsCount}
        pendingDemandsCount={pendingDemandsCount}
        onNavigate={(tab) => setActiveTab(tab)}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentRole={currentRole}
          imminentVacanciesCount={imminentVacanciesCount}
          academicAlertsCount={academicAlertsCount}
          pendingDemandsCount={pendingDemandsCount}
          mobileOpen={mobileMenuOpen}
          setMobileOpen={setMobileMenuOpen}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
          {activeTab === 'dashboard' && (
            <DashboardView
              rooms={rooms}
              residents={residents}
              demands={demands}
              selectedCampus={selectedCampus}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'infrastructure' && (
            <InfrastructureView
              rooms={rooms}
              residents={residents}
              selectedCampus={selectedCampus}
              onOpenAllocate={handleOpenAllocate}
              onOpenTermo={handleOpenTermo}
              onOpenDesligamento={handleOpenDesligamento}
            />
          )}

          {activeTab === 'allocations' && (
            <AllocationsView
              residents={residents}
              suplentes={suplentes}
              rooms={rooms}
              selectedCampus={selectedCampus}
              onOpenAllocate={handleOpenAllocate}
              onOpenTermo={handleOpenTermo}
              onConfirmarPosse={handleConfirmarPosse}
              onOpenDesligamento={handleOpenDesligamento}
            />
          )}

          {activeTab === 'academic' && (
            <AcademicComplianceView
              residents={residents}
              selectedCampus={selectedCampus}
              onOpenDesligamento={handleOpenDesligamento}
              onOpenTermo={handleOpenTermo}
              onToggleAuxilioTransporte={handleToggleAuxilioTransporte}
            />
          )}

          {activeTab === 'recadastramento' && (
            <RecadastramentoView
              campaigns={campaigns}
              residents={residents}
              onApplyInadimplencia={handleApplyInadimplencia}
              onOpenDesligamento={handleOpenDesligamento}
              currentRole={currentRole}
            />
          )}

          {activeTab === 'demands' && (
            <DemandsView
              demands={demands}
              onOpenNewDemand={() => setNewDemandModalOpen(true)}
              onUpdateDemandStatus={handleUpdateDemandStatus}
              currentRole={currentRole}
            />
          )}

          {activeTab === 'student_portal' && (
            <StudentPortalView
              currentUser={currentStudentUser}
              demands={demands}
              onOpenTermo={handleOpenTermo}
              onOpenNewDemand={() => setNewDemandModalOpen(true)}
            />
          )}

          {activeTab === 'audit_logs' && (
            <AuditLogsView logs={logs} />
          )}
        </main>

      </div>

      {/* Modais Interativos */}
      <TermoCompromissoModal
        isOpen={termoModalOpen}
        onClose={() => setTermoModalOpen(false)}
        morador={selectedResidentForTermo}
        onAssinarTermo={handleAssinarTermo}
        onConfirmarPosse={handleConfirmarPosse}
        currentRole={currentRole}
      />

      <AllocateBedModal
        isOpen={allocateModalOpen}
        onClose={() => setAllocateModalOpen(false)}
        targetBed={targetBedForAllocate}
        targetRoom={targetRoomForAllocate}
        suplentes={suplentes}
        onConfirmAllocate={handleConfirmAllocate}
      />

      <DesligamentoModal
        isOpen={desligamentoModalOpen}
        onClose={() => setDesligamentoModalOpen(false)}
        morador={selectedResidentForDesligamento}
        onConfirmDesligamento={handleConfirmDesligamento}
      />

      <NewDemandModal
        isOpen={newDemandModalOpen}
        onClose={() => setNewDemandModalOpen(false)}
        currentUser={currentStudentUser}
        currentRole={currentRole}
        onSaveDemand={handleSaveDemand}
      />

    </div>
  );
}

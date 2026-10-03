import { useState } from 'react';
import { X, UserPlus, Shield, School, User, CheckCircle2, AlertTriangle } from 'lucide-react';
import { CAMPI } from '../data/mockData';

export default function CadastrarMembroModal({ isOpen, onClose, onMemberCreated, currentUserRole }) {
  const [roleType, setRoleType] = useState('gestor_coae'); // 'gestor_coae', 'gestor_proae', 'morador'
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [campusId, setCampusId] = useState('mossoro');
  const [matricula, setMatricula] = useState('');
  const [curso, setCurso] = useState('');
  const [tempPassword, setTempPassword] = useState('Ufersa2026!');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Regra de Negócio: Apenas PROAE pode cadastrar novos membros
  if (currentUserRole !== 'gestor_proae') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
        <div className="bg-white rounded-3xl p-6 max-w-md w-full text-center shadow-2xl">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">Acesso Restrito</h3>
          <p className="text-xs text-slate-600 mt-2">
            Apenas a equipe gestora central (PROAE) possui autorização normativa para cadastrar novos membros no sistema.
          </p>
          <button
            onClick={onClose}
            className="mt-6 w-full py-2.5 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!nome.trim() || !email.trim()) {
      setErrorMsg('Preencha os campos obrigatórios.');
      return;
    }

    if (!email.includes('@ufersa.edu.br') && !email.includes('@alunos.ufersa.edu.br')) {
      setErrorMsg('O e-mail deve pertencer ao domínio institucional da UFERSA (@ufersa.edu.br ou @alunos.ufersa.edu.br).');
      return;
    }

    const selectedCampus = CAMPI.find((c) => c.id === campusId) || CAMPI[1];

    const newMember = {
      id: `user-${Date.now()}`,
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      role: roleType,
      campus: roleType === 'gestor_proae' ? 'todos' : campusId,
      campusNome: roleType === 'gestor_proae' ? 'Todos os Campi (PROAE Central)' : selectedCampus.nome,
      matricula: roleType === 'morador' ? matricula.trim() : null,
      curso: roleType === 'morador' ? curso.trim() : null,
      tempPassword,
      dataCriacao: new Date().toLocaleDateString('pt-BR'),
      criadoPor: 'PROAE Central',
    };

    onMemberCreated(newMember);
    setSuccessMsg(`Membro ${nome} (${roleType.toUpperCase()}) cadastrado com sucesso!`);

    setTimeout(() => {
      setNome('');
      setEmail('');
      setMatricula('');
      setCurso('');
      setSuccessMsg('');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-ufersa-blue-900 to-ufersa-blue-950 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-ufersa-green-500/20 border border-ufersa-green-400/30 flex items-center justify-center text-ufersa-green-300">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Cadastrar Novo Membro</h3>
              <p className="text-[11px] text-ufersa-blue-200">Ação exclusiva da Pró-Reitoria (PROAE)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ufersa-blue-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
            Este formulário registra o membro na demonstração da aplicação. A criação de
            usuários no Cognito deve ser feita por um backend protegido com permissões AWS.
          </div>
          
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Seleção do Perfil do Novo Membro */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Perfil do Usuário
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRoleType('gestor_coae')}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition cursor-pointer ${
                  roleType === 'gestor_coae'
                    ? 'bg-ufersa-blue-50 border-ufersa-blue-600 text-ufersa-blue-900 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <School className="w-4 h-4 text-sky-600" />
                <span>Gestor COAE</span>
                <span className="text-[9px] text-slate-400 font-normal">Campus Local</span>
              </button>

              <button
                type="button"
                onClick={() => setRoleType('gestor_proae')}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition cursor-pointer ${
                  roleType === 'gestor_proae'
                    ? 'bg-purple-50 border-purple-600 text-purple-900 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Shield className="w-4 h-4 text-purple-600" />
                <span>Gestor PROAE</span>
                <span className="text-[9px] text-slate-400 font-normal">Central Multi-Campi</span>
              </button>

              <button
                type="button"
                onClick={() => setRoleType('morador')}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition cursor-pointer ${
                  roleType === 'morador'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <User className="w-4 h-4 text-emerald-600" />
                <span>Morador</span>
                <span className="text-[9px] text-slate-400 font-normal">Discente</span>
              </button>
            </div>
          </div>

          {/* Nome Completo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nome Completo
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Maria da Silva Souza"
              required
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-ufersa-blue-600 focus:outline-none"
            />
          </div>

          {/* E-mail Institucional */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              E-mail Institucional
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={roleType === 'morador' ? 'discente@alunos.ufersa.edu.br' : 'servidor@ufersa.edu.br'}
              required
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-ufersa-blue-600 focus:outline-none"
            />
          </div>

          {/* Campus de Lotação (se COAE ou Morador) */}
          {roleType !== 'gestor_proae' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Campus de Lotação / Residência
              </label>
              <select
                value={campusId}
                onChange={(e) => setCampusId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-ufersa-blue-600 focus:outline-none bg-white"
              >
                {CAMPI.filter((c) => c.id !== 'todos').map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Campos específicos para Morador */}
          {roleType === 'morador' && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Matrícula</label>
                <input
                  type="text"
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  placeholder="2026019999"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Curso</label>
                <input
                  type="text"
                  value={curso}
                  onChange={(e) => setCurso(e.target.value)}
                  placeholder="Ex: Engenharia Elétrica"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                />
              </div>
            </div>
          )}

          {/* Senha Temporária */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Senha Temporária Inicial
            </label>
            <input
              type="text"
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono bg-slate-50"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              O usuário deverá redefinir essa senha no primeiro acesso conforme o fluxo do Cognito.
            </p>
          </div>

          {/* Ações */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-ufersa-blue-700 hover:bg-ufersa-blue-800 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Concluir Cadastro</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

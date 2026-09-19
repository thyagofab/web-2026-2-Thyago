import { useState } from 'react';
import { X, UserPlus, Bed, Check, AlertCircle } from 'lucide-react';

export default function AllocateBedModal({
  isOpen,
  onClose,
  targetBed,
  targetRoom,
  suplentes,
  onConfirmAllocate,
}) {
  const [selectedSuplenteId, setSelectedSuplenteId] = useState('');
  const [novoDiscente, setNovoDiscente] = useState({
    nome: '',
    matricula: '',
    curso: 'Ciência da Computação',
    telefone: '',
    email: '',
  });
  const [useCustomStudent, setUseCustomStudent] = useState(false);

  if (!isOpen || !targetBed || !targetRoom) return null;

  const handleAllocate = (e) => {
    e.preventDefault();

    let studentData;
    if (useCustomStudent) {
      if (!novoDiscente.nome || !novoDiscente.matricula) {
        alert('Por favor preencha nome e matrícula do discente.');
        return;
      }
      studentData = {
        id: `morador-${Date.now()}`,
        nome: novoDiscente.nome,
        matricula: novoDiscente.matricula,
        curso: novoDiscente.curso,
        campusId: targetRoom.campusId,
        campusNome: targetRoom.campusId === 'mossoro' ? 'Campus Mossoró' : targetRoom.campusId,
        ala: targetRoom.ala,
        quarto: targetRoom.numero,
        camaId: targetBed.id,
        semestreIngresso: '2026.1',
        duracaoRegularSemestres: 8,
        semestreAtual: 1,
        tempoPermanenciaSemestres: 0,
        status: 'Aguardando Posse',
        termoAssinado: false,
        dataPosse: null,
        email: novoDiscente.email || `${novoDiscente.matricula}@alunos.ufersa.edu.br`,
        telefone: novoDiscente.telefone || '(84) 99999-0000',
        componentesMatriculados: 5,
        reprovacaoFalta: false,
        reprovacaoMediaQtd: 0,
        trancamentoRegistrado: false,
        acumulaAuxilioTransporte: false,
        statusAcademico: 'Regular',
        desocupacaoIminente: false,
        recadastramentoStatus: 'Pendente',
      };
    } else {
      const suplente = suplentes.find((s) => s.id === selectedSuplenteId);
      if (!suplente) {
        alert('Selecione um discente suplente da lista de espera.');
        return;
      }
      studentData = {
        id: `morador-${Date.now()}`,
        nome: suplente.nome,
        matricula: suplente.matricula,
        curso: suplente.curso,
        campusId: targetRoom.campusId,
        campusNome: targetRoom.campusId === 'mossoro' ? 'Campus Mossoró' : targetRoom.campusId,
        ala: targetRoom.ala,
        quarto: targetRoom.numero,
        camaId: targetBed.id,
        semestreIngresso: '2026.1',
        duracaoRegularSemestres: 8,
        semestreAtual: 1,
        tempoPermanenciaSemestres: 0,
        status: 'Aguardando Posse',
        termoAssinado: false,
        dataPosse: null,
        email: suplente.email,
        telefone: suplente.contato,
        componentesMatriculados: 5,
        reprovacaoFalta: false,
        reprovacaoMediaQtd: 0,
        trancamentoRegistrado: false,
        acumulaAuxilioTransporte: false,
        statusAcademico: 'Regular',
        desocupacaoIminente: false,
        recadastramentoStatus: 'Pendente',
      };
    }

    onConfirmAllocate(targetBed.id, studentData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-emerald-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-amber-300">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Alocação de Discente em Vaga</h3>
              <p className="text-xs text-emerald-200">Convocação e Vinculação de Vaga</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informações da Vaga Alvo */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Bed className="w-4 h-4 text-emerald-700" />
            <span className="text-slate-600">Vaga Selecionada:</span>
            <strong className="text-slate-900">{targetRoom.numero} • {targetBed.numero}</strong>
          </div>
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-[11px]">
            {targetRoom.ala}
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleAllocate} className="p-6 space-y-4 text-xs">
          
          {/* Toggle entre Suplente do Edital ou Novo Cadastro */}
          <div className="flex rounded-xl p-1 bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => setUseCustomStudent(false)}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition ${
                !useCustomStudent ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Fila de Suplentes / Convocados
            </button>
            <button
              type="button"
              onClick={() => setUseCustomStudent(true)}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition ${
                useCustomStudent ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Outro Convocado do SISU
            </button>
          </div>

          {!useCustomStudent ? (
            <div className="space-y-2">
              <label className="block font-bold text-slate-700">
                Selecione o Discente Suplente Classificado:
              </label>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {suplentes.map((sup) => (
                  <label
                    key={sup.id}
                    className={`block p-3 rounded-xl border cursor-pointer transition ${
                      selectedSuplenteId === sup.id
                        ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="suplente"
                          checked={selectedSuplenteId === sup.id}
                          onChange={() => setSelectedSuplenteId(sup.id)}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{sup.nome}</p>
                          <p className="text-[11px] text-slate-500">
                            Matrícula: <span className="font-mono">{sup.matricula}</span> • {sup.curso}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                        {sup.classificacaoEdital}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome Completo:</label>
                <input
                  type="text"
                  required
                  value={novoDiscente.nome}
                  onChange={(e) => setNovoDiscente({ ...novoDiscente, nome: e.target.value })}
                  placeholder="Ex: Maria Clara dos Santos"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Matrícula SIGAA:</label>
                  <input
                    type="text"
                    required
                    value={novoDiscente.matricula}
                    onChange={(e) => setNovoDiscente({ ...novoDiscente, matricula: e.target.value })}
                    placeholder="2026010099"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Curso:</label>
                  <select
                    value={novoDiscente.curso}
                    onChange={(e) => setNovoDiscente({ ...novoDiscente, curso: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option>Ciência da Computação</option>
                    <option>Agronomia</option>
                    <option>Medicina Veterinária</option>
                    <option>Engenharia de Produção</option>
                    <option>Biotecnologia</option>
                    <option>Sistemas de Informação</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">E-mail Institucional:</label>
                <input
                  type="email"
                  value={novoDiscente.email}
                  onChange={(e) => setNovoDiscente({ ...novoDiscente, email: e.target.value })}
                  placeholder="discente@alunos.ufersa.edu.br"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Aviso informativo de fluxo */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Procedimento:</strong> Ao confirmar a alocação, o discente passará a ter cadastro no sistema no status <em>&quot;Aguardando Posse&quot;</em>. O Termo de Compromisso eletrônico será emitido imediatamente para sua assinatura digital, e a contagem oficial de permanência iniciará assim que a posse física for registrada pela COAE.
            </p>
          </div>

          {/* Footer Buttons */}
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
              <Check className="w-4 h-4" />
              Efetivar Alocação do Discente
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

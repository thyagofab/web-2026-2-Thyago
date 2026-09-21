import { useState } from 'react';
import { X, UserPlus, Bed, Check, AlertCircle } from 'lucide-react';

const MATRICULA_REGEX = /^\d{10}$/;
const EMAIL_INSTITUCIONAL_REGEX = /^[^\s@]+@alunos\.ufersa\.edu\.br$/i;

export default function AllocateBedModal({
  isOpen,
  onClose,
  targetBed,
  targetRoom,
  suplentes,
  residents,
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
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  if (!isOpen || !targetBed || !targetRoom) return null;

  const validateCustomStudent = () => {
    const newErrors = {};

    if (!novoDiscente.nome.trim()) {
      newErrors.nome = 'Informe o nome completo do discente.';
    } else if (novoDiscente.nome.trim().split(' ').length < 2) {
      newErrors.nome = 'Informe o nome completo (nome e sobrenome).';
    }

    if (!novoDiscente.matricula.trim()) {
      newErrors.matricula = 'Informe a matrícula SIGAA.';
    } else if (!MATRICULA_REGEX.test(novoDiscente.matricula.trim())) {
      newErrors.matricula = 'A matrícula deve ter exatamente 10 dígitos numéricos.';
    } else {
      const jaExiste = (residents || []).some(
        (r) => r.matricula === novoDiscente.matricula.trim()
      );
      if (jaExiste) {
        newErrors.matricula = 'Já existe um discente cadastrado com esta matrícula.';
      }
    }

    if (novoDiscente.email && !EMAIL_INSTITUCIONAL_REGEX.test(novoDiscente.email.trim())) {
      newErrors.email = 'Use o e-mail institucional no formato nome@alunos.ufersa.edu.br.';
    }

    return newErrors;
  };

  const handleAllocate = (e) => {
    e.preventDefault();
    setFormError('');

    let studentData;
    if (useCustomStudent) {
      const newErrors = validateCustomStudent();
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      setErrors({});
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
        setFormError('Selecione um discente suplente da lista de espera para continuar.');
        return;
      }
      setFormError('');
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
    setNovoDiscente({ nome: '', matricula: '', curso: 'Ciência da Computação', telefone: '', email: '' });
    setSelectedSuplenteId('');
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-ufersa-green-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-ufersa-green-700 flex items-center justify-center text-amber-300">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Alocação de Discente em Vaga</h3>
              <p className="text-xs text-ufersa-green-200">Convocação e Vinculação de Vaga</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-ufersa-green-200 hover:text-white hover:bg-ufersa-green-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informações da Vaga Alvo */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Bed className="w-4 h-4 text-ufersa-green-700" />
            <span className="text-slate-600">Vaga Selecionada:</span>
            <strong className="text-slate-900">{targetRoom.numero} • {targetBed.numero}</strong>
          </div>
          <span className="px-2 py-0.5 bg-ufersa-green-100 text-ufersa-green-800 rounded font-semibold text-xs">
            {targetRoom.ala}
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleAllocate} className="p-6 space-y-4 text-sm">
          
          {/* Toggle entre Suplente do Edital ou Novo Cadastro */}
          <div className="flex rounded-xl p-1 bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setUseCustomStudent(false);
                setErrors({});
                setFormError('');
              }}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition ${
                !useCustomStudent ? 'bg-white text-ufersa-green-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Fila de Suplentes / Convocados
            </button>
            <button
              type="button"
              onClick={() => {
                setUseCustomStudent(true);
                setErrors({});
                setFormError('');
              }}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition ${
                useCustomStudent ? 'bg-white text-ufersa-green-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Outro Convocado do SISU
            </button>
          </div>

          {formError && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              {formError}
            </div>
          )}

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
                        ? 'border-ufersa-green-600 bg-ufersa-green-50/70 ring-1 ring-ufersa-green-600'
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
                          className="text-ufersa-green-600 focus:ring-ufersa-green-500"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{sup.nome}</p>
                          <p className="text-xs text-slate-500">
                            Matrícula: <span className="font-mono">{sup.matricula}</span> • {sup.curso}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
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
                  aria-invalid={Boolean(errors.nome)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                    errors.nome
                      ? 'border-rose-400 focus:ring-rose-400'
                      : 'border-slate-300 focus:ring-ufersa-green-500'
                  }`}
                />
                {errors.nome && (
                  <p className="mt-1 text-xs font-semibold text-rose-600">{errors.nome}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Matrícula SIGAA:</label>
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    maxLength={10}
                    value={novoDiscente.matricula}
                    onChange={(e) =>
                      setNovoDiscente({
                        ...novoDiscente,
                        matricula: e.target.value.replace(/\D/g, ''),
                      })
                    }
                    placeholder="2026010099"
                    aria-invalid={Boolean(errors.matricula)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none font-mono ${
                      errors.matricula
                        ? 'border-rose-400 focus:ring-rose-400'
                        : 'border-slate-300 focus:ring-ufersa-green-500'
                    }`}
                  />
                  {errors.matricula && (
                    <p className="mt-1 text-xs font-semibold text-rose-600">{errors.matricula}</p>
                  )}
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Curso:</label>
                  <select
                    value={novoDiscente.curso}
                    onChange={(e) => setNovoDiscente({ ...novoDiscente, curso: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ufersa-green-500 focus:outline-none"
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
                  aria-invalid={Boolean(errors.email)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                    errors.email
                      ? 'border-rose-400 focus:ring-rose-400'
                      : 'border-slate-300 focus:ring-ufersa-green-500'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs font-semibold text-rose-600">{errors.email}</p>
                )}
                <p className="mt-1 text-xs text-slate-400">
                  Se deixado em branco, um e-mail institucional provisório será gerado automaticamente.
                </p>
              </div>
            </div>
          )}

          {/* Aviso informativo de fluxo */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">
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
              className="px-4 py-2 bg-ufersa-green-700 hover:bg-ufersa-green-800 text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition"
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

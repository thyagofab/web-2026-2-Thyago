import { useState } from 'react';
import { X, FileText, CheckCircle, Shield, AlertTriangle, Download, Printer } from 'lucide-react';

export default function TermoCompromissoModal({
  isOpen,
  onClose,
  morador,
  onAssinarTermo,
  onConfirmarPosse,
  currentRole,
}) {
  const [concordou, setConcordou] = useState(false);
  const [assinadoSucesso, setAssinadoSucesso] = useState(false);

  if (!isOpen || !morador) return null;

  const handleAssinar = () => {
    if (!concordou) return;
    onAssinarTermo(morador.id);
    setAssinadoSucesso(true);
    setTimeout(() => {
      setAssinadoSucesso(false);
      onClose();
    }, 1500);
  };

  const handlePosse = () => {
    onConfirmarPosse(morador.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        
        {/* Header Oficial UFERSA */}
        <div className="bg-ufersa-green-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-ufersa-green-800 flex items-center justify-center text-amber-400 font-bold border border-ufersa-green-700">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">
                Termo de Compromisso e Ocupação de Vaga
              </h3>
              <p className="text-xs text-ufersa-green-200">
                PROAE • Residência Universitária da UFERSA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-ufersa-green-200 hover:text-white hover:bg-ufersa-green-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Legal document view */}
        <div className="p-6 overflow-y-auto space-y-4 text-slate-700 text-sm leading-relaxed">
          
          {/* Document Header */}
          <div className="border-b border-slate-200 pb-4 text-center">
            <h4 className="font-serif font-black text-base text-slate-900 tracking-wide">
              UNIVERSIDADE FEDERAL RURAL DO SEMI-ÁRIDO - UFERSA
            </h4>
            <p className="text-xs font-serif text-slate-600">
              PRÓ-REITORIA DE ASSUNTOS ESTUDANTIS - PROAE
            </p>
            <p className="text-xs font-semibold text-ufersa-green-800 mt-1 uppercase">
              TERMO DE CONCESSÃO E COMPROMISSO DE MORADIA ESTUDANTIL
            </p>
          </div>

          {/* Dados do Alocado */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-500 font-medium">Morador Convocado:</span>{' '}
              <strong className="text-slate-900">{morador.nome}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Matrícula:</span>{' '}
              <strong className="text-slate-900 font-mono">{morador.matricula}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Curso:</span>{' '}
              <span className="text-slate-900 font-medium">{morador.curso}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Unidade Concedida:</span>{' '}
              <span className="text-slate-900 font-semibold text-ufersa-green-800">
                {morador.quarto} • {morador.camaId} ({morador.campusNome})
              </span>
            </div>
          </div>

          {/* Cláusulas do Termo e Normativas */}
          <div className="space-y-3 text-xs text-slate-600 bg-white p-2">
            <p className="font-semibold text-slate-800">
              Pelo presente instrumento, o discente compromete-se a cumprir integralmente as normas vigentes:
            </p>

            <div className="border-l-2 border-ufersa-green-600 pl-3 py-1 space-y-1">
              <strong className="text-slate-800 block">1. Exigência de Matrícula Mínima Regular:</strong>
              <p>O discente declara manter matrícula ativa em, no mínimo, 4 (quatro) componentes curriculares por semestre letivo regular.</p>
            </div>

            <div className="border-l-2 border-rose-500 pl-3 py-1 space-y-1">
              <strong className="text-slate-800 block">2. Critérios de Rendimento e Frequência:</strong>
              <p>Constitui motivo de desligamento formal a reprovação por falta em qualquer disciplina ou reprovação por média em mais de 2 (dois) componentes no semestre.</p>
            </div>

            <div className="border-l-2 border-amber-500 pl-3 py-1 space-y-1">
              <strong className="text-slate-800 block">3. Proibição Expressa de Trancamento de Matrícula:</strong>
              <p>É terminantemente proibido o trancamento total do semestre vigente para discentes residentes, ensejando a perda imediata do direito à vaga.</p>
            </div>

            <div className="border-l-2 border-indigo-500 pl-3 py-1 space-y-1">
              <strong className="text-slate-800 block">4. Prazo Máximo Regulamentar de Ocupação:</strong>
              <p>O período de permanência na vaga compreende a duração regular do curso acrescida de no máximo 2 períodos letivos ({morador.duracaoRegularSemestres + 2} semestres no total).</p>
            </div>

            <div className="border-l-2 border-amber-600 pl-3 py-1 space-y-1">
              <strong className="text-slate-800 block">5. Incompatibilidade com Outros Benefícios:</strong>
              <p>É expressamente vedada a cumulação da Moradia Estudantil com o Auxílio Transporte concedido pela assistência estudantil da UFERSA.</p>
            </div>

            <div className="border-l-2 border-ufersa-green-700 pl-3 py-1 space-y-1">
              <strong className="text-slate-800 block">6. Obrigatoriedade de Renovação e Recadastramento Semestral:</strong>
              <p>A não submissão do formulário de recadastramento no prazo estipulado resultará na perda da vaga e alteração imediata para status &quot;Desligamento Pendente&quot;.</p>
            </div>
          </div>

          {/* Status Atual do Documento */}
          <div className="p-3 rounded-xl border flex items-center justify-between bg-slate-50">
            <div>
              <span className="text-xs text-slate-500 block">Status da Assinatura:</span>
              {morador.termoAssinado ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-ufersa-green-700">
                  <CheckCircle className="w-4 h-4 text-ufersa-green-600" />
                  Assinado Eletronicamente (Autenticado SIGAA)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Aguardando Assinatura do Morador
                </span>
              )}
            </div>

            <div>
              <span className="text-xs text-slate-500 block">Posse Física da Vaga:</span>
              {morador.status === 'Ativo' ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-ufersa-green-700">
                  <CheckCircle className="w-4 h-4 text-ufersa-green-600" />
                  Posse Confirmada em {morador.dataPosse || '15/03/2022'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700">
                  Aguardando Registro da COAE
                </span>
              )}
            </div>
          </div>

          {/* Checkbox para assinatura pelo aluno */}
          {!morador.termoAssinado && currentRole === 'morador' && (
            <div className="p-3 bg-ufersa-green-50 rounded-xl border border-ufersa-green-200">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={concordou}
                  onChange={(e) => setConcordou(e.target.checked)}
                  className="mt-1 rounded border-ufersa-green-400 text-ufersa-green-600 focus:ring-ufersa-green-500"
                />
                <span className="text-xs text-ufersa-green-950">
                  Declaro que li, compreendi e concordo integralmente com todas as cláusulas do Termo de Concessão de Moradia Estudantil da UFERSA, sob pena de perda imediata do benefício.
                </span>
              </label>
            </div>
          )}

          {assinadoSucesso && (
            <div className="p-3 bg-ufersa-green-600 text-white rounded-xl text-center text-xs font-bold flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Termo assinado eletronicamente com sucesso! Hash criptográfico registrado.
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Baixar Minuta PDF
            </button>
            <button
              type="button"
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              Imprimir
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Fechar
            </button>

            {/* Aluno assina eletronicamente */}
            {!morador.termoAssinado && (
              <button
                onClick={handleAssinar}
                disabled={!concordou}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-1.5 transition ${
                  concordou
                    ? 'bg-ufersa-green-700 hover:bg-ufersa-green-800'
                    : 'bg-slate-400 cursor-not-allowed'
                }`}
              >
                <Shield className="w-4 h-4" />
                Assinar Eletronicamente
              </button>
            )}

            {/* Gestor valida a posse física */}
            {currentRole !== 'morador' && morador.termoAssinado && morador.status !== 'Ativo' && (
              <button
                onClick={handlePosse}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                Registrar Posse Física & Ativar Morador
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

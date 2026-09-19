import { useState } from 'react';
import {
  FileText,
  ClipboardList,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Shield,
  Send,
  Lock,
} from 'lucide-react';

export default function StudentPortalView({
  currentUser,
  demands,
  onOpenTermo,
  onOpenNewDemand,
}) {
  const [comprovanteEnviado, setComprovanteEnviado] = useState(false);
  const [componentesInput, setComponentesInput] = useState(currentUser?.componentesMatriculados || 5);
  const [recadastramentoEnviado, setRecadastramentoEnviado] = useState(false);
  const [confirmaInteresse, setConfirmaInteresse] = useState(true);

  // Demandas abertas pelo morador
  const minhasDemandas = demands.filter(
    (d) => d.moradorId === (currentUser?.id || 'morador-1')
  );

  const handleSubmeterComprovante = (e) => {
    e.preventDefault();
    setComprovanteEnviado(true);
    setTimeout(() => setComprovanteEnviado(false), 4000);
  };

  const handleSubmeterRecadastramento = (e) => {
    e.preventDefault();
    if (currentUser?.trancamentoRegistrado) {
      alert('Seu recadastramento está bloqueado devido a registro de trancamento de matrícula no semestre.');
      return;
    }
    setRecadastramentoEnviado(true);
    setTimeout(() => setRecadastramentoEnviado(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Banner de Identificação do Discente (Mobile-first card) */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white rounded-3xl p-6 shadow-md border border-emerald-700 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-2xl shadow-md border-2 border-emerald-400/40">
              {currentUser?.nome ? currentUser.nome.charAt(0) : 'T'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight">{currentUser?.nome || 'Thyago Fernandes'}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/40">
                  {currentUser?.status || 'Ativo'}
                </span>
              </div>
              <p className="text-xs text-emerald-200 mt-0.5">
                Matrícula: <span className="font-mono text-white">{currentUser?.matricula || '2022014589'}</span> • {currentUser?.curso || 'Ciência da Computação'}
              </p>
              <p className="text-xs text-amber-300 font-medium mt-1">
                {currentUser?.quarto || 'Quarto 101'} • Leito {currentUser?.camaId || 'Cama A'} ({currentUser?.campusNome || 'Campus Mossoró'})
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end text-xs text-emerald-200">
            <span>Permanência na Residência:</span>
            <strong className="text-base text-white font-bold">
              {currentUser?.tempoPermanenciaSemestres || 5} semestres
            </strong>
            <span className="text-[11px] text-amber-300">
              Limite Máximo: até sem. {currentUser?.duracaoRegularSemestres ? currentUser.duracaoRegularSemestres + 2 : 10}
            </span>
          </div>
        </div>
      </div>

      {/* Grid de Seções do Aluno */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Termo de Compromisso e Posse */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">Termo de Compromisso de Moradia</h2>
              </div>
              {currentUser?.termoAssinado ? (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Assinado Eletronicamente
                </span>
              ) : (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 animate-pulse">
                  Pendente de Assinatura
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              O Termo de Concessão estipula as normas de permanência na moradia universitária da UFERSA, limites de reprovação e trancamento.
            </p>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Status da Vaga:</span>
                <strong className="text-emerald-800 font-semibold">{currentUser?.status || 'Ativo'}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Data de Posse Física:</span>
                <span className="text-slate-800">{currentUser?.dataPosse || '15/03/2022'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Autenticação Digital:</span>
                <span className="font-mono text-[10px] text-slate-600">SHA256: 7f89a...bc41</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 flex items-center gap-2">
            <button
              onClick={() => onOpenTermo(currentUser)}
              className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
            >
              <FileText className="w-4 h-4" />
              {currentUser?.termoAssinado ? 'Visualizar Termo Assinado' : 'Assinar Termo Eletrônico'}
            </button>
          </div>
        </div>

        {/* Card 2: Comprovação Semestral */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">Comprovação de Matrícula Semestral</h2>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                Semestre 2026.1
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Anexe seu Comprovante de Matrícula do SIGAA para validação da matrícula mínima de 4 disciplinas e histórico sem reprovação por falta.
            </p>

            <form onSubmit={handleSubmeterComprovante} className="space-y-2.5">
              <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-700 font-medium">Disciplinas Matriculadas:</span>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={componentesInput}
                  onChange={(e) => setComponentesInput(Number(e.target.value))}
                  className="w-16 px-2 py-1 bg-white border border-slate-300 rounded text-center text-xs font-bold focus:outline-none"
                />
              </div>

              <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-3 text-center cursor-pointer transition bg-slate-50/50">
                <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <span className="text-xs font-semibold text-slate-700 block">
                  Clique para anexar PDF do Atestado de Matrícula (SIGAA)
                </span>
                <span className="text-[10px] text-slate-400">Tamanho máximo: 5 MB</span>
              </div>

              {comprovanteEnviado && (
                <div className="p-2 bg-emerald-100 text-emerald-900 rounded-lg text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Comprovante recebido! Enviado para auditoria da COAE.
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                Submeter Comprovante Semestral
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* Card 3: Recadastramento Semestral do Morador */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Formulário de Recadastramento Semestral 2026.1
              </h2>
              <p className="text-xs text-slate-500">
                Confirmação obrigatória do interesse de permanência na vaga da moradia estudantil.
              </p>
            </div>
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-300 self-start sm:self-auto">
            Prazo Final: 30/09/2026
          </span>
        </div>

        {currentUser?.trancamentoRegistrado ? (
          <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 text-rose-950 text-xs flex items-start gap-3">
            <Lock className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-sm font-bold text-rose-900 block">
                Recadastramento Bloqueado: Trancamento de Matrícula Identificado
              </strong>
              <p className="mt-1 leading-relaxed">
                Conforme as normativas vigentes, discentes com trancamento de matrícula no semestre corrente não podem solicitar a renovação da moradia estudantil. Procure a coordenação COAE do seu campus para orientações.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmeterRecadastramento} className="space-y-4 text-xs">
            <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Aviso de Obrigatoriedade de Renovação</span>
              </div>
              <p className="text-amber-900/80 leading-relaxed text-[11px]">
                O discente que não confirmar interesse e submeter as informações até o prazo final será automaticamente enquadrado em <strong>&quot;Desligamento Pendente&quot;</strong> e a vaga será destinada ao próximo candidato da lista de espera.
              </p>
            </div>

            <div className="space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmaInteresse}
                  onChange={(e) => setConfirmaInteresse(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-slate-800 font-semibold">
                  Declaro expressamente meu interesse em permanecer residindo na Residência Universitária da UFERSA durante o período letivo 2026.1.
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Previsão de Conclusão do Curso:</label>
                <input
                  type="text"
                  defaultValue="2026.2 (Semestre 8)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Telefone/WhatsApp para Contato:</label>
                <input
                  type="text"
                  defaultValue="(84) 99876-5432"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none font-mono"
                />
              </div>
            </div>

            {recadastramentoEnviado && (
              <div className="p-3 bg-emerald-600 text-white rounded-xl font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Recadastramento submetido com sucesso para a COAE/PROAE!
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={!confirmaInteresse}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-1.5 transition ${
                  confirmaInteresse ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-slate-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
                Enviar Recadastramento Semestral
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Card 4: Minhas Solicitações de Atendimento */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Minhas Solicitações de Atendimento
              </h2>
              <p className="text-xs text-slate-500">
                Canal permanente 24h para reparos no quarto, iluminação, encanamento e convivência.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenNewDemand}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
          >
            <Wrench className="w-3.5 h-3.5" />
            Nova Solicitação 24h
          </button>
        </div>

        {/* Tabela de chamados do morador */}
        <div className="space-y-3">
          {minhasDemandas.length > 0 ? (
            minhasDemandas.map((demanda) => (
              <div
                key={demanda.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[11px] font-bold text-emerald-800">
                      {demanda.id}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                      {demanda.tipo}
                    </span>
                    <span className="text-slate-400 text-[10px]">{demanda.dataAbertura}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-xs">{demanda.titulo}</h3>
                  <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">{demanda.descricao}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                      demanda.status === 'Resolvido'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : demanda.status === 'Em Atendimento'
                        ? 'bg-purple-100 text-purple-800 border-purple-300'
                        : 'bg-amber-100 text-amber-900 border-amber-300'
                    }`}
                  >
                    {demanda.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic text-center py-4">
              Você não possui nenhum chamado de atendimento aberto no momento.
            </p>
          )}
        </div>
      </div>

    </div>
  );
}

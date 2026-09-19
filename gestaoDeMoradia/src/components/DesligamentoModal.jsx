import { useState } from 'react';
import { X, UserX, ShieldAlert, Check } from 'lucide-react';

export default function DesligamentoModal({
  isOpen,
  onClose,
  morador,
  onConfirmDesligamento,
}) {
  const [motivo, setMotivo] = useState('Término Regular de Curso');
  const [justificativa, setJustificativa] = useState('');
  const [notificarSuplente, setNotificarSuplente] = useState(true);

  if (!isOpen || !morador) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirmDesligamento(morador.id, motivo, justificativa, notificarSuplente);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-rose-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-800 flex items-center justify-center text-rose-200">
              <UserX className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Processo de Desligamento Formal</h3>
              <p className="text-xs text-rose-200">Desocupação e Liberação Imediata de Leito</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-rose-200 hover:text-white hover:bg-rose-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Morador afetado */}
        <div className="bg-rose-50 border-b border-rose-100 p-4 text-xs">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-950 text-sm">{morador.nome}</p>
              <p className="text-rose-800">
                Matrícula: <span className="font-mono">{morador.matricula}</span> • {morador.curso}
              </p>
              <p className="text-rose-700 font-semibold mt-1">
                Vaga atual: {morador.quarto} • {morador.camaId} ({morador.campusNome})
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Motivo Regulamentar do Desligamento:
            </label>
            <select
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none text-slate-800 font-medium"
            >
              <option>Término Regular de Curso / Conclusão</option>
              <option>Rendimento Insuficiente (Reprovação por Falta ou Média)</option>
              <option>Matrícula Insuficiente no Semestre (Menos de 4 disciplinas)</option>
              <option>Trancamento de Matrícula não Autorizado</option>
              <option>Tempo Máximo Regulamentar Excedido</option>
              <option>Inadimplência no Recadastramento Semestral</option>
              <option>Abandono de Vaga ou Desistência Voluntária</option>
              <option>Incompatibilidade de Benefício (Acúmulo com Auxílio Transporte)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Despacho / Parecer do Gestor (Justificativa):
            </label>
            <textarea
              rows={3}
              required
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              placeholder="Descreva o processo administrativo, verificação de notas/frequência no SIGAA ou dados do encerramento..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none text-slate-800"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={notificarSuplente}
                onChange={(e) => setNotificarSuplente(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
              />
              <span className="text-slate-700">
                <strong>Liberar vaga imediatamente para a lista de espera:</strong> Alterar status da cama para <em>&quot;Livre&quot;</em> e disponibilizá-la para alocação do próximo discente suplente classificado no edital.
              </span>
            </label>
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
              className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition"
            >
              <Check className="w-4 h-4" />
              Confirmar Desligamento & Liberar Vaga
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

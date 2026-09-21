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
  const [confirmText, setConfirmText] = useState('');
  const [errors, setErrors] = useState({});

  if (!isOpen || !morador) return null;

  const primeiroNome = morador.nome.trim().split(' ')[0];

  const handleClose = () => {
    setConfirmText('');
    setErrors({});
    setJustificativa('');
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!justificativa.trim()) {
      newErrors.justificativa = 'Descreva o despacho/parecer que justifica o desligamento.';
    }
    if (confirmText.trim().toLowerCase() !== primeiroNome.toLowerCase()) {
      newErrors.confirmText = `Digite "${primeiroNome}" para confirmar esta ação irreversível.`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onConfirmDesligamento(morador.id, motivo, justificativa, notificarSuplente);
    setConfirmText('');
    setErrors({});
    setJustificativa('');
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
          <button onClick={handleClose} className="p-1 rounded-lg text-rose-200 hover:text-white hover:bg-rose-800">
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          
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
              aria-invalid={Boolean(errors.justificativa)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none text-slate-800 ${
                errors.justificativa ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-300 focus:ring-rose-500'
              }`}
            />
            {errors.justificativa && (
              <p className="mt-1 text-xs font-semibold text-rose-600">{errors.justificativa}</p>
            )}
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

          {/* Confirmação Explícita da Ação Irreversível */}
          <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
            <label className="block font-bold text-rose-900 mb-1.5">
              Esta ação é irreversível. Para confirmar, digite o primeiro nome do discente (
              <span className="font-mono">{primeiroNome}</span>):
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={primeiroNome}
              aria-invalid={Boolean(errors.confirmText)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none font-mono ${
                errors.confirmText ? 'border-rose-400 focus:ring-rose-400' : 'border-rose-300 focus:ring-rose-500'
              }`}
            />
            {errors.confirmText && (
              <p className="mt-1 text-xs font-semibold text-rose-600">{errors.confirmText}</p>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={confirmText.trim().toLowerCase() !== primeiroNome.toLowerCase()}
              className={`px-4 py-2 text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition ${
                confirmText.trim().toLowerCase() === primeiroNome.toLowerCase()
                  ? 'bg-rose-700 hover:bg-rose-800'
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
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

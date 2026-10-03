import { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { DEMO_ACCOUNTS } from '../context/authConstants';

function DemoAccess({ username, onSelect }) {
  return (
    <div className="mt-7 border-t border-slate-200 pt-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
          <Sparkles className="h-3.5 w-3.5 text-blue-600" />
          Acesso rápido
        </span>
        <span className="text-[11px] text-slate-400">Ambiente de demonstração</span>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {DEMO_ACCOUNTS.map((account) => (
          <button
            key={account.role}
            type="button"
            onClick={() => onSelect(account)}
            className={`rounded-lg border p-2.5 text-left text-xs transition ${
              username === account.email
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/50'
            }`}
          >
            <span className="block truncate font-bold text-slate-800">{account.roleLabel.split(' ')[0]}</span>
            <span className="block truncate text-[10px] text-slate-500">{account.email.split('@')[0]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function LoginView({ onLoginSuccess }) {
  const { login, loading, authError, challenge, completeNewPassword } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError('');
    if (!username.trim() || !password) {
      setLocalError('Informe seu e-mail institucional e sua senha.');
      return;
    }
    const result = await login(username, password);
    if (result.success) onLoginSuccess?.(result.user);
  };

  const handleChallengeSubmit = async (event) => {
    event.preventDefault();
    setLocalError('');
    if (newPassword.length < 8) {
      setLocalError('A nova senha deve ter no mínimo 8 caracteres.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setLocalError('As senhas não coincidem.');
      return;
    }
    const result = await completeNewPassword(newPassword);
    if (result.success) onLoginSuccess?.(result.user);
  };

  const selectDemo = (account) => {
    setUsername(account.email);
    setPassword(account.password);
    setLocalError('');
  };

  const feedback = localError || authError;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="flex w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <aside className="relative hidden min-h-[600px] w-1/2 overflow-hidden border-r border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-100 md:block">
          <div className="absolute inset-0 opacity-70 [background-image:radial-gradient(#60a5fa_1px,transparent_1px)] [background-size:18px_18px]" />
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-blue-300/30 blur-3xl" />
          <div className="absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-indigo-300/30 blur-3xl" />
          <div className="relative z-10 flex h-full flex-col items-center justify-center p-10 text-center">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-200">
              <Building2 className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text">
              SGM UFERSA
            </h1>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-600">
              Sistema de Gestão de Moradias Estudantis
            </p>
            <div className="mt-8 flex items-center gap-2 rounded-full border border-blue-200 bg-white/70 px-4 py-2 text-xs font-semibold text-blue-700">
              <ShieldCheck className="h-4 w-4" />
              Acesso seguro para a comunidade UFERSA
            </div>
          </div>
        </aside>

        <main className="w-full bg-white p-7 sm:p-10 md:w-1/2">
          {challenge?.type === 'NEW_PASSWORD_REQUIRED' ? (
            <>
              <div className="mb-7">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <KeyRound className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">Defina sua senha</h2>
                <p className="mt-1 text-sm text-slate-500">Conclua seu primeiro acesso para entrar na plataforma.</p>
              </div>
              <form onSubmit={handleChallengeSubmit} className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">
                  Nova senha
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    placeholder="Mínimo de 8 caracteres"
                    required
                    className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Confirmar senha
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(event) => setConfirmNewPassword(event.target.value)}
                    placeholder="Repita sua senha"
                    required
                    className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                {feedback && <FeedbackMessage message={feedback} />}
                <SubmitButton loading={loading} label="Definir senha e entrar" />
              </form>
            </>
          ) : (
            <>
              <div className="mb-7">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-200">
                  <Lock className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">Bem-vindo de volta</h2>
                <p className="mt-1 text-sm text-slate-500">Entre para acessar sua área de gestão.</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <label className="block text-sm font-medium text-slate-700">
                  E-mail institucional
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      placeholder="usuario@ufersa.edu.br"
                      required
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Senha
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Digite sua senha"
                      required
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600"
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </label>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => window.alert('Solicite a redefinição de senha à PROAE ou COAE do seu campus.')}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                {feedback && <FeedbackMessage message={feedback} />}
                <SubmitButton loading={loading} label="Entrar na plataforma" />
              </form>
              <DemoAccess username={username} onSelect={selectDemo} />
            </>
          )}
          <p className="mt-8 text-center text-xs text-slate-400">UFERSA · PROAE / COAE · Ambiente institucional</p>
        </main>
      </div>
    </div>
  );
}

function FeedbackMessage({ message }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
      <AlertCircle className="h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function SubmitButton({ loading, label }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-200 transition hover:from-blue-600 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : label}
      {!loading && <ArrowRight className="h-4 w-4" />}
    </button>
  );
}

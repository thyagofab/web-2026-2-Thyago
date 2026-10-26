import { useEffect, useRef, useState } from 'react';
import { Send, Bot, User, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { createChatSocket } from '../services/chatSocket';

export default function ChatView() {
  const { authTokens } = useAuth();
  const [status, setStatus] = useState('connecting'); // connecting | open | closed
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [waiting, setWaiting] = useState(false);
  const socketRef = useRef(null);
  const endRef = useRef(null);

  const idToken = authTokens?.provider !== 'google' ? authTokens?.idToken : null;

  useEffect(() => {
    if (!idToken) return undefined;
    const socket = createChatSocket(idToken, {
      onOpen: () => setStatus('open'),
      onClose: () => setStatus('closed'),
      onError: () => setStatus('closed'),
      onMessage: (data) => {
        // "typing": Lambda avisando que está consultando o Gemini.
        if (data?.type === 'typing') return setWaiting(true);
        // Resposta síncrona do API Gateway (limite de 29s da integração).
        // A resposta real ainda chega depois via PostToConnection.
        if (!data?.type && /timed out/i.test(data?.message || '')) return;
        setWaiting(false);
        setMessages((prev) => [
          ...prev,
          { from: 'bot', text: data.message, error: data.type === 'error' },
        ]);
      },
    });
    socketRef.current = socket;
    return () => socket.close();
  }, [idToken]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, waiting]);

  const handleSend = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || status !== 'open') return;
    socketRef.current.send(text);
    setMessages((prev) => [...prev, { from: 'user', text }]);
    setInput('');
    setWaiting(true);
  };

  if (!idToken) {
    return (
      <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
        O chat requer login com e-mail e senha (Amazon Cognito).
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-white border border-slate-200 rounded-2xl shadow-xs">
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-ufersa-blue-700" />
          <h2 className="font-bold text-slate-800">Assistente Virtual (Gemini)</h2>
        </div>
        <span
          className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
            status === 'open'
              ? 'bg-green-100 text-green-800'
              : status === 'connecting'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-rose-100 text-rose-800'
          }`}
        >
          {status === 'open' ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {status === 'open' ? 'Conectado' : status === 'connecting' ? 'Conectando...' : 'Desconectado'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-slate-400 mt-10">Envie uma pergunta para começar.</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.from === 'bot' && <Bot className="w-6 h-6 text-ufersa-blue-700 shrink-0" />}
            <div
              className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                m.from === 'user'
                  ? 'bg-ufersa-blue-700 text-white'
                  : m.error
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'bg-slate-100 text-slate-800'
              }`}
            >
              {m.text}
            </div>
            {m.from === 'user' && <User className="w-6 h-6 text-slate-500 shrink-0" />}
          </div>
        ))}
        {waiting && (
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Gemini está pensando...
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 p-4 border-t border-slate-200">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite sua pergunta..."
          className="flex-1 px-4 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ufersa-blue-500"
        />
        <button
          type="submit"
          disabled={status !== 'open' || !input.trim()}
          className="px-4 py-2 bg-ufersa-blue-700 text-white rounded-xl disabled:opacity-50 flex items-center gap-1"
        >
          <Send className="w-4 h-4" /> Enviar
        </button>
      </form>
    </div>
  );
}

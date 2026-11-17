import { useEffect, useRef, useState } from 'react';
import { Send, Bot, User, Wifi, WifiOff, Loader2, Image as ImageIcon, X, UploadCloud } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { createChatSocket } from '../services/chatSocket';
import { uploadProfileImage } from '../services/profileService';

export default function ChatView() {
  const { authTokens } = useAuth();
  const [status, setStatus] = useState('connecting'); // connecting | open | closed
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [waiting, setWaiting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const socketRef = useRef(null);
  const endRef = useRef(null);
  const fileInputRef = useRef(null);

  const idToken = authTokens?.provider !== 'google' ? authTokens?.idToken : null;

  useEffect(() => {
    if (!idToken) return undefined;
    const socket = createChatSocket(idToken, {
      onOpen: () => setStatus('open'),
      onClose: () => setStatus('closed'),
      onError: () => setStatus('closed'),
      onMessage: (data) => {
        if (data?.type === 'typing') return setWaiting(true);
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
  }, [messages, waiting, uploadingImage]);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (JPG, PNG, WebP).');
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text && !selectedImage) return;

    // Se houver imagem selecionada, faz o upload para a rota /profile usando fetch e token JWT
    if (selectedImage) {
      setUploadingImage(true);
      try {
        const res = await uploadProfileImage({
          file: selectedImage,
          token: idToken,
        });

        // Adiciona a imagem enviada na tela do chat
        setMessages((prev) => [
          ...prev,
          {
            from: 'user',
            text: text || 'Foto enviada com sucesso para /profile:',
            imageUrl: res?.imageUrl || imagePreview,
          },
        ]);

        if (socketRef.current && status === 'open') {
          const msgToSend = text
            ? `${text} [Foto enviada para o perfil]`
            : 'Enviei uma foto de perfil no sistema.';
          socketRef.current.send(msgToSend);
          setWaiting(true);
        }

        handleRemoveImage();
        setInput('');
      } catch (err) {
        console.error('Erro ao enviar imagem no chat:', err);
        setMessages((prev) => [
          ...prev,
          {
            from: 'bot',
            text: `Erro ao enviar imagem para /profile: ${err.message}`,
            error: true,
          },
        ]);
      } finally {
        setUploadingImage(false);
      }
      return;
    }

    // Envio apenas de texto normal via WebSocket
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
      {/* Header */}
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

      {/* Messages Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-slate-400 mt-10">
            Envie uma pergunta ou clique no ícone de imagem para enviar uma foto para o perfil.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.from === 'bot' && <Bot className="w-6 h-6 text-ufersa-blue-700 shrink-0 mt-1" />}
            <div
              className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${
                m.from === 'user'
                  ? 'bg-ufersa-blue-700 text-white'
                  : m.error
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'bg-slate-100 text-slate-800'
              }`}
            >
              {m.imageUrl && (
                <div className="mb-2 rounded-xl overflow-hidden border border-white/20 bg-black/10">
                  <img
                    src={m.imageUrl}
                    alt="Imagem enviada"
                    className="max-h-56 w-auto max-w-full rounded-xl object-cover"
                  />
                </div>
              )}
              {m.text && <p>{m.text}</p>}
            </div>
            {m.from === 'user' && <User className="w-6 h-6 text-slate-500 shrink-0 mt-1" />}
          </div>
        ))}

        {uploadingImage && (
          <div className="flex items-center gap-2 text-slate-500 text-sm justify-end">
            <Loader2 className="w-4 h-4 animate-spin text-ufersa-blue-700" />
            <span>Enviando imagem para S3 (/profile)...</span>
          </div>
        )}

        {waiting && (
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Gemini está pensando...
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Preview da Imagem Selecionada */}
      {imagePreview && (
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-300">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700 truncate max-w-xs">{selectedImage?.name}</p>
              <p className="text-[10px] text-slate-400">Pronto para envio para o S3 via rota /profile</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemoveImage}
            className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
            title="Remover imagem"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSend} className="flex items-center gap-2 p-4 border-t border-slate-200">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
          id="chat-image-input"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingImage}
          className="p-2.5 text-slate-500 hover:text-ufersa-blue-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          title="Anexar imagem (Upload S3 /profile)"
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={selectedImage ? 'Adicione uma mensagem com a imagem...' : 'Digite sua pergunta...'}
          className="flex-1 px-4 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ufersa-blue-500"
        />

        <button
          type="submit"
          disabled={uploadingImage || (!input.trim() && !selectedImage) || (status !== 'open' && !selectedImage)}
          className="px-4 py-2 bg-ufersa-blue-700 text-white rounded-xl disabled:opacity-50 flex items-center gap-1 cursor-pointer font-medium text-sm transition hover:bg-ufersa-blue-800"
        >
          {uploadingImage ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Enviando...</span>
            </>
          ) : selectedImage ? (
            <>
              <UploadCloud className="w-4 h-4" />
              <span>Enviar Foto</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Enviar</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

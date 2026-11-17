import { useState, useEffect, useRef } from 'react';
import { X, Upload, Image as ImageIcon, CheckCircle2, AlertCircle, RefreshCw, Key, ShieldCheck } from 'lucide-react';
import { uploadProfileImage, getProfileImage } from '../services/profileService';
import { useAuth } from '../context/useAuth';

export default function ProfileModal({ isOpen, onClose }) {
  const { currentUser, authTokens } = useAuth();
  const token = authTokens?.idToken || authTokens?.accessToken || '';

  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingImage, setFetchingImage] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [customApiUrl, setCustomApiUrl] = useState(
    import.meta.env?.VITE_API_GATEWAY_URL || ''
  );
  const [showConfig, setShowConfig] = useState(false);

  const fileInputRef = useRef(null);

  // Busca a imagem atual no S3 via GET /profile ao abrir o modal
  useEffect(() => {
    if (isOpen && (customApiUrl || import.meta.env?.VITE_API_GATEWAY_URL)) {
      loadProfileImage();
    }
  }, [isOpen, customApiUrl]);

  const loadProfileImage = async () => {
    if (!token && !currentUser?.isDemo) return;
    setFetchingImage(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const data = await getProfileImage({ token, customUrl: customApiUrl });
      if (data?.imageUrl) {
        setCurrentImageUrl(data.imageUrl);
      } else {
        setCurrentImageUrl(null);
      }
    } catch (err) {
      console.warn('Erro ao buscar imagem de perfil:', err);
      // Se não encontrou ou deu erro de configuração, não trava o modal
    } finally {
      setFetchingImage(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMessage({ type: 'error', text: 'Selecione um arquivo de imagem válido (PNG, JPEG, WebP).' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setStatusMessage({ type: 'error', text: 'A imagem deve ter no máximo 5MB.' });
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setStatusMessage({ type: '', text: '' });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setStatusMessage({ type: 'error', text: 'Selecione uma imagem para enviar.' });
      return;
    }

    setLoading(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const res = await uploadProfileImage({
        file: selectedFile,
        token,
        customUrl: customApiUrl,
      });

      setStatusMessage({
        type: 'success',
        text: res.message || 'Imagem enviada com sucesso para o bucket S3!',
      });

      if (res.imageUrl) {
        setCurrentImageUrl(res.imageUrl);
      } else {
        // Recarrega via GET /profile
        await loadProfileImage();
      }

      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('Falha no upload:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Erro ao enviar a imagem para o API Gateway.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-ufersa-blue-900 text-white px-6 py-5 flex items-center justify-between border-b border-ufersa-blue-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-ufersa-blue-800 rounded-xl">
              <ImageIcon className="w-5 h-5 text-ufersa-green-400" />
            </div>
            <div>
              <h3 className="font-bold text-base">Foto de Perfil (/profile)</h3>
              <p className="text-xs text-ufersa-blue-200">Amazon S3 • API Gateway • Cognito JWT</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ufersa-blue-200 hover:text-white hover:bg-ufersa-blue-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Informações do Usuário e Status do Token JWT */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800">{currentUser?.nome || 'Usuário Conectado'}</p>
              <p className="text-[11px] text-slate-500">{currentUser?.email || 'email@ufersa.edu.br'}</p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>JWT Cognito</span>
            </div>
          </div>

          {/* Área da Imagem Atual (Carregada via GET /profile) */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-100 rounded-2xl border border-slate-200/80">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-slate-200 flex items-center justify-center">
              {previewUrl ? (
                <img src={previewUrl} alt="Pré-visualização" className="w-full h-full object-cover" />
              ) : currentImageUrl ? (
                <img src={currentImageUrl} alt="Foto de Perfil" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-slate-400">
                  <ImageIcon className="w-10 h-10 mb-1" />
                  <span className="text-[10px]">Sem foto</span>
                </div>
              )}

              {fetchingImage && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={loadProfileImage}
                disabled={fetchingImage}
                className="text-xs text-ufersa-blue-700 hover:text-ufersa-blue-900 font-medium flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${fetchingImage ? 'animate-spin' : ''}`} />
                <span>Atualizar via GET /profile</span>
              </button>
            </div>
          </div>

          {/* Formulário de Envio (POST via fetch) */}
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Selecionar Nova Imagem (POST /profile)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-ufersa-blue-50 file:text-ufersa-blue-700 hover:file:bg-ufersa-blue-100 cursor-pointer border border-slate-300 rounded-xl p-1.5"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Formatos aceitos: JPG, PNG, WEBP (máx. 5MB). Enviado via fetch() com método POST.
              </p>
            </div>

            {/* Mensagens de Feedback */}
            {statusMessage.text && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                )}
                <span className="break-all">{statusMessage.text}</span>
              </div>
            )}

            {/* Configuração de Endpoint API Gateway */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowConfig(!showConfig)}
                className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
              >
                <Key className="w-3.5 h-3.5" />
                <span>{showConfig ? 'Ocultar URL da API' : 'Configurar URL do API Gateway'}</span>
              </button>

              {showConfig && (
                <div className="mt-2 space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      URL Base do API Gateway:
                    </label>
                    <input
                      type="text"
                      placeholder="https://abcdef123.execute-api.us-east-1.amazonaws.com/prod"
                      value={customApiUrl}
                      onChange={(e) => setCustomApiUrl(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono bg-white focus:outline-none focus:ring-1 focus:ring-ufersa-blue-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Você pode definir <code className="bg-slate-200 px-1 rounded">VITE_API_GATEWAY_URL</code> no arquivo <code className="bg-slate-200 px-1 rounded">.env</code>.
                    </p>
                  </div>

                  <div className="pt-1">
                    <span className="text-[11px] text-slate-500">Token JWT Atual:</span>
                    <p className="font-mono text-[10px] text-slate-600 truncate bg-slate-200/70 p-1.5 rounded mt-0.5">
                      {token ? `${token.substring(0, 30)}...${token.slice(-15)}` : 'Nenhum token JWT disponível (faça login com Cognito)'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Ações */}
            <div className="flex items-center justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Fechar
              </button>
              <button
                type="submit"
                disabled={loading || !selectedFile}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-slate-950 bg-ufersa-green-400 hover:bg-ufersa-green-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Enviar Foto (POST)</span>
                  </>
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}

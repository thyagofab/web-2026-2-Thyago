import { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Key,
  ShieldCheck,
  Database,
  HardDrive,
  User,
  School,
  IdCard,
  BookOpen,
  MapPin,
} from 'lucide-react';
import { updateProfile, getProfileImage } from '../services/profileService';
import { useAuth } from '../context/useAuth';

export default function ProfileModal({ isOpen, onClose }) {
  const { currentUser, authTokens, setCurrentUser } = useAuth();
  const token = authTokens?.idToken || authTokens?.accessToken || '';

  // Estados dos dados cadastrais
  const [formData, setFormData] = useState({
    nome: currentUser?.nome || 'Thyago Fabricio',
    email: currentUser?.email || 'thyago.costa@alunos.ufersa.edu.br',
    campus: currentUser?.campus || 'mossoro',
    matricula: currentUser?.matricula || '2026.2-RU',
    curso: currentUser?.curso || 'Engenharia de Software',
    role: currentUser?.role || 'morador',
    bio: currentUser?.bio || 'Discente residente na Moradia Universitária da UFERSA',
  });

  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [dynamoItem, setDynamoItem] = useState(null);
  const [customApiUrl, setCustomApiUrl] = useState(
    import.meta.env?.VITE_API_GATEWAY_URL || 'https://b8vjk5qdkj.execute-api.us-east-1.amazonaws.com/prod'
  );
  const [showConfig, setShowConfig] = useState(false);

  const fileInputRef = useRef(null);

  // Busca dados cadastrais do DynamoDB e foto do S3 via GET /profile ao abrir
  useEffect(() => {
    if (isOpen) {
      loadProfileData();
    }
  }, [isOpen]);

  const loadProfileData = async () => {
    if (!token && !currentUser?.isDemo) return;
    setFetchingData(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const data = await getProfileImage({ token, customUrl: customApiUrl });
      if (data?.user) {
        setFormData((prev) => ({
          ...prev,
          nome: data.user.nome || prev.nome,
          email: data.user.email || prev.email,
          campus: data.user.campus || prev.campus,
          matricula: data.user.matricula || prev.matricula,
          curso: data.user.curso || prev.curso,
          role: data.user.role || prev.role,
          bio: data.user.bio || prev.bio,
        }));
        setDynamoItem(data.user);
      }
      if (data?.imageUrl) {
        setCurrentImageUrl(data.imageUrl);
      }
    } catch (err) {
      console.warn('Aviso ao carregar perfil:', err);
    } finally {
      setFetchingData(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  // Operação PUT /profile: Atualiza no DynamoDB e no S3
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const res = await updateProfile({
        userData: formData,
        file: selectedFile,
        token,
        customUrl: customApiUrl,
      });

      setStatusMessage({
        type: 'success',
        text: res.message || 'Dados e foto de perfil atualizados com sucesso no DynamoDB e S3!',
      });

      if (res.user) {
        setDynamoItem(res.user);
        if (res.user.profileImageUrl) {
          setCurrentImageUrl(res.user.profileImageUrl);
        }
        // Atualiza o estado do usuário logado no app
        if (setCurrentUser) {
          setCurrentUser((prev) => ({
            ...prev,
            nome: res.user.nome,
            campus: res.user.campus,
            matricula: res.user.matricula,
          }));
        }
      }

      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('Falha ao atualizar perfil com PUT:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Erro ao atualizar dados cadastrais no DynamoDB / S3.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-ufersa-blue-900 text-white px-6 py-4 flex items-center justify-between border-b border-ufersa-blue-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-ufersa-blue-800 rounded-xl">
              <User className="w-5 h-5 text-ufersa-green-400" />
            </div>
            <div>
              <h3 className="font-bold text-base">Perfil do Usuário (/profile)</h3>
              <p className="text-xs text-ufersa-blue-200">Operação PUT • S3 + DynamoDB • Cognito JWT</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ufersa-blue-200 hover:text-white hover:bg-ufersa-blue-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body com Scroll */}
        <div className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          
          {/* Badges de Identificação da Infraestrutura AWS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-2.5 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-amber-700 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block">S3 Bucket</span>
                <span className="text-xs font-mono font-semibold text-slate-800 truncate block">thyago-profile-2026.2</span>
              </div>
            </div>

            <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-2.5 flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-700 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-indigo-800 tracking-wider block">DynamoDB</span>
                <span className="text-xs font-mono font-semibold text-slate-800 truncate block">Thyago-message-2026.2</span>
              </div>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-2.5 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">Segurança</span>
                <span className="text-xs font-semibold text-slate-800 truncate block">Cognito JWT</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            
            {/* Foto de Perfil (S3) */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-5">
              <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-md bg-slate-200 flex items-center justify-center shrink-0">
                {previewUrl ? (
                  <img src={previewUrl} alt="Nova foto selecionada" className="w-full h-full object-cover" />
                ) : currentImageUrl ? (
                  <img src={currentImageUrl} alt="Foto salva no S3" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-slate-400">
                    <ImageIcon className="w-8 h-8 mb-1" />
                    <span className="text-[10px]">Sem foto</span>
                  </div>
                )}

                {fetchingData && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 text-white animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2 text-center sm:text-left">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Foto de Perfil no S3</h4>
                  <p className="text-xs text-slate-500">
                    Foto customizada gravada no bucket <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">thyago-profile-2026.2</code> (diferente da foto federada do Google).
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="profile-file-input"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 bg-ufersa-blue-700 hover:bg-ufersa-blue-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer transition shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Escolher Nova Foto</span>
                  </button>

                  <button
                    type="button"
                    onClick={loadProfileData}
                    disabled={fetchingData}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium rounded-xl flex items-center gap-1 cursor-pointer transition"
                  >
                    <RefreshCw className={`w-3 h-3 ${fetchingData ? 'animate-spin' : ''}`} />
                    <span>Recarregar S3/Dynamo</span>
                  </button>
                </div>

                {selectedFile && (
                  <p className="text-[11px] text-emerald-600 font-medium">
                    ✓ Arquivo selecionado: <strong>{selectedFile.name}</strong> (será enviado via PUT)
                  </p>
                )}
              </div>
            </div>

            {/* Dados Cadastrais (DynamoDB) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <Database className="w-4 h-4 text-ufersa-blue-700" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Dados Cadastrais (Tabela DynamoDB: Thyago-message-2026.2)
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                {/* Nome */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" /> Nome Completo:
                  </label>
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-ufersa-blue-500 font-medium text-slate-800"
                    placeholder="Seu nome completo"
                    required
                  />
                </div>

                {/* E-mail */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">E-mail Institucional:</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-600 rounded-xl focus:outline-none font-medium"
                    placeholder="email@ufersa.edu.br"
                  />
                </div>

                {/* Campus */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> Campus Universitário:
                  </label>
                  <select
                    name="campus"
                    value={formData.campus}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-ufersa-blue-500 font-medium text-slate-800 bg-white"
                  >
                    <option value="mossoro">Campus Leste / Oeste (Mossoró)</option>
                    <option value="angicos">Campus Angicos</option>
                    <option value="caraubas">Campus Caraúbas</option>
                    <option value="pau_dos_ferros">Campus Pau dos Ferros</option>
                  </select>
                </div>

                {/* Matrícula */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <IdCard className="w-3.5 h-3.5 text-slate-400" /> Matrícula Acadêmica:
                  </label>
                  <input
                    type="text"
                    name="matricula"
                    value={formData.matricula}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-ufersa-blue-500 font-medium text-slate-800"
                    placeholder="Ex: 2026.2-RU"
                  />
                </div>

                {/* Curso */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" /> Curso / Graduação:
                  </label>
                  <input
                    type="text"
                    name="curso"
                    value={formData.curso}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-ufersa-blue-500 font-medium text-slate-800"
                    placeholder="Ex: Engenharia de Software"
                  />
                </div>

                {/* Função / Papel */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <School className="w-3.5 h-3.5 text-slate-400" /> Papel no Sistema:
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-ufersa-blue-500 font-medium text-slate-800 bg-white"
                  >
                    <option value="morador">Morador (Discente Residente)</option>
                    <option value="gestor_coae">Gestor Local (COAE)</option>
                    <option value="gestor_proae">Gestor Central (PROAE)</option>
                  </select>
                </div>

                {/* Biografia / Descrição */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Biografia / Apresentação:</label>
                  <textarea
                    name="bio"
                    rows={2}
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-ufersa-blue-500 font-medium text-slate-800 resize-none"
                    placeholder="Informações adicionais do morador..."
                  />
                </div>
              </div>
            </div>

            {/* Mensagem de Feedback */}
            {statusMessage.text && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
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
                <div>
                  <p className="font-semibold">{statusMessage.text}</p>
                  {dynamoItem?.updatedAt && (
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      Item persistido no DynamoDB em: {new Date(dynamoItem.updatedAt).toLocaleString('pt-BR')}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Exibição dos Dados do DynamoDB em JSON (Para conferência / print do professor) */}
            {dynamoItem && (
              <div className="p-3 bg-slate-900 text-slate-200 rounded-xl text-[11px] font-mono space-y-1">
                <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1">
                  <span>Itens cadastrados na tabela: Thyago-message-2026.2</span>
                  <span className="text-emerald-400">Status: Sincronizado</span>
                </div>
                <div className="overflow-x-auto max-h-32 text-[10px] text-emerald-300 pt-1">
                  <pre>{JSON.stringify(dynamoItem, null, 2)}</pre>
                </div>
              </div>
            )}

            {/* Seção de Configuração do Endpoint */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowConfig(!showConfig)}
                className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
              >
                <Key className="w-3.5 h-3.5" />
                <span>{showConfig ? 'Ocultar Detalhes API' : 'Ver URL API Gateway / Token JWT'}</span>
              </button>

              <span className="text-[11px] text-slate-400">Método HTTP: <strong>PUT /profile</strong></span>
            </div>

            {showConfig && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Endpoint API Gateway (REST):
                  </label>
                  <input
                    type="text"
                    value={customApiUrl}
                    onChange={(e) => setCustomApiUrl(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono bg-white"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">Token JWT Cognito:</span>
                  <p className="font-mono text-[10px] text-slate-600 truncate bg-slate-200 p-1 rounded mt-0.5">
                    {token ? `${token.substring(0, 35)}...${token.slice(-20)}` : 'Nenhum token JWT disponível'}
                  </p>
                </div>
              </div>
            )}

            {/* Ações */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-slate-950 bg-ufersa-green-400 hover:bg-ufersa-green-300 disabled:opacity-50 rounded-xl shadow-xs transition cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Salvando via PUT...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Salvar Alterações (PUT /profile)</span>
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

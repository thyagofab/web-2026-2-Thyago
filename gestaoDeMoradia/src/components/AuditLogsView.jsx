import { useState } from 'react';
import { Search, Database, User } from 'lucide-react';

export default function AuditLogsView({ logs }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('todas');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.tipoAcao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.detalhes.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (filterAction !== 'todas' && !log.tipoAcao.toLowerCase().includes(filterAction.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Trilha de Auditoria e Operações
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
              Registro de Auditoria
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Histórico detalhado de ações administrativas críticas: alocações de vagas, homologações acadêmicas e desligamentos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-ufersa-green-50 text-ufersa-green-800 border border-ufersa-green-200 px-3 py-1.5 rounded-xl font-mono font-medium flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5" />
            Base de Dados Centralizada • Auditoria Ativa
          </span>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por usuário, ação ou detalhe..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-ufersa-green-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Tipo de Ação:</span>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="todas">Todas as Ações</option>
            <option value="alocação">Alocações de Vagas</option>
            <option value="rendimento">Alertas Acadêmicos</option>
            <option value="desligamento">Desligamentos</option>
            <option value="termo">Assinaturas de Termo</option>
            <option value="campanha">Campanhas de Recadastramento</option>
          </select>
        </div>
      </div>

      {/* Tabela de Logs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-4 py-3.5">ID / Data & Hora</th>
                <th className="px-3 py-3.5">Usuário Responsável</th>
                <th className="px-3 py-3.5">Tipo de Ação</th>
                <th className="px-4 py-3.5">Detalhamento da Operação</th>
                <th className="px-3 py-3.5">Escopo / Campus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-4 py-3">
                    <span className="font-mono text-ufersa-green-800 font-bold block">{log.id}</span>
                    <span className="text-slate-500 text-xs font-mono">{log.timestamp}</span>
                  </td>

                  <td className="px-3 py-3 font-semibold text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {log.usuario}
                    </span>
                  </td>

                  <td className="px-3 py-3">
                    <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-xs">
                      {log.tipoAcao}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-slate-600 leading-relaxed max-w-md">
                    {log.detalhes}
                  </td>

                  <td className="px-3 py-3 text-slate-500 font-medium">
                    {log.campus}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

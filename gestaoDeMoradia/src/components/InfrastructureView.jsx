import { useState } from 'react';
import {
  Bed,
  Filter,
  UserPlus,
  UserX,
  FileText,
} from 'lucide-react';

export default function InfrastructureView({
  rooms,
  residents,
  selectedCampus,
  onOpenAllocate,
  onOpenTermo,
  onOpenDesligamento,
}) {
  const [filterAla, setFilterAla] = useState('todas');
  const [filterStatus, setFilterStatus] = useState('todos');

  // Filtragem
  const campusRooms = selectedCampus === 'todos'
    ? rooms
    : rooms.filter((r) => r.campusId === selectedCampus);

  const filteredRooms = campusRooms.filter((room) => {
    if (filterAla !== 'todas' && !room.ala.toLowerCase().includes(filterAla.toLowerCase())) {
      return false;
    }
    if (filterStatus !== 'todos') {
      const hasStatus = room.camas.some((c) => c.status === filterStatus);
      if (!hasStatus) return false;
    }
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Livre':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'Ocupada':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'Desocupação Iminente':
        return 'bg-amber-50 text-amber-900 border-amber-300 animate-pulse';
      case 'Manutenção':
        return 'bg-orange-50 text-orange-900 border-orange-200';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Gestão de Infraestrutura e Vagas
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              {filteredRooms.length} Quartos Mapeados
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Hierarquia de Campi, Alas (Feminina/Masculina), Quartos e Leitos com status de ocupação em tempo real.
          </p>
        </div>

        {/* Legenda de Status */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Livre (Disponível)
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-slate-500"></span> Ocupada (Ativa)
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Desocupação Iminente
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 text-orange-900 border border-orange-200">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span> Manutenção
          </span>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-500" />
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Filtrar por Ala:</span>
            <select
              value={filterAla}
              onChange={(e) => setFilterAla(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="todas">Todas as Alas</option>
              <option value="masculina">Ala Masculina</option>
              <option value="feminina">Ala Feminina</option>
              <option value="mista">Ala Mista / Geral</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Status do Leito:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="todos">Todos os Status</option>
              <option value="Livre">Apenas Leitos Livres</option>
              <option value="Ocupada">Ocupados</option>
              <option value="Desocupação Iminente">Desocupação Iminente (Prazo Limite)</option>
              <option value="Manutenção">Em Manutenção</option>
            </select>
          </div>
        </div>

        <div className="text-slate-500">
          Exibindo <strong>{filteredRooms.length}</strong> quartos no filtro atual
        </div>
      </div>

      {/* Grid de Quartos e Camas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRooms.map((room) => (
          <div
            key={room.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between hover:border-emerald-300 transition"
          >
            {/* Header do Quarto */}
            <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {room.numero.replace('Quarto ', 'Q')}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{room.numero}</h3>
                  <p className="text-[11px] text-slate-500">
                    {room.bloco} • {room.campusId === 'mossoro' ? 'Campus Mossoró' : room.campusId}
                  </p>
                </div>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  room.ala.toLowerCase().includes('masc')
                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                    : room.ala.toLowerCase().includes('fem')
                    ? 'bg-purple-50 text-purple-800 border-purple-200'
                    : 'bg-slate-100 text-slate-800 border-slate-200'
                }`}
              >
                {room.ala}
              </span>
            </div>

            {/* Lista de Leitos */}
            <div className="p-4 space-y-3 flex-1">
              {room.camas.map((cama) => {
                const morador = cama.moradorId
                  ? residents.find((r) => r.id === cama.moradorId)
                  : null;

                return (
                  <div
                    key={cama.id}
                    className={`p-3 rounded-xl border transition flex flex-col gap-2 ${
                      cama.status === 'Livre'
                        ? 'border-dashed border-emerald-300 bg-emerald-50/30'
                        : cama.status === 'Desocupação Iminente'
                        ? 'border-amber-300 bg-amber-50/40'
                        : cama.status === 'Manutenção'
                        ? 'border-orange-200 bg-orange-50/30'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    {/* Linha do leito */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bed className="w-4 h-4 text-slate-500" />
                        <span className="text-xs font-bold text-slate-800">{cama.numero}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                          cama.status
                        )}`}
                      >
                        {cama.status}
                      </span>
                    </div>

                    {/* Ocupante ou Ação de Alocação */}
                    {morador ? (
                      <div className="text-xs pt-1 border-t border-slate-100 flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <strong className="text-slate-900 font-semibold truncate">
                            {morador.nome}
                          </strong>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {morador.matricula}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 truncate">{morador.curso}</p>

                        {/* Status de Posse e Avisos */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                              morador.status === 'Ativo'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-sky-100 text-sky-800'
                            }`}
                          >
                            {morador.status === 'Ativo' ? 'Posse Confirmada' : 'Aguardando Posse'}
                          </span>

                          {morador.desocupacaoIminente && (
                            <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-semibold">
                              Prazo Limite
                            </span>
                          )}

                          {morador.reprovacaoFalta && (
                            <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded font-semibold">
                              Reprov. Falta
                            </span>
                          )}
                        </div>

                        {/* Botões de Ação no Morador */}
                        <div className="flex items-center justify-end gap-1.5 mt-2 pt-1 border-t border-slate-100">
                          <button
                            onClick={() => onOpenTermo(morador)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold flex items-center gap-1"
                            title="Visualizar Termo de Compromisso"
                          >
                            <FileText className="w-3 h-3 text-emerald-700" />
                            Termo
                          </button>
                          <button
                            onClick={() => onOpenDesligamento(morador)}
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-[11px] font-semibold flex items-center gap-1"
                            title="Desligar morador e liberar vaga"
                          >
                            <UserX className="w-3 h-3" />
                            Desligar
                          </button>
                        </div>
                      </div>
                    ) : cama.status === 'Livre' ? (
                      <div className="pt-2 text-center">
                        <button
                          onClick={() => onOpenAllocate(cama, room)}
                          className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          Alocar Convocado
                        </button>
                      </div>
                    ) : (
                      <p className="text-[11px] text-orange-700 italic pt-1">
                        Leito temporariamente indisponível para manutenção da infraestrutura predial.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer do Card com capacidade */}
            <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200/80 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Capacidade Total: {room.capacidade} leitos</span>
              <span className="font-semibold text-slate-700">
                {room.camas.filter((c) => c.status === 'Livre').length} leitos livres
              </span>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}

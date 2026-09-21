import { useState } from 'react';
import {
  UserCheck,
  Bed,
  FileText,
  UserPlus,
  CheckCircle,
  Clock,
  Search,
  UserX,
} from 'lucide-react';

export default function AllocationsView({
  residents,
  suplentes,
  rooms,
  selectedCampus,
  onOpenAllocate,
  onOpenTermo,
  onConfirmarPosse,
  onOpenDesligamento,
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const campusResidents = selectedCampus === 'todos'
    ? residents
    : residents.filter((r) => r.campusId === selectedCampus);

  // Residentes aguardando posse física
  const aguardandoPosse = campusResidents.filter((r) => r.status === 'Aguardando Posse');
  const ativos = campusResidents.filter((r) => r.status === 'Ativo');

  // Encontrar todas as camas livres no campus selecionado
  const campusRooms = selectedCampus === 'todos'
    ? rooms
    : rooms.filter((r) => r.campusId === selectedCampus);

  const camasLivres = [];
  campusRooms.forEach((r) => {
    r.camas.forEach((c) => {
      if (c.status === 'Livre') {
        camasLivres.push({ cama: c, room: r });
      }
    });
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Alocações, Termos de Compromisso & Posse
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-ufersa-green-100 text-ufersa-green-800 border border-ufersa-green-200">
              Fluxo Oficial PROAE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Controle do ciclo de convocação do discente, emissão do termo digital e validação da tomada de posse física da vaga.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-ufersa-green-50 text-ufersa-green-800 border border-ufersa-green-200 rounded-xl text-xs font-bold">
            {camasLivres.length} Vagas Ociosas Prontas
          </span>
        </div>
      </div>

      {/* Seção 1: Suplentes Classificados & Vagas Livres */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Suplentes do Edital */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-ufersa-green-700" />
                Fila de Espera / Suplentes Convocados ({suplentes.length})
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                Edital 001/2026
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Discentes aprovados em lista de espera que passam a ter cadastro ativo de morador no momento em que são alocados em uma vaga disponível.
            </p>

            <div className="space-y-3">
              {suplentes.map((sup) => (
                <div
                  key={sup.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <strong className="text-slate-900 font-bold block">{sup.nome}</strong>
                    <span className="text-xs text-slate-500">
                      {sup.curso} • {sup.campusNome}
                    </span>
                    <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded block w-max mt-1">
                      {sup.classificacaoEdital}
                    </span>
                  </div>

                  <div className="shrink-0">
                    {camasLivres.length > 0 ? (
                      <button
                        onClick={() => onOpenAllocate(camasLivres[0].cama, camasLivres[0].room)}
                        className="px-3 py-1.5 bg-ufersa-green-700 hover:bg-ufersa-green-800 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-2xs"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Alocar em Vaga Livre
                      </button>
                    ) : (
                      <span className="text-slate-400 text-xs italic">Sem vagas livres</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Vagas Ociosas / Livres */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Bed className="w-4 h-4 text-ufersa-green-700" />
                Vagas Ociosas Disponíveis ({camasLivres.length})
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-ufersa-green-100 text-ufersa-green-800">
                Prontas para Convocação
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Leitos desocupados ou recentemente liberados por desligamento formal, aptos para recepção de novos moradores.
            </p>

            <div className="space-y-3">
              {camasLivres.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-ufersa-green-200 bg-ufersa-green-50/40 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-ufersa-green-700 text-white flex items-center justify-center font-bold">
                      <Bed className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-slate-900 block">
                        {item.room.numero} • {item.cama.numero}
                      </strong>
                      <span className="text-xs text-slate-600">
                        {item.room.ala} • {item.room.campusId === 'mossoro' ? 'Campus Mossoró' : item.room.campusId}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenAllocate(item.cama, item.room)}
                    className="px-3 py-1.5 bg-ufersa-green-800 hover:bg-ufersa-green-900 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-2xs"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Alocar Convocado
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Seção 2: Moradores Aguardando Posse Física */}
      {aguardandoPosse.length > 0 && (
        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-sky-700" />
              <h2 className="text-sm font-bold text-sky-950">
                Discentes Aguardando Registro de Posse Física ({aguardandoPosse.length})
              </h2>
            </div>
            <span className="text-xs bg-sky-200/70 text-sky-900 px-2.5 py-0.5 rounded-full font-bold">
              Ação Requerida da Gestão
            </span>
          </div>
          <p className="text-xs text-sky-900/80 mb-3 leading-relaxed">
            Estes discentes já foram alocados na vaga e assinaram o Termo de Compromisso. A equipe de gestão deve registrar a entrega da chave e tomada de posse física para alterar o status para <strong>&quot;Ativo&quot;</strong> e iniciar a contagem oficial de tempo de permanência.
          </p>

          <div className="space-y-2">
            {aguardandoPosse.map((aluno) => (
              <div
                key={aluno.id}
                className="bg-white p-3.5 rounded-xl border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <strong className="text-slate-900 font-bold block">{aluno.nome}</strong>
                  <span className="text-xs text-slate-500 font-mono">
                    Matrícula: {aluno.matricula} • {aluno.curso}
                  </span>
                  <span className="text-sky-800 font-semibold block text-xs mt-0.5">
                    Vaga: {aluno.quarto} • {aluno.camaId} ({aluno.campusNome})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenTermo(aluno)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5 text-ufersa-green-700" />
                    Ver Termo
                  </button>
                  <button
                    onClick={() => onConfirmarPosse(aluno.id)}
                    className="px-3 py-1.5 bg-ufersa-green-700 hover:bg-ufersa-green-800 text-white rounded-lg font-bold flex items-center gap-1 shadow-2xs"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Registrar Posse Física & Ativar Morador
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seção 3: Todos os Residentes Ativos com Vaga */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="font-bold text-slate-800">
            Moradores com Vagas Efetivadas e Posse Registrada ({ativos.length})
          </span>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar por nome ou curso..."
              className="pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Morador / Matrícula</th>
                <th className="px-3 py-3.5">Campus / Vaga</th>
                <th className="px-3 py-3.5 text-center">Data Posse</th>
                <th className="px-3 py-3.5 text-center">Permanência</th>
                <th className="px-3 py-3.5 text-center">Termo Digital</th>
                <th className="px-4 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ativos
                .filter(
                  (a) =>
                    a.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    a.curso.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((morador) => (
                  <tr key={morador.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3">
                      <strong className="text-slate-900 block">{morador.nome}</strong>
                      <span className="text-xs text-slate-500 font-mono">
                        {morador.matricula} • {morador.curso}
                      </span>
                    </td>

                    <td className="px-3 py-3">
                      <span className="font-semibold text-slate-800">
                        {morador.quarto} • {morador.camaId}
                      </span>
                      <span className="text-slate-500 text-xs block">{morador.campusNome}</span>
                    </td>

                    <td className="px-3 py-3 text-center text-slate-600 font-medium">
                      {morador.dataPosse || '15/03/2022'}
                    </td>

                    <td className="px-3 py-3 text-center font-bold text-slate-800">
                      {morador.tempoPermanenciaSemestres} semestres
                    </td>

                    <td className="px-3 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-ufersa-green-700 bg-ufersa-green-50 px-2 py-0.5 rounded border border-ufersa-green-200">
                        <CheckCircle className="w-3 h-3 text-ufersa-green-600" />
                        Assinado
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenTermo(morador)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3 text-ufersa-green-700" />
                          Termo
                        </button>
                        <button
                          onClick={() => onOpenDesligamento(morador)}
                          className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-xs font-semibold flex items-center gap-1"
                        >
                          <UserX className="w-3 h-3" />
                          Desligar Morador
                        </button>
                      </div>
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
